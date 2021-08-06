import * as f from 'fpx'

export function iterVals(iter) {
  return iter.values?.() || iter || []
}

export function* iterMap(iter, fun, ...args) {
  f.req(fun, f.isFun)
  for (const val of iterVals(iter)) yield fun(val, ...args)
}

// Placeholder, should also support non-iterables.
export function* iterMapFlat(iter, fun, ...args) {
  f.req(fun, f.isFun)
  for (const val of iterVals(iter)) yield* fun(val, ...args)
}

export function iterFind(iter, fun, ...args) {
  f.req(fun, f.isFun)
  for (const val of iterVals(iter)) if (fun(val, ...args)) return val
  return undefined
}

export function* iterFilter(iter, fun, ...args) {
  f.req(fun, f.isFun)
  for (const val of iterVals(iter)) if (fun(val, ...args)) yield val
}

export function* iterReject(iter, fun, ...args) {
  f.req(fun, f.isFun)
  for (const val of iterVals(iter)) if (!fun(val, ...args)) yield val
}

export function iterHead(iter) {
  for (const val of iterVals(iter)) return val
  return undefined
}

export function reify(iter) {
  if (f.isNil(iter)) return []
  if (f.isArr(iter)) return iter
  return [...iterVals(iter)]
}
