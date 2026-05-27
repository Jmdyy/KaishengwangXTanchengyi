/**
 * 带登录验证的静态文件服务器（纯 Node.js，零依赖）
 * 使用前请设置环境变量:
 *   AUTH_USER=your_user AUTH_PASS=your_pass node server.mjs
 *   PORT 默认 3000
 * @author yy
 */

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const STATIC_DIR = join(__dirname, 'dist')

const AUTH_USER = process.env.AUTH_USER || 'admin'
const AUTH_PASS = process.env.AUTH_PASS || 'changeme'
const PORT = parseInt(process.env.PORT || '3000', 10)

/** 会话管理：session token → 过期时间 */
const sessions = new Map()

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
}

/**
 * 生成随机会话 token
 */
function makeToken() {
  return createHash('sha256').update(Date.now() + '-' + Math.random()).digest('hex').slice(0, 32)
}

/**
 * 从 Cookie 中提取 session token 并验证
 */
function getSession(cookieHeader) {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/session_token=([a-f0-9]+)/)
  if (!match) return null
  const token = match[1]
  const expires = sessions.get(token)
  if (!expires || Date.now() > expires) {
    sessions.delete(token)
    return null
  }
  return token
}

/**
 * 获取文件 Content-Type
 */
function getContentType(filePath) {
  const ext = extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

/**
 * 安全读取文件，失败返回 null
 */
async function tryReadFile(filePath) {
  try {
    await stat(filePath)
    return await readFile(filePath)
  } catch {
    return null
  }
}

/**
 * 渲染登录页面
 */
function renderLoginPage(errorMsg) {
  const errorHtml = errorMsg
    ? `<div style="background:#ef444410;border:1px solid #ef444430;border-radius:12px;padding:10px 16px;margin-bottom:20px"><p style="color:#ef4444;font-size:13px;margin:0">${errorMsg}</p></div>`
    : ''

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 - 训练计划</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      display:flex;justify-content:center;align-items:center;
      min-height:100vh;background:linear-gradient(135deg,#0a0a0f,#0f0f1a);
      color:#e8e6e3;
    }
    .card{
      background:#1a1a24;
      border:1px solid #2a2a3a;
      border-radius:20px;
      padding:40px 32px;
      width:360px;
      max-width:90vw;
      box-shadow:0 16px 48px rgba(0,0,0,.4);
    }
    .icon{font-size:36px;text-align:center;margin-bottom:8px}
    h1{text-align:center;font-size:20px;font-weight:800;margin-bottom:4px;color:#ff8c5a}
    .sub{text-align:center;font-size:13px;color:#777;margin-bottom:28px}
    .field{margin-bottom:16px}
    .field label{display:block;font-size:12px;color:#999;margin-bottom:6px;font-weight:600}
    .field input{
      width:100%;padding:10px 14px;border-radius:10px;
      background:#0f0f16;border:1px solid #2a2a3a;
      color:#e8e6e3;font-size:14px;outline:none;
      transition:border-color .2s
    }
    .field input:focus{border-color:#ff6b3540}
    .field input::placeholder{color:#555}
    button{
      width:100%;padding:12px;border-radius:12px;
      background:#ff6b35;color:#fff;border:none;
      font-size:14px;font-weight:700;cursor:pointer;
      transition:background .2s;margin-top:8px
    }
    button:hover{background:#ff8c5a}
    .hint{
      margin-top:24px;text-align:center;
      font-size:11px;color:#555;line-height:1.6
    }
    .hint span{color:#999;font-weight:600}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">📊</div>
    <h1>训练计划</h1>
    <p class="sub">凯圣王 × 谭成义 2026 三分化</p>
    ${errorHtml}
    <form method="POST" action="/_login">
      <div class="field">
        <label>用户名</label>
        <input name="user" type="text" placeholder="输入用户名" autocomplete="username" autofocus required>
      </div>
      <div class="field">
        <label>密码</label>
        <input name="pass" type="password" placeholder="输入密码" autocomplete="current-password" required>
      </div>
      <button type="submit">登 录</button>
    </form>
    <p class="hint">可通过环境变量 AUTH_USER / AUTH_PASS 修改凭据</p>
  </div>
</body>
</html>`
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`)
  const session = getSession(req.headers.cookie)

  /** 处理登录 POST 请求 */
  if (req.method === 'POST' && url.pathname === '/_login') {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      const params = new URLSearchParams(body)
      const user = params.get('user') || ''
      const pass = params.get('pass') || ''

      if (user === AUTH_USER && pass === AUTH_PASS) {
        const token = makeToken()
        sessions.set(token, Date.now() + 24 * 3600 * 1000)

        res.writeHead(302, {
          'Location': '/',
          'Set-Cookie': `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
          'Content-Type': 'text/html'
        })
        res.end()
        return
      }

      res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(renderLoginPage('用户名或密码错误'))
    })
    return
  }

  /** 未登录 → 显示登录页面 */
  if (!session) {
    res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(renderLoginPage())
    return
  }

  /** 已登录 → 提供静态文件 */
  let filePath = join(STATIC_DIR, url.pathname)
  let content = await tryReadFile(filePath)

  if (!content) {
    filePath = join(STATIC_DIR, 'index.html')
    content = await tryReadFile(filePath)
  }

  if (!content) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h1>404 Not Found</h1>')
    return
  }

  if (filePath.endsWith('.html')) {
    const html = content.toString('utf-8')
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    })
    res.end(html)
  } else {
    res.writeHead(200, {
      'Content-Type': getContentType(filePath),
      'Cache-Control': 'no-cache'
    })
    res.end(content)
  }
})

server.listen(PORT, () => {
  console.log(`\n🔒 训练计划服务已启动`)
  console.log(`   地址: http://localhost:${PORT}`)
  console.log(`   用户: ${AUTH_USER}`)
  console.log(`   密码: ${AUTH_PASS}`)
  console.log(`   会话有效期: 24 小时\n`)
})
