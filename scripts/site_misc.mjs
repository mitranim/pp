import * as f from 'fpx'
import * as x from 'prax'
import {E} from 'prax'
import * as a from 'afr'
import * as c from './conf.mjs'
import * as u from './util.mjs'
import * as e from './elem.mjs'
import * as sv from './site_svg.mjs'

export function Html({page, site}, ...children) {
  return x.doc(
    e.htmlv(
      e.headv(
        e.meta({charset: `utf-8`}),
        e.link({rel:       `stylesheet`,          type:    `text/css`, href: `/styles/main.css`}),
        e.meta({httpEquiv: `X-UA-Compatible`,     content: `IE=edge,chrome=1`}),
        e.meta({name:      `viewport`,            content: `width=device-width, minimum-scale=1, maximum-scale=2, initial-scale=1, user-scalable=yes`}),
        e.link({rel:       `icon`,                type:    `image/png`, href: `/images/prosto-poi-favicon.png`}),
        e.meta({name:      `author`,              content: `ProstoPoi`}),
        e.meta({name:      `description`,         content: page.desc || `Всё о кручении пои. Статьи, видео-уроки поинга, вдохновляющие видео. Пои — это просто!`}),
        e.meta({name:      `yandex-verification`, content: `670c2d620c57556c`}),
        e.titlev(page.title || `ProstoPoi`),
        f.vac(!c.PROD) && e.script({type: `importmap`}, JSON.stringify(importmap())),
        e.script({type: `module`, src: `/scripts/browser.mjs`}),
        f.vac(!c.PROD) && e.script({type: `module`, src: a.clientPath(c.AFR_OPTS)}),
        f.vac(c.PROD) && e.link({href: `https://fonts.googleapis.com/css?family=Open+Sans:400,600,400italic,600italic&subset=latin,cyrillic`, rel: `stylesheet`, type: `text/css`}),
      ),
      e.body(
        {id: c.ID_TOP},
        Header(page, site),
        children,
        Footer(page, site),
      ),
    )
  )
}

function Header(page, site) {
  const les = site.lessons[0]

  return e.header(
    {class: `sf-navbar theme-primary`},
    e.a(
      {href: `/`, class: `sf-icon navbar-brand-icon`, ...u.cur(page, `/`)},
      sv.SvgProstoPoiIconWhite,
    ),
    e.a({href: `/articles`, class: u.actCur(page, `/articles`)},               `Что крутить`),
    e.a({href: `/videos`,   class: u.actCur(page, `/videos`, `/tech-videos`)}, `Кто крутит`),
    e.a({href: les?.link,   class: u.actCur(page, `/lessons`)},                `Как крутить`),
  )
}

function Footer() {
  return e.footer(
    {class: `sf-footer`},
    e.div(
      {class: `sf-footer-body`},
      e.pv(
        e.spanv(`2014-${new Date().getFullYear()} © `),
        e.a({href: `/about`}, `ProstoPoi`),
      ),
      e.a({
        href: u.idToHash(c.ID_TOP),
        class: `fa fa-arrow-up pad theme-text-primary sf-button`,
        onclick: `event.preventDefault(); window.scrollTo(0, 0)`,
        'aria-label': `scroll up`,
      })
    ),
  )
}

function importmap() {
  return {imports: {
    fpx: `/node_modules/fpx/fpx.mjs`,
    prax: `/node_modules/prax/dom.mjs`,
    espo: `/node_modules/espo/espo.mjs`,
    '@ungap/custom-elements': `/node_modules/@ungap/custom-elements/index.js`,
  }}
}

export function Jumbo({img, link, title, sub}) {
  return e.div(
    {class: `sf-jumbo`, style: u.bgImg(img)},
    link
    ? e.a({href: link}, JumboInner({title, sub}))
    : JumboInner({title, sub})
  )
}

function JumboInner({title, sub}) {
  return [title && e.h2v(title), sub]
}

export function Carousel(...vals) {
  return E(`a-carousel`, {'data-carousel': ``}, f.map(vals, CarouselItem))
}

function CarouselItem(val, i) {
  return e.div({'data-carousel-item': ``, ...u.hid(i > 0)}, val)
}

// See `quote.html`.
export function RenderQuote(_quote) {}

export function SocialLinks() {
  return e.div(
    {class: `index-featurette about container`},
    e.h2v(`ProstoPoi в медиа`),
    e.section(
      {class: `text-center`},
      e.a({href: `http://vk.com/prostopoi`,                                 class: `fa fa-vk dark pop inline`, ...u.ablan}),
      e.a({href: `http://www.youtube.com/channel/UCbVXtQgoRkhWatoLQgctKKg`, class: `fa fa-youtube-play dark pop inline`, ...u.ablan}),
      e.a({href: `http://instagram.com/prosto_poi`,                         class: `fa fa-instagram dark pop inline`, ...u.ablan}),
      e.a({href: `http://twitter.com/prostopoi`,                            class: `fa fa-twitter dark pop inline`, ...u.ablan}),
      e.a({href: `https://www.facebook.com/groups/884742048217106/`,        class: `fa fa-facebook dark pop inline`, ...u.ablan}),
      e.a({href: `mailto:poietoprosto@gmail.com`,                           class: `fa fa-at dark pop inline`}),
    ),
    e.h3v(`Следите за нашими новостями!`),
  )
}

export function VideoEmbed(embed, image) {
  if (c.DISABLE_VIDEOS) {
    return e.div({class: `sf-embed preview`, style: u.bgImg(image)})
  }
  return e.div({class: `sf-embed`}, VideoIframe(embed))
}

function VideoIframe(src) {
  if (c.DISABLE_VIDEOS || !src) return undefined
  return e.iframe({src, allowFullScreen: `true`})
}

// TODO enable (for anonymous users too).
export function LanguageToggle() {
  if (c.MOCK_IS_AUTHED) {
    return e.div({
      class: `pad text-center`,
      style: {fontSize: `1.5rem`},
      'data-option-english-terminology': ``,
    })
  }
  return undefined
}

export function TitleWithTooltip(val) {
  return e.span(
    {'data-sf-tooltip': val.titleInverted},
    e.span({class: `indicate-tooltip`}, val.title),
  )
}
