import { FormControl } from '@angular/forms';
import { ITreatmentGroup, ITreatmentGroupAll } from './treatment';
import { fieldChange, valueChange } from '../util/validators';

export type CatalogueForm = {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  home: FormControl<boolean>;
  catalog: FormControl<boolean>;
  group: FormControl<ITreatmentGroupAll | undefined>;
};

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
  name?: string;
  description?: string;
  home?: boolean;
  catalog?: boolean;
  groupId?: string;

  private constructor(catalogueForm?: CatalogueForm) {
    if (!catalogueForm) {
      return;
    }

    this.name = catalogueForm.name.value;
    this.description = catalogueForm.description.value;
    this.home = catalogueForm.home.value;
    this.catalog = catalogueForm.catalog.value;
    this.groupId = catalogueForm.group.value?.id;
  }

  static fromForm(catalogueForm: CatalogueForm, currentCatalogue?: ICatalogueAll): ICatalogue {
    const catalogue = new Catalogue(catalogueForm);
    catalogue.name = fieldChange(catalogueForm.name, currentCatalogue?.name);
    catalogue.description = valueChange(catalogueForm.description.value, currentCatalogue?.description);
    catalogue.home = fieldChange(catalogueForm.home, currentCatalogue?.home);
    catalogue.catalog = fieldChange(catalogueForm.catalog, currentCatalogue?.catalog);
    catalogue.groupId = catalogueForm.group.value?.id;

    return catalogue;
  }
}
