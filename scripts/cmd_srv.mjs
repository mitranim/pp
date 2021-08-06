import * as a from 'afr'
import * as r from 'imperouter'
import * as c from './conf.mjs'
import * as s from './site.mjs'
import * as si from './site_init.mjs'
import * as u from './util.mjs'

const dirs = [
  a.dir(c.TARGET),
  a.dir(c.STATIC),
  a.dir(`.`, /^(?:images|scripts|svg|node_modules)[/]/),
  a.dir(`uploaded`),
  a.dir(`node_modules/font-awesome`, /^fonts[/]/),
]

const site = si.initSite()

const lis = Deno.listen(c.SRV_OPTS)
console.log(`[srv] listening on http://${c.SRV_OPTS.hostname || 'localhost'}:${c.SRV_OPTS.port}`)

watch()

// TODO: convert to top-level await once Eslint is updated to 8.0+
export default serve()

async function watch() {
  a.maybeSend(a.change, c.AFR_OPTS)
  for await (const msg of a.watch('.', dirs, {recursive: true})) {
    a.maybeSend(msg, c.AFR_OPTS)
  }
}

async function serve() {
  for await (const conn of lis) serveHttp(conn).catch(a.logErr)
}

async function serveHttp(conn) {
  for await (const event of Deno.serveHttp(conn)) respond(event).catch(a.logErr)
}

async function respond(event) {
  await event.respondWith(u.resUncache(await response(event.request)))
}

async function response(req) {
  try {
    return (
      (await a.resFile(req, dirs)) ||
      r.any(req, /[.]\w+$/, r.notFound) ||
      (await r.get(req, /(?:)/, resPage)) ||
      r.notFound(req)
    )
  }
  catch (err) {
    console.error(`[srv] unexpected error while serving ${req.url}:`, err)
    return u.resErr(err)
  }
}

async function resPage(req) {
  try {
    const {pathname} = new URL(req.url)
    const page = site.pageByLink(pathname) || new s.Page404({})
    return await page.res(site).native()
  }
  catch (err) {
    console.error(`[srv] unexpected error while serving ${req.url}:`, err)
    return new s.PageErr({err}).res(site).native()
  }
}
