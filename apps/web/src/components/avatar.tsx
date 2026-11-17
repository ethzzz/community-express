const palette = ['#d64f2a', '#6f7552', '#b8832f', '#8d5b4c', '#3f6c6b', '#7c5c8a'];

export function Avatar({
  name,
  size = 'md',
}: {
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const label = name?.trim() || '?';
  const initial = Array.from(label)[0]?.toUpperCase() ?? '?';
  let seed = 0;
  for (const char of label) seed += char.charCodeAt(0);

  return (
    <span
      aria-hidden="true"
      className={`avatar avatar-${size}`}
      style={{ background: palette[seed % palette.length] }}
    >
      {initial}
    </span>
  );
}
