/*
Prints JS data structures as JS code.
TODO move to `@mitranim/js`.
*/

import * as a from '@mitranim/js/all.mjs'

const INDENT = `  `

export class FmtRaw extends String {}

export function fmtInd(val, ind = 0) {
  return indent(ind) + fmt(val, ind)
}

export function fmt(val, ind = 0) {
  if (a.isStr(val)) return fmtStr(val)
  if (a.isSym(val)) return fmtSym(val)
  if (a.isPrim(val)) return String(val)
  if (a.isDate(val)) return `new Date(${fmt(val.toISOString())})`
  if (a.isInst(val, FmtRaw)) return val.toString()
  if (a.isList(val)) return fmtList(val, ind)
  if (a.isStruct(val)) return fmtStruct(val, ind)
  throw Error(`unable to format as code: ${a.show(val)}`)
}

function fmtSym(val) {
  if (val === Symbol.for(val.description)) {
    return `Symbol.for(${fmt(val.description)})`
  }
  return `Symbol(${fmt(val.description)})`
}

// Placeholder. Lacks escapes.
function fmtStr(val) {return '`' + val + '`'}

// Placeholder.
function fmtList(val, ind) {
  const inner = fmtJoin(a.map(val, val => fmt(val, ind + 1)), ind)

  if (val.constructor === Array) return `[${inner}]`
  return `new ${val.constructor.name}(${inner})`
}

// Placeholder.
function fmtStruct(val, ind) {
  const inner = fmtJoin(a.map(a.entries(val), val => fmtEntry(val, ind+1)), ind)
  const lit = `{${inner}}`

  if (val.constructor === Object) return lit
  return `new ${val.constructor.name}(${lit})`
}

function fmtEntry([key, val], ind) {
  return fmtKey(key) + `: ` + fmt(val, ind)
}

// Placeholder.
function fmtKey(val) {
  if (a.isSym(val)) return fmtSym(val)
  a.reqStr(val)
  if (/^[A-Za-z$_][\w$]*$/.test(val)) return String(val)
  return `'${val}'`
}

function fmtJoin(vals, ind) {
  const out = strJoin(vals, `\n${indent(ind+1)}`, `,`)
  return out && out + `\n${indent(ind)}`
}

function strJoin(list, prefix, suffix) {
  return a.fold(list, ``, function add(acc, val) {
    return a.laxStr(acc) + a.laxStr(prefix) + a.laxStr(val) + a.laxStr(suffix)
  })
}

function indent(ind) {return INDENT.repeat(a.reqNat(ind))}
