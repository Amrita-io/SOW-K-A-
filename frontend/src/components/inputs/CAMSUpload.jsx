import React, { useRef, useState } from 'react';
import { UploadIcon } from '../shared/icons/index';

export default function CAMSUpload({ onUpload, isLoading = false }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFile = (file) => {
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      onUpload(file);
    }
  };

  return (
    <div
      className={`card border-2 border-dashed p-8 text-center cursor-pointer transition-all
        ${dragOver ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'}`}
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <UploadIcon className="w-10 h-10 text-muted mx-auto mb-3" />
      {fileName ? (
        <p className="text-sm font-medium text-navy">{fileName}</p>
      ) : (
        <>
          <p className="text-sm font-medium text-text">Upload CAMS/KFintech statement (PDF)</p>
          <p className="text-xs text-muted mt-1">Drag and drop or click to select</p>
        </>
      )}
      {isLoading && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-muted">Processing...</span>
        </div>
      )}
    </div>
  );
}
