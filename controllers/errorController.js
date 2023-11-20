/* eslint-disable no-self-assign */
module.exports = (err, req, res, next) => {
  // Log the error to the console for debugging purposes
  console.error(err.stack)

  // Set a default error status code if none was provided
  const statusCode = err.statusCode || 500

  // Set a default error message if none was provided
  const message = err.message || 'Internal Server Error'

  // Send the error response to the client
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  })
}
