/*
Tiny development server for client page reloading and CSS reinjection.
Serves its own client script, watches files, and broadcasts notifications.
The main server also uses this to broadcast a signal about its own restart.
*/

import * as a from '@mitranim/js/all.mjs'
import * as hd from '@mitranim/js/http_deno.mjs'
import * as ld from '@mitranim/js/live_deno.mjs'
import * as c from './conf.mjs'
import * as cs from './cmd_srv.mjs'

export const LIVE_BASE = a.url(`http://localhost`).setPort(c.LIVE_PORT).setPath(ld.LIVE_PATH)
export const LIVE_CLIENT = LIVE_BASE.clone().addPath(`live_client.mjs`)
export const LIVE_SEND = LIVE_BASE.clone().addPath(`send`)

const srv = new class Srv extends hd.Srv {
  bro = new ld.LiveBroad()

  async res(req) {
    return (
      (await this.bro.res(req)) ||
      new Response(`not found`, {status: 404})
    )
  }

  async watch() {
    for await (const val of cs.dirsWatch.watchLive()) {
      await this.bro.writeEventJson(val)
    }
  }

  onListen() {}
}()

async function main() {
  srv.watch()
  await srv.listen({port: c.LIVE_PORT, hostname: `localhost`})
}

if (import.meta.main) await main()
