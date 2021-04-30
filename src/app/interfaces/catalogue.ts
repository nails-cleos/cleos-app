export interface ICatalogue {
  id?: string;
  name?: string;
  description?: string;
  file?: any;
  blob?: any;
}

export interface ICatalogueAll {
  order: number;
  id: string;
  name: string;
  description?: string;
  blob: any;
}

export class Catalogue implements ICatalogue {
  constructor() {
  }
}

export const PAGE_SIZE = 10;
