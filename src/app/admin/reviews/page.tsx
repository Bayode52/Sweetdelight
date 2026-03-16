'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const sb = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending'|'approved'|'all'>('pending')
  const [toast, setToast] = useState('')

  const t = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  async function load() {
    setLoading(true)
    let q = sb.from('reviews').select('*').order('created_at', { ascending: false })
    if (filter === 'pending') q = q.eq('is_approved', false)
    if (filter === 'approved') q = q.eq('is_approved', true)
    const { data } = await q
    setReviews(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  async function approve(id: string) {
    await sb.from('reviews').update({ is_approved: true }).eq('id', id)
    setReviews(p => p.filter(r => r.id !== id))
    t('✅ Review approved and published!')
  }

  async function reject(id: string) {
    if (!confirm('Delete this review permanently?')) return
    await sb.from('reviews').delete().eq('id', id)
    setReviews(p => p.filter(r => r.id !== id))
    t('🗑️ Review deleted')
  }

  const pending = reviews.filter(r => !r.is_approved).length

  return (
    <div className="p-6 max-w-4xl">
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm shadow-xl">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Customer Reviews
          </h1>
          {pending > 0 && (
            <p className="text-sm text-orange-600 font-bold mt-1">
              ⚠️ {pending} review{pending > 1 ? 's' : ''} waiting for approval
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {(['pending','approved','all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all"
              style={{
                background: filter === f ? '#C8401A' : 'white',
                color: filter === f ? 'white' : '#7A6555',
                border: filter === f ? 'none' : '1.5px solid #e5e0d8',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <p className="text-4xl mb-3">🌟</p>
          <p className="font-bold text-gray-700">No {filter} reviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= r.rating ? '#D4A843' : '#e5e7eb', fontSize: '14px' }}>★</span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-500">{r.product}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  {r.title && <p className="font-bold text-gray-900 mb-1">"{r.title}"</p>}
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">{r.body}</p>
                  <p className="text-xs text-gray-400">
                    by <strong>{r.name}</strong>
                    {r.email && ` · ${r.email}`}
                  </p>
                </div>
                {!r.is_approved && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => approve(r.id)}
                      className="px-4 py-2 rounded-xl bg-green-50 text-green-700 font-bold text-sm hover:bg-green-100">
                      ✅ Approve
                    </button>
                    <button onClick={() => reject(r.id)}
                      className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100">
                      🗑️ Delete
                    </button>
                  </div>
                )}
                {r.is_approved && (
                  <div className="flex gap-2 flex-shrink-0">
                    <span className="px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold">
                      ✓ Live
                    </span>
                    <button onClick={() => reject(r.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
