export const theme = {
  colors: {
    text: '#fff',
    background: '#161821',
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
  },
}
