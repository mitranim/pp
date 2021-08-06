import * as u from '../scripts/util.mjs'
import * as d from '../scripts/dat.mjs'

export function init() {
  return new u.ListPkAsc(
    new d.SkillLevel({
      id: 1,
      slug: `basic`,
      title: `Базовый`,
      titleEn: ``,
      level: 1,
    }),
    new d.SkillLevel({
      id: 2,
      slug: `advanced`,
      title: `Продвинутый`,
      titleEn: ``,
      level: 2,
    }),
    new d.SkillLevel({
      id: 3,
      slug: `masterful`,
      title: `Мастерский`,
      titleEn: ``,
      level: 3,
    }),
  ).norm()
}
