/**
 * IndexedDB Database Manager
 * Suporta armazenamento ilimitado (> 500k caracteres)
 */

class NotesDB {
  constructor() {
    this.dbName = 'NotesProDB';
    this.version = 1;
    this.db = null;
  }

  /**
   * Inicializa o IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Object Store: Notes
        if (!db.objectStoreNames.contains('notes')) {
          const notesStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
          notesStore.createIndex('title', 'title', { unique: false });
          notesStore.createIndex('createdAt', 'createdAt', { unique: false });
          notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Object Store: Settings
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Salva uma nota completa
   */
  async saveNote(note) {
    const tx = this.db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    
    const fullNote = {
      ...note,
      updatedAt: new Date().getTime(),
      createdAt: note.createdAt || new Date().getTime()
    };

    return new Promise((resolve, reject) => {
      const request = note.id ? store.put(fullNote) : store.add(fullNote);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Obtém uma nota pelo ID
   */
  async getNote(id) {
    const tx = this.db.transaction('notes', 'readonly');
    const store = tx.objectStore('notes');

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Obtém todas as notas
   */
  async getAllNotes() {
    const tx = this.db.transaction('notes', 'readonly');
    const store = tx.objectStore('notes');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Deleta uma nota
   */
  async deleteNote(id) {
    const tx = this.db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Busca notas por título
   */
  async searchNotes(query) {
    const allNotes = await this.getAllNotes();
    return allNotes.filter(note => 
      note.title?.toLowerCase().includes(query.toLowerCase()) ||
      note.content?.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Salva uma configuração
   */
  async saveSetting(key, value) {
    const tx = this.db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');

    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Obtém uma configuração
   */
  async getSetting(key) {
    const tx = this.db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.value);
    });
  }

  /**
   * Exporta dados como JSON
   */
  async exportData() {
    const notes = await this.getAllNotes();
    return JSON.stringify(notes, null, 2);
  }

  /**
   * Importa dados de JSON
   */
  async importData(jsonString) {
    const notes = JSON.parse(jsonString);
    for (const note of notes) {
      await this.saveNote(note);
    }
  }

  /**
   * Limpa todas as notas
   */
  async clearAllNotes() {
    const tx = this.db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Obtém informações de armazenamento
   */
  async getStorageInfo() {
    if (navigator.storage && navigator.storage.estimate) {
      return await navigator.storage.estimate();
    }
    return { usage: 0, quota: 0 };
  }
}

// Instância global do banco de dados
const db = new NotesDB();
