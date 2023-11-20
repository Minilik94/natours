const { promisify } = require('util')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const Email = require('../utils/email')


const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
  res.cookie('jwt', token, cookieOptions)

  user.password = undefined
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  })
}

exports.signUp = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role
    })

    const url = `${req.protocol}://${req.get('host')}/me`
    await new Email(newUser, url).sendWelcome()

    createSendToken(newUser, 201, res)
    // const token = signToken(newUser._id)

    // res.status(201).json({
    //   status: 'success',
    //   token,
    //   data: {
    //     user: newUser
    //   }
    // })
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    console.log(email, password)

    // 1) Check if email and pass exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      })
    }
    // 2) Check if user exists & pass is correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      })
    }

    // 3) If everything is okay , send token to client
    createSendToken(user, 200, res)

    // const token = signToken(user._id)
    // res.status(200).json({
    //   status: 'success',
    //   token
    // })
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    })
  }
}

exports.logout = async (req, res, next) => {
  try {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    })

    res.status(200).json({
      status: true
    })
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    })
  }
}

exports.protect = async (req, res, next) => {
  try {
    // 1) Check if the token exist
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt
    }

    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'You are not logged in, Please login to get access'
      })
    }

    // 2) Verfication token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // console.log(decoded);

    // 3) Check if the user still exist
    const currentUser = await User.findById(decoded.id)

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist'
      })
    }

    // 4) Check if the user changed the password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password, please login again!'
      })
    }

    // GRANT ACCECSS TO PROTECTED ROUTE
    req.user = currentUser
    res.locals.user = currentUser

    next()
  } catch (error) {
    console.error(error)
    // if (
    //   process.env.NODE_ENV === 'production' &&
    //   error.name === 'JsonWebTokenError'
    // ) {
    //   return res.status(401).json({
    //     status: 'fail',
    //     message: 'Invalid token, Please login again'
    //   })
    // }

    // if (
    //   process.env.NODE_ENV === 'production' &&
    //   error.name === 'TokenExpiredError'
    // ) {
    //   return res.status(401).json({
    //     status: 'fail',
    //     message: 'You token has expired, Please login again'
    //   })
    // }

    return res.status(404).json({
      status: 'fail',
      message: `This next Error is Coming from the protect middleware: ${error.message}`
    })
  }
}

// only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      //  verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      )
      console.log(decoded)

      // 2) Check if the user still exist
      const currentUser = await User.findById(decoded.id)
      if (!currentUser) {
        return next()
      }

      // 4) Check if the user changed the password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next()
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser
    }
    next()
  } catch (error) {
    console.error('Error during JWT verification:', error)
    next() // Proceed to the next middleware or route handler
  }
}

// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      })
    }
    next()
  }
}

exports.fogotPassword = async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'There is no user with the email'
    })
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // 3) Send it to the users email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`

  const message = `Fogot your password Submit a patch request with a new password and passwordConfirm to: ${resetUrl}\nIf you didn't forgot you password,Please ignore this email`

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: `Your password reset token( valid for 10min)`,
    //   message
    // })

    await new Email(user, resetUrl).sendPasswordReset()

    return res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    return next(
      res.status(500).json({
        status: 'fail',
        message: 'There was an error when sending email, please try again later'
      })
    )
  }
}
exports.resetPassword = async (req, res, next) => {
  try {
    // Get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or expired'
      })
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // 2) Log the user in
    createSendToken(user, 200, res)

    // const token = signToken(user._id)
    // res.status(200).json({
    //   status: 'success',
    //   token
    // })
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    })
  }
}

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get the user from the collection
    const user = await User.findById(req.user.id).select('+password')
    // 2) Check if posted current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Your Current password is wrong'
      })
    }

    // 3) Update the password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()

    // 4) login the user
    createSendToken(user, 200, res)
  } catch (error) {
    return res.status(404).json({
      status: 'fail',
      message: error.message
    })
  }
  next()
}
