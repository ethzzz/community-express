export function formatTime(value: string, full = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '刚刚';

  return date.toLocaleString(
    'zh-CN',
    full
      ? undefined
      : { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' },
  );
}
