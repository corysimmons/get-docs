import puppeteer from 'puppeteer'
import minimist from 'minimist'

const args = minimist(process.argv.slice(2), {
  string: ['url', 'tocSelector', 'contentSelector'],
})

function checkRequiredArgs(options) {
  const missingArgs = []
  ;['url', 'tocSelector', 'contentSelector'].forEach((arg) => {
    if (!options[arg]) {
      missingArgs.push(arg)
    }
  })

  if (missingArgs.length > 0) {
    console.error(`Missing required arguments: ${missingArgs.join(', ')}`)
    process.exit(1)
  }
}

checkRequiredArgs(args)

async function runScript() {
  const { url: baseUrl, tocSelector, contentSelector } = args

  const browser = await puppeteer.launch({
    headless: 'new',
  })

  const page = await browser.newPage()

  await page.goto(baseUrl, { waitUntil: 'networkidle2' })

  const pages = await page.evaluate((selector) => {
    const links = []
    const tocElements = document.querySelectorAll(selector + ' a')
    tocElements.forEach((el) => {
      const link = el.getAttribute('href')
      if (link) {
        links.push(link)
      }
    })
    return links
  }, tocSelector)

  for (let p of pages) {
    const url = new URL(p, baseUrl).href
    console.log(`Visiting: ${url}`)
    await page.goto(url, { waitUntil: 'networkidle2' })

    try {
      await page.waitForSelector(contentSelector, { timeout: 5000 })

      const text = await page.evaluate((selector) => {
        const container = document.querySelector(selector)
        return container ? container.innerText : 'No content found'
      }, contentSelector)

      console.log(`Content for ${url}:`)
      console.log(text)
    } catch (error) {
      console.error(
        `Failed to find ${contentSelector} for ${url} within the timeout period.`
      )
    }
  }

  await browser.close()
}

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Exiting...')
  process.exit(0)
})

runScript().catch((err) => {
  console.error('Script encountered an error:', err)
  process.exit(1)
})
