'use strict'

const path = require('path')

const invariant = require('invariant')
const transformTools = require('browserify-transform-tools')

const resolveLocalizedFile = require('./resolveLocalizedFile')

const verbose = true

let warnedOnce = false

module.exports = transformTools.makeRequireTransform(
	'localizify',
	{
		evaluateArguments: true,
		jsFilesOnly: true
	},
	(args, opts, callback) => {
		const globalOptions = opts.config._flags && opts.config._flags.localizify
		if (!globalOptions) {
			if (!warnedOnce) {
				console.warn(`localizify ignored: Used in project '${ opts.file }' but no localizify options specified in browserify(). Pass { localizify: ... } to browserify`)
				warnedOnce = true
			}
			callback()
			return
		}

		const locale = globalOptions.locale
		invariant(typeof locale === 'string', `Invalid locale provided in browserify options.localizify.locale: ${ locale }`)

		////

		const fileToRequire = args[0]
		invariant(typeof fileToRequire === 'string', `require called with an unknown value: ${ fileToRequire }`)

		const file = opts.file
		const basedir = path.dirname(file)

		softResolve(fileToRequire, { basedir, extensions: ['.js', '.json'] })
			.then(fullFilePath => {
				if (fullFilePath) {
					return resolveLocalizedFile(fullFilePath, locale)
						.then(localizedFilePath => {
							if (localizedFilePath) {
								// We found a localized version of the file!

								// Get the path relative to the current file so
								// absolute paths aren't stored in the bundle
								let relativePath = path.relative(basedir, localizedFilePath)
								if (relativePath.indexOf(0) !== path.sep) {
									relativePath = '.' + path.sep + relativePath
								}

								if (verbose) {
									console.log(`localizify: '${ fileToRequire }' -> '${ relativePath }'`)
								}

								callback(null, `require('${ relativePath }')`)
							} else {
								callback()
							}
						})
				} else {
					callback()
				}
			})
			.catch(e => {
				callback(e)
			})
	}
)

const nodeResolve = require('resolve')

function softResolve (filePath, opts) {
	if (path.extname(filePath)) {
		return Promise.resolve(path.resolve(opts.basedir, filePath))
	}

	return new Promise((resolve, reject) => {
		nodeResolve(filePath, opts, (err, res) => {
			if (err) {
				reject(err)
			} else {
				resolve(res)
			}
		})
	})
}