/** @jsx jsx */
import { jsx } from 'theme-ui'
import { useState } from 'react'
import { useInterval } from '../hooks/useInterval'

export default () => {
  const roles = [
    'web developer',
    'web designer',
    'ex-game developer',
    'future game developer',
    'wannabe software engineer',
  ]
  const [role, setRole] = useState(0)

  useInterval(() => {
    setRole(role < roles.length - 1 ? role + 1 : 0)
  }, 2000)

  return (
    <main sx={{
      m: 3, p: 3,
      border: '1px solid',
      borderColor: 'primary',
    }}>
      <h1>Nathan Knowler is a {roles[role]}.</h1>
    </main>
  )
}
