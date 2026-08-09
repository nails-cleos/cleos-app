import { FormControl } from '@angular/forms';
import { ITreatmentGroup, ITreatmentGroupAll } from '../treatment/treatment';
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

export class Catalogue {
  static fromForm(
    catalogueForm: CatalogueForm,
    currentCatalogue?: ICatalogueAll,
  ): ICatalogue {
    return {
      name: fieldChange(catalogueForm.name, currentCatalogue?.name),
      description: valueChange(
        catalogueForm.description.value,
        currentCatalogue?.description,
      ),
      home: fieldChange(catalogueForm.home, currentCatalogue?.home),
      catalog: fieldChange(catalogueForm.catalog, currentCatalogue?.catalog),
      groupId: catalogueForm.group.value?.id,
    };
  }
}
