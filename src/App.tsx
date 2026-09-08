import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StepProgressBar } from './components/StepProgressBar';
import { FileUpload } from './components/FileUpload';
import { ColumnMapper } from './components/ColumnMapper';
import { ValidationSummary } from './components/ValidationSummary';
import { ContactTable } from './components/ContactTable';
import { CampaignConfigSection } from './components/CampaignConfigSection';
import { CampaignHistoryList } from './components/CampaignHistoryList';
import { Step2ImageScanner } from './components/Step2ImageScanner';
import { Step3ExportContactList } from './components/Step3ExportContactList';
import { AppScriptModal } from './components/AppScriptModal';
import { SettingsModal } from './components/SettingsModal';
import { PasswordPromptModal } from './components/PasswordPromptModal';
import { SuccessView } from './components/SuccessView';
import { parseExcelFile } from './utils/excelParser';
import { validateContactList } from './utils/validator';
import {
  submitContactsToAppsScript,
  exportContactListWithImagesToAppsScript,
  createLocalExportResult,
  getLocalCampaignHistory,
  fetchCampaignHistory,
} from './utils/appScriptService';
import {
  ValidatedContact,
  SheetCreationResponse,
  RawContactRow,
  CampaignHistoryItem,
  Step3ExportResponse,
} from './types';
import {
  DEFAULT_CAMPAIGN_TITLE,
  DEFAULT_FOLDER_ID,
  DEFAULT_APPS_SCRIPT_URL,
  STEP2_TARGET_FOLDER_ID,
  DEFAULT_IMAGE_FOLDER_ID,
} from './constants/appScriptCode';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [rawRows, setRawRows] = useState<RawContactRow[]>([]);
  const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);

  // Mapped column names
  const [idKey, setIdKey] = useState<string>('ID');
  const [nameKey, setNameKey] = useState<string>('Name');
  const [emailKey, setEmailKey] = useState<string>('Email');

  // Contact items with validation state
  const [contacts, setContacts] = useState<ValidatedContact[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'valid' | 'invalid' | 'duplicates'>('all');

  // Campaign history list state
  const [historyList, setHistoryList] = useState<CampaignHistoryItem[]>(() => getLocalCampaignHistory());
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);

  // Workflow steps: 1 = Contact Sheet, 2 = Drive Images, 3 = Export & Map img
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [campaignTitle, setCampaignTitle] = useState<string>('');
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    const saved = localStorage.getItem('apps_script_url');
    if (!saved || saved !== DEFAULT_APPS_SCRIPT_URL) {
      localStorage.setItem('apps_script_url', DEFAULT_APPS_SCRIPT_URL);
      return DEFAULT_APPS_SCRIPT_URL;
    }
    return saved.trim() || DEFAULT_APPS_SCRIPT_URL;
  });

  // Step 3 State
  const [step3Result, setStep3Result] = useState<Step3ExportResponse | null>(null);
  const [isStep3Processing, setIsStep3Processing] = useState<boolean>(false);
  const [step3Error, setStep3Error] = useState<string | null>(null);
  const [lastExportFolderId, setLastExportFolderId] = useState<string>(DEFAULT_IMAGE_FOLDER_ID);

  // Modals & results
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [submitResult, setSubmitResult] = useState<SheetCreationResponse | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleRequestOpenSettings = () => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSuccess = () => {
    setIsPasswordModalOpen(false);
    setIsSettingsOpen(true);
  };

  // Load campaign history from Apps Script & localStorage
  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const items = await fetchCampaignHistory(appsScriptUrl);
      setHistoryList(items);
    } catch (err) {
      console.warn('Error loading campaign history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [appsScriptUrl]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Save Apps Script URL in localStorage
  useEffect(() => {
    if (appsScriptUrl) {
      localStorage.setItem('apps_script_url', appsScriptUrl);
    }
  }, [appsScriptUrl]);

  // Handle Excel file upload
  const handleFileLoaded = async (file: File) => {
    setIsLoading(true);
    setGlobalError(null);
    setSubmitResult(null);

    try {
      const parsed = await parseExcelFile(file);
      setCurrentFileName(file.name);
      setRawRows(parsed.rows);
      setAvailableHeaders(parsed.headers);

      const detectedId = parsed.detectedColumns.idColumn || parsed.headers[0] || 'ID';
      const detectedName = parsed.detectedColumns.nameColumn || parsed.headers[1] || 'Name';
      const detectedEmail = parsed.detectedColumns.emailColumn || parsed.headers[2] || 'Email';

      setIdKey(detectedId);
      setNameKey(detectedName);
      setEmailKey(detectedEmail);

      // Perform validation
      const validatedList = validateContactList(parsed.rows, detectedId, detectedName, detectedEmail);
      setContacts(validatedList);

      // Set default title if empty
      if (!campaignTitle.trim()) {
        const defaultName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setCampaignTitle(defaultName);
      }

      // Tự động active vào tab Có lỗi nếu phát hiện có vấn đề
      const hasErrors = validatedList.some((c) => !c.isValid);
      setActiveFilter(hasErrors ? 'invalid' : 'all');
    } catch (err: any) {
      console.error('File parsing error:', err);
      setGlobalError(err.message || 'Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run validation when user changes column mappings
  const handleUpdateMapping = (newIdKey: string, newNameKey: string, newEmailKey: string) => {
    setIdKey(newIdKey);
    setNameKey(newNameKey);
    setEmailKey(newEmailKey);

    if (rawRows.length > 0) {
      const revalidated = validateContactList(rawRows, newIdKey, newNameKey, newEmailKey);
      setContacts(revalidated);
      const hasErrors = revalidated.some((c) => !c.isValid);
      setActiveFilter(hasErrors ? 'invalid' : 'all');
    }
  };

  // Inline editing of a contact
  const handleUpdateContact = (uuid: string, field: 'id' | 'name' | 'email', value: string) => {
    setContacts((prev) => {
      const updated = prev.map((item) => {
        if (item.uuid === uuid) {
          return { ...item, [field]: value };
        }
        return item;
      });

      const rawAdapted: RawContactRow[] = updated.map((c) => ({
        [idKey]: c.id,
        [nameKey]: c.name,
        [emailKey]: c.email,
      }));

      return validateContactList(rawAdapted, idKey, nameKey, emailKey);
    });
  };

  // Delete single contact
  const handleDeleteContact = (uuid: string) => {
    setContacts((prev) => {
      const updated = prev.filter((c) => c.uuid !== uuid);
      const rawAdapted: RawContactRow[] = updated.map((c) => ({
        [idKey]: c.id,
        [nameKey]: c.name,
        [emailKey]: c.email,
      }));
      return validateContactList(rawAdapted, idKey, nameKey, emailKey);
    });
  };

  // Remove all invalid rows at once
  const handleRemoveAllInvalid = () => {
    setContacts((prev) => {
      const onlyValid = prev.filter((c) => c.isValid);
      const rawAdapted: RawContactRow[] = onlyValid.map((c) => ({
        [idKey]: c.id,
        [nameKey]: c.name,
        [emailKey]: c.email,
      }));
      return validateContactList(rawAdapted, idKey, nameKey, emailKey);
    });
  };

  // Reset entire form
  const handleReset = () => {
    setCurrentFileName('');
    setRawRows([]);
    setAvailableHeaders([]);
    setContacts([]);
    setSubmitResult(null);
    setStep3Result(null);
    setGlobalError(null);
    setActiveFilter('all');
  };

  // Metrics calculation
  const totalCount = contacts.length;
  const validCount = contacts.filter((c) => c.isValid).length;
  const invalidCount = contacts.filter((c) => !c.isValid).length;
  const duplicateCount = contacts.filter((c) => c.isDuplicateEmail || c.isDuplicateId).length;

  // Submit to Google Apps Script / Drive (Step 1)
  const handleSubmit = async (onlyValid: boolean, isDemo: boolean) => {
    if (!campaignTitle.trim()) {
      setGlobalError('Vui lòng nhập tên Email campaign trước khi xuất Google Sheet!');
      return;
    }

    const listToSend = onlyValid ? contacts.filter((c) => c.isValid) : contacts;

    if (listToSend.length === 0) {
      setGlobalError('Không có liên hệ nào để gửi! Vui lòng kiểm tra lại file hoặc bỏ chọn chỉ gửi dòng hợp lệ.');
      return;
    }

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const result = await submitContactsToAppsScript(
        isDemo ? '' : appsScriptUrl,
        campaignTitle,
        DEFAULT_FOLDER_ID,
        listToSend
      );
      setSubmitResult(result);
      loadHistory();
    } catch (err: any) {
      console.error('Submission failed:', err);
      setGlobalError(err.message || 'Lỗi khi gửi dữ liệu sang Google Apps Script');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 Action: "Export contact list"
  // User requirement:
  // 1. Rename button to "Export contact list"
  // 2. Jump immediately to Step 3
  // 3. Map ID from Step 1 with ID from Step 2, and add an "img" column to Step 1's Sheet file
  const handleExportContactList = async (folderId: string, sendAll: boolean = true) => {
    // 1. Immediately jump to Step 3
    setCurrentStep(3);
    setIsStep3Processing(true);
    setStep3Error(null);
    setGlobalError(null);
    if (folderId) {
      setLastExportFolderId(folderId);
    }

    try {
      // Mặc định gửi TOÀN BỘ danh sách (kể cả các dòng có chung Email) để ghép đủ 100% ảnh theo ID
      const listToSend = sendAll
        ? contacts
        : (contacts.filter((c) => c.isValid).length > 0 ? contacts.filter((c) => c.isValid) : contacts);

      const targetTitle = campaignTitle.trim() || currentFileName.replace(/\.[^/.]+$/, '') || 'Campaign Contact List';
      const step1SheetId = submitResult?.sheetId;

      const res = await exportContactListWithImagesToAppsScript(
        appsScriptUrl,
        folderId,
        listToSend,
        targetTitle,
        step1SheetId,
        DEFAULT_FOLDER_ID
      );

      setStep3Result(res);
      // Reload campaign history to display updated campaign item
      loadHistory();
    } catch (err: any) {
      console.error('Export contact list error:', err);
      setStep3Error(err.message || 'Lỗi khi thực hiện Export Contact List & map ảnh');
    } finally {
      setIsStep3Processing(false);
    }
  };

  // Fallback client export: allow preview and download immediately without waiting for Apps Script
  const handleFallbackClientExport = () => {
    const listToSend = contacts.length > 0 ? contacts : [];

    const targetTitle = campaignTitle.trim() || currentFileName.replace(/\.[^/.]+$/, '') || 'Campaign Contact List';
    const fallbackRes = createLocalExportResult(
      listToSend,
      lastExportFolderId || DEFAULT_IMAGE_FOLDER_ID,
      targetTitle,
      submitResult?.sheetId
    );
    setStep3Result(fallbackRes);
    setStep3Error(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Global Header */}
      <Header onOpenSettings={handleRequestOpenSettings} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Step Progress Tracker */}
        <StepProgressBar
          currentStep={currentStep}
          onSelectStep={(step) => setCurrentStep(step)}
          hasStep1Data={contacts.length > 0}
          hasStep3Data={Boolean(step3Result)}
        />

        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-3 text-red-800 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Đã có lỗi xảy ra:</p>
                <p className="mt-0.5">{globalError}</p>
              </div>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-red-600 hover:text-red-900 font-bold px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* VIEW BƯỚC 3: KẾT QUẢ EXPORT CONTACT LIST & MAP ẢNH */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Step3ExportContactList
              result={step3Result}
              isProcessing={isStep3Processing}
              error={step3Error}
              onBackToStep2={() => setCurrentStep(2)}
              onOpenCodeModal={() => setIsCodeModalOpen(true)}
              campaignTitle={campaignTitle}
              originalFileName={currentFileName}
              availableHeaders={availableHeaders}
              onRetry={() => handleExportContactList(lastExportFolderId || DEFAULT_IMAGE_FOLDER_ID)}
              onClientExportFallback={handleFallbackClientExport}
              contacts={contacts}
              rawRows={rawRows}
              idKey={idKey}
              step1SheetId={submitResult?.sheetId}
              step1SheetUrl={submitResult?.sheetUrl}
            />
          </div>
        )}

        {/* VIEW BƯỚC 2: QUÉT ẢNH DRIVE & NÚT EXPORT CONTACT LIST */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Step2ImageScanner
              onExportContactList={handleExportContactList}
              isProcessing={isStep3Processing}
              campaignTitle={campaignTitle}
              totalStep1Contacts={contacts.length}
              validContactsCount={contacts.filter((c) => c.isValid).length}
              duplicateEmailCount={contacts.filter((c) => c.isDuplicateEmail).length}
              step1SheetUrl={submitResult?.sheetUrl}
            />
          </div>
        )}

        {/* VIEW BƯỚC 1: UPLOAD EXCEL & TẠO SHEET CONTACT */}
        {currentStep === 1 && (
          <>
            {/* Success View Screen */}
            {submitResult ? (
              <SuccessView
                result={submitResult}
                onReset={handleReset}
                onContinueToStep2={() => setCurrentStep(2)}
              />
            ) : (
              <div className="space-y-6">
                <FileUpload
                  onFileLoaded={handleFileLoaded}
                  isLoading={isLoading}
                  currentFileName={currentFileName}
                  onReset={handleReset}
                />

                {/* Màn hình đầu tiên: Hiển thị 10 List Campaign mới nhất */}
                {contacts.length === 0 && (
                  <CampaignHistoryList
                    history={historyList}
                    isLoading={isHistoryLoading}
                    onRefresh={loadHistory}
                  />
                )}

                {/* Step 1.2: If file parsed, show Column Mapper & Validation Table */}
                {contacts.length > 0 && (
                  <>
                    {/* Column Mapper if multiple headers detected */}
                    {availableHeaders.length > 0 && (
                      <ColumnMapper
                        availableHeaders={availableHeaders}
                        idKey={idKey}
                        nameKey={nameKey}
                        emailKey={emailKey}
                        onUpdateMapping={handleUpdateMapping}
                      />
                    )}

                    {/* Summary Metric Cards */}
                    <ValidationSummary
                      total={totalCount}
                      validCount={validCount}
                      invalidCount={invalidCount}
                      duplicateCount={duplicateCount}
                      contacts={contacts}
                      onRemoveAllInvalid={handleRemoveAllInvalid}
                      activeFilter={activeFilter}
                      setActiveFilter={setActiveFilter}
                    />

                    {/* Contact List Table */}
                    <ContactTable
                      contacts={contacts}
                      activeFilter={activeFilter}
                      onUpdateContact={handleUpdateContact}
                      onDeleteContact={handleDeleteContact}
                    />

                    {/* Campaign Config & Drive Submission Section */}
                    <CampaignConfigSection
                      title={campaignTitle}
                      onChangeTitle={setCampaignTitle}
                      onSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                      onOpenSettings={handleRequestOpenSettings}
                      validCount={validCount}
                      totalCount={totalCount}
                    />
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-5 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <p>
          Contact List Creator &bull; Bước 1: Validate Excel (ID, Name, Email) &rarr; Bước 2: Quét ảnh Drive &rarr; Bước 3: Export Contact List kèm cột [img].
        </p>
      </footer>

      {/* Password Prompt Modal for Settings */}
      <PasswordPromptModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
        correctPassword="201090"
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        appsScriptUrl={appsScriptUrl}
        onChangeAppsScriptUrl={setAppsScriptUrl}
        onOpenCodeModal={() => {
          setIsSettingsOpen(false);
          setIsCodeModalOpen(true);
        }}
      />

      {/* Apps Script Code Modal */}
      <AppScriptModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
