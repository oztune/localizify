const path = require('path')
const fs = require('fs')

function fileStat (filePath) {
	return new Promise((resolve, reject) => {
		fs.stat(filePath, (error, stats) => {
			if (error) {
				if (error.code === 'ENOENT') {
					// File doesn't exist
					resolve(null)
				} else {
					reject(error)
				}
			} else {
				resolve(stats)
			}
		})
	})
}

// Looks for existence of /a/path/to/file.{locale}.{ext}
module.exports = function resolveLocalizedFile(filePath, locale) {
	const parsed = path.parse(filePath)

	const localizedFilePath = path.join(parsed.dir, parsed.name + '.' + locale + parsed.ext)

	return fileStat(localizedFilePath).then(stats => {
		if (stats) {
			if (stats.isFile()) {
				return localizedFilePath
			} else {
				console.warn(`localizify: localized (${ locale }) version of file resolves to a directory: '${ filePath }' => '${ localizedFilePath }'`)
				return null
			}
		} else {
			return null
		}
	})
}