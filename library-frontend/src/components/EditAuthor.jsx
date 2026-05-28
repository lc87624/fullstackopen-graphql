import { useMutation } from '@apollo/client/react'
import { useState } from 'react'
import { EDIT_AUTHOR, ALL_AUTHORS } from '../queries'

const EditAuthor = ({ authors }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  const updateAuthor = () => {
    if (!name || !born) {
      return
    }
    editAuthor({ variables: { name, setBornTo: parseInt(born) } })
    setName('')
    setBorn('')
  }

  return (
    <div>
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

export default EditAuthor