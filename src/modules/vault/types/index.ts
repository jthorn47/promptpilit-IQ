// Vault Types
export interface VaultFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  isShared?: boolean;
  permissions?: string[];
  // Additional properties for actual vault file data
  originalName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  companyId?: string;
  folderPath?: string;
  checksum?: string;
  shareToken?: string;
  shareExpiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VaultSearchFilter {
  query?: string;
  fileType?: string;
  uploadedBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  folderPath?: string;
  isShared?: boolean;
}

export interface VaultStats {
  totalFiles: number;
  totalSize: number;
  sharedFiles: number;
  recentUploads: number;
}

export interface ShareTokenData {
  token: string;
  expiresAt?: string;
  maxUses?: number;
  permissions: string[];
}