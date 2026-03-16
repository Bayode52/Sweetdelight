'use client'
import { useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Props {
  label: string
  hint?: string
  currentUrl?: string
  aspect?: '1:1' | '16:9' | '4:3' | '3:2' | 'free'
  onSave: (url: string) => Promise<void>
}

export function ImageUploader({ 
  label, hint, currentUrl, aspect = 'free', onSave 
}: Props) {
  const [stage, setStage]       = useState<'idle'|'uploading'|'saving'|'done'>('idle')
  const [preview, setPreview]   = useState(currentUrl || '')
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError]       = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const ALLOWED = ['image/jpeg','image/png','image/webp','image/gif']
  const MAX_MB  = 15

  async function handleFile(file: File) {
    setError('')

    // Validate
    if (!ALLOWED.includes(file.type)) {
      setError('Only JPG, PNG, WebP or GIF allowed')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_MB}MB`)
      return
    }

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setStage('uploading')
    setProgress(10)

    try {
      // Upload to Supabase storage
      const ext  = file.name.split('.').pop() || 'jpg'
      const path = `site/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      setProgress(40)

      // Try site-images bucket first, fallback to products
      let publicUrl = ''

      const { data, error: upErr } = await sb.storage
        .from('site-images')
        .upload(path, file, { 
          upsert: true,
          contentType: file.type 
        })

      if (upErr) {
        // Try products bucket as fallback
        const { data: d2, error: e2 } = await sb.storage
          .from('products')
          .upload(path, file, { upsert: true, contentType: file.type })

        if (e2 || !d2) throw new Error('Upload failed — check storage bucket exists in Supabase')
        
        const { data: { publicUrl: url } } = sb.storage
          .from('products').getPublicUrl(d2.path)
        publicUrl = url
      } else if (data) {
        const { data: { publicUrl: url } } = sb.storage
          .from('site-images').getPublicUrl(data.path)
        publicUrl = url
      }

      setProgress(70)
      setStage('saving')

      // Call parent save handler (saves to site_content)
      await onSave(publicUrl)

      setProgress(100)
      setPreview(publicUrl)
      setStage('done')
      setTimeout(() => setStage('idle'), 3000)

    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setStage('idle')
      setProgress(0)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const aspectLabel = {
    '1:1':  'Square (1:1)',
    '16:9': 'Wide banner (16:9)',
    '4:3':  'Landscape (4:3)',
    '3:2':  'Standard photo (3:2)',
    'free': 'Any size',
  }[aspect]

  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid #faf7f2' }}>
      
      {/* Label */}
      <div style={{ marginBottom: '10px' }}>
        <p style={{
          fontSize: '11px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: '#7A6555',
        }}>
          {label}
        </p>
        {hint && (
          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
            {hint} · {aspectLabel}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Current image preview */}
        <div style={{
          width: '100px', flexShrink: 0,
          aspectRatio: aspect === '16:9' ? '16/9' : aspect === '1:1' ? '1/1' : '4/3',
          borderRadius: '12px', overflow: 'hidden',
          background: '#f3f4f6', border: '2px solid #e5e7eb',
          position: 'relative',
        }}>
          {preview ? (
            <>
              <img src={preview} alt={label}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {stage === 'done' && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(22,163,74,0.85)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '24px',
                }}>
                  ✅
                </div>
              )}
            </>
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '4px',
            }}>
              <span style={{ fontSize: '20px', opacity: 0.3 }}>🖼️</span>
              <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 600 }}>
                No image
              </span>
            </div>
          )}
        </div>

        {/* Upload zone */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${dragOver ? '#C8401A' : stage !== 'idle' ? '#D4A843' : '#d1d5db'}`,
              borderRadius: '14px',
              padding: '16px',
              cursor: stage === 'idle' || stage === 'done' ? 'pointer' : 'not-allowed',
              background: dragOver ? '#fff5f2' : stage !== 'idle' && stage !== 'done' ? '#fffbeb' : 'white',
              transition: 'all 0.2s',
              textAlign: 'center',
            }}
          >
            {stage === 'idle' || stage === 'done' ? (
              <>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>
                  {stage === 'done' ? '✅' : '📸'}
                </div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '2px' }}>
                  {stage === 'done' ? 'Image saved!' : preview ? 'Replace image' : 'Upload image'}
                </p>
                <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {stage === 'done' 
                    ? 'Now showing on your website' 
                    : 'Click or drag & drop · JPG, PNG, WebP'}
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {stage === 'saving' ? '💾' : '⏫'}
                </div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  {stage === 'saving' ? 'Saving...' : 'Uploading...'}
                </p>
                {/* Progress bar */}
                <div style={{
                  height: '4px', background: '#e5e7eb',
                  borderRadius: '2px', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', background: '#C8401A',
                    borderRadius: '2px',
                    width: `${progress}%`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  {progress}%
                </p>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <p style={{
              fontSize: '12px', color: '#dc2626', fontWeight: 600,
              marginTop: '6px', padding: '8px 12px',
              background: '#fef2f2', borderRadius: '8px',
            }}>
              ❌ {error}
            </p>
          )}

          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
              e.target.value = '' // reset so same file can be re-uploaded
            }}
          />
        </div>
      </div>
    </div>
  )
}
