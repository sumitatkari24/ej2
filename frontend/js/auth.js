const API_BASE = '/api';

// Helper function with timeout
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server not responding');
    }
    throw error;
  }
}

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
    alert('Please fill in all fields');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';

  try {
    console.log('Registering:', email);
    const response = await fetchWithTimeout(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    
    console.log('Register response status:', response.status);
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      alert('Server error: ' + (text || 'Unknown error'));
      return;
    }
    
    if (response.ok) {
      console.log('Registration successful');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = '/dashboard';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      alert(data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Register error:', error);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    alert('Error: ' + error.message);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing In...';

  try {
    console.log('Attempting login with:', email);
    const response = await fetchWithTimeout(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    }, 10000);
    
    console.log('Login response status:', response.status);
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      alert('Server error: ' + (text || 'Unknown error'));
      return;
    }
    
    if (response.ok) {
      console.log('Login successful');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = '/dashboard';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    alert('Error: ' + error.message);
  }
}
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      alert('Server error: ' + text);
      throw new Error('Invalid server response');
    }
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      window.location.href = '/dashboard';
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    alert('Error: ' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}