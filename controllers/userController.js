const User = require('../models/userModel')
const multer = require('multer')
const sharp = require('sharp')
const factory = require('./handlerFactory')

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    const error = new Error('Invalid file type. Only image files are allowed.')
    error.statusCode = 400
    error.data = {
      message: 'Invalid file type. Only image files are allowed.'
    }
    cb(error, false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = async (req, res, next) => {
 try {
   if (!req.file) return next()
 
   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
 
  await sharp(req.file.buffer)
     .resize(500, 500)
     .toFormat('jpeg')
     .jpeg({ quality: 90 })
     .toFile(`public/img/users/${req.file.filename}`)
 
   next()
 } catch (error) {
  console.log(error);
  return next()
 }
}

const filterdObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el]
    }
  })
  return newObj
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  console.log(req.user.id)
  console.log(req.params.id)
  next()
}

exports.updateMe = async (req, res, next) => {
  try {
    console.log(req.file)
    console.log(req.body)
    // Generate error if the user try's to POST password
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message:
          'This route is not for updating password. Please use /v1/users/updateMyPassword'
      })
    }

    const filterdBody = filterdObj(req.body, 'name', 'email')
    if (req.file) filterdBody.photo = req.file.filename

    // 2) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      status: 'success',
      user: updatedUser
    })
  } catch (error) {
    console.error(error)
    res.status(404).json({
      status: 'fail',
      message: error.message
    })
  }
}

exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })
  res.status(204).json({
    status: 'success',
    data: null
  })
}

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not gonna be implemented please use /signup instead'
  })
}

// Do not update password with this
exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
