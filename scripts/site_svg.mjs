import * as x from 'prax'
import * as u from './util.mjs'

export const SvgProstoPoiIconWhite = readSvg(`svg/prosto-poi-icon-white.svg`)

function readSvg(path) {
  return new x.Raw(u.trimLines(Deno.readTextFileSync(path)))
}
