export interface RawContactRow {
  id?: string | number | null;
  name?: string | null;
  email?: string | null;
  [key: string]: any;
}

export type ValidationErrorType = 'missing_id' | 'missing_name' | 'missing_email' | 'invalid_email' | 'duplicate_email' | 'duplicate_id';

export interface RowValidationError {
  field: 'id' | 'name' | 'email';
  type: ValidationErrorType;
  message: string;
}

export interface ValidatedContact {
  uuid: string; // unique frontend ID for list keying
  id: string;
  name: string;
  email: string;
  isValid: boolean;
  errors: RowValidationError[];
  isDuplicateEmail?: boolean;
  isDuplicateId?: boolean;
  originalRowNumber: number;
  rawRow?: RawContactRow;
}

export interface FileValidationReport {
  fileName: string;
  fileSize: number;
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  duplicateEmailsCount: number;
  duplicateIdsCount: number;
  contacts: ValidatedContact[];
  detectedColumns: {
    idColumn: string | null;
    nameColumn: string | null;
    emailColumn: string | null;
    allHeaders: string[];
  };
}

export interface CampaignConfig {
  title: string;
  folderId: string;
  folderUrl: string;
  appsScriptUrl: string;
}

export interface SheetCreationResponse {
  success: boolean;
  message: string;
  sheetUrl?: string;
  sheetId?: string;
  title?: string;
  totalContacts?: number;
  folderUrl?: string;
  error?: string;
}

export interface CampaignHistoryItem {
  id: string;
  title: string;
  fileName: string;
  sheetUrl: string;
  sheetId?: string;
  totalContacts: number;
  validContacts?: number;
  createdAt: string; // formatted: YYYY-MM-DD HH:mm:ss or ISO
  folderUrl?: string;
}

export interface Step2ImageRow {
  id: string; // Tên ảnh bỏ đuôi mở rộng (dùng làm ID để map với Step 1)
  imageUrl: string; // Direct link ảnh trên Drive
}

export interface Step2Response {
  success: boolean;
  message: string;
  sheetUrl?: string;
  sheetId?: string;
  title?: string;
  totalImages?: number;
  sampleImages?: Step2ImageRow[];
  sourceFolderId?: string;
  targetFolderUrl?: string;
  error?: string;
}

export interface MappedContactItem extends ValidatedContact {
  imageUrl?: string;
  hasImage: boolean;
}

export interface Step3ExportResponse {
  success: boolean;
  message: string;
  sheetUrl?: string;
  sheetId?: string;
  title?: string;
  totalContacts: number;
  matchedCount: number;
  unmatchedCount: number;
  totalImagesFound: number;
  targetFolderUrl?: string;
  sourceFolderId?: string;
  imageMap?: Record<string, string>;
  mappedContacts?: MappedContactItem[];
  error?: string;
}


