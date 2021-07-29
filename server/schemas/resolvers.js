const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
        if (context.user){
            const userdata = await User.findOne({_id: context.user._id}).select("-__v -password");
            return userdata
        }
        throw new AuthenticationError("not logged in")
    }
  },

  Mutation: {
    addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user)
        return {token, user}
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({email});

      if (!user){
        throw new AuthenticationError("no user with that email or password")
      }
      const correctpassword = await user.isCorrectPassword(password);

      if (!correctpassword){
        throw new AuthenticationError("incorrect password")
      }

      const token = signToken(user)
      return {token, user}
    },
    saveBook: async (parent, { bookdata }, context) => {
        if (context.user){
            const updateduser = await User.findOneAndUpdate({_id: context.user._id}, {$push: {savedBooks: {bookdata}}}, {new: true});

            return updateduser
        }
        throw new AuthenticationError("must log in")
    },
    removeBook: async (parent, { bookId }, context) => {
        if (context.user){
            const updateduser = await User.findOneAndUpdate({_id: context.user._id}, {$pull: {savedBooks: {bookId}}}, {new: true});

            return updateduser
        }
        throw new AuthenticationError("must log in")
    },
  },
};

module.exports = resolvers;
