const fs = require('fs')

module.exports = function fileStat (filePath) {
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