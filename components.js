/**
 * Components Module
 * Componentes reutilizáveis de UI
 */

class UIComponents {
  /**
   * Mostra uma notificação toast
   */
  static showNotification(message, type = 'success', duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, duration);
  }

  /**
   * Abre um modal
   */
  static openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      this.disableBodyScroll();
    }
  }

  /**
   * Fecha um modal
   */
  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      this.enableBodyScroll();
    }
  }

  /**
   * Desabilita scroll do body
   */
  static disableBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  /**
   * Abilita scroll do body
   */
  static enableBodyScroll() {
    document.body.style.overflow = '';
  }

  /**
   * Alterna classe ativa em elementos
   */
  static toggleActive(selector, className = 'active') {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.remove(className);
    });
  }

  /**
   * Cria um card dinamicamente
   */
  static createCard(title, description, onClick) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3 class="card-title">${title}</h3>
      <p class="card-desc">${description}</p>
    `;
    if (onClick) card.addEventListener('click', onClick);
    return card;
  }

  /**
   * Mostra indicador de salvamento
   */
  static showSaveIndicator(state = 'saving') {
    const indicator = document.getElementById('save-indicator');
    indicator.classList.remove('saving', 'saved');
    if (state === 'saving') {
      indicator.classList.add('saving');
    } else if (state === 'saved') {
      indicator.classList.add('saved');
      setTimeout(() => {
        indicator.classList.remove('saved');
      }, 1500);
    }
  }

  /**
   * Alterna tema claro/escuro
   */
  static toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    document.body.classList.toggle('light');
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
    return newTheme;
  }

  /**
   * Carrega tema salvo
   */
  static loadTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('light', !isDark);
  }
}

/**
 * Editor Manager
 * Gerencia operações do editor
 */
class EditorManager {
  constructor() {
    this.editor = document.getElementById('editor');
    this.currentNote = null;
    this.autoSaveTimeout = null;
  }

  /**
   * Carrega uma nota
   */
  loadNote(note) {
    this.currentNote = note;
    document.getElementById('note-title').value = note.title || '';
    this.editor.textContent = note.content || '';
    this.updateStats();
  }

  /**
   * Salva nota atual
   */
  async saveNote() {
    if (!this.currentNote) {
      this.currentNote = {
        title: '',
        content: '',
        tags: [],
        starred: false
      };
    }

    this.currentNote.title = document.getElementById('note-title').value;
    this.currentNote.content = this.editor.textContent;
    this.currentNote.updatedAt = new Date().getTime();

    try {
      const id = await db.saveNote(this.currentNote);
      if (!this.currentNote.id) {
        this.currentNote.id = id;
      }
      UIComponents.showSaveIndicator('saved');
      UIComponents.showNotification('✓ Nota salva com sucesso');
      return id;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      UIComponents.showNotification('✗ Erro ao salvar', 'error');
    }
  }

  /**
   * Auto-save com debounce
   */
  autoSave() {
    clearTimeout(this.autoSaveTimeout);
    UIComponents.showSaveIndicator('saving');
    this.autoSaveTimeout = setTimeout(() => {
      this.saveNote();
    }, 1000);
  }

  /**
   * Atualiza estatísticas (palavras, caracteres)
   */
  updateStats() {
    const text = this.editor.textContent;
    const chars = text.length;
    const words = text.trim().split(/\s+/).filter(w => w).length;

    document.getElementById('char-count').textContent = `${chars} caracteres`;
    document.getElementById('word-count').textContent = `${words} palavras`;

    // Timestamp
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    document.getElementById('timestamp').textContent = `Salvo às ${time}`;
  }

  /**
   * Copia texto para área de transferência
   */
  async copy() {
    try {
      const text = this.editor.textContent;
      if (!text.trim()) {
        UIComponents.showNotification('Nada para copiar', 'warning');
        return;
      }
      await navigator.clipboard.writeText(text);
      UIComponents.showNotification('✓ Copiado para área de transferência');
    } catch (err) {
      UIComponents.showNotification('✗ Erro ao copiar', 'error');
    }
  }

  /**
   * Exporta nota como arquivo
   */
  export() {
    const title = document.getElementById('note-title').value || 'nota';
    const content = this.editor.textContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    UIComponents.showNotification('✓ Nota exportada');
  }

  /**
   * Limpa editor com confirmação
   */
  async clear() {
    if (!this.editor.textContent.trim()) {
      UIComponents.showNotification('Nada para limpar', 'warning');
      return;
    }

    if (confirm('Tem certeza que deseja limpar tudo? Esta ação é irreversível.')) {
      this.editor.textContent = '';
      this.updateStats();
      await this.saveNote();
      UIComponents.showNotification('✓ Conteúdo limpo');
    }
  }

  /**
   * Aplica formatação (bold, italic, etc)
   */
  applyFormat(command) {
    document.execCommand(command, false, null);
    this.editor.focus();
  }
}

/**
 * Sidebar Manager
 * Gerencia navegação lateral
 */
class SidebarManager {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.sidebarToggle = document.getElementById('sidebar-toggle');
    this.pages = document.querySelectorAll('.page');
  }

  init() {
    // Toggle sidebar em mobile
    this.sidebarToggle.addEventListener('click', () => {
      this.sidebar.classList.toggle('open');
    });

    // Navegação entre páginas
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const page = e.currentTarget.getAttribute('data-page');
        this.showPage(page);
        this.setActive(e.currentTarget);
        this.sidebar.classList.remove('open');
      });
    });
  }

  showPage(pageName) {
    this.pages.forEach(page => {
      page.classList.remove('active');
    });
    const page = document.getElementById(`${pageName}-page`);
    if (page) {
      page.classList.add('active');
    }
  }

  setActive(element) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    element.classList.add('active');
  }
}

/**
 * Modal Manager
 * Gerencia modais e overlays
 */
class ModalManager {
  constructor() {
    this.modals = document.querySelectorAll('.modal');
  }

  init() {
    // Fechar modal ao clicar no overlay
    this.modals.forEach(modal => {
      const overlay = modal.querySelector('.modal-overlay');
      const closeBtn = modal.querySelector('.modal-close');

      overlay?.addEventListener('click', () => {
        modal.classList.add('hidden');
        UIComponents.enableBodyScroll();
      });

      closeBtn?.addEventListener('click', () => {
        modal.classList.add('hidden');
        UIComponents.enableBodyScroll();
      });

      // Fechar com Esc
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
          UIComponents.enableBodyScroll();
        }
      });
    });
  }
}

/**
 * Settings Manager
 * Gerencia configurações da aplicação
 */
class SettingsManager {
  constructor() {
    this.settingsBtn = document.getElementById('settings-btn');
    this.settingsModal = document.getElementById('settings-modal');
    this.tabBtns = document.querySelectorAll('.tab-btn');
  }

  init() {
    this.settingsBtn.addEventListener('click', () => {
      UIComponents.openModal('settings-modal');
    });

    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.currentTarget);
      });
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Tamanho da fonte
    document.getElementById('font-size-select').addEventListener('change', (e) => {
      document.documentElement.style.setProperty('--font-size-base', e.target.value + 'px');
    });

    // Exportar tudo
    document.getElementById('export-all-btn')?.addEventListener('click', async () => {
      const data = await db.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'notas-backup.json';
      a.click();
      URL.revokeObjectURL(url);
      UIComponents.showNotification('✓ Dados exportados');
    });

    // Limpar tudo
    document.getElementById('clear-all-btn')?.addEventListener('click', async () => {
      if (confirm('Tem certeza? Isso deletará TODAS as notas permanentemente!')) {
        await db.clearAllNotes();
        UIComponents.showNotification('✓ Todas as notas deletadas');
      }
    });
  }

  switchTab(element) {
    this.tabBtns.forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    const tabName = element.getAttribute('data-tab');
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    const tabContent = document.getElementById(`${tabName}-tab`);
    if (tabContent) {
      tabContent.classList.add('active');
    }
  }
}

/**
 * Color Picker Manager
 */
class ColorPickerManager {
  constructor() {
    this.colorPickerBtn = document.getElementById('color-picker-btn');
    this.colorPickerModal = document.getElementById('color-picker-modal');
  }

  init() {
    this.colorPickerBtn.addEventListener('click', () => {
      UIComponents.openModal('color-picker-modal');
    });

    // Color presets
    document.querySelectorAll('.color-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.currentTarget.style.background;
        this.applyColor(color);
      });
    });
  }

  applyColor(color) {
    document.execCommand('foreColor', false, color);
    document.getElementById('editor').focus();
    UIComponents.closeModal('color-picker-modal');
  }
}

/**
 * Onboarding Manager
 */
class OnboardingManager {
  constructor() {
    this.onboardingOverlay = document.getElementById('onboarding');
    this.skipBtn = document.getElementById('skip-onboarding');
  }

  init() {
    const onboarded = localStorage.getItem('onboarded') === 'true';
    if (onboarded) {
      this.onboardingOverlay.classList.add('hidden');
    }

    this.skipBtn.addEventListener('click', () => {
      this.complete();
    });
  }

  complete() {
    localStorage.setItem('onboarded', 'true');
    this.onboardingOverlay.classList.add('hidden');
    UIComponents.enableBodyScroll();
  }
}
