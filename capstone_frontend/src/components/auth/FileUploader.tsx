import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  calculateChecksum,
  validateFile,
  formatFileSize,
  isImageFile,
  isPdfFile,
  getFilePreviewUrl,
  type UploadProgress,
} from '@/services/uploads';

export interface UploadedFile {
  id: string;
  file: File;
  checksum: string;
  previewUrl?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploaderProps {
  label: string;
  description?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  className?: string;
}

export function FileUploader({
  label,
  description,
  required = false,
  multiple = false,
  accept = '.pdf,.png,.jpg,.jpeg',
  maxSize = 10 * 1024 * 1024,
  files,
  onChange,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;

      const fileArray = Array.from(newFiles);
      const validFiles: UploadedFile[] = [];

      for (const file of fileArray) {
        const validation = validateFile(file, {
          maxSize,
          allowedTypes: accept.split(',').map(type => {
            if (type.startsWith('.')) {
              const ext = type.substring(1);
              if (ext === 'pdf') return 'application/pdf';
              if (ext === 'png') return 'image/png';
              if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
            }
            return type;
          }),
        });

        if (!validation.valid) {
          validFiles.push({
            id: Math.random().toString(36),
            file,
            checksum: '',
            progress: 0,
            status: 'error',
            error: validation.error,
          });
          continue;
        }

        const uploadedFile: UploadedFile = {
          id: Math.random().toString(36),
          file,
          checksum: '',
          previewUrl: getFilePreviewUrl(file) || undefined,
          progress: 0,
          status: 'pending',
        };

        validFiles.push(uploadedFile);

        // Calculate checksum asynchronously
        try {
          const checksum = await calculateChecksum(file);
          uploadedFile.checksum = checksum;
          uploadedFile.status = 'success';
          onChange(multiple ? [...files, ...validFiles] : validFiles);
        } catch (error) {
          uploadedFile.status = 'error';
          uploadedFile.error = 'Failed to calculate checksum';
          onChange(multiple ? [...files, ...validFiles] : validFiles);
        }
      }

      if (!multiple && validFiles.length > 0) {
        onChange([validFiles[0]]);
      } else {
        onChange([...files, ...validFiles]);
      }
    },
    [files, multiple, onChange, maxSize, accept]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (id: string) => {
    const newFiles = files.filter(f => f.id !== id);
    onChange(newFiles);
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Label */}
      <div>
        <label className="text-sm font-medium flex items-center gap-2">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && 'border-border hover:border-primary/50'
        )}
        onClick={triggerFileInput}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm font-medium mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          {accept.replace(/\./g, '').toUpperCase()} files up to {formatFileSize(maxSize)}
        </p>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((uploadedFile) => (
            <FilePreview
              key={uploadedFile.id}
              file={uploadedFile}
              onRemove={() => removeFile(uploadedFile.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FilePreviewProps {
  file: UploadedFile;
  onRemove: () => void;
}

function FilePreview({ file, onRemove }: FilePreviewProps) {
  const FileIcon = isImageFile(file.file) ? ImageIcon : FileText;

  return (
    <div className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card">
      {/* Preview/Icon */}
      <div className="flex-shrink-0">
        {file.previewUrl ? (
          <img
            src={file.previewUrl}
            alt={file.file.name}
            className="h-16 w-16 object-cover rounded"
          />
        ) : (
          <div className="h-16 w-16 flex items-center justify-center bg-muted rounded">
            <FileIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{file.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.file.size)}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="flex-shrink-0 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status */}
        <div className="space-y-2">
          {file.status === 'pending' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Calculating checksum...</span>
            </div>
          )}

          {file.status === 'success' && file.checksum && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                <span>Ready to upload</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">
                SHA-256: {file.checksum.substring(0, 16)}...
              </p>
            </div>
          )}

          {file.status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              <span>{file.error || 'Upload failed'}</span>
            </div>
          )}

          {file.status === 'uploading' && (
            <div className="space-y-1">
              <Progress value={file.progress} className="h-1" />
              <p className="text-xs text-muted-foreground">{file.progress}% uploaded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
