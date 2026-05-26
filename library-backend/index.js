require('dotenv').config()
const { connectToDatabase } = require('./db')
const startServer = require('./server')

const main = async () => {
  const MONGODB_URI = process.env.MONGODB_URI
  await connectToDatabase(MONGODB_URI)

  const PORT = process.env.PORT || 4000
  startServer(PORT)
}

main()