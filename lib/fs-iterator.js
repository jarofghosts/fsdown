var Iterator = require('abstract-leveldown').AbstractIterator
  , ltgt = require('ltgt')

module.exports = FSIterator

function FSIterator(db, options) {
  Iterator.call(this, db)

  this._limit = options.limit
  this._reverse = options.reverse
  this._keys = []
  this._options = options

  this._pos = 0
  this._keys = this.db._keys.filter(ltgt.filter(options))

  if(options.reverse) this._keys.reverse()
  if(options.limit > 0) this._keys = this._keys.slice(0, options.limit)
}

FSIterator.prototype = Object.create(Iterator.prototype)

FSIterator.prototype._next = function iterNext(callback) {
  var self = this
    , value
    , key

  if(self._pos >= self._keys.length) {
    return process.nextTick(callback)
  }

  key = self._keys[self._pos]
  value = self.db._store[key]

  this._pos++

  process.nextTick(function() {
    callback(null, key, value)
  })
}
