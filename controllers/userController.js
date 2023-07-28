const { StatusCodes } = require('http-status-codes')
const { CustomError } = require('../errors')
const User = require('../models/User')
const { createUserToken, attachCookiesToResponse } = require('../utils')
const checkPermission = require('../utils/checkPermission')

const getAllUsers = async (req, res) => {
  console.log(req.user.role)
  const users = await User.find({ role: 'user' }).select('-password')
  res.status(StatusCodes.OK).json({ data: users })
}
const getSingleUser = async (req, res) => {
  const { id: userId } = req.params
  const user = await User.findById({ _id: userId }).select('-password')

  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`)
  }

  checkPermission(req.user, user._id)

  res.status(StatusCodes.OK).json({ data: user })
}
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user })
}
const updateUser = async (req, res) => {
  const { email, name } = req.body

  if (!email || !name) {
    throw new CustomError.BadRequestError('Please provide all values')
  }

  const user = await User.findByIdAndUpdate(
    { _id: req.user.userId },
    { email, name },
    { new: true, runValidators: true }
  )

  const tokenUser = createUserToken(user)
  attachCookiesToResponse({ res, user: tokenUser })
  res.status(StatusCodes.OK).json({ user: tokenUser })
}
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values.')
  }

  const user = await User.findById({ _id: req.user.userId })

  const isPasswordMatch = await user.comparePassword(oldPassword)

  if (!isPasswordMatch) {
    throw new CustomError.UnauthenticatedError('Invalid Credentails.')
  }

  user.password = newPassword
  user.save()

  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' })
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}
