const editor = document.getElementById('editor');
const saveBtn = document.getElementById('save-btn');
const copyBtn = document.getElementById('copy-btn');
const themeToggle = document.getElementById('theme-toggle');

// load saved content
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('note');
  if (saved) {
    editor.innerHTML = saved;
  }
  // set theme from preference or default dark
  const theme = localStorage.getItem('theme') || 'dark';
  document.body.classList.toggle('light', theme === 'light');
  themeToggle.textContent = theme === 'light' ? '🌞' : '🌙';
});

// save content to localStorage
saveBtn.addEventListener('click', () => {
  localStorage.setItem('note', editor.innerHTML);
  alert('Salvo!');
});

// copy to clipboard
copyBtn.addEventListener('click', async () => {
  try {
    const text = editor.innerText;
    await navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência');
  } catch (err) {
    console.error(err);
    alert('Falha ao copiar');
  }
});

// theme toggle
themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  themeToggle.textContent = isLight ? '🌞' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});
