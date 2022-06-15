/* eslint-env browser */

import * as l from '@mitranim/js/lang.mjs'
import * as i from '@mitranim/js/iter.mjs'
import * as d from '@mitranim/js/dom.mjs'
import * as p from '@mitranim/js/prax.mjs'
import * as dr from '@mitranim/js/dom_reg.mjs'
import * as dg from '@mitranim/js/dom_glob'

dr.Reg.main.setDefiner(dg.customElements)

export const ren = new p.Ren(dg.document).patchProto(dg.glob.Element)

const E = ren.E
const A = p.PropBui.main

export function MixElem(cls) {return p.MixChild(d.MixNode(cls))}

export class Carousel extends MixElem(dg.glob.HTMLElement) {
  static customName = `a-carousel`
  static {dr.reg(this)}

  init(...items) {
    for (const item of items) initCarouselItem(item)
    const len = items.length

    return this.props(A.cls(`carousel`)).chi(
      items,
      new CarouselDots().init(len),
      new CarouselPrev().init(len),
      new CarouselNext().init(len),
    ).setNext()
  }

  connectedCallback() {this.initTimer()}
  disconnectedCallback() {this.deinitTimer()}

  initTimer() {
    this.deinitTimer()
    this.timer = setInterval(this.setNext.bind(this), 1024 * 3)
  }

  deinitTimer() {
    clearInterval(this.timer)
    this.timer = undefined
  }

  dots() {return this.desc(CarouselDots)}
  items() {return i.filter(this.childNodes, isCarouselItem)}

  setInd(ind) {
    const items = this.items()
    if (l.isEmpty(items)) return this

    for (const item of items) item.hidden = true
    items[ind].hidden = false
    this.dots().setInd(ind)
    return this
  }

  setPrev() {return this.setInd(this.dots().prevInd())}
  setNext() {return this.setInd(this.dots().nextInd())}
}

function initCarouselItem(val) {
  val.setAttribute(`data-carousel-item`, ``)
  val.classList.add(`carousel-item`)
  val.hidden = true
  return val
}

function isCarouselItem(val) {return val.hasAttribute(`data-carousel-item`)}

class CarouselDots extends MixElem(dg.glob.HTMLElement) {
  static customName = `carousel-dots`
  static {dr.reg(this)}

  init(len) {
    return this
      .props(A.cls(`carousel-dots`))
      .chi(i.times(len, makeCarouselDot))
  }

  currentInd() {return i.findIndex(this.childNodes, isCurrent)}

  prevInd() {
    return (this.currentInd() - 1 + this.childNodes.length) % this.childNodes.length
  }

  nextInd() {
    return (this.currentInd() + 1) % this.childNodes.length
  }

  setInd(ind) {
    for (const val of this.childNodes) val.unsetCurrent()
    this.childNodes[ind].setCurrent()
  }
}

function isCurrent(val) {return val.isCurrent()}

class CarouselBtn extends MixElem(dg.glob.HTMLButtonElement) {
  static customName = `carousel-btn`
  static {dr.reg(this)}
  caro() {return this.anc(Carousel)}
  init() {return this.props(this.A)}
  connectedCallback() {this.onclick = this.onClick}
}

function makeCarouselDot() {return new CarouselDot().init()}

class CarouselDot extends CarouselBtn {
  static customName = `carousel-dot`
  static {dr.reg(this)}

  get A() {return A.cls(`carousel-dot`)}

  ind() {return i.indexOf(this.anc(CarouselDots).childNodes, this)}

  onClick(eve) {
    d.eventStop(eve)
    this.caro().setInd(this.ind()).initTimer()
  }

  isCurrent() {return !!this.hasAttribute(`aria-current`)}
  setCurrent() {this.setAttribute(`aria-current`, `step`)}
  unsetCurrent() {this.removeAttribute(`aria-current`)}
}

class CarouselPrev extends CarouselBtn {
  static customName = `carousel-prev`
  static {dr.reg(this)}

  get A() {return A.cls(`carousel-control carousel-prev`)}

  onClick(eve) {
    d.eventStop(eve)
    this.caro().setPrev()
  }
}

class CarouselNext extends CarouselBtn {
  static customName = `carousel-next`
  static {dr.reg(this)}

  get A() {return A.cls(`carousel-control carousel-next`)}

  onClick(eve) {
    d.eventStop(eve)
    this.caro().setNext()
  }
}

export class Embed extends MixElem(dg.glob.HTMLAnchorElement) {
  static customName = `a-embed`
  static {dr.reg(this)}

  init(src, link) {
    const img = l.render(src.image())
    this.dataset.embed = l.render(src.embed())

    return this
      .props(
        A
        .href(link)
        .cls(`sf-embed block preview relative`)
        .style(img ? {backgroundImage: `url(${img})`} : undefined)
      )
      .chi(E.span.props(A.cls(`fa fa-youtube-play --free size-larger abs-cen`)))
  }

  connectedCallback() {this.onclick = this.onClick}

  onClick(eve) {
    if (d.isEventModified(eve)) return
    d.eventStop(eve)

    this.chi(E.iframe.props(
      A.src(this.dataset.embed).set(`allowFullScreen`, `true`)
    ))
  }
}

function clearHash() {
  const loc = window.location
  const hash = loc.hash
  if (!hash) return

  const node = document.querySelector(hash)
  if (!node) return

  const his = window.history
  node.scrollIntoView()
  his.replaceState(his.state, ``, loc.origin + loc.pathname + loc.search)
}

if (d.DOM_EXISTS) clearHash()
