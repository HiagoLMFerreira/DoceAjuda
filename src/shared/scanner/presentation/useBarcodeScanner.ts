import { useCallback, useState } from 'react';
import { NormalizeBarcodeService } from '../application/NormalizeBarcodeService';

const normalizeBarcodeService =
  new NormalizeBarcodeService();

export function useBarcodeScanner(
  onCodeScanned: (code: string) => void
) {
  const [alreadyScanned, setAlreadyScanned] =
    useState(false);

  const reset = useCallback(() => {
    setAlreadyScanned(false);
  }, []);

  const handleCode = useCallback(
    (rawCode: string) => {
      if (alreadyScanned) return;

      const code = normalizeBarcodeService.execute(rawCode);
      setAlreadyScanned(true);
      onCodeScanned(code);
    },
    [alreadyScanned, onCodeScanned]
  );

  return {
    alreadyScanned,
    reset,
    handleCode,
  };
}
