import * as XLSX from 'xlsx';
import { RawContactRow } from '../types';

export interface ParseExcelResult {
  headers: string[];
  rows: RawContactRow[];
  detectedColumns: {
    idColumn: string | null;
    nameColumn: string | null;
    emailColumn: string | null;
  };
}

export function detectColumnKeys(headers: string[]): {
  idColumn: string | null;
  nameColumn: string | null;
  emailColumn: string | null;
} {
  let idColumn: string | null = null;
  let nameColumn: string | null = null;
  let emailColumn: string | null = null;

  for (const header of headers) {
    const norm = header.trim().toLowerCase();

    // Match Email
    if (!emailColumn && (norm === 'email' || norm === 'mail' || norm.includes('email') || norm.includes('thư điện tử') || norm.includes('thu dien tu'))) {
      emailColumn = header;
      continue;
    }

    // Match ID
    if (!idColumn && (norm === 'id' || norm === 'mã' || norm === 'ma' || norm === 'mã kh' || norm === 'code' || norm === 'id kh' || norm.endsWith('id') || norm.startsWith('id'))) {
      idColumn = header;
      continue;
    }

    // Match Name
    if (!nameColumn && (norm === 'name' || norm === 'tên' || norm === 'ten' || norm === 'họ tên' || norm === 'ho ten' || norm === 'họ và tên' || norm === 'full name' || norm === 'fullname')) {
      nameColumn = header;
      continue;
    }
  }

  // Secondary fallback if not matched by strict names
  if (!idColumn && headers.length > 0) {
    const candidate = headers.find(h => /id|code|mã/i.test(h));
    if (candidate) idColumn = candidate;
    else idColumn = headers[0]; // fallback to column 1
  }

  if (!nameColumn && headers.length > 1) {
    const candidate = headers.find(h => /name|tên/i.test(h));
    if (candidate) nameColumn = candidate;
    else nameColumn = headers[1] !== idColumn ? headers[1] : headers[0];
  }

  if (!emailColumn && headers.length > 2) {
    const candidate = headers.find(h => /email|mail/i.test(h));
    if (candidate) emailColumn = candidate;
    else emailColumn = headers.find(h => h !== idColumn && h !== nameColumn) || headers[2];
  }

  return { idColumn, nameColumn, emailColumn };
}

export async function parseExcelFile(file: File): Promise<ParseExcelResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  // Take the first sheet
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('File Excel không có trang tính (sheet) nào!');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  // Parse rows as raw objects with header mapping
  const rows = XLSX.utils.sheet_to_json<RawContactRow>(worksheet, { defval: '' });

  // Extract header row keys from json or range
  let headers: string[] = [];
  if (rows.length > 0) {
    headers = Object.keys(rows[0]);
  } else {
    // Check if there are cell coordinates in A1:Z1
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:C1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) headers.push(String(cell.v));
    }
  }

  const detectedColumns = detectColumnKeys(headers);

  return {
    headers,
    rows,
    detectedColumns,
  };
}

export function downloadSampleExcel() {
  const sampleData = [
    { ID: '1', Name: 'Bùi Minh Đức', Email: 'ducbm90@gmail.com' },
    { ID: '2', Name: 'Nguyễn Văn An', Email: 'nguyen.an@company.com' },
    { ID: '3', Name: 'Trần Thị Bình', Email: 'tranbinh92@gmail.com' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 10 }, // ID
    { wch: 25 }, // Name
    { wch: 30 }, // Email
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

  XLSX.writeFile(workbook, 'mau_contact_list_campaign.xlsx');
}

export function exportContactsToExcel(
  contacts: { id: string; name: string; email: string; isValid: boolean; errors?: { message: string }[] }[],
  filename: string
) {
  const exportData = contacts.map((c) => {
    let statusText = 'Hợp lệ';
    if (!c.isValid && c.errors && c.errors.length > 0) {
      statusText = c.errors.map(e => e.message).join(', ');
    }
    return {
      ID: c.id,
      Name: c.name,
      Email: c.email,
      'Status (Ghi chú vấn đề)': statusText,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 32 },
    { wch: 35 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ContactList');

  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

export function exportMappedContactsToExcel(
  contacts: { id: string; name: string; email: string; imageUrl?: string; hasImage?: boolean }[],
  filename: string
) {
  const exportData = contacts.map((c) => ({
    ID: c.id,
    Name: c.name,
    Email: c.email,
    img: c.imageUrl || '',
    'Trạng thái': c.hasImage || Boolean(c.imageUrl) ? 'Đã ghép ảnh' : 'Chưa có ảnh',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 32 },
    { wch: 50 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MappedContacts');

  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

export function exportFullMappedRowsToExcel(
  rawRows: Record<string, any>[],
  headers: string[],
  idKey: string,
  imageMap: Record<string, string>,
  filename: string
) {
  const exportData = rawRows.map((row) => {
    const newRow: Record<string, any> = {};
    const rawId = String(row[idKey] ?? '').trim();
    let imgUrl = '';
    if (rawId) {
      imgUrl =
        imageMap[rawId] ||
        imageMap[rawId.toLowerCase()] ||
        imageMap[rawId.toUpperCase()] ||
        '';
      if (!imgUrl) {
        const unp = rawId.replace(/^0+/, '');
        if (unp) imgUrl = imageMap[unp] || imageMap[unp.toLowerCase()] || '';
      }
    }

    let imgPlaced = false;
    headers.forEach((h) => {
      newRow[h] = row[h] ?? '';
      const hLower = h.trim().toLowerCase();
      if (hLower === 'email' || hLower.includes('email')) {
        newRow['img'] = imgUrl;
        imgPlaced = true;
      }
    });

    if (!imgPlaced) {
      newRow['img'] = imgUrl;
    }

    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact List');

  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}
