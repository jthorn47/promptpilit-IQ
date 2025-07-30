import QRCode from 'qrcode';

export const generateQRCode = async (text: string, options?: QRCode.QRCodeToDataURLOptions): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: 200,
      margin: 2,
      color: {
        dark: '#655DC6', // EaseLearn primary color
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M',
      ...options
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

export const generateQRCodeBuffer = async (text: string): Promise<Buffer> => {
  try {
    const buffer = await QRCode.toBuffer(text, {
      width: 200,
      margin: 2,
      color: {
        dark: '#655DC6',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw error;
  }
};