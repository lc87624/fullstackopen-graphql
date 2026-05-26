const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require("@apollo/server/standalone")
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

const startServer = (port) => {
    const server = new ApolloServer({
        typeDefs,
        resolvers
    })

    startStandaloneServer(server, {
        listen: { port },
        context: async ({ req }) => {
            const auth = req ? req.headers.authorization : null
            const currentUser = await getUserFromAuthHeader(auth)
            return { currentUser }
        }
    }).then(({ url }) => {
        console.log(`Server ready at ${url}`)
    })
}

module.exports = startServer