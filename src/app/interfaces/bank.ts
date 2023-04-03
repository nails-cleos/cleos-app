export interface IBank {
  name: string;
  bic: string;
}

export const banks = (): IBank[] => [
  { name: "Rabobank", bic: "RABONL2U" },
  { name: "ABN AMRO", bic: "ABNANL2A" },
  { name: "Van Lanschot Bankiers", bic: "FVLBNL22" },
  { name: "Triodos Bank", bic: "TRIONL2U" },
  { name: "ING Bank", bic: "INGBNL2A" },
  { name: "SNS Bank", bic: "SNSBNL2A" },
  { name: "ASN", bic: "ASNBNL21" },
  { name: "Regio Bank", bic: "RBRBNL21" },
  { name: "Knab", bic: "KNABNL2H" },
  { name: "Bunq", bic: "BUNQNL2A" },
  { name: "Moneyou", bic: "MOYONL21" }
]
