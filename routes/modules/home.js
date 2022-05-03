const express = require('express')
const router = express.Router()
const Expense = require('../../models/expense')
const Category = require('../../models/category')

router.get('/', async (req, res) => {
  const userId = req.user._id
  const { categoryId } = req.query
  const categories = await Category.find().lean()
  let expenses = []
  let totalAmount = 0

  if (categoryId) {
    const category = categories.find(category => {
      if (category._id.toString() === categoryId) {
        category.selected = 'selected'
        return category
      }
    })
    expenses = await Expense.find({ userId, categoryId })
      .populate('categoryId', { icon: 1 })
      .lean()
      .sort({ date: -1 })
  } else {
    expenses = await Expense.find({ userId })
      .populate('categoryId', { icon: 1 })
      .lean()
      .sort({ date: -1 })
  }
  expenses.forEach((expense, expenseIndex) => {
    totalAmount += Number(expense.amount)
    expense.bgColor = expenseIndex % 2 === 0 ? '#adb5bd' : ''
  })
  res.render('index', { expenses, categories, totalAmount })
})

module.exports = router