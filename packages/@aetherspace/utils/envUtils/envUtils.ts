import { expoEnv, localURL } from '../../constants/manifest'

/* --- Constants ------------------------------------------------------------------------------- */

const __PUBLIC_ENV = '__PUBLIC_ENV'

/** --- getDebuggerURL() ----------------------------------------------------------------------- */
/** -i- Get the IP based URL with specified port where the Expo command is running from if local */
export const getDebuggerURL = (port?: number) => {
  if (!localURL) return null
  return `http://${[localURL, port].join(':')}`
}

/** --- getBaseUrl() --------------------------------------------------------------------------- */
/** -i- Get the base URL to contact out back-end with */
export const getBaseUrl = () => getDebuggerURL(3000) || getEnvVar('BACKEND_URL') || ''

/** --- setGlobal() ---------------------------------------------------------------------------- */
/** -i- Set a global variable on the "globalThis" object */
export const setGlobal = (key: any, val: any) => {
  globalThis[key] = val
}

/** --- getGlobal() ---------------------------------------------------------------------------- */
/** -i- Get a global variable on the "globalThis" object */
export const getGlobal = (key: any) => globalThis[key]

/** --- setPublicEnvVars() --------------------------------------------------------------------- */
/** -i- Set a series of global public env vars to enable retrieving them via getEnvVar() later
 ** You may want to do this in the top level _app.tsx / layout.tsx files due to @expo/next-adapter clearing process.env */
export const setPublicEnvVars = (publicEnvVars: { [key: string]: any }) => {
  setGlobal(__PUBLIC_ENV, { ...getGlobal(__PUBLIC_ENV), ...publicEnvVars })
}

/** --- getEnvVar() ---------------------------------------------------------------------------- */
/** -i- Get expo / next / public env var */
export const getEnvVar = (key: string): string => {
  const possibleKeys = [
    // Private env var, as exact matches only happen in node server environments
    key,
    // Public env var, needs prefix to hook into front-end next / expo env var system
    `NEXT_PUBLIC_${key}`,
    `EXPO_PUBLIC_${key}`,
    `EXPO_${key}`,
    `REACT_NATIVE_${key}`,
  ]
  const checkEnv = (k) => process.env[k] || expoEnv?.[k] || getGlobal(__PUBLIC_ENV)?.[k]
  return possibleKeys.map(checkEnv).find((envVar) => typeof envVar !== 'undefined')
}

/** --- getEnvList() --------------------------------------------------------------------------- */
/** -i- Get an env var, split on '|' and return as an array */
export const getEnvList = (key: string) => {
  const envList = getEnvVar(key)?.split?.('|') || []
  return envList as string[]
}
