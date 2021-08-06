// Required for custom elements that use `is`.
import '@ungap/custom-elements'

import * as f from 'fpx'
import * as x from 'prax'
import {E} from 'prax'

clearHash()

// TODO clearer code.
class Carousel extends HTMLElement {
  constructor() {
    super()
    this.timer = undefined
  }

  connectedCallback() {this.reset()}
  disconnectedCallback() {this.clearTimer()}

  items() {return selAll(this, `[data-carousel-item]`)}
  index() {return f.findIndex(this.items(), f.test({hidden: false}))}

  reset() {
    this.resetTimer()
    this.resetDots()
    this.resetControls()
  }

  resetTimer() {
    this.clearTimer()
    this.timer = setInterval(this.next.bind(this), 1024 * 3)
  }

  clearTimer() {
    clearInterval(this.timer)
    this.timer = undefined
  }

  // TODO avoid unnecessary removal.
  resetDots() {
    const attr = `data-carousel-dots`

    const dots = (
      sel(this, `[${attr}]`) ||
      this.appendChild(E(`span`, {[attr]: ``}))
    )

    x.reset(dots, {}, f.map(this.items(), (item, ind) => (
      E(`button`, {
        class: x.cls(`carousel-dot`, !item.hidden && `active`),
        onclick: this.select.bind(this, ind),
      })
    )))
  }

  resetControls() {
    const prev = `data-carousel-prev`
    const next = `data-carousel-next`

    remove(sel(this, `[${prev}]`))
    remove(sel(this, `[${next}]`))

    this.append(
      E(`button`, {[prev]: ``, onclick: this.prev.bind(this)}),
      E(`button`, {[next]: ``, onclick: this.next.bind(this)}),
    )
  }

  prev() {this.select(this.index() - 1)}
  next() {this.select(this.index() + 1)}

  select(ind) {
    const items = this.items()

    ind = (ind + items.length) % items.length
    const item = items[ind]

    f.each(items, hide)
    show(item)

    this.resetDots()
    this.resetTimer()
  }
}
customElements.define(`a-carousel`, Carousel)

function show(node) {if (node.hidden) node.hidden = false}
function hide(node) {if (!node.hidden) node.hidden = true}
function remove(node) {node?.remove()}

function sel(node, sel) {return node.querySelector(f.str(sel))}
function selAll(node, sel) {return node.querySelectorAll(f.str(sel))}

function clearHash() {
  const loc = window.location
  if (loc.hash) {
    const node = document.querySelector(loc.hash)
    if (node) node.scrollIntoView()
    window.history.replaceState(null, '', loc.origin + loc.pathname)
  }
}

class A extends HTMLAnchorElement {
  constructor() {
    super()
    this.onclick = this.onClick
  }

  onClick() {
    const {id} = this.dataset
    if (id) this.hash = id
  }
}
customElements.define(`a-a`, A, {extends: `a`})
