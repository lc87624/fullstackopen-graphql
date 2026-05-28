import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { useApolloClient, useSubscription } from '@apollo/client/react'
import { BOOK_ADDED } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [ token, setToken ] = useState(localStorage.getItem('library-user-token'))
  const [notification, setNotification] = useState(null)
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data?.bookAdded

      if (addedBook) {
        setNotification(`New book added: ${addedBook.title}`)
        setTimeout(() => {
          setNotification(null)
        }, 5000)
      }

      client.refetchQueries({ include: ['allBooks'] })
    }
  })

  const logout = () => {
    setToken(null)
    setPage('authors')
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      {notification && <div>{notification}</div>}

      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        { !token && <button onClick={() => setPage('login')}>login</button> }
        { token && <button onClick={() => setPage('add')}>add book</button> }
        { token && <button onClick={() => setPage('recommendations')}>recommend</button> }
        { token && <button onClick={logout}>logout</button> }
      </div>

      <Authors show={page === 'authors'} token={token} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <Recommendations show={page === 'recommendations'} />

      <LoginForm show={page === 'login'} setToken={setToken} setPage={setPage} />
      
    </div>
  )
}

export default App
