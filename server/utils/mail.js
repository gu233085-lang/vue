import nodemailer from 'nodemailer'
import config from '../mail-config.js'

let transporter = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth
    })
  }
  return transporter
}

export async function sendVerificationCode(email, code) {
  const mailOptions = {
    from: config.from,
    to: email,
    subject: '超市管理系统 - 邮箱验证码',
    html: `
      <div style="font-family: Arial; padding: 20px; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #409EFF;">超市管理系统</h2>
        <p>您的验证码是：</p>
        <div style="background: #f5f7fa; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #303133;">${code}</span>
        </div>
        <p style="color: #909399; font-size: 13px;">验证码 2 分钟内有效，请勿泄露给他人。</p>
      </div>
    `
  }
  await getTransporter().sendMail(mailOptions)
}
