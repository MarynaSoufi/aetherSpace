/* eslint-disable @next/next/no-document-import-in-page */
// -i- Based on https://github.com/expo/expo-cli/blob/master/packages/next-adapter/document.js
import React from 'react'
import { AppRegistry } from 'react-native'
import NextDocument, { Head, Html, Main, NextScript, DocumentContext } from 'next/document'
// Styles
import { getInjectableMediaQueries } from './styles'

/* --- Styles ---------------------------------------------------------------------------------- */

export const cssReset = `
/**
 * Building on the RNWeb reset:
 * https://github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/exports/StyleSheet/initialRules.js
 */
html, body, #__next {
  width: 100%;
  /* To smooth any scrolling behavior */
  -webkit-overflow-scrolling: touch;
  margin: 0px;
  padding: 0px;
  /* Allows content to fill the viewport and go beyond the bottom */
  min-height: 100%;
}
#__next {
  flex-shrink: 0;
  flex-basis: auto;
  flex-direction: column;
  flex-grow: 1;
  display: flex;
  flex: 1;
}
html {
  scroll-behavior: smooth;
  /* Prevent text size change on orientation change https://gist.github.com/tfausak/2222823#file-ios-8-web-app-html-L138 */
  -webkit-text-size-adjust: 100%;
  height: 100%;
}
body {
  display: flex;
  /* Allows you to scroll below the viewport; default value is visible */
  overflow-y: auto;
  overscroll-behavior-y: none;
  font-family: -apple-system, system, Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -ms-overflow-style: scrollbar;
}
`

/* --- Initial Props --------------------------------------------------------------------------- */

export const getInitialProps = async (ctx: DocumentContext) => {
  // React Native Styling
  AppRegistry.registerComponent('Main', () => Main)
  const initialProps = await ctx.defaultGetInitialProps(ctx) // @ts-ignore
  const { getStyleElement } = AppRegistry.getApplication('Main')
  // Render to HTML & collect styles
  const page = await ctx.renderPage()
  // Aetherspace SSR Media Queries
  const aetherQueries = getInjectableMediaQueries()
  // List all styles
  const styles = (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssReset }} />
      <style type="text/css" dangerouslySetInnerHTML={{ __html: aetherQueries.css }} />
      {getStyleElement()}
    </>
  )
  // Return initialProps + Styles
  return { ...page, ...initialProps, styles }
}

/* --- <Document/> ----------------------------------------------------------------------------- */

class Document extends NextDocument {
  render() {
    return (
      <Html suppressHydrationWarning>
        <Head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          {/* iOS PWA fixes */}
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

Document.getInitialProps = getInitialProps

/* --- Exports --------------------------------------------------------------------------------- */

export default Document
