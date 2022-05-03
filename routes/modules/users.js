const express = require('express')
const passport = require('passport')
const router = express.Router()
const User = require('../../models/user')
const bcrypt = require('bcrypt')
const { authenticator } = require('../../middleware/auth')
const nodemailer = require('../../config/nodemailer')

router.get('/login', (req, res) => {
  res.render('login')
})

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true, // connect-flash
  })
)

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body
  const errors = []
  if (password !== confirmPassword) {
    errors.push({ message: '密碼與確認密碼不符 !' })
    return res.render('register', {
      errors,
      name,
      email,
      password,
      confirmPassword,
    })
  }

  const user = await User.findOne({ email })
  if (user) {
    errors.push({ message: '這個 email 已經被註冊過了 !' })
    return res.render('register', {
      errors,
      name,
      email,
      password,
      confirmPassword,
    })
  } else {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    await User.create({ name, email, password: hash })
  }
  res.redirect('/users/login')
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', '你已經成功登出。')
  res.redirect('/users/login')
})

router.get('/changePassword', authenticator, (req, res) => {
  res.render('changePassword')
})

router.put('/changePassword', authenticator, async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body
  const errors = []
  if (oldPassword === newPassword) {
    errors.push({ message: '新密碼不能與舊密碼相同 !' })
    return res.render('changePassword', {
      errors,
      oldPassword,
      newPassword,
      confirmNewPassword,
    })
  }
  if (newPassword !== confirmNewPassword) {
    errors.push({ message: '新密碼與與新確認密碼不符 !' })
    return res.render('changePassword', {
      errors,
      oldPassword,
      newPassword,
      confirmNewPassword,
    })
  }

  const userId = req.user._id
  const user = await User.findOne({ _id: userId })
  const isMatch = await bcrypt.compare(oldPassword, user.password)
  if (!isMatch) {
    errors.push({ message: '舊密碼不正確 !' })
    return res.render('changePassword', {
      errors,
      oldPassword,
      newPassword,
      confirmNewPassword,
    })
  }

  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(newPassword, salt)
  await User.findOneAndUpdate({ _id: userId }, { password: hash }) // update password
  req.logout()
  req.flash('success_msg', '密碼更換成功，請重新登入後再使用！')
  res.redirect('/users/login')
})

router.get('/forgetPassword', (req, res) => {
  res.render('forgetPassword')
})

router.post('/forgetPassword', (req, res) => {
  const { email } = req.body
  console.log(email)
  nodemailer(email)
  res.redirect('/users/login')
})

module.exports = router