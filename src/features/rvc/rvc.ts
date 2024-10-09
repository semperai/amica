import { config } from '@/utils/config';

export async function rvc(
    audio: Blob,
    model_name: string,
    index_path: string,
    f0up_key: number,
    f0method: string,
    index_rate: string,
    filter_radius: number,
    resample_sr: number,
    rms_mix_rate: number,
    protect: number,

  ) {
    try {
        // Read the Blob data as ArrayBuffer
        const arrayBuffer = await new Response(audio).arrayBuffer();
        // Convert ArrayBuffer to Blob with audio/wav MIME type
        const wavBlob = new Blob([arrayBuffer], { type: 'audio/wav' });

        const params = {
            model_name: model_name,
            index_path: index_path,
            f0up_key: f0up_key.toString(),
            f0method: f0method,
            index_rate: index_rate,
            filter_radius: filter_radius.toString(),
            resample_sr: resample_sr.toString(),
            rms_mix_rate: rms_mix_rate.toString(),
            protect: protect.toString(),
        };

        const formData = new FormData();
        formData.append('input_file', wavBlob);

        const url = new URL(config("rvc_url"));
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const res = await fetch(url.toString(), {
            method: 'POST',
            body: formData
        });

      const data = (await res.arrayBuffer()) as any;
      return { audio: data };
    } catch (error) {

      console.error('Error in rvc:', error);
      throw error;
    }
  }