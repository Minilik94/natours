/* eslint-disable  */
const multer = require('multer')
const sharp = require('sharp')
const Tour = require('../models/tourModel')
// const APIFeatures = require('../utils/apiFeatures')
const factory = require('./handlerFactory')

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

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
])

// upload.single('photo')
// upload.array('images', 5)

exports.resizeTourImages = async (req, res, next) => {
  try {
    if (!req.files.imageCover || !req.files.images) return next()

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}.cover.jpeg`

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`)

    req.body.images = []
    console.log(req.files.images);

   await Promise.all(req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`)

      req.body.images.push(filename)
    }))


    next()
  } catch (error) {
    console.log(error)
    return next()
  }
}

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingAverage, price'
  req.query.fields = 'name, ratingAverage,price ,difficulty ,summary'

  next()
}

// exports.getAllTours = async (req, res) => {
//   try {
//     console.log(req.query)

//     // BUILD A QUERY
//     // 1A) FILTERING
//     // const queryObj = { ...req.query };
//     // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     // excludedFields.forEach((el) => delete queryObj[el]);

//     // // 1B)  ADVANCED FILTERING
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     // // console.log(JSON.parse(queryStr));
//     // let query = Tour.find(JSON.parse(queryStr));

//     // 2) SORTING
//     // if (req.query.sort) {
//     //   const sortBy = req.query.sort.split(',').join(' ');
//     //   console.log(sortBy);
//     //   query = query.sort(sortBy);
//     // } else {
//     //   query = query.sort('-createdAt');
//     // }

//     // 3) Fields
//     // if (req.query.fields) {
//     //   const fields = req.query.fields.split(',').join(' ');
//     //   query = query.select(fields);
//     // } else {
//     //   query = query.select('-__v');
//     // }

//     // 4) Pagnation for node js
//     // const page = req.query.page * 1 || 1;
//     // const limit = req.query.limit * 1 || 100;
//     // const skip = (page - 1) * limit;

//     // query = query.skip(skip).limit(limit);

//     // if (req.query.page) {
//     //   const numPage = await Tour.countDocuments();

//     //   if (skip >= numPage) throw new Error('This page does not exist');
//     // }

//     // EXECUTE A QUERY
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate()
//     const tours = await features.query
//     // query.sort().select().skip().limit()

//     // const query =  Tour.find()
//     //   .where('duration')
//     //   .equals(5)
//     //   .where('difficulty')
//     //   .equals('easy')

//     // SEND RESPONSE
//     res.status(200).json({
//       status: 'success',
//       result: tours.length,
//       data: {
//         tours
//       }
//     })
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err.message
//     })
//   }
// }

// const id = req.params.id * 1;
// const tour = tours.find((el) => el.id === id);
// if (id > tours.length) {
//   //   if (!tour) {
//   res.status(404).json({
//     status: 'fail',
//     message: 'Invalid id',
//   });
// }

// res.status(200).json({
//   status: 'success',
//   data: {
//     tour,
//   },
// });

// exports.createTour = async (req, res) => {
//   try {
//     const newTour = await Tour.create(req.body)
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour
//       }
//     })
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       // message: 'Invalid data send',
//       message: err.message
//     })
//   }
// }

// exports.updateTour = async (req, res) => {
//   // if (req.params.id * 1 > tours.length) {
//   //   return res.status(404).json({
//   //     status: 'fail',
//   //     message: 'Invalid Id',
//   //   });
//   // }
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     })

//     if (!tour) {
//       res.status(404).json({
//         status: 'fail',
//         message: 'Tour not found'
//       })
//     }
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour
//       }
//     })
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err.message
//     })
//   }
// }

exports.getAllTours = factory.getAll(Tour)
exports.getTour = factory.getOne(Tour, { path: 'reviews' })
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)

// exports.deleteTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndDelete(req.params.id)

//     if (!tour) {
//       res.status(404).json({
//         status: 'fail',
//         message: 'Tour not found'
//       })
//     }
//     res.status(204).json({
//       status: 'success',
//       data: null
//     })
//   } catch (err) {
//     res.status(404).json({
//       status: 'fail',
//       message: err.message
//     })
//   }
// }

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRating: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      { $sort: { avgPrice: 1 } }
      //  {
      //   $match: { _id: { $ne: 'EASY'}}
      //  }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    })
  }
}

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1 // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: { numTourStarts: -1 }
      },
      {
        $limit: 12
      }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    })
  }
}

exports.getToursWithin = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Please provide latitude and longtuide in the format of lat, lng'
      })
    }

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })

    console.log(distance, lat, lng, unit)

    res.status(200).json({
      status: true,
      results: tours.length,
      data: {
        tours
      }
    })
  } catch (error) {
    console.error(error)
    res.status(404).json({
      status: false,
      message: error.message
    })
  }
}

exports.getDistances = async (req, res, next) => {
  try {
    const { latlng, unit } = req.params

    const [lat, lng] = latlng.split(',')

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001

    if (!lat || !lng) {
      return res.status(400).json({
        status: 'fail',
        message:
          'Please provide latitude and longtuide in the format of lat, lng'
      })
    }

    const distance = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ])

    res.status(200).json({
      status: true,
      data: {
        distance
      }
    })
  } catch (error) {
    console.error(error)
    res.status(404).json({
      status: false,
      message: error.message
    })
  }
}
