const Book = require("./models/book")
const Author = require("./models/author")
const User = require("./models/user")
const { GraphQLError } = require("graphql")
const jwt = require("jsonwebtoken")
const { PubSub } = require("graphql-subscriptions")

const pubsub = new PubSub()
const BOOK_ADDED = "BOOK_ADDED"

const resolvers = {
  Author: {
    bookCount: async (root) => {
      if (typeof root.bookCount === "number") {
        return root.bookCount
      }

      return Book.countDocuments({ author: root.id })
    }
  },
  Query: {
    bookCount: async () => await Book.countDocuments(),
    authorCount: async () => await Author.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        return await Book.find({}).populate("author")
      }
      let authorId = null
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) {
          return []
        }
        authorId = author.id
      }
      
      return await Book.find({
        ...(authorId && { author: authorId }),
        ...(args.genre && { genres: args.genre })
      }).populate("author")
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      const bookCounts = await Book.aggregate([
        {
          $group: {
            _id: "$author",
            count: { $sum: 1 }
          }
        }
      ])

      const countByAuthorId = bookCounts.reduce((counts, item) => {
        counts[item._id.toString()] = item.count
        return counts
      }, {})

      return authors.map(author => ({
        ...author.toObject(),
        id: author.id,
        bookCount: countByAuthorId[author.id] || 0
      }))
    },
    me: async (root, args, context) => {
      return context.currentUser
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator([BOOK_ADDED])
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        })
      }
      try {
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = await Author.create({ name: args.author, born: null })
        }
        const newBook = await Book.create({ ...args, author: author.id })
        const populatedBook = await newBook.populate("author")
        pubsub.publish(BOOK_ADDED, { bookAdded: populatedBook })
        return populatedBook
      } catch (error) {
        console.error(error)
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error
          }
        })
      }
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        })
      }
      try {
        return await Author.findOneAndUpdate(
          { name: args.name },
          { born: args.setBornTo },
          { returnDocument: 'after', runValidators: true }
        )
      } catch (error) {
        console.error(error)
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error
          }
        })
      }
    },
    createUser: async (root, args) => {
      try {
        return await User.create({ ...args })
      } catch (error) {
        console.error(error)
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error
          }
        })
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== "secret") {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }
      const userForToken = {
        username: user.username,
        id: user._id
      }
      const token = jwt.sign(userForToken, process.env.JWT_SECRET)
      return { value: token }
    },
    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== "test") {
        throw new GraphQLError("Not allowed in non-test environments", {
          extensions: {
            code: 'FORBIDDEN'
          }
        })
      }
      try {
        await Book.deleteMany({})
        await Author.deleteMany({})
        await User.deleteMany({})
        return true
      } catch (error) {
        console.error(error)
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            error
          }
        })
      }
    }
  }
}

module.exports = resolvers
