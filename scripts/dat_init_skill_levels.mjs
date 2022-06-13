import * as u from './util.mjs'

export default [
  {
    id: 1,
    slug: `basic`,
    title: `Базовый`,
    titleEn: ``,
    level: 1,
  },
  {
    id: 2,
    slug: `advanced`,
    title: `Продвинутый`,
    titleEn: ``,
    level: 2,
  },
  {
    id: 3,
    slug: `masterful`,
    title: `Мастерский`,
    titleEn: ``,
    level: 3,
  },
].sort(u.byPkAsc)
