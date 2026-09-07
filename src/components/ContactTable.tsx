import { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, Edit2, Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ValidatedContact } from '../types';

interface ContactTableProps {
  contacts: ValidatedContact[];
  activeFilter: 'all' | 'valid' | 'invalid' | 'duplicates';
  onUpdateContact: (uuid: string, field: 'id' | 'name' | 'email', value: string) => void;
  onDeleteContact: (uuid: string) => void;
}

export function ContactTable({
  contacts,
  activeFilter,
  onUpdateContact,
  onDeleteContact,
}: ContactTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ id: string; name: string; email: string }>({
    id: '',
    name: '',
    email: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Reset to page 1 whenever active filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // 1. Filter by status
      if (activeFilter === 'valid' && !c.isValid) return false;
      if (activeFilter === 'invalid' && c.isValid) return false;
      if (activeFilter === 'duplicates' && !c.isDuplicateEmail && !c.isDuplicateId) return false;

      // 2. Filter by search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesId = c.id.toLowerCase().includes(query);
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesEmail = c.email.toLowerCase().includes(query);
        return matchesId || matchesName || matchesEmail;
      }

      return true;
    });
  }, [contacts, activeFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize));
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredContacts.slice(start, start + pageSize);
  }, [filteredContacts, currentPage, pageSize]);

  const startEdit = (c: ValidatedContact) => {
    setEditingUuid(c.uuid);
    setEditForm({ id: c.id, name: c.name, email: c.email });
  };

  const saveEdit = (uuid: string) => {
    onUpdateContact(uuid, 'id', editForm.id);
    onUpdateContact(uuid, 'name', editForm.name);
    onUpdateContact(uuid, 'email', editForm.email);
    setEditingUuid(null);
  };

  const cancelEdit = () => {
    setEditingUuid(null);
  };

  return (
    <div id="contact-table-section" className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs mb-6">
      {/* Table Header Bar with Search & Pagination info */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="search-contact-input"
            placeholder="Tìm theo ID, Tên hoặc Email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>
            Hiển thị <strong>{filteredContacts.length}</strong> / {contacts.length} liên hệ
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                id="prev-page-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
              >
                &larr;
              </button>
              <span className="font-mono px-1">
                {currentPage}/{totalPages}
              </span>
              <button
                type="button"
                id="next-page-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 rounded border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
              >
                &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/75 text-slate-700 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 w-12 text-center">#</th>
              <th className="py-2.5 px-4 w-28">ID</th>
              <th className="py-2.5 px-4 w-44">Name (Họ tên)</th>
              <th className="py-2.5 px-4">Email</th>
              <th className="py-2.5 px-4 w-60">Status (Vấn đề ghi nhận)</th>
              <th className="py-2.5 px-3 w-20 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedContacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Không tìm thấy liên hệ nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              paginatedContacts.map((contact, idx) => {
                const isEditing = editingUuid === contact.uuid;
                const rowNumber = (currentPage - 1) * pageSize + idx + 1;

                return (
                  <tr
                    key={contact.uuid}
                    id={`contact-row-${contact.uuid}`}
                    className={`transition-colors ${
                      !contact.isValid ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {rowNumber}
                    </td>

                    {/* ID */}
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.id}
                          onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
                          className="w-full py-1 px-1.5 border border-emerald-400 rounded text-xs bg-white"
                          placeholder="Nhập ID"
                        />
                      ) : (
                        <span className={!contact.id ? 'text-red-500 italic' : ''}>
                          {contact.id || '(Thiếu ID)'}
                        </span>
                      )}
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-4 text-slate-900 font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full py-1 px-1.5 border border-emerald-400 rounded text-xs bg-white"
                          placeholder="Nhập Họ tên"
                        />
                      ) : (
                        <span className={!contact.name ? 'text-red-500 italic' : ''}>
                          {contact.name || '(Thiếu họ tên)'}
                        </span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="py-2.5 px-4">
                      {isEditing ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full py-1 px-1.5 border border-emerald-400 rounded text-xs bg-white"
                          placeholder="user@domain.com"
                        />
                      ) : (
                        <span
                          className={`font-mono text-[11.5px] ${
                            !contact.email || !contact.isValid
                              ? 'text-red-600 font-medium'
                              : 'text-slate-700'
                          }`}
                        >
                          {contact.email || '(Thiếu Email)'}
                        </span>
                      )}
                    </td>

                    {/* Status badge & detail errors */}
                    <td className="py-2.5 px-4">
                      {contact.isValid ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Hợp lệ</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 py-0.5">
                          {contact.errors.map((err, errIdx) => (
                            <div
                              key={errIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200"
                            >
                              <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                              <span>{err.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(contact.uuid)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            title="Lưu thay đổi"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                            title="Hủy"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(contact)}
                            className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-slate-100 cursor-pointer transition-colors"
                            title="Chỉnh sửa dòng này"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteContact(contact.uuid)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
