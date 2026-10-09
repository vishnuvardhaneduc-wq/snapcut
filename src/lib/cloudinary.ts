import axios from 'axios';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'snapcut_temp_unsigned';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
}

export async function uploadToCloudinaryTemp(file: File): Promise<CloudinaryUploadResponse> {
  // If demo credentials, create a persistent local blob URL with metadata
  if (cloudName === 'demo' || !cloudName) {
    const objectUrl = URL.createObjectURL(file);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          secure_url: objectUrl,
          public_id: `temp_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '')}`,
          bytes: file.size,
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 600,
          format: file.type.split('/')[1] || 'png',
        });
      };
      img.onerror = () => {
        resolve({
          secure_url: objectUrl,
          public_id: `temp_${Date.now()}`,
          bytes: file.size,
          width: 800,
          height: 600,
          format: 'png',
        });
      };
      img.src = objectUrl;
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('tags', 'snapcut_temp_24h');

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}
