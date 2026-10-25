import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Directory, File } from 'expo-file-system';
import { normalizePdfFileName } from './pdfFileName';
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
    fileName,
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

      // Cada geração usa sua própria pasta: exportações com o mesmo nome
      // não sobrescrevem PDFs que ainda estejam sendo compartilhados.
      const source = new File(result.uri);
      const directory = new Directory(source.parentDirectory, source.name.replace(/\.pdf$/i, ''));
      directory.create({ idempotent: true, intermediates: true });
      const destination = new File(directory, normalizePdfFileName(fileName ?? dialogTitle));
      source.move(destination);

      await Sharing.shareAsync(destination.uri, {
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
