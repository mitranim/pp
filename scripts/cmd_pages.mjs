import * as u from './util.mjs'
import * as s from './site.mjs'

u.timing(`pages`, cmdPages)

function cmdPages() {for (const page of s.site.pages()) page.write()}
