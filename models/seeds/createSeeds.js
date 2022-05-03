const User = require('../user')
const Category = require('../category')
const Expense = require('../expense')

const users = require('./users.json').users
const categories = require('./categories.json').categories
const expenses = require('./expenses.json').expenses

const bcrypt = require('bcrypt')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const db = require('../../config/mongoose')

db.once('open', async () => {
  await Promise.all(
    categories.map(async category => {
      const { name, icon } = category

      // check duplicate data
      const repeatCategory = await Category.findOne({ name })
      if (!repeatCategory) {
        await Category.create({ name, icon })
      }
    })
  )
  console.log('created no duplicate "Category" database !')

  await Promise.all(
    users.map(async user => {
      const { name, email, password } = user

      // check duplicate data
      const repeatUser = await User.findOne({ email })
      if (!repeatUser) {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        await User.create({ name, email, password: hash })
      }
    })
  )
  console.log('created no duplicate "User" database !')

  await Promise.all(
    expenses.map(async expense => {
      // get the information from JSON file
      const { name, date, amount, user_id, category_id } = expense
      const category = categories.find(category => category.id === category_id)
      const user = users.find(user => user.id === user_id)

      // get the key attribute from JSON for database searching
      const userEmail = user.email
      const categoryName = category.name

      // searching User and Categort database
      const matchUser = await User.findOne({ email: userEmail }).lean()
      const userId = matchUser._id
      const matchCategory = await Category.findOne({
        name: categoryName,
      }).lean()
      const categoryId = matchCategory._id

      // check duplicate data
      const repeatExpense = await Expense.findOne({
        name,
        date,
        amount,
        userId,
        categoryId,
      })
      if (!repeatExpense) {
        await Expense.create({ name, date, amount, userId, categoryId })
      }
    })
  )
  console.log('created no duplicate "Expense" database !')
  process.exit()
})