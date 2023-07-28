const { StatusCodes } = require('http-status-codes')
const User = require('../models/User')
const CustomError = require('../errors')
const {
  createJWT,
  attachCookiesToResponse,
  createUserToken,
} = require('../utils')

const register = async (req, res) => {
  const { email, name, password } = req.body

  const emailAlreadyExists = await User.findOne({ email })
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email Already Exists!')
  }

  // is first acc
  const isFirstAcc = (await User.countDocuments({})) === 0
  const role = isFirstAcc ? 'admin' : 'user'

  const user = await User.create({ email, name, role, password })
  const userToken = createUserToken(user)
  attachCookiesToResponse({ res, user: userToken })

  res.status(StatusCodes.CREATED).json({ user: userToken })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password!')
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentails!')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentails!')
  }
  const userToken = { name: user.name, userId: user._id, role: user.role }
  attachCookiesToResponse({ res, user: userToken })

  res.status(StatusCodes.OK).json({ user: userToken })
}

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  res.status(StatusCodes.OK).json({ msg: 'User logged out!!!' })
}

module.exports = {
  register,
  login,
  logout,
}
