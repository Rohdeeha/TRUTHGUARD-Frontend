import React, { useState } from 'react';
import { Save, PlusCircle, RefreshCw, Trash2, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://truthguard-api-sut7.onrender.com/api';

export interface AdminFormState {
  id?: number | string;
  claim: string;
  title?: string;
  who_said_it: string;
  where_and_when: string;
  evidence_links: string;
  details?: string;
  category: string;
  status: string;
  location: string;
  is_anonymous: boolean;
  is_tfgbv: boolean;
  evidence_file: File | string | null;
}

const initialFormState: AdminFormState = {
  claim: '',
  who_said_it: '',
  where_and_when: '',
  evidence_links: '',
  category: 'DISINFORMATION',
  status: 'PENDING',
  location: '',
  is_anonymous: false,
  is_tfgbv: false,
  evidence_file: null,
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

    // Prepare compatibility fallbacks so both legacy and updated endpoints capture data
    const finalData = {
      ...data,
      title: data.claim, // Ensures components reading .title work
      details: data.details || (data.evidence_links ? `Evidence: ${data.evidence_links}` : 'No evidence provided'),
    };

    Object.entries(finalData).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        if (key === 'evidence_file' && !(val instanceof File)) {
          return;
        }
        payload.append(key, val as any);
      }
    });

    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('fact_checker_token') ||
      sessionStorage.getItem('truthguard_admin_token');

    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const url = data.id
      ? `${API_BASE_URL}/incidents/${data.id}/`
      : `${API_BASE_URL}/incidents/`;

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

  const handleSaveAndContinue = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const result = await sendPayload(formData);
      if (result?.id) {
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

  const handleDelete = async () => {
    if (!formData.id) {
      setMessage({ type: 'error', text: 'Cannot delete an unsaved record.' });
      return;
    }
    if (!window.confirm('Are you sure you want to delete this incident record?')) return;

    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem('access_token') ||
        localStorage.getItem('fact_checker_token') ||
        sessionStorage.getItem('truthguard_admin_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_BASE_URL}/incidents/${formData.id}/`, {
        method: 'DELETE',
        headers,
      });
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
    <div className="bg-card-theme border border-theme rounded-xl p-6 text-main-theme max-w-4xl mx-auto shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b border-theme pb-4">
        <h2 className="text-xl font-bold text-[#1CB5BE]">
          {formData.id ? `Edit Incident #${formData.id}` : 'Create New Incident Report'}
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-muted-theme hover:text-main-theme cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 text-sm font-semibold ${message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300'
            }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-main-theme mb-1">Claim *</label>
            <textarea
              name="claim"
              rows={2}
              value={formData.claim}
              onChange={handleChange}
              required
              placeholder="What is the false claim or rumor?"
              className="w-full bg-input-theme border border-theme rounded-lg px-3 py-2 text-sm text-main-theme focus:outline-none focus:border-[#1CB5BE] placeholder:text-muted-theme"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-main-theme mb-1">Who Said It</label>
            <input
              type="text"
              name="who_said_it"
              value={formData.who_said_it}
              onChange={handleChange}
              placeholder="Source, handle, or handle name"
              className="w-full bg-input-theme border border-theme rounded-lg px-3 py-2 text-sm text-main-theme focus:outline-none focus:border-[#1CB5BE] placeholder:text-muted-theme"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-main-theme mb-1">Where and When</label>
            <input
              type="text"
              name="where_and_when"
              value={formData.where_and_when}
              onChange={handleChange}
              placeholder="e.g. Polling Unit 004, Osogbo / Yesterday"
              className="w-full bg-input-theme border border-theme rounded-lg px-3 py-2 text-sm text-main-theme focus:outline-none focus:border-[#1CB5BE] placeholder:text-muted-theme"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-main-theme mb-1">Evidence Links</label>
            <input
              type="text"
              name="evidence_links"
              value={formData.evidence_links}
              onChange={handleChange}
              placeholder="Comma-separated URLs"
              className="w-full bg-input-theme border border-theme rounded-lg px-3 py-2 text-sm text-main-theme focus:outline-none focus:border-[#1CB5BE] placeholder:text-muted-theme"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-main-theme mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-input-theme border border-theme rounded-lg px-3 py-2 text-sm text-main-theme focus:outline-none focus:border-[#1CB5BE]"
            >
              <option value="DISINFORMATION">Disinformation</option>
              <option value="VOTER_SUPPRESSION">Voter Suppression</option>
              <option value="HATE_SPEECH">Hate Speech</option>
              <option value="ELECTORAL_VIOLENCE">Electoral Violence</option>
              <option value="GENERAL_RUMOR">General Rumor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main-theme mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-input-theme border border-theme rounded-lg px-3 py-2 text-sm text-main-theme focus:outline-none focus:border-[#1CB5BE]"
            >
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="FALSE">False</option>
              <option value="MISLEADING">Misleading</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main-theme mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Osogbo, Osun State"
              className="w-full bg-input-theme border border-theme rounded-lg px-3 py-2 text-sm text-main-theme focus:outline-none focus:border-[#1CB5BE] placeholder:text-muted-theme"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-main-theme mb-1">Evidence File / Media</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full bg-input-theme border border-theme rounded-lg px-3 py-1.5 text-xs text-muted-theme file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#1CB5BE] file:text-[#061528] file:font-bold hover:file:bg-[#1CB5BE]/80 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-main-theme">
            <input
              type="checkbox"
              name="is_anonymous"
              checked={formData.is_anonymous}
              onChange={handleChange}
              className="rounded bg-input-theme border-theme text-[#1CB5BE] focus:ring-0"
            />
            Is Anonymous
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-main-theme">
            <input
              type="checkbox"
              name="is_tfgbv"
              checked={formData.is_tfgbv}
              onChange={handleChange}
              className="rounded bg-input-theme border-theme text-[#1CB5BE] focus:ring-0"
            />
            Is TFGBV (Technology-Facilitated Gender-Based Violence)
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-theme">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting || !formData.id}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600/20 text-rose-500 dark:text-rose-400 border border-rose-500/40 rounded-lg hover:bg-rose-600/30 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-2 bg-subcard-theme hover:bg-card-theme border border-theme text-main-theme rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Save and continue editing
            </button>

            <button
              type="button"
              onClick={handleSaveAndAddAnother}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-2 bg-subcard-theme hover:bg-card-theme border border-theme text-main-theme rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Save and add another
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#1CB5BE] hover:bg-[#189ea6] text-[#061528] font-bold rounded-lg text-xs transition disabled:opacity-50 cursor-pointer shadow-md"
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