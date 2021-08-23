import * as f from 'fpx'
import * as es from 'espo'
import * as j from '@mitranim/jol'
import * as u from './util.mjs'

export class Dat {
  constructor(val) {
    this.articles    = f.reqInst(val.articles,    u.List)
    this.videos      = f.reqInst(val.videos,      u.List)
    this.techVideos  = f.reqInst(val.techVideos,  u.List)
    this.lessons     = f.reqInst(val.lessons,     u.List)
    this.authors     = f.reqInst(val.authors,     u.List)
    this.skillLevels = f.reqInst(val.skillLevels, u.List)
    this.elements    = f.reqInst(val.elements,    u.List)
    this.moves       = f.reqInst(val.moves,       u.List)
    this.langs       = Lang.enum()
  }

  *vals() {
    for (const key in this) yield* this[key]
  }

  rel() {
    for (const val of this.vals()) val.rel?.(this)
    return this
  }
}

export class Article {
  constructor(val) {
    this.id               = f.req(val.id,               f.isKey)
    this.slug             = f.req(val.slug,             u.isSlug)
    this.title            = f.req(val.title,            f.isStr)
    this.authorId         = f.opt(val.authorId,         f.isKey)
    this.authorName       = f.req(val.authorName,       f.isStr)
    this.photographerName = f.opt(val.photographerName, f.isStr)
    this.snippet          = f.req(val.snippet,          f.isStr)
    this.content          = f.req(val.content,          f.isStr)
    this.isDraft          = f.opt(val.isDraft,          f.isBool)
    this.image            = f.opt(val.image, f.isStr) && u.ensureLeadingSlash(val.image)
    this.createdAt        = j.toInstOpt(val.createdAt, Date)
  }

  rel(dat) {
    es.privs(this, {
      author: this.authorId && dat.authors.get(this.authorId),
    })
  }

  get pk() {return this.id}
  guessAuthorName() {return this.author?.fullName || this.authorName}
}

export class Video {
  constructor(val) {
    this.id        = f.req(val.id,        f.isKey)
    this.slug      = f.req(val.slug,      u.isSlug)
    this.title     = f.req(val.title,     f.isStr)
    this.titleEn   = f.opt(val.titleEn,   f.isStr)
    this.youtubeId = f.req(val.youtubeId, f.isStr)
    this.createdAt = j.toInstOpt(val.createdAt, Date)
  }

  get pk() {return this.id}
  get image() {return u.youtubeImageUrl(this.youtubeId)}
  get embed() {return u.youtubeEmbedUrl(this.youtubeId)}
  get titleInverted() {return this.titleEn}
}

export class TechVideo extends Video {
  constructor(val) {
    super(val)
    this.authorId = f.req(val.authorId, f.isKey)
  }

  rel(dat) {
    es.privs(this, {
      author: dat.authors.get(this.authorId),
    })
  }
}

export class Lesson {
  constructor(val) {
    this.id                      = f.req(val.id,                      f.isKey)
    this.moveId                  = f.req(val.moveId,                  f.isKey)
    this.authorId                = f.opt(val.authorId,                f.isKey)
    this.authorName              = f.req(val.authorName,              f.isStr)
    this.authorYoutubeChannelUrl = f.opt(val.authorYoutubeChannelUrl, f.isStr)
    this.youtubeId               = f.req(val.youtubeId,               f.isStr)
    this.title                   = f.req(val.title,                   f.isStr)
    this.titleEn                 = f.req(val.titleEn,                 f.isStr)
    this.language                = f.req(val.language,                f.isStr)
    this.createdAt               = j.toInstOpt(val.createdAt, Date)
  }

  rel(dat) {
    es.privs(this, {
      move:                    dat.moves.get(this.moveId),
      author: this.authorId && dat.authors.get(this.authorId),
      lang:                    dat.langs.get(this.language),
    })
  }

  get pk() {return this.id}
  get moves() {return this.move.element.moves}
  get image() {return u.youtubeImageUrl(this.youtubeId)}
  get embed() {return u.youtubeEmbedUrl(this.youtubeId)}
  get titleInverted() {return this.titleEn}
  guessAuthorName() {return this.author?.fullName || this.authorName}
}

export class Author {
  constructor(val) {
    this.id                = f.req(val.id,                f.isKey)
    this.fullName          = f.req(val.fullName,          f.isStr)
    this.image             = f.opt(val.image,             f.isStr)
    this.youtubeChannelUrl = f.opt(val.youtubeChannelUrl, f.isStr)
    this.url               = f.opt(val.url,               f.isStr)
  }

  rel(dat) {
    es.privs(this, {
      techVideos: f.filter(dat.techVideos, f.cwk, byAuthorId, this.id),
    })
  }

  get pk() {return this.id}
}

function byAuthorId(val, id) {return val.authorId === id}

export class SkillLevel {
  constructor(val) {
    this.id      = f.req(val.id,      f.isKey)
    this.slug    = f.req(val.slug,    u.isSlug)
    this.title   = f.req(val.title,   f.isStr)
    this.titleEn = f.opt(val.titleEn, f.isStr)
    this.level   = f.req(val.level,   f.isNatPos)
  }

  rel(dat) {
    es.privs(this, {
      elements: f.filter(dat.elements, f.cwk, bySkillLevelId, this.id),
    })
  }

  get pk() {return this.id}
  get titleInverted() {return this.titleEn}
  firstLesson() {return f.procure(this.elements, callFirstLesson)}
  lessons() {return f.mapFlat(this.elements, callLessons)}
}

function bySkillLevelId(val, id) {return val.skillLevelId === id}
function callFirstLesson(val) {return val.firstLesson()}
function callLessons(val) {return val.lessons()}

export class Element {
  constructor(val) {
    this.id             = f.req(val.id,           f.isKey)
    this.slug           = f.req(val.slug,         u.isSlug)
    this.title          = f.req(val.title,        f.isStr)
    this.titleEn        = f.opt(val.titleEn,      f.isStr)
    this.desc           = f.req(val.desc,         f.isStr)
    this.skillLevelId   = f.req(val.skillLevelId, f.isKey)
  }

  rel(dat) {
    es.privs(this, {
      skillLevel: dat.skillLevels.get(this.skillLevelId),
      moves: f.filter(dat.moves, f.cwk, byElementId, this.id),
    })
  }

  get pk() {return this.id}
  get titleInverted() {return this.titleEn}
  firstLesson() {return f.procure(this.moves, callFirstLesson)}
  lessons() {return f.mapFlat(this.moves, getLessons)}
}

function byElementId(val, id) {return val.elementId === id}
function getLessons(val) {return val.lessons}

export class Move {
  constructor(val) {
    this.id          = f.req(val.id,          f.isKey)
    this.title       = f.req(val.title,       f.isStr)
    this.titleEn     = f.opt(val.titleEn,     f.isStr)
    this.desc        = f.req(val.desc,        f.isStr)
    this.rating      = f.req(val.rating,      f.isNatPos)
    this.elementId   = f.req(val.elementId,   f.isKey)
    this.createdAt   = j.toInstOpt(val.createdAt, Date)
  }

  rel(dat) {
    es.privs(this, {
      element: dat.elements.get(this.elementId),
      lessons: f.filter(dat.lessons, f.cwk, byMoveId, this.id),
    })
  }

  get pk() {return this.id}
  get siblings() {return this.element.moves}
  get titleInverted() {return this.titleEn}
  firstLesson() {return f.head(this.lessons)}
}

function byMoveId(val, id) {return val.moveId === id}

export class Lang {
  constructor({code, title}) {
    this.code  = f.req(code,  f.isStr)
    this.title = f.req(title, f.isStr)
  }

  get pk() {return this.code}

  static enum() {
    return new u.List(
      new Lang({code: `ru`, title: `русский`}),
      new Lang({code: `en`, title: `английский`}),
      new Lang({code: `jp`, title: `японский`}),
    ).reindex(u.getPk)
  }
}
