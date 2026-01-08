export interface IAwsExtract {
  TOTAL?: string;
  TAX?: string;
  SUBTOTAL?: string;
  VENDOR_NAME?: string;
  INVOICE_RECEIPT_DATE?: string;
  INVOICE_RECEIPT_ID?: string;
  OTHER?: string;
}

export interface IAwsNotification {
  JobId: string;
}

export interface IAwsLambda {
  status: number;
  body: IAwsNotification | IAwsExtract;
}

export const awsExtractToNumberFormat = (value: string | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }

  return Number(value.replace(/[^\d.,-]/g, '').replace(',', '.'));
};
