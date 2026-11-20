import { DEFAULT_ENGINES } from './engines.js';

const STORAGE_KEY = 'engines';
const ROOT_ID = 'search-root';
const ITEM_PREFIX = 'engine:';

const defaultEngines = () =>
  DEFAULT_ENGINES.map((engine) => ({ ...engine, enabled: true }));

async function loadEngines() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : null;
}

// 首次使用（或数据被清空）时写入内置引擎。
async function ensureEngines() {
  const engines = await loadEngines();
  if (engines !== null) return engines;
  const seeded = defaultEngines();
  await chrome.storage.local.set({ [STORAGE_KEY]: seeded });
  return seeded;
}

function createMenuItem(props) {
  chrome.contextMenus.create(props, () => {
    if (chrome.runtime.lastError) {
      console.error('创建右键菜单失败:', chrome.runtime.lastError.message);
    }
  });
}

// 菜单重建串行执行，避免 removeAll 和 create 交错导致重复项。
let queue = Promise.resolve();

function rebuildMenus() {
  queue = queue.then(doRebuildMenus, doRebuildMenus);
}

async function doRebuildMenus() {
  const engines = (await ensureEngines()).filter(
    (engine) => engine.enabled !== false && engine.name && engine.url
  );

  await new Promise((resolve) => chrome.contextMenus.removeAll(resolve));

  createMenuItem({
    id: ROOT_ID,
    title: '搜索',
    contexts: ['selection']
  });

  for (const engine of engines) {
    createMenuItem({
      id: ITEM_PREFIX + engine.id,
      parentId: ROOT_ID,
      title: engine.name,
      contexts: ['selection']
    });
  }
}

async function handleSearch(engineId, rawText) {
  const text = (rawText || '').trim();
  if (!text) return;

  const engines = await ensureEngines();
  const engine = engines.find((item) => item.id === engineId);
  if (!engine) return;

  const url = engine.url.split('%s').join(encodeURIComponent(text));
  try {
    new URL(url);
  } catch {
    console.error('搜索地址无效:', url);
    return;
  }
  await chrome.tabs.create({ url });
}

chrome.contextMenus.onClicked.addListener((info) => {
  if (typeof info.menuItemId !== 'string') return;
  if (!info.menuItemId.startsWith(ITEM_PREFIX)) return;
  handleSearch(info.menuItemId.slice(ITEM_PREFIX.length), info.selectionText);
});

chrome.runtime.onInstalled.addListener(() => {
  ensureEngines().then(rebuildMenus, console.error);
});

chrome.runtime.onStartup.addListener(rebuildMenus);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEY]) rebuildMenus();
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Service Worker 每次被唤醒时也重建一次，避免菜单与配置不一致。
rebuildMenus();
