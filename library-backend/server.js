const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require("@apollo/server/standalone")
const typeDefs = require("./schema")
const resolvers = require("./resolvers")

const startServer = (port) => {
    const server = new ApolloServer({
        typeDefs,
        resolvers
    })

    startStandaloneServer(server, {
        listen: { port }
    }).then(({ url }) => {
        console.log(`Server ready at ${url}`)
    })
}

module.exports = startServer