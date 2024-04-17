export const Base64ToBlob = async (data: string): Promise<Blob> => {
  return fetch(data)
      .then(res => res.blob());
};

export const BlobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) =>
  {
      let reader = new FileReader();

      reader.onload = () => {
          if (reader.result && typeof reader.result == "string")
              resolve(reader.result);
      }
      reader.onerror = reject;
      reader.readAsDataURL(blob);
  });
};