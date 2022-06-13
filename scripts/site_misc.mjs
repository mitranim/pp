import * as a from '@mitranim/js/all.mjs'
import * as p from '@mitranim/js/prax.mjs'
import * as io from '@mitranim/js/io_deno.mjs'
import * as c from './conf.mjs'
import {E, A} from './util.mjs'
import * as u from './util.mjs'
import * as cl from './cmd_live.mjs'

const importmap = (
  await io.readTextOpt(`importmap_client_override.json`) ||
  await io.readTextOpt(`importmap_client.json`)
)

export function Html(page, ...children) {
  return p.renderDocument(
    E.html.chi(
      E.head.chi(
        E.meta.props(A.charset(`utf-8`)),
        E.link.props(A.rel(`stylesheet`).type(`text/css`).href(`/styles/main.css`)),
        a.vac(c.PROD) && E.link.props(A.href(`https://fonts.googleapis.com/css?family=Open+Sans:400,600,400italic,600italic&subset=latin,cyrillic`).rel(`stylesheet`).type(`text/css`)),
        E.meta.props(A.httpEquiv(`X-UA-Compatible`).content(`IE=edge,chrome=1`)),
        E.meta.props(A.name(`viewport`).content(`width=device-width, minimum-scale=1, maximum-scale=2, initial-scale=1, user-scalable=yes`)),
        E.link.props(A.rel(`icon`).type(`image/png`).href(`/images/prosto-poi-favicon.png`)),
        E.meta.props(A.name(`author`).content(`ProstoPoi`)),
        E.meta.props(A.name(`description`).content(page.desc?.() || `Всё о кручении пои. Статьи, видео-уроки поинга, вдохновляющие видео. Пои — это просто!`)),
        E.meta.props(A.name(`yandex-verification`).content(`670c2d620c57556c`)),
        E.title.chi(page.title || `ProstoPoi`),
        a.vac(importmap) && E.script.props(A.type(`importmap`)).chi(importmap),
        a.vac(c.PROD) && E.script.props(
          A
          .type(`module`)
          .src(`https://cdn.jsdelivr.net/npm/@ungap/custom-elements@1.0.0/es.js`)
        ),
        E.script.props(A.type(`module`).src(`/scripts/client.mjs`)),
        a.vac(!c.PROD) && E.script.props(A.type(`module`).src(cl.LIVE_CLIENT)),
      ),
      E.body.props(A.id(c.ID_TOP)).chi(
        Header(page),
        children,
        Footer(page),
      ),
    )
  )
}

function Header(page) {
  const les = a.head(page.site.lessons)

  return E.header.props(A.cls(`sf-navbar theme-primary`)).chi(
    E.a.props(A.href(`/`).cur(page).cls(`sf-icon navbar-brand-icon`)).chi(SvgProstoPoiIconWhite),
    E.a.props(A.href(`/articles`).cur(page)).chi(`Что крутить`),
    E.a.props(A.href(`/videos`).cur(page, `/tech-videos`)).chi(`Кто крутит`),
    E.a.props(A.href(les?.urlPath()).cur(page, `/lessons`)).chi(`Как крутить`),
  )
}

// TODO include link to source repo.
function Footer() {
  return E.footer.props(A.cls(`sf-footer`)).chi(
    E.div.props(A.cls(`sf-footer-body`)).chi(
      E.p.chi(
        E.span.chi(`2014–`, new Date().getFullYear(), ` © `),
        E.a.props(A.href(`/about`)).chi(`ProstoPoi`),
      ),
      E.a.props(
        A
        .href(a.url().setHash(c.ID_TOP))
        .cls(`fa fa-arrow-up pad theme-text-primary sf-button`)
        .onclick(`event.preventDefault(); window.scrollTo(0, 0)`)
        .set(`aria-label`, `scroll up`)
      ),
    ),
  )
}

export function Jumbo({img, link, title, sub}) {
  return E.div.props(A.cls(`sf-jumbo`).bgImg(img)).chi(
    link
    ? E.a.props(A.href(`link`)).chi(JumboInner({title, sub}))
    : JumboInner({title, sub})
  )
}

function JumboInner({title, sub}) {
  return [title && E.h2.chi(title), sub]
}

// TODO recover.
export function RenderQuote(_quote) {}

export function SocialLinks() {
  const cls = `dark pop inline size-large`

  return E.div.props(A.cls(`index-featurette about container`)).chi(
    E.h2.chi(`ProstoPoi в медиа`),
    E.section.props(A.cls(`text-center`)).chi(
      E.a.props(A.href(`https://vk.com/prostopoi`).cls(`fa fa-vk`).cls(cls).tarblan()),
      E.a.props(A.href(`https://www.youtube.com/channel/UCbVXtQgoRkhWatoLQgctKKg`).cls(`fa fa-youtube-play`).cls(cls).tarblan()),
      E.a.props(A.href(`https://instagram.com/prosto_poi`).cls(`fa fa-instagram`).cls(cls).tarblan()),
      E.a.props(A.href(`https://twitter.com/prostopoi`).cls(`fa fa-twitter`).cls(cls).tarblan()),
      E.a.props(A.href(`https://www.facebook.com/groups/884742048217106/`).cls(`fa fa-facebook`).cls(cls).tarblan()),
      E.a.props(A.href(`mailto:poietoprosto@gmail.com`).cls(`fa fa-at`).cls(cls)),
    ),
    E.h3.chi(`Следите за нашими новостями!`),
  )
}

export function SiteSource() {
  const link = `https://github.com/mitranim/pp`

  return E.div.props(A.cls(`index-featurette about container`)).chi(
    E.h2.chi(`Исходный код сайта`),
    E.a
      .props(A.href(link).cls(`decorated`).tarblan())
      .chi(E.span.props(A.cls(`fa fa-github inline`)), ` `, link),
  )
}

// Input may be `YoutubeId` or another type satisfying the interface.
export function VideoEmbed(src) {
  if (c.DEV_DISABLE_VIDEOS) {
    return E.div.props(A.cls(`sf-embed preview`).bgImg(src.image()))
  }
  return E.div.props(A.cls(`sf-embed`)).chi(VideoIframe(src.embed()))
}

function VideoIframe(src) {
  if (c.DEV_DISABLE_VIDEOS || !src) return undefined
  return E.iframe.props(A.src(src).set(`allowFullScreen`, `true`))
}

// TODO enable (for anonymous users too).
export function LanguageToggle() {
  if (c.MOCK_IS_AUTHED) {
    return E.div.props(
      A
      .cls(`pad text-center`)
      .style(`font-size: 1.5rem`)
      .set(`data-option-english-terminology`, ``)
    )
  }
  return undefined
}

export function TitleWithTooltip(val) {
  return E.span.props(A.set(`data-sf-tooltip`, val.titleInverted())).chi(
    E.span.props(A.cls(`indicate-tooltip`)).chi(val.title),
  )
}

export const SvgProstoPoiIconWhite = readSvg(`svg/prosto-poi-icon-white.svg`)
export const SvgSkillLevelBasic = readSvg(`svg/skill-level-basic.svg`)
export const SvgSkillLevelAdvanced = readSvg(`svg/skill-level-advanced.svg`)
export const SvgSkillLevelMasterful = readSvg(`svg/skill-level-masterful.svg`)

function readSvg(path) {
  return new p.Raw(u.trimLines(Deno.readTextFileSync(path)))
}
