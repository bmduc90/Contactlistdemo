import { RawContactRow, ValidatedContact, RowValidationError } from '../types';

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function sanitizeString(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

export function validateRow(
  raw: RawContactRow,
  rowIdx: number,
  idKey: string,
  nameKey: string,
  emailKey: string
): {
  id: string;
  name: string;
  email: string;
  errors: RowValidationError[];
} {
  const id = sanitizeString(raw[idKey]);
  const name = sanitizeString(raw[nameKey]);
  const email = sanitizeString(raw[emailKey]);

  const errors: RowValidationError[] = [];

  // 1. Validate ID
  if (!id) {
    errors.push({
      field: 'id',
      type: 'missing_id',
      message: 'Thiếu ID',
    });
  }

  // 2. Validate Name
  if (!name) {
    errors.push({
      field: 'name',
      type: 'missing_name',
      message: 'Thiếu Họ tên',
    });
  }

  // 3. Validate Email
  if (!email) {
    errors.push({
      field: 'email',
      type: 'missing_email',
      message: 'Thiếu Email',
    });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({
      field: 'email',
      type: 'invalid_email',
      message: 'Email sai định dạng',
    });
  }

  return { id, name, email, errors };
}

export function validateContactList(
  rows: RawContactRow[],
  idKey: string,
  nameKey: string,
  emailKey: string
): ValidatedContact[] {
  const emailCounts = new Map<string, number>();
  const idCounts = new Map<string, number>();

  // First pass: count frequencies of emails and IDs
  for (const raw of rows) {
    const email = sanitizeString(raw[emailKey]).toLowerCase();
    const id = sanitizeString(raw[idKey]);
    if (email) {
      emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
    }
    if (id) {
      idCounts.set(id, (idCounts.get(id) || 0) + 1);
    }
  }

  // Second pass: validate each row & flag duplicates
  const results: ValidatedContact[] = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const { id, name, email, errors } = validateRow(raw, i, idKey, nameKey, emailKey);

    const isDuplicateEmail = Boolean(email && (emailCounts.get(email.toLowerCase()) || 0) > 1);
    const isDuplicateId = Boolean(id && (idCounts.get(id) || 0) > 1);

    if (isDuplicateEmail) {
      errors.push({
        field: 'email',
        type: 'duplicate_email',
        message: 'Trùng Email',
      });
    }

    if (isDuplicateId) {
      errors.push({
        field: 'id',
        type: 'duplicate_id',
        message: 'Trùng ID',
      });
    }

    results.push({
      uuid: `contact-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      id,
      name,
      email,
      isValid: errors.length === 0,
      errors,
      isDuplicateEmail,
      isDuplicateId,
      originalRowNumber: i + 2, // 1-based + 1 for header
      rawRow: raw,
    });
  }

  return results;
}
