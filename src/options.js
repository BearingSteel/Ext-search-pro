import { defaultEngines, mergeEngines } from './engines.js';

const STORAGE_KEY = 'engines';
const SCHEMA_KEY = 'enginesSchema';
const SCHEMA_VERSION = 2;
const $ = (id) => document.getElementById(id);
const t = (key) => chrome.i18n.getMessage(key) || key;

const listEl = $('list');
const emptyEl = $('empty');
const formEl = $('form');
const nameEl = $('name');
const urlEl = $('url');
const msgEl = $('msg');
const submitBtn = $('submit');
const cancelBtn = $('cancel');
const formTitle = $('form-title');
const restoreBtn = $('restore');

let engines = [];
let editingId = null;
let msgTimer = 0;

function localize() {
  const lang = chrome.i18n.getUILanguage();
  document.documentElement.lang = lang;
  document.title = t('optionsTitle');

  for (const el of document.querySelectorAll('[data-i18n]')) {
    const text = chrome.i18n.getMessage(el.dataset.i18n);
    if (text) el.textContent = text;
  }
  for (const el of document.querySelectorAll('[data-i18n-placeholder]')) {
    const text = chrome.i18n.getMessage(el.dataset.i18nPlaceholder);
    if (text) el.placeholder = text;
  }
}

async function load() {
  const data = await chrome.storage.local.get([STORAGE_KEY, SCHEMA_KEY]);
  if (Array.isArray(data[STORAGE_KEY])) {
    engines = data[STORAGE_KEY];
    if ((data[SCHEMA_KEY] || 1) < SCHEMA_VERSION) {
      engines = mergeEngines(engines);
      await save();
      await chrome.storage.local.set({ [SCHEMA_KEY]: SCHEMA_VERSION });
    }
  } else {
    engines = defaultEngines();
    await save();
    await chrome.storage.local.set({ [SCHEMA_KEY]: SCHEMA_VERSION });
  }
  render();
}

async function save() {
  await chrome.storage.local.set({ [STORAGE_KEY]: engines });
}

function setMsg(text, isError = false) {
  msgEl.textContent = text;
  msgEl.classList.toggle('error', isError);
  clearTimeout(msgTimer);
  if (text) {
    msgTimer = setTimeout(() => {
      msgEl.textContent = '';
      msgEl.classList.remove('error');
    }, 4000);
  }
}

function iconNode(engine) {
  const box = document.createElement('span');
  box.className = 'ico';
  if (engine.icon) {
    const img = document.createElement('img');
    // 存储里的路径相对扩展根目录，设置页在 src/ 下
    img.src = engine.icon.startsWith('icons/') ? '../' + engine.icon : engine.icon;
    img.alt = '';
    box.appendChild(img);
  } else {
    box.classList.add('letter');
    box.textContent = (engine.name || '?').trim().charAt(0).toUpperCase();
  }
  return box;
}

function render() {
  listEl.textContent = '';
  emptyEl.hidden = engines.length > 0;

  engines.forEach((engine) => {
    const li = document.createElement('li');
    li.className = 'item' + (engine.enabled === false ? ' off' : '');

    const meta = document.createElement('div');
    meta.className = 'meta';
    const name = document.createElement('strong');
    name.textContent = engine.name;
    const url = document.createElement('small');
    url.textContent = engine.url;
    url.title = engine.url;
    meta.append(name, url);

    const toggleLabel = document.createElement('label');
    toggleLabel.className = 'toggle';
    toggleLabel.title = t('toggleTitle');
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = engine.enabled !== false;
    toggle.addEventListener('change', () => {
      engine.enabled = toggle.checked;
      li.classList.toggle('off', !toggle.checked);
      save();
    });
    toggleLabel.append(toggle, document.createTextNode(t('enableLabel')));

    const ops = document.createElement('div');
    ops.className = 'ops';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'ghost small';
    editBtn.textContent = t('editBtn');
    editBtn.addEventListener('click', () => startEdit(engine));

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'ghost small danger';
    delBtn.textContent = t('deleteBtn');
    delBtn.addEventListener('click', () => remove(engine));

    ops.append(editBtn, delBtn);
    li.append(iconNode(engine), meta, toggleLabel, ops);
    listEl.appendChild(li);
  });
}

function startEdit(engine) {
  editingId = engine.id;
  nameEl.value = engine.name;
  urlEl.value = engine.url;
  formTitle.textContent = t('editHeading');
  submitBtn.textContent = t('saveBtn');
  cancelBtn.hidden = false;
  setMsg('');
  nameEl.focus();
  formEl.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetForm() {
  editingId = null;
  formEl.reset();
  formTitle.textContent = t('addHeading');
  submitBtn.textContent = t('addBtn');
  cancelBtn.hidden = true;
  setMsg('');
}

async function remove(engine) {
  if (!confirm(chrome.i18n.getMessage('confirmDelete', [engine.name]))) return;
  engines = engines.filter((item) => item.id !== engine.id);
  await save();
  if (editingId === engine.id) resetForm();
  render();
  setMsg(t('msgDeleted'));
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = nameEl.value.trim();
  const url = urlEl.value.trim();

  if (!name) return setMsg(t('errName'), true);
  if (!url.includes('%s')) return setMsg(t('errPlaceholder'), true);

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return setMsg(t('errInvalidUrl'), true);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return setMsg(t('errProtocol'), true);
  }

  if (editingId) {
    const engine = engines.find((item) => item.id === editingId);
    if (engine) {
      engine.name = name;
      engine.url = url;
    }
  } else {
    engines.push({
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      url,
      enabled: true
    });
  }

  await save();
  resetForm();
  render();
  setMsg(t('msgSaved'));
});

cancelBtn.addEventListener('click', resetForm);

restoreBtn.addEventListener('click', async () => {
  if (!confirm(t('confirmRestore'))) return;
  engines = defaultEngines();
  await save();
  resetForm();
  render();
  setMsg(t('msgRestored'));
});

localize();
load();
