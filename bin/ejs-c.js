#!/usr/bin/env node
'use strict'

const ejs = require('ejs')
const args = require('commander')
const path = require('path')
const fs = require('fs')
const bl = require('bl')

args
  .version('0.0.0')
  .usage('[options] [path]')
  .arguments('[path]')
  .option('-o --output [path]',
          'If specified, writes to the specified path instead of stdout')
  .option('-r --require [path]',
          'If specified, requires the specified file and uses it as the template context')
  .action((path, options) => {
    run(path, options)
  })

args.parse(process.argv)

if (process.argv.length <= 2) {
  run(null, {})
}

function run (filepath, options) {
  const inputStream = filepath
    ? fs.createReadStream(path.resolve(filepath))
    : process.stdin.resume()

  const outputStream = options.output
    ? fs.createWriteStream(path.resolve(options.output))
    : process.stdout

  let context
  if (options.require) {
    context = require(path.resolve(options.require))
  } else {
    context = {}
  }

  inputStream.pipe(bl((err, buf) => {
    if (err) throw err

    const data = ejs.render(buf.toString(), context)

    if (outputStream === process.stdout) {
      outputStream.write(data)
    } else {
      outputStream.end(data)
    }
  }))
}
