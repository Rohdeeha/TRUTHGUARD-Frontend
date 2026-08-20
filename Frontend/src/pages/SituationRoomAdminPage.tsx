import React, { useState } from 'react';
import { Save, PlusCircle, RefreshCw, Trash2, X } from 'lucide-react';

export interface AdminFormState {
  id?: number | string;
  title: string;
  claim: string;
  description: string;
  category: string;
  status: string;
  location: string;
  is_eligible: boolean;
  is_anonymous: boolean;
  evidence_file: File | string | null;
  reporter: string;
}

const initialFormState: AdminFormState = {
  title: '',
  claim: '',
  description: '',
  category: 'Disinformation',
  status: 'Pending',
  location: '',
  is_eligible: true,
  is_anonymous: false,
  evidence_file: null,
  reporter: '',
};

export interface AdminFormProps {
  initialData?: AdminFormState | null;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const SituationRoomAdminForm: React.FC<AdminFormProps> = ({
  initialData,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<AdminFormState>(
    initialData || initialFormState
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, evidence_file: e.target.files![0] }));
    }
  };

  const sendPayload = async (data: AdminFormState) => {
    const payload = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        // If evidence_file is already a remote string URL (from existing record), don't send as file
        if (key === 'evidence_file' && !(val instanceof File)) {
          return;
        }
        payload.append(key, val as any);
      }
    });

    const token = localStorage.getItem('fact_checker_token') || sessionStorage.getItem('truthguard_admin_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const url = data.id
      ? `https://truthguard-api-sut7.onrender.com/api/incidents/${data.id}/`
      : `https://truthguard-api-sut7.onrender.com/api/incidents/`;

    const method = data.id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers,
      body: payload,
    });

    if (!res.ok) {
      let errDetail = `Server returned status ${res.status}`;
      try {
        const errJson = await res.json();
        if (errJson.detail) errDetail = errJson.detail;
      } catch (_) { }
      throw new Error(errDetail);
    }

    return await res.json();
  };

  // 1. Action: SAVE (Submits and closes form)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      await sendPayload(formData);
      setMessage({ type: 'success', text: 'Incident saved successfully!' });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save incident.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Action: Save and add another (Submits and resets form)
  const handleSaveAndAddAnother = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      await sendPayload(formData);
      setFormData(initialFormState);
      setMessage({ type: 'success', text: 'Saved! Form reset for new record.' });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save incident.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Action: Save and continue editing (Submits and keeps current ID)
  const handleSaveAndContinue = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const result = await sendPayload(formData);
      if (result.id) {
        setFormData((prev) => ({ ...prev, id: result.id }));
      }
      setMessage({ type: 'success', text: 'Saved! You can continue editing.' });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save incident.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Action: DELETE (Deletes incident record from Django backend)
  const handleDelete = async () => {
    if (!formData.id) {
      setMessage({ type: 'error', text: 'Cannot delete an unsaved record.' });
      return;
    }
    if (!window.confirm('Are you sure you want to delete this incident record?')) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('fact_checker_token') || sessionStorage.getItem('truthguard_admin_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(
        `https://truthguard-api-sut7.onrender.com/api/incidents/${formData.id}/`,
        { method: 'DELETE', headers }
      );
      if (!res.ok) throw new Error('Failed to delete incident.');
      setMessage({ type: 'success', text: 'Incident deleted successfully.' });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error deleting incident.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card-theme border border-theme rounded-xl p-6 text-main-white max-w-4xl mx-auto shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b border-theme pb-4">
        <h2 className="text-xl font-bold text-[#1CB5BE]">
          {formData.id ? `Edit Incident #${formData.id}` : 'Create New Incident Report'}
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-muted-theme hover:text-main-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 text-sm font-semibold ${message.type === 'success'
            ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
            : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
            }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Title & Claim */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full bg-slate-50 border border-theme rounded-lg px-3 py-2 text-sm text-main-white focus:outline-none focus:border-[#1CB5BE]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Claim</label>
            <input
              type="text"
              name="claim"
              value={formData.claim}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-theme rounded-lg px-3 py-2 text-sm text-main-white focus:outline-none focus:border-[#1CB5BE]"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-theme rounded-lg px-3 py-2 text-sm text-main-white focus:outline-none focus:border-[#1CB5BE]"
          />
        </div>

        {/* Category, Status, Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-theme rounded-lg px-3 py-2 text-sm text-main-white focus:outline-none focus:border-[#1CB5BE]"
            >
              <option value="Disinformation">Disinformation</option>
              <option value="Voter Suppression">Voter Suppression</option>
              <option value="Hate Speech">Hate Speech</option>
              <option value="Electoral Violence">Electoral Violence</option>
              <option value="General Rumor">General Rumor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-theme rounded-lg px-3 py-2 text-sm text-main-white focus:outline-none focus:border-[#1CB5BE]"
            >
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Debunked">Debunked</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Osogbo, Osun State"
              className="w-full bg-slate-50 border border-theme rounded-lg px-3 py-2 text-sm text-main-white focus:outline-none focus:border-[#1CB5BE]"
            />
          </div>
        </div>

        {/* Reporter & Evidence File */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Reporter / Author</label>
            <input
              type="text"
              name="reporter"
              value={formData.reporter}
              onChange={handleChange}
              placeholder="Author name or ID"
              className="w-full bg-slate-50 border border-theme rounded-lg px-3 py-2 text-sm text-main-white focus:outline-none focus:border-[#1CB5BE]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Evidence File / Media</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full bg-slate-50 border border-theme rounded-lg px-3 py-1.5 text-xs text-muted-theme file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#1CB5BE] file:text-black hover:file:bg-[#1CB5BE]/80"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-300">
            <input
              type="checkbox"
              name="is_eligible"
              checked={formData.is_eligible}
              onChange={handleChange}
              className="rounded bg-slate-50 border-theme text-[#1CB5BE] focus:ring-0"
            />
            Is Eligible
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-300">
            <input
              type="checkbox"
              name="is_anonymous"
              checked={formData.is_anonymous}
              onChange={handleChange}
              className="rounded bg-slate-50 border-theme text-[#1CB5BE] focus:ring-0"
            />
            Is Anonymous
          </label>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-theme">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting || !formData.id}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/40 rounded-lg hover:bg-rose-600/30 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1A3352] hover:bg-[#22436c] text-main-white rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Save and continue editing
            </button>

            <button
              type="button"
              onClick={handleSaveAndAddAnother}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1A3352] hover:bg-[#22436c] text-main-white rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Save and add another
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#1CB5BE] hover:bg-[#189ea6] text-black font-bold rounded-lg text-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              SAVE
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export const SituationRoomAdminPage = SituationRoomAdminForm;
export default SituationRoomAdminForm;
