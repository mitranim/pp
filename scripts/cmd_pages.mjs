import * as pt from 'path'
import * as c from './conf.mjs'
import * as s from './site_init.mjs'
import * as u from './util.mjs'

u.timing(`pages`, cmdPages)

function cmdPages() {
  const site = s.initSite()

  for (const page of site.pages()) {
    const {path} = page
    if (!path) continue

    const res = page.res?.(site)
    if (!res) continue

    write(pt.join(c.TARGET, path), res)
  }
}

function write(path, res) {
  Deno.mkdirSync(pt.dirname(path), {recursive: true})
  Deno.writeTextFileSync(path, res.body)
}
