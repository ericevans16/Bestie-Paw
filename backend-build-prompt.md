# Bestie Paw — 全量代码修复与优化 Prompt

> 将本文件完整发送给 AI 编程助手，按顺序执行所有修改。
> 本文件整合了四轮代码审查的全部发现，并包含未来可优化方向。

---

## 重要约束

**注册方式：邮箱 + 密码（暂不接入 OAuth）**
- 前端 Apple / Google 登录按钮保留 UI，但禁用并标注"即将上线"
- 后端只实现邮箱密码注册与登录，不构建 OAuth 路由
- 手机号保持可选字段，不作为登录凭据

---

## 一、前端修改

### F-01　`style.css` — 补充错误状态样式类（🔴 Bug）

`main.js` 的 `showError()` 给报错字段加 `input-error` 类，但 CSS 无该类定义，导致错误时输入框无红色边框。

在 `.form-hint { }` 之后追加：
```css
.form-input.input-error,
.form-select.input-error,
.form-textarea.input-error {
  border-color: var(--error);
  background: var(--error-lt);
}
```

---

### F-02　`style.css` — 补充焦点轮廓样式（🟠 可访问性）

在 `.btn-lg { }` 之后追加：
```css
.btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.nav-links a:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: 3px;
}
.feature-card:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}
.tag-option label:focus-visible,
.gender-option label:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

---

### F-03　`style.css` — 补充无障碍辅助类与屏幕阅读器隐藏工具（🟠 可访问性）

在 `.footer { }` 之后追加：
```css
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
```

---

### F-04　`style.css` — 修复占位符文字对比度（🟠 可访问性）

将：
```css
.form-input::placeholder,
.form-textarea::placeholder {
  color: #C0BAB4;
}
```
改为：
```css
.form-input::placeholder,
.form-textarea::placeholder {
  color: #96918C;
}
```

---

### F-05　`style.css` — 补充 `prefers-reduced-motion` 媒体查询（🟠 可访问性）

对前庭功能障碍用户，CSS 动画应可关闭。在文件末尾追加：
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### F-06　`style.css` — 补全设计令牌 `--shadow-lg`（🟡 设计系统）

在 `:root` 的 `--shadow-md` 之后追加：
```css
--shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
```

---

### F-07　`style.css` — 删除未使用的 `.badge-soon` 类（🟡 代码整洁）

删除以下整段规则：
```css
.badge-soon { ... }
```

---

### F-08　`style.css` — 移动端断点替换，增加汉堡菜单样式（🔴 Bug）

将现有 `@media (max-width: 640px)` 整块替换为：
```css
@media (max-width: 640px) {
  .nav { padding: 0 1rem; }
  .section { padding: 3rem 1rem; }
  .section-title { font-size: 1.5rem; }
  .form-row { grid-template-columns: 1fr; }

  .nav-links {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 64px; left: 0; right: 0;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    padding: 0.5rem 0;
    z-index: 99;
    gap: 0;
  }
  .nav-links.open { display: flex; }
  .nav-links li a {
    display: block;
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
  .nav-hamburger {
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    margin-left: 0.5rem;
  }
  .nav-hamburger span {
    display: block;
    width: 22px; height: 2px;
    background: var(--text);
    border-radius: 2px;
    transition: all 0.2s;
  }
}
@media (min-width: 641px) {
  .nav-hamburger { display: none; }
}
```

---

### F-09　`js/main.js` — 修复 `showError` / `clearError` 补充无障碍属性（🔴 Bug）

将两个函数完整替换为：
```javascript
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('input-error');
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', fieldId + '-error');
  let hint = field.parentElement.querySelector('.field-error');
  if (!hint) {
    hint = document.createElement('p');
    hint.className = 'field-error form-hint';
    hint.setAttribute('role', 'alert');
    field.parentElement.appendChild(hint);
  }
  hint.id = fieldId + '-error';
  hint.style.color = 'var(--error, #E24B4A)';
  hint.textContent = message;
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove('input-error');
  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-describedby');
  const hint = field.parentElement.querySelector('.field-error');
  if (hint) hint.remove();
}
```

---

### F-10　`js/main.js` — 修复 blur 验证对可选字段误报"必填"（🔴 Bug）

`initRegister` 中的 blur 监听器对 `phone`（可选字段）也触发"必填"提示。修改为：

```javascript
const OPTIONAL_FIELDS = ['phone'];
const inputs = form.querySelectorAll('.form-input, .form-select');
inputs.forEach(input => {
  if (OPTIONAL_FIELDS.includes(input.id)) return;
  input.addEventListener('blur', () => {
    if (!input.value.trim()) {
      showError(input.id, '此项为必填项');
    } else {
      clearError(input.id);
    }
  });
});
```

---

### F-11　`js/main.js` — 修复 `validateEmail` 正则过于宽松（🟠 质量）

将：
```javascript
return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
```
改为：
```javascript
return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
```

---

### F-12　`js/main.js` — 完整重写 `initRegister` 提交逻辑（🔴 Bug）

统一 agree 校验、修复密码强度验证、加入按钮恢复：

```javascript
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let valid = true;

  const username = document.getElementById('username');
  const email    = document.getElementById('email');
  const phone    = document.getElementById('phone');
  const password = document.getElementById('password');
  const confirm  = document.getElementById('confirm-password');
  const agree    = document.getElementById('agree');

  if (!username.value.trim() || username.value.trim().length < 2) {
    showError('username', '昵称至少需要 2 个字符'); valid = false;
  } else { clearError('username'); }

  if (!validateEmail(email.value)) {
    showError('email', '请输入有效的邮箱地址'); valid = false;
  } else { clearError('email'); }

  if (phone.value && !validatePhone(phone.value)) {
    showError('phone', '请输入有效的手机号'); valid = false;
  } else { clearError('phone'); }

  if (password.value.length < 8) {
    showError('password', '密码至少 8 位'); valid = false;
  } else { clearError('password'); }

  if (confirm.value !== password.value) {
    showError('confirm-password', '两次输入的密码不一致'); valid = false;
  } else { clearError('confirm-password'); }

  if (agree && !agree.checked) {
    agree.parentElement.style.color = 'var(--error, #E24B4A)';
    valid = false;
  } else if (agree) {
    agree.parentElement.style.color = '';
  }

  if (valid) {
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = '注册中…';
    btn.disabled = true;
    try {
      /* 此处替换为实际 API 调用 */
      await new Promise(resolve => setTimeout(resolve, 800));
      window.location.href = 'pet-profile.html';
    } catch (err) {
      btn.textContent = originalText;
      btn.disabled = false;
      console.error('注册失败：', err);
    }
  }
});
```

---

### F-13　`js/main.js` — 完整重写 `initPetProfile` 提交逻辑（🔴 多处 Bug）

补充体重负数校验、修复跳转目标、加入按钮恢复：

```javascript
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let valid = true;

  const petName = document.getElementById('pet-name');
  const weight  = document.getElementById('pet-weight');

  if (!petName.value.trim()) {
    showError('pet-name', '请填写宠物名字'); valid = false;
  } else { clearError('pet-name'); }

  if (weight.value !== '' && parseFloat(weight.value) < 0) {
    showError('pet-weight', '体重不能为负数'); valid = false;
  } else { clearError('pet-weight'); }

  if (valid) {
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = '保存中…';
    btn.disabled = true;
    try {
      /* 此处替换为实际 API 调用 */
      await new Promise(resolve => setTimeout(resolve, 800));
      window.location.href = 'onboarding-complete.html';
    } catch (err) {
      btn.textContent = originalText;
      btn.disabled = false;
      console.error('保存失败：', err);
    }
  }
});
```

---

### F-14　`js/main.js` — 将字数统计迁移至 main.js（🟠 代码结构）

在 `initPetProfile` 内、`form.addEventListener` 块之后追加：
```javascript
  const countTargets = [
    { textarea: 'pet-allergies', counter: 'allergy-count' },
    { textarea: 'pet-note',      counter: 'note-count'    },
  ];
  countTargets.forEach(({ textarea, counter }) => {
    const ta  = document.getElementById(textarea);
    const cnt = document.getElementById(counter);
    if (ta && cnt) {
      ta.addEventListener('input', () => { cnt.textContent = ta.value.length; });
    }
  });
```

---

### F-15　`js/main.js` — 添加头像文件大小校验（🔴 Bug）

在 `avatarInput.addEventListener('change', ...)` 回调开头插入：
```javascript
const MAX_MB = 5;
if (file.size > MAX_MB * 1024 * 1024) {
  alert(`图片大小不能超过 ${MAX_MB}MB，请重新选择`);
  avatarInput.value = '';
  return;
}
```

---

### F-16　`js/main.js` — 将 `initHamburger` 提升至模块顶层（🟠 代码结构）

将 `initHamburger` 函数定义从 `DOMContentLoaded` 回调内部移出，放在 `initPetProfile` 函数定义之后、`DOMContentLoaded` 之前，与 `initRegister`、`initPetProfile` 保持相同层级。`DOMContentLoaded` 回调内只保留调用：
```javascript
document.addEventListener('DOMContentLoaded', () => {
  initRegister();
  initPetProfile();
  initHamburger();
});
```

---

### F-17　`js/main.js` — 补充汉堡菜单逻辑（若尚未添加）

在 `initPetProfile` 之后、`DOMContentLoaded` 之前新增：
```javascript
function initHamburger() {
  const btn   = document.getElementById('nav-hamburger');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.setAttribute('aria-label', isOpen ? '关闭导航菜单' : '展开导航菜单');
  });
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
}
```

---

### F-18　`index.html` — `<head>` 补充 SEO meta、favicon（🟡 SEO）

在 `<title>` 之后追加：
```html
<meta name="description"
      content="Bestie Paw — 专为宠物主人打造的全能生活助手。健康档案、社区社交、AI 智能分析，一站式守护毛孩子每一天。" />
<meta property="og:title"       content="Bestie Paw — 你和宠物最好的伴侣" />
<meta property="og:description" content="健康档案、社区交流、AI 智能分析，一站式满足宠物主人的所有需求。" />
<meta property="og:type"        content="website" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

---

### F-19　`index.html` — 替换导航栏，加入汉堡按钮（🔴 移动端 Bug）

将 `<nav class="nav">` 内容完整替换为：
```html
<nav class="nav" aria-label="主导航">
  <a href="index.html" class="nav-logo">Bestie<span>Paw</span> 🐾</a>
  <ul class="nav-links" id="nav-links">
    <li><a href="#features">功能</a></li>
    <li><a href="#how">如何使用</a></li>
    <li><a href="#features">社区</a></li>
  </ul>
  <div class="nav-actions">
    <button class="nav-hamburger" id="nav-hamburger"
            aria-label="展开导航菜单"
            aria-expanded="false"
            aria-controls="nav-links">
      <span></span><span></span><span></span>
    </button>
    <a href="register.html" class="btn btn-ghost">注册</a>
    <a href="register.html" class="btn btn-primary">免费开始</a>
  </div>
</nav>
```

---

### F-20　`index.html` — 用 `<main>` 包裹主内容，替换假统计数字，修复功能卡片链接（🟠 多处）

**① 添加 `<main>` 标签：** 在 Hero section 之前插入 `<main>`，页脚之前插入 `</main>`。

**② 替换假数据：** 将 `.hero-stat` 整块替换为：
```html
<div class="hero-stat">
  <div class="stat-item">
    <div class="stat-num">免费</div>
    <div class="stat-label">核心功能永久免费</div>
  </div>
  <div class="stat-item">
    <div class="stat-num">端对端</div>
    <div class="stat-label">数据加密存储</div>
  </div>
  <div class="stat-item">
    <div class="stat-num">7×24h</div>
    <div class="stat-label">AI 智能助手在线</div>
  </div>
</div>
```

**③ 修复卡片链接：** 将三个 `<a href="#" class="feature-card">` 改为：
```html
<a href="#" class="feature-card" aria-disabled="true" onclick="event.preventDefault()">
```

---

### F-21　`register.html` — 补全结构与可访问性（🟠 多处）

**① `<head>` 补充 meta 和 favicon（同 F-18 格式，内容改为注册页描述）**

**② 添加 `<main>` 标签：** 用 `<main>` 包裹 `<div class="page-center">`。

**③ nav 加 `aria-label`：**
```html
<nav class="nav" aria-label="页面导航">
```

**④ 社交登录按钮补充 `type="button"` 并标注"即将上线"（暂不接入 OAuth）：**
```html
<button type="button" class="social-btn" disabled title="即将上线">🍎 Apple 登录</button>
<button type="button" class="social-btn" disabled title="即将上线">🔍 Google 登录</button>
```

**⑤ 修复 `username` 字段 `autocomplete`：**
```html
autocomplete="username"
```

**⑥ 将登录链接指向 `login.html`：**
```html
<a href="login.html" class="btn btn-outline">登录</a>
<!-- 底部 -->
已有账号？<a href="login.html">直接登录</a>
```

**⑦ 删除底部内联脚本中 agree 相关的独立 submit 监听器**（已统一至 main.js）。

---

### F-22　`pet-profile.html` — 补全结构与修复遗留问题（🔴 多处）

**① `<head>` 补充 meta 和 favicon**

**② nav 加 `aria-label`**

**③ 添加 `<main>` 标签**

**④ 删除 textarea 重复 `id` 属性：**
将 `id="pet-allergies-ta"` 从该 textarea 中删除，只保留 `id="pet-allergies"`。

**⑤ 头像上传区域无障碍属性（若未更新）：**
```html
<div class="avatar-upload" id="avatar-zone"
     role="button" tabindex="0"
     aria-label="点击或按 Enter 上传宠物照片">
```

**⑥ 为隐藏文件 input 添加关联 label：**
```html
<label for="pet-avatar-input" class="sr-only">上传宠物照片</label>
<input type="file" id="pet-avatar-input" accept="image/*" style="display:none;" />
```

**⑦ 修复头像区域缩进：** 删除第 114 行 `<div class="avatar-upload"` 前多余的空格，对齐至 8 空格缩进。

**⑧ 删除底部内联脚本中 `countChars` 相关代码**（已迁移至 main.js）。

**⑨ 补充头像键盘支持（在底部保留的内联 script 中追加）：**
```javascript
const avatarZone = document.getElementById('avatar-zone');
if (avatarZone) {
  avatarZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.getElementById('pet-avatar-input').click();
    }
  });
}
```

---

### F-23　新建 `login.html`（🔴 功能缺失）

创建与 `register.html` 风格一致的登录页，包含：
- `<nav>` 仅 logo，右侧"没有账号？注册"指向 `register.html`
- 标题"欢迎回来 👋"，无进度步骤条
- 第三方登录区（Apple / Google，`disabled` 状态，标注"即将上线"）
- 邮箱字段（`id="login-email"`）、密码字段（`id="login-password"`，含显示切换）
- "忘记密码？"链接（`href="#"`，占位）
- 提交按钮"登录"，引用 `main.js` 中新增的 `initLogin()` 函数
- 底部"还没有账号？立即注册"指向 `register.html`

在 `main.js` 中新增 `initLogin()` 函数，校验邮箱格式和密码非空，按钮禁用/恢复逻辑与 `initRegister` 一致，提交后模拟跳转 `index.html`。

---

### F-24　新建 `onboarding-complete.html`（🟠 流程断裂）

创建注册完成确认页，包含：
- `<nav>` 仅 logo
- 居中内容：大号 🎉、标题"你已成功注册！"、副文案"宠物档案已建立，去探索所有功能吧"
- 主按钮"前往首页 →"指向 `index.html`

---

### F-25　新建 `favicon.svg`（🟡 品牌）

在项目根目录创建：
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <text y="26" font-size="26">🐾</text>
</svg>
```

---

### F-26　`README.md` — 修正拼写错误并补充内容（🟡 文档）

将全部内容替换为：
```markdown
# Bestie Paw

专为宠物主人打造的全能生活助手，提供健康档案管理、社区社交和 AI 智能分析功能。

## 技术栈
- 前端：HTML5 / CSS3 / 原生 JavaScript（ES6+）
- 后端：Node.js + Express + PostgreSQL（Prisma ORM）

## 页面结构
| 文件 | 说明 |
|------|------|
| index.html | 首页 |
| register.html | 注册（步骤一） |
| pet-profile.html | 宠物登记（步骤二） |
| onboarding-complete.html | 注册完成（步骤三） |
| login.html | 登录 |

## 本地运行
直接用浏览器打开 `index.html`，无需构建工具。
```

---

## 二、后端修改

### B-01　`auth.service.ts` — 登录接口边界处理（🔴 安全）

**① 防邮箱枚举：** 邮箱不存在与密码错误返回同一错误信息：
```typescript
throw new AppError('INVALID_CREDENTIALS', '邮箱或密码错误', 401);
```

**② 账号级登录锁定：**
在 `schema.prisma` 的 `User` 模型追加：
```prisma
loginFailCount   Int       @default(0)
loginLockedUntil DateTime?
```
执行 `prisma migrate dev --name add_login_lock`。

在 `login()` 中按顺序实现：
- 查用户 → 检查锁定期（已锁则返回 423 + 剩余分钟数）→ 比对密码 → 失败时计数+1，达 5 次设锁 15 分钟 → 成功时重置计数

**③ 未验证邮箱拒绝登录：**
```typescript
if (!user.emailVerified) {
  throw new AppError('EMAIL_NOT_VERIFIED', '请先验证邮箱后再登录', 403);
  // 响应 body 携带 "action": "resend_verification"
}
```

**④ 登录接口挂载速率限制中间件（每 IP 每 15 分钟 10 次）：**
```typescript
router.post('/login', loginRateLimiter, authController.login);
```

---

### B-02　`auth.service.ts` — Refresh Token 轮换（🔴 安全）

每次使用 refresh token 时，立即删除旧 token 并签发新的一对 token，防止被盗 token 长期有效：
```typescript
// 1. 查找并验证旧 token
// 2. 立即从数据库删除（prisma.refreshToken.delete）
// 3. 签发新 accessToken + refreshToken
// 4. 将新 refreshToken 存库
// 5. 返回新的两个 token
```

---

### B-03　`auth.service.ts` — 用户同意条款时间戳落库（🟡 合规）

在 `schema.prisma` 的 `User` 模型追加：
```prisma
termsAcceptedAt DateTime?
termsVersion    String?
```
执行 `prisma migrate dev --name add_terms_fields`。

在 `register()` 写库时补充：
```typescript
termsAcceptedAt: new Date(),
termsVersion:    process.env.TERMS_VERSION ?? '2026-05',
```
`.env.example` 追加 `TERMS_VERSION=2026-05`。

---

### B-04　`auth.service.ts` — 注册去除手机号必要逻辑，保持可选且唯一（🟠 数据完整性）

注册方式简化为邮箱+密码，手机号纯可选。但若用户填写了手机号，须确保唯一性：

在 `schema.prisma` 中：
```prisma
phone String? @unique
```
执行 `prisma migrate dev --name add_phone_unique`。

在 `register()` 中，若 `data.phone` 存在则提前查重，重复时返回 409。

---

### B-05　`pets.schema.ts` — 补充服务端体重与生日校验（🟠 数据完整性）

```typescript
weightKg: z.number().min(0, '体重不能为负数').optional(),
birthday: z.coerce.date()
  .max(new Date(), { message: '生日不能是未来的日期' })
  .optional(),
```

---

### B-06　`pets.service.ts` — 修复欢迎邮件竞态条件（🟠 逻辑 Bug）

将宠物数量查询从**创建后**改为**创建前**，避免并发创建时邮件漏发：
```typescript
const existingCount = await prisma.pet.count({ where: { ownerId } });
const pet = await prisma.pet.create({ data: { ...data, ownerId } });
if (existingCount === 0) { /* 发送欢迎邮件 */ }
```

---

### B-07　`pets.service.ts` — 修复欢迎邮件 HTML 注入（🔴 安全）

新增 `escapeHtml` 工具函数，对所有插入邮件模板的用户数据进行 HTML 转义：
```typescript
function escapeHtml(str: string): string {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
            .replace(/'/g,'&#039;');
}
// buildWelcomeEmail 内使用 escapeHtml(username)、escapeHtml(petName)
```

---

### B-08　`stats.controller.ts` — 新增公开统计接口（🟠 功能）

新建 `src/modules/stats/` 模块，提供 `GET /api/stats`（无需认证），返回 `registeredUsers` 和 `petProfiles` 的真实数量，带 60 秒内存缓存。

在 `app.ts` 中注册：
```typescript
app.use('/api/stats', statsRouter);
```

缓存注释说明：
```typescript
// 当前使用模块级内存缓存，单实例有效。
// 多实例部署时请替换为 Redis：
// await redisClient.setEx('public_stats', 60, JSON.stringify(data));
```

---

### B-09　`pets.service.ts` — 创建宠物后触发欢迎邮件（🟠 体验）

宠物档案创建成功且为该用户第一只宠物时，非阻塞发送欢迎邮件（见 B-06、B-07）。邮件模板包含：品牌标题、用户姓名、宠物名字、核心功能列表、前往首页 CTA 按钮。

---

## 三、未来可优化方向

以下内容暂不实现，记录为后续迭代参考：

### 前端

| 编号 | 方向 | 说明 |
|------|------|------|
| FO-1 | CSS 文件拆分 | 将各页面内联 `<style>` 块提取为 `css/home.css`、`css/register.css`、`css/pet-profile.css` |
| FO-2 | 深色模式 | 补充 `@media (prefers-color-scheme: dark)` CSS 变量覆盖 |
| FO-3 | PWA 支持 | 添加 `manifest.json` 和 Service Worker，支持离线访问和安装到桌面 |
| FO-4 | 图片懒加载 | 社区动态图片使用 `loading="lazy"` + IntersectionObserver |
| FO-5 | 骨架屏 | 数据加载期间显示骨架占位，替代当前空白等待 |
| FO-6 | Toast 通知系统 | 替代 `alert()`，实现非阻塞的成功/错误提示组件 |
| FO-7 | 国际化（i18n） | 提取硬编码中文字符串为语言包，支持多语言切换 |
| FO-8 | OAuth 接入 | Apple Login 和 Google Login 后端 OAuth 路由及回调处理 |

### 后端

| 编号 | 方向 | 说明 |
|------|------|------|
| BO-1 | 双因素认证（2FA） | 登录时可选绑定 TOTP（如 Google Authenticator） |
| BO-2 | 密码重置历史 | 记录最近 3 次密码哈希，重置时拒绝重复使用 |
| BO-3 | API 版本管理 | 路由前缀改为 `/api/v1/`，为将来破坏性变更预留升级路径 |
| BO-4 | 健康检查端点 | 新增 `GET /health`，返回服务状态、数据库连通性、版本号 |
| BO-5 | 图片处理管道 | 头像上传后用 `sharp` 压缩并生成多尺寸缩略图（128px / 512px） |
| BO-6 | Redis 缓存 | 统计数据、热门帖子列表等高频只读数据迁移至 Redis |
| BO-7 | 全文搜索 | 宠物品种、社区帖子支持关键词搜索（PostgreSQL `tsvector` 或 Meilisearch） |
| BO-8 | 推送通知 | 健康提醒除邮件外，增加 Web Push 通知（PWA 配合） |
| BO-9 | 软删除机制 | 用户和宠物删除改为软删除（`deletedAt` 字段），保留 30 天后清理 |
| BO-10 | 审计日志 | 记录敏感操作（登录、密码修改、账号删除）的操作时间和 IP |
| BO-11 | 限流细化 | 文件上传接口单独设更严格的速率限制（每用户每分钟 5 次） |
| BO-12 | 数据导出 | 用户可导出自己的所有数据（GDPR 合规），生成 JSON 打包下载 |

---

## 四、验收清单

完成所有修改后逐项验证：

| # | 测试项 | 预期结果 |
|---|--------|----------|
| 1 | 注册页故意输入错误邮箱 | 输入框出现红色边框和背景 |
| 2 | 聚焦手机号输入框后直接离开（不填） | 不出现"必填"错误 |
| 3 | 不勾选协议直接提交 | 协议文字变红，表单不提交 |
| 4 | 选择超过 5MB 的图片作为头像 | 弹出大小限制提示，文件未加载 |
| 5 | Tab 键在所有可交互元素间切换 | 每个元素均有可见橙色焦点轮廓 |
| 6 | 640px 以下宽度查看任意页面 | 汉堡按钮出现，点击后导航展开 |
| 7 | 完成宠物信息登记提交 | 跳转至 `onboarding-complete.html` |
| 8 | 输入负数体重提交宠物表单 | 出现"体重不能为负数"错误 |
| 9 | 点击首页三个功能卡片 | 页面不跳回顶部 |
| 10 | 点击"登录"链接 | 跳转至 `login.html` |
| 11 | `POST /api/auth/login` 传入不存在邮箱 | 返回 401，"邮箱或密码错误" |
| 12 | 同一账号连续 5 次密码错误 | 第 6 次返回 423，提示锁定时间 |
| 13 | 使用旧 refresh token 重复换 token | 第二次返回 401 |
| 14 | `POST /api/pets` 传入未来生日 | 返回 400，"生日不能是未来的日期" |
| 15 | 注册时填写已被使用的手机号 | 返回 409 |
| 16 | 新用户创建第一只宠物 | 收到欢迎邮件，HTML 中尖括号已转义 |
| 17 | 同一用户创建第二只宠物 | 不再收到欢迎邮件 |
| 18 | `GET /api/stats` | 返回真实注册用户数和宠物数 |
| 19 | 查看新注册用户数据库记录 | `termsAcceptedAt` 字段已写入 |

---

*按顺序执行修改，每完成一个模块对照验收清单测试，不要批量修改后统一测试。*
