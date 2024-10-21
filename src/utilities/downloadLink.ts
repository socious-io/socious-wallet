import { config } from '../config';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { logger } from '.';

export const createDownloadLink = async (content: string, filename = 'download', type = 'text/plain') => {
  if (config.PLATFORM == 'web') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }
  try {
    const result = await Filesystem.writeFile({
      path: filename,
      data: content, // Content should be a string for Filesystem
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });

    await Share.share({
      title: 'Download file',
      text: 'Here is your file',
      url: result.uri,
      dialogTitle: 'Share file',
    });
  } catch (error) {
    console.error('Error saving or sharing file:', error);
    alert(error);
    logger(error, { componentStack: 'saving backup file' });
  }
};
