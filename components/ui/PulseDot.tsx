type Size = 'xs' | 'sm' | 'md';
type Color = 'primary' | 'error';

const SIZE_CLASS: Record<Size, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
};

const COLOR_BG: Record<Color, { ping: string; core: string; glow: string }> = {
  primary: { ping: 'bg-primary-400', core: 'bg-primary-500', glow: 'shadow-primary-500/70' },
  error:   { ping: 'bg-error-500',   core: 'bg-error-500',   glow: 'shadow-error-500/70' },
};

// A live beacon — pulsing halo over a glowing signal core.
export function PulseDot({ size = 'sm', color = 'error' }: { size?: Size; color?: Color }) {
  const s = SIZE_CLASS[size];
  const c = COLOR_BG[color];
  return (
    <span className={`relative flex ${s}`}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.ping} opacity-75`} />
      <span className={`relative inline-flex rounded-full ${s} ${c.core} shadow-[0_0_8px_-1px] ${c.glow}`} />
    </span>
  );
}
