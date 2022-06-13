import * as a from '@mitranim/js/all.mjs'
import * as p from '@mitranim/js/prax.mjs'
import {paths as pt} from '@mitranim/js/io_deno.mjs'
import * as ma from 'marked'
import * as c from './conf.mjs'
import * as cl from './client.mjs'

export {MixElem} from './client.mjs'

/*
Short for "elements". This is a magic namespace where accessing an arbitrary
name creates an element with that tag name. See examples in `site.mjs`.
*/
export const {E} = cl.ren

/*
Short for "attributes". Provides shortcuts for element props/attributes.
See examples in `site.mjs`.
*/
export const A = new class PropBui extends p.PropBui {
  bgImg(val) {
    val = a.strLax(val)
    if (val) return this.style({backgroundImage: `url(${val})`})
    return this
  }

  // Should be used after `.href()`.
  cur(page, ...paths) {
    const path = a.laxStr(page?.urlPath())
    if (!path) return this

    const href = this.get(`href`)
    return this.current(
      href === path ||
      a.isSubpath(a.toUrl(href).pathname, path) ||
      a.some(paths, val => a.isSubpath(val, path))
    )
  }

  // For links, this should be preferred over `.active`.
  current(ok) {return ok ? this.set(`aria-current`, `page`) : this}

  // Shouldn't be used for links. TODO convert to appropriate "aria" attrs.
  active(ok) {return ok ? this.cls(`active`) : this}

  // Must be used after `.href()`.
  hrefMain() {return this.href(a.url(this.get(`href`)).setHash(c.ID_MAIN))}
}().frozen()

const urlYoutubeLink = Object.freeze(a.url(`https://www.youtube.com/watch`))
const urlYoutubeImage = Object.freeze(a.url(`https://img.youtube.com/vi`))
const urlYoutubeEmbed = Object.freeze(a.url(`https://www.youtube.com/embed`))

export class YoutubeId extends String {
  constructor(src) {super(a.reqPk(src))}

  link() {
    const url = urlYoutubeLink.clone()
    url.query.set(`v`, this)
    return url
  }

  image() {return urlYoutubeImage.clone().addPath(this, `0.jpg`)}

  embed() {
    const url = urlYoutubeEmbed.clone().addPath(this)
    url.query.set(`rel`, `0`).set(`modestbranding`, `1`)
    return url
  }
}

export function isSlug(val) {return a.isStr(val) && /^[a-z0-9_-]+$/.test(val)}
export function reqSlug(val) {return a.req(val, isSlug)}

export function pk(val) {return a.get(val, `id`) || a.pk(val)}

export function pkEq(one, two) {
  one = pk(one)
  two = pk(two)
  return !!one && !!two && a.is(one, two)
}

export function byPkAsc(one, two) {
  one = pk(one)
  two = pk(two)

  if (one < two) return -1
  if (one > two) return 1
  return 0
}

export function byPkDesc(one, two) {
  one = pk(one)
  two = pk(two)

  if (one > two) return -1
  if (one < two) return 1
  return 0
}

export function byStrLenAsc(one, two) {
  a.reqStr(one)
  a.reqStr(two)

  if (one.length < two.length) return -1
  if (one.length > two.length) return 1
  return 0
}

export function trimLines(val) {
  return a.laxStr(val).replace(/^\s+/gm, ``).trim()
}

export function stripLeadingSlash(val) {return a.stripPre(val, `/`)}
export function stripTrailingSlash(val) {return a.stripSuf(val, `/`)}
export function ensureLeadingSlash(val) {return a.optPre(val, `/`)}

// TODO generalize in makefile.
export function timing(msg, fun, ...args) {
  a.reqStr(msg)
  a.reqFun(fun)

  console.log(`[${msg}] starting`)
  const t0 = Date.now()

  try {
    return fun(...args)
  }
  finally {
    const t1 = Date.now()
    console.log(`[${msg}] done in ${t1 - t0}ms`)
  }
}

export function funTiming(fun, ...args) {
  return timing(a.show(fun), fun, ...args)
}

export function* walk(path) {
  for (const entry of globalThis.Deno.readDirSync(path)) {
    entry.name = pt.join(path, entry.name)
    yield entry
  }
}

export function* walkFiles(path) {
  for (const entry of globalThis.Deno.readDirSync(path)) {
    entry.name = pt.join(path, entry.name)
    if (entry.isFile) yield entry
    if (entry.isDirectory) yield* walkFiles(entry.name)
  }
}

export function* toNames(iter) {
  for (const entry of iter) yield entry.name
}

export class ClsColl extends a.ClsColl {
  get cls() {throw a.errImpl()}

  get(key) {
    if (!this.has(key)) throw Error(`missing entry for key ${a.show(key)}`)
    return this.getOpt(key)
  }

  getOpt(key) {return super.get(key)}

  static of(...val) {return new this(val)}
}

export function isColl(val) {return a.isInst(val, ClsColl)}
export function reqColl(val) {return a.req(val, isColl)}

// Inefficient but not our bottleneck.
export function setSubtract(vals, ...colls) {
  return setSubtractMut(new Set(a.values(vals)), ...colls)
}

// Inefficient but not our bottleneck.
export function setSubtractMut(set, ...colls) {
  a.reqSet(set)
  for (const coll of colls) {
    for (const val of a.values(coll)) set.delete(val)
  }
  return set
}

export function mdToHtml(val) {return new MdOpt().run(val)}

class MdOpt extends a.Emp {
  constructor(opt) {
    super()
    a.patch(this, ma.defaults)
    a.patch(this, opt)
  }

  static {a.memGet(this)}
  get tokenizer() {return new MdTok(this)}
  get renderer() {return new MdRen(this)}
  get lexer() {return new MdLex(this)}
  get parser() {return new MdPar(this)}

  run(src) {
    src = a.laxStr(src)
    return src && this.parser.parse(this.lexer.lex(src))
  }
}

class MdTok extends ma.Tokenizer {}
class MdLex extends ma.Lexer {}
class MdPar extends ma.Parser {}

/*
Placeholder. TODO:
  * Automatic `A.tarblan()` for external links.
  * Automatic icon for external links.
*/
class MdRen extends ma.Renderer {}
