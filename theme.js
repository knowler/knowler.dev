export const theme = {
  colors: {
    text: '#d2d4de',
    background: '#161821',
    primary: '#00d8af',
  },
  fonts: {
    sans: 'sans-serif',
  },
  styles: {
    root: {
      color: 'text',
      bg: 'background',
      fontFamily: 'sans',
      height: '100%',
      h1: {
        fontWeight: 300,
        marginTop: 0,
        marginBottom: 0,
      },
    },
  },
}

export const globalStyles = {
  '*, ::before, ::after': {
    boxSizing: 'inherit',
  },
  html: {
    boxSizing: 'borderBox',
  },
  body: {
    margin: 0,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
  },
}
