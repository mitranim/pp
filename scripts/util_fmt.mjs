import * as f from 'fpx'

// TODO publish separately.

const INDENT = `  `

function indent(ind) {
  f.req(ind, f.isNat)
  let out = ``
  while (ind--) out += INDENT
  return out
}

export class FmtRaw extends String {}

export function fmtInd(val, ind = 0) {
  return indent(ind) + fmt(val, ind)
}

export function fmt(val, ind = 0) {
  if (f.isStr(val)) return fmtStr(val)
  if (f.isSym(val)) return fmtSym(val)
  if (f.isPrim(val)) return String(val)
  if (f.isDate(val)) return `new Date(${fmt(val.toISOString())})`
  if (f.isInst(val, FmtRaw)) return val.toString()
  if (f.isList(val)) return fmtList(val, ind)
  if (f.isStruct(val)) return fmtStruct(val, ind)
  throw Error(`can't print as code: ${f.show(val)}`)
}

function fmtSym(val) {
  if (val === Symbol.for(val.description)) {
    return `Symbol.for(${fmt(val.description)})`
  }
  return `Symbol(${fmt(val.description)})`
}

// Placeholder.
function fmtStr(val) {
  return '`' + val + '`'
}

// Placeholder.
function fmtList(val, ind) {
  const inner = fmtJoin(
    f.map(val, f.cwk, fmt, ind+1),
    ind,
  )

  if (val.constructor === Array) return `[${inner}]`
  return `new ${val.constructor.name}(${inner})`
}

// Placeholder.
function fmtStruct(val, ind) {
  const inner = fmtJoin(
    f.map(f.entries(val), f.cwk, fmtEntry, ind+1),
    ind,
  )

  const lit = `{${inner}}`

  if (val.constructor === Object) return lit
  return `new ${val.constructor.name}(${lit})`
}

function fmtEntry([key, val], ind) {
  return fmtKey(key) + `: ` + fmt(val, ind)
}

// Placeholder.
function fmtKey(val) {
  if (f.isSym(val)) return fmtSym(val)
  f.req(val, f.isStr)
  if (/^[A-Za-z$_][\w$]*$/.test(val)) return String(val)
  return `'${val}'`
}

function fmtJoin(vals, ind) {
  const out = strJoin(vals, `\n${indent(ind+1)}`, `,`)
  return out && out + `\n${indent(ind)}`
}

function strJoin(list, prefix, suffix) {
  return f.fold(list, ``, strAddEnclosed, prefix, suffix)
}

function strAddEnclosed(acc, val, _key, prefix, suffix) {
  return f.str(acc) + f.str(prefix) + f.str(val) + f.str(suffix)
}
