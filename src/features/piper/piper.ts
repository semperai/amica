import { config } from '@/utils/config';

export async function piper(
    message: string,
  ) {
    try {

      const url = new URL(config("piper_url"));
      url.searchParams.append('text', message);

      const res = await fetch(url.toString());

      const data = (await res.arrayBuffer()) as any;
      return { audio: data };
    } catch (error) {

      console.error('Error in piper:', error);
      throw error;
    }
  }