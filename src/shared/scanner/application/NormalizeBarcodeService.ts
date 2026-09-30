import { ValidationError } from '../../../core/errors';

export class NormalizeBarcodeService {
  execute(value: string): string {
    const normalized = value.trim();

    if (!normalized) {
      throw new ValidationError(
        'O código lido pela câmera está vazio.'
      );
    }

    return normalized;
  }
}
