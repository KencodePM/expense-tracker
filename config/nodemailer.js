const nodemailer = require('nodemailer')

module.exports = async userEmail => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    })

    // email content
    const emailContent = {
      from: process.env.NODEMAILER_USER, // sender address
      to: userEmail, // list of receivers
      subject: '記帳本忘記密碼', // Subject line
      text: 'Hello world?', // plain text body
      html: `<b>Hello world?</b>`, // html body
    }

    // send mail with defined transport object
    let info = await transporter.sendMail(emailContent)
    console.log(info.messageId)
  } catch (err) {
    console.log(err)
  }
}