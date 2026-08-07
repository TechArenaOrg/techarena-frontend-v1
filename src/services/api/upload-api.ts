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
  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    const { uploadUrl, fileUrl } = await apiClient.post<SignedUrlResponse>('/upload/signed-url', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      folder,
    });

    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    if (!response.ok) {
      throw new Error('Failed to upload the image to storage. Please try again.');
    }

    return fileUrl;
  },
};

export default uploadAPI;
