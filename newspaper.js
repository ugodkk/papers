/**
 * Gerenciador de Compartilhamento em Estilo Jornal
 * Permite compartilhar notas como jornais públicos
 */

class NewspaperManager {
    constructor() {
        this.sharedNotesKey = 'shared_notes';
        this.publicURL = './public.html';
    }

    /**
     * Marca uma nota como compartilhada publicamente
     */
    shareNote(note) {
        try {
            const sharedNotes = this.getSharedNotes();
            
            // Verificar se já está compartilhada
            const exists = sharedNotes.some(n => n.id === note.id);
            if (exists) {
                return { success: false, message: 'Nota já está compartilhada' };
            }

            // Adicionar nota compartilhada
            const sharedNote = {
                id: note.id,
                title: note.title,
                content: note.body,
                tags: note.tags || [],
                date: new Date().toLocaleDateString('pt-BR'),
                sharedAt: new Date().toISOString()
            };

            sharedNotes.push(sharedNote);
            localStorage.setItem(this.sharedNotesKey, JSON.stringify(sharedNotes));

            return { 
                success: true, 
                message: 'Nota compartilhada com sucesso!',
                publicURL: this.publicURL
            };
        } catch (error) {
            console.error('Erro ao compartilhar nota:', error);
            return { success: false, message: 'Erro ao compartilhar' };
        }
    }

    /**
     * Remove uma nota do compartilhamento público
     */
    unshareNote(noteId) {
        try {
            let sharedNotes = this.getSharedNotes();
            sharedNotes = sharedNotes.filter(n => n.id !== noteId);
            localStorage.setItem(this.sharedNotesKey, JSON.stringify(sharedNotes));
            
            return { success: true, message: 'Compartilhamento removido' };
        } catch (error) {
            console.error('Erro ao remover compartilhamento:', error);
            return { success: false, message: 'Erro ao remover' };
        }
    }

    /**
     * Obtém todas as notas compartilhadas
     */
    getSharedNotes() {
        try {
            return JSON.parse(localStorage.getItem(this.sharedNotesKey) || '[]');
        } catch {
            return [];
        }
    }

    /**
     * Verifica se uma nota está compartilhada
     */
    isShared(noteId) {
        const sharedNotes = this.getSharedNotes();
        return sharedNotes.some(n => n.id === noteId);
    }

    /**
     * Gera um link compartilhável
     */
    getPublicLink() {
        return window.location.origin + window.location.pathname.replace('index.html', 'public.html');
    }

    /**
     * Exporta notas compartilhadas como JSON
     */
    exportAsJSON() {
        const sharedNotes = this.getSharedNotes();
        const dataStr = JSON.stringify(sharedNotes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `jornal-notas-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Importa notas compartilhadas de um arquivo JSON
     */
    async importFromJSON(file) {
        try {
            const text = await file.text();
            const importedNotes = JSON.parse(text);
            
            if (!Array.isArray(importedNotes)) {
                throw new Error('Formato inválido');
            }

            const currentNotes = this.getSharedNotes();
            const merged = [...currentNotes];

            importedNotes.forEach(note => {
                if (!merged.some(n => n.id === note.id)) {
                    merged.push(note);
                }
            });

            localStorage.setItem(this.sharedNotesKey, JSON.stringify(merged));
            return { success: true, message: `${importedNotes.length} notas importadas` };
        } catch (error) {
            return { success: false, message: 'Erro ao importar: ' + error.message };
        }
    }

    /**
     * Gera estatísticas do jornal
     */
    getStats() {
        const sharedNotes = this.getSharedNotes();
        const tags = {};
        
        sharedNotes.forEach(note => {
            if (note.tags) {
                note.tags.forEach(tag => {
                    tags[tag] = (tags[tag] || 0) + 1;
                });
            }
        });

        return {
            totalNotes: sharedNotes.length,
            totalCharacters: sharedNotes.reduce((sum, n) => sum + (n.content?.length || 0), 0),
            tags: tags,
            lastUpdated: sharedNotes.length > 0 ? sharedNotes[sharedNotes.length - 1].sharedAt : null
        };
    }

    /**
     * Limpa todas as notas compartilhadas
     */
    clearSharedNotes() {
        localStorage.setItem(this.sharedNotesKey, JSON.stringify([]));
        return { success: true, message: 'Todas as notas foram removidas' };
    }
}

// Instância global
const newspaper = new NewspaperManager();
