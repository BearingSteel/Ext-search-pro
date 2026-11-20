import { DEFAULT_ENGINES } from './engines.js';

const STORAGE_KEY = 'engines';
const $ = (id) => document.getElementById(id);

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

const defaultList = () =>
  DEFAULT_ENGINES.map((engine) => ({ ...engine, enabled: true }));

async function load() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  if (Array.isArray(data[STORAGE_KEY])) {
    engines = data[STORAGE_KEY];
  } else {
    engines = defaultList();
    await save();
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
    toggleLabel.title = '是否显示在右键菜单中';
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = engine.enabled !== false;
    toggle.addEventListener('change', () => {
      engine.enabled = toggle.checked;
      li.classList.toggle('off', !toggle.checked);
      save();
    });
    toggleLabel.append(toggle, document.createTextNode('启用'));

    const ops = document.createElement('div');
    ops.className = 'ops';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'ghost small';
    editBtn.textContent = '编辑';
    editBtn.addEventListener('click', () => startEdit(engine));

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'ghost small danger';
    delBtn.textContent = '删除';
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
  formTitle.textContent = '编辑搜索引擎';
  submitBtn.textContent = '保存';
  cancelBtn.hidden = false;
  setMsg('');
  nameEl.focus();
  formEl.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetForm() {
  editingId = null;
  formEl.reset();
  formTitle.textContent = '添加搜索引擎';
  submitBtn.textContent = '添加';
  cancelBtn.hidden = true;
  setMsg('');
}

async function remove(engine) {
  if (!confirm(`删除「${engine.name}」？`)) return;
  engines = engines.filter((item) => item.id !== engine.id);
  await save();
  if (editingId === engine.id) resetForm();
  render();
  setMsg('已删除');
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = nameEl.value.trim();
  const url = urlEl.value.trim();

  if (!name) return setMsg('请填写名称', true);
  if (!url.includes('%s')) return setMsg('搜索地址里必须包含 %s', true);

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return setMsg('搜索地址不是合法的 URL', true);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return setMsg('只支持 http / https 地址', true);
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
  setMsg('已保存');
});

cancelBtn.addEventListener('click', resetForm);

restoreBtn.addEventListener('click', async () => {
  if (!confirm('恢复内置引擎并删除所有自定义搜索引擎？')) return;
  engines = defaultList();
  await save();
  resetForm();
  render();
  setMsg('已恢复默认');
});

load();
