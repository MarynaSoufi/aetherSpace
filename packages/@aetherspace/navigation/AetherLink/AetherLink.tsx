import React, { useMemo, forwardRef } from 'react'
import { Platform, Text } from 'react-native'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { Link as RouterLink, useRouter, usePathname, useNavigation } from 'expo-router'
// Types
import { AetherLinkType } from './AetherLink.types'
import { any$Todo } from '../../types/typeHelpers'
// Primitives
import { AetherPressable, AetherText } from '../../primitives'
// Utils
import { getBaseUrl, getEnvVar } from '../../utils'

/* --- useAetherNav() -------------------------------------------------------------------------- */

export const useAetherNav = () => {
  // Hooks
  const navigation = useNavigation()
  const router = useRouter()
  const pathname = usePathname()

  // Vars
  const APP_LINKS: string[] = useMemo(() => getEnvVar('APP_LINKS')?.split('|') || [], [])
  const [webDomain] = APP_LINKS.filter((link) => link.includes('://'))

  // -- Handlers --

  const getDestination = (path: string) => {
    // Convert to relative path?
    const internalDomainMatch = APP_LINKS.find((appUrl) => path.includes(appUrl))
    if (internalDomainMatch) return path.replace(`${internalDomainMatch}/`, '')
    // Remove leading slash?
    const hasLeadingSlash = path !== '/' && path[0] === '/'
    return hasLeadingSlash ? path.slice(1) : path
  }

  const openLink = (path: string, isBlank = false) => {
    const destination = getDestination(path)
    // Is this a mailto link?
    const isMailto = path.includes('mailto:')
    if (isMailto) return Linking.openURL(path)
    // Use Expo router for internal link?
    const hasProtocol = destination.slice(0, 5).includes('http')
    const isAPIRoute = destination.includes('api/') && !hasProtocol
    const isInternalLink = !hasProtocol && !isAPIRoute
    if (isInternalLink && !isBlank) return router.push(destination)
    // Open external links in new browser tab?
    const isWeb = Platform.OS === 'web'
    let webDestination = isInternalLink && !isWeb ? `${webDomain}${destination}` : path
    if (isAPIRoute) webDestination = `${getBaseUrl()}/${destination}` // Expo only
    const isBrowserEnv = isWeb && typeof window !== 'undefined' && !!window.open
    const openURL = isBrowserEnv ? (url: string) => window.open(url, '_blank') : Linking.openURL
    if (isBlank || isBrowserEnv) return openURL(webDestination) // "open in a new tab" or mobile browser
    WebBrowser.openBrowserAsync(webDestination) // Open external links in internal browser?
  }

  const goBack = () => navigation.goBack()

  // -- Return --

  return {
    pathname,
    webDomain,
    getDestination,
    openLink,
    goBack,
  }
}

/* --- <AetherLink/> --------------------------------------------------------------------------- */

const AetherLink = forwardRef<typeof RouterLink | typeof Text, AetherLinkType>((props, ref) => {
  // Props
  const { children, href, to, routeName, style, tw, twID, asText, ...restProps } = props
  const bindStyles = { style, tw, twID, ...restProps }

  // Hooks
  const { openLink, getDestination } = useAetherNav()
  const destination = getDestination((href || to || routeName)!)

  // Vars
  const isBlank = props.target === '_blank' || props.isBlank
  const isText = asText || props.isText || typeof children === 'string'
  const isEmailLink = destination.includes('mailto:')

  // -- Handler --

  const onLinkPress = () => openLink(destination, isBlank)

  // -- Render as Text --

  if (isText || isEmailLink) {
    return (
      <AetherText {...restProps} {...bindStyles} ref={ref as any$Todo} onPress={onLinkPress}>
        {children}
      </AetherText>
    )
  }

  // -- Render as View with Router Navigation --

  return (
    <RouterLink href={destination} asChild>
      <AetherPressable {...bindStyles}>{children}</AetherPressable>
    </RouterLink>
  )
})

AetherLink.displayName = 'AetherLink'

/* --- Exports --------------------------------------------------------------------------------- */

export default AetherLink
