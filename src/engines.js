// 内置搜索引擎。url 中的 %s 会替换为 URL 编码后的选中文字。
export const DEFAULT_ENGINES = [
  {
    id: 'baidu',
    name: '百度搜索',
    url: 'https://www.baidu.com/s?wd=%s',
    icon: 'icons/engines/baidu.ico',
    builtin: true
  },
  {
    id: 'google',
    name: '谷歌搜索',
    url: 'https://www.google.com/search?q=%s',
    icon: 'icons/engines/google.ico',
    builtin: true
  },
  {
    id: 'bilibili',
    name: 'Bilibili 搜索',
    url: 'https://search.bilibili.com/all?keyword=%s',
    icon: 'icons/engines/bilibili.ico',
    builtin: true
  },
  {
    id: 'douyin',
    name: '抖音搜索',
    url: 'https://www.douyin.com/search/%s',
    icon: 'icons/engines/douyin.ico',
    builtin: true
  }
];
