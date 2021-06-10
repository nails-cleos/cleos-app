export const snakeToCamel = (value: string): string =>
  value.toLowerCase().replace(/([-_]\w)/g, (g: string) => g[1].toUpperCase());

export const round = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
