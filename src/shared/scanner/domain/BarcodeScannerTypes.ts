export type BarcodeValue = string;

export type BarcodeScannerResult = {
  value: BarcodeValue;
  type?: string;
};

export const SUPPORTED_BARCODE_TYPES = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'code128',
  'code39',
  'code93',
  'codabar',
  'itf14',
  'qr',
] as const;
