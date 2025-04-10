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

type Page = 'reservation' | 'calendar';

export const breakpointToDays = (page: Page, breakpoint: string): number => {
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

export const zeroPad = (n: number) => n.toString().padStart(2, '0');
