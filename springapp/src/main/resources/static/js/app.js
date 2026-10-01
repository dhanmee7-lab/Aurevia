// ========================================================
// AUREVIA • School Library Management System Frontend Logic
// ========================================================

const API = {
  stats: '/api/dashboard/stats',
  books: '/api/books',
  categories: '/api/book-categories',
  members: '/api/members',
  borrows: '/api/borrows',
  fines: '/api/fines',
  demo: '/api/demo',
  auth: '/api/auth',
  users: '/api/users'
};

const authState = {
  token: localStorage.getItem('aurevia_token') || sessionStorage.getItem('aurevia_token') || null,
  user: JSON.parse(localStorage.getItem('aurevia_user') || sessionStorage.getItem('aurevia_user') || 'null'),
  rememberMe: !!localStorage.getItem('aurevia_token')
};

const state = {
  stats: {},
  books: [],
  categories: [],
  members: [],
  borrows: [],
  fines: [],
  users: [],
  activeView: 'dashboard',
  bookSearch: '',
  selectedCategory: 'ALL',
  selectedAvailability: 'ALL',
  bookSort: 'ID_ASC',
  bookPage: 1,
  bookPageSize: 10,
  bookViewMode: 'grid',
  circTab: 'ACTIVE',
  circSearch: '',
  memberSearch: '',
  memberTypeFilter: 'ALL',
  lastRegisteredUsername: ''
};

// Central Authenticated Fetch Wrapper
async function authFetch(url, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (authState.token) {
    headers['Authorization'] = `Bearer ${authState.token}`;
  }
  const config = { ...options, headers };
  const res = await fetch(url, config);

  if (res.status === 401) {
    handleSessionExpired();
    throw new Error('Unauthorized');
  }
  return res;
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  startClock();
  setupEventListeners();
  setupKeyboardShortcuts();
  initAuth();
});

// Live Header Clock
function startClock() {
  const clockEl = document.getElementById('liveClockDisplay');
  if (!clockEl) return;
  const update = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };
  update();
  setInterval(update, 30000);
}

// Theme Switcher (Dark/Light)
function initTheme() {
  const saved = localStorage.getItem('aurevia-theme') || localStorage.getItem('aurevia_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('aurevia-theme', next);
  localStorage.setItem('aurevia_theme', next);
  updateThemeIcon(next);
  onThemeChanged(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    if (theme === 'dark') {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
      btn.title = 'Switch to Light Mode';
      btn.setAttribute('aria-label', 'Switch to Light Mode');
    } else {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
      btn.title = 'Switch to Dark Mode';
      btn.setAttribute('aria-label', 'Switch to Dark Mode');
    }
  }
}

function onThemeChanged(theme) {
  // If reports view is currently visible, re-render charts so svg elements update immediately
  const reportsView = document.getElementById('view-reports');
  if (reportsView && reportsView.style.display !== 'none' && typeof loadReports === 'function') {
    try {
      loadReports();
    } catch (e) {
      console.warn('Error reloading reports on theme change', e);
    }
  }
}

// Notifications Indicator Action
function showNotificationToast() {
  showToast('All library systems operational. No unread notifications.', 'info');
}

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toastRack');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  
  const icon = type === 'success' ? '✅' : type === 'danger' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span style="flex:1;">${escapeHtml(message)}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3600);
}

// Escape HTML utility
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Format Currency
function formatCurrency(num) {
  const val = Number(num || 0);
  return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Event Listeners
function setupEventListeners() {
  // Navigation Sidebar Items
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-view');
      switchNav(target);
      // Close mobile drawer if open
      document.getElementById('appSidebar')?.classList.remove('drawer-open');
    });
  });

  // Mobile Toggle Button
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      document.getElementById('appSidebar')?.classList.toggle('drawer-open');
    });
  }

  // Theme Toggle Button
  document.getElementById('themeToggleBtn')?.addEventListener('click', toggleTheme);

  // Demo Seed Button
  document.getElementById('seedDemoDataBtn')?.addEventListener('click', handleSeedDemo);

  // Global Search trigger
  document.getElementById('globalSearchBarTrigger')?.addEventListener('click', openCommandPalette);

  // Book Search Input
  document.getElementById('bookSearchInput')?.addEventListener('input', (e) => {
    state.bookSearch = e.target.value.toLowerCase();
    state.bookPage = 1;
    renderBooks();
  });

  // Circulation Search Input
  document.getElementById('circulationSearchInput')?.addEventListener('input', (e) => {
    state.circSearch = e.target.value.toLowerCase();
    renderCirculation();
  });

  // Member Search Input
  document.getElementById('memberSearchInput')?.addEventListener('input', (e) => {
    state.memberSearch = e.target.value.toLowerCase();
    renderMembers();
  });

  // Issue Due Date Calculation Listener
  document.getElementById('issueDaysInput')?.addEventListener('change', updateIssueDueDatePreview);

  // Backdrop modal dismiss
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop.id);
    });
  });
}

// Keyboard Shortcuts (Ctrl + K, Escape)
function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    } else if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(m => closeModal(m.id));
    }
  });

  const cmdInput = document.getElementById('commandPaletteInput');
  if (cmdInput) {
    cmdInput.addEventListener('input', (e) => {
      renderCommandResults(e.target.value.toLowerCase().trim());
    });
  }
}

// Navigation Switcher
function switchNav(viewName) {
  state.activeView = viewName;
  
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === viewName);
  });

  document.querySelectorAll('.page-view').forEach(view => {
    view.classList.toggle('active', view.id === `${viewName}View`);
  });

  // Update Top Header Breadcrumb
  const breadcrumbMap = {
    dashboard: 'Dashboard',
    books: 'Books Catalog',
    circulation: 'Issue & Return',
    members: 'Members Directory',
    fines: 'Fines & Dues',
    categories: 'Categories',
    reports: 'Reports & Analytics',
    users: 'Users Directory',
    settings: 'Settings'
  };
  const bcEl = document.getElementById('headerBreadcrumbCurrent');
  if (bcEl) bcEl.textContent = breadcrumbMap[viewName] || 'Dashboard';

  window.history.replaceState(null, '', `#${viewName}`);

  // Render view content
  if (viewName === 'dashboard') renderDashboard();
  else if (viewName === 'books') renderBooks();
  else if (viewName === 'circulation') renderCirculation();
  else if (viewName === 'members') renderMembers();
  else if (viewName === 'fines') renderFines();
  else if (viewName === 'categories') renderCategories();
  else if (viewName === 'reports') renderReports();
  else if (viewName === 'users') renderUsers();
}

// ========================================================
// AUTHENTICATION SYSTEM LOGIC
// ========================================================
async function initAuth() {
  const token = authState.token;
  if (!token) {
    showAuthView('login');
    return;
  }

  // Validate session with backend
  try {
    const res = await fetch(`${API.auth}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        authState.user = data.data;
        if (authState.rememberMe) {
          localStorage.setItem('aurevia_user', JSON.stringify(data.data));
        } else {
          sessionStorage.setItem('aurevia_user', JSON.stringify(data.data));
        }
        transitionToApp();
        return;
      }
    }
    // Token invalid or expired
    clearAuthState();
    showAuthView('login');
    showToast('Session expired. Please sign in again.', 'warning');
  } catch (err) {
    console.warn('Network offline / auth verify error:', err);
    if (authState.user) {
      transitionToApp();
    } else {
      showAuthView('login');
    }
  }
}

function showAuthView(tab = 'login') {
  const authContainer = document.getElementById('authContainer');
  const appHeader = document.getElementById('appHeader');
  const appShell = document.getElementById('appShell');

  if (authContainer) authContainer.style.display = 'flex';
  if (appHeader) appHeader.style.display = 'none';
  if (appShell) appShell.style.display = 'none';

  document.body.classList.add('unauthenticated');
  switchAuthTab(tab);
  document.title = (tab === 'login' ? 'Sign In' : 'Create Account') + ' • AUREVIA | School Library Management System';
  window.history.replaceState(null, '', '#login');
}

function transitionToApp() {
  const authContainer = document.getElementById('authContainer');
  const appHeader = document.getElementById('appHeader');
  const appShell = document.getElementById('appShell');

  if (authContainer) authContainer.style.display = 'none';
  if (appHeader) appHeader.style.display = 'flex';
  if (appShell) appShell.style.display = 'flex';

  document.body.classList.remove('unauthenticated');
  document.title = 'AUREVIA | School Library Management System';

  applyRolePermissions(authState.user);
  loadAllData();

  const hash = window.location.hash.replace('#', '');
  if (hash && hash !== 'login' && hash !== 'register' && ['dashboard', 'books', 'circulation', 'members', 'fines', 'categories', 'reports', 'users', 'settings'].includes(hash)) {
    switchNav(hash);
  } else {
    switchNav('dashboard');
    window.history.replaceState(null, '', '#dashboard');
  }
}

function switchAuthTab(tab) {
  clearAuthErrors();
  const isLogin = tab === 'login';
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginPane = document.getElementById('loginFormPane');
  const registerPane = document.getElementById('registerFormPane');

  if (tabLoginBtn) tabLoginBtn.classList.toggle('active', isLogin);
  if (tabRegisterBtn) tabRegisterBtn.classList.toggle('active', !isLogin);

  if (loginPane) loginPane.style.display = isLogin ? 'block' : 'none';
  if (registerPane) registerPane.style.display = !isLogin ? 'block' : 'none';

  if (isLogin) {
    setTimeout(() => document.getElementById('loginUsername')?.focus(), 50);
  } else {
    setTimeout(() => document.getElementById('regFullName')?.focus(), 50);
  }
}

function clearAuthErrors() {
  document.querySelectorAll('.field-error-msg').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });
  document.querySelectorAll('.form-control.is-invalid').forEach(el => {
    el.classList.remove('is-invalid');
  });
}

function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  if (input) input.classList.add('is-invalid');
  const errorEl = document.getElementById(`${inputId}Error`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

function setBtnLoading(btn, isLoading, defaultText) {
  if (!btn) return;
  btn.disabled = isLoading;
  const textSpan = btn.querySelector('.btn-text');
  const loaderSpan = btn.querySelector('.btn-loader');
  if (textSpan) textSpan.style.display = isLoading ? 'none' : 'inline';
  if (loaderSpan) {
    loaderSpan.style.display = isLoading ? 'inline-flex' : 'none';
    if (defaultText && isLoading) {
      loaderSpan.innerHTML = `<span class="spinner-inline"></span> ${escapeHtml(defaultText)}`;
    }
  }
}

function togglePasswordVisibility(fieldId, btn) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  btn.textContent = isPass ? '🙈' : '👁️';
  btn.title = isPass ? 'Hide password' : 'Show password';
}

// Live Password Strength Meter
function updatePasswordStrengthMeter(password) {
  const container = document.getElementById('passStrengthContainer');
  if (!container) return;

  if (!password) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'block';

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const updateRuleUI = (id, passed) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('passed', passed);
    const icon = el.querySelector('.rule-icon');
    if (icon) icon.textContent = passed ? '✓' : '○';
  };

  updateRuleUI('ruleLength', hasLength);
  updateRuleUI('ruleUpper', hasUpper);
  updateRuleUI('ruleLower', hasLower);
  updateRuleUI('ruleNumber', hasNumber);
  updateRuleUI('ruleSpecial', hasSpecial);

  const rulesPassed = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  const fill = document.getElementById('passStrengthFill');
  const label = document.getElementById('passStrengthText');

  if (rulesPassed <= 2 || !hasLength) {
    if (fill) {
      fill.style.width = '33%';
      fill.style.background = '#EF4444';
      fill.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.4)';
    }
    if (label) {
      label.textContent = 'Weak';
      label.style.color = '#EF4444';
    }
  } else if (rulesPassed <= 4) {
    if (fill) {
      fill.style.width = '66%';
      fill.style.background = '#F59E0B';
      fill.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.4)';
    }
    if (label) {
      label.textContent = 'Medium';
      label.style.color = '#F59E0B';
    }
  } else {
    if (fill) {
      fill.style.width = '100%';
      fill.style.background = '#22C55E';
      fill.style.boxShadow = '0 0 10px rgba(34, 197, 94, 0.4)';
    }
    if (label) {
      label.textContent = 'Strong';
      label.style.color = '#22C55E';
    }
  }
}

function fillDemoCredentials(username, password) {
  switchAuthTab('login');
  const uInput = document.getElementById('loginUsername');
  const pInput = document.getElementById('loginPassword');
  if (uInput) uInput.value = username;
  if (pInput) pInput.value = password;
  clearAuthErrors();
  showToast(`Demo credentials filled for "${username}"`, 'info');
  document.getElementById('loginSubmitBtn')?.focus();
}

function openForgotPasswordModal() {
  openModal('forgotPasswordModal');
}

function toggleUserDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('userDropdownMenu');
  if (dropdown) {
    const isShown = dropdown.style.display === 'flex';
    dropdown.style.display = isShown ? 'none' : 'flex';
  }
}

function closeUserDropdown() {
  const dropdown = document.getElementById('userDropdownMenu');
  if (dropdown) dropdown.style.display = 'none';
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#userMenuDropdown')) {
    closeUserDropdown();
  }
});

function setAuthState(token, user, rememberMe) {
  authState.token = token;
  authState.user = user;
  authState.rememberMe = rememberMe;

  if (rememberMe) {
    localStorage.setItem('aurevia_token', token);
    localStorage.setItem('aurevia_user', JSON.stringify(user));
    sessionStorage.removeItem('aurevia_token');
    sessionStorage.removeItem('aurevia_user');
  } else {
    sessionStorage.setItem('aurevia_token', token);
    sessionStorage.setItem('aurevia_user', JSON.stringify(user));
    localStorage.removeItem('aurevia_token');
    localStorage.removeItem('aurevia_user');
  }
}

function clearAuthState() {
  authState.token = null;
  authState.user = null;
  authState.rememberMe = false;
  localStorage.removeItem('aurevia_token');
  localStorage.removeItem('aurevia_user');
  sessionStorage.removeItem('aurevia_token');
  sessionStorage.removeItem('aurevia_user');
}

async function handleLoginSubmit(e) {
  if (e) e.preventDefault();
  clearAuthErrors();

  const usernameOrEmail = document.getElementById('loginUsername')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const rememberMe = document.getElementById('loginRememberMe')?.checked;

  let hasError = false;
  if (!usernameOrEmail) {
    showFieldError('loginUsername', 'Username or email is required.');
    hasError = true;
  }
  if (!password) {
    showFieldError('loginPassword', 'Password is required.');
    hasError = true;
  }
  if (hasError) return;

  const btn = document.getElementById('loginSubmitBtn');
  setBtnLoading(btn, true, 'Signing In...');

  try {
    const res = await fetch(`${API.auth}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password, rememberMe })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      // Do not reveal whether the username or email exists
      const errorMsg = 'Invalid username or password.';
      showToast(errorMsg, 'danger');
      showFieldError('loginPassword', errorMsg);
      return;
    }

    setAuthState(data.data.token, data.data.user, rememberMe);
    showToast(`Welcome back, ${data.data.user.fullName || data.data.user.username}!`, 'success');
    document.getElementById('loginForm')?.reset();
    transitionToApp();
  } catch (err) {
    console.error('Login error:', err);
    showToast('Unable to connect to the server. Please try again.', 'danger');
  } finally {
    setBtnLoading(btn, false);
  }
}

async function handleRegisterSubmit(e) {
  if (e) e.preventDefault();
  clearAuthErrors();

  const fullName = document.getElementById('regFullName')?.value.trim();
  const username = document.getElementById('regUsername')?.value.trim();
  const phone = document.getElementById('regPhone')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const password = document.getElementById('regPassword')?.value;
  const confirmPassword = document.getElementById('regConfirmPassword')?.value;

  let hasError = false;
  if (!fullName || fullName.length < 2) {
    showFieldError('regFullName', 'Full Name is required (minimum 2 characters).');
    hasError = true;
  }
  if (!username || !/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
    showFieldError('regUsername', 'Username must be 3-30 characters (letters, numbers, _ or -).');
    hasError = true;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('regEmail', 'Enter a valid institutional email address.');
    hasError = true;
  }
  if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
    showFieldError('regPhone', 'Enter a valid phone number.');
    hasError = true;
  }
  if (!password || password.length < 8) {
    showFieldError('regPassword', 'Password must contain at least 8 characters.');
    hasError = true;
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password)) {
    showFieldError('regPassword', 'Must include uppercase, lowercase, number, and special character.');
    hasError = true;
  }
  if (confirmPassword !== password) {
    showFieldError('regConfirmPassword', 'Passwords do not match.');
    hasError = true;
  }
  if (hasError) return;

  const btn = document.getElementById('registerSubmitBtn');
  setBtnLoading(btn, true, 'Creating Account...');

  try {
    const res = await fetch(`${API.auth}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        username,
        phone,
        email,
        password,
        confirmPassword,
        role: 'STUDENT'
      })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      const errorMsg = data.message || 'Registration failed.';
      showToast(errorMsg, 'danger');
      if (errorMsg.toLowerCase().includes('username')) {
        showFieldError('regUsername', errorMsg);
      } else if (errorMsg.toLowerCase().includes('email')) {
        showFieldError('regEmail', errorMsg);
      } else if (errorMsg.toLowerCase().includes('password')) {
        showFieldError('regPassword', errorMsg);
      } else {
        showFieldError('regFullName', errorMsg);
      }
      return;
    }

    // Success view
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('registerSuccessState').style.display = 'block';
    showToast('Account created successfully.', 'success');
    state.lastRegisteredUsername = username;
  } catch (err) {
    console.error('Registration error:', err);
    showToast('Unable to connect to the server. Please try again.', 'danger');
  } finally {
    setBtnLoading(btn, false);
  }
}

function proceedToLoginAfterRegister() {
  document.getElementById('registerForm').reset();
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('registerSuccessState').style.display = 'none';

  switchAuthTab('login');
  if (state.lastRegisteredUsername) {
    const loginUserEl = document.getElementById('loginUsername');
    if (loginUserEl) loginUserEl.value = state.lastRegisteredUsername;
    document.getElementById('loginPassword')?.focus();
  }
}

async function handleLogout() {
  try {
    if (authState.token) {
      await fetch(`${API.auth}/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authState.token}` }
      });
    }
  } catch (e) {
    // Graceful logout
  }

  clearAuthState();
  closeUserDropdown();
  showAuthView('login');
  showToast('You have been logged out securely.', 'info');
}

function handleSessionExpired() {
  clearAuthState();
  closeUserDropdown();
  showAuthView('login');
  showToast('Session expired. Please sign in again.', 'warning');
}

function getInitials(name) {
  if (!name) return 'AU';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function applyRolePermissions(user) {
  if (!user) return;
  const role = (user.role || 'STUDENT').toUpperCase();

  // Set body role classes
  document.body.classList.remove('role-admin', 'role-librarian', 'role-student');
  document.body.classList.add(`role-${role.toLowerCase()}`);

  // Header display elements
  const avatarEl = document.getElementById('headerUserAvatar');
  if (avatarEl) avatarEl.textContent = getInitials(user.fullName || user.username);

  const nameEl = document.getElementById('headerUserName');
  if (nameEl) nameEl.textContent = user.fullName || user.username;

  const roleEl = document.getElementById('headerUserRole');
  if (roleEl) {
    roleEl.textContent = role === 'ADMIN' ? 'Administrator' : role === 'LIBRARIAN' ? 'Library Staff' : 'Student Member';
  }

  const dropName = document.getElementById('dropdownUserName');
  if (dropName) dropName.textContent = user.fullName || user.username;

  const dropEmail = document.getElementById('dropdownUserEmail');
  if (dropEmail) dropEmail.textContent = user.email || `${user.username}@aurevia.edu`;

  const dropBadge = document.getElementById('dropdownUserBadge');
  if (dropBadge) {
    dropBadge.textContent = role;
    dropBadge.className = `status-pill ${role === 'ADMIN' ? 'active' : role === 'LIBRARIAN' ? 'info' : 'warning'}`;
  }

  // Personalize dashboard welcome greeting
  const welcomeHeading = document.getElementById('dashWelcomeHeading');
  if (welcomeHeading) {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const title = role === 'ADMIN' ? 'Admin' : (user.fullName || user.username);
    welcomeHeading.textContent = `${timeGreeting}, ${title}`;
  }
  const welcomeSub = document.getElementById('dashWelcomeSub');
  if (welcomeSub) {
    welcomeSub.textContent = "Here's your library overview for today.";
  }

  // Sidebar role-based navigation filtering
  const usersNavItem = document.querySelector('.sidebar-nav-item[data-view="users"]');
  const settingsNavItem = document.querySelector('.sidebar-nav-item[data-view="settings"]');

  if (role === 'STUDENT') {
    if (usersNavItem) usersNavItem.style.display = 'none';
    if (settingsNavItem) settingsNavItem.style.display = 'none';
  } else if (role === 'LIBRARIAN') {
    if (usersNavItem) usersNavItem.style.display = 'none';
    if (settingsNavItem) settingsNavItem.style.display = 'flex';
  } else {
    if (usersNavItem) usersNavItem.style.display = 'flex';
    if (settingsNavItem) settingsNavItem.style.display = 'flex';
  }
}

// API Data Fetching
async function loadAllData() {
  if (!authState.token) return;
  try {
    await Promise.all([
      fetchStats(),
      fetchBooks(),
      fetchCategories(),
      fetchMembers(),
      fetchBorrows(),
      fetchFines(),
      fetchUsers()
    ]);

    renderDashboard();
    renderBooks();
    renderCirculation();
    renderMembers();
    renderFines();
    renderCategories();
    renderReports();
    renderUsers();
  } catch (err) {
    console.error('Data load error:', err);
  }
}

async function fetchStats() {
  try {
    const res = await authFetch(API.stats);
    if (res.ok) state.stats = await res.json();
  } catch (e) { console.error(e); }
}

async function fetchBooks() {
  try {
    const res = await authFetch(API.books);
    if (res.ok) state.books = await res.json();
  } catch (e) { console.error(e); }
}

async function fetchCategories() {
  try {
    const res = await authFetch(API.categories);
    if (res.ok) {
      if (res.status === 204) state.categories = [];
      else state.categories = await res.json();
    }
  } catch (e) { console.error(e); }
}

async function fetchMembers() {
  try {
    const res = await authFetch(API.members);
    if (res.ok) state.members = await res.json();
  } catch (e) { console.error(e); }
}

async function fetchBorrows() {
  try {
    const res = await authFetch(API.borrows);
    if (res.ok) state.borrows = await res.json();
  } catch (e) { console.error(e); }
}

async function fetchFines() {
  try {
    const res = await authFetch(API.fines);
    if (res.ok) state.fines = await res.json();
  } catch (e) { console.error(e); }
}

async function fetchUsers() {
  try {
    const res = await authFetch(API.users);
    if (res.ok) {
      state.users = await res.json();
    }
  } catch (e) { console.error(e); }
}

function renderUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  const users = state.users || [];
  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-secondary);">No registered users found. Register accounts through the sign-up portal.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const initials = getInitials(u.fullName || u.username);
    const rolePill = u.role === 'ADMIN' ? 'active' : u.role === 'LIBRARIAN' ? 'info' : 'warning';
    const statusPill = u.status === 'ACTIVE' ? 'available' : 'danger';
    const isSelf = authState.user && authState.user.id === u.id;
    const canManage = authState.user && authState.user.role === 'ADMIN';

    return `
      <tr>
        <td><strong>#USR-${u.id}</strong></td>
        <td>
          <div style="display:flex; align-items:center; gap:0.65rem;">
            <div class="member-avatar-chip">${initials}</div>
            <div>
              <strong>${escapeHtml(u.fullName)}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary);">@${escapeHtml(u.username)}</div>
            </div>
          </div>
        </td>
        <td><span class="status-pill ${rolePill}">${u.role}</span></td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.phone || '—')}</td>
        <td><span class="status-pill ${statusPill}">${u.status}</span></td>
        <td>
          <div class="row-actions-group">
            ${canManage && !isSelf ? `
              <button class="action-btn" title="${u.status === 'ACTIVE' ? 'Disable Account' : 'Activate Account'}" onclick="toggleUserStatus(${u.id}, '${u.status}')">
                ${u.status === 'ACTIVE' ? '🚫' : '✅'}
              </button>
              <button class="action-btn delete" title="Delete User" onclick="deleteUserAccount(${u.id}, '${escapeHtml(u.username)}')">
                🗑️
              </button>
            ` : `
              <span style="font-size:0.78rem; color:var(--text-muted);">${isSelf ? '(Current User)' : 'Protected'}</span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleUserStatus(userId, currentStatus) {
  const nextStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
  try {
    const res = await authFetch(`${API.users}/${userId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message || `User status changed to ${nextStatus}`, 'success');
      await fetchUsers();
      renderUsers();
    } else {
      showToast(data.message || 'Could not update user status', 'danger');
    }
  } catch (err) {
    showToast('Failed to update status', 'danger');
  }
}

async function deleteUserAccount(userId, username) {
  if (!confirm(`Are you sure you want to delete user account "${username}"?`)) return;
  try {
    const res = await authFetch(`${API.users}/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('User deleted successfully', 'success');
      await fetchUsers();
      renderUsers();
    } else {
      showToast(data.message || 'Could not delete user', 'danger');
    }
  } catch (err) {
    showToast('Failed to delete user', 'danger');
  }
}

// ========================================================
// 1. DASHBOARD VIEW RENDERING
// ========================================================
function renderDashboard() {
  const totalBooks = state.books.length;
  const availableBooks = state.books.filter(b => b.available).length;
  const booksIssued = totalBooks - availableBooks;

  const today = new Date().toISOString().split('T')[0];
  const activeBorrows = state.borrows.filter(b => b.status === 'BORROWED');
  const overdueBorrows = activeBorrows.filter(b => b.dueDate && b.dueDate < today);

  const unpaidFines = state.fines.filter(f => !f.paid);
  const pendingFineSum = unpaidFines.reduce((sum, f) => sum + (f.amount || 0), 0);

  // Dynamic greeting
  const welcomeHeading = document.getElementById('dashWelcomeHeading');
  if (welcomeHeading) {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const title = authState.user ? (authState.user.role === 'ADMIN' ? 'Admin' : (authState.user.fullName || authState.user.username)) : 'Admin';
    welcomeHeading.textContent = `${timeGreeting}, ${title}`;
  }
  const welcomeSub = document.getElementById('dashWelcomeSub');
  if (welcomeSub) {
    welcomeSub.textContent = "Here's your library overview for today.";
  }

  // KPI Numbers
  const totalBooksEl = document.getElementById('dashTotalBooks');
  if (totalBooksEl) totalBooksEl.textContent = totalBooks;
  const totalMembersEl = document.getElementById('dashTotalMembers');
  if (totalMembersEl) totalMembersEl.textContent = state.members.length;
  const booksIssuedEl = document.getElementById('dashBooksIssued');
  if (booksIssuedEl) booksIssuedEl.textContent = booksIssued;
  const availableBooksEl = document.getElementById('dashAvailableBooks');
  if (availableBooksEl) availableBooksEl.textContent = availableBooks;
  const overdueBooksEl = document.getElementById('dashOverdueBooks');
  if (overdueBooksEl) overdueBooksEl.textContent = overdueBorrows.length;
  const pendingFinesEl = document.getElementById('dashPendingFines');
  if (pendingFinesEl) pendingFinesEl.textContent = formatCurrency(pendingFineSum);

  // KPI Trends
  const booksTrendEl = document.getElementById('dashBooksTrend');
  if (booksTrendEl) booksTrendEl.textContent = `+${totalBooks} registered`;
  const membersTrendEl = document.getElementById('dashMembersTrend');
  if (membersTrendEl) membersTrendEl.textContent = `+${state.members.length} active`;
  const issuedTrendEl = document.getElementById('dashIssuedTrend');
  if (issuedTrendEl) issuedTrendEl.textContent = `${Math.round((booksIssued / (totalBooks || 1)) * 100)}% circulation`;
  const overdueTrendEl = document.getElementById('dashOverdueTrend');
  if (overdueTrendEl) overdueTrendEl.textContent = overdueBorrows.length > 0 ? `${overdueBorrows.length} require action` : 'All on time';
  const finesTrendEl = document.getElementById('dashFinesTrend');
  if (finesTrendEl) finesTrendEl.textContent = pendingFineSum > 0 ? `${unpaidFines.length} pending` : 'Zero balance';

  // Sidebar badge counters
  const badgeTotalBooks = document.getElementById('badgeTotalBooks');
  if (badgeTotalBooks) badgeTotalBooks.textContent = totalBooks;
  const badgeActiveLoans = document.getElementById('badgeActiveLoans');
  if (badgeActiveLoans) badgeActiveLoans.textContent = activeBorrows.length;
  const badgeTotalMembers = document.getElementById('badgeTotalMembers');
  if (badgeTotalMembers) badgeTotalMembers.textContent = state.members.length;
  const badgeUnpaidFines = document.getElementById('badgeUnpaidFines');
  if (badgeUnpaidFines) badgeUnpaidFines.textContent = unpaidFines.length;

  // Activity Chart & Popular Books
  renderDashboardActivityChart();
  renderDashboardPopularBooks();

  // Recent Loans Table
  const feedEl = document.getElementById('dashRecentLoansBody');
  if (feedEl) {
    if (state.borrows.length === 0) {
      feedEl.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-secondary);">No circulation records on file. Click "⚡ Issue Book" to start!</td></tr>`;
    } else {
      const recent = [...state.borrows].sort((a,b) => b.borrowId - a.borrowId).slice(0, 5);
      feedEl.innerHTML = recent.map(b => {
        const isOverdue = b.status === 'BORROWED' && b.dueDate && b.dueDate < today;
        let badgeHtml = '';
        if (b.status === 'BORROWED') {
          badgeHtml = isOverdue
            ? `<span class="status-pill overdue">Overdue</span>`
            : `<span class="status-pill issued">Issued</span>`;
        } else {
          badgeHtml = `<span class="status-pill available">Returned</span>`;
        }

        const actionBtn = b.status === 'BORROWED'
          ? `<button class="btn btn-secondary btn-sm" onclick="openReturnModal(${b.borrowId})">Return</button>`
          : `<button class="btn btn-secondary btn-sm" onclick="openBookDetailsModal(${b.book ? b.book.bookId : 0})">Details</button>`;

        return `
          <tr>
            <td>
              <div class="table-book-title" style="cursor:pointer;" onclick="openBookDetailsModal(${b.book ? b.book.bookId : 0})">${escapeHtml(b.book ? b.book.title : 'Unknown')}</div>
              <div class="table-book-sub">${escapeHtml(b.book && b.book.bookCategory ? b.book.bookCategory.categoryName : 'General')}</div>
            </td>
            <td>
              <span style="font-weight:600; cursor:pointer;" onclick="openMemberDetailsModal(${b.member ? b.member.memberId : 0})">${escapeHtml(b.member ? b.member.name : 'Unknown Member')}</span>
            </td>
            <td>${b.borrowDate || '—'}</td>
            <td>${b.dueDate || '—'}</td>
            <td>${badgeHtml}</td>
            <td>${actionBtn}</td>
          </tr>
        `;
      }).join('');
    }
  }
}

// Render Dashboard Activity Chart
function renderDashboardActivityChart() {
  const container = document.getElementById('dashActivityChart');
  if (!container) return;

  const totalIssued = state.borrows.filter(b => b.status === 'BORROWED').length;
  const totalReturned = state.borrows.filter(b => b.status === 'RETURNED').length;
  const today = new Date().toISOString().split('T')[0];
  const totalOverdue = state.borrows.filter(b => b.status === 'BORROWED' && b.dueDate && b.dueDate < today).length;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const maxVal = Math.max(totalIssued, totalReturned, totalOverdue, 5);

  container.innerHTML = `
    <div class="activity-chart-inner">
      <div class="activity-chart-bars-container">
        ${days.map((d, i) => {
          const issuedHeight = Math.min(180, Math.max(22, Math.round(((totalIssued * (i + 2)) / (7 * maxVal)) * 180)));
          const returnedHeight = Math.min(180, Math.max(16, Math.round(((totalReturned * (i + 1)) / (7 * maxVal)) * 180)));
          const overdueHeight = totalOverdue > 0 ? Math.min(130, Math.max(12, Math.round(((totalOverdue * (i % 3 + 1)) / (3 * maxVal)) * 130))) : 0;
          return `
            <div class="activity-day-group">
              <div class="activity-bars-stack">
                <div class="activity-bar bar-issued" style="height:${issuedHeight}px;" title="Issued: ${Math.round(totalIssued * (i+1)/7)}"></div>
                <div class="activity-bar bar-returned" style="height:${returnedHeight}px;" title="Returned: ${Math.round(totalReturned * (i+1)/7)}"></div>
                ${overdueHeight > 0 ? `<div class="activity-bar bar-overdue" style="height:${overdueHeight}px;" title="Overdue"></div>` : ''}
              </div>
              <span class="activity-day-label">${d}</span>
            </div>
          `;
        }).join('')}
      </div>
      <div class="activity-stats-footer">
        <span class="activity-stat-item">Total Loans Processed: <strong class="stat-highlight">${state.borrows.length}</strong></span>
        <span class="activity-stat-item">Active Borrow Ratio: <strong class="stat-highlight">${Math.round((totalIssued / (state.books.length || 1)) * 100)}%</strong></span>
      </div>
    </div>
  `;
}

// Render Dashboard Popular Books
function renderDashboardPopularBooks() {
  const container = document.getElementById('dashPopularBooksList');
  if (!container) return;

  if (state.books.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-secondary); font-size:0.875rem;">No books in catalog yet.</div>`;
    return;
  }

  // Count borrows per bookId
  const borrowCounts = {};
  state.borrows.forEach(b => {
    if (b.book && b.book.bookId) {
      borrowCounts[b.book.bookId] = (borrowCounts[b.book.bookId] || 0) + 1;
    }
  });

  const sorted = [...state.books].sort((a, b) => {
    const countA = borrowCounts[a.bookId] || 0;
    const countB = borrowCounts[b.bookId] || 0;
    return countB - countA;
  }).slice(0, 4);

  container.innerHTML = sorted.map((b, i) => {
    const count = borrowCounts[b.bookId] || 0;
    const coverHtml = `
      <div class="popular-book-thumb-box">
        ${b.coverImageUrl
          ? `<img src="${escapeHtml(b.coverImageUrl)}" alt="${escapeHtml(b.title)}" class="popular-book-cover" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'fallback-icon\\'>📖</span>';">`
          : `<span class="fallback-icon">📖</span>`}
      </div>
    `;

    return `
      <div class="popular-book-item" onclick="openBookDetailsModal(${b.bookId})">
        <div class="popular-book-rank">#${i + 1}</div>
        ${coverHtml}
        <div class="popular-book-details">
          <div class="popular-book-title" title="${escapeHtml(b.title)}">${escapeHtml(b.title)}</div>
          <div class="popular-book-meta">${escapeHtml(b.author || 'Unknown')} &bull; ${escapeHtml(b.bookCategory ? b.bookCategory.categoryName : 'General')}</div>
        </div>
        <div class="popular-book-count">
          <span class="count-num">${count}</span>
          <span class="count-lbl">${count === 1 ? 'borrow' : 'borrows'}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ========================================================
// 2. BOOKS CATALOG VIEW RENDERING
// ========================================================
function renderBooks() {
  const container = document.getElementById('booksTableBody');
  const gridContainer = document.getElementById('booksGridContainer');
  const tableContainer = document.getElementById('booksTableContainer');

  renderCategoryPills();

  // Toggle view containers visibility based on state.bookViewMode
  if (gridContainer) gridContainer.style.display = state.bookViewMode === 'grid' ? 'grid' : 'none';
  if (tableContainer) tableContainer.style.display = state.bookViewMode === 'list' ? 'block' : 'none';

  const gridBtn = document.getElementById('bookViewModeGrid');
  const listBtn = document.getElementById('bookViewModeList');
  if (gridBtn) gridBtn.classList.toggle('active', state.bookViewMode === 'grid');
  if (listBtn) listBtn.classList.toggle('active', state.bookViewMode === 'list');

  let list = state.books.filter(b => {
    const q = state.bookSearch;
    const matchSearch = !q ||
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.isbn && b.isbn.toLowerCase().includes(q));

    const isCategoryAll = !state.selectedCategory || state.selectedCategory === 'ALL';
    const selectedCatNorm = normalizeCategory(state.selectedCategory);
    const bookCatName = b.bookCategory ? (b.bookCategory.categoryName || '') : '';
    const matchCategory = isCategoryAll || (normalizeCategory(bookCatName) === selectedCatNorm);

    const matchAvailability = state.selectedAvailability === 'ALL' ||
      (state.selectedAvailability === 'AVAILABLE' && b.available) ||
      (state.selectedAvailability === 'ISSUED' && !b.available);

    return matchSearch && matchCategory && matchAvailability;
  });

  // Sorting
  if (state.bookSort === 'TITLE_ASC') {
    list.sort((a,b) => (a.title || '').localeCompare(b.title || ''));
  } else if (state.bookSort === 'TITLE_DESC') {
    list.sort((a,b) => (b.title || '').localeCompare(a.title || ''));
  } else if (state.bookSort === 'AUTHOR_ASC') {
    list.sort((a,b) => (a.author || '').localeCompare(b.author || ''));
  } else {
    list.sort((a,b) => (a.bookId || 0) - (b.bookId || 0));
  }

  // Count meta
  const metaEl = document.getElementById('booksTableCountMeta');
  if (metaEl) metaEl.textContent = `Showing ${list.length} of ${state.books.length} books`;

  if (list.length === 0) {
    if (gridContainer) {
      gridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:3.5rem 1rem; color:var(--text-secondary); background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color);">
          <div style="font-size:2.8rem; margin-bottom:0.75rem;">📖</div>
          <div style="font-family:var(--font-serif); font-size:1.25rem; font-weight:700; color:var(--text-main);">No volumes matching criteria</div>
          <p style="font-size:0.875rem; margin-top:0.35rem; color:var(--text-muted);">Adjust search keywords or select a different category filter.</p>
        </div>
      `;
    }
    if (container) {
      container.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center; padding:3rem; color:var(--text-secondary);">
            <div style="font-size:2.5rem; margin-bottom:0.5rem;">📖</div>
            <div style="font-weight:700; color:var(--text-main); font-size:1.1rem;">No books matching criteria</div>
            <p style="font-size:0.85rem; margin-top:0.25rem;">Try adjusting search keywords or category filters.</p>
          </td>
        </tr>
      `;
    }
    renderBooksPagination(0);
    return;
  }

  // Pagination slice
  const start = (state.bookPage - 1) * state.bookPageSize;
  const pagedList = list.slice(start, start + state.bookPageSize);

  const isStaffOrAdmin = !authState.user || (authState.user.role === 'ADMIN' || authState.user.role === 'LIBRARIAN');

  // Render Grid View
  if (gridContainer) {
    gridContainer.innerHTML = pagedList.map(b => {
      const isAvail = b.available !== false;
      const placeholderHtml = `
        <div class="book-card-placeholder-cover">
          <div class="placeholder-ornament-border">
            <div class="placeholder-icon">📖</div>
            <div class="placeholder-brand">AUREVIA</div>
            <div class="placeholder-sub">BOOK COLLECTION</div>
          </div>
        </div>
      `;
      const coverHtml = b.coverImageUrl 
        ? `<img src="${escapeHtml(b.coverImageUrl)}" alt="Cover" class="book-card-cover-img" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'book-card-placeholder-cover\\'><div class=\\'placeholder-ornament-border\\'><div class=\\'placeholder-icon\\'>📖</div><div class=\\'placeholder-brand\\'>AUREVIA</div><div class=\\'placeholder-sub\\'>BOOK COLLECTION</div></div></div>';">`
        : placeholderHtml;

      return `
        <div class="book-card-item">
          <div class="book-card-cover-container" onclick="openBookDetailsModal(${b.bookId})" title="Click to view details">
            ${coverHtml}
          </div>
          <div class="book-card-body">
            <div class="book-card-meta-row">
              <span class="book-card-category-tag">${escapeHtml(b.bookCategory ? b.bookCategory.categoryName : 'General')}</span>
              <span class="book-card-status-pill ${isAvail ? 'available' : 'on-loan'}">
                <span class="status-dot">●</span> ${isAvail ? 'Available' : 'On Loan'}
              </span>
            </div>
            <h4 class="book-card-title" title="${escapeHtml(b.title)}" onclick="openBookDetailsModal(${b.bookId})">${escapeHtml(b.title)}</h4>
            <div class="book-card-author">by ${escapeHtml(b.author || 'Unknown Author')}</div>
            <div class="book-card-isbn-row">
              <span class="isbn-label">ISBN</span>
              <span class="isbn-value" title="${escapeHtml(b.isbn || '—')}">${escapeHtml(b.isbn || '—')}</span>
            </div>
          </div>
          <div class="book-card-footer book-card-actions">
            <button type="button" class="btn-card-details" onclick="openBookDetailsModal(${b.bookId})" title="View complete volume profile">
              Details
            </button>
            ${isStaffOrAdmin ? (isAvail ? `
              <button type="button" class="btn-card-issue" onclick="openIssueModal(${b.bookId})" title="Issue Book">
                ⚡ Issue
              </button>
            ` : `
              <button type="button" class="btn-card-issued" disabled title="Currently On Loan">
                On Loan
              </button>
            `) : ''}
            ${isStaffOrAdmin ? `
              <button type="button" class="btn-card-icon edit" onclick="openEditBookModal(${b.bookId})" title="Edit Details">✏️</button>
              <button type="button" class="btn-card-icon delete" onclick="handleDeleteBook(${b.bookId})" title="Delete Book">🗑️</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Render List View
  if (container) {
    container.innerHTML = pagedList.map(b => {
      const isAvail = b.available !== false;
      const coverContent = b.coverImageUrl 
        ? `<img src="${escapeHtml(b.coverImageUrl)}" alt="cover" class="table-book-thumb" onerror="this.src=''; this.parentElement.innerHTML='<span style=\\'font-size:1.2rem;\\'>📖</span>'">`
        : `<div class="table-book-thumb">📖</div>`;

      return `
        <tr>
          <td><strong style="color:var(--gold-soft);">#BK-${b.bookId}</strong></td>
          <td>
            <div class="table-book-cell">
              ${coverContent}
              <div class="table-book-meta">
                <span class="table-book-title" style="cursor:pointer;" onclick="openBookDetailsModal(${b.bookId})">${escapeHtml(b.title)}</span>
                <span class="table-book-sub">${escapeHtml(b.publisher || 'Standard Edition')}${b.publicationYear ? ` (${b.publicationYear})` : ''}</span>
              </div>
            </div>
          </td>
          <td>${escapeHtml(b.author || 'Unknown')}</td>
          <td><span class="status-pill info">${escapeHtml(b.bookCategory ? b.bookCategory.categoryName : 'General')}</span></td>
          <td><span style="font-family:var(--font-mono); font-size:0.785rem; color:var(--text-secondary);">${escapeHtml(b.isbn || '—')}</span></td>
          <td><span style="font-size:0.8rem; color:var(--text-secondary);">📍 ${escapeHtml(b.locationRack || 'General Shelf')}</span></td>
          <td><strong>${isAvail ? '1 / 1' : '0 / 1'}</strong></td>
          <td>
            <span class="status-pill ${isAvail ? 'available' : 'borrowed'}">
              ${isAvail ? 'Available' : 'Issued'}
            </span>
          </td>
          <td>
            ${isStaffOrAdmin ? `
              <div style="display:flex; align-items:center; gap:0.4rem;">
                <button class="btn btn-secondary btn-sm" onclick="openBookDetailsModal(${b.bookId})" title="View Details">
                  👁️
                </button>
                ${isAvail ? `
                  <button class="btn btn-primary btn-sm" onclick="openIssueModal(${b.bookId})" title="Issue this book">
                    ⚡ Issue
                  </button>
                ` : `
                  <button class="btn btn-secondary btn-sm" disabled style="opacity:0.5;">
                    Checked Out
                  </button>
                `}
                <button class="btn btn-secondary btn-sm" onclick="openEditBookModal(${b.bookId})" title="Edit Details">
                  ✏️
                </button>
                <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="handleDeleteBook(${b.bookId})" title="Delete Book">
                  🗑️
                </button>
              </div>
            ` : `
              <button class="btn btn-secondary btn-sm" onclick="openBookDetailsModal(${b.bookId})">View Details</button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  renderBooksPagination(list.length);
}

function setBookCatalogViewMode(mode) {
  state.bookViewMode = mode;
  const gridBtn = document.getElementById('bookViewModeGrid');
  const listBtn = document.getElementById('bookViewModeList');
  const gridCont = document.getElementById('booksGridContainer');
  const tableCont = document.getElementById('booksTableContainer');

  if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');
  if (listBtn) listBtn.classList.toggle('active', mode === 'list');

  if (gridCont) gridCont.style.display = mode === 'grid' ? 'grid' : 'none';
  if (tableCont) tableCont.style.display = mode === 'list' ? 'block' : 'none';

  renderBooks();
}

// Category Normalization for Duplicate Prevention
function normalizeCategory(name) {
  return typeof name === 'string' ? name.trim().toLowerCase() : '';
}

// Extract Deduplicated Categories for Books Catalog Filter
function getCatalogFilterCategories() {
  const categoryMap = new Map(); // normalizedKey -> original clean display name

  // 1. Collect from state.categories (Backend API)
  if (Array.isArray(state.categories)) {
    state.categories.forEach(c => {
      const name = typeof c === 'string' ? c : (c && c.categoryName);
      if (name && typeof name === 'string') {
        const cleanName = name.trim();
        const key = normalizeCategory(cleanName);
        if (key && !categoryMap.has(key)) {
          categoryMap.set(key, cleanName);
        }
      }
    });
  }

  // 2. Collect from state.books (Books data sources)
  if (Array.isArray(state.books)) {
    state.books.forEach(b => {
      const catObj = b.bookCategory;
      const name = typeof catObj === 'string' ? catObj : (catObj && catObj.categoryName);
      if (name && typeof name === 'string') {
        const cleanName = name.trim();
        const key = normalizeCategory(cleanName);
        if (key && !categoryMap.has(key)) {
          categoryMap.set(key, cleanName);
        }
      }
    });
  }

  return Array.from(categoryMap.values());
}

function renderCategoryPills() {
  const container = document.getElementById('booksCategoryPills');
  if (!container) return;

  const uniqueCategories = getCatalogFilterCategories();
  const allCategories = ['ALL', ...uniqueCategories];

  const currentSelectedNorm = normalizeCategory(state.selectedCategory || 'ALL');

  container.innerHTML = allCategories.map(cat => {
    const isAll = cat === 'ALL';
    const catNorm = normalizeCategory(cat);
    const isActive = (isAll && (currentSelectedNorm === 'all' || !currentSelectedNorm)) ||
                     (!isAll && currentSelectedNorm === catNorm);
    const activeClass = isActive ? 'active' : '';

    return `<button type="button" class="filter-pill-btn ${activeClass}" onclick="selectCategoryFilter('${escapeHtml(cat)}')">${escapeHtml(cat)}</button>`;
  }).join('');
}

function selectCategoryFilter(cat) {
  state.selectedCategory = cat;
  state.bookPage = 1;
  renderBooks();
}

function handleBookFilterChange() {
  state.selectedAvailability = document.getElementById('bookAvailabilityFilter').value;
  state.bookPage = 1;
  renderBooks();
}

function handleBookSortChange() {
  state.bookSort = document.getElementById('bookSortFilter').value;
  renderBooks();
}

function renderBooksPagination(totalItems) {
  const container = document.getElementById('booksPagination');
  if (!container) return;

  const totalPages = Math.ceil(totalItems / state.bookPageSize) || 1;
  let buttons = '';

  for (let i = 1; i <= totalPages; i++) {
    buttons += `<button class="page-btn ${i === state.bookPage ? 'active' : ''}" onclick="goToBookPage(${i})">${i}</button>`;
  }

  container.innerHTML = buttons;
}

function goToBookPage(page) {
  state.bookPage = page;
  renderBooks();
}

// ========================================================
// 3. ISSUE & RETURN (CIRCULATION) VIEW RENDERING
// ========================================================
function renderCirculation() {
  const container = document.getElementById('circulationTableBody');
  if (!container) return;

  const today = new Date().toISOString().split('T')[0];

  const totalLoans = state.borrows.length;
  const activeLoans = state.borrows.filter(b => b.status === 'BORROWED');
  const overdueLoans = activeLoans.filter(b => b.dueDate && b.dueDate < today);
  const returnedLoans = state.borrows.filter(b => b.status === 'RETURNED');

  document.getElementById('circTotalLoans').textContent = totalLoans;
  document.getElementById('circActiveLoans').textContent = activeLoans.length;
  document.getElementById('circOverdueLoans').textContent = overdueLoans.length;
  document.getElementById('circReturnedLoans').textContent = returnedLoans.length;

  let list = state.borrows;
  if (state.circTab === 'ACTIVE') {
    list = activeLoans;
  } else if (state.circTab === 'OVERDUE') {
    list = overdueLoans;
  } else if (state.circTab === 'RETURNED') {
    list = returnedLoans;
  }

  const q = state.circSearch;
  if (q) {
    list = list.filter(b => {
      const titleMatch = b.book && b.book.title && b.book.title.toLowerCase().includes(q);
      const memberMatch = b.member && b.member.name && b.member.name.toLowerCase().includes(q);
      return titleMatch || memberMatch;
    });
  }

  if (list.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:var(--text-secondary);">No loan records found in this category.</td></tr>`;
    return;
  }

  container.innerHTML = list.map(b => {
    const isOverdue = b.status === 'BORROWED' && b.dueDate && b.dueDate < today;
    
    let countdownBadge = '';
    if (b.status === 'BORROWED') {
      if (isOverdue) {
        const diffDays = Math.ceil((new Date(today) - new Date(b.dueDate)) / (1000 * 60 * 60 * 24));
        countdownBadge = `<span class="status-pill overdue">⚠️ ${diffDays} day(s) Overdue</span>`;
      } else {
        const diffDays = Math.ceil((new Date(b.dueDate) - new Date(today)) / (1000 * 60 * 60 * 24));
        countdownBadge = `<span class="status-pill available">⏱️ ${diffDays} day(s) left</span>`;
      }
    } else {
      countdownBadge = `<span class="status-pill available">Returned on ${b.returnDate || 'Record'}</span>`;
    }

    return `
      <tr>
        <td><strong style="color:var(--gold-soft);">#LN-${b.borrowId}</strong></td>
        <td>
          <div class="table-book-title" style="cursor:pointer;" onclick="openBookDetailsModal(${b.book ? b.book.bookId : 0})">${escapeHtml(b.book ? b.book.title : 'Unknown')}</div>
          <div class="table-book-sub"><span class="status-pill info" style="padding:0.15rem 0.5rem; font-size:0.685rem;">${escapeHtml(b.book && b.book.bookCategory ? b.book.bookCategory.categoryName : 'General')}</span></div>
        </td>
        <td>
          <div class="table-member-cell" style="cursor:pointer;" onclick="openMemberDetailsModal(${b.member ? b.member.memberId : 0})">
            <div class="member-avatar-chip">${(b.member && b.member.name ? b.member.name.charAt(0) : 'M')}</div>
            <div>
              <div style="font-weight:700;">${escapeHtml(b.member ? b.member.name : 'Unknown')}</div>
              <div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(b.member ? b.member.email : '')}</div>
            </div>
          </div>
        </td>
        <td>${b.borrowDate || '—'}</td>
        <td><strong style="${isOverdue ? 'color:var(--danger);' : ''}">${b.dueDate || '—'}</strong></td>
        <td>${countdownBadge}</td>
        <td>
          <div style="display:flex; gap:0.4rem; align-items:center;">
            ${b.status === 'BORROWED' ? `
              <button class="btn btn-primary btn-sm" onclick="openReturnModal(${b.borrowId})">
                🔄 Return
              </button>
            ` : `
              <button class="btn btn-secondary btn-sm" onclick="openBookDetailsModal(${b.book ? b.book.bookId : 0})">
                Details
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function switchCircTab(tabKey) {
  state.circTab = tabKey;
  document.querySelectorAll('[data-circ-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-circ-tab') === tabKey);
  });
  renderCirculation();
}

// ========================================================
// 4. MEMBERS VIEW RENDERING
// ========================================================
function renderMembers() {
  const container = document.getElementById('membersTableBody');
  if (!container) return;

  const totalMembers = state.members.length;
  const activeMembers = state.members.filter(m => m.status === 'ACTIVE').length;
  const activeBorrowerIds = new Set(state.borrows.filter(b => b.status === 'BORROWED' && b.member).map(b => b.member.memberId));
  
  const today = new Date().toISOString().split('T')[0];
  const overdueBorrowerIds = new Set(
    state.borrows
      .filter(b => b.status === 'BORROWED' && b.dueDate && b.dueDate < today && b.member)
      .map(b => b.member.memberId)
  );

  document.getElementById('memTotalCount').textContent = totalMembers;
  document.getElementById('memActiveCount').textContent = activeMembers;
  document.getElementById('memBorrowedCount').textContent = activeBorrowerIds.size;
  document.getElementById('memOverdueCount').textContent = overdueBorrowerIds.size;

  const q = state.memberSearch;
  const typeFilter = document.getElementById('memberTypeFilter')?.value || 'ALL';

  let list = state.members.filter(m => {
    const matchSearch = !q ||
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.phone && m.phone.toLowerCase().includes(q));

    const matchType = typeFilter === 'ALL' || m.membershipType === typeFilter;
    return matchSearch && matchType;
  });

  if (list.length === 0) {
    container.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:3rem; color:var(--text-secondary);">No members found. Click "+ Add Member" to register one!</td></tr>`;
    return;
  }

  container.innerHTML = list.map(m => {
    const loansCount = state.borrows.filter(b => b.member && b.member.memberId === m.memberId && b.status === 'BORROWED').length;
    const hasOverdue = overdueBorrowerIds.has(m.memberId);
    const initials = m.name ? m.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'MB';
    const rollId = 'SCH-' + String(1000 + m.memberId);
    const classDept = m.membershipType === 'FACULTY' ? 'Faculty Staff' : 'Class X - Sec A';

    return `
      <tr>
        <td><strong style="color:var(--gold-soft);">#MB-${m.memberId}</strong></td>
        <td>
          <div class="table-member-cell" style="cursor:pointer;" onclick="openMemberDetailsModal(${m.memberId})">
            <div class="member-avatar-chip">${initials}</div>
            <div>
              <div style="font-weight:700;">${escapeHtml(m.name)}</div>
              <div style="font-size:0.75rem; color:var(--gold-soft); font-weight:600;">${escapeHtml(m.membershipType || 'STUDENT')}</div>
            </div>
          </div>
        </td>
        <td><span style="font-family:var(--font-mono); font-size:0.785rem;">${rollId}</span></td>
        <td><span style="font-size:0.8rem; color:var(--text-secondary);">${classDept}</span></td>
        <td>${escapeHtml(m.email || '—')}</td>
        <td>${escapeHtml(m.phone || '—')}</td>
        <td>
          <span class="status-pill ${loansCount > 0 ? (hasOverdue ? 'overdue' : 'info') : 'available'}">
            ${loansCount} Book(s) Loaned
          </span>
        </td>
        <td>
          <span class="status-pill ${m.status === 'ACTIVE' ? 'available' : 'overdue'}">
            ${escapeHtml(m.status || 'ACTIVE')}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary btn-sm" onclick="openMemberDetailsModal(${m.memberId})" title="View Profile">👁️</button>
            <button class="btn btn-secondary btn-sm" onclick="openEditMemberModal(${m.memberId})" title="Edit Member">✏️</button>
            <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="handleDeleteMember(${m.memberId})" title="Delete Member">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ========================================================
// 5. FINES & DUES VIEW RENDERING
// ========================================================
function renderFines() {
  const container = document.getElementById('finesTableBody');
  if (!container) return;

  const unpaidFines = state.fines.filter(f => !f.paid);
  const paidFines = state.fines.filter(f => f.paid);

  const pendingSum = unpaidFines.reduce((s, f) => s + (f.amount || 0), 0);
  const collectedSum = paidFines.reduce((s, f) => s + (f.amount || 0), 0);
  const totalIssued = pendingSum + collectedSum;

  document.getElementById('fineStatTotal').textContent = formatCurrency(totalIssued);
  document.getElementById('fineStatPending').textContent = formatCurrency(pendingSum);
  document.getElementById('fineStatPaid').textContent = formatCurrency(collectedSum);
  document.getElementById('fineStatOverdueCount').textContent = unpaidFines.length;

  if (state.fines.length === 0) {
    container.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:3rem; color:var(--text-secondary);">No overdue penalties or fines on record. Excellent!</td></tr>`;
    return;
  }

  container.innerHTML = state.fines.map(f => {
    return `
      <tr>
        <td><strong style="color:var(--gold-soft);">#FN-${f.fineId}</strong></td>
        <td>
          <div style="font-weight:700; cursor:pointer;" onclick="openMemberDetailsModal(${f.member ? f.member.memberId : 0})">${escapeHtml(f.member ? f.member.name : 'Unknown Member')}</div>
          <div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(f.member ? f.member.email : '')}</div>
        </td>
        <td>
          <span style="cursor:pointer;" onclick="openBookDetailsModal(${f.borrow && f.borrow.book ? f.borrow.book.bookId : 0})">
            ${escapeHtml(f.borrow && f.borrow.book ? f.borrow.book.title : 'Library Loan Penalty')}
          </span>
        </td>
        <td>${f.borrow ? (f.borrow.dueDate || '—') : '—'}</td>
        <td><span style="color:var(--danger); font-weight:700;">${f.remarks || 'Overdue'}</span></td>
        <td><strong style="font-size:0.95rem; color:var(--text-main);">${formatCurrency(f.amount)}</strong></td>
        <td>
          <span class="status-pill ${f.paid ? 'available' : 'overdue'}">
            ${f.paid ? 'PAID' : 'PENDING'}
          </span>
        </td>
        <td>
          ${!f.paid ? `
            <button class="btn btn-primary btn-sm" onclick="handlePayFine(${f.fineId})">
              💵 Record Payment
            </button>
          ` : `
            <span style="font-size:0.8rem; color:var(--text-secondary);">Paid on ${f.paidDate || 'Record'}</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

// ========================================================
// 6. CATEGORIES VIEW RENDERING
// ========================================================
function renderCategories() {
  const container = document.getElementById('categoriesTableBody');
  if (!container) return;

  if (state.categories.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:var(--text-secondary);">No categories registered. Click "+ Add Category" to create one.</td></tr>`;
    return;
  }

  container.innerHTML = state.categories.map(c => {
    const catBooks = state.books.filter(b => b.bookCategory && b.bookCategory.categoryId === c.categoryId);
    const totalCount = catBooks.length;
    const availCount = catBooks.filter(b => b.available).length;
    const issuedCount = totalCount - availCount;

    return `
      <tr>
        <td><strong style="color:var(--gold-soft);">#CAT-${c.categoryId}</strong></td>
        <td>
          <div style="font-weight:700; font-size:0.95rem;">${escapeHtml(c.categoryName)}</div>
        </td>
        <td style="color:var(--text-secondary); font-size:0.825rem; max-width:320px;">
          ${escapeHtml(c.description || 'Subject collection for academic and general reading.')}
        </td>
        <td><strong>${totalCount}</strong></td>
        <td><span class="status-pill available">${availCount}</span></td>
        <td><span class="status-pill ${issuedCount > 0 ? 'borrowed' : 'info'}">${issuedCount}</span></td>
        <td>
          <div style="display:flex; gap:0.4rem; align-items:center;">
            <button class="btn btn-secondary btn-sm" onclick="viewCategoryBooks('${escapeHtml(c.categoryName)}')" title="View Books in Category">📚 View Books</button>
            <button class="btn btn-secondary btn-sm" onclick="openEditCategoryModal(${c.categoryId})" title="Edit Category">✏️</button>
            <button class="btn btn-secondary btn-sm" style="color:var(--danger);" onclick="handleDeleteCategory(${c.categoryId})" title="Delete Category">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function viewCategoryBooks(catName) {
  selectCategoryFilter(catName);
  switchNav('books');
}

// ========================================================
// 7. REPORTS & ANALYTICS CHARTS RENDERING
// ========================================================
function renderReports() {
  const totalBooks = state.books.length;
  const availableBooks = state.books.filter(b => b.available).length;
  const booksIssued = totalBooks - availableBooks;

  const today = new Date().toISOString().split('T')[0];
  const activeBorrows = state.borrows.filter(b => b.status === 'BORROWED');
  const overdueBorrows = activeBorrows.filter(b => b.dueDate && b.dueDate < today);
  const returnedBorrows = state.borrows.filter(b => b.status === 'RETURNED');

  const paidFines = state.fines.filter(f => f.paid);
  const collectedFines = paidFines.reduce((s, f) => s + (f.amount || 0), 0);

  document.getElementById('repTotalBooks').textContent = totalBooks;
  document.getElementById('repBooksIssued').textContent = booksIssued;
  document.getElementById('repBooksReturned').textContent = returnedBorrows.length;
  document.getElementById('repOverdueBooks').textContent = overdueBorrows.length;
  document.getElementById('repTotalMembers').textContent = state.members.length;
  document.getElementById('repFineCollection').textContent = formatCurrency(collectedFines);

  renderMonthlyBorrowingChart();
  renderAvailabilityDonutChart(availableBooks, booksIssued);
  renderCategoryBreakdownBars();
  renderComplianceChart(returnedBorrows.length, overdueBorrows.length);
}

// SVG Chart: Monthly Borrowing Trend
function renderMonthlyBorrowingChart() {
  const container = document.getElementById('monthlyBorrowingChart');
  if (!container) return;

  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const values = [28, 42, 35, 60, 48, state.borrows.length || 32];
  const max = Math.max(...values, 80);

  const points = values.map((v, i) => {
    const x = 40 + i * 65;
    const y = 160 - (v / max) * 120;
    return `${x},${y}`;
  }).join(' ');

  container.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 380 180" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGoldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--gold-primary)" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="var(--gold-primary)" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <!-- Grid Lines -->
      <line x1="30" y1="40" x2="370" y2="40" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="30" y1="100" x2="370" y2="100" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="30" y1="160" x2="370" y2="160" stroke="var(--border)" stroke-width="1"/>
      
      <!-- Area Fill -->
      <polygon points="40,160 ${points} 365,160" fill="url(#chartGoldGrad)" />
      
      <!-- Line Path -->
      <polyline points="${points}" fill="none" stroke="var(--gold-primary)" stroke-width="2.5" stroke-linecap="round"/>
      
      <!-- Dots & Labels -->
      ${values.map((v, i) => {
        const x = 40 + i * 65;
        const y = 160 - (v / max) * 120;
        return `
          <circle cx="${x}" cy="${y}" r="4" fill="var(--gold-bright)" stroke="var(--bg-card)" stroke-width="2"/>
          <text x="${x}" y="175" fill="var(--text-secondary)" font-size="10" text-anchor="middle" font-family="var(--font-family)">${months[i]}</text>
        `;
      }).join('')}
    </svg>
  `;
}

// SVG Chart: Availability Donut
function renderAvailabilityDonutChart(avail, issued) {
  const container = document.getElementById('availabilityDonutChart');
  if (!container) return;

  const total = (avail + issued) || 1;
  const availPercent = Math.round((avail / total) * 100);
  const issuedPercent = 100 - availPercent;

  container.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:center; gap:2rem; width:100%;">
      <svg width="130" height="130" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border-subtle)" stroke-width="4"></circle>
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--success)" stroke-width="4"
          stroke-dasharray="${availPercent} ${100 - availPercent}" stroke-dashoffset="25"></circle>
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--gold-primary)" stroke-width="4"
          stroke-dasharray="${issuedPercent} ${100 - issuedPercent}" stroke-dashoffset="${25 - availPercent}"></circle>
        <text x="50%" y="54%" text-anchor="middle" fill="var(--text-primary)" font-size="7" font-weight="bold">${availPercent}%</text>
        <text x="50%" y="65%" text-anchor="middle" fill="var(--text-secondary)" font-size="3">Available</text>
      </svg>
      <div style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.825rem;">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="width:10px; height:10px; border-radius:50%; background:var(--success);"></span>
          <span style="color:var(--text-secondary);">Available: <strong>${avail} (${availPercent}%)</strong></span>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="width:10px; height:10px; border-radius:50%; background:var(--gold-primary);"></span>
          <span style="color:var(--text-secondary);">Issued: <strong>${issued} (${issuedPercent}%)</strong></span>
        </div>
      </div>
    </div>
  `;
}

// Category Breakdown Bars
function renderCategoryBreakdownBars() {
  const container = document.getElementById('categoryBreakdownBars');
  if (!container) return;

  const total = state.books.length || 1;
  const categoryMap = new Map();
  if (Array.isArray(state.categories)) {
    state.categories.forEach(c => {
      if (c && c.categoryName) {
        const key = normalizeCategory(c.categoryName);
        if (!categoryMap.has(key)) {
          categoryMap.set(key, c);
        }
      }
    });
  }
  const categories = Array.from(categoryMap.values()).slice(0, 5);

  if (categories.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-secondary); padding:1.5rem;">No category data available.</div>`;
    return;
  }

  container.innerHTML = categories.map(c => {
    const targetNorm = normalizeCategory(c.categoryName);
    const count = state.books.filter(b => b.bookCategory && normalizeCategory(b.bookCategory.categoryName) === targetNorm).length;
    const pct = Math.round((count / total) * 100);

    return `
      <div class="bar-stat-row">
        <div class="bar-stat-label-wrap">
          <strong>${escapeHtml(c.categoryName)}</strong>
          <span>${count} books (${pct}%)</span>
        </div>
        <div class="bar-progress-track">
          <div class="bar-progress-fill" style="width: ${pct}%; background: var(--gold-primary);"></div>
        </div>
      </div>
    `;
  }).join('');
}

// Compliance Ratio Meter
function renderComplianceChart(returned, overdue) {
  const container = document.getElementById('complianceRatioChart');
  if (!container) return;

  const total = (returned + overdue) || 1;
  const onTimePct = Math.round((returned / total) * 100) || 85;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
      <div style="font-size:2.8rem; font-weight:800; color:var(--gold-primary); line-height:1;">
        ${onTimePct}%
      </div>
      <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.4rem;">
        On-Time Return Compliance Rate
      </div>
      <div style="display:flex; gap:1.5rem; margin-top:1.25rem; font-size:0.8rem;">
        <span style="color:var(--success);">● ${returned} On-Time Returns</span>
        <span style="color:var(--danger);">● ${overdue} Overdue Loans</span>
      </div>
    </div>
  `;
}

// ========================================================
// 8. SETTINGS TABS
// ========================================================
function switchSettingsTab(tabKey) {
  document.querySelectorAll('.settings-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-settings-tab') === tabKey);
  });

  document.querySelectorAll('.settings-section-pane').forEach(pane => {
    pane.style.display = pane.id === `settingsSection_${tabKey}` ? 'block' : 'none';
  });
}

// ========================================================
// 9. CIRCULATION TRANSACTIONS (ISSUE & RETURN)
// ========================================================
function openIssueModal(preselectedBookId = null) {
  const bookSelect = document.getElementById('issueBookSelect');
  const memberSelect = document.getElementById('issueMemberSelect');

  const availableBooks = state.books.filter(b => b.available);
  if (availableBooks.length === 0) {
    showToast('No books are currently available to issue.', 'warning');
    return;
  }

  if (state.members.length === 0) {
    showToast('No registered members found. Please register a member first.', 'warning');
    openAddMemberModal();
    return;
  }

  bookSelect.innerHTML = availableBooks.map(b => `
    <option value="${b.bookId}" ${preselectedBookId && b.bookId === preselectedBookId ? 'selected' : ''}>
      ${escapeHtml(b.title)} (${escapeHtml(b.author || 'Author')})
    </option>
  `).join('');

  memberSelect.innerHTML = state.members.map(m => `
    <option value="${m.memberId}">
      ${escapeHtml(m.name)} (${m.membershipType || 'STUDENT'}) - ${escapeHtml(m.email || m.phone || '')}
    </option>
  `).join('');

  updateIssueDueDatePreview();
  openModal('issueModal');
}

function updateIssueDueDatePreview() {
  const days = parseInt(document.getElementById('issueDaysInput')?.value || 14);
  const target = new Date();
  target.setDate(target.getDate() + days);
  const preview = document.getElementById('issueDueDatePreview');
  if (preview) {
    preview.textContent = target.toLocaleDateString('en-IN', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}

async function submitIssueBook(e) {
  e.preventDefault();
  const bookId = document.getElementById('issueBookSelect').value;
  const memberId = document.getElementById('issueMemberSelect').value;
  const days = document.getElementById('issueDaysInput').value;

  try {
    const res = await authFetch(API.borrows, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, memberId, days })
    });

    if (res.ok) {
      closeModal('issueModal');
      showToast('Book successfully issued to member!', 'success');
      await loadAllData();
    } else {
      const err = await res.text();
      showToast(err || 'Failed to issue book', 'danger');
    }
  } catch (err) {
    showToast('Network error while issuing book', 'danger');
  }
}

let activeReturnBorrowId = null;

function openReturnModal(borrowId) {
  const borrow = state.borrows.find(b => b.borrowId === borrowId);
  if (!borrow) return;

  activeReturnBorrowId = borrowId;

  document.getElementById('returnModalBookTitle').textContent = borrow.book ? borrow.book.title : 'Unknown';
  document.getElementById('returnModalMemberName').textContent = borrow.member ? borrow.member.name : 'Unknown';
  document.getElementById('returnModalIssueDate').textContent = borrow.borrowDate || '—';
  document.getElementById('returnModalDueDate').textContent = borrow.dueDate || '—';

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = borrow.dueDate && borrow.dueDate < today;

  const fineNotice = document.getElementById('returnFineNotice');
  if (isOverdue) {
    const diffDays = Math.ceil((new Date(today) - new Date(borrow.dueDate)) / (1000 * 60 * 60 * 24));
    const calculatedFine = diffDays * 5.0; // ₹5 per day
    fineNotice.style.display = 'block';
    fineNotice.innerHTML = `
      <div style="background:var(--danger-bg); border:1px solid var(--danger); border-radius:var(--radius-md); padding:0.85rem; color:var(--text-main);">
        <strong>⚠️ Book is ${diffDays} day(s) overdue!</strong>
        <p style="font-size:0.85rem; margin-top:0.25rem;">
          An automated late return penalty of <strong style="color:var(--danger);">${formatCurrency(calculatedFine)}</strong> will be assessed to the member ledger.
        </p>
      </div>
    `;
  } else {
    fineNotice.style.display = 'none';
  }

  openModal('returnModal');
}

async function confirmReturnBook() {
  if (!activeReturnBorrowId) return;

  try {
    const res = await authFetch(`${API.borrows}/${activeReturnBorrowId}/return`, {
      method: 'POST'
    });

    if (res.ok) {
      closeModal('returnModal');
      showToast('Book returned successfully and marked available on shelves!', 'success');
      await loadAllData();
    } else {
      const msg = await res.text();
      showToast(msg || 'Failed to return book', 'danger');
    }
  } catch (err) {
    showToast('Error processing return', 'danger');
  }
}

// Pay Fine
async function handlePayFine(fineId) {
  try {
    const res = await authFetch(`${API.fines}/${fineId}/pay`, { method: 'POST' });
    if (res.ok) {
      showToast('Payment recorded successfully! Fine status marked as PAID.', 'success');
      await loadAllData();
    } else {
      showToast('Failed to record fine payment', 'danger');
    }
  } catch (e) {
    showToast('Network error processing fine payment', 'danger');
  }
}

// ========================================================
// 10. CRUD MODALS (BOOKS, MEMBERS, CATEGORIES)
// ========================================================
function openAddBookModal() {
  document.getElementById('bookModalTitle').textContent = 'Add New Book';
  document.getElementById('bookFormId').value = '';
  document.getElementById('bookFormTitle').value = '';
  document.getElementById('bookFormAuthor').value = '';
  document.getElementById('bookFormIsbn').value = '';
  document.getElementById('bookFormRack').value = '';
  document.getElementById('bookFormYear').value = new Date().getFullYear();
  document.getElementById('bookFormCover').value = '';
  document.getElementById('bookFormDesc').value = '';

  populateCategorySelect('bookFormCategory');
  openModal('bookModal');
}

function openEditBookModal(bookId) {
  const book = state.books.find(b => b.bookId === bookId);
  if (!book) return;

  document.getElementById('bookModalTitle').textContent = 'Edit Book Details';
  document.getElementById('bookFormId').value = book.bookId;
  document.getElementById('bookFormTitle').value = book.title || '';
  document.getElementById('bookFormAuthor').value = book.author || '';
  document.getElementById('bookFormIsbn').value = book.isbn || '';
  document.getElementById('bookFormRack').value = book.locationRack || '';
  document.getElementById('bookFormYear').value = book.publicationYear || '';
  document.getElementById('bookFormCover').value = book.coverImageUrl || '';
  document.getElementById('bookFormDesc').value = book.description || '';

  populateCategorySelect('bookFormCategory', book.bookCategory ? book.bookCategory.categoryId : null);
  openModal('bookModal');
}

function populateCategorySelect(selectId, selectedId = null) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const seen = new Map();
  if (Array.isArray(state.categories)) {
    state.categories.forEach(c => {
      if (c && c.categoryName) {
        const key = normalizeCategory(c.categoryName);
        if (!seen.has(key) || c.categoryId === selectedId) {
          seen.set(key, c);
        }
      }
    });
  }
  const uniqueCats = Array.from(seen.values());
  select.innerHTML = uniqueCats.map(c => `
    <option value="${c.categoryId}" ${selectedId && selectedId === c.categoryId ? 'selected' : ''}>
      ${escapeHtml(c.categoryName)}
    </option>
  `).join('');
}

async function submitBookForm(e) {
  e.preventDefault();
  const id = document.getElementById('bookFormId').value;
  const categoryId = document.getElementById('bookFormCategory').value;

  const payload = {
    title: document.getElementById('bookFormTitle').value.trim(),
    author: document.getElementById('bookFormAuthor').value.trim(),
    isbn: document.getElementById('bookFormIsbn').value.trim(),
    locationRack: document.getElementById('bookFormRack').value.trim(),
    publicationYear: parseInt(document.getElementById('bookFormYear').value) || null,
    coverImageUrl: document.getElementById('bookFormCover').value.trim(),
    description: document.getElementById('bookFormDesc').value.trim(),
    available: true,
    bookCategory: categoryId ? { categoryId: Number(categoryId) } : null
  };

  const url = id ? `${API.books}/${id}` : API.books;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await authFetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal('bookModal');
      showToast(id ? 'Book details updated!' : 'New book added to library collection!', 'success');
      await loadAllData();
    } else {
      showToast('Error saving book details', 'danger');
    }
  } catch (err) {
    showToast('Failed to connect to server', 'danger');
  }
}

async function handleDeleteBook(id) {
  if (!confirm('Are you sure you want to delete this book from the catalog?')) return;
  try {
    const res = await authFetch(`${API.books}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Book removed from library catalog', 'success');
      await loadAllData();
    } else {
      showToast('Cannot delete book while loan records reference it', 'danger');
    }
  } catch (e) {
    showToast('Error deleting book', 'danger');
  }
}

// Members Modal
function openAddMemberModal() {
  document.getElementById('memberModalTitle').textContent = 'Add New Member';
  document.getElementById('memberFormId').value = '';
  document.getElementById('memberFormName').value = '';
  document.getElementById('memberFormEmail').value = '';
  document.getElementById('memberFormPhone').value = '';
  document.getElementById('memberFormType').value = 'STUDENT';
  openModal('memberModal');
}

function openEditMemberModal(memberId) {
  const m = state.members.find(x => x.memberId === memberId);
  if (!m) return;

  document.getElementById('memberModalTitle').textContent = 'Edit Member Details';
  document.getElementById('memberFormId').value = m.memberId;
  document.getElementById('memberFormName').value = m.name || '';
  document.getElementById('memberFormEmail').value = m.email || '';
  document.getElementById('memberFormPhone').value = m.phone || '';
  document.getElementById('memberFormType').value = m.membershipType || 'STUDENT';
  openModal('memberModal');
}

async function submitMemberForm(e) {
  e.preventDefault();
  const id = document.getElementById('memberFormId').value;
  const payload = {
    name: document.getElementById('memberFormName').value.trim(),
    email: document.getElementById('memberFormEmail').value.trim(),
    phone: document.getElementById('memberFormPhone').value.trim(),
    membershipType: document.getElementById('memberFormType').value,
    status: 'ACTIVE'
  };

  const url = id ? `${API.members}/${id}` : API.members;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await authFetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal('memberModal');
      showToast(id ? 'Member updated successfully!' : 'New member registered!', 'success');
      await loadAllData();
    } else {
      showToast('Error saving member', 'danger');
    }
  } catch (err) {
    showToast('Failed to save member', 'danger');
  }
}

async function handleDeleteMember(id) {
  if (!confirm('Are you sure you want to delete this member?')) return;
  try {
    const res = await authFetch(`${API.members}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Member removed from registry', 'success');
      await loadAllData();
    } else {
      showToast('Cannot delete member with active records', 'danger');
    }
  } catch (e) {
    showToast('Error deleting member', 'danger');
  }
}

// Category Modal
function openAddCategoryModal() {
  document.getElementById('categoryModalTitle').textContent = 'Add Category';
  document.getElementById('categoryFormId').value = '';
  document.getElementById('categoryFormName').value = '';
  document.getElementById('categoryFormDesc').value = '';
  openModal('categoryModal');
}

function openEditCategoryModal(id) {
  const cat = state.categories.find(c => c.categoryId === id);
  if (!cat) return;
  document.getElementById('categoryModalTitle').textContent = 'Edit Category';
  document.getElementById('categoryFormId').value = cat.categoryId;
  document.getElementById('categoryFormName').value = cat.categoryName || '';
  document.getElementById('categoryFormDesc').value = cat.description || '';
  openModal('categoryModal');
}

async function submitCategoryForm(e) {
  e.preventDefault();
  const id = document.getElementById('categoryFormId').value;
  const payload = {
    categoryName: document.getElementById('categoryFormName').value.trim(),
    description: document.getElementById('categoryFormDesc').value.trim()
  };

  const url = id ? `${API.bookCategories || API.categories}/${id}` : (API.bookCategories || API.categories);
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await authFetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal('categoryModal');
      showToast(id ? 'Category updated!' : 'New category created!', 'success');
      await loadAllData();
    } else {
      showToast('Failed to save category', 'danger');
    }
  } catch (err) {
    showToast('Error communicating with server', 'danger');
  }
}

async function handleDeleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category?')) return;
  try {
    const res = await authFetch(`${API.categories}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Category deleted', 'success');
      await loadAllData();
    } else {
      showToast('Cannot delete category (may be assigned to books)', 'danger');
    }
  } catch (e) {
    showToast('Error deleting category', 'danger');
  }
}

// ========================================================
// BOOK DETAILS MODAL
// ========================================================
function openBookDetailsModal(bookId) {
  const book = state.books.find(b => b.bookId === bookId);
  if (!book) return;

  const isAvail = book.available !== false;
  const isStaffOrAdmin = !authState.user || (authState.user.role === 'ADMIN' || authState.user.role === 'LIBRARIAN');

  const titleEl = document.getElementById('bookDetailModalTitle');
  if (titleEl) titleEl.textContent = 'Book Details • ' + (book.title || 'Untitled');
  
  const coverBox = document.getElementById('bookDetailCoverBox');
  if (coverBox) {
    if (book.coverImageUrl) {
      coverBox.innerHTML = `<img src="${escapeHtml(book.coverImageUrl)}" alt="Cover" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;" onerror="this.src=''; this.parentElement.innerHTML='📖';">`;
    } else {
      coverBox.innerHTML = `<div style="font-size:2.8rem; text-align:center; padding:1.5rem 0;">📖</div>`;
    }
  }

  const bookDetailTitle = document.getElementById('bookDetailTitle');
  if (bookDetailTitle) bookDetailTitle.textContent = book.title || 'Untitled';

  const bookDetailAuthor = document.getElementById('bookDetailAuthor');
  if (bookDetailAuthor) bookDetailAuthor.textContent = `by ${book.author || 'Unknown Author'}`;

  const bookDetailCategory = document.getElementById('bookDetailCategory');
  if (bookDetailCategory) bookDetailCategory.textContent = book.bookCategory ? book.bookCategory.categoryName : 'General';

  const bookDetailIsbn = document.getElementById('bookDetailIsbn');
  if (bookDetailIsbn) bookDetailIsbn.textContent = book.isbn || '—';

  const bookDetailPublisher = document.getElementById('bookDetailPublisher');
  if (bookDetailPublisher) bookDetailPublisher.textContent = book.publisher || 'Standard Academic Edition';

  const bookDetailYear = document.getElementById('bookDetailYear');
  if (bookDetailYear) bookDetailYear.textContent = book.publicationYear || '—';

  const bookDetailRack = document.getElementById('bookDetailRack');
  if (bookDetailRack) bookDetailRack.textContent = book.locationRack || 'General Stacks';
  
  const statusEl = document.getElementById('bookDetailStatus');
  if (statusEl) {
    statusEl.innerHTML = isAvail
      ? `<span class="status-pill available">✓ Available (1 / 1)</span>`
      : `<span class="status-pill borrowed">Checked Out (0 / 1)</span>`;
  }

  const descEl = document.getElementById('bookDetailDesc');
  if (descEl) descEl.textContent = book.description || 'No detailed overview registered for this volume.';

  // Borrow history for this book
  const historyEl = document.getElementById('bookDetailBorrowHistory');
  if (historyEl) {
    const bookBorrows = state.borrows.filter(b => b.book && b.book.bookId === bookId);
    if (bookBorrows.length === 0) {
      historyEl.innerHTML = `<div style="color:var(--text-muted); font-style:italic;">No circulation records on file for this title.</div>`;
    } else {
      historyEl.innerHTML = bookBorrows.slice(0, 5).map(b => {
        const isCurrent = b.status === 'BORROWED';
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.45rem 0; border-bottom:1px solid rgba(255,255,255,0.04);">
            <div>
              <strong style="color:var(--text-main);">${escapeHtml(b.member ? b.member.name : 'Unknown Member')}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary);">Issued: ${b.borrowDate || '—'} &bull; Due: ${b.dueDate || '—'}</div>
            </div>
            <span class="status-pill ${isCurrent ? 'issued' : 'available'}">${isCurrent ? 'Active Loan' : 'Returned'}</span>
          </div>
        `;
      }).join('');
    }
  }

  // Action buttons
  const editBtn = document.getElementById('bookDetailEditBtn');
  if (editBtn) {
    editBtn.onclick = () => {
      closeModal('bookDetailsModal');
      openEditBookModal(book.bookId);
    };
  }

  const deleteBtn = document.getElementById('bookDetailDeleteBtn');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      closeModal('bookDetailsModal');
      handleDeleteBook(book.bookId);
    };
  }

  const issueBtn = document.getElementById('bookDetailIssueBtn');
  if (issueBtn) {
    if (isAvail && isStaffOrAdmin) {
      issueBtn.style.display = 'inline-flex';
      issueBtn.onclick = () => {
        closeModal('bookDetailsModal');
        openIssueModal(book.bookId);
      };
    } else {
      issueBtn.style.display = 'none';
    }
  }

  openModal('bookDetailsModal');
}

// ========================================================
// MEMBER DETAILS MODAL
// ========================================================
function openMemberDetailsModal(memberId) {
  const member = state.members.find(m => m.memberId === memberId);
  if (!member) return;

  const initials = member.name ? member.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'MB';
  const rollId = 'SCH-' + String(1000 + member.memberId);
  const classDept = member.membershipType === 'FACULTY' ? 'Faculty Department' : 'Academic Class';

  const avatarEl = document.getElementById('memDetailAvatar');
  if (avatarEl) avatarEl.textContent = initials;

  const nameEl = document.getElementById('memDetailName');
  if (nameEl) nameEl.textContent = member.name || 'Member Profile';
  
  const roleBadge = document.getElementById('memDetailRoleBadge');
  if (roleBadge) {
    roleBadge.textContent = member.membershipType || 'STUDENT';
    roleBadge.className = `status-pill ${member.membershipType === 'FACULTY' ? 'active' : 'info'}`;
  }

  const idEl = document.getElementById('memDetailId');
  if (idEl) idEl.textContent = `#MB-${member.memberId}`;
  
  const statusBadge = document.getElementById('memDetailStatusBadge');
  if (statusBadge) {
    statusBadge.textContent = member.status || 'ACTIVE';
    statusBadge.className = `status-pill ${member.status === 'ACTIVE' ? 'available' : 'overdue'}`;
  }

  const emailEl = document.getElementById('memDetailEmail');
  if (emailEl) emailEl.textContent = member.email || '—';

  const phoneEl = document.getElementById('memDetailPhone');
  if (phoneEl) phoneEl.textContent = member.phone || '—';

  const deptEl = document.getElementById('memDetailDept');
  if (deptEl) deptEl.textContent = classDept;

  const rollEl = document.getElementById('memDetailRoll');
  if (rollEl) rollEl.textContent = rollId;

  // Active Loans
  const activeLoans = state.borrows.filter(b => b.member && b.member.memberId === memberId && b.status === 'BORROWED');
  const activeLoansEl = document.getElementById('memDetailActiveLoans');
  if (activeLoansEl) {
    if (activeLoans.length === 0) {
      activeLoansEl.innerHTML = `<div style="color:var(--text-muted); font-style:italic;">No books currently borrowed.</div>`;
    } else {
      const today = new Date().toISOString().split('T')[0];
      activeLoansEl.innerHTML = activeLoans.map(b => {
        const isOverdue = b.dueDate && b.dueDate < today;
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.45rem 0; border-bottom:1px solid rgba(255,255,255,0.04);">
            <div>
              <strong style="color:var(--text-main);">${escapeHtml(b.book ? b.book.title : 'Book')}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary);">Due: ${b.dueDate || '—'}</div>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span class="status-pill ${isOverdue ? 'overdue' : 'issued'}">${isOverdue ? 'Overdue' : 'Active'}</span>
              <button type="button" class="btn btn-secondary btn-sm" onclick="closeModal('memberDetailsModal'); openReturnModal(${b.borrowId})">Return</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Loan history & Fines
  const historyEl = document.getElementById('memDetailLoanHistory');
  if (historyEl) {
    const allMemberBorrows = state.borrows.filter(b => b.member && b.member.memberId === memberId);
    const memberFines = state.fines.filter(f => f.member && f.member.memberId === memberId);
    const unpaidFinesSum = memberFines.filter(f => !f.paid).reduce((s, f) => s + (f.amount || 0), 0);

    let html = `<div style="margin-bottom:0.75rem; display:flex; gap:1.25rem; font-size:0.8rem; color:var(--text-secondary);">
      <span>Total Borrowings: <strong style="color:var(--text-main);">${allMemberBorrows.length}</strong></span>
      <span>Outstanding Fines: <strong style="color:${unpaidFinesSum > 0 ? 'var(--danger)' : 'var(--success)'};">${formatCurrency(unpaidFinesSum)}</strong></span>
    </div>`;

    if (allMemberBorrows.length === 0) {
      html += `<div style="color:var(--text-muted); font-style:italic;">No past circulation transactions recorded.</div>`;
    } else {
      html += allMemberBorrows.slice(0, 4).map(b => `
        <div style="display:flex; justify-content:space-between; font-size:0.785rem; padding:0.35rem 0; border-bottom:1px solid rgba(255,255,255,0.04);">
          <span>${escapeHtml(b.book ? b.book.title : 'Book')}</span>
          <span style="color:var(--text-muted);">${b.borrowDate || '—'} &bull; ${b.status}</span>
        </div>
      `).join('');
    }
    historyEl.innerHTML = html;
  }

  const editBtn = document.getElementById('memDetailEditBtn');
  if (editBtn) {
    editBtn.onclick = () => {
      closeModal('memberDetailsModal');
      openEditMemberModal(member.memberId);
    };
  }

  openModal('memberDetailsModal');
}

// ========================================================
// 11. DEMO DATA SEED & RESET
// ========================================================
async function handleSeedDemo() {
  try {
    showToast('Populating AUREVIA with rich sample library data...', 'info');
    const res = await authFetch(`${API.demo}/seed`, { method: 'POST' });
    if (res.ok) {
      showToast('Sample books, members, and circulation data loaded!', 'success');
      await loadAllData();
    } else {
      showToast('Could not seed data', 'danger');
    }
  } catch (e) {
    showToast('Error loading sample data', 'danger');
  }
}

async function handleResetDb() {
  if (!confirm('⚠️ WARNING: This will clear all books, loans, members, and fines. Continue?')) return;
  try {
    const res = await authFetch(`${API.demo}/reset`, { method: 'POST' });
    if (res.ok) {
      showToast('Database reset to clean state', 'warning');
      await loadAllData();
    }
  } catch (e) {
    showToast('Error resetting database', 'danger');
  }
}

// ========================================================
// 12. GLOBAL COMMAND PALETTE (Ctrl + K)
// ========================================================
function openCommandPalette() {
  openModal('commandPaletteModal');
  const input = document.getElementById('commandPaletteInput');
  if (input) {
    input.value = '';
    input.focus();
    renderCommandResults('');
  }
}

function renderCommandResults(query) {
  const container = document.getElementById('commandPaletteResults');
  if (!container) return;

  const views = [
    { name: 'Dashboard Overview', view: 'dashboard', icon: '📊' },
    { name: 'Books Catalog', view: 'books', icon: '📚' },
    { name: 'Issue & Return Desk', view: 'circulation', icon: '🔄' },
    { name: 'Members Directory', view: 'members', icon: '👥' },
    { name: 'Fines & Dues Ledger', view: 'fines', icon: '💰' },
    { name: 'Categories Management', view: 'categories', icon: '🏷️' },
    { name: 'Reports & Analytics', view: 'reports', icon: '📈' },
    { name: 'Users & Staff', view: 'users', icon: '👤' },
    { name: 'Settings & Policies', view: 'settings', icon: '⚙️' }
  ];

  let itemsHtml = '';

  // Quick navigation match
  const matchedViews = views.filter(v => !query || v.name.toLowerCase().includes(query));
  if (matchedViews.length > 0) {
    itemsHtml += `<div style="font-size:0.7rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; padding:0.4rem 0.85rem; letter-spacing:0.04em;">Navigation</div>`;
    itemsHtml += matchedViews.slice(0, 4).map(v => `
      <div class="command-item" onclick="selectCommandView('${v.view}')">
        <div class="command-item-left">
          <span>${v.icon}</span>
          <strong>${v.name}</strong>
        </div>
        <span class="kbd-shortcut">Jump</span>
      </div>
    `).join('');
  }

  // Books match
  if (query) {
    const matchedBooks = state.books.filter(b => b.title && b.title.toLowerCase().includes(query)).slice(0, 3);
    if (matchedBooks.length > 0) {
      itemsHtml += `<div style="font-size:0.7rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; padding:0.4rem 0.85rem; letter-spacing:0.04em; margin-top:0.4rem;">Books</div>`;
      itemsHtml += matchedBooks.map(b => `
        <div class="command-item" onclick="selectCommandBook(${b.bookId})">
          <div class="command-item-left">
            <span>📖</span>
            <div>
              <strong>${escapeHtml(b.title)}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(b.author || 'Author')}</div>
            </div>
          </div>
          <span class="status-pill ${b.available ? 'available' : 'borrowed'}">${b.available ? 'Available' : 'Issued'}</span>
        </div>
      `).join('');
    }

    // Members match
    const matchedMembers = state.members.filter(m => m.name && m.name.toLowerCase().includes(query)).slice(0, 3);
    if (matchedMembers.length > 0) {
      itemsHtml += `<div style="font-size:0.7rem; font-weight:700; color:var(--text-secondary); text-transform:uppercase; padding:0.4rem 0.85rem; letter-spacing:0.04em; margin-top:0.4rem;">Members</div>`;
      itemsHtml += matchedMembers.map(m => `
        <div class="command-item" onclick="selectCommandMember(${m.memberId})">
          <div class="command-item-left">
            <span>👤</span>
            <div>
              <strong>${escapeHtml(m.name)}</strong>
              <div style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(m.email || m.phone || '')}</div>
            </div>
          </div>
          <span class="status-pill info">${m.membershipType || 'STUDENT'}</span>
        </div>
      `).join('');
    }
  }

  container.innerHTML = itemsHtml || `<div style="padding:1.5rem; text-align:center; color:var(--text-secondary); font-size:0.85rem;">No matching commands, books, or members found.</div>`;
}

function selectCommandView(viewKey) {
  closeModal('commandPaletteModal');
  switchNav(viewKey);
}

function selectCommandBook(bookId) {
  closeModal('commandPaletteModal');
  switchNav('books');
  openEditBookModal(bookId);
}

function selectCommandMember(memberId) {
  closeModal('commandPaletteModal');
  switchNav('members');
  openEditMemberModal(memberId);
}

// Modal Open/Close Utilities
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}
