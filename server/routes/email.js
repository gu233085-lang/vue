import { Router } from 'express'
import pool from '../db.js'
import { sendVerificationCode } from '../utils/mail.js'

const router = Router()

function genCode() {
  return String(Math.floor(10000 + Math.random() * 90000))
}

// Send verification code
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: '请输入有效的邮箱地址' })
    }

    // Check email binding limit (max 3)
    const [users] = await pool.query('SELECT COUNT(*) as cnt FROM users WHERE email = ?', [email])
    if (users[0].cnt >= 3) {
      return res.status(400).json({ error: '该邮箱已绑定3个账号，无法继续注册' })
    }

    // Remove expired codes for this email
    await pool.query('DELETE FROM verification_codes WHERE email = ? AND expires_at < NOW()', [email])

    // Check cooldown: last code sent within 60s
    const [recent] = await pool.query(
      'SELECT created_at FROM verification_codes WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)',
      [email]
    )
    if (recent.length > 0) {
      return res.status(400).json({ error: '请60秒后再重新发送验证码' })
    }

    const code = genCode()

    await pool.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE))',
      [email, code]
    )

    await sendVerificationCode(email, code)
    res.json({ ok: true, message: '验证码已发送' })
  } catch (err) {
    console.error('Send code error:', err)
    res.status(500).json({ error: '验证码发送失败，请检查邮箱配置或稍后重试' })
  }
})

// Send reset password code
router.post('/send-reset-code', async (req, res) => {
  try {
    const { username, email } = req.body
    if (!username || !email) {
      return res.status(400).json({ error: '用户名和邮箱不能为空' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: '请输入有效的邮箱地址' })
    }

    const [userByName] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
    if (userByName.length === 0) {
      return res.status(400).json({ error: '用户名信息错误' })
    }
    const [userByEmail] = await pool.query('SELECT id FROM users WHERE username = ? AND email = ?', [username, email])
    if (userByEmail.length === 0) {
      return res.status(400).json({ error: '邮箱信息错误' })
    }

    await pool.query('DELETE FROM verification_codes WHERE email = ? AND expires_at < NOW()', [email])

    const [recent] = await pool.query(
      'SELECT created_at FROM verification_codes WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND)',
      [email]
    )
    if (recent.length > 0) {
      return res.status(400).json({ error: '请60秒后再重新发送验证码' })
    }

    const code = genCode()
    await pool.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE))',
      [email, code]
    )

    await sendVerificationCode(email, code)
    res.json({ ok: true, message: '验证码已发送' })
  } catch (err) {
    console.error('Send reset code error:', err)
    res.status(500).json({ error: '验证码发送失败，请稍后重试' })
  }
})

export default router
