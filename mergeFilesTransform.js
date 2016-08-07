'use strict'

const path = require('path')

const fs = require('fs-promise')
const through = require('through2')
const verbose = true

module.exports = function mergeFilesTransform (file, opts) {
	const parsed = path.parse(file)
	const matches = parsed.name.match(/^(.+)\.[a-z][a-z]$/i)
	
	if (matches) {
		const nonLocalizedFile = path.resolve(parsed.dir, matches[1] + parsed.ext)
		// console.log('found strings file', file, nonLocalizedFile)

		const nonLocalizedFileBuf = fs.readFile(nonLocalizedFile)

		return through(function (buf, enc, next) {
			// Load the non-localized version
			nonLocalizedFileBuf.then(originalFileBuf => {
				let currentJson, originalJSon

				try {
					currentJson = JSON.parse(buf.toString())
				} catch (e) {
					throw new Error(`Error parsing json file: ${ file }`)
				}

				try {
					originalJSon = JSON.parse(originalFileBuf.toString())
				} catch (e) {
					throw new Error(`Error parsing original json file: ${ nonLocalizedFile }`)
				}

				const merged = Object.assign({}, originalJSon, currentJson)
				const output = JSON.stringify(merged)

				next(null, output)
			})
			.catch(error => {
				if (error.code === 'ENOENT') {
					// nonLocalized file doesn't exist. Skip.
					if (verbose) {
						console.log(`file '${ file }' doesn't have a non-localized version at '${ nonLocalizedFile }'. Skipping.`)
					}
					next(null, buf)
				} else {
					next(error)
				}
			})
		})
	} else {
		return through()
	}
}