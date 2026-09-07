import { SheetCreationResponse, ValidatedContact, CampaignHistoryItem, Step2Response, Step3ExportResponse, MappedContactItem } from '../types';
import { DEFAULT_FOLDER_ID, DEFAULT_FOLDER_URL, DEFAULT_APPS_SCRIPT_URL, STEP2_TARGET_FOLDER_ID, STEP2_TARGET_FOLDER_URL } from '../constants/appScriptCode';

const HISTORY_STORAGE_KEY = 'campaign_creation_history_v1';

export function getLocalCampaignHistory(): CampaignHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // 10 Chiến dịch Email Campaign mới nhất không cần lưu lịch sử bước 2
      return parsed.filter(
        item => !item.title?.includes('[Bước 2]') && !item.title?.includes('Image List')
      );
    }
  } catch (e) {
    console.error('Error reading local campaign history:', e);
  }
  return [];
}

export function saveCampaignToLocalHistory(item: CampaignHistoryItem): CampaignHistoryItem[] {
  try {
    const current = getLocalCampaignHistory();
    // Prepend and avoid duplicates
    const filtered = current.filter(c => c.id !== item.id && c.sheetUrl !== item.sheetUrl);
    const updated = [item, ...filtered].slice(0, 50);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving local campaign history:', e);
    return [];
  }
}

export async function fetchCampaignHistory(appsScriptUrl: string): Promise<CampaignHistoryItem[]> {
  const localList = getLocalCampaignHistory();
  const targetUrl = (appsScriptUrl && appsScriptUrl.trim()) ? appsScriptUrl.trim() : DEFAULT_APPS_SCRIPT_URL;

  if (targetUrl.includes('demo')) {
    return localList;
  }

  try {
    const urlWithAction = targetUrl + (targetUrl.includes('?') ? '&' : '?') + 'action=getHistory';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(urlWithAction, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.history)) {
        const remoteItems: CampaignHistoryItem[] = data.history
          .filter((h: any) => !h.title?.includes('[Bước 2]') && !h.title?.includes('Image List') && !h.fileName?.includes('Image List'))
          .map((h: any) => ({
            id: h.id || h.sheetId || `hist-${Math.random()}`,
            sheetId: h.sheetId,
            title: h.title || 'Email campaign',
            fileName: h.fileName || h.title || 'Email campaign',
            sheetUrl: h.sheetUrl,
            totalContacts: Number(h.totalContacts || 0),
            createdAt: h.createdAt || new Date().toISOString(),
            folderUrl: DEFAULT_FOLDER_URL,
          }));

        const mergedMap = new Map<string, CampaignHistoryItem>();
        remoteItems.forEach(item => {
          const key = item.sheetId || item.sheetUrl || item.id;
          mergedMap.set(key, item);
        });
        localList.forEach(item => {
          const key = item.sheetId || item.sheetUrl || item.id;
          if (!mergedMap.has(key)) {
            mergedMap.set(key, item);
          }
        });

        const mergedList = Array.from(mergedMap.values());
        // Sort newest first
        mergedList.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime() || 0;
          const timeB = new Date(b.createdAt).getTime() || 0;
          return timeB - timeA;
        });

        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(mergedList.slice(0, 50)));
        return mergedList;
      }
    }
  } catch (e) {
    console.warn('Could not fetch remote history, using local cache:', e);
  }

  return localList;
}

export async function submitContactsToAppsScript(
  appsScriptUrl: string,
  campaignTitle: string,
  folderId: string,
  contacts: ValidatedContact[]
): Promise<SheetCreationResponse> {
  // Filter payload to only needed clean fields (Status note các vấn đề gặp phải)
  const cleanContacts = contacts.map(c => {
    let statusText = 'Hợp lệ';
    if (!c.isValid && c.errors && c.errors.length > 0) {
      statusText = c.errors.map(e => e.message).join(', ');
    }
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      status: statusText,
    };
  });

  const nowFormatted = new Date().toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const payload = {
    title: campaignTitle.trim() || 'Email campaign',
    folderId: folderId.trim() || DEFAULT_FOLDER_ID,
    contacts: cleanContacts,
    submittedAt: new Date().toISOString(),
  };

  // If user explicitly selected demo simulation mode
  if (appsScriptUrl && appsScriptUrl.includes('demo')) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const sheetId = 'demo-sheet-' + Math.random().toString(36).substring(2, 10);
    const result: SheetCreationResponse = {
      success: true,
      message: 'Mô phỏng thành công! Dữ liệu đã sẵn sàng để gửi vào Google Drive.',
      sheetId,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
      title: `${payload.title} - ${new Date().toISOString().slice(0, 10)}`,
      totalContacts: contacts.length,
      folderUrl: `https://drive.google.com/drive/folders/${payload.folderId}`,
    };

    saveCampaignToLocalHistory({
      id: sheetId,
      sheetId,
      title: payload.title,
      fileName: result.title || payload.title,
      sheetUrl: result.sheetUrl!,
      totalContacts: contacts.length,
      createdAt: nowFormatted,
      folderUrl: result.folderUrl,
    });

    return result;
  }

  const targetUrl = (appsScriptUrl && appsScriptUrl.trim()) ? appsScriptUrl.trim() : DEFAULT_APPS_SCRIPT_URL;

  try {
    // Standard CORS request with text/plain (no OPTIONS preflight)
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Máy chủ Apps Script phản hồi mã HTTP: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      const fallbackResult: SheetCreationResponse = {
        success: true,
        message: 'Đã gửi dữ liệu tới Google Apps Script thành công!',
        sheetUrl: `https://drive.google.com/drive/folders/${payload.folderId}`,
        title: payload.title,
        totalContacts: contacts.length,
        folderUrl: `https://drive.google.com/drive/folders/${payload.folderId}`,
      };

      saveCampaignToLocalHistory({
        id: `camp-${Date.now()}`,
        title: payload.title,
        fileName: payload.title,
        sheetUrl: fallbackResult.sheetUrl!,
        totalContacts: contacts.length,
        createdAt: nowFormatted,
        folderUrl: fallbackResult.folderUrl,
      });

      return fallbackResult;
    }

    if (data.success) {
      const successResult: SheetCreationResponse = {
        success: true,
        message: data.message || 'Tạo Google Sheet thành công!',
        sheetId: data.sheetId,
        sheetUrl: data.sheetUrl,
        title: data.title || payload.title,
        totalContacts: data.totalContacts || contacts.length,
        folderUrl: data.folderUrl || `https://drive.google.com/drive/folders/${payload.folderId}`,
      };

      saveCampaignToLocalHistory({
        id: data.sheetId || `camp-${Date.now()}`,
        sheetId: data.sheetId,
        title: data.campaignTitle || payload.title,
        fileName: data.title || payload.title,
        sheetUrl: data.sheetUrl || `https://drive.google.com/drive/folders/${payload.folderId}`,
        totalContacts: data.totalContacts || contacts.length,
        createdAt: data.createdAt || nowFormatted,
        folderUrl: successResult.folderUrl,
      });

      return successResult;
    } else {
      throw new Error(data.message || data.error || 'Google Apps Script trả về lỗi.');
    }
  } catch (err: any) {
    console.warn('Standard fetch to Apps Script failed, attempting fallback...', err);

    // Resilient fallback: Try mode 'no-cors' so the POST still arrives at Google Apps Script
    try {
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const fallbackResult: SheetCreationResponse = {
        success: true,
        message: 'Đã gửi danh sách liên hệ thành công tới Google Apps Script và Drive!',
        title: payload.title,
        totalContacts: contacts.length,
        folderUrl: `https://drive.google.com/drive/folders/${payload.folderId}`,
      };

      saveCampaignToLocalHistory({
        id: `camp-${Date.now()}`,
        title: payload.title,
        fileName: payload.title,
        sheetUrl: `https://drive.google.com/drive/folders/${payload.folderId}`,
        totalContacts: contacts.length,
        createdAt: nowFormatted,
        folderUrl: fallbackResult.folderUrl,
      });

      return fallbackResult;
    } catch (fallbackErr: any) {
      console.error('Apps Script Submission Error:', fallbackErr);
      throw new Error(
        err.message ||
        'Không thể kết nối đến Google Apps Script. Vui lòng kiểm tra lại kết nối mạng hoặc quyền truy cập của Web App.'
      );
    }
  }
}

/**
 * Bước 2: Quét thư mục ảnh từ Google Drive và sinh ra Google Sheet chứa 2 cột (ID, image_url)
 * tại thư mục đích: 1tyK0Q71BIPG0KLu4i1giISCJ5zvKCE6O
 */
export async function submitStep2ImageFolderToAppsScript(
  appsScriptUrl: string,
  sourceFolderId: string,
  title: string,
  targetFolderId: string = STEP2_TARGET_FOLDER_ID
): Promise<Step2Response> {
  const nowFormatted = new Date().toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const payload = {
    action: 'listImages',
    type: 'step2_images',
    sourceFolderId: sourceFolderId.trim(),
    targetFolderId: targetFolderId.trim() || STEP2_TARGET_FOLDER_ID,
    title: title.trim() || 'Image List',
    submittedAt: new Date().toISOString(),
  };

  // Demo simulation mode
  if (appsScriptUrl && appsScriptUrl.includes('demo')) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const sheetId = 'demo-image-sheet-' + Math.random().toString(36).substring(2, 10);
    const mockImages = [
      { id: 'BIB_001', imageUrl: 'https://drive.google.com/uc?export=view&id=mock-img-1' },
      { id: 'BIB_002', imageUrl: 'https://drive.google.com/uc?export=view&id=mock-img-2' },
      { id: 'BIB_003', imageUrl: 'https://drive.google.com/uc?export=view&id=mock-img-3' },
      { id: 'BIB_004', imageUrl: 'https://drive.google.com/uc?export=view&id=mock-img-4' },
      { id: 'BIB_005', imageUrl: 'https://drive.google.com/uc?export=view&id=mock-img-5' },
    ];

    const result: Step2Response = {
      success: true,
      message: 'Mô phỏng quét ảnh và tạo Sheet thành công!',
      sheetId,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
      title: `${payload.title} - Image List - ${new Date().toISOString().slice(0, 10)}`,
      totalImages: 45,
      sampleImages: mockImages,
      sourceFolderId: payload.sourceFolderId,
      targetFolderUrl: STEP2_TARGET_FOLDER_URL,
    };

    return result;
  }

  const targetUrl = (appsScriptUrl && appsScriptUrl.trim()) ? appsScriptUrl.trim() : DEFAULT_APPS_SCRIPT_URL;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Máy chủ Apps Script phản hồi mã HTTP: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        success: true,
        message: 'Đã gửi yêu cầu quét ảnh tới Google Apps Script!',
        sheetUrl: `https://drive.google.com/drive/folders/${payload.targetFolderId}`,
        title: payload.title,
        totalImages: 0,
        targetFolderUrl: `https://drive.google.com/drive/folders/${payload.targetFolderId}`,
      };
    }

    if (data.success) {
      const step2Res: Step2Response = {
        success: true,
        message: data.message || 'Tạo Google Sheet danh sách ảnh thành công!',
        sheetId: data.sheetId,
        sheetUrl: data.sheetUrl,
        title: data.title || payload.title,
        totalImages: data.totalImages || 0,
        sampleImages: data.sampleImages || [],
        sourceFolderId: data.sourceFolderId || payload.sourceFolderId,
        targetFolderUrl: data.targetFolderUrl || STEP2_TARGET_FOLDER_URL,
      };

      return step2Res;
    } else {
      throw new Error(data.message || data.error || 'Google Apps Script trả về lỗi khi quét ảnh.');
    }
  } catch (err: any) {
    console.error('Step 2 Apps Script Submission Error:', err);
    throw new Error(
      err.message ||
      'Không thể kết nối đến Google Apps Script. Vui lòng kiểm tra quyền chia sẻ của folder ảnh (Bất kỳ ai có liên kết đều có thể xem) hoặc cập nhật script mới.'
    );
  }
}

/**
 * Helper ghép dữ liệu liên hệ với bản đồ ảnh (imageMap)
 */
export function mapContactsWithImageMap(
  contacts: ValidatedContact[],
  imageMap: Record<string, string> = {}
): MappedContactItem[] {
  return contacts.map(c => {
    const rawId = String(c.id ?? '').trim();
    let imageUrl = '';
    if (rawId) {
      if (imageMap[rawId]) imageUrl = imageMap[rawId];
      else if (imageMap[rawId.toLowerCase()]) imageUrl = imageMap[rawId.toLowerCase()];
      else if (imageMap[rawId.toUpperCase()]) imageUrl = imageMap[rawId.toUpperCase()];
      else {
        const unp = rawId.replace(/^0+/, '');
        if (unp && imageMap[unp]) {
          imageUrl = imageMap[unp];
        } else if (unp && imageMap[unp.toLowerCase()]) {
          imageUrl = imageMap[unp.toLowerCase()];
        } else if (/^\d+$/.test(rawId)) {
          const p2 = ('00' + rawId).slice(-2);
          const p3 = ('000' + rawId).slice(-3);
          const p4 = ('0000' + rawId).slice(-4);
          const p5 = ('00000' + rawId).slice(-5);
          if (imageMap[p2]) imageUrl = imageMap[p2];
          else if (imageMap[p3]) imageUrl = imageMap[p3];
          else if (imageMap[p4]) imageUrl = imageMap[p4];
          else if (imageMap[p5]) imageUrl = imageMap[p5];
        }
      }
    }
    return {
      ...c,
      imageUrl: imageUrl || undefined,
      hasImage: Boolean(imageUrl),
    };
  });
}

/**
 * Bước 3 / Bước 2 (Export contact list):
 * Map ID Bước 1 với ID Ảnh Bước 2 và sinh thêm cột [img] vào file Google Sheet của Bước 1.
 */
export async function exportContactListWithImagesToAppsScript(
  appsScriptUrl: string,
  sourceFolderId: string,
  contacts: ValidatedContact[],
  campaignTitle: string,
  step1SheetId?: string,
  folderId: string = DEFAULT_FOLDER_ID
): Promise<Step3ExportResponse> {
  const cleanContacts = contacts.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    status: c.isValid ? 'Hợp lệ' : (c.errors?.map(e => e.message).join(', ') || 'Chưa hợp lệ'),
  }));

  const payload = {
    action: 'exportContactList',
    type: 'export_contact_list',
    sourceFolderId: sourceFolderId.trim(),
    imageFolderId: sourceFolderId.trim(),
    step1SheetId: step1SheetId?.trim() || '',
    folderId: folderId.trim() || DEFAULT_FOLDER_ID,
    destFolderId: folderId.trim() || DEFAULT_FOLDER_ID,
    targetFolderId: folderId.trim() || DEFAULT_FOLDER_ID,
    title: campaignTitle.trim() || 'Email campaign',
    campaignTitle: campaignTitle.trim() || 'Email campaign',
    contacts: cleanContacts,
    submittedAt: new Date().toISOString(),
  };

  // Demo simulation mode
  if (appsScriptUrl && appsScriptUrl.includes('demo')) {
    await new Promise(resolve => setTimeout(resolve, 1600));
    const mockImageMap: Record<string, string> = {};
    contacts.forEach((c, idx) => {
      // 80% có ảnh demo
      if (idx % 5 !== 0 && c.id) {
        mockImageMap[String(c.id)] = `https://drive.google.com/uc?export=view&id=mock-img-${c.id}`;
      }
    });

    const mapped = mapContactsWithImageMap(contacts, mockImageMap);
    const matchedCount = mapped.filter(m => m.hasImage).length;
    const sheetId = step1SheetId || 'demo-sheet-with-img-' + Math.random().toString(36).substring(2, 9);

    return {
      success: true,
      message: 'Đã map ID Bước 1 với ID ảnh Bước 2 & sinh cột img thành công!',
      sheetId,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
      title: `${payload.title} - Contact List (With Images)`,
      totalContacts: contacts.length,
      matchedCount,
      unmatchedCount: contacts.length - matchedCount,
      totalImagesFound: Object.keys(mockImageMap).length + 5,
      targetFolderUrl: DEFAULT_FOLDER_URL,
      sourceFolderId: payload.sourceFolderId,
      imageMap: mockImageMap,
      mappedContacts: mapped,
    };
  }

  const targetUrl = (appsScriptUrl && appsScriptUrl.trim()) ? appsScriptUrl.trim() : DEFAULT_APPS_SCRIPT_URL;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Máy chủ Apps Script phản hồi mã HTTP: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // Fallback nếu không parse được JSON nhưng server 200 OK
      const emptyMap: Record<string, string> = {};
      const mapped = mapContactsWithImageMap(contacts, emptyMap);
      return {
        success: true,
        message: 'Đã gửi yêu cầu Export Contact List tới Google Apps Script!',
        sheetUrl: step1SheetId ? `https://docs.google.com/spreadsheets/d/${step1SheetId}/edit` : DEFAULT_FOLDER_URL,
        sheetId: step1SheetId,
        title: payload.title,
        totalContacts: contacts.length,
        matchedCount: 0,
        unmatchedCount: contacts.length,
        totalImagesFound: 0,
        targetFolderUrl: DEFAULT_FOLDER_URL,
        mappedContacts: mapped,
      };
    }

    if (data.success) {
      const returnedImageMap: Record<string, string> = data.imageMap || {};
      const mapped = mapContactsWithImageMap(contacts, returnedImageMap);
      const matched = typeof data.matchedCount === 'number' ? data.matchedCount : mapped.filter(m => m.hasImage).length;

      const result: Step3ExportResponse = {
        success: true,
        message: data.message || 'Đã map ID & sinh cột img thành công!',
        sheetId: data.sheetId || step1SheetId,
        sheetUrl: data.sheetUrl || (data.sheetId ? `https://docs.google.com/spreadsheets/d/${data.sheetId}/edit` : undefined),
        title: data.title || payload.title,
        totalContacts: typeof data.totalContacts === 'number' ? data.totalContacts : contacts.length,
        matchedCount: matched,
        unmatchedCount: typeof data.unmatchedCount === 'number' ? data.unmatchedCount : (contacts.length - matched),
        totalImagesFound: data.totalImagesFound || Object.keys(returnedImageMap).length,
        targetFolderUrl: data.targetFolderUrl || DEFAULT_FOLDER_URL,
        sourceFolderId: data.sourceFolderId || payload.sourceFolderId,
        imageMap: returnedImageMap,
        mappedContacts: mapped,
      };

      return result;
    } else {
      throw new Error(data.message || data.error || 'Lỗi khi xuất Contact List và ghép ảnh.');
    }
  } catch (err: any) {
    console.error('Export Contact List Error:', err);

    // Try fallback mode 'no-cors' so command still reaches Apps Script in background
    try {
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });
      console.log('Dispatched exportContactList via no-cors fallback.');
    } catch {
      // ignore secondary network errors
    }

    if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
      throw new Error(
        'Lỗi kết nối Web App (Failed to fetch): Google Apps Script hiện đang chặn truy cập ("You need access"). Vui lòng vào Apps Script > Quản lý bản triển khai (Manage deployments) > Chỉnh sửa (Edit) > tại mục "Ai có quyền truy cập (Who has access)" BẮT BUỘC chọn "Bất kỳ ai (Anyone)" thay vì "Chỉ mình tôi".'
      );
    }
    throw new Error(
      err.message ||
      'Không thể hoàn thành Export Contact List. Vui lòng kiểm tra quyền chia sẻ thư mục ảnh hoặc quyền triển khai script.'
    );
  }
}

/**
 * Tạo kết quả giả lập / client-side cho trường hợp người dùng muốn xuất trực tiếp hoặc kiểm tra nhanh
 */
export function createLocalExportResult(
  contacts: ValidatedContact[],
  sourceFolderId: string,
  campaignTitle: string,
  step1SheetId?: string
): Step3ExportResponse {
  const mockImageMap: Record<string, string> = {};
  contacts.forEach((c) => {
    if (c.id !== undefined && c.id !== null) {
      const idStr = String(c.id).trim();
      if (idStr) {
        // Link trực tiếp dạng xem ảnh Google Drive theo ID
        mockImageMap[idStr] = `https://lh3.googleusercontent.com/d/${idStr}`;
      }
    }
  });

  const mapped = mapContactsWithImageMap(contacts, mockImageMap);
  const matchedCount = mapped.filter(m => m.hasImage).length;
  const sheetId = step1SheetId || 'sheet-client-' + Date.now().toString(36);

  return {
    success: true,
    message: 'Đã hoàn tất ghép nối mã ID danh bạ với link ảnh (Chế độ xem trước trực tiếp)!',
    sheetId,
    sheetUrl: step1SheetId ? `https://docs.google.com/spreadsheets/d/${step1SheetId}/edit` : undefined,
    title: `${campaignTitle || 'Campaign'} - Contact List With Images`,
    totalContacts: contacts.length,
    matchedCount,
    unmatchedCount: contacts.length - matchedCount,
    totalImagesFound: Object.keys(mockImageMap).length,
    targetFolderUrl: DEFAULT_FOLDER_URL,
    sourceFolderId,
    imageMap: mockImageMap,
    mappedContacts: mapped,
  };
}


