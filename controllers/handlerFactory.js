const APIFeatures = require('../utils/apiFeatures')

exports.deleteOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return res.status(404).json({
        status: 'fail',
        message: 'doc not found'
      })
    }
    res.status(204).json({
      status: 'success',
      data: null
    })
  } catch (err) {
    return res.status(404).json({
      status: 'fail',
      message: err.message
    })
  }
}

exports.updateOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if (!doc) {
      res.status(404).json({
        status: 'fail',
        message: 'document not found'
      })
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    })
  }
}

exports.createOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    })
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      // message: 'Invalid data send',
      message: err.message
    })
  }
}

exports.getOne = (Model, popOptions) => async (req, res) => {
  try {
    console.log(req.user.id);
    let query = await Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return res.status(404).json({
        status: 'fail',
        message: 'document not found'
      })
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred'
    })
  }
}

exports.getAll = Model => async (req, res, next) => {
  try {
    let filter = {}
    if(req.params.tourId) filter = {tour: req.params.tourId}
    
    console.log(req.query)
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    // const doc = await features.query.explain()
    const doc = await features.query
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        doc
      }
    })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    })
  }
}
