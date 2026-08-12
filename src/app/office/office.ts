import { FormControl } from '@angular/forms';
import { IUser } from '../user/user';
import { IRoom, IRoomAll } from '../room/room';
import { fieldChange } from '../util/validators';

export type OfficeForm = {
  name: FormControl<string>;
  manager: FormControl<IUser | undefined>;
  subject: FormControl<string | undefined>;
  kvk: FormControl<string | undefined>;
  account: FormControl<string | undefined>;
  btw: FormControl<string | undefined>;
  billingAddress: FormControl<string | undefined>;
  driveFolder: FormControl<string | undefined>;
};

export interface IOffice {
  id?: string;
  name?: string;
  deleted?: boolean;
  manager?: IUser;
  managerId?: string;
  rooms?: IRoom[];

  subject?: string;
  kvk?: string;
  account?: string;
  btw?: string;
  billingAddress?: string;
  driveFolder?: string;
  lastInvoiceNumber?: number;
}

export interface IOfficeAll {
  id: string;
  name: string;
  manager: IUser;
  subject?: string;
  kvk?: string;
  account?: string;
  btw?: string;
  billingAddress?: string;
  driveFolder?: string;
  lastInvoiceNumber?: number;
  rooms?: IRoomAll[];
}

export class Office implements IOffice {
  static fromForm(officeForm: OfficeForm, currentOffice?: IOfficeAll): IOffice {
    return {
      name: fieldChange(officeForm.name, currentOffice?.name),
      subject: fieldChange(officeForm.subject, currentOffice?.subject),
      kvk: fieldChange(officeForm.kvk, currentOffice?.kvk),
      account: fieldChange(officeForm.account, currentOffice?.account),
      btw: fieldChange(officeForm.btw, currentOffice?.btw),
      billingAddress: fieldChange(
        officeForm.billingAddress,
        currentOffice?.billingAddress,
      ),
      driveFolder: fieldChange(
        officeForm.driveFolder,
        currentOffice?.driveFolder,
      ),
      managerId: officeForm.manager.value?.id,
    };
  }
}
