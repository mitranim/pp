import * as f from 'fpx'
import * as x from 'prax'
import * as es from 'espo'
import * as c from './conf.mjs'
import * as u from './util.mjs'
import * as d from './dat.mjs'
import * as e from './elem.mjs'
import * as sm from './site_misc.mjs'
import * as sv from './site_svg.mjs'

export class Site extends d.Dat {
  constructor(val) {
    super(val)

    this.misc = new u.List(
      new Page404(),
      new PageIndex(),
      new PageArticles(),
      new PageVideos(),
      new PageSupport(),
      new PageAbout(),
    )
  }

  *pages() {
    yield* this.misc
    yield* this.articles
    yield* this.videos
    yield* this.techVideos
    yield* this.lessons
  }

  pageByLink(link) {
    for (const val of this.pages()) if (val.link === link) return val
    return undefined
  }
}

class Page {
  constructor(val) {f.assign(this, val)}
  get path() {return f.vac(this.link && f.str(this.link) + `.html`)}
  set path(path) {es.pubs(this, {path})}
  res() {throw Error(`implement in subclass`)}
}

export class PageErr extends Page {
  get title() {return `Ошибка 500`}

  res(site) {
    const err = this.err || Error(this.title)

    return u.resHtml(sm.Html(
      {page: this, site},
      sm.Jumbo({
        img: `/images/eruption.jpg`,
        title: this.title,
        sub: e.pv(`Произошла внутренняя ошибка сайта. Приносим извинения.`),
      }),
      e.pre({class: `pad`}, err?.stack || String(err)),
    ), {status: 500})
  }
}

export class Page404 extends Page {
  get path() {return `404.html`}
  get title() {return `Ошибка 404: страница не найдена`}

  res(site) {
    return u.resHtml(sm.Html(
      {page: this, site},
      sm.Jumbo({
        title: this.title,
        sub: e.pv(`Приносим извинения, страница не найдена.`),
      }),
    ), {status: 404})
  }
}

export class PageIndex extends Page {
  get link() {return `/`}
  get path() {return `index.html`}
  get title() {return `ProstoPoi`}

  res(site) {
    return u.resHtml(sm.Html(
      {page: this, site},
      IndexCarousel(site),
      IndexSupport(),
      IndexHighlights(site),
      IndexQuote(),
      IndexFeaturettes(site),
    ))
  }
}

function IndexCarousel(site) {
  const les = site.lessons[0]

  return sm.Carousel(
    sm.Jumbo({
      img: `/images/colourful-balls.jpg`,
      sub: e.div({class: `brand-logo`}, e.div({class: `brand-logo-background`})),
    }),
    IndexCarouselItem(`/articles`, `/images/spinning-red.jpg`,     `Что крутить`),
    IndexCarouselItem(`/videos`,   `/images/fireshow.jpg`,         `Кто крутит`),
    IndexCarouselItem(les?.link,   `/images/backwards-posing.jpg`, `Как крутить`),
  )
}

function IndexCarouselItem(href, img, title) {
  return e.a(
    {href, class: `carousel-item sf-jumbo page-banner`, style: u.bgImg(img)},
    e.h2v(title),
  )
}

function IndexSupport() {
  return e.div(
    {style: `padding: 1rem 1rem 0 1rem`},
    e.a(
      {
        href: `/support`,
        class: `sf-jumbo row-around-stretch relative hover-bg-zoom`,
        style: {...u.bgImg(`/images/armful-of-poi.jpg`), height: `12rem`},
      },
      e.div(
        {class: `text-center flex-1 col-center-center`},
        e.h2v(e.span({class: `fa fa-arrow-circle-o-right`}, ` Поддержать проект`)),
      ),
    ),
  )
}

function IndexHighlights(site) {
  const les = site.lessons[0]

  return e.div(
    {class: `row-between-stretch pad space-out-h`},
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
    les && IndexHighlight({
      link: les.link,
      image: `/images/square/sunny-try.jpg`,
      title: `Попробовать`,
      sub: `Обучение искусству кручения пои — это веселый, интересный и захватывающий процесс!`,
    }),
  )
}

function IndexHighlight({link, image, title, sub}) {
  return e.a(
    {href: link, class: `flex-1 marketing-highlight`},
    e.div({style: u.bgImg(image)}),
    e.div(
      {class: `container`},
      e.h2({class: `theme-text-primary`}, title),
      e.pv(sub),
    ),
  )
}

function IndexQuote(quote) {
  if (!quote) return undefined

  return [
    e.hr(),
    e.div(
      {class: `container narrow-inverse center-by-margins text-large`},
      sm.RenderQuote(quote),
    ),
  ]
}

function IndexFeaturettes(site) {
  const video = site.videos[0]
  const les = site.lessons[0]

  return e.div(
    {class: `pad`},
    IndexFeaturette({
      link: `/articles`,
      image: u.youtubeImageUrl(`JusDCjOxfGM`),
      embed: u.youtubeEmbedUrl(`JusDCjOxfGM`),
      text:  `Вдохновляйтесь!`,
      sub:   `Крутить пои могут все и всегда.`,
    }),
    video && IndexFeaturette({
      link:  video.link,
      image: video.image,
      embed: video.embed,
      text: `Смотрите!`,
      sub:  `Впечатляющие выступления артистов.`,
    }),
    les && IndexFeaturette({
      link:  les.link,
      image: les.image,
      embed: les.embed,
      text: `Тренируйтесь!`,
      sub:  `Больше элементов — больше свободы.`,
    }),
    e.hr(),
    sm.SocialLinks(),
    IndexFeaturettePlaceholder(),
  )
}

function IndexFeaturette({link, image, embed, text, sub}) {
  return e.div(
    {class: `index-featurette`},
    e.hr(),
    e.div(
      {class: `index-featurette-content`},
      e.div(
        {class: `flex-7`},
        sm.VideoEmbed(embed, image),
      ),
      e.div(
        {class: `flex-5 self-center container`},
        e.h2v(e.a({href: link, ...u.mainLinkProps}, text)),
        sub && e.h3v(sub),
      )
    ),
  )
}

function IndexFeaturettePlaceholder() {
  return e.div(
    {class: `index-featurette`},
    e.hr(),
    e.div({class: `index-featurette-content narrow-inverse-center`}),
  )
}

export class PageArticles extends Page {
  get link() {return `/articles`}
  get title() {return `Что крутить (узнайте о пои)`}

  res(site) {
    return u.resHtml(sm.Html(
      {page: this, site},
      sm.Jumbo({
        img: `/images/spinning-red.jpg`,
        title: `Что крутить (узнайте о пои)`,
      }),
      e.div({class: `sm-grid-1 grid-2`}, f.map(site.articles, ArticleFeedItem)),
    ))
  }
}

function ArticleFeedItem(val) {
  return e.a(
    {href: val.link, class: `grid-item`},
    e.div({
      class: `preview`,
      style: {...u.bgImg(val.image), minWidth: `8em`},
    }),
    e.h3v(
      val.title,
      f.vac(val.IsDraft && e.sup(
        {class: `theme-primary`, style: {marginLeft: `0.5rem`}},
        `черновик`,
      )),
    ),
    e.p({class: `text-break`}, val.snippet),
  )
}

export class PageArticle extends d.Article {
  get link() {return u.pathJoin(`/articles`, this.slug)}
  get desc() {return this.snippet}
  get path() {return this.link + `.html`}

  res(site) {
    return u.resHtml(sm.Html(
      {page: this, site},
      sm.Jumbo({
        img:   this.image,
        title: this.title,
      }),
      e.div(
        {class: `row-between-stretch sm-col-start-stretch`},
        ArticleMain(this),
        ArticleSidenav(this, site),
      ),
    ))
  }
}

function ArticleMain(page) {
  const authorName = page.guessAuthorName()

  return e.article(
    {class: `md-flex-3`},
    e.h2(
      {class: `row-between-center`},
      e.spanv(
        page.title,
        f.vac(page.isDraft && e.sup({class: `theme-primary`}, `черновик`)),
      ),
    ),
    e.div(
      {class: `article-info`},
      e.dlv(
        f.vac(authorName && [
          e.dtv(
            e.span({class: `fa fa-user inline`}),
            e.spanv(` Автор`),
          ),
          e.ddv(authorName),
        ]),
        f.vac(page.createdAt && [
          e.dtv(
            e.span({class: `fa fa-calendar inline`}),
            e.spanv(` Дата`),
          ),
          e.ddv(new u.ShortDate(page.createdAt)),
        ]),
        f.vac(page.photographerName && [
          e.dtv(
            e.span({class: `fa fa-camera inline`}),
            e.spanv(` Фотограф`),
          ),
          e.ddv(page.photographerName),
        ]),
      ),
    ),
    new x.Raw(u.mdToHtml(page.content)),
  )
}

function ArticleSidenav(page, site) {
  return e.div(
    {class: `sm-grid-2 md-flex-1 md-order--1 pad-v`},
    f.map(site.articles, val => ArticleSidenavItem(val, page)),
  )
}

function ArticleSidenavItem(val, page) {
  return e.a(
    {
      href: val.link,
      class: x.cls(`grid-item`, u.actCur(page, val.link)),
    },
    e.div({class: `preview`, style: u.bgImg(val.image)}),
    e.pv(
      val.title,
      f.vac(val.isDraft && (
        e.sup({class: `theme-primary`}, `черновик`)
      )),
    ),
  )
}

export class PageVideos extends Page {
  get link() {return `/videos`}
  get title() {return `Кто крутит (выступления мастеров пои)`}

  res(site) {
    return u.resHtml(sm.Html(
      {page: this, site},
      sm.Jumbo({
        img:   `/images/fireshow.jpg`,
        title: `Кто крутит (выступления мастеров пои)`,
        sub:   e.pv(`Пои лучше один раз увидеть!`),
      }),
      e.div({class: `row-between-stretch`},
        VideosIntro({
          link:  site.videos[0]?.link,
          title: `Выступления с пои`,
          img:   `/images/thumb-poi-fireshow.jpg`,
          sub: [
            e.pv(`Посмотрите, что значит крутить пои по-настоящему эффектно!`),
            e.pv(`Профессиональные выступления с огненными или световыми пои никого не оставят равнодушным.`),
          ],
        }),

        e.div({class: `flex-none line-vertical`, style: {margin: '0'}}),

        VideosIntro({
          link:  site.techVideos[0]?.link,
          title: `Техблоги с пои`,
          img:   `/images/thumb-poi-techblog.jpg`,
          sub: [
            e.pv(`Учитесь и вдохновляйтесь яркими видео настоящих мастеров поинга!`),
            e.pv(`Специальные учебные видео с демонстрацией технического кручения пои, в которых можно почерпнуть идеи движений, связок и переходов.`),
          ],
        }),
      ),
    ))
  }
}

function VideosIntro({link, title, img, sub}) {
  return e.a(
    {href: link, class: `block flex-1 container text-center`},
    e.h1({class: `text-center`}, title),
    e.div(
      {class: `fat-block`},
      e.div({
        class: `fat-block-body shadow background-cover`,
        style: u.bgImg(img),
      }),
    ),
    sub,
  )
}

export class PageVideo extends d.Video {
  get link() {return u.pathJoin(`/videos`, this.slug)}
  get path() {return this.link + `.html`}

  res(site) {
    return u.resHtml(sm.Html(
      {page: this, site},
      sm.Jumbo({
        img:   `/images/thumb-poi-fireshow.jpg`,
        title: `Кто крутит (выступления мастеров пои)`,
        sub:   e.pv(`Пои лучше один раз увидеть!`),
      }),
      VideoSubnav(this, site),
      e.div(
        {class: `row-between-stretch pad space-out-h`},
        VideoSidenav(this, site),
        VideoMain(this),
      ),
      VideoFeed(this, site),
    ))
  }
}

function VideoSubnav(page, site) {
  return e.div(
    {
      id: c.ID_MAIN,
      class: `sf-navbar sf-navbar-tabs`,
    },
    VideoSubnavLink({
      page,
      link: site.videos[0]?.link,
      base: `/videos`,
      text: `Выступления с пои`,
    }),
    VideoSubnavLink({
      page,
      link: site.techVideos[0]?.link,
      base: `/tech-videos`,
      text: `Техблоги с пои`,
    }),
  )
}

function VideoSubnavLink({page, link, base, text}) {
  return e.a(
    {href: link, class: u.actCur(page, base), ...u.mainLinkProps},
    text,
  )
}

function VideoSidenav(page, site) {
  return e.div(
    {class: `flex-1 col-between-stretch space-out`, style: {minHeight: `8em`}},
    f.map(d.videosAround(site, page.id), val => VideoSidenavItem(val, page)),
  )
}

function VideoSidenavItem(val, page) {
  // TODO convert to `aria-current`.
  const cur = val.id && f.is(val.id, page.id)

  return e.a(
    {
      href: val.link,
      class: x.cls(`flex-1 row-center-stretch`, cur && `outline-thick`),
      ...u.mainLinkProps,
    },
    e.div({
      class: `flex-1 background-cover`,
      style: u.bgImg(val.image),
      'data-overtip': val.title,
    }),
  )
}

function VideoMain(page) {
  return e.div(
    {class: `flex-4`},
    e.div(
      {class: `space-out`},
      sm.VideoEmbed(page.embed, page.image),

      // Video title and favorite toggle.
      e.h2(
        {class: `sm-space-out md-space-out col-start-start lg-row-between-center lg-space-out-h`},
        e.div({class: `flex-1`}, sm.TitleWithTooltip(page)),
        e.div(
          {class: `row-center-center space-out-h-half`},
          VideoControls(page),
        ),
      ),
    ),
  )
}

function VideoControls(page) {
  if (c.MOCK_IS_AUTHED) {
    return [
      e.span({'data-favorite-video-toggle': JSON.stringify({id: page.id})}),
      e.a({href: `/profile/favorites`, class: `decorated text-smaller`}, `(все)`),
    ]
  }

  if (c.MOCK_ENABLE_AUTH) {
    return e.span(
      {'data-sf-tooltip': `Залогиньтесь, чтобы добавить в избранное`},
      e.span({'data-modal-trigger': `{"type":"login"}`, class: `mock-checkbox-heart`}),
    )
  }

  return undefined
}

function VideoFeed(page, site) {
  return e.div(
    {class: `grid-2 md-grid-4`},
    f.map(site.videos, val => VideoFeedItem(val, page)),
  )
}

function VideoFeedItem(val, page) {
  return e.a(
    {
      href: val.link,
      class: x.cls(`grid-item`, u.actCur(page, val.link)),
      ...u.mainLinkProps,
    },
    e.div(
      {class: `preview`, style: u.bgImg(val.image)},
      e.pv(sm.TitleWithTooltip(val)),
    ),
  )
}

export class PageTechVideo extends d.TechVideo {
  get link() {return u.pathJoin(`/tech-videos`, this.slug)}
  get path() {return this.link + `.html`}

  res(site) {
    return u.resHtml(sm.Html(
      {page: this, site},
      sm.Jumbo({
        img:   `/images/thumb-poi-techblog.jpg`,
        title: `Техблоги с пои`,
        sub:   e.pv(`Учитесь и вдохновляйтесь яркими видео настоящих мастеров поинга!`),
      }),
      VideoSubnav(this, site),
      e.div(
        {class: `row-between-stretch`},
        TechVideoSidenav(this, site),
        TechVideoMain(this, site),
      ),
    ))
  }
}

function TechVideoSidenav(page, site) {
  return e.div(
    {class: `flex-none`, style: {minWidth: `12em`, maxWidth: `33%`}},
    e.div(
      {class: `sidenav`, style: {maxWidth: `16em`}},
      sm.LanguageToggle() || e.br(),
      f.map(
        site.authors,
        author => TechVideoSidenavAuthor(author, page),
      ),
    ),
  )
}

function TechVideoSidenavAuthor(author, page) {
  const videos = author.techVideos
  if (!f.len(videos)) return undefined

  return e.a(
    {
      href: videos[0].link,
      class: u.act(author.id === page.authorId),
      ...u.mainLinkProps,
    },
    e.spanv(author.fullName),
  )
}

function TechVideoMain(page, site) {
  return e.div(
    {class: `flex-1 pad-h`},
    e.div(
      {class: `flex-1 space-out`},
      e.br(),
      e.div(
        {class: `grid-2 md-grid-4`},
        f.map(
          page.author.techVideos,
          val => TechVideoPreview(val, page),
        )
      ),
      TechVideoView(page, site),
    ),
  )
}

function TechVideoPreview(val, page) {
  return e.a(
    {
      href: val.link,
      class: x.cls(`pad space-out`, u.act(val.id === page.id)),
      ...u.mainLinkProps,
    },
    e.pv(sm.TitleWithTooltip(val)),
  )
}

function TechVideoView(page, site) {
  return e.div(
    {class: `space-out`},
    sm.VideoEmbed(page.embed, page.image),
    TechVideoTitle(page),
    TechVideoViewAuthor(page, site),
  )
}

function TechVideoTitle(page) {
  return e.h2v(sm.TitleWithTooltip(page))
}

function TechVideoViewAuthor(page) {
  const {author} = page

  return [
    e.pv(
      e.span({class: `fa fa-user inline`}),
      e.spanv(` Автор: `, author.fullName),
    ),
    f.vac(author.youtubeChannelUrl) && e.pv(
      e.span({class: `fa fa-youtube-play inline`}),
      e.spanv(` Канал:`),
      e.a({href: author.youtubeChannelUrl, ...u.ablan}, author.youtubeChannelUrl),
    ),
  ]
}

export class PageLesson extends d.Lesson {
  get link() {return u.pathJoin(`/lessons`, this.id)}
  get path() {return this.link + `.html`}

  res(site) {
    return u.resHtml(sm.Html(
      {page: this, site},
      sm.Jumbo({
        img: `/images/backwards-posing.jpg`,
        title: `Как крутить (видео-уроки поинга)`,
        sub: e.pv(`Наши видео-уроки поинга позволят вам освоить элементы постепенно, от простых к сложным!`),
      }),
      LessonNavbar(this, site),
      LessonMain(this, site),
    ))
  }
}

function LessonNavbar(page, site) {
  return e.div(
    {id: c.ID_MAIN, class: `sf-navbar sf-navbar-tabs`},
    f.map(site.skillLevels, val => LessonNavbarSkillLevel(val, page))
  )
}

function LessonNavbarSkillLevel(skillLevel, les) {
  const icon = skillLevelIcons[skillLevel.level]

  return e.a(
    {
      href: skillLevel.firstLesson()?.link,
      class: u.act(les.move.element.skillLevel === skillLevel),
      ...u.mainLinkProps,
    },
    // e.span({class: skillLevelIcons[skillLevel.level]}),
    icon && e.span({class: `sf-icon`}, icon),
    e.spanv(skillLevel.title),
  )
}

const skillLevelIcons = [
  undefined,
  sv.SvgSkillLevelBasic,
  sv.SvgSkillLevelAdvanced,
  sv.SvgSkillLevelMasterful,
  // 'sf-icon-skill-level-basic',
  // 'sf-icon-skill-level-advanced',
  // 'sf-icon-skill-level-masterful',
]

function LessonMain(les, site) {
  const elem = les.move.element

  return e.div(
    {class: `row-between-stretch`},
    SidenavElements(elem, site),
    LessonView(les, site),
  )
}

function SidenavElements(elem, site) {
  return e.div(
    {class: `flex-none`, style: `min-width: 12em; max-width: 33%`},
    e.div(
      {class: `sidenav`, style: `max-width: 16em`},
      sm.LanguageToggle() || e.br(),
      SkillLevelElements(elem, site),
    )
  )
}

function SkillLevelElements(curElem, site) {
  const {skillLevel: level} = curElem

  return f.map(
    level.elements,
    elem => SkillLevelElement(elem, site, elem === curElem),
  )
}

function SkillLevelElement(elem, site, active) {
  const les = elem.firstLesson()
  if (!les) return undefined

  return e.a(
    {href: les.link, class: u.act(active), ...u.mainLinkProps},
    sm.TitleWithTooltip(elem),
  )
}

function LessonView(page, site) {
  const {move} = page
  const moves = move.siblings

  return e.div(
    {class: `flex-1 pad-h`},
    e.div(
      {class: `flex-1 space-out`},
      e.br(),
      e.div(
        {class: `grid-2 md-grid-4`},
        MovesNavbar(moves, page, site),
      ),
      e.div(
        {class: `space-out`},
        LessonActualContent(page, site),
        MoveLessons(move, page),
      ),
    ),
  )
}


function MovesNavbar(moves, les, site) {
  const {move: curMove} = les
  return f.map(moves, move => MoveNavbarItem(move, site, move === curMove))
}

function MoveNavbarItem(move, site, active) {
  return e.a(
    {
      class: x.cls(`pad space-out`, u.act(active)),
      href: move.firstLesson()?.link,
      ...u.mainLinkProps,
    },
    e.pv(sm.TitleWithTooltip(move)),
    e.p(
      {class: `stars-container`},
      f.times(move.rating, i => (
        e.span({class: x.cls(`star`, u.act(move.rating >= i))})
      )),
    ),
  )
}

function LessonActualContent(les, site) {
  const {move} = les

  return e.div(
    {class: `space-out`},
    sm.VideoEmbed(les.embed, les.image),
    MoveDetails(move),
    LessonDetails(les, site),
  )
}

function MoveDetails(move) {
  return [
    MoveTitleWithControls(move),
    move.desc && e.p({class: `text-break`}, move.desc),
  ]
}

function MoveTitleWithControls(move) {
  return e.h2(
    {class: `sm-space-out md-space-out col-start-start lg-row-between-center lg-space-out-h`},
    MoveTitle(move),
    MoveControls(move),
  )
}

function MoveTitle(move) {
  return e.span({class: `flex-1`}, `Движение: `, sm.TitleWithTooltip(move))
}

function MoveControls(move) {
  return e.span(
    {class: `row-center-center row-inline space-out-h-half`},
    c.MOCK_IS_AUTHED
    ? [
      e.span({'data-favorite-move-toggle': JSON.stringify({id: move.id})}),
      e.span({'data-learned-move-toggle':  JSON.stringify({id: move.id})}),
      e.a({href: `/profile/mastery`, class: `decorated text-smaller`}, `(все)`),
    ]
    : c.MOCK_ENABLE_AUTH ? [
      e.span(
        {'data-sf-tooltip': `Залогиньтесь, чтобы добавить в избранное`},
        e.span({
          'data-modal-trigger': `{"type":"login"}`,
          class: `mock-checkbox-bullseye`,
        }),
      ),
      e.span(
        {'data-sf-tooltip': `Залогиньтесь, чтобы отметить свой навык`},
        e.span({
          'data-modal-trigger': `{"type":"login"}`,
          class: `mock-checkbox-circle`,
        }),
      ),
    ]
    : undefined,
  )
}

function LessonDetails(les, site) {
  return [
    e.h3v(`Урок: `, sm.TitleWithTooltip(les)),
    LessonLang(les, site),
    LessonAuthor(les, site),
  ]
}

function LessonLang(les) {
  const {lang} = les
  if (!lang) return undefined

  return e.pv(
    e.spanv(`Язык: `),
    e.span({class: `sf-icon-flag-${les.language} inline`}),
    e.spanv(lang.title),
  )
}

function LessonAuthor(les) {
  const {author} = les

  if (!author) {
    return f.vac(les.authorName) && e.pv(
      e.span({class: `fa fa-user inline`}),
      e.spanv(` Автор: `, les.authorName),
    )
  }

  const chan = author.youtubeChannelUrl || les.authorYoutubeChannelUrl

  return [
    e.pv(
      e.span({class: `fa fa-user inline`}),
      e.spanv(` Автор: `, author.fullName),
    ),
    f.vac(chan) && e.pv(
      e.span({class: `fa fa-youtube-play inline`}),
      e.spanv(` Канал: `),
      e.a({href: chan, ...u.ablan}, chan),
    ),
  ]
}

function MoveLessons(move, curLesson) {
  const lessons = move.lessons

  return e.div(
    {class: `grid-2 md-grid-3`},
    f.map(lessons, les => MoveLesson(les, les === curLesson)),
  )
}

function MoveLesson(les, active) {
  return e.a(
    {
      href: les.link,
      class: x.cls(`grid-item`, u.act(active)),
      style: `position: relative`,
      ...u.mainLinkProps,
    },
    e.div({
      class: `preview`,
      style: u.bgImg(les.image),
    }),
    e.pv(
      f.vac(les.language) && (
        e.span({class: `sf-icon-flag-${les.language} size-4-to-3 inline`})
      ),
      sm.TitleWithTooltip(les),
    ),
  )
}

export class PageSupport extends Page {
  get link() {return `/support`}
  get title() {return `Поддержать ProstoPoi`}

  res(site) {
    return u.resHtml(sm.Html(
      {page: this, site},
      sm.Jumbo({
        img: `/images/shop/shop-title-cut.jpg`,
        title: this.title,
        sub: e.pv(`Благодарим за вклад в развитие проекта!`),
      }),
      e.div(
        {id: c.ID_MAIN, class: `row-center-center pad`},
        e.iframe({
          src: `https://money.yandex.ru/quickpay/shop-widget?writer=seller&targets=%D0%9F%D0%BE%D0%B4%D0%B4%D0%B5%D1%80%D0%B6%D0%BA%D0%B0%20%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0%20ProstoPoi.ru&targets-hint=&default-sum=100&button-text=11&payment-type-choice=on&hint=&successURL=&quickpay=shop&account=41001128987294`,
          width: `423`,
          height: `222`,
          frameborder: `0`,
          allowtransparency: `true`,
          scrolling: `no`,
        }),
      ),
    ))
  }
}

export class PageAbout extends Page {
  get link() {return `/about`}
  get title() {return `О нас`}

  res(site) {
    return u.resHtml(sm.Html(
      {page: this, site},
      sm.Jumbo({
        img: `/images/about-narrower.jpg`,
        title: this.title,
        sub: e.pv(),
      }),
      e.div(
        {class: `pad`},
        e.div(
          {class: `shadow narrow-inverse-center sf-article`},
          e.h2v(`Учитесь крутить пои и задавайте вопросы!`),
          e.br(),
          e.pv(`Мы — команда ProstoPoi. Здесь мы знакомим вас с миром пои и вдохновляем узнать его получше!`),
          e.pv(`Мы готовы ответить на любые вопросы по поводу подбора реквизита, организации тренировок и обучения.`),
          e.pv(`Обязательно добавляйтесь в нашу группу ВКонтакте и Facebook, смотрите канал на YouTube и читайте Twitter!`),
          e.hr(),
          sm.SocialLinks(),
        ),
      ),
    ))
  }
}
