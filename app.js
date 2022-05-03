const express = require('express')
const exphbs = require('express-handlebars')
const routes = require('./routes/index')
const session = require('express-session')
const usePassport = require('./config/passport')
const flash = require('connect-flash')
const methodOverride = require('method-override')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const port = process.env.PORT || 3000
require('./config/mongoose')

const hbs = exphbs.create({ defaultLayout: 'main', extname: 'hbs' })
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')

app.use(methodOverride('_method'))
app.use(
  session({
    secret: process.env.SESSION_SECRECT,
    resave: false,
    saveUninitialized: true,
  })
)
usePassport(app)

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(flash())
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  res.locals.success_msg = req.flash('success_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  next()
})
app.use(routes)

app.listen(port, () => {
  console.log(`The express server was started under localhost:${port}`)
})