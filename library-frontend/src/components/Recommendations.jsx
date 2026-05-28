import { useQuery } from '@apollo/client/react'
import { ME, ALL_BOOKS } from '../queries'

const Recommendations = (props) => {

    const meResult = useQuery(ME, {
        skip: !props.show
    })
    const favoriteGenre = meResult.data?.me?.favoriteGenre

    const booksResult = useQuery(ALL_BOOKS, {
        skip: !favoriteGenre || !props.show,
        variables: {
            genre: favoriteGenre
        }
    })

    if (!props.show) {
        return null
    }
    
    if (meResult.loading || booksResult.loading) {
        return <div>loading...</div>
    }
    return (
        <div>
            <h2>recommendations</h2>
            <p>books in your favorite genre: <strong>{favoriteGenre}</strong></p>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {booksResult.data?.allBooks.map((b) => (
                        <tr key={b.id}>
                            <td>{b.title}</td>
                            <td>{b.author.name}</td>
                            <td>{b.published}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Recommendations