export const PORT             = 47693
export const PROD             = Deno.env.get('PROD') === 'true'
export const DISABLE_VIDEOS   = !PROD || undefined
export const MOCK_IS_AUTHED   = false || undefined
export const MOCK_ENABLE_AUTH = false || undefined

export const TARGET    = 'public'
export const STATIC    = 'static'
export const TEMPLATES = 'templates'

export const SRV_OPTS = {port: PORT, hostname: 'localhost'}
export const AFR_OPTS = {port: 47692}

export const ID_MAIN = `main`
export const ID_TOP = `top`
