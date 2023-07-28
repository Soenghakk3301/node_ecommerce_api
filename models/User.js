const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide email',
    },
  },
  password: {
    type: String,
    minlength: 6,
    required: [true, 'Please provide email'],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
})

userSchema.pre('save', async function () {
  const genSalt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, genSalt)
})

userSchema.methods.comparePassword = async function (cadidatedPassword) {
  const isMatch = await bcrypt.compare(cadidatedPassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', userSchema)
