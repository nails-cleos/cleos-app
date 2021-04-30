export const snakeToCamel = (value: string): string =>
  value.toLowerCase().replace(/([-_]\w)/g, (g: string) => g[1].toUpperCase());
