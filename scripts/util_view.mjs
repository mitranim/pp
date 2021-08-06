import * as f from 'fpx'
import * as x from 'prax'
import * as c from './conf.mjs'

export function bgImg(val) {
  val = f.str(val)
  return f.vac(val && {backgroundImage: `url(${val})`})
}

// Semi-placeholder.
function isCur(page, ...links) {
  return f.vac(page && f.some(links, f.cwk, startsWith, page.link))
}

function startsWith(a, b) {return f.str(b).startsWith(f.str(a))}

export function cur(page, ...links) {
  return isCur(page, ...links) && {'aria-current': `page`}
}

export function actCur(page, ...links) {
  return isCur(page, ...links) && `active`
}

export function act(ok) {return f.vac(ok && `active`)}

export function hid(ok) {
  return f.vac(ok && {hidden: true})
}

export const ablan = Object.freeze({
  target: `_blank`,
  rel: `noopener noreferrer`,
})

export function inlineScript(props, fun) {
  f.req(fun, f.isFun)
  return x.E(`script`, props, new x.Raw(`void ${fun.toString()}()`))
}

export const mainLinkProps = Object.freeze({
  is: `a-a`,
  dataset: {id: c.MAIN_ID}
})
