import * as a from '@mitranim/js/all.mjs'
import * as u from './util.mjs'

export class Dat extends a.Emp {
  constructor(src) {
    super()
    this.articles    = a.toInstOpt(src.articles,    Articles)
    this.videos      = a.toInstOpt(src.videos,      Videos)
    this.techVideos  = a.toInstOpt(src.techVideos,  TechVideos)
    this.lessons     = a.toInstOpt(src.lessons,     Lessons)
    this.authors     = a.toInstOpt(src.authors,     Authors)
    this.skillLevels = a.toInstOpt(src.skillLevels, SkillLevels)
    this.elements    = a.toInstOpt(src.elements,    Elements)
    this.moves       = a.toInstOpt(src.moves,       Moves)
    this.langs       = Lang.enum()
  }

  init() {
    for (const coll of a.values(this)) coll.init(this)
    return this
  }
}

class Models extends u.ClsColl {
  get cls() {throw a.errImpl()}

  #dat = undefined
  dat() {return this.#dat}

  init(val) {
    this.#dat = a.reqInst(val, Dat)
    for (const val of this) val.init(this)
    return this
  }

  // TODO simplify.
  around(id) {
    if (!a.optPk(id)) return undefined

    const list = a.arr(this)
    const index = a.findIndex(list, val => val.id === id)
    if (!(index >= 0)) return undefined

    if (index === 0) return list.slice(index, 3)
    if (index === list.length - 1) return list.slice(-3)
    return list.slice(index - 1, index + 2)
  }
}

export class Model extends a.Emp {
  pk() {return this.id}

  #coll = undefined
  coll() {return this.#coll}

  init(val) {
    this.#coll = a.reqInst(val, Models)
    return this
  }

  dat() {return this.coll().dat()}
}

export class Article extends Model {
  constructor(val) {
    super()
    this.id = a.reqPk(val.id)
    this.slug = u.reqSlug(val.slug)
    this.title = a.reqStr(val.title)
    this.authorId = a.optPk(val.authorId)
    this.authorName = a.reqStr(val.authorName)
    this.photographerName = a.optStr(val.photographerName)
    this.snippet = a.reqStr(val.snippet)
    this.content = a.reqStr(val.content)
    this.isDraft = a.optBool(val.isDraft)
    this.image = a.optStr(val.image) && u.ensureLeadingSlash(val.image)
    this.createdAt = a.toInstOpt(val.createdAt, a.DateTime)
  }

  urlPath() {return a.url().setPath(`/articles`, this.slug).href}
  author() {return this.dat().authors.getOpt(this.authorId)}
  guessAuthorName() {return this.author()?.fullName || this.authorName}
}

class Articles extends Models {get cls() {return Article}}

export class Video extends Model {
  constructor(val) {
    super()
    this.id = a.reqPk(val.id)
    this.slug = u.reqSlug(val.slug)
    this.title = a.reqStr(val.title)
    this.titleEn = a.optStr(val.titleEn)
    this.youtubeId = a.reqStr(val.youtubeId)
    this.createdAt = a.toInstOpt(val.createdAt, a.DateTime)
  }

  titleInverted() {return this.titleEn}
  urlPath() {return a.url().setPath(`/videos`, this.slug).href}
  image() {return u.youtubeImageUrl(this.youtubeId)}
  embed() {return u.youtubeEmbedUrl(this.youtubeId)}
}

class Videos extends Models {get cls() {return Video}}

export class TechVideo extends Video {
  constructor(val) {
    super(val)
    this.authorId = a.reqPk(val.authorId)
  }

  urlPath() {return a.url().setPath(`/tech-videos`, this.slug).href}
  author() {return this.dat().authors.get(this.authorId)}
}

class TechVideos extends Models {get cls() {return TechVideo}}

export class Lesson extends Model {
  constructor(val) {
    super()
    this.id = a.reqPk(val.id)
    this.moveId = a.reqPk(val.moveId)
    this.authorId = a.optPk(val.authorId)
    this.authorName = a.reqStr(val.authorName)
    this.authorYoutubeChannelUrl = a.optStr(val.authorYoutubeChannelUrl)
    this.youtubeId = a.reqStr(val.youtubeId)
    this.title = a.reqStr(val.title)
    this.titleEn = a.reqStr(val.titleEn)
    this.language = a.reqStr(val.language)
    this.createdAt = a.toInstOpt(val.createdAt, a.DateTime)
  }

  urlPath() {return a.url().setPath(`/lessons`, this.id).href}
  titleInverted() {return this.titleEn}
  image() {return u.youtubeImageUrl(this.youtubeId)}
  embed() {return u.youtubeEmbedUrl(this.youtubeId)}
  move() {return this.dat().moves.get(this.moveId)}
  moves() {return this.move().element().moves()}
  author() {return this.dat().authors.getOpt(this.authorId)}
  lang() {return this.dat().langs.get(this.language)}
  guessAuthorName() {return this.author()?.fullName || this.authorName}
}

class Lessons extends Models {get cls() {return Lesson}}

export class Author extends Model {
  constructor(val) {
    super()
    this.id = a.reqPk(val.id)
    this.fullName = a.reqStr(val.fullName)
    this.image = a.optStr(val.image)
    this.youtubeChannelUrl = a.optStr(val.youtubeChannelUrl)
    this.url = a.optStr(val.url)
  }

  owns(val) {return a.is(val.authorId, this.id)}

  techVideos() {
    const test = val => this.owns(val)
    return a.filter(this.dat().techVideos, test)
  }

  firstTechVideo() {
    const test = val => this.owns(val)
    return a.find(this.dat().techVideos, test)
  }
}

class Authors extends Models {get cls() {return Author}}

export class SkillLevel extends Model {
  constructor(val) {
    super()
    this.id = a.reqPk(val.id)
    this.slug = u.reqSlug(val.slug)
    this.title = a.reqStr(val.title)
    this.titleEn = a.optStr(val.titleEn)
    this.level = a.reqIntPos(val.level)
  }

  titleInverted() {return this.titleEn}

  owns(val) {return a.is(val.skillLevelId, this.id)}

  elements() {
    const test = val => this.owns(val)
    return a.filter(this.dat().elements, test)
  }

  // Suboptimal but barely matters.
  firstLesson() {return a.procure(this.elements(), callFirstLesson)}
}

function callFirstLesson(val) {return val.firstLesson()}

class SkillLevels extends Models {get cls() {return SkillLevel}}

export class Element extends Model {
  constructor(val) {
    super()
    this.id = a.reqPk(val.id)
    this.slug = u.reqSlug(val.slug)
    this.title = a.reqStr(val.title)
    this.titleEn = a.optStr(val.titleEn)
    this.desc = a.reqStr(val.desc)
    this.skillLevelId = a.reqPk(val.skillLevelId)
  }

  titleInverted() {return this.titleEn}

  skillLevel() {return this.dat().skillLevels.get(this.skillLevelId)}

  owns(val) {return a.is(val.elementId, this.id)}

  moves() {
    const test = val => this.owns(val)
    return a.filter(this.dat().moves, test)
  }

  // Suboptimal but barely matters.
  firstLesson() {return a.procure(this.moves(), callFirstLesson)}
}

class Elements extends Models {get cls() {return Element}}

export class Move extends Model {
  constructor(val) {
    super()
    this.id = a.reqPk(val.id)
    this.title = a.reqStr(val.title)
    this.titleEn = a.optStr(val.titleEn)
    this.desc = a.reqStr(val.desc)
    this.rating = a.reqIntPos(val.rating)
    this.elementId = a.reqPk(val.elementId)
    this.createdAt = a.toInstOpt(val.createdAt, a.DateTime)
  }

  titleInverted() {return this.titleEn}

  element() {return this.dat().elements.get(this.elementId)}

  owns(val) {return a.is(val.moveId, this.id)}

  lessons() {
    const test = val => this.owns(val)
    return a.filter(this.dat().lessons, test)
  }

  firstLesson() {
    const test = val => this.owns(val)
    return a.find(this.dat().lessons, test)
  }

  siblings() {return this.element().moves()}
}

class Moves extends Models {get cls() {return Move}}

export class Lang extends Model {
  constructor({code, title}) {
    super()
    this.code = a.reqStr(code)
    this.title = a.reqStr(title)
  }

  pk() {return this.code}

  static enum() {
    return Langs.of(
      {code: `ru`, title: `русский`},
      {code: `en`, title: `английский`},
      {code: `jp`, title: `японский`},
    )
  }
}

class Langs extends Models {get cls() {return Lang}}

import articles from './dat_init_articles.mjs'
import videos from './dat_init_videos.mjs'
import techVideos from './dat_init_tech_videos.mjs'
import lessons from './dat_init_lessons.mjs'
import authors from './dat_init_authors.mjs'
import skillLevels from './dat_init_skill_levels.mjs'
import elements from './dat_init_elements.mjs'
import moves from './dat_init_moves.mjs'

export const dat = new Dat({
  articles,
  videos,
  techVideos,
  lessons,
  authors,
  skillLevels,
  elements,
  moves,
}).init()
