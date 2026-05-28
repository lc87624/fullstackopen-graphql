import {useState} from 'react'
import { useMutation } from '@apollo/client/react'
import { LOGIN } from '../queries'

const LoginForm = ({ show, setToken }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)

  const [login] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const token = data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
      setErrorMessage(null)
      setUsername('')
      setPassword('')
    },
    onError: () => {
      setErrorMessage('login failed')
    }
  })

  if (!show) {
    return null
  }

  const onSubmit = (event) => {
    event.preventDefault()
    console.log('login...')
    login({ variables: { username, password } })
  }

  return (
    <div>
      {errorMessage && <div>{errorMessage}</div>}
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="username">username:</label>
          <input
            id="username"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
