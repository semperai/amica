import sharp from 'sharp';
import { askVisionLLM } from '@/utils/askLlm';

export async function processImage(payload: Buffer): Promise<string> {
  const jpegImg = await convertToJpeg(payload);
  if (!jpegImg) {
    throw new Error('Failed to process image');
  }
  return await askVisionLLM(jpegImg);
}

async function convertToJpeg(payload: Buffer): Promise<string | null> {
  try {
    const jpegBuffer = await sharp(payload).jpeg().toBuffer();
    return jpegBuffer.toString('base64');
  } catch (error) {
    console.error('Error converting image to .jpeg:', error);
    return null;
  }
}
