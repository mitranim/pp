export const PROD = Deno.env.get(`PROD`) === `true`
export const SRV_PORT = 47693
export const LIVE_PORT = 47692
export const DEV_DISABLE_VIDEOS = !PROD
export const MOCK_IS_AUTHED = false
export const MOCK_ENABLE_AUTH = false

export const TARGET = `public`
export const STATIC = `static`
export const TEMPLATES = `templates`

export const ID_MAIN = `main`
export const ID_TOP = `top`
