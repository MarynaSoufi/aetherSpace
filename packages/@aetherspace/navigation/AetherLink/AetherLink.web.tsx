// @ts-ignore
import React, { useMemo, forwardRef } from 'react'
import { Platform, Text } from 'react-native'
import NextLink from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
// Types
import { AetherLinkType } from './AetherLink.types'
import { any$Todo } from '../../types/typeHelpers'
// Primitives
import { AetherView, AetherText } from '../../primitives'
// Utils
import { getEnvVar } from '../../utils'

/* --- Styles ---------------------------------------------------------------------------------- */

const linkResetStyles = {
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
}

/* --- useAetherNav() -------------------------------------------------------------------------- */

export const useAetherNav = () => {
  // Hooks
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
    const hasLeadingSlash = path !== '/' && path?.[0] === '/'
    return hasLeadingSlash ? path.slice(1) : path
  }

  const openLink = (path: string, isBlank = false) => {
    const destination = getDestination(path)
    // Use Next.js app dir router for internal link?
    const hasProtocol = destination.slice(0, 5).includes('http')
    const isAPIRoute = destination.includes('api/') && !hasProtocol
    const isInternalLink = !hasProtocol && !isAPIRoute
    if (isInternalLink && !isBlank) return router.push(destination)
    // Open external links in new tab?
    const isWeb = Platform.OS === 'web'
    const webDestination = isInternalLink && !isWeb ? `${webDomain}${destination}` : path
    const isBrowserEnv = isWeb && typeof window !== 'undefined' && !!window.open
    const openURL = isBrowserEnv ? (url: string) => window.open(url, '_blank') : Linking.openURL
    if (isBlank || isBrowserEnv) return openURL(webDestination) // "open in a new tab" or mobile browser
    WebBrowser.openBrowserAsync(webDestination) // Open external links in internal browser?
  }

  const goBack = () => router.back()

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

const AetherLink = forwardRef<typeof Text | typeof Text, AetherLinkType>((props, ref) => {
  // Props
  const { children, href, to, routeName, style, tw, twID, asText, ...restProps } = props
  const bindStyles = { style, tw, twID, ...restProps }

  // Hooks
  const { openLink, getDestination } = useAetherNav()
  const destination = getDestination((href || to || routeName)!)

  // Vars
  const isBlank = props.target === '_blank' || props.isBlank
  const isText = asText || props.isText || typeof children === 'string'
  const isExternal = destination.includes('://') || destination.includes('api/')

  // -- Handler --

  const onLinkPress = (e: any) => {
    e?.preventDefault?.() // Stop regular propagation
    openLink(destination, isBlank)
  }

  // -- Render as Web link --

  if (isExternal) {
    return isText ? (
      <AetherText {...restProps} {...bindStyles} ref={ref as any$Todo} onPress={onLinkPress}>
        <a href={destination} target="_blank" rel="noreferrer" style={linkResetStyles}>
          {children}
        </a>
      </AetherText>
    ) : (
      <a href={destination} target="_blank" rel="noreferrer" style={linkResetStyles}>
        <AetherView {...bindStyles}>{children}</AetherView>
      </a>
    )
  }

  // -- Render as Text --

  if (isText) {
    return (
      <AetherText {...restProps} {...bindStyles} ref={ref as any$Todo} onPress={onLinkPress}>
        <NextLink href={destination} style={linkResetStyles}>
          {children}
        </NextLink>
      </AetherText>
    )
  }

  // -- Render as View wrapped with Next Link --

  return (
    <NextLink href={destination} style={linkResetStyles}>
      <AetherView {...bindStyles}>{children}</AetherView>
    </NextLink>
  )
})

AetherLink.displayName = 'AetherLink'

/* --- Exports --------------------------------------------------------------------------------- */

export default AetherLink
