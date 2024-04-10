export const Base64ToBlob = async (data: string): Promise<Blob> => {
  return fetch(data)
      .then(res => res.blob());
};