import { defaultEngines, mergeEngines } from './engines.js';

const STORAGE_KEY = 'engines';
const SCHEMA_KEY = 'enginesSchema';
const SCHEMA_VERSION = 2;
const ROOT_ID = 'search-root';
const ITEM_PREFIX = 'engine:';
const SETTINGS_ID = 'menu-settings';
const SETTINGS_SEP_ID = 'menu-settings-separator';

const t = (key) => chrome.i18n.getMessage(key) || key;

async function loadEngines() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : null;
}

// 首次使用时写入内置引擎；老版本升级时把新增的内置引擎合并进列表。
async function ensureEngines() {
  const data = await chrome.storage.local.get([STORAGE_KEY, SCHEMA_KEY]);
  const stored = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : null;

  if (stored === null) {
    const seeded = defaultEngines();
    await chrome.storage.local.set({
      [STORAGE_KEY]: seeded,
      [SCHEMA_KEY]: SCHEMA_VERSION
    });
    return seeded;
  }

  if ((data[SCHEMA_KEY] || 1) >= SCHEMA_VERSION) return stored;

  const merged = mergeEngines(stored);

  await chrome.storage.local.set({
    [STORAGE_KEY]: merged,
    [SCHEMA_KEY]: SCHEMA_VERSION
  });
  return merged;
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
    title: t('menuTitle'),
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

  if (engines.length > 0) {
    createMenuItem({
      id: SETTINGS_SEP_ID,
      parentId: ROOT_ID,
      type: 'separator',
      contexts: ['selection']
    });
  }
  createMenuItem({
    id: SETTINGS_ID,
    parentId: ROOT_ID,
    title: t('menuEdit'),
    contexts: ['selection']
  });
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
  if (info.menuItemId === SETTINGS_ID) {
    chrome.runtime.openOptionsPage();
    return;
  }
  if (!info.menuItemId.startsWith(ITEM_PREFIX)) return;
  handleSearch(info.menuItemId.slice(ITEM_PREFIX.length), info.selectionText);
});

chrome.runtime.onInstalled.addListener(() => {
  ensureEngines().then(rebuildMenus, console.error);
  chrome.action.setTitle({ title: t('actionTitle') });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.action.setTitle({ title: t('actionTitle') });
  rebuildMenus();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEY]) rebuildMenus();
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// Service Worker 每次被唤醒时也重建一次，避免菜单与配置不一致。
rebuildMenus();
