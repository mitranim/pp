import * as s from './site.mjs'

import {init as initArticles}    from './init_articles.mjs'
import {init as initVideos}      from './init_videos.mjs'
import {init as initTechVideos}  from './init_tech_videos.mjs'
import {init as initLessons}     from './init_lessons.mjs'
import {init as initAuthors}     from './init_authors.mjs'
import {init as initSkillLevels} from './init_skill_levels.mjs'
import {init as initElements}    from './init_elements.mjs'
import {init as initMoves}       from './init_moves.mjs'

export function initSite() {
  return new s.Site({
    articles:    initArticles(),
    videos:      initVideos(),
    techVideos:  initTechVideos(),
    lessons:     initLessons(),
    authors:     initAuthors(),
    skillLevels: initSkillLevels(),
    elements:    initElements(),
    moves:       initMoves(),
  }).rel()
}
