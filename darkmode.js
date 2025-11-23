// darkmode.js
// Maneja la alternancia de tema, persistencia en localStorage y sincronización del botón #theme-toggle
(function () {
  const THEME_KEY = 'smartbudget-theme'; // 'dark' | 'light'
  const FONT_SIZE_KEY = 'smartbudget-font-size'; // 80, 100, 120
  const CLASS = 'dark';

  function applyTheme(isDark) {
    document.body.classList.toggle(CLASS, Boolean(isDark));
    // Actualizar toggle switch en settings
    const toggleSwitch = document.getElementById('theme-toggle-switch');
    if (toggleSwitch) {
      toggleSwitch.classList.toggle('active', isDark);
    }
  }

  function appliFontSize(size) {
    // Convertir tamaño en porcentaje a escala (80% = 0.8, 100% = 1, 120% = 1.2)
    const scale = size / 100;
    document.documentElement.style.setProperty('--font-size-scale', scale);
    
    // Actualizar botones activos
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    if (size === 80) {
      const smallBtn = document.getElementById('size-small');
      if (smallBtn) smallBtn.classList.add('active');
    } else if (size === 100) {
      const mediumBtn = document.getElementById('size-medium');
      if (mediumBtn) mediumBtn.classList.add('active');
    } else if (size === 120) {
      const largeBtn = document.getElementById('size-large');
      if (largeBtn) largeBtn.classList.add('active');
    }
    
    // Actualizar display
    const sizeDisplay = document.getElementById('size-display');
    if (sizeDisplay) {
      sizeDisplay.textContent = size + '%';
    }
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function getSavedFontSize() {
    try {
      const saved = localStorage.getItem(FONT_SIZE_KEY);
      return saved ? parseInt(saved) : 100;
    } catch (e) {
      return 100;
    }
  }

  function saveTheme(isDark) {
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
  }

  function saveFontSize(size) {
    try {
      localStorage.setItem(FONT_SIZE_KEY, size.toString());
    } catch (e) {
      // ignore
    }
  }

  function detectPreferredDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function toggleTheme() {
    const isDark = !document.body.classList.contains(CLASS);
    applyTheme(isDark);
    saveTheme(isDark);
    // Dispatch an event so other scripts (charts, components) can react
    try {
      document.dispatchEvent(new CustomEvent('theme-change', { detail: { dark: isDark } }));
    } catch (e) {}

    // If page has functions to refresh charts, call them
    try {
      if (window.transactionManager && typeof window.transactionManager.updateCharts === 'function') {
        window.transactionManager.updateCharts();
      }
    } catch (e) {}
    try {
      if (typeof window.updateCharts === 'function') {
        window.updateCharts();
      }
    } catch (e) {}
  }

  function changeFontSize(newSize) {
    appliFontSize(newSize);
    saveFontSize(newSize);
  }

  function toggleSettingsDropdown() {
    const dropdown = document.getElementById('settings-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  }

  function closeSettingsDropdown() {
    const dropdown = document.getElementById('settings-dropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
    }
  }

  function init() {
    const saved = getSavedTheme();
    const isDark = saved ? (saved === 'dark') : detectPreferredDark();
    const savedFontSize = getSavedFontSize();
    
    applyTheme(isDark);
    appliFontSize(savedFontSize);
    
    // Establecer el scale inicial en la variable CSS
    const initialScale = savedFontSize / 100;
    document.documentElement.style.setProperty('--font-size-scale', initialScale);
    
    // Notificar estado inicial para que componentes (gráficas) puedan ajustarse
    try {
      document.dispatchEvent(new CustomEvent('theme-change', { detail: { dark: isDark } }));
    } catch (e) {}
    try { if (window.transactionManager && typeof window.transactionManager.updateCharts === 'function') window.transactionManager.updateCharts(); } catch(e) {}
    try { if (typeof window.updateCharts === 'function') window.updateCharts(); } catch(e) {}

    // Toggle settings dropdown
    const settingsToggle = document.getElementById('settings-toggle');
    if (settingsToggle) {
      settingsToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSettingsDropdown();
      });
    }

    // Toggle theme desde el switch del menú
    const themeToggleSwitch = document.getElementById('theme-toggle-switch');
    if (themeToggleSwitch) {
      themeToggleSwitch.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    }

    // Botones de tamaño de fuente
    const sizeSmallBtn = document.getElementById('size-small');
    if (sizeSmallBtn) {
      sizeSmallBtn.addEventListener('click', (e) => {
        e.preventDefault();
        changeFontSize(80);
      });
    }

    const sizeMediumBtn = document.getElementById('size-medium');
    if (sizeMediumBtn) {
      sizeMediumBtn.addEventListener('click', (e) => {
        e.preventDefault();
        changeFontSize(100);
      });
    }

    const sizeLargeBtn = document.getElementById('size-large');
    if (sizeLargeBtn) {
      sizeLargeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        changeFontSize(120);
      });
    }

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      const settingsMenu = document.querySelector('.settings-menu');
      if (settingsMenu && !settingsMenu.contains(e.target)) {
        closeSettingsDropdown();
      }
    });

    // Habilitar botón de logout si existe (redirige a login.html)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        // Opcional: limpiar datos de sesión si aplica
        // localStorage.removeItem('smartBudgetAuth');
        window.location.href = 'login.html';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
