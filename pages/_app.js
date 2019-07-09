import React from 'react'
import App, { Container } from 'next/app'
import { ThemeProvider, Styled } from 'theme-ui'
import { Global } from '@emotion/core'
import { globalStyles, theme } from '../theme'

export default class extends App {
  render() {
    const { Component, pageProps } = this.props

    return (
      <Container>
        <Global styles={globalStyles} />
        <ThemeProvider theme={theme}>
          <Styled.root>
            <Component {...pageProps} />
          </Styled.root>
        </ThemeProvider>
      </Container>
    )
  }
}
