const passport = require('passport')
const User = require('../models/user')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const bcrypt = require('bcrypt')

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())

  passport.serializeUser((user, done) => {
    return done(null, user._id)
  })

  passport.deserializeUser(async (_id, done) => {
    const user = await User.findById(_id).lean()
    if (user) return done(null, user)
  })

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        const user = await User.findOne({ email })
        if (!user) {
          return done(null, false, {
            type: 'warning_msg',
            message: `帳號 ${email} 還未註冊!`,
          })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
          return done(null, false, {
            type: 'warning_msg',
            message: `帳號 ${email} 或密碼錯誤！`,
          })
        }
        return done(null, user)
      }
    )
  )

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRECT,
        callbackURL: process.env.FACEBOOK_CALLBACK,
        profileFields: ['email', 'displayName'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { name, email } = profile._json
          let user = await User.findOne({ email })
          if (user) return done(null, user)

          const randomPassword = Math.random().toString(36).slice(-8)
          const salt = await bcrypt.genSalt(10)
          const hash = await bcrypt.hash(randomPassword, salt)
          // for new user creation
          user = await User.create({
            name,
            email,
            password: hash,
          })
          return done(null, user)
        } catch (err) {
          return done(null, false)
        }
      }
    )
  )

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRECT,
        callbackURL: process.env.GOOGLE_CALLBACK,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { name, email } = profile._json
          const user = await User.findOne({ email })
          if (user) return done(null, user)

          const randomPassword = Math.random().toString(36).slice(-8)
          const salt = await bcrypt.genSalt(10)
          const hash = await bcrypt.hash(randomPassword, salt)
          // for new user creation

          user = await User.create({
            name,
            email,
            password: hash,
          })
          return done(null, user)
        } catch (err) {
          return done(null, false)
        }
      }
    )
  )
}