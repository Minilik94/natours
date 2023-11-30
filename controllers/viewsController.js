const User = require('../models/userModel')
const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')

exports.getOverview = async (req, res, next) => {
  try {
    // 1) Get tour data from collection
    const tours = await Tour.find()

    // 2) Build template
    // 3) Render that template using tour data from 1)
    res
      .status(200)
      .render('overview', {
        title: 'All Tours',
        tours
      })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    })
  }
}

exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user'
    })
    res
      .status(200)
      // .set('Content-Security-Policy', "default-src 'self' https://api.mapbox.com; worker-src 'self' blob:;")
      .render('tour', {
        title: `${tour.name} Tour`,
        tour
      })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    })
  }
}

exports.getLoginForm = async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  })
}

exports.getAccount = async (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  })
}

exports.getMyTours = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })

    const tourIDs = bookings.map(el => el.tour)
    const tours = await Tour.find({ _id: { $in: tourIDs } })

    res
      .status(200)
      .render('overview', {
        title: 'My Tours',
        tours
      })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    })
  }
}

exports.updateUserData = async (req, res, next) => {
  try {
    const updateUser = await User.findByIdAndUpdate(req.user.id, {
      name: req.body.name,
      email: req.body.email
    }, {
      new: true,
      runValidators: true
    })

    res.status(200).render('account', {
      title: 'Your account',
      user: updateUser
    })

  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    })
  }
}
