// Elements
const editor = document.getElementById('editor');
const saveBtn = document.getElementById('save-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const themeToggle = document.getElementById('theme-toggle');
const notification = document.getElementById('notification');
const saveIndicator = document.getElementById('save-indicator');
const charCount = document.getElementById('char-count');

// State
let isSaving = false;
let autoSaveTimeout;
const AUTO_SAVE_DELAY = 1000; // 1 second
const STORAGE_KEY = 'note_content';
const THEME_KEY = 'app_theme';

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  initializeTheme();
  updateCharCount();
  
  // Focus editor on load
  if (!getStoredContent()) {
    editor.focus();
  }
});

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('light', !isDark);
  themeToggle.setAttribute('data-state', theme);
  themeToggle.setAttribute('aria-label', 
    isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'
  );
  localStorage.setItem(THEME_KEY, theme);
}

themeToggle.addEventListener('click', () => {
  const currentTheme = localStorage.getItem(THEME_KEY) || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  showNotification('Tema alterado', 'success');
});

// ============================================================================
// CONTENT MANAGEMENT
// ============================================================================

function getStoredContent() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

function loadContent() {
  const stored = getStoredContent();
  if (stored) {
    editor.textContent = stored; // Use textContent to prevent XSS
  }
}

function saveContent() {
  const content = editor.textContent;
  localStorage.setItem(STORAGE_KEY, content);
}

function updateCharCount() {
  const count = editor.textContent.trim().length;
  charCount.textContent = `${count} caracteres`;
}

// ============================================================================
// AUTO-SAVE WITH DEBOUNCE
// ============================================================================

function debouncedAutoSave() {
  clearTimeout(autoSaveTimeout);
  setSavingState(true);
  
  autoSaveTimeout = setTimeout(() => {
    saveContent();
    setSavingState(false);
  }, AUTO_SAVE_DELAY);
}

function setSavingState(saving) {
  isSaving = saving;
  saveIndicator.classList.toggle('saving', saving);
  saveIndicator.classList.remove('saved');
  
  if (!saving) {
    setTimeout(() => {
      saveIndicator.classList.add('saved');
      setTimeout(() => {
        saveIndicator.classList.remove('saved');
      }, 1500);
    }, 100);
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Editor input
editor.addEventListener('input', () => {
  updateCharCount();
  debouncedAutoSave();
});

// Save button
saveBtn.addEventListener('click', () => {
  saveContent();
  saveBtn.classList.add('loading');
  setTimeout(() => {
    saveBtn.classList.remove('loading');
    showNotification('✓ Nota salva com sucesso', 'success');
    setSavingState(false);
  }, 300);
});

// Copy button
copyBtn.addEventListener('click', async () => {
  try {
    const text = editor.textContent;
    
    if (!text.trim()) {
      showNotification('Nada para copiar', 'warning');
      return;
    }
    
    await navigator.clipboard.writeText(text);
    showNotification('✓ Copiado para a área de transferência', 'success');
    
    // Visual feedback
    copyBtn.classList.add('loading');
    setTimeout(() => {
      copyBtn.classList.remove('loading');
    }, 300);
  } catch (err) {
    console.error('Falha ao copiar:', err);
    showNotification('✗ Falha ao copiar', 'error');
  }
});

// Clear button
clearBtn.addEventListener('click', () => {
  if (editor.textContent.trim() === '') {
    showNotification('Não há nada para limpar', 'warning');
    return;
  }
  
  if (confirm('Tem certeza que deseja limpar tudo? Esta ação é irreversível.')) {
    editor.textContent = '';
    saveContent();
    updateCharCount();
    showNotification('✓ Conteúdo limpo', 'success');
    editor.focus();
  }
});

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S: Save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveBtn.click();
  }
  
  // Ctrl/Cmd + Shift + C: Copy
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'c') {
    e.preventDefault();
    copyBtn.click();
  }
});

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

/**
 * Shows a notification toast
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', or 'warning'
 * @param {number} duration - Display duration in ms (default 3000)
 */
function showNotification(message, type = 'success', duration = 3000) {
  notification.textContent = message;
  notification.className = 'notification show ' + type;
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

// ============================================================================
// UTILITIES
// ============================================================================

// Prevent loss of data
window.addEventListener('beforeunload', (e) => {
  if (isSaving) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
});

// Sync across tabs/windows
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY && e.newValue !== editor.textContent) {
    editor.textContent = e.newValue || '';
    updateCharCount();
    showNotification('ℹ️ Nota atualizada em outro aberto', 'warning', 2000);
  }
  
  if (e.key === THEME_KEY && e.newValue) {
    applyTheme(e.newValue);
  }
});
