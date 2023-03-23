export interface IBank {
  name: string;
  id: string;
  logos: IBankLogo[]
  countryNames: string;
}

export interface IBankLogo {
  url: string;
  mimeType: string;
}
