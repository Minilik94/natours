const path = require('path')
const express = require('express')
const morgan = require('morgan') // morgan is logging middleware. That's gonna allow us to see request data in the console
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const csp = require('helmet-csp') // Import the helmet-csp package

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const viewRouter = require('./routes/viewRoutes')

// Start express app
const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')))
// Implement CORS
// app.use(cors())

// app.options('*', cors())
// app.options('/api/v1/tours/:id', cors());


// Set security HTTP headers
// app.use(helmet())
// app.use(
//   csp({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net','api.mapbox.com', 'blob:', 'https://js.stripe.com', 'unsafe-eval' ],
//       imgSrc: ["'self'", 'data:'],
//       frameSrc: ["'unsafe-eval'", 'https://js.stripe.com'],
//       workerSrc: ["'self'", 'blob:'],
//       connectSrc: ["'self'", 'api.mapbox.com', 'events.mapbox.com'],
//       styleSrc: ["'self'", "'unsafe-inline'", 'api.mapbox.com', 'cdn.jsdelivr.net'],
//     }
//   })
// )

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
})
app.use('/api', limiter)

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
)

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  // console.log(req.cookies);
  next()
})

// 3) ROUTES
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  })
})

module.exports = app
