import { ALL_AUTHORS } from '../queries'
import { useQuery, useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { EDIT_AUTHOR } from '../queries'

const Authors = (props) => {

  const result = useQuery(ALL_AUTHORS, {
    skip: !props.show
  })

  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  const updateAuthor = () => {
    editAuthor({ variables: { name, setBornTo: parseInt(born) } })
    setName('')
    setBorn('')
  }
  
  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }
  const authors = result.data ? result.data.allAuthors : []

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <div>
        <label htmlFor="name">name</label>
        <select id="name" value={name} onChange={({ target }) => setName(target.value)}>
          <option value="">select author</option>
          {authors.map((a) => (
            <option key={a.id} value={a.name}>{a.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="born">born</label>
        <input
          id="born"
          value={born}
          onChange={({ target }) => setBorn(target.value)}
        />
      </div>
      <button onClick={updateAuthor}>update author</button>
    </div>
  )
}

export default Authors
