const Book = require("./models/book")
const Author = require("./models/author")
const { GraphQLError } = require("graphql")

const resolvers = {
  Author: {
    bookCount: async (root) => {
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
    allAuthors: async () => await Author.find({})
  },
  Mutation: {
    addBook: async (root, args) => {
      try {
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = await Author.create({ name: args.author, born: null })
        }
        const newBook = await Book.create({ ...args, author: author.id })
        return newBook.populate("author")
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
    editAuthor: async (root, args) => {
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
    }
  }
}

module.exports = resolvers