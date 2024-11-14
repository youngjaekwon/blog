import { errorMiddleware } from '@/middleware/error/error.middleware'
import apiRouter from '@/routes/app.routes'

var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// middleware
app.use(errorMiddleware)

// routes
app.use('/api', apiRouter)

module.exports = app

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
