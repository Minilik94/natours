const Review = require('../models/reviewModel')
const factory = require('./handlerFactory')

// exports.getAllReveiws = async (req, res) => {
//   try {
//     let filter = {}
//     if(req.params.tourId) filter = {tour: req.params.tourId}
//     const reveiws = await Review.find(filter)

//     res.status(200).json({
//       status: 'success',
//       results: reveiws.length,
//       reveiws
//     })
//   } catch (error) {
//     console.error(error)
//     res.status(404).json({
//       status: 'fail',
//       message: 'Could not find Reviews or Something is wrong'
//     })
//   }
// }

exports.setTourUserId = async(req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user.id
  next()
}

exports.getAllReveiws = factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.createReviews = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)