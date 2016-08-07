'use strict'

const path = require('path')

const requireTransform = require('./requireTransform')
const mergeFilesTransform = require('./mergeFilesTransform')

module.exports = function (file, opts) {
	if (path.extname(file) === '.json') {
		return mergeFilesTransform.apply(this, arguments)
	} else {
		return requireTransform.apply(this, arguments)
	}
}