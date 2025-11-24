// Cambiar entre formularios
function switchForm(type) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');

  if (type === 'login') {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
  } else {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
  }
}

// Modal recuperación
function openModal() {
  document.getElementById('recoverModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('recoverModal').style.display = 'none';
}

// Recuperar contraseña
function recover() {
  const email = document.getElementById('recover-email').value.trim();
  if (!email) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo vacío',
      text: 'Por favor ingrese su correo electrónico.',
      confirmButtonColor: '#00B894'
    });
    return;
  }

  Swal.fire({
    icon: 'success',
    title: 'Enlace enviado',
    text: `Se ha enviado un enlace de recuperación a: ${email}`,
    confirmButtonColor: '#00B894'
  });
  closeModal();
}

// Registro
async function register() {
  const user = document.getElementById('reg-user').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;

  if (!user || !email || !pass || !pass2) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor complete todos los campos.',
      confirmButtonColor: '#00B894'
    });
    return;
  }

  if (pass !== pass2) {
    Swal.fire({
      icon: 'error',
      title: 'Contraseñas diferentes',
      text: 'Las contraseñas no coinciden.',
      confirmButtonColor: '#00B894'
    });
    return;
  }

  const res = await fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, email, pass })
  });

  const data = await res.json();

  if (res.ok) {
    Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: data.message,
      confirmButtonColor: '#00B894'
    }).then(() => {
      switchForm('login');
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error al registrar',
      text: data.message,
      confirmButtonColor: '#00B894'
    });
  }
}

// Login
async function login() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();

  if (!user || !pass) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos vacíos',
      text: 'Por favor complete ambos campos.',
      confirmButtonColor: '#00B894'
    });
    return;
  }

  const res = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, pass })
  });

  const data = await res.json();

  if (res.ok) {
    console.log('ID usuario desde login:', data.id);
    localStorage.setItem('currentUserId', data.id);
    Swal.fire({
      icon: 'success',
      title: 'Bienvenido',
      text: 'Inicio de sesión exitoso.',
      confirmButtonColor: '#00B894',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      window.location.href = "main.html";
    });
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: data.message,
      confirmButtonColor: '#00B894'
    });
  }
}

// Enlazar el envío por Enter (submit) y prevenir comportamiento por defecto
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      login();
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      register();
    });
  }

  const loginUserInput = document.getElementById('login-user');
  const loginPassInput = document.getElementById('login-pass');
  
  if (loginUserInput) {
    loginUserInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        login();
      }
    });
  }
  
  if (loginPassInput) {
    loginPassInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        login();
      }
    });
  }

  const regUserInput = document.getElementById('reg-user');
  const regEmailInput = document.getElementById('reg-email');
  const regPassInput = document.getElementById('reg-pass');
  const regPass2Input = document.getElementById('reg-pass2');
  
  const handleRegisterEnter = (e) => {
    if (e.key === 'Enter' || e.code === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      register();
    }
  };
  
  if (regUserInput) regUserInput.addEventListener('keydown', handleRegisterEnter);
  if (regEmailInput) regEmailInput.addEventListener('keydown', handleRegisterEnter);
  if (regPassInput) regPassInput.addEventListener('keydown', handleRegisterEnter);
  if (regPass2Input) regPass2Input.addEventListener('keydown', handleRegisterEnter);
  
  console.log('✅ Login script cargado correctamente');
  console.log('✅ Formularios inicializados');
  console.log('✅ Event listeners de Enter añadidos');
});
