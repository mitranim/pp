import * as f from 'fpx'
import * as um from './util_misc.mjs'

export class Dict extends Map {
  get(key) {
    if (!this.has(key)) throw Error(`missing entry for key ${f.show(key)}`)
    return super.get(key)
  }

  getOpt(key) {return super.get(key)}

  get [Symbol.toStringTag]() {return this.constructor.name}
}

// Array with optional indexing by primary key.
//
// TODO consider creating cross-indexes for reverse references.
export class List extends Array {
  get(key) {return this.index.get(key)}

  reindex(fun) {
    f.req(fun, f.isFun)
    f.each(this, listIndexAdd, fun, this.reinitIndex())
    return this
  }

  reindexOpt(fun) {
    f.req(fun, f.isFun)
    f.each(this, listIndexAddOpt, fun, this.reinitIndex())
    return this
  }

  initIndex() {
    return this.index || (this.index = new Dict())
  }

  reinitIndex() {
    const index = this.initIndex()
    index.clear()
    return index
  }
}

function listIndexAdd(val, key, fun, map) {
  key = fun(val, key)
  mapAdd(map, key, val)
}

function listIndexAddOpt(val, key, fun, map) {
  key = fun(val, key)
  if (f.isSome(key)) mapAdd(map, key, val)
}

function mapAdd(map, key, val) {
  f.req(key, f.isKey)
  if (map.has(key)) throw Error(`duplicate key ${f.show(key)} for ${f.show(val)}`)
  map.set(key, val)
}

export class ListPkAsc extends List {
  norm() {return this.sort(um.byPkAsc).reindex(um.getPk)}
}

export class ListPkDesc extends List {
  norm() {return this.sort(um.byPkDesc).reindex(um.getPk)}
}
