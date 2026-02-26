/**
 * Notas Pro - Main Application Script
 * Orquestra todos os componentes e funcionalidades
 */

// ============================================================================
// INICIALIZAÇÃO GLOBAL
// ============================================================================

let editor, sidebar, modals, settings, colorPicker, onboarding;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Inicializar temas
    UIComponents.loadTheme();

    // Inicializar banco de dados
    await db.init();
    console.log('✓ IndexedDB inicializado');

    // Inicializar componentes
    initializeSystems();
    setupEventListeners();
    loadInitialNote();

    // Mostrar onboarding se necessário
    const isOnboarded = localStorage.getItem('onboarded') === 'true';
    if (!isOnboarded) {
      UIComponents.disableBodyScroll();
    }

  } catch (error) {
    console.error('Erro na inicialização:', error);
    UIComponents.showNotification('✗ Erro ao inicializar aplicação', 'error');
  }
});

// ============================================================================
// INICIALIZAÇÃO DE SISTEMAS
// ============================================================================

function initializeSystems() {
  // Editor
  editor = new EditorManager();

  // Sidebar
  sidebar = new SidebarManager();
  sidebar.init();

  // Modais
  modals = new ModalManager();
  modals.init();

  // Configurações
  settings = new SettingsManager();
  settings.init();

  // Color Picker
  colorPicker = new ColorPickerManager();
  colorPicker.init();

  // Onboarding
  onboarding = new OnboardingManager();
  onboarding.init();
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    searchBtn: document.getElementById('search-btn'),
    newNoteBtn: document.getElementById('new-note-btn'),
    saveBtn: document.getElementById('save-btn'),
    copyBtn: document.getElementById('copy-btn'),
    exportBtn: document.getElementById('export-btn'),
    deleteBtn: document.getElementById('delete-btn'),
    skipOnboarding: document.getElementById('skip-onboarding'),
    editorInput: document.getElementById('editor'),
    noteTitleInput: document.getElementById('note-title')
  };

  // Tema
  elements.themeToggle.addEventListener('click', () => {
    const theme = UIComponents.toggleTheme();
    UIComponents.showNotification(`Modo ${theme === 'dark' ? 'escuro' : 'claro'} ativado`);
  });

  // Busca
  elements.searchBtn.addEventListener('click', toggleSearchBar);

  // Nova nota
  elements.newNoteBtn.addEventListener('click', createNewNote);

  // Ações do editor
  elements.saveBtn.addEventListener('click', () => editor.saveNote());
  elements.copyBtn.addEventListener('click', () => editor.copy());
  elements.exportBtn.addEventListener('click', () => editor.export());
  elements.deleteBtn.addEventListener('click', () => editor.clear());

  // Onboarding
  elements.skipOnboarding.addEventListener('click', () => {
    onboarding.complete();
  });

  // Input do editor
  elements.editorInput.addEventListener('input', () => {
    editor.updateStats();
    editor.autoSave();
  });

  elements.noteTitleInput.addEventListener('input', () => {
    editor.autoSave();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S: Salvar
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      editor.saveNote();
    }

    // Ctrl/Cmd + N: Nova nota
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      createNewNote();
    }

    // Ctrl/Cmd + K: Busca
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleSearchBar();
    }

    // Ctrl/Cmd + B: Bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      editor.applyFormat('bold');
    }

    // Ctrl/Cmd + I: Italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      editor.applyFormat('italic');
    }
  });

  // Toolbar
  document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cmd = e.currentTarget.getAttribute('data-cmd');
      if (cmd) {
        editor.applyFormat(cmd);
        e.currentTarget.classList.toggle('active');
      }
    });
  });

  // Fechar search ao clicar no X
  document.querySelector('.search-bar .btn-icon')?.addEventListener('click', closeSearchBar);

  // Busca ao digitar
  document.getElementById('search-input')?.addEventListener('input', (e) => {
    const query = e.target.value;
    if (query.length > 0) {
      searchNotes(query);
    }
  });
}

// ============================================================================
// FUNÇÕES DE EDITOR
// ============================================================================

/**
 * Carrega a primeira nota ou cria uma nova
 */
async function loadInitialNote() {
  try {
    const notes = await db.getAllNotes();
    if (notes.length > 0) {
      editor.loadNote(notes[0]);
    } else {
      // Criar nota vazia padrão
      const newNote = {
        title: 'Minha Primeira Nota',
        content: 'Comece a digitar aqui...',
        tags: [],
        starred: false
      };
      const id = await db.saveNote(newNote);
      newNote.id = id;
      editor.loadNote(newNote);
    }
  } catch (error) {
    console.error('Erro ao carregar notas:', error);
    UIComponents.showNotification('✗ Erro ao carregar notas', 'error');
  }
}

/**
 * Cria uma nova nota
 */
async function createNewNote() {
  const newNote = {
    title: `Nota ${new Date().toLocaleDateString('pt-BR')}`,
    content: '',
    tags: [],
    starred: false
  };
  const id = await db.saveNote(newNote);
  newNote.id = id;
  editor.loadNote(newNote);
  editor.updateStats();
  UIComponents.showNotification('✓ Nova nota criada');
  document.getElementById('note-title').focus();
}

// ============================================================================
// FUNÇÕES DE BUSCA
// ============================================================================

function toggleSearchBar() {
  const searchBar = document.querySelector('.search-bar');
  searchBar.classList.toggle('hidden');
  if (!searchBar.classList.contains('hidden')) {
    document.getElementById('search-input').focus();
  }
}

function closeSearchBar() {
  document.querySelector('.search-bar').classList.add('hidden');
}

async function searchNotes(query) {
  try {
    const results = await db.searchNotes(query);
    displaySearchResults(results);
  } catch (error) {
    console.error('Erro na busca:', error);
  }
}

function displaySearchResults(results) {
  // Implementar UI dos resultados de busca
  if (results.length === 0) {
    UIComponents.showNotification('Nenhuma nota encontrada', 'info', 2000);
  } else {
    console.log(`Encontradas ${results.length} notas`);
  }
}

// ============================================================================
// AUTO-SYNC COM OUTRAS ABAS
// ============================================================================

window.addEventListener('storage', (e) => {
  if (e.key === 'theme') {
    UIComponents.loadTheme();
  }
});

// ============================================================================
// SERVICE WORKER (Cache & Offline)
// ============================================================================

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => {
    console.log('Service Worker não disponível:', err);
  });
}

// ============================================================================
// ANTES DE DESCARREGAR (SALVAR QUANDO DEIXAR A PÁG)
// ============================================================================

window.addEventListener('beforeunload', async (e) => {
  if (document.getElementById('save-indicator').classList.contains('saving')) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// ============================================================================
// DETECTAR ONLINE/OFFLINE
// ============================================================================

window.addEventListener('online', () => {
  UIComponents.showNotification('✓ Conexão restaurada', 'success', 2000);
});

window.addEventListener('offline', () => {
  UIComponents.showNotification('⚠ Sem conexão (dados salvos localmente)', 'warning');
});

// ============================================================================
// LOG DE INICIALIZAÇÃO
// ============================================================================

console.log('%c📝 Notas Pro v1.0', 'font-size: 20px; font-weight: bold; color: #3b82f6;');
console.log('%cPlataforma de notas com 500k+ caracteres, IndexedDB, e recursos modernos', 'color: #a0a0a0;');
console.log('%cDicas: Ctrl+S (Salvar), Ctrl+N (Nova), Ctrl+K (Buscar)', 'color: #10b981;');
