import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { JWT_SECRET } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username])
    if (rows.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }
    const user = rows[0]
    const valid = bcrypt.compareSync(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' })
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/register', async (req, res) => {
  try {
    const { username, password, email, code } = req.body
    if (!username || !password || !email || !code) {
      return res.status(400).json({ error: '所有字段不能为空' })
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度需在3-20个字符之间' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度不能少于6位' })
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
    if (existing.length > 0) {
      return res.status(400).json({ error: '用户名已存在' })
    }

    // Email binding limit: max 3 accounts per email
    const [emailUsers] = await pool.query('SELECT COUNT(*) as cnt FROM users WHERE email = ?', [email])
    if (emailUsers[0].cnt >= 3) {
      return res.status(400).json({ error: '该邮箱已绑定3个账号，无法继续注册' })
    }

    // Verify code (MySQL NOW() for consistent timezone comparison)
    const [codes] = await pool.query(
      'SELECT code FROM verification_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW()',
      [email, code]
    )
    if (codes.length === 0) {
      // Check if code exists but expired, to give specific error
      const [expired] = await pool.query(
        'SELECT id FROM verification_codes WHERE email = ? AND code = ? AND used = 0',
        [email, code]
      )
      if (expired.length > 0) {
        await pool.query('DELETE FROM verification_codes WHERE email = ? AND code = ?', [email, code])
        return res.status(400).json({ error: '验证码已过期，请重新获取' })
      }
      return res.status(400).json({ error: '验证码错误' })
    }

    // Mark code as used
    await pool.query('UPDATE verification_codes SET used = 1 WHERE email = ? AND code = ?', [email, code])

    const hash = bcrypt.hashSync(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hash, email, 'user']
    )
    const token = jwt.sign({ id: result.insertId, username, role: 'user' }, JWT_SECRET, { expiresIn: '24h' })
    res.status(201).json({ token, user: { id: result.insertId, username, email, role: 'user' } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { username, email, code, password } = req.body
    if (!username || !email || !code || !password) {
      return res.status(400).json({ error: '所有字段不能为空' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度不能少于6位' })
    }

    const [codes] = await pool.query(
      'SELECT code FROM verification_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW()',
      [email, code]
    )
    if (codes.length === 0) {
      const [expired] = await pool.query(
        'SELECT id FROM verification_codes WHERE email = ? AND code = ? AND used = 0',
        [email, code]
      )
      if (expired.length > 0) {
        await pool.query('DELETE FROM verification_codes WHERE email = ? AND code = ?', [email, code])
        return res.status(400).json({ error: '验证码已过期，请重新获取' })
      }
      return res.status(400).json({ error: '验证码错误' })
    }

    // Verify username exists
    const [userByName] = await pool.query('SELECT id FROM users WHERE username = ?', [username])
    if (userByName.length === 0) {
      return res.status(400).json({ error: '用户名信息错误' })
    }
    // Verify email matches
    const [userByEmail] = await pool.query('SELECT id FROM users WHERE username = ? AND email = ?', [username, email])
    if (userByEmail.length === 0) {
      return res.status(400).json({ error: '邮箱信息错误' })
    }

    await pool.query('UPDATE verification_codes SET used = 1 WHERE email = ? AND code = ?', [email, code])

    const hash = bcrypt.hashSync(password, 10)
    await pool.query('UPDATE users SET password = ? WHERE username = ? AND email = ?', [hash, username, email])

    res.json({ ok: true, message: '密码已重置，请返回登录' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '重置密码失败' })
  }
})

export default router
