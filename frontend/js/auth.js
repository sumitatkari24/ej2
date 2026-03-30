const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  if (!name || !email || !password) {
    alert('❌ Please fill in all fields');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Creating Account...';

  try {
    console.log('📝 Registering:', email);
    
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    console.log('Response status:', response.status);
    const data = await response.json();

    if (response.ok && data.token) {
      console.log('✅ Registration successful');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = '/dashboard';
    } else {
      console.error('Registration failed:', data.message);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      alert('❌ ' + (data.message || 'Registration failed'));
    }
  } catch (error) {
    console.error('Register error:', error);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    alert('❌ Error: ' + error.message);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  if (!email || !password) {
    alert('❌ Please fill in all fields');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Signing In...';

  try {
    console.log('🔑 Logging in:', email);
    
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    console.log('Response status:', response.status);
    const data = await response.json();

    if (response.ok && data.token) {
      console.log('✅ Login successful');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = '/dashboard';
    } else {
      console.error('Login failed:', data.message);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      alert('❌ ' + (data.message || 'Login failed'));
    }
  } catch (error) {
    console.error('Login error:', error);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    alert('❌ Error: ' + error.message);
  }
}