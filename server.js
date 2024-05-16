require('dotenv').config()

const express = require('express')
const app = express()
const port = 9393
const db = require('./db/index.js')
const expressLayouts = require('express-ejs-layouts')
const homeRouter = require('./routes/home_router.js')
const dreamRouter = require('./routes/dream_router.js')
const session = require('express-session')
const sessionRouter = require('./routes/session_router.js')
const setCurrentUser = require('./middlewares/set_current_user.js')
const methodOverride = require('method-override')
const ensureLoggedIn = require('./middlewares/ensure_logged_in.js')


app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.urlencoded())

app.use(expressLayouts)

app.use(methodOverride('_method'))

app.use(express.static('public'))

app.use(session({
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 3},
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))

app.use(setCurrentUser)

app.use(sessionRouter)

app.use(homeRouter)

app.use(ensureLoggedIn)

app.use(dreamRouter)




app.listen(port, (req, res) => {
  console.log(`listening on port ${port}`)
})

