'use client';
import { useState } from 'react';

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) return alert('Vui lòng chọn file');
    try {
      setStatus('1. Đang xin link R2...');
      const res1 = await fetch('/api/admin/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type })
      });
      const data1 = await res1.json();
      if (!res1.ok) throw new Error(data1.error || 'Lỗi xin link');

      setStatus('2. Đang upload file trực tiếp lên R2...');
      const res2 = await fetch(data1.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      if (!res2.ok) throw new Error('Lỗi upload R2');

      setStatus('3. Đang lưu thông tin vào DB...');
      const res3 = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `File Test: ${file.name}`,
          slug: `test-${Date.now()}`,
          thumbnail_url: data1.fileUrl, // Tạm dùng link file làm thumbnail
          file_url: data1.fileUrl,
          summary: 'Upload test từ giao diện R2'
        })
      });
      if (!res3.ok) throw new Error('Lỗi lưu DB');

      setStatus(`✅ Hoàn tất! File của bạn ở đây: ${data1.fileUrl}`);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setStatus(`❌ Lỗi: ${errorObj.message || 'Lỗi không xác định'}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Test Upload R2 + Supabase</h1>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4 block" />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload ngay
      </button>
      <p className="mt-4 text-gray-700 whitespace-pre-wrap">{status}</p>
    </div>
  );
}
