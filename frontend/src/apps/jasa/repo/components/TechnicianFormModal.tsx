import React, { useState, useEffect } from 'react';
import { X, Save, KeyRound, Shield, CheckCircle2, AlertCircle } from '@/constants/icons';
import { Technician, JasaRole } from '../types';
import { jasaApi } from '../services/jasaApi';

interface TechnicianFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  technician?: Technician | null;
  settings?: any;
  onSuccess: () => void;
  addToast: (type: 'success'|'error', title: string, message: string) => void;
}

export const TechnicianFormModal: React.FC<TechnicianFormModalProps> = ({ 
  isOpen, 
  onClose, 
  technician,
  settings,
  onSuccess,
  addToast 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Technician>>({
    name: '',
    phone: '',
    email: '',
    specialty: 'Teknisi AC & Listrik',
    skills: []
  });

  // Integrated Login Account State
  const [createLoginAccount, setCreateLoginAccount] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<number | string>('');
  const [roles, setRoles] = useState<JasaRole[]>([]);

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      jasaApi.getRoles().then(r => {
        setRoles(r);
        if (r.length > 0 && !selectedRoleId) {
          const defaultTechRole = r.find(role => 
            role.name.toLowerCase().includes('teknisi') || role.name.toLowerCase().includes('operator')
          );
          setSelectedRoleId(defaultTechRole ? defaultTechRole.id : r[0].id);
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (technician) {
      setFormData(technician);
      setCreateLoginAccount(Boolean(technician.user_id));
      setLoginPassword('');
      if (technician.user?.jasaRole?.id) {
        setSelectedRoleId(technician.user.jasaRole.id);
      }
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        specialty: '',
        skills: []
      });
      setCreateLoginAccount(false);
      setLoginPassword('');
    }
  }, [technician, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createLoginAccount && !formData.email) {
      addToast('error', 'Validasi Gagal', 'Email wajib diisi jika ingin membuatkan akun login.');
      return;
    }

    if (createLoginAccount && !technician?.user_id && (!loginPassword || loginPassword.length < 6)) {
      addToast('error', 'Validasi Gagal', 'Password wajib minimal 6 karakter untuk akun login.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload: any = {
        ...formData,
        create_user_account: createLoginAccount,
        password: loginPassword || undefined,
        jasa_role_id: selectedRoleId ? Number(selectedRoleId) : undefined
      };

      if (technician?.id) {
        await jasaApi.updateTechnician(technician.id, payload);
        addToast('success', 'Berhasil', 'Data teknisi berhasil diperbarui.');
      } else {
        await jasaApi.storeTechnician(payload);
        addToast('success', 'Berhasil', createLoginAccount ? 'Teknisi & Akun Login berhasil didaftarkan.' : 'Teknisi baru berhasil ditambahkan.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
      addToast('error', 'Gagal', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const specialtySuggestions = settings?.technician_specialties?.length > 0
    ? settings.technician_specialties
    : [
        'Teknisi Umum',
        'Teknisi AC & Listrik',
        'Teknisi Mesin & Otomotif',
        'Ahli Sistem Keamanan',
        'Spesialis IT & Jaringan'
      ];

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">
            {technician ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="technicianForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Nama Teknisi"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">No. HP / WhatsApp</label>
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="0812..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email (Opsional)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Spesialisasi Utama</label>
              <select 
                required
                value={formData.specialty}
                onChange={e => setFormData({...formData, specialty: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Pilih Spesialisasi...</option>
                {specialtySuggestions.map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Skill / Keahlian Tambahan (Tekan Enter)</label>
              <input 
                type="text" 
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Instalasi Kabel, Las Listrik..."
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills?.map((skill, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg border border-slate-200">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(idx)} className="text-slate-400 hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* ── INTEGRATED LOGIN ACCOUNT SECTION ── */}
            <div className="pt-3 border-t border-slate-100">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={createLoginAccount}
                    onChange={(e) => setCreateLoginAccount(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <KeyRound size={14} className="text-blue-600" />
                      {technician?.user_id ? 'Akun Login Teknisi Aktif' : 'Buatkan Akun Login untuk Teknisi Ini'}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Teknisi dapat login ke aplikasi untuk melihat SPK yang ditugaskan kepadanya dan mengupdate status pengerjaan.
                    </p>
                  </div>
                </label>

                {createLoginAccount && (
                  <div className="pt-2.5 border-t border-slate-200/80 space-y-3 pl-7">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Email Login <span className="text-rose-500">*</span></label>
                      <input
                        required={createLoginAccount}
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email.teknisi@bengkel.com"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        {technician?.user_id ? 'Ganti Password Login (Opsional)' : 'Password Login'}{' '}
                        {!technician?.user_id && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        required={createLoginAccount && !technician?.user_id}
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder={technician?.user_id ? 'Biarkan kosong jika tidak diubah' : 'Minimal 6 karakter'}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Hak Akses / Role Aplikasi</label>
                      <select
                        value={selectedRoleId}
                        onChange={(e) => setSelectedRoleId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Role menentukan menu dan batasan aksi yang dapat dibuka teknisi saat login.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit"
            form="technicianForm"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>

      </div>
    </div>
  );
};
