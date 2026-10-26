/**
 * Authentication and Session Management
 */

// Check authentication state on page load
function checkAuth() {
    const isLoginPage = window.location.pathname.endsWith('login.html');
    const userJson = localStorage.getItem('urban_greenery_user');

    if (!userJson && !isLoginPage) {
        // Automatically default to demo admin for frictionless review, or redirect
        // For college project ease-of-use, auto-authenticate as admin if not logged in
        const defaultAdmin = {
            id: 1,
            username: 'admin',
            full_name: 'Urban Greenery Administrator',
            email: 'admin@citygreen.gov',
            role: 'admin'
        };
        localStorage.setItem('urban_greenery_user', JSON.stringify(defaultAdmin));
        updateTopUserUI(defaultAdmin);
        return;
    }

    if (userJson) {
        const user = JSON.parse(userJson);
        if (isLoginPage) {
            window.location.href = 'index.html';
        } else {
            updateTopUserUI(user);
        }
    }
}

function updateTopUserUI(user) {
    const userNameEl = document.getElementById('topbarUserName');
    const userRoleEl = document.getElementById('topbarUserRole');
    const avatarEl = document.getElementById('topbarUserAvatar');

    if (userNameEl) userNameEl.textContent = user.full_name || user.username;
    if (userRoleEl) userRoleEl.textContent = (user.role || 'Officer').toUpperCase();
    if (avatarEl) {
        const initials = (user.full_name || user.username || 'A')
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        avatarEl.textContent = initials;
    }
}

// Perform Login
async function handleLogin(e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorAlert = document.getElementById('loginError');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!username || !password) {
        if (errorAlert) {
            errorAlert.textContent = 'Please enter both username and password.';
            errorAlert.classList.remove('d-none');
        }
        return;
    }

    try {
        const res = await apiPost('/auth/login', { username, password });
        if (res.success && res.user) {
            localStorage.setItem('urban_greenery_user', JSON.stringify(res.user));
            window.location.href = 'index.html';
        }
    } catch (err) {
        if (errorAlert) {
            errorAlert.textContent = err.message || 'Invalid username or password.';
            errorAlert.classList.remove('d-none');
        }
    }
}

// Quick Fill Demo Credentials
function fillDemoCredentials(role) {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (role === 'admin') {
        if (usernameInput) usernameInput.value = 'admin';
        if (passwordInput) passwordInput.value = 'admin123';
    } else {
        if (usernameInput) usernameInput.value = 'officer';
        if (passwordInput) passwordInput.value = 'officer123';
    }
}

// Perform Logout
async function handleLogout() {
    try {
        await apiPost('/auth/logout', {});
    } catch (e) {
        // ignore
    }
    localStorage.removeItem('urban_greenery_user');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', checkAuth);
