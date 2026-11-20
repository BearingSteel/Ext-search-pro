# 搜索聚合 · Search Aggregator

一个轻量的 Chrome / Edge 扩展：选中网页文字后右键，在「搜索」子菜单里选择搜索引擎。
A lightweight Chrome / Edge extension: select text on a page, right-click, and search it from a "搜索" submenu.

[![build](https://github.com/BearingSteel/Ext-search-pro/actions/workflows/build.yml/badge.svg)](https://github.com/BearingSteel/Ext-search-pro/actions/workflows/build.yml)

---

## 中文

### 功能

- 右键选中文字 → **搜索** → 一键跳转对应网站搜索，结果在新标签页打开。
- 内置：百度、谷歌、Bilibili、抖音。
- 自定义搜索引擎：任意网站，只要搜索地址里用 `%s` 占位即可。
- 设置页可添加 / 编辑 / 删除 / 启用停用引擎，一键恢复默认。
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
2. 右键 → **搜索** → 选择搜索引擎。
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
知乎      https://www.zhihu.com/search?type=content&q=%s
GitHub    https://github.com/search?q=%s
维基百科  https://zh.wikipedia.org/w/index.php?search=%s
Bing      https://www.bing.com/search?q=%s
```

### 说明与已知限制

- **图标**：内置引擎使用各网站官方的 `favicon.ico`，显示在设置页列表中。Chrome / Edge 的右键子菜单项**不支持**自定义图标（`contextMenus` API 限制，Firefox 才支持），所以菜单里只能显示文字。
- **抖音搜索**：`https://www.douyin.com/search/<关键词>` 依赖登录态和前端渲染，未登录时可能落到首页，属正常现象。
- 选中的文字过长时，浏览器传给扩展的内容会被截断，属于 Chrome 本身的限制。

### 项目结构

```text
manifest.json            MV3 清单
src/background.js        Service Worker：构建右键菜单、处理点击
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
zip -r search-aggregator.zip manifest.json src icons README.md -x '*.DS_Store'
```

版本号在 `manifest.json` 的 `version` 字段中修改。

---

## English

### Features

- Select text, right-click, open the **搜索 (Search)** submenu, pick an engine — results open in a new tab.
- Built-in engines: Baidu, Google, Bilibili, Douyin.
- Custom engines: any site whose search URL accepts a `%s` placeholder.
- Settings page to add, edit, delete, enable or disable engines, plus a one-click reset.
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
2. Right-click → **搜索** → choose an engine.
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
Zhihu       https://www.zhihu.com/search?type=content&q=%s
GitHub      https://github.com/search?q=%s
Wikipedia   https://en.wikipedia.org/w/index.php?search=%s
Bing        https://www.bing.com/search?q=%s
```

### Notes & limitations

- **Icons**: built-in engines use each site's official `favicon.ico`, shown in the settings list. Chromium's `contextMenus` API does **not** support per-item icons (only Firefox's `menus` API does), so menu entries are text-only.
- **Douyin**: `https://www.douyin.com/search/<query>` relies on login state and client-side rendering; without login it may fall back to the homepage.
- Very long selections are truncated by the browser before reaching the extension.

### Project layout

```text
manifest.json            MV3 manifest
src/background.js        service worker: builds the context menu, handles clicks
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
zip -r search-aggregator.zip manifest.json src icons README.md -x '*.DS_Store'
```

Bump `version` in `manifest.json` when releasing.

---

MIT License
