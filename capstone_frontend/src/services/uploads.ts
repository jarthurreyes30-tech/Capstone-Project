/**
 * File Upload Service
 * 
 * Handles document uploads with SHA-256 checksum verification.
 * Supports chunked uploads for large files.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface FileUploadData {
  file: File;
  checksum: string;
  filename: string;
  size: number;
  type: string;
}

export interface UploadResponse {
  id: string;
  url: string;
  filename: string;
  checksum: string;
  checksum_verified: boolean;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Calculate SHA-256 checksum for a file
 */
export async function calculateChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
  } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Accepted types: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Upload a file with checksum
 */
export async function uploadFile(
  file: File,
  endpoint: string = '/uploads',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> {
  // Calculate checksum
  const checksum = await calculateChecksum(file);

  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('checksum', checksum);
  formData.append('filename', file.name);
  formData.append('size', file.size.toString());
  formData.append('type', file.type);

  // Upload with progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || 'Upload failed'));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    xhr.open('POST', `${API_BASE_URL}${endpoint}`);
    
    // Add auth token if available
    const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.send(formData);
  });
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  endpoint: string = '/uploads/batch',
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResponse[]> {
  const uploadPromises = files.map((file, index) =>
    uploadFile(file, endpoint, (progress) => {
      if (onProgress) {
        onProgress(index, progress);
      }
    })
  );

  return Promise.all(uploadPromises);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

/**
 * Generate preview URL for file
 */
export function getFilePreviewUrl(file: File): string | null {
  if (isImageFile(file)) {
    return URL.createObjectURL(file);
  }
  return null;
}
