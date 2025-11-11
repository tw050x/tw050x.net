export interface CACreateOptions {
  dir: string;
  commonName?: string;
  organizationName?: string;
  countryName?: string;
  stateName?: string;
  localityName?: string;
  organizationalUnitName?: string;
  validityDays?: number;
}

export interface CertCreateOptions {
  caDir: string;
  certDir: string;
  name: string;
  domains?: string[];
  validityDays?: number;
}

export interface CAFiles {
  certPath: string;
  keyPath: string;
}

export interface CertFiles {
  certPath: string;
  keyPath: string;
}
