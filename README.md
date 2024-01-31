# get-docs

A simple CLI to extract documentation text and log it to the terminal.

## Getting started

- `git clone git@github.com:corysimmons/get-docs.git`
- `cd get-docs`
- `npm install`
- `node get.mjs --url <url> --tocSelector <selector> --contentSelector <selector>`

## Example

`node get.mjs --url https://tonejs.github.io/docs/14.7.77 --tocSelector '#inner .section' --contentSelector '#content-container'`
