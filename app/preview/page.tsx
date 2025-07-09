'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

import dynamic from 'next/dynamic';
const Lightbox = dynamic(() => import('yet-another-react-lightbox'), { ssr: false });
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

import { NextRequest } from 'next/server';
import { google } from 'googleapis';
import { getToken } from 'next-auth/jwt';

interface Photo {
  id: number;
  name: string;
  image_url: string;
  labels: string[];
}

export default function DrivePreviewPage() {
  const [images, setImages] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [query, setQuery] = useState('');
  const Fuse = require('fuse.js');
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const load = () => {
    setLoading(true);
    fetch('/api/photos')
      .then((r) => r.json())
      .then((data) => {
        setImages(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  let displayed = images;
  if (query && images.length) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const fuse = new Fuse(images, {
      keys: ['name', 'labels'],
      threshold: 0.4,
    });
    displayed = fuse.search(query).map((r: any) => r.item);
  }

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    setUploadTotal(files.length);
    setUploadProgress(0);

    let count = 0;
    for (const file of Array.from(files)) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const form = new FormData();
      form.append('file', file);
      form.append('base64', base64);
      await fetch('/api/photos/upload', {
        method: 'POST',
        body: form,
      });

      count += 1;
      setUploadProgress(count);
    }
    setUploading(false);
    // 清空舊資料並重新載入第一頁
    setImages([]);
    // no pagination now
    load();
  };

  const slides = displayed.map((img) => ({
    src: `/_next/image?url=${encodeURIComponent(img.image_url)}&w=2048&q=90`,
    title: img.name,
  }));

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold ml-8 sm:ml-0">照片瀏覽 (DB)</h1>
        <input
          type="text"
          placeholder="搜尋名稱或標籤..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-2 py-1 rounded w-full sm:w-60"
        />
        <label className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 disabled:opacity-60">
          {uploading ? `上傳中 (${uploadProgress}/${uploadTotal})` : '上傳圖片'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length) uploadFiles(files);
            }}
          />
        </label>

        {uploading && (
          <div className="w-40 h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(uploadProgress / uploadTotal) * 100}%` }}
            />
          </div>
        )}
      </div>
      {displayed.length === 0 && !loading ? (
        <p>資料夾內沒有圖片。</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
          {displayed.map((img, i) => (
            <div key={img.id} className="border rounded shadow-sm p-2 flex flex-col gap-2">
              <Image
                src={img.image_url}
                alt={img.name}
                width={400}
                height={300}
                className="w-full h-40 sm:h-48 object-cover rounded cursor-pointer"
                onClick={() => {
                  setCurrentIndex(i);
                  setOpen(true);
                }}
              />
              <p className="text-sm truncate" title={img.name}>{img.name}</p>
              <div className="flex flex-wrap gap-1 text-[10px] sm:text-xs">
                {img.labels?.map((l, idx) => (
                  <span key={idx} className="bg-gray-200 text-gray-800 font-semibold px-1 rounded">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {loading && <p className="mt-4 text-center">載入中…</p>}
      {/* no infinite scroll with DB list */}

      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={currentIndex}
          slides={images.map((img) => ({
            src: `/_next/image?url=${encodeURIComponent(img.image_url)}&w=2048&q=90`,
            title: img.name,
          }))}
          plugins={[Fullscreen, Zoom] as any}
        />
      )}
    </main>
  );
} 