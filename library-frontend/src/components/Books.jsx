import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS } from '../queries'
import { useState } from 'react'

const Books = (props) => {
  const [filter, setFilter] = useState('')

  const allBooksResult = useQuery(ALL_BOOKS, {
    skip: !props.show
  })

  const filteredBooksResult = useQuery(ALL_BOOKS, {
    skip: !props.show || !filter,
    variables: {
      genre: filter
    }
  })
  
  if (!props.show) {
    return null
  }

  if (allBooksResult.loading || filteredBooksResult.loading) {
    return <div>loading...</div>
  }

  const allBooks = allBooksResult.data ? allBooksResult.data.allBooks : []
  const books = filter
    ? filteredBooksResult.data?.allBooks || []
    : allBooks

  const genres = allBooks.reduce((acc, book) => {
    book.genres.forEach(genre => {
      if (!acc.includes(genre)) {
        acc.push(genre)
      }
    })
    return acc
  }, [])

  return (
    <div>
      <h2>books</h2>
      {filter && <div>in genre {filter}</div>}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map(genre => (
        <button key={genre} onClick={() => setFilter(genre)}>
          {genre}
        </button>
      ))}
      <button onClick={() => setFilter('')}>all genres</button>
    </div>
  )
}

export default Books
