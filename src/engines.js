// 内置搜索引擎。url 中的 %s 会替换为 URL 编码后的选中文字。
// 名称与维基地址通过 chrome.i18n 取当前界面语言，因此中英文环境各自显示对应文案。
const t = (key) => chrome.i18n.getMessage(key) || key;

export const DEFAULT_ENGINES = [
  // 国内
  {
    id: 'baidu',
    name: t('engineBaidu'),
    url: 'https://www.baidu.com/s?wd=%s',
    icon: 'icons/engines/baidu.ico',
    builtin: true
  },
  {
    id: 'sogou',
    name: t('engineSogou'),
    url: 'https://www.sogou.com/web?query=%s',
    icon: 'icons/engines/sogou.ico',
    builtin: true
  },
  {
    id: 'bing',
    name: t('engineBing'),
    url: 'https://www.bing.com/search?q=%s',
    icon: 'icons/engines/bing.ico',
    builtin: true
  },
  {
    id: 'zhihu',
    name: t('engineZhihu'),
    url: 'https://www.zhihu.com/search?type=content&q=%s',
    icon: 'icons/engines/zhihu.ico',
    builtin: true
  },
  {
    id: 'weibo',
    name: t('engineWeibo'),
    url: 'https://s.weibo.com/weibo?q=%s',
    icon: 'icons/engines/weibo.ico',
    builtin: true
  },
  {
    id: 'bilibili',
    name: t('engineBilibili'),
    url: 'https://search.bilibili.com/all?keyword=%s',
    icon: 'icons/engines/bilibili.ico',
    builtin: true
  },
  {
    id: 'douyin',
    name: t('engineDouyin'),
    url: 'https://www.douyin.com/search/%s',
    icon: 'icons/engines/douyin.ico',
    builtin: true
  },
  {
    id: 'xiaohongshu',
    name: t('engineXiaohongshu'),
    url: 'https://www.xiaohongshu.com/search_result?keyword=%s',
    icon: 'icons/engines/xiaohongshu.ico',
    builtin: true
  },
  {
    id: 'taobao',
    name: t('engineTaobao'),
    url: 'https://s.taobao.com/search?q=%s',
    icon: 'icons/engines/taobao.ico',
    builtin: true
  },
  {
    id: 'jd',
    name: t('engineJd'),
    url: 'https://search.jd.com/Search?keyword=%s',
    icon: 'icons/engines/jd.ico',
    builtin: true
  },
  // 国外
  {
    id: 'google',
    name: t('engineGoogle'),
    url: 'https://www.google.com/search?q=%s',
    icon: 'icons/engines/google.ico',
    builtin: true
  },
  {
    id: 'duckduckgo',
    name: t('engineDuckduckgo'),
    url: 'https://duckduckgo.com/?q=%s',
    icon: 'icons/engines/duckduckgo.ico',
    builtin: true
  },
  {
    id: 'youtube',
    name: t('engineYoutube'),
    url: 'https://www.youtube.com/results?search_query=%s',
    icon: 'icons/engines/youtube.ico',
    builtin: true
  },
  {
    id: 'github',
    name: t('engineGithub'),
    url: 'https://github.com/search?q=%s',
    icon: 'icons/engines/github.ico',
    builtin: true
  },
  {
    id: 'wikipedia',
    name: t('engineWikipedia'),
    url:
      chrome.i18n.getMessage('urlWikipedia') ||
      'https://en.wikipedia.org/w/index.php?search=%s',
    icon: 'icons/engines/wikipedia.ico',
    builtin: true
  },
  {
    id: 'reddit',
    name: t('engineReddit'),
    url: 'https://www.reddit.com/search/?q=%s',
    icon: 'icons/engines/reddit.ico',
    builtin: true
  },
  {
    id: 'x',
    name: t('engineX'),
    url: 'https://x.com/search?q=%s',
    icon: 'icons/engines/x.ico',
    builtin: true
  },
  {
    id: 'stackoverflow',
    name: t('engineStackoverflow'),
    url: 'https://stackoverflow.com/search?q=%s',
    icon: 'icons/engines/stackoverflow.ico',
    builtin: true
  }
];

export const defaultEngines = () =>
  DEFAULT_ENGINES.map((engine) => ({ ...engine, enabled: true }));

// 把已保存的引擎列表与当前内置列表合并：内置项按默认顺序重排，
// 保留用户改过的启用状态 / 名称，自定义项追加在末尾。
export function mergeEngines(stored) {
  const byId = new Map(stored.map((engine) => [engine.id, engine]));
  const merged = DEFAULT_ENGINES.map(
    (engine) => byId.get(engine.id) || { ...engine, enabled: true }
  );
  for (const engine of stored) {
    if (!DEFAULT_ENGINES.some((item) => item.id === engine.id)) merged.push(engine);
  }
  return merged;
}
