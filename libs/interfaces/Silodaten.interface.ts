export interface LinieAnschluss {
  Linie: number;
  Extruder: 1 | 2;
}

export interface Abgang {
  Linien: LinieAnschluss[];
}

export interface Silodaten {
  SiloNr: number;
  Gewicht: number;
  Artikelnummer: string;
  Charge: string;
  MFR: number | null;
  Abgaenge: Abgang[];
}
