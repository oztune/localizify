'use strict'

const path = require('path')

const invariant = require('invariant')
const transformTools = require('browserify-transform-tools')

const resolveLocalizedFile = require('./resolveLocalizedFile')

const verbose = true

module.exports = transformTools.makeRequireTransform(
	'localizify',
	{
		evaluateArguments: true,
		jsFilesOnly: true
	},
	(args, opts, callback) => {
		const globalOptions = opts.config._flags.localizify
		if (!globalOptions) {
			console.warn('localizify: no localizify options specified. Pass { localizify: ... } to browserify')
			callback()
			return
		}

		const locale = globalOptions.locale
		invariant(typeof locale === 'string', `Invalid locale provided in browserify options.localizify.locale: ${ locale }`)

		////

		const fileToRequire = args[0]
		invariant(typeof fileToRequire === 'string', `require called with an unknown value: ${ fileToRequire }`)

		if (!path.extname(fileToRequire)) {
			// Ignoring files without extensions
			callback()
			return
		}

		const file = opts.file
		const dirName = path.dirname(file)
		let fullFilePath = path.resolve(dirName, fileToRequire)

		resolveLocalizedFile(fullFilePath, locale)
			.then(localizedFilePath => {
				if (localizedFilePath) {
					// We found a localized version of the file!

					// Get the path relative to the current file so
					// absolute paths aren't stored in the bundle
					let relativePath = path.relative(dirName, localizedFilePath)
					if (relativePath.indexOf(0) !== '.') {
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
	}
)