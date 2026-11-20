# 搜索聚合 · Search Aggregator

一个轻量的 Chrome / Edge 扩展：选中网页文字后右键，在「搜索聚合」子菜单里选择搜索引擎。
A lightweight Chrome / Edge extension: select text on a page, right-click, and search it from the "Search Aggregator" submenu.

[![build](https://github.com/BearingSteel/Ext-search-pro/actions/workflows/build.yml/badge.svg)](https://github.com/BearingSteel/Ext-search-pro/actions/workflows/build.yml)

---

## 中文

### 功能

- 右键选中文字 → **搜索聚合** → 一键跳转对应网站搜索，结果在新标签页打开。
- 内置 18 个搜索源：
  - 国内：百度、搜狗、必应、知乎、微博、Bilibili、抖音、小红书、淘宝、京东
  - 国外：Google、DuckDuckGo、YouTube、GitHub、维基百科、Reddit、X、Stack Overflow
- 自定义搜索引擎：任意网站，只要搜索地址里用 `%s` 占位即可。
- 设置页可添加 / 编辑 / 删除 / 启用停用引擎，一键恢复默认。
- 界面语言跟随浏览器：简体中文环境显示中文，其余环境显示英文。
- 所有配置保存在浏览器本地（`chrome.storage.local`），不上传任何数据。
- 只申请 `contextMenus` 和 `storage` 权限，不需要访问网页内容。

### 安装

1. 打开 [Releases](https://github.com/BearingSteel/Ext-search-pro/releases) 下载最新的 `search-aggregator-v*.zip`。
2. 解压到任意固定目录（解压后应能看到 `manifest.json`）。
3. 打开扩展管理页：
   - Chrome：`chrome://extensions`
   - Edge：`edge://extensions`
4. 打开「开发者模式」，点击「加载已解压的扩展程序」，选择刚才解压的目录。

> 浏览器不允许直接双击 zip 安装未上架商店的扩展，必须先解压再「加载已解压的扩展程序」。

### 使用

1. 在网页上选中一段文字。
2. 右键 → **搜索聚合** → 选择搜索引擎。
3. 结果会在新标签页中打开。

点击工具栏上的扩展图标（或扩展详情里的「扩展程序选项」）可打开设置页。

### 自定义搜索引擎

在设置页底部填写：

| 字段 | 说明 |
| --- | --- |
| 名称 | 显示在右键子菜单里的文字，建议不超过 8 个字 |
| 搜索地址 | 完整 URL，用 `%s` 表示选中的文字 |

示例：

```text
搜狗微信   https://weixin.sogou.com/weixin?type=2&query=%s
豆瓣       https://www.douban.com/search?q=%s
Bing 国际  https://www.bing.com/search?q=%s&setlang=en
```

### 说明与已知限制

- **图标**：内置引擎使用各网站官方的 `favicon.ico`，显示在设置页列表中。Chrome / Edge 的右键子菜单项**不支持**自定义图标（`contextMenus` API 限制，Firefox 才支持），所以菜单里只能显示文字。
- **中英文**：扩展名称、右键菜单、设置页文案由 `chrome.i18n` 提供，随浏览器界面语言切换；已内置引擎的名称在首次安装时按当时语言写入，之后不随语言变化。
- **需要登录的站点**：抖音、小红书、微博、淘宝、京东等依赖登录态，未登录时可能跳到首页或登录页，属网站侧行为。
- 选中的文字过长时，浏览器传给扩展的内容会被截断，属于 Chrome 本身的限制。
- 从 1.0.x 升级到 1.1.0 时，新增的内置搜索源会自动合并进已有配置；被删除过的内置项会重新出现，可在设置页再次删除。

### 项目结构

```text
manifest.json            MV3 清单
_locales/<lang>/         中英文文案（chrome.i18n）
src/background.js        Service Worker：构建右键菜单、处理点击、合并配置
src/engines.js           内置搜索引擎列表
src/options.html/css/js  设置页
icons/                   扩展图标
icons/engines/           各搜索引擎的 favicon.ico
.github/workflows/       GitHub Actions 构建与发布
```

### 开发调试

1. 修改代码后，在 `chrome://extensions` / `edge://extensions` 点击该扩展的「刷新」按钮。
2. 右键菜单相关日志见扩展详情页的「Service Worker」控制台。

### 构建与发布

构建由 GitHub Actions 完成（`.github/workflows/build.yml`）：

- 推送到 `main`：自动打包并上传为 Actions Artifact。
- 推送 `v*` 标签：额外创建 GitHub Release 并附上 zip。

本地打包（与 CI 产物一致）：

```bash
zip -r search-aggregator.zip manifest.json _locales src icons README.md LICENSE -x '*.DS_Store'
```

版本号在 `manifest.json` 的 `version` 字段中修改。

---

## English

### Features

- Select text, right-click, open **Search Aggregator**, pick an engine — results open in a new tab.
- 18 built-in engines:
  - China: Baidu, Sogou, Bing, Zhihu, Weibo, Bilibili, Douyin, Xiaohongshu, Taobao, JD.com
  - Global: Google, DuckDuckGo, YouTube, GitHub, Wikipedia, Reddit, X, Stack Overflow
- Custom engines: any site whose search URL accepts a `%s` placeholder.
- Settings page to add, edit, delete, enable or disable engines, plus a one-click reset.
- UI language follows the browser: Simplified Chinese and English are bundled.
- Everything is stored locally (`chrome.storage.local`); nothing is uploaded.
- Only `contextMenus` and `storage` permissions — no page access required.

### Install

1. Download the latest `search-aggregator-v*.zip` from [Releases](https://github.com/BearingSteel/Ext-search-pro/releases).
2. Unzip it into a permanent folder (the folder must contain `manifest.json`).
3. Open the extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
4. Enable **Developer mode**, click **Load unpacked**, and select the unzipped folder.

> Browsers do not install unpacked extensions straight from a zip; unzip first, then load the folder.

### Usage

1. Select some text on a web page.
2. Right-click → **Search Aggregator** → choose an engine.
3. The search opens in a new tab.

Click the toolbar icon (or "Extension options" on the details page) to open the settings page.

### Custom engines

Fill in the form at the bottom of the settings page:

| Field | Description |
| --- | --- |
| Name | Label shown in the context submenu |
| Search URL | Full URL, with `%s` where the selected text goes |

Examples:

```text
GitHub issues  https://github.com/search?q=%s&type=issues
Wikipedia      https://en.wikipedia.org/w/index.php?search=%s
Bing (EN)      https://www.bing.com/search?q=%s&setlang=en
```

### Notes & limitations

- **Icons**: built-in engines use each site's official `favicon.ico`, shown in the settings list. Chromium's `contextMenus` API does **not** support per-item icons (only Firefox's `menus` API does), so menu entries are text-only.
- **Localization**: extension name, context menu and settings page are localized via `chrome.i18n` and follow the browser UI language. Built-in engine names are written into storage at install time using the language active then.
- **Login-gated sites**: Douyin, Xiaohongshu, Weibo, Taobao and JD.com need a signed-in session; without one they may redirect to their homepage or a login page.
- Very long selections are truncated by the browser before reaching the extension.
- Upgrading from 1.0.x to 1.1.0 merges the new built-in engines into your existing list; built-in engines you had deleted will reappear and can be deleted again.

### Project layout

```text
manifest.json            MV3 manifest
_locales/<lang>/         Chinese & English strings (chrome.i18n)
src/background.js        service worker: context menu, clicks, config merge
src/engines.js           built-in engine list
src/options.html/css/js  settings page
icons/                   extension icons
icons/engines/           engine favicons (.ico)
.github/workflows/       GitHub Actions build & release
```

### Development

1. After editing, click **Reload** for the extension on `chrome://extensions` / `edge://extensions`.
2. Service worker logs (including context menu errors) are under **Service Worker** on the extension details page.

### Build & release

CI lives in `.github/workflows/build.yml`:

- Push to `main`: packages the extension and uploads it as an Actions artifact.
- Push a `v*` tag: additionally creates a GitHub Release with the zip attached.

Local packaging (same contents as CI):

```bash
zip -r search-aggregator.zip manifest.json _locales src icons README.md LICENSE -x '*.DS_Store'
```

Bump `version` in `manifest.json` when releasing.

---

MIT License
