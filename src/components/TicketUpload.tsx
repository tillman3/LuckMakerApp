'use client';

import { useState, useRef } from 'react';

interface TicketUploadProps {
  poolId?: string;
  gameId?: string;
  drawDate?: string;
  onUploaded: (data: {
    photoUrl: string;
    extractedData: {
      game?: string;
      numbers?: string;
      bonusNumber?: string;
      drawDate?: string;
      ticketCost?: number;
    };
    confidence: string;
  }) => void;
}

export function TicketUpload({ poolId, gameId, drawDate, onUploaded }: TicketUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [verification, setVerification] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Photo must be under 5MB');
      setStatus('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setStatus('idle');
      setMessage('');
      setVerification(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!preview) return;

    setUploading(true);
    setStatus('verifying');
    setMessage('🤖 AI is verifying your ticket...');

    try {
      const res = await fetch('/api/upload-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: preview, poolId, gameId, drawDate }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Upload failed');
        setVerification(data.verification);
        return;
      }

      setStatus('success');
      setVerification(data.verification);
      setMessage(data.verification?.summary || 'Ticket verified!');
      
      onUploaded({
        photoUrl: data.photoUrl,
        extractedData: data.verification?.extractedData || {},
        confidence: data.verification?.confidence || 'low',
      });
    } catch {
      setStatus('error');
      setMessage('Upload failed — check your connection');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      {!preview ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full py-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-gold/30 transition-all bg-white/[0.01] cursor-pointer group"
        >
          <div className="text-center">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📸</div>
            <p className="text-sm text-gray-400 font-bold">Take a photo of your ticket</p>
            <p className="text-xs text-gray-600 mt-1">or tap to upload from gallery</p>
          </div>
        </button>
      ) : (
        <div className="relative">
          {/* Preview */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-dark-900/50">
            <img 
              src={preview} 
              alt="Ticket preview" 
              className="w-full max-h-64 object-contain bg-black/20"
            />
          </div>
          
          {/* Status overlay */}
          {status === 'verifying' && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80 rounded-2xl">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mb-3" />
                <p className="text-sm text-gold font-bold animate-pulse">AI Verifying...</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-neon/20 text-neon text-xs font-bold border border-neon/30">
              ✓ Verified
            </div>
          )}

          {status === 'error' && (
            <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-danger/20 text-danger text-xs font-bold border border-danger/30">
              ✕ Failed
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Message */}
      {message && (
        <div className={`text-sm p-3 rounded-xl ${
          status === 'error' ? 'bg-danger/10 text-danger border border-danger/20' :
          status === 'success' ? 'bg-neon/10 text-neon border border-neon/20' :
          'bg-gold/10 text-gold border border-gold/20'
        }`}>
          {message}
        </div>
      )}

      {/* Extracted data preview */}
      {verification?.extractedData && status === 'success' && (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
          <div className="text-gray-500 font-bold uppercase tracking-wider mb-2">AI Extracted Data</div>
          {verification.extractedData.game && (
            <div className="flex justify-between">
              <span className="text-gray-500">Game:</span>
              <span className="text-white font-bold">{verification.extractedData.game}</span>
            </div>
          )}
          {verification.extractedData.numbers && (
            <div className="flex justify-between">
              <span className="text-gray-500">Numbers:</span>
              <span className="text-neon font-mono">{verification.extractedData.numbers}</span>
            </div>
          )}
          {verification.extractedData.bonusNumber && (
            <div className="flex justify-between">
              <span className="text-gray-500">Bonus:</span>
              <span className="text-gold font-mono">{verification.extractedData.bonusNumber}</span>
            </div>
          )}
          {verification.extractedData.drawDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Draw Date:</span>
              <span className="text-white">{verification.extractedData.drawDate}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-white/5 mt-1">
            <span className="text-gray-500">Confidence:</span>
            <span className={`font-bold ${
              verification.confidence === 'high' ? 'text-neon' : 
              verification.confidence === 'medium' ? 'text-gold' : 'text-gray-400'
            }`}>
              {verification.confidence?.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Verification issues */}
      {verification?.issues?.length > 0 && status === 'error' && (
        <ul className="text-xs text-gray-500 space-y-1 px-1">
          {verification.issues.map((issue: string, i: number) => (
            <li key={i}>• {issue}</li>
          ))}
        </ul>
      )}

      {/* Action buttons */}
      {preview && (
        <div className="flex gap-2">
          {status !== 'success' && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-gold/20 to-yellow-600/20 text-gold border border-gold/30 hover:border-gold/50 transition-all disabled:opacity-50"
            >
              {uploading ? '🔍 Verifying...' : '🤖 Verify & Upload'}
            </button>
          )}
          <button
            onClick={() => {
              setPreview(null);
              setStatus('idle');
              setMessage('');
              setVerification(null);
              if (fileRef.current) fileRef.current.value = '';
            }}
            className="px-4 py-3 rounded-xl text-gray-500 border border-white/10 hover:bg-white/5 transition-all text-sm"
          >
            {status === 'success' ? 'Change' : 'Clear'}
          </button>
        </div>
      )}
    </div>
  );
}
