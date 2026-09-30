import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { AppError } from '../../core/errors';

export type GeneratePdfOptions = {
  html: string;
  dialogTitle?: string;
  fileName?: string;
};

export class PdfService {
  async generateAndShare({
    html,
    dialogTitle = 'Compartilhar PDF',
  }: GeneratePdfOptions): Promise<void> {
    try {
      const result = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const sharingAvailable =
        await Sharing.isAvailableAsync();

      if (!sharingAvailable) {
        throw new AppError(
          'O compartilhamento não está disponível neste dispositivo.'
        );
      }

      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle,
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        'Não foi possível gerar ou compartilhar o PDF.',
        'UNKNOWN_ERROR',
        error
      );
    }
  }
}

export const pdfService = new PdfService();
