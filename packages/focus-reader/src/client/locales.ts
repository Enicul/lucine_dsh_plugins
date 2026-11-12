/** Web dictionaries for the focus reader page. */

/** Locale namespace owned by this page. */
export const NS = 'focus-reader'

/** English dictionary and key source. */
export const en = {
  panel: 'Reader',
  choose: 'Choose a document',
  fade: 'Fade text I am not reading',
  loading: 'Opening…',
  'empty.title': 'Nothing to read yet',
  'empty.body': 'Put .md or .txt files in {folder}, then reload this page.',
  'pick.title': 'Choose a document above to start reading.',
  failed: 'That did not work: {message}',
  'save.failed': 'Your last change was not saved: {message}',
  'select.highlight': 'Highlight',
  'select.session': 'Open AI session',
  'highlight.remove': 'Remove this highlight',
  'session.open': 'Open AI session {n}',
  'session.goto': 'Go to this passage',
  'session.new': 'New session on this passage. Ask anything.',
  'session.placeholder': 'Ask about this passage',
  'session.send': 'Send',
  'session.thinking': 'Thinking…',
  'session.pin': 'Pin',
  'session.pinned': 'Pinned',
  'session.pinHint': 'A pinned session stays open when you open another',
  'session.close': 'Close',
  'session.link': 'Link',
  'session.cancel': 'Cancel',
  'session.linked': 'Open linked session {n}',
  'session.noOthers': 'No other session to link to yet. Open one on another passage first.',
  'session.me': 'Me',
  'session.ai': 'AI',
  'session.count': '{count} msgs',
  'session.blank': 'Empty session',
  moved: '{count} notes point at text that is no longer in this file. They are kept in the notes file.',
} satisfies Record<string, string>

/** Page locale key union. */
export type FocusReaderKey = keyof typeof en

/** Simplified Chinese dictionary checked against the English key set. */
export const zh = {
  panel: '阅读器',
  choose: '选择文档',
  fade: '淡化我没在读的文字',
  loading: '正在打开…',
  'empty.title': '还没有可读的内容',
  'empty.body': '把 .md 或 .txt 文件放进 {folder}，然后重新加载此页面。',
  'pick.title': '在上方选择一个文档开始阅读。',
  failed: '操作未成功：{message}',
  'save.failed': '上一次修改没有保存：{message}',
  'select.highlight': '高亮',
  'select.session': '开启 AI 会话',
  'highlight.remove': '移除这条高亮',
  'session.open': '打开 AI 会话 {n}',
  'session.goto': '跳到这段文字',
  'session.new': '这段文字上的新会话，随便问。',
  'session.placeholder': '就这段文字提问',
  'session.send': '发送',
  'session.thinking': '思考中…',
  'session.pin': '固定',
  'session.pinned': '已固定',
  'session.pinHint': '固定的会话在你打开其他会话时保持展开',
  'session.close': '关闭',
  'session.link': '关联',
  'session.cancel': '取消',
  'session.linked': '打开关联的会话 {n}',
  'session.noOthers': '还没有其他会话可关联。先在另一段文字上开启一个。',
  'session.me': '我',
  'session.ai': 'AI',
  'session.count': '{count} 条消息',
  'session.blank': '空会话',
  moved: '有 {count} 条笔记指向的文字已不在此文件中。它们仍保留在笔记文件里。',
} satisfies Record<FocusReaderKey, string>
