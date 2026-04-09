export interface BrazilianBank {
  code: string;
  name: string;
  abbr: string;
  domain: string;
  color: string;
}

export const BRAZILIAN_BANKS: BrazilianBank[] = [
  { code: "001", name: "Banco do Brasil", abbr: "BB", domain: "bb.com.br", color: "#FECE07" },
  { code: "033", name: "Santander", abbr: "SAN", domain: "santander.com.br", color: "#EC0000" },
  { code: "104", name: "Caixa Econômica Federal", abbr: "CEF", domain: "caixa.gov.br", color: "#005CA9" },
  { code: "237", name: "Bradesco", abbr: "BRA", domain: "bradesco.com.br", color: "#CC092F" },
  { code: "341", name: "Itaú Unibanco", abbr: "ITÚ", domain: "itau.com.br", color: "#FF6600" },
  { code: "756", name: "Sicoob", abbr: "SIC", domain: "sicoob.com.br", color: "#003641" },
  { code: "748", name: "Sicredi", abbr: "SCD", domain: "sicredi.com.br", color: "#00A651" },
  { code: "077", name: "Banco Inter", abbr: "INT", domain: "inter.co", color: "#FF7A00" },
  { code: "260", name: "Nubank", abbr: "NU", domain: "nubank.com.br", color: "#820AD1" },
  { code: "208", name: "BTG Pactual", abbr: "BTG", domain: "btgpactual.com", color: "#001E62" },
  { code: "422", name: "Banco Safra", abbr: "SAF", domain: "safra.com.br", color: "#003366" },
  { code: "041", name: "Banrisul", abbr: "BRS", domain: "banrisul.com.br", color: "#004F9F" },
  { code: "004", name: "Banco do Nordeste (BNB)", abbr: "BNB", domain: "bnb.gov.br", color: "#E31937" },
  { code: "003", name: "Banco da Amazônia (BASA)", abbr: "BAS", domain: "bfrancia.com.br", color: "#005C29" },
  { code: "336", name: "C6 Bank", abbr: "C6", domain: "c6bank.com.br", color: "#242424" },
  { code: "290", name: "PagBank", abbr: "PAG", domain: "pagseguro.uol.com.br", color: "#00A859" },
  { code: "323", name: "Mercado Pago", abbr: "MP", domain: "mercadopago.com.br", color: "#009EE3" },
  { code: "133", name: "Cresol", abbr: "CRL", domain: "cresol.com.br", color: "#00713D" },
  { code: "655", name: "Banco Votorantim (BV)", abbr: "BV", domain: "bv.com.br", color: "#2B45D4" },
  { code: "212", name: "Banco Original", abbr: "ORI", domain: "original.com.br", color: "#00A651" },
  { code: "021", name: "Banestes", abbr: "BES", domain: "banestes.com.br", color: "#003B71" },
  { code: "707", name: "Daycoval", abbr: "DAY", domain: "daycoval.com.br", color: "#0055A5" },
  { code: "121", name: "Agibank", abbr: "AGI", domain: "agibank.com.br", color: "#FF4713" },
  { code: "735", name: "Banco Neon", abbr: "NEO", domain: "neon.com.br", color: "#00E5A0" },
  { code: "197", name: "Stone", abbr: "STN", domain: "stone.com.br", color: "#00A868" },
  { code: "070", name: "BRB - Banco de Brasília", abbr: "BRB", domain: "brb.com.br", color: "#003399" },
  { code: "389", name: "Banco Mercantil", abbr: "MER", domain: "mercantil.com.br", color: "#004990" },
  { code: "084", name: "Unicred", abbr: "UNI", domain: "unicred.com.br", color: "#00529B" },
  { code: "136", name: "Unicred Cooperativa", abbr: "UCC", domain: "unicred.com.br", color: "#00529B" },
  { code: "746", name: "Banco Modal", abbr: "MOD", domain: "modal.com.br", color: "#1E2A38" },
  { code: "643", name: "Banco Pine", abbr: "PIN", domain: "pine.com", color: "#003B2C" },
  { code: "246", name: "Banco ABC Brasil", abbr: "ABC", domain: "abcbrasil.com.br", color: "#003A70" },
  { code: "218", name: "Banco BS2", abbr: "BS2", domain: "bs2.com", color: "#FF6B00" },
  { code: "637", name: "Banco Sofisa", abbr: "SOF", domain: "sofisa.com.br", color: "#002D62" },
  { code: "254", name: "Paraná Banco", abbr: "PRN", domain: "paranabanco.com.br", color: "#002776" },
  { code: "399", name: "HSBC Brasil", abbr: "HSB", domain: "hsbc.com.br", color: "#DB0011" },
  { code: "745", name: "Citibank", abbr: "CIT", domain: "citibank.com.br", color: "#003B70" },
  { code: "000", name: "Dinheiro (Caixa Física)", abbr: "R$", domain: "", color: "#2E7D32" },
  { code: "999", name: "Outro", abbr: "OUT", domain: "", color: "#607D8B" },
];

export function getBankLogoUrl(domain: string): string {
  if (!domain) return "";
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export function findBankByCode(code: string): BrazilianBank | undefined {
  return BRAZILIAN_BANKS.find(b => b.code === code);
}

export function findBankByName(name: string): BrazilianBank | undefined {
  const lower = name.toLowerCase();
  return BRAZILIAN_BANKS.find(b => b.name.toLowerCase().includes(lower));
}
