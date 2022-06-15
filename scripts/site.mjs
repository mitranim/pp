import * as a from '@mitranim/js/all.mjs'
import * as p from '@mitranim/js/prax.mjs'
import {paths as pt} from '@mitranim/js/io_deno.mjs'
import * as c from './conf.mjs'
import * as u from './util.mjs'
import {E, A} from './util.mjs'
import * as d from './dat.mjs'
import * as sm from './site_misc.mjs'
import * as cl from './client.mjs'

export class Site extends a.Emp {
  constructor(dat) {
    super()
    this.dat = a.reqInst(dat, d.Dat)
    this.all = new Pages()
    this.notFound = new Page404(this)

    this.all.add([
      this.notFound,
      new PageIndex(this),
      new PageArticles(this),
      new PageVideos(this),
      new PageSupport(this),
      new PageAbout(this),
    ])
    this.all.add(this.articles = this.toPages(this.dat.articles, PageArticle))
    this.all.add(this.videos = this.toPages(this.dat.videos, PageVideo))
    this.all.add(this.techVideos = this.toPages(this.dat.techVideos, PageTechVideo))
    this.all.add(this.lessons = this.toPages(this.dat.lessons, PageLesson))
  }

  pageByPath(key) {return this.all.get(key)}
  pages() {return this.all.values()}
  toPages(src, cls) {return a.map(src, val => new cls(this, val))}
}

class Page extends a.Emp {
  // "ent" is short for "entity".
  constructor(site, ent) {
    super()
    a.priv(this, `site`, a.reqInst(site, Site))
    this.ent = a.optInst(ent, d.Model)
  }

  get title() {return ``}

  pk() {return a.pk(this.ent)}

  urlPath() {}

  fsPath() {
    const path = a.laxStr(this.urlPath())
    return path && a.stripPre(path, `/`) + `.html`
  }

  targetPath() {
    const path = a.laxStr(this.fsPath())
    return path && pt.join(c.TARGET, path)
  }

  res() {return a.resBui().html(this.body()).res()}
  body() {return this.html()}
  html(...chi) {return sm.Html(this, ...chi)}

  write() {
    const path = this.targetPath()
    if (!path) return

    const body = this.body()
    if (!body) return

    globalThis.Deno.mkdirSync(pt.dir(path), {recursive: true})
    globalThis.Deno.writeTextFileSync(path, body)
  }
}

// Similar to `a.Coll` but uses `.urlPath()` and prevents redundancies.
class Pages extends Map {
  add(src) {
    for (const page of src) {
      const key = a.reqInst(page, Page).urlPath()

      if (!a.optPk(key)) continue

      if (this.has(key)) {
        throw Error(`redundant page ${a.show(page)} on path ${a.show(key)}`)
      }

      this.set(key, page)
    }

    return this
  }
}

export class PageErr extends Page {
  constructor(site, err) {super(site).err = err}
  res() {return a.resBui().html(this.body()).code(this.code()).res()}
  code() {return 500}
  get title() {return `Внутренняя ошибка`}

  body() {
    const err = this.err || Error(this.title)

    return this.html(
      sm.Jumbo({
        img: `/images/eruption.jpg`,
        title: this.title,
        sub: E.p.chi(`Произошла внутренняя ошибка сайта. Приносим извинения.`),
      }),
      E.pre.props(A.cls(`pad`)).chi(err?.stack || err),
    )
  }
}

export class Page404 extends PageErr {
  get title() {return `Ошибка 404: страница не найдена`}
  fsPath() {return `404.html`}
  code() {return 404}

  body() {
    return this.html(
      sm.Jumbo({
        title: this.title,
        sub: E.p.chi(`Приносим извинения, страница не найдена.`),
      }),
    )
  }
}

export class PageIndex extends Page {
  get title() {return `ProstoPoi`}
  urlPath() {return `/`}
  fsPath() {return `index.html`}

  body() {
    return this.html(
      IndexCarousel(this.site),
      IndexSupport(),
      IndexHighlights(this.site),
      IndexQuote(),
      IndexFeaturettes(this.site),
    )
  }
}

function IndexCarousel(site) {
  const les = a.head(site.lessons)

  return new cl.Carousel().init(
    E.div
      .props(A.bgImg(`/images/colourful-balls.jpg`))
      .chi(
        E.div
          .props(A.cls(`brand-logo`))
          .chi(E.div.props(A.cls(`brand-logo-background`))),
      ),
    IndexCarouselItem(`/articles`,    `/images/spinning-red.jpg`,     `Что крутить`),
    IndexCarouselItem(`/videos`,      `/images/fireshow.jpg`,         `Кто крутит`),
    IndexCarouselItem(les?.urlPath(), `/images/backwards-posing.jpg`, `Как крутить`),
  )
}

function IndexCarouselItem(href, img, title) {
  return E.a
    .props(A.href(href).bgImg(img))
    .chi(E.h2.chi(title))
}

function IndexSupport() {
  return E.div.props(A.style(`padding: 1rem 1rem 0 1rem`)).chi(
    E.a
      .props(
        A
          .href(`/support`)
          .cls(`sf-jumbo row-around-stretch relative hover-bg-zoom`)
          .style(`height: 12rem`)
          .bgImg(`/images/armful-of-poi.jpg`)
      )
      .chi(
        E.div
          .props(A.cls(`text-center flex-1 col-center-center`))
          .chi(E.h2.chi(E.span.props(A.cls(`fa fa-arrow-circle-o-right`)).chi(` Поддержать проект`))),
      )
  )
}

function IndexHighlights(site) {
  const les = a.head(site.lessons)

  return E.div.props(A.cls(`row-between-stretch pad space-out-h`)).chi(
    IndexHighlight({
      link: `/articles`,
      image: `/images/square/sunny-learn.jpg`,
      title: `Узнать`,
      sub: `Пои — это новый прекрасный способ развития и творческого самовыражения!`,
    }),
    IndexHighlight({
      link: `/videos`,
      image: `/images/square/night-firewheel.jpg`,
      title: `Увидеть`,
      sub: `Выступления мастеров пои оставляют яркие впечатления надолго!`,
    }),
    a.vac(les) && IndexHighlight({
      link: les.urlPath(),
      image: `/images/square/sunny-try.jpg`,
      title: `Попробовать`,
      sub: `Обучение искусству кручения пои — это веселый, интересный и захватывающий процесс!`,
    }),
  )
}

function IndexHighlight({link, image, title, sub}) {
  return E.a.props(A.href(link).cls(`flex-1 marketing-highlight`)).chi(
    E.div.props(A.bgImg(image)),
    E.div.props(A.cls(`container`)).chi(
      E.h2.props(A.cls(`theme-text-primary`)).chi(title),
      E.p.chi(sub),
    ),
  )
}

function IndexQuote(quote) {
  if (!quote) return undefined

  return [
    E.hr,
    E.div.props(A.cls(`container narrow-inverse center-by-margins text-large`)).chi(
      sm.RenderQuote(quote),
    ),
  ]
}

function IndexFeaturettes(site) {
  const video = a.head(site.videos)
  const les = a.head(site.lessons)

  return E.div.props(A.cls(`pad`)).chi(
    IndexFeaturette({
      link: `/articles`,
      text: `Вдохновляйтесь!`,
      sub: `Крутить пои могут все и всегда.`,
      src: new u.YoutubeId(`JusDCjOxfGM`),
    }),
    a.vac(video) && IndexFeaturette({
      link: video.urlPath(),
      text: `Смотрите!`,
      sub: `Впечатляющие выступления артистов.`,
      src: video.ent.youtubeId,
    }),
    a.vac(les) && IndexFeaturette({
      link: les.urlPath(),
      text: `Тренируйтесь!`,
      sub: `Больше элементов — больше свободы.`,
      src: les.ent.youtubeId,
    }),
    E.hr,
    sm.SocialLinks(),
    IndexFeaturettePlaceholder(),
  )
}

function IndexFeaturette({link, text, sub, src}) {
  return E.div.props(A.cls(`index-featurette`)).chi(
    E.hr,
    E.div.props(A.cls(`index-featurette-content`)).chi(
      E.div.props(A.cls(`flex-7`)).chi(new cl.Embed().init(src, link)),
      E.div.props(A.cls(`flex-5 self-center container`)).chi(
        E.h2.chi(E.a.props(A.href(link).cls(`decorated`).hrefMain()).chi(text)),
        a.vac(sub) && E.h3.chi(sub),
      )
    ),
  )
}

function IndexFeaturettePlaceholder() {
  return E.div.props(A.cls(`index-featurette`)).chi(
    E.hr,
    E.div.props(A.cls(`index-featurette-content narrow-inverse-center`)),
  )
}

export class PageArticles extends Page {
  get title() {return `Что крутить (узнайте о пои)`}
  urlPath() {return `/articles`}

  body() {
    return this.html(
      sm.Jumbo({
        img: `/images/spinning-red.jpg`,
        title: this.title,
      }),
      E.div
        .props(A.cls(`sm-grid-1 grid-2`))
        .chi(a.map(this.site.articles, ArticleFeedItem)),
    )
  }
}

function ArticleFeedItem(page) {
  const ent = a.reqInst(page.ent, d.Article)

  return E.a.props(A.href(page.urlPath()).cls(`grid-item`)).chi(
    E.div.props(
      A.cls(`preview`)
      .style(`min-width: 8em`)
      .bgImg(ent.image)
    ),
    E.h3.chi(
      ent.title,
      a.vac(ent.IsDraft && (
        E.sup
          .props(A.cls(`theme-primary`).style(`margin-left: 0.5rem`))
          .chi(`черновик`)
      )),
    ),
    E.p.props(A.cls(`text-break`)).chi(ent.snippet),
  )
}

export class PageArticle extends Page {
  urlPath() {return this.ent.urlPath()}
  desc() {return this.ent.snippet}

  body() {
    return this.html(
      sm.Jumbo({
        img: this.ent.image,
        title: this.ent.title,
      }),
      E.div.props(A.cls(`row-between-stretch sm-col-start-stretch`)).chi(
        ArticleMain(this),
        ArticleSidenav(this),
      ),
    )
  }
}

function ArticleMain(page) {
  const ent = a.reqInst(page.ent, d.Article)
  const authorName = ent.guessAuthorName()

  return E.article.props(A.cls(`md-flex-3`)).chi(
    E.h2.props(A.cls(`row-between-center`)).chi(
      E.span.chi(
        ent.title,
        a.vac(ent.isDraft && E.sup.props(A.cls(`theme-primary`)).chi(`черновик`)),
      ),
    ),
    E.div.props(A.cls(`article-info`)).chi(
      E.dl.chi(
        a.vac(authorName) && [
          E.dt.chi(
            E.span.props(A.cls(`fa fa-user inline`)),
            E.span.chi(` Автор`),
          ),
          E.dd.chi(authorName),
        ],
        a.vac(ent.createdAt) && [
          E.dt.chi(
            E.span.props(A.cls(`fa fa-calendar inline`)),
            E.span.chi(` Дата`),
          ),
          E.dd.chi(new a.DateShort(ent.createdAt)),
        ],
        a.vac(ent.photographerName) && [
          E.dt.chi(
            E.span.props(A.cls(`fa fa-camera inline`)),
            E.span.chi(` Фотограф`),
          ),
          E.dd.chi(ent.photographerName),
        ],
      ),
    ),
    new p.Raw(u.mdToHtml(ent.content)),
  )
}

function ArticleSidenav(page) {
  return E.div.props(A.cls(`sm-grid-2 md-flex-1 md-order--1 pad-v`)).chi(
    a.map(page.site.articles, val => ArticleSidenavItem(val, page)),
  )
}

function ArticleSidenavItem(page, current) {
  const ent = a.reqInst(page.ent, d.Article)

  return E.a
    .props(A.href(page.urlPath()).cur(current).cls(`grid-item`))
    .chi(
      E.div.props(A.cls(`preview`).bgImg(ent.image)),
      E.p.chi(
        ent.title,
        a.vac(ent.isDraft) && (
          E.sup.props(A.cls(`theme-primary`)).chi(`черновик`)
        ),
      ),
    )
}

export class PageVideos extends Page {
  get title() {return `Кто крутит (выступления мастеров пои)`}
  urlPath() {return `/videos`}

  body() {
    return this.html(
      sm.Jumbo({
        img:   `/images/fireshow.jpg`,
        title: this.title,
        sub:   E.p.chi(`Пои лучше один раз увидеть!`),
      }),
      E.div.props(A.cls(`row-between-stretch`)).chi(
        VideosIntro({
          link:  a.head(this.site.videos)?.urlPath(),
          title: `Выступления с пои`,
          img:   `/images/thumb-poi-fireshow.jpg`,
          sub: [
            E.p.chi(`Посмотрите, что значит крутить пои по-настоящему эффектно!`),
            E.p.chi(`Профессиональные выступления с огненными или световыми пои никого не оставят равнодушным.`),
          ],
        }),

        E.div.props(A.cls(`flex-none line-vertical`).style(`margin: 0`)),

        VideosIntro({
          link:  a.head(this.site.techVideos)?.urlPath(),
          title: `Техблоги с пои`,
          img:   `/images/thumb-poi-techblog.jpg`,
          sub: [
            E.p.chi(`Учитесь и вдохновляйтесь яркими видео настоящих мастеров поинга!`),
            E.p.chi(`Специальные учебные видео с демонстрацией технического кручения пои, в которых можно почерпнуть идеи движений, связок и переходов.`),
          ],
        }),
      ),
    )
  }
}

function VideosIntro({link, title, img, sub}) {
  return E.a.props(A.href(link).cls(`block flex-1 container text-center`)).chi(
    E.h1.props(A.cls(`text-center`)).chi(title),
    E.div.props(A.cls(`fat-block`)).chi(
      E.div.props(A.cls(`fat-block-body shadow background-cover`).bgImg(img)),
    ),
    sub,
  )
}

export class PageVideo extends Page {
  urlPath() {return this.ent.urlPath()}

  body() {
    return this.html(
      sm.Jumbo({
        img: `/images/thumb-poi-fireshow.jpg`,
        title: `Кто крутит (выступления мастеров пои)`,
        sub: E.p.chi(`Пои лучше один раз увидеть!`),
      }),
      VideoSubnav(this),
      E.div.props(A.cls(`row-between-stretch pad space-out-h`)).chi(
        VideoSidenav(this),
        VideoMain(this),
      ),
      VideoFeed(this),
    )
  }
}

function VideoSubnav(page) {
  return E.div.props(A.id(c.ID_MAIN).cls(`sf-navbar sf-navbar-tabs`)).chi(
    VideoSubnavLink({
      page,
      link: a.head(page.site.videos)?.urlPath(),
      base: `/videos`,
      text: `Выступления с пои`,
    }),
    VideoSubnavLink({
      page,
      link: a.head(page.site.techVideos)?.urlPath(),
      base: `/tech-videos`,
      text: `Техблоги с пои`,
    }),
  )
}

function VideoSubnavLink({page, link, base, text}) {
  return E.a.props(A.href(link).hrefMain().cur(page, base)).chi(text)
}

function VideoSidenav(page) {
  return E.div
    .props(
      A.cls(`flex-1 col-between-stretch space-out`).style(`min-height: 8em`)
    )
    .chi(
      a.map(page.site.dat.videos.around(a.pk(page)), val => VideoSidenavItem(val, page)),
    )
}

function VideoSidenavItem(video, current) {
  return E.a
    .props(
      A
      .href(video.urlPath())
      .hrefMain()
      .cls(`flex-1 row-center-stretch`)
      // TODO convert to `aria-current`.
      .cls(u.pkEq(video, current) && `outline-thick`)
    )
    .chi(
      E.div.props(
        A
        .cls(`flex-1 background-cover`)
        .bgImg(video.youtubeId.image())
        .set(`data-overtip`, video.title)
      )
    )
}

function VideoMain(page) {
  const ent = a.reqInst(page.ent, d.Video)

  return E.div.props(A.cls(`flex-4`)).chi(
    E.div.props(A.cls(`space-out`)).chi(
      sm.VideoEmbed(ent.youtubeId),

      // Video title and favorite toggle.
      E.h2
        .props(
          A.cls(`sm-space-out md-space-out col-start-start lg-row-between-center lg-space-out-h`)
        )
        .chi(
          E.div.props(A.cls(`flex-1`)).chi(sm.TitleWithTooltip(ent)),
          E.div.props(A.cls(`row-center-center space-out-h-half`)).chi(VideoControls(page)),
        ),
    ),
  )
}

function VideoControls(page) {
  if (c.MOCK_IS_AUTHED) {
    return [
      E.span.props(A.set(`data-favorite-video-toggle`, JSON.stringify({id: a.pk(page)}))),
      E.a.props(A.href(`/profile/favorites`).cls(`decorated text-smaller`)).chi(`(все)`),
    ]
  }

  if (c.MOCK_ENABLE_AUTH) {
    return E.span
      .props(A.set(`data-sf-tooltip`, `Залогиньтесь, чтобы добавить в избранное`))
      .chi(E.span.props(A.cls(`mock-checkbox-heart`).set(`data-modal-trigger`, `{"type":"login"}`)))
  }

  return undefined
}

function VideoFeed(page) {
  return E.div.props(A.cls(`grid-2 md-grid-4`)).chi(
    a.map(page.site.videos, val => VideoFeedItem(val, page)),
  )
}

function VideoFeedItem(page, current) {
  const ent = a.reqInst(page.ent, d.Video)

  return E.a
    .props(
      A.href(page.urlPath()).hrefMain().cls(`grid-item`).cur(current)
    )
    .chi(
      E.div.props(A.cls(`preview`).bgImg(ent.youtubeId.image())).chi(
        E.p.chi(sm.TitleWithTooltip(ent)),
      ),
    )
}

export class PageTechVideo extends Page {
  urlPath() {return this.ent.urlPath()}

  body() {
    return this.html(
      sm.Jumbo({
        img:   `/images/thumb-poi-techblog.jpg`,
        title: `Техблоги с пои`,
        sub:   E.p.chi(`Учитесь и вдохновляйтесь яркими видео настоящих мастеров поинга!`),
      }),
      VideoSubnav(this),
      E.div.props(A.cls(`row-between-stretch`)).chi(
        TechVideoSidenav(this),
        TechVideoMain(this),
      ),
    )
  }
}

function TechVideoSidenav(page) {
  return E.div
    .props(A.cls(`flex-none`).style(`min-width: 12em; max-width: 33%`))
    .chi(
      E.div.props(A.cls(`sidenav`).style(`max-width: 16em`)).chi(
        sm.LanguageToggle() || E.br,
        a.map(
          page.site.dat.authors,
          author => TechVideoSidenavAuthor(author, page),
        ),
      ),
    )
}

function TechVideoSidenavAuthor(author, page) {
  const video = author.firstTechVideo()
  if (!video) return undefined

  return E.a
    .props(
      A.href(video.urlPath()).hrefMain().current(author.id === page.ent.authorId)
    )
    .chi(E.span.chi(author.fullName))
}

function TechVideoMain(page) {
  return E.div.props(A.cls(`flex-1 pad-h`)).chi(
    E.div.props(A.cls(`flex-1 space-out`)).chi(
      E.br,
      E.div.props(A.cls(`grid-2 md-grid-4`)).chi(
        a.map(page.ent.author().techVideos(), val => TechVideoPreview(val, page))
      ),
      TechVideoView(page),
    ),
  )
}

function TechVideoPreview(video, current) {
  return E.a
    .props(
      A.href(video.urlPath()).hrefMain().cur(current).cls(`pad space-out`)
    )
    .chi(E.p.chi(sm.TitleWithTooltip(video)))
}

function TechVideoView(page) {
  const ent = a.reqInst(page.ent, d.TechVideo)

  return E.div.props(A.cls(`space-out`)).chi(
    sm.VideoEmbed(ent.youtubeId),
    TechVideoTitle(ent),
    TechVideoViewAuthor(ent.author()),
  )
}

function TechVideoTitle(ent) {
  return E.h2.chi(sm.TitleWithTooltip(ent))
}

function TechVideoViewAuthor(author) {
  return [
    E.p.chi(
      E.span.props(A.cls(`fa fa-user inline`)),
      E.span.chi(` Автор: `, author.fullName),
    ),
    a.vac(author.youtubeChannelUrl) && E.p.chi(
      E.span.props(A.cls(`fa fa-youtube-play inline`)),
      E.span.chi(` Канал:`),
      E.a.props(A.href(author.youtubeChannelUrl).tarblan()).chi(author.youtubeChannelUrl),
    ),
  ]
}

export class PageLesson extends Page {
  urlPath() {return this.ent.urlPath()}

  body() {
    return this.html(
      sm.Jumbo({
        img: `/images/backwards-posing.jpg`,
        title: `Как крутить (видео-уроки поинга)`,
        sub: E.p.chi(`Наши видео-уроки поинга позволят вам освоить элементы постепенно, от простых к сложным!`),
      }),
      LessonNavbar(this),
      LessonMain(this),
    )
  }
}

function LessonNavbar(page) {
  return E.div
    .props(A.id(c.ID_MAIN).cls(`sf-navbar sf-navbar-tabs`))
    .chi(a.map(page.site.dat.skillLevels, val => (
      LessonNavbarSkillLevel(val, page)
    )))
}

function LessonNavbarSkillLevel(skillLevel, page) {
  const icon = skillLevelIcons[skillLevel.level]

  return E.a
    .props(
      A
      .href(skillLevel.firstLesson()?.urlPath())
      .hrefMain()
      .current(page.ent.move().element().skillLevelId === a.pk(skillLevel))
    )
    .chi(
      a.vac(icon) && E.span.props(A.cls(`sf-icon`)).chi(icon),
      E.span.chi(skillLevel.title),
    )
}

const skillLevelIcons = [
  undefined,
  sm.SvgSkillLevelBasic,
  sm.SvgSkillLevelAdvanced,
  sm.SvgSkillLevelMasterful,
  // 'sf-icon-skill-level-basic',
  // 'sf-icon-skill-level-advanced',
  // 'sf-icon-skill-level-masterful',
]

function LessonMain(page) {
  const elem = page.ent.move().element()

  return E.div.props(A.cls(`row-between-stretch`)).chi(
    SidenavElements(elem),
    LessonView(page),
  )
}

function SidenavElements(elem) {
  return E.div.props(A.cls(`flex-none`).style(`min-width: 12em; max-width: 33%`)).chi(
    E.div.props(A.cls(`sidenav`).style(`max-width: 16em`)).chi(
      sm.LanguageToggle() || E.br,
      SkillLevelElements(elem),
    )
  )
}

function SkillLevelElements(curElem) {
  return a.map(
    curElem.skillLevel().elements(),
    elem => SkillLevelElement(elem, u.pkEq(elem, curElem)),
  )
}

function SkillLevelElement(elem, current) {
  const les = elem.firstLesson()
  if (!les) return undefined

  return E.a.props(A.href(les.urlPath()).hrefMain().current(current)).chi(
    sm.TitleWithTooltip(elem),
  )
}

function LessonView(page) {
  const move = page.ent.move()
  const moves = move.siblings()

  return E.div.props(A.cls(`flex-1 pad-h`)).chi(
    E.div.props(A.cls(`flex-1 space-out`)).chi(
    E.br,
      E.div.props(A.cls(`grid-2 md-grid-4`)).chi(
        MovesNavbar(move, moves),
      ),
      E.div.props(A.cls(`space-out`)).chi(
        LessonActualContent(page),
        MoveLessons(move, page),
      ),
    ),
  )
}


function MovesNavbar(curMove, moves) {
  return a.map(moves, move => (
    MoveNavbarItem(move, u.pkEq(move, curMove))
  ))
}

function MoveNavbarItem(move, current) {
  return E.a
    .props(
      A.href(move.firstLesson()?.urlPath()).hrefMain().current(current).cls(`pad space-out`)
    )
    .chi(
      E.p.chi(sm.TitleWithTooltip(move)),
      E.p.props(A.cls(`stars-container`)).chi(
        a.times(move.rating, ind => (
          E.span.props(A.cls(`star`).active(move.rating >= ind))
        )),
      ),
    )
}

function LessonActualContent(page) {
  const ent = a.reqInst(page.ent, d.Lesson)

  return E.div.props(A.cls(`space-out`)).chi(
    sm.VideoEmbed(ent.youtubeId),
    MoveDetails(ent.move()),
    LessonDetails(page),
  )
}

function MoveDetails(move) {
  return [
    MoveTitleWithControls(move),
    a.vac(move.desc) && E.p.props(A.cls(`text-break`)).chi(move.desc),
  ]
}

function MoveTitleWithControls(move) {
  return E.h2
    .props(A.cls(`sm-space-out md-space-out col-start-start lg-row-between-center lg-space-out-h`))
    .chi(MoveTitle(move), MoveControls(move))
}

function MoveTitle(move) {
  return E.span.props(A.cls(`flex-1`)).chi(`Движение: `, sm.TitleWithTooltip(move))
}

function MoveControls(move) {
  return E.span.props(A.cls(`row-center-center row-inline space-out-h-half`)).chi(
    c.MOCK_IS_AUTHED
    ? [
      E.span.props(A.set(`data-favorite-move-toggle`, JSON.stringify({id: move.id}))),
      E.span.props(A.set(`data-learned-move-toggle`,  JSON.stringify({id: move.id}))),
      E.a.props(A.href(`/profile/mastery`).cls(`decorated text-smaller`)).chi(`(все)`),
    ]
    : c.MOCK_ENABLE_AUTH ? [
      E.span
        .props(A.set(`data-sf-tooltip`, `Залогиньтесь, чтобы добавить в избранное`))
        .chi(E.span.props(A.cls(`mock-checkbox-bullseye`).set(`data-modal-trigger`, `{"type":"login"}`))),
      E.span
        .props(A.set(`data-sf-tooltip`, `Залогиньтесь, чтобы отметить свой навык`))
        .chi(E.span.props(A.cls(`mock-checkbox-circle`).set(`data-modal-trigger`, `{"type":"login"}`))),
    ]
    : undefined,
  )
}

function LessonDetails(page) {
  return [
    E.h3.chi(`Урок: `, sm.TitleWithTooltip(page.ent)),
    LessonLang(page),
    LessonAuthor(page),
  ]
}

function LessonLang(page) {
  const ent = a.reqInst(page.ent, d.Lesson)
  const lang = ent.lang()
  if (!lang) return undefined

  return E.p.chi(
    E.span.chi(`Язык: `),
    E.span.props(A.cls(a.san`sf-icon-flag-${ent.language} inline`)),
    E.span.chi(lang.title),
  )
}

function LessonAuthor(page) {
  const ent = a.reqInst(page.ent, d.Lesson)
  const author = ent.author()

  if (!author) {
    return a.vac(ent.authorName) && E.p.chi(
      E.span.props(A.cls(`fa fa-user inline`)),
      E.span.chi(` Автор: `, ent.authorName),
    )
  }

  const chan = author.youtubeChannelUrl || ent.authorYoutubeChannelUrl

  return [
    E.p.chi(
      E.span.props(A.cls(`fa fa-user inline`)),
      E.span.chi(` Автор: `, author.fullName),
    ),
    a.vac(chan) && E.p.chi(
      E.span.props(A.cls(`fa fa-youtube-play inline`)),
      E.span.chi(` Канал: `),
      E.a.props(A.href(chan).tarblan()).chi(chan),
    ),
  ]
}

function MoveLessons(move, curLesson) {
  return E.div.props(A.cls(`grid-2 md-grid-3`)).chi(
    a.map(move.lessons(), les => (
      MoveLesson(les, u.pkEq(les, curLesson))
    )),
  )
}

function MoveLesson(les, current) {
  return E.a
    .props(
      A.href(les.urlPath()).cls(`grid-item`).hrefMain().current(current).style(`position: relative`)
    )
    .chi(
      E.div.props(A.cls(`preview`).bgImg(les.youtubeId.image())),
      E.p.chi(
        a.vac(les.language) && (
          E.span.props(A.cls(a.san`sf-icon-flag-${les.language} size-4-to-3 inline`))
        ),
        sm.TitleWithTooltip(les),
      ),
    )
}

export class PageSupport extends Page {
  get title() {return `Поддержать ProstoPoi`}
  urlPath() {return `/support`}

  body() {
    const props = A.id(c.ID_MAIN).cls(`row-center-center pad`)

    return this.html(
      sm.Jumbo({
        img: `/images/shop/shop-title-cut.jpg`,
        title: this.title,
        sub: E.p.chi(`Благодарим за вклад в развитие проекта!`),
      }),
      E.div.props(props).chi(
        E.iframe.props({
          src: `https://money.yandex.ru/quickpay/shop-widget?writer=seller&targets=%D0%9F%D0%BE%D0%B4%D0%B4%D0%B5%D1%80%D0%B6%D0%BA%D0%B0%20%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0%20ProstoPoi.ru&targets-hint=&default-sum=100&button-text=11&payment-type-choice=on&hint=&successURL=&quickpay=shop&account=41001128987294`,
          width: `423`,
          height: `222`,
          frameborder: `0`,
          allowtransparency: `true`,
          scrolling: `no`,
        }),
      ),
      // E.noscript.props(props).chi(
      //   E.h2.chi(
      //     `Для работы этой страницы нужно `,
      //     E.a
      //     .props(A.href(`https://enable-javascript.com`).cls(`decorated`).tarblan())
      //     .chi(`включить JavaScript`),
      //   )
      // )
    )
  }
}

export class PageAbout extends Page {
  get title() {return `О нас`}
  urlPath() {return `/about`}

  body() {
    return this.html(
      sm.Jumbo({
        img: `/images/about-narrower.jpg`,
        title: this.title,
        sub: E.p,
      }),
      E.div.props(A.cls(`pad`)).chi(
        E.div.props(A.cls(`shadow narrow-inverse-center sf-article`)).chi(
          E.h2.chi(`Учитесь крутить пои и задавайте вопросы!`),
          E.br,
          E.p.chi(`Мы — команда ProstoPoi. Здесь мы знакомим вас с миром пои и вдохновляем узнать его получше!`),
          E.p.chi(`Мы готовы ответить на любые вопросы по поводу подбора реквизита, организации тренировок и обучения.`),
          E.p.chi(`Обязательно добавляйтесь в нашу группу ВКонтакте и Facebook, смотрите канал на YouTube и читайте Twitter!`),
          E.hr,
          sm.SocialLinks(),
          E.hr,
          sm.SiteSource(),
        ),
      ),
    )
  }
}

export const site = new Site(d.dat)
