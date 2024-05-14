require('dotenv').config()


const express = require('express')
const app = express()
const port = 9393
const db = require('./db/index.js')
const expressLayouts = require('express-ejs-layouts')
const homeRouter = require('./routes/home_router.js')
const dreamRouter = require('./routes/dream_router.js')



app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.urlencoded())

app.use(expressLayouts)

app.use(homeRouter)

app.use(dreamRouter)




app.listen(port, (req, res) => {
  console.log(`listening on port ${port}`)
})

