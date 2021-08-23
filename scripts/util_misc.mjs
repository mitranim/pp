import * as f from 'fpx'
import * as es from 'espo'
import * as pt from 'path'
import * as j from '@mitranim/jol'

export class Res extends Response {
  constructor(body, init) {
    super(undefined, init)
    es.pubs(this, {body})
  }

  native() {return new Response(this.body, this)}

  get [Symbol.toStringTag]() {return this.constructor.name}
}

export function resHtml(body, init) {
  const res = new Res(body, init)
  res.headers.set('content-type', 'text/html')
  return res
}

export function resErr(err) {
  return new Response(err?.stack || err?.message || `unknown error`, {status: 500})
}

export function resUncache(res) {
  res.headers.set(`cache-control`, `no-store, max-age=0`)
  return res
}

// Placeholder.
export function pathJoin(...vals) {
  f.reqEach(vals, f.isPrim)
  return vals.join('/')
}

export function youtubeEmbedUrl(id) {
  return f.vac(id && pathJoin(`https://www.youtube.com/embed`, id))
}

export function youtubeImageUrl(id) {
  return f.vac(id && pathJoin(`https://img.youtube.com/vi`, id, `0.jpg`))
}

export function isSlug(val) {
  return f.isStr(val) && /^[a-z0-9_-]+$/.test(val)
}

export function byPkAsc(a, b) {
  if (a.id < b.id) return -1
  if (a.id > b.id) return 1
  return 0
}

export function byPkDesc(a, b) {
  if (a.id > b.id) return -1
  if (a.id < b.id) return 1
  return 0
}

export function byStrLenAsc(a, b) {
  f.req(a, f.isStr)
  f.req(b, f.isStr)

  if (a.length < b.length) return -1
  if (a.length > b.length) return 1
  return 0
}

export function getPk({pk}) {return pk}
export function getLink({link}) {return link}

export function trimLines(val) {
  return f.str(val).replace(/^\s+/gm, '').trim()
}

export function stripPrefix(val, prefix) {
  val = f.str(val)
  prefix = f.str(prefix)
  return val.startsWith(prefix) ? val.slice(prefix.length) : val
}

export function stripPrefixes(val, prefix) {
  return stabilize(val, stripPrefix, prefix)
}

export function stripSuffix(val, suffix) {
  val = f.str(val)
  suffix = f.str(suffix)
  return val.endsWith(suffix) ? val.slice(0, -suffix.length) : val
}

export function stripSuffixes(val, suffix) {
  return stabilize(val, stripSuffix, suffix)
}

export function ensurePrefix(val, prefix) {
  f.req(val, f.isStr)
  prefix = f.str(prefix)
  return val.startsWith(prefix) ? val : `${prefix}${val}`
}

export function ensureSuffix(val, suffix) {
  f.req(val, f.isStr)
  suffix = f.str(suffix)
  return val.endsWith(suffix) ? val : `${val}${suffix}`
}

export function stripLeadingSlash(val) {return stripPrefix(val, `/`)}
export function stripLeadingSlashes(val) {return stripPrefixes(val, `/`)}
export function stripTrailingSlash(val) {return stripSuffix(val, `/`)}
export function stripTrailingSlashes(val) {return stripSuffixes(val, `/`)}
export function ensureLeadingSlash(val) {return ensurePrefix(val, `/`)}
export function ensureTrailingSlash(val) {return ensureSuffix(val, `/`)}

export function stripExt(path) {
  path = f.str(path)
  return stripSuffix(path, pt.extname(path))
}

export function stabilize(val, fun, ...args) {
  while (!f.is(val, val = fun(val, ...args))); return val
}

const formatOptsDateHuman = {year: 'numeric', month: 'short', day: 'numeric'}

export function formatDateHuman(val) {
  if (f.isNil(val)) return ''
  val = j.toInst(val, Date)
  f.req(val, f.isValidDate)
  return val.toLocaleDateString('en-US', formatOptsDateHuman)
}

export class ShortDate extends Date {
  toString() {
    return this.toISOString().slice(0, 'yyyy-MM-dd'.length)
  }
}

// TODO generalize in makefile.
export function timing(msg, fun, ...args) {
  f.req(msg, f.isStr)
  f.req(fun, f.isFun)

  console.log(`[${msg}] starting`)
  const t0 = Date.now()
  try {
    // eslint-disable-next-line no-invalid-this
    return fun.apply(this, args)
  }
  finally {
    const t1 = Date.now()
    console.log(`[${msg}] done in ${t1 - t0}ms`)
  }
}

export function funTiming(fun, ...args) {
  return timing(f.show(fun), fun, ...args)
}

// Short for "truthy is". Should consider moving to Fpx.
export function tis(a, b) {return f.truthy((a || b) && f.is(a, b))}

export function toJson(val) {return JSON.stringify(val, null, 2)}

// TODO replace with Deno stdlib `fs.walkSync`.
export function* walk(path) {
  for (const entry of Deno.readDirSync(path)) {
    entry.name = pt.join(path, entry.name)
    yield entry
  }
}

// TODO replace with Deno stdlib `fs.walkSync`.
export function* walkFiles(path) {
  for (const entry of Deno.readDirSync(path)) {
    entry.name = pt.join(path, entry.name)
    if (entry.isFile) yield entry
    if (entry.isDirectory) yield* walkFiles(entry.name)
  }
}

export function* toNames(iter) {
  for (const entry of iter) yield entry.name
}

export function rmAll(path) {
  try {
    Deno.removeSync(path, {recursive: true})
  }
  catch (err) {
    if (err.name === `NotFound`) return
    throw err
  }
}
