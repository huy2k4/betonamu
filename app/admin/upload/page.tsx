'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, CheckCircle, AlertCircle, FileText, Image as ImageIcon, Link2, Type, Loader2 } from 'lucide-react'

export default function AdminUploadPage() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progressStep, setProgressStep] = useState(0) // 0: None, 1: Requesting, 2: Uploading, 3: Saving
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [downloadLink, setDownloadLink] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    const clean = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
    setSlug(clean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !slug || !summary || !file) {
      setStatus({ type: 'error', message: 'Vui lòng điền đầy đủ các thông tin và chọn tệp tin.' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      // 1. Get presigned upload URL
      setProgressStep(1)
      const uploadUrlRes = await fetch('/api/admin/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || 'application/pdf',
        }),
      })

      if (!uploadUrlRes.ok) {
        const errData = await uploadUrlRes.json()
        throw new Error(errData.error || 'Không thể lấy URL tải lên từ R2.')
      }

      const { uploadUrl, fileUrl } = await uploadUrlRes.json()

      // 2. Upload file directly to Cloudflare R2
      setProgressStep(2)
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/pdf',
        },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error('Tải tệp tin lên Cloudflare R2 thất bại.')
      }

      // 3. Save metadata into Supabase Database
      setProgressStep(3)
      const saveRes = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          thumbnail_url: thumbnailUrl || fileUrl,
          file_url: fileUrl,
          summary,
          file_type: file.name.split('.').pop() || 'pdf',
          file_size_bytes: file.size,
          page_count: 1,
        }),
      })

      if (!saveRes.ok) {
        const errData = await saveRes.json()
        throw new Error(errData.error || 'Lưu tài liệu vào Database thất bại.')
      }

      const { document } = await saveRes.json()

      setStatus({
        type: 'success',
        message: 'Tải tài liệu và ghi nhận vào cơ sở dữ liệu thành công!',
      })
      setDownloadLink(`/api/download/${document.id}`)

      // Reset form
      setFile(null)
      setTitle('')
      setSlug('')
      setSummary('')
      setThumbnailUrl('')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.'
      setStatus({ type: 'error', message: msg })
      console.error(error)
    } finally {
      setLoading(false)
      setProgressStep(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Upload Tài Liệu Mới
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Thêm tài liệu vào hệ thống lưu trữ Cloudflare R2 và Supabase một cách an toàn.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Left Column: Metadata */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                    <FileText className="w-5 h-5 text-indigo-500" /> Thông tin chung
                  </h3>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Type className="w-4 h-4 text-gray-400" /> Tiêu đề tài liệu
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Ví dụ: Báo cáo tài chính 2026"
                    className="block w-full rounded-xl border-gray-200 bg-white/50 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-400" /> Đường dẫn (Slug)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="block w-full rounded-xl border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-500 shadow-sm sm:text-sm cursor-not-allowed"
                    readOnly
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Mô tả tóm tắt</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Nhập mô tả ngắn gọn về tài liệu này..."
                    rows={4}
                    className="block w-full rounded-xl border-gray-200 bg-white/50 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all resize-none"
                    required
                  />
                </div>
              </div>

              {/* Right Column: File & Thumbnail */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                    <UploadCloud className="w-5 h-5 text-indigo-500" /> Tệp tin đính kèm
                  </h3>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" /> Ảnh bìa (Thumbnail URL)
                  </label>
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="Để trống sẽ tự dùng link file"
                    className="block w-full rounded-xl border-gray-200 bg-white/50 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all"
                  />
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-sm font-medium text-gray-700">Tải lên tệp gốc</label>
                  <div 
                    className={`mt-2 flex justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition-all ${
                      file ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="text-center">
                      <UploadCloud className={`mx-auto h-12 w-12 ${file ? 'text-indigo-600' : 'text-gray-300'}`} />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                        <span className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none hover:text-indigo-500">
                          {file ? 'Thay đổi tệp tin' : 'Chọn tệp tin'}
                        </span>
                      </div>
                      <p className="text-xs leading-5 text-gray-500 mt-1">
                        {file ? <span className="font-medium text-gray-900">{file.name}</span> : 'PDF, DOCX, ZIP lên đến 50MB'}
                      </p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0])
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Actions & Status */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center">
              
              {/* Status Alert */}
              {status && (
                <div className={`mb-6 w-full rounded-xl p-4 flex gap-3 items-start ${
                  status.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {status.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                  <div>
                    <h3 className="text-sm font-bold">{status.type === 'success' ? 'Thành công' : 'Đã có lỗi xảy ra'}</h3>
                    <p className="mt-1 text-sm">{status.message}</p>
                    {status.type === 'success' && downloadLink && (
                      <p className="mt-2 text-sm">
                        Link tải: <a href={downloadLink} target="_blank" rel="noreferrer" className="underline font-medium hover:text-green-900">{downloadLink}</a>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {progressStep === 1 && 'Đang khởi tạo kết nối...'}
                    {progressStep === 2 && 'Đang tải tệp lên mây...'}
                    {progressStep === 3 && 'Đang lưu trữ dữ liệu...'}
                  </>
                ) : (
                  'Lưu Tài Liệu Mới'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
