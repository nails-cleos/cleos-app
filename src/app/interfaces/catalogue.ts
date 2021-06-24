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

export interface ISlide {
  image: any;
}

export class Slide implements ISlide {
  image: any;

  constructor(image: any) {
    this.image = image;
  }
}

export class Catalogue implements ICatalogue {
  constructor() {
  }
}
