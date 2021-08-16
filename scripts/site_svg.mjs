import * as x from 'prax'
import * as u from './util.mjs'

export const SvgProstoPoiIconWhite = readSvg(`svg/prosto-poi-icon-white.svg`)
export const SvgSkillLevelBasic = readSvg(`svg/skill-level-basic.svg`)
export const SvgSkillLevelAdvanced = readSvg(`svg/skill-level-advanced.svg`)
export const SvgSkillLevelMasterful = readSvg(`svg/skill-level-masterful.svg`)

function readSvg(path) {
  return new x.Raw(u.trimLines(Deno.readTextFileSync(path)))
}
