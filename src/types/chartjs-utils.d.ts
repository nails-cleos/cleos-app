declare module 'chart.js/dist/types/utils' {
  export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
  };
}
