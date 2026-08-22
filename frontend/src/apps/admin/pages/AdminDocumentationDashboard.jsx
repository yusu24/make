import React, { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function AdminDocumentationDashboard() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Editor State
  const [showEditor, setShowEditor] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [formData, setFormData] = useState({
    title: '', short_description: '', content: '', category_id: '', module: 'umum', status: 'draft'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [artRes, catRes] = await Promise.all([
        api.get('/admin/documentation/articles'),
        api.get('/admin/documentation/categories')
      ])
      setArticles(artRes.data || [])
      setCategories(catRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (article) => {
    setEditingArticle(article)
    setFormData({
      title: article.title,
      short_description: article.short_description || '',
      content: article.content || '',
      category_id: article.category_id || '',
      module: article.module || 'umum',
      status: article.status || 'draft'
    })
    setShowEditor(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingArticle) {
        await api.put(`/admin/documentation/articles/${editingArticle.id}`, formData)
      } else {
        await api.post('/admin/documentation/articles', formData)
      }
      setShowEditor(false)
      fetchData()
    } catch (err) {
      alert('Gagal menyimpan artikel')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus artikel ini?')) return
    try {
      await api.delete(`/admin/documentation/articles/${id}`)
      fetchData()
    } catch (err) {
      alert('Gagal menghapus')
    }
  }

  if (showEditor) {
    return (
      <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="page-title">{editingArticle ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h2>
          <button className="btn btn-secondary" onClick={() => setShowEditor(false)}>Kembali</button>
        </div>
        
        <div className="card card-pad">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div className="form-group">
              <label className="form-label">Judul Artikel</label>
              <input required type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            
            <div className="grid-2" style={{ gap: 15 }}>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-input" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Modul</label>
                <select className="form-input" value={formData.module} onChange={e => setFormData({...formData, module: e.target.value})}>
                  <option value="umum">Umum</option>
                  <option value="retail">Retail</option>
                  <option value="jasa">Jasa</option>
                  <option value="kuliner">Kuliner</option>
                  <option value="budidaya">Budidaya</option>
                  <option value="seller">Seller Hub</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deskripsi Singkat</label>
              <textarea className="form-input" rows="2" value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})}></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Konten HTML / Markdown</label>
              <textarea required className="form-input" rows="15" style={{ fontFamily: 'monospace' }} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Simpan Artikel</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <div className="page-header">
        <h2 className="page-title">Manajemen Dokumentasi</h2>
      </div>

      <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => {
          setEditingArticle(null)
          setFormData({title: '', short_description: '', content: '', category_id: '', module: 'umum', status: 'draft'})
          setShowEditor(true)
        }}>
          <Plus size={16} /> Tulis Artikel
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {loading ? <p>Loading...</p> : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Modul</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {articles.map(art => (
                  <tr key={art.id}>
                    <td><strong>{art.title}</strong></td>
                    <td>{art.category?.name || '-'}</td>
                    <td><span style={{ textTransform: 'capitalize' }}>{art.module}</span></td>
                    <td>
                      <span className={`badge ${art.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                        {art.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleEdit(art)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', color: '#ef4444' }} onClick={() => handleDelete(art.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted">Belum ada artikel.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
