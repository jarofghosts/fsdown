var path = require('path')
  , fs = require('fs')

var LevelDown = require('abstract-leveldown').AbstractLevelDOWN

var FSIterator = require('./lib/fs-iterator')

module.exports = FSDown

function FSDown(location) {
  if(!(this instanceof FSDown)) return new FSDown(location)

  LevelDown.call(this, location)

  this.basePath = path.resolve(location)
}

FSDown.prototype = Object.create(LevelDown.prototype)

FSDown.prototype._open = function openFs(options, callback) {
  var self = this

  process.nextTick(function() {
    callback(null, self)
  })
}

FSDown.prototype._put = function putFs(key, value, options, callback) {
  fs.writeFile(path.join(this.basePath, key), value, callback)
}

FSDown.prototype._get = function getFs(key, options, callback) {
  fs.readFile(
      path.join(this.basePath, key)
    , options.asBuffer !== false ? null : 'utf8'
    , callback
  )
}

FSDown.prototype._del = function delFs(key, options, callback) {
  fs.unlink(path.join(this.basePath, key), callback)
}

FSDown.prototype._batch = function batchFs(array, options, callback) {
  var len = array.length
    , total = len
    , value
    , type
    , key
    , err

  for(var i = 0; i < len; ++i) {
    if(!array[i]) continue

    key = array[i].key
    type = array[i].type
    err = this._checkKeyValue(key, 'key')

    if(err) {
      return process.nextTick(function() {
        callback(err)
      })
    }

    if(type === 'del') {
      this._del(key, options, countdown)
    } else if(type === 'put') {
      value = array[i].value
      err = this._checkKeyValue(value, 'value')

      if(err) {
        return process.nextTick(function() {
          callback(err)
        })
      }

      this._put(key, value, options, countdown)
    }
  }

  function countdown() {
    if(!--total) callback()
  }
}

FSDown.prototype._iterator = function iterateFs(options) {
  return new FSIterator(this, options)
}

FSDown.prototype._isBuffer = function isBuffer(obj) {
  return Buffer.isBuffer(obj)
}
