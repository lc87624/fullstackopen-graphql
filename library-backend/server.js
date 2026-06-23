const { createServer } = require("http")
const express = require("express")
const cors = require("cors")
const { WebSocketServer } = require("ws")
const { useServer } = require("graphql-ws/use/ws")
const { makeExecutableSchema } = require("@graphql-tools/schema")
const { ApolloServer } = require("@apollo/server")
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer")
const { expressMiddleware } = require("@as-integrations/express5")
const typeDefs = require("./schema")
const resolvers = require("./resolvers")
const User = require("./models/user")
const jwt = require("jsonwebtoken")

const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return null
  }

  const token = auth.substring(7)
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
  return User.findById(decodedToken.id)
}

const startServer = async (port) => {
  const graphqlPath = process.env.GRAPHQL_PATH || "/"
  const app = express()
  const httpServer = createServer(app)
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: graphqlPath
  })

  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            }
          }
        }
      }
    ]
  })

  await server.start()

  app.use(
    graphqlPath,
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        const currentUser = await getUserFromAuthHeader(auth)
        return { currentUser }
      }
    })
  )

  httpServer.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}${graphqlPath}`)
    console.log(`Subscriptions ready at ws://localhost:${port}${graphqlPath}`)
  })
}

module.exports = startServer
