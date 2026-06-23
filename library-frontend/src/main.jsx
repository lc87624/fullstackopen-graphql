import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { ApolloProvider } from '@apollo/client/react'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

const defaultHttpUrl = 'http://localhost:4000'
const defaultWsUrl = 'ws://localhost:4000'
const httpUrl = import.meta.env.VITE_GRAPHQL_HTTP_URL || defaultHttpUrl
const wsUrl =
  import.meta.env.VITE_GRAPHQL_WS_URL ||
  (httpUrl.startsWith('/')
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}${httpUrl}`
    : defaultWsUrl)

const authLink = new SetContextLink((_, { headers }) => {
  const token = localStorage.getItem('library-user-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    }
  }
})

const httpLink = new HttpLink({
  uri: httpUrl,
})

const wsLink = new GraphQLWsLink(createClient({
  url: wsUrl,
}))

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
})

createRoot(document.getElementById('root')).render(
  <ApolloProvider client={client}>
    <StrictMode>
      <App />
    </StrictMode>
  </ApolloProvider>
)
