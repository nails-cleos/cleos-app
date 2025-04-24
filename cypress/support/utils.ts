const Breakpoints = {
  XSmall: 'XSmall',
  Small: 'Small',
  Medium: 'Medium',
  Large: 'Large',
  XLarge: 'XLarge'
} as const;

export const devices = [
  { name: 'iPhone 16 Pro', width: 393, height: 852, breakpoints: Breakpoints.XSmall },
  { name: 'iPad Air 11', width: 820, height: 1180, breakpoints: Breakpoints.Medium },
  { name: 'MacBook Pro 16', width: 1536, height: 960, breakpoints: Breakpoints.XLarge },
];

type Breakpoint = typeof Breakpoints[keyof typeof Breakpoints];

type Page = 'reservation' | 'calendar';

export const breakpointToDays = (page: Page, breakpoint: Breakpoint): number => {
  const config: Record<Page, Record<string, number> & { default: number }> = {
    reservation: {
      [Breakpoints.XSmall]: 3,
      [Breakpoints.Small]: 3,
      [Breakpoints.Medium]: 3,
      default: 7
    },
    calendar: {
      [Breakpoints.XSmall]: 1,
      [Breakpoints.Small]: 2,
      [Breakpoints.Medium]: 3,
      [Breakpoints.Large]: 5,
      default: 7
    }
  };

  return config[page][breakpoint] ?? config[page].default;
};

export const breakpointToButtons = (
  breakpoint: Breakpoint,
  smallButtons: string[],
  additionalLargeButtons: string[] = [],
  others: string[] = []
): string[] => {
  const config: Record<Breakpoint, string[]> & { default: string[] } = {
    [Breakpoints.XSmall]: smallButtons,
    [Breakpoints.Small]: smallButtons,
    [Breakpoints.Medium]: [...smallButtons, ...additionalLargeButtons],
    [Breakpoints.Large]: [...smallButtons, ...additionalLargeButtons],
    [Breakpoints.XLarge]: [...smallButtons, ...additionalLargeButtons],
    default: []
  };

  const combined = [...config[breakpoint] ?? config.default, ...others];
  return Array.from(new Set(combined));
};

export const zeroPad = (n: number | string) => String(n).padStart(2, '0');

export const convertSecondsToTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${ zeroPad(hours) }:${ zeroPad(minutes) }`;
};
