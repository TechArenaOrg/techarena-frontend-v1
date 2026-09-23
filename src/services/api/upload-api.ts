// Real file upload via the backend's signed-URL flow: request a signed S3 PUT URL,
// upload the file directly to S3 (bypassing our API), then use the returned CDN URL.
import { apiClient } from './client';

interface SignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expires: string;
}

export const uploadAPI = {
  async uploadImage(
    file: File,
    folder: string = 'products',
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const { uploadUrl, fileUrl } = await apiClient.post<SignedUrlResponse>('/upload/signed-url', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folder,
    });

    // XMLHttpRequest instead of fetch: fetch has no upload progress events,
    // so there's no way to report percent-complete for the PUT with it.
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error('Failed to upload the image to storage. Please try again.'));
        }
      };
      xhr.onerror = () => reject(new Error('Failed to upload the image to storage. Please try again.'));
      xhr.send(file);
    });

    return fileUrl;
  },
};

export default uploadAPI;
