/* ============================================
   Bestie Paw — 共享脚本
   ============================================ */

/* ---------- 表单验证工具 ---------- */

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

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

/* ---------- 注册页逻辑 ---------- */

function initRegister() {
  const form = document.getElementById('register-form');
  if (!form) return;

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
      showError('username', '昵称至少需要 2 个字符');
      valid = false;
    } else { clearError('username'); }

    if (!validateEmail(email.value)) {
      showError('email', '请输入有效的邮箱地址');
      valid = false;
    } else { clearError('email'); }

    if (phone.value && !validatePhone(phone.value)) {
      showError('phone', '请输入有效的手机号');
      valid = false;
    } else { clearError('phone'); }

    if (password.value.length < 8) {
      showError('password', '密码至少 8 位');
      valid = false;
    } else { clearError('password'); }

    if (confirm.value !== password.value) {
      showError('confirm-password', '两次输入的密码不一致');
      valid = false;
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
}

/* ---------- 宠物信息页逻辑 ---------- */

function initPetProfile() {
  const form = document.getElementById('pet-form');
  if (!form) return;

  /* 头像上传预览 */
  const avatarInput = document.getElementById('pet-avatar-input');
  const avatarCircle = document.getElementById('avatar-circle');
  if (avatarInput) {
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const MAX_MB = 5;
        if (file.size > MAX_MB * 1024 * 1024) {
          alert(`图片大小不能超过 ${MAX_MB}MB，请重新选择`);
          avatarInput.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          avatarCircle.style.backgroundImage = `url(${evt.target.result})`;
          avatarCircle.style.backgroundSize = 'cover';
          avatarCircle.textContent = '';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    const petName = document.getElementById('pet-name');
    const weight  = document.getElementById('pet-weight');
    if (!petName.value.trim()) {
      showError('pet-name', '请填写宠物名字');
      valid = false;
    } else { clearError('pet-name'); }

    if (weight.value !== '' && parseFloat(weight.value) < 0) {
      showError('pet-weight', '体重不能为负数');
      valid = false;
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

  const countTargets = [
    { textarea: 'pet-allergies', counter: 'allergy-count' },
    { textarea: 'pet-note',      counter: 'note-count' }
  ];
  countTargets.forEach(({ textarea, counter }) => {
    const ta  = document.getElementById(textarea);
    const cnt = document.getElementById(counter);
    if (ta && cnt) {
      ta.addEventListener('input', () => { cnt.textContent = ta.value.length; });
    }
  });
}

/* ---------- 登录页逻辑 ---------- */

function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');

    if (!validateEmail(email.value)) {
      showError('login-email', '请输入有效的邮箱地址');
      valid = false;
    } else { clearError('login-email'); }

    if (!password.value.trim()) {
      showError('login-password', '请输入密码');
      valid = false;
    } else { clearError('login-password'); }

    if (valid) {
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = '登录中…';
      btn.disabled = true;
      try {
        /* 此处替换为实际 API 调用 */
        await new Promise(resolve => setTimeout(resolve, 800));
        window.location.href = 'index.html';
      } catch (err) {
        btn.textContent = originalText;
        btn.disabled = false;
        console.error('登录失败：', err);
      }
    }
  });
}

/* ---------- 移动端汉堡菜单 ---------- */

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

/* ---------- 入口 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initRegister();
  initPetProfile();
  initLogin();
  initHamburger();
});
