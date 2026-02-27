# 📰 Notas Pro - Compartilhamento em Jornal Público

Uma plataforma de notas moderna que permite **compartilhar suas notas com o mundo em um elegante formato de jornal antigo**.

## ✨ Novo Recurso: Compartilhamento em Jornal

### O que é?
Transforme suas anotações em um **jornal público compartilhável**, com design vintage e estilo de jornal antigo. Todas as notas compartilhadas aparecem em uma única página pública chamada `public.html`.

### Como Usar?

#### 1️⃣ Criar e Editar uma Nota
- Clique em "Nova Nota" no sidebar
- Adicione um título e conteúdo
- Clique em "Salvar"

#### 2️⃣ Compartilhar como Jornal
- Après salvar a nota, clique no botão **"📰 Compartilhar"** na barra de ações
- Uma janela modal abrirá mostrando:
  - Visualização de como sua nota aparecerá no jornal
  - Link público compartilhável
  - Estatísticas das notas compartilhadas (total de notas, caracteres, categorias)
  
#### 3️⃣ Compartilhar o Link
- Copie o link com o botão "Copiar Link"
- Envie para seus amigos/colegas
- Compartilhe em redes sociais ou qualquer lugar

#### 4️⃣ Ver o Jornal Público
- Acesse `public.html` no seu navegador
- Verá todas as notas em um formato de **jornal antigo com:**
  - Cabeçalho estilizado
  - Colunas de 2 páginas (como jornal de verdade)
  - Fonts vintage (Playfair Display, Crimson Text, EB Garamond)
  - Efeito de papel envelhecido
  - Data de publicação

### 📐 Design do Jornal

O jornal público inclui:
- ✅ Fontes elegantes e vintage (estilo jornal de 1920)
- ✅ Layout em colunas duplas (como jornal real)
- ✅ Efeito de papel antigo/envelhecido
- ✅ Bordas douradas
- ✅ Cabeçalho com data
- ✅ Seções por tags
- ✅ Atualização em tempo real (a cada 5 segundos)

### 🎯 Características

#### No App Principal (`index.html`):
- Botão "📰 Compartilhar" em cada nota
- Modal de compartilhamento com preview
- Visualização de estatísticas
- Link direto para o jornal público

#### Na Página Pública (`public.html`):
- Design totalmente em estilo jornal antigo
- Sem necessidade de conta ou login
- Atualizável em tempo real
- Responsivo para celular
- Pronto para imprimir

### 🔧 Funcionalidades do Gerenciador de Jornal

O arquivo `newspaper.js` fornece:

```javascript
// Compartilhar nota
newspaper.shareNote(note);

// Deixar de compartilhar
newspaper.unshareNote(noteId);

// Verificar se está compartilhada
newspaper.isShared(noteId);

// Obter link público
newspaper.getPublicLink();

// Exportar notas como JSON
newspaper.exportAsJSON();

// Importar notas de arquivo
newspaper.importFromJSON(file);

// Obter estatísticas
newspaper.getStats();

// Limpar todas
newspaper.clearSharedNotes();
```

### 📊 Armazenamento

Todas as notas compartilhadas são salvas em **localStorage** com chave: `shared_notes`

Formato:
```json
[
  {
    "id": 1234567890,
    "title": "Título da Nota",
    "content": "Conteúdo completo...",
    "tags": ["Categoria1", "Categoria2"],
    "date": "27/02/2026",
    "sharedAt": "2026-02-27T15:30:00.000Z"
  }
]
```

### 🌐 URLs

- **App Principal**: `index.html` - Editor e gerenciador de notas
- **Jornal Público**: `public.html` - Visualização pública estilo jornal

### 📱 Responsividade

- ✅ Desktop: Design em 2 colunas
- ✅ Tablet: Adaptação automática
- ✅ Mobile: Layout coluna única

### 🎨 Cores e Estilo

**Palheta de Cores (Jornal Antigo)**:
- Fundo: Cores ouro/bege envelhecido (#D4AF37, #f5f1e8)
- Texto: Marrom escuro antigo (#2c1810)
- Bordas: Dourado (#a68a4a, #D4AF37)
- Acentos: Dourado clássico

### 📝 Exemplo de Uso

1. Escreva uma nota sobre "Dicas de Produtividade"
2. Clique em "📰 Compartilhar"
3. Veja a preview no formato jornal
4. Copie e compartilhe o link para `public.html`
5. Todos verão sua nota em um jornal elegante e profissional!

### 🔐 Privacidade

- Apenas notas que você **compartilha explicitamente** aparecem no jornal
- Suas notas pessoais permanecem privadas
- Tudo funciona localmente no seu navegador
- Nenhum dado é enviado para servidores externosHere is the markdown formatted README.md content with Portuguese (Brazil) locale.

### ⚡ Dicas

- 💡 Crie uma nota "Editorial" como introdução do seu jornal
- 🏷️ Use tags para categorizar as notas por seção
- 📸 Compartilhe screenshots do jornal em redes sociais
- 🔗 Use o link público em sua bio ou site
- 📨 Envie regularmente para sua lista de contatos

### 🚀 Roadmap Futuro

- [ ] Editar layout do jornal (cores, fontes)
- [ ] Templates adicionais de jornal
- [ ] Exportar para PDF
- [ ] Agêndar publicações
- [ ] Analytics de visualizações
- [ ] Comentários nos artigos

---

**Aproveite o Notas Pro e crie jornais incríveis! 📰✨**
