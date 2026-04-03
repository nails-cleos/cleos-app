import { ITreatmentGroup, ITreatmentGroupAll } from './treatment';

export interface ICatalogue {
  id?: string;
  name?: string;
  description?: string;
  home?: boolean;
  catalog?: boolean;
  file?: any;
  blob?: any;
  groupId?: string;
  treatmentGroup?: ITreatmentGroup;
}

export interface ICatalogueAll {
  order: number;
  id: string;
  name: string;
  contentType: string;
  description?: string;
  home?: boolean;
  catalog?: boolean;
  blob: any;
  image: any;
  group?: ITreatmentGroupAll;
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
