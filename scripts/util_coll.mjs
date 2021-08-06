import * as f from 'fpx'
import * as ui from './util_iter.mjs'

// Might move to `fpx`.
export function procureVal(vals, fun, ...args) {
  vals = f.struct(vals)
  for (const key in vals) {
    const res = fun(vals[key], key, ...args)
    if (res) return res
  }
  return undefined
}

// Inefficient but not our bottleneck.
export function setSubtractMut(set, ...colls) {
  f.reqInst(set, Set)
  for (const coll of colls) {
    for (const val of ui.iterVals(coll)) set.delete(val)
  }
  return set
}

// Inefficient but not our bottleneck.
export function setSubtract(vals, ...colls) {
  return setSubtractMut(new Set(ui.iterVals(vals)), ...colls)
}
