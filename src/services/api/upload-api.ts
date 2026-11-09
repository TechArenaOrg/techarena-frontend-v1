// Real file upload via the backend's multipart endpoint: the raw file is POSTed
// straight to our API (not to S3 directly) so the backend can trim/normalize the
// image server-side before storing it, returning the final CDN URL.
import { ApiError, getAuthToken } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface UploadImageResponse {
  fileUrl: string;
  key: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  requestId?: string;
}

export const uploadAPI = {
  async uploadImage(
    file: File,
    folder: string = 'products',
    onProgress?: (percent: number) => void
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const token = getAuthToken();

    const text = await new Promise<string>((resolve, reject) => {
      // XMLHttpRequest instead of fetch: fetch has no upload progress events, so
      // there's no way to report percent-complete for the upload with it.
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/upload/image`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      // No Content-Type header set here - the browser sets multipart/form-data with
      // the correct boundary itself when sending a FormData body, and overriding it
      // manually would drop that boundary and break parsing server-side.
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(new Error('Failed to upload the image. Please try again.'));
      xhr.send(formData);
    });

    let json: ApiEnvelope<UploadImageResponse> | undefined;
    try {
      json = JSON.parse(text);
    } catch {
      throw new ApiError('The server is taking longer than usual to respond. Please try again.', 503);
    }
    if (!json?.success) {
      throw new ApiError(json?.message || 'Failed to upload the image. Please try again.', 400, json?.requestId);
    }

    return json.data.fileUrl;
  },
};

export default uploadAPI;
