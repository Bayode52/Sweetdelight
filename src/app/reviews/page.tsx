'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const sb = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Review = {
  id: string
  name: string
  rating: number
  title: string
  body: string
  product: string
  created_at: string
  verified: boolean
}

const PRODUCTS = [
  'Celebration Cake', 'Small Chops Platter', 'Puff Puff',
  'Chin Chin', 'Meat Pie', 'Party Box', 'Fish Roll', 'Other'
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hover, setHover] = useState(0)

  const [form, setForm] = useState({
    name: '', email: '', rating: 5,
    title: '', body: '', product: 'Celebration Cake'
  })

  useEffect(() => {
    loadReviews()
    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || ''
        const email = session.user.email || ''
        setForm(f => ({ ...f, name, email }))
      }
    })
  }, [])

  async function loadReviews() {
    setLoading(true)
    const { data } = await sb
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    setLoading(false)
  }

  async function submitReview() {
    if (!form.name.trim()) { alert('Please enter your name'); return }
    if (!form.body.trim() || form.body.length < 10) {
      alert('Please write at least 10 characters'); return
    }

    setSubmitting(true)
    const { error } = await sb.from('reviews').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      rating: form.rating,
      title: form.title.trim(),
      body: form.body.trim(),
      product: form.product,
      user_id: user?.id || null,
      is_approved: false, // admin must approve
      created_at: new Date().toISOString(),
    })

    setSubmitting(false)
    if (error) {
      alert('Sorry, something went wrong. Please try again.')
      return
    }
    setSubmitted(true)
    setShowForm(false)
    setForm(f => ({ ...f, title: '', body: '', rating: 5 }))
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0'

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', paddingTop: '72px' }}>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px) 40px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: '#C8401A', marginBottom: '12px' }}>
          Customer Love
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          fontWeight: 700, color: '#1A0800', lineHeight: 1.1, marginBottom: '16px'
        }}>
          What Our Customers{' '}
          <span style={{ color: '#C8401A', fontStyle: 'italic' }}>Say</span>
        </h1>

        {/* Summary stats */}
        {reviews.length > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px',
            background: 'white', borderRadius: '50px',
            padding: '12px 24px', boxShadow: '0 2px 16px rgba(26,8,0,0.08)',
            marginBottom: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Playfair Display', serif",
                fontSize: '1.8rem', fontWeight: 700, color: '#1A0800', lineHeight: 1 }}>
                {avgRating}
              </p>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ fontSize: '12px',
                    color: s <= Math.round(Number(avgRating)) ? '#D4A843' : '#e5e7eb' }}>★</span>
                ))}
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', background: '#e5e0d8' }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '14px', color: '#1A0800' }}>
                {reviews.length} reviews
              </p>
              <p style={{ fontSize: '11px', color: '#7A6555' }}>Verified customers</p>
            </div>
          </div>
        )}

        {/* Write review button */}
        {!submitted ? (
          <div>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: '#C8401A', color: 'white',
                padding: '14px 32px', borderRadius: '50px',
                fontWeight: 700, fontSize: '14px', border: 'none',
                cursor: 'pointer', boxShadow: '0 6px 20px rgba(200,64,26,0.3)',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}>
              ✍️ Write a Review
            </button>
          </div>
        ) : (
          <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0',
            borderRadius: '16px', padding: '20px 32px', display: 'inline-block' }}>
            <p style={{ fontSize: '1.2rem' }}>🎉</p>
            <p style={{ fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
              Thank you for your review!
            </p>
            <p style={{ fontSize: '13px', color: '#16a34a' }}>
              It will appear here once approved. We appreciate your feedback!
            </p>
          </div>
        )}
      </div>

      {/* REVIEW FORM MODAL */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-end',
            padding: 0,
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{
              background: 'white', width: '100%',
              borderRadius: '24px 24px 0 0',
              maxHeight: '92vh', overflowY: 'auto',
              padding: 'clamp(20px, 4vw, 32px)',
              animation: 'slideUp 0.3s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif",
                fontSize: '1.5rem', fontWeight: 700, color: '#1A0800' }}>
                Write a Review
              </h2>
              <button onClick={() => setShowForm(false)}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%',
                  width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Star rating */}
              <div>
                <label style={lblStyle}>Your Rating *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button"
                      onMouseEnter={() => setHover(s)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setForm(f => ({ ...f, rating: s }))}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 'clamp(28px, 8vw, 36px)',
                        color: s <= (hover || form.rating) ? '#D4A843' : '#d1d5db',
                        transition: 'all 0.15s',
                        transform: s <= (hover || form.rating) ? 'scale(1.15)' : 'scale(1)',
                        padding: '4px',
                      }}>
                      ★
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#C8401A', fontWeight: 600, marginTop: '4px' }}>
                  {['','Poor','Fair','Good','Great','Excellent! 🎉'][form.rating]}
                </p>
              </div>

              {/* Name + Email */}
              {!user && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={lblStyle}>Your Name *</label>
                    <input style={inpStyle} placeholder="e.g. Sarah O."
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={lblStyle}>Email (not shown)</label>
                    <input style={inpStyle} type="email" placeholder="your@email.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
              )}
              {user && (
                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px 16px' }}>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    Reviewing as <strong style={{ color: '#1A0800' }}>{form.name}</strong>
                  </p>
                </div>
              )}

              {/* Product */}
              <div>
                <label style={lblStyle}>Which product? *</label>
                <select style={inpStyle} value={form.product}
                  onChange={e => setForm(f => ({ ...f, product: e.target.value }))}>
                  {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              {/* Title */}
              <div>
                <label style={lblStyle}>Review Title</label>
                <input style={inpStyle} placeholder="e.g. Absolutely delicious!"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              {/* Body */}
              <div>
                <label style={lblStyle}>Your Review *</label>
                <textarea style={{ ...inpStyle, resize: 'vertical', lineHeight: 1.6 }}
                  rows={4} placeholder="Tell others about your experience..."
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', textAlign: 'right' }}>
                  {form.body.length} chars (min 10)
                </p>
              </div>

              <button onClick={submitReview} disabled={submitting}
                style={{
                  background: '#C8401A', color: 'white', border: 'none',
                  padding: '16px', borderRadius: '16px', fontWeight: 700,
                  fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1, transition: 'all 0.2s',
                }}>
                {submitting ? '⏳ Submitting...' : '🌟 Submit Review'}
              </button>
              <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
                Reviews are approved within 24 hours
              </p>
            </div>
          </div>
        </div>
      )}

      {/* REVIEWS GRID */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) 80px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: '180px', background: '#f3f4f6', borderRadius: '20px',
                animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px',
            background: 'white', borderRadius: '24px', border: '1px solid #f0ebe3' }}>
            <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🌟</p>
            <p style={{ fontWeight: 700, color: '#1A0800', fontSize: '1.1rem', marginBottom: '8px' }}>
              Be the first to review!
            </p>
            <p style={{ color: '#7A6555', fontSize: '14px', marginBottom: '20px' }}>
              Share your Sweet Delites experience with others
            </p>
            <button onClick={() => setShowForm(true)}
              style={{ background: '#C8401A', color: 'white', border: 'none',
                padding: '12px 28px', borderRadius: '50px', fontWeight: 700,
                fontSize: '14px', cursor: 'pointer' }}>
              Write First Review ✍️
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '16px',
          }}>
            {reviews.map(review => (
              <div key={review.id} style={{
                background: 'white', borderRadius: '20px',
                padding: 'clamp(16px, 3vw, 24px)',
                boxShadow: '0 2px 12px rgba(26,8,0,0.05)',
                border: '1px solid rgba(184,134,11,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{
                      fontSize: '14px',
                      color: s <= review.rating ? '#D4A843' : '#e5e7eb'
                    }}>★</span>
                  ))}
                </div>
                {/* Title */}
                {review.title && (
                  <p style={{ fontFamily: "'Playfair Display', serif",
                    fontWeight: 700, color: '#1A0800', fontSize: '1rem',
                    marginBottom: '8px' }}>
                    "{review.title}"
                  </p>
                )}
                {/* Body */}
                <p style={{ fontSize: '13px', color: '#4b5563',
                  lineHeight: 1.65, marginBottom: '16px' }}>
                  {review.body}
                </p>
                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #C8401A, #D4A843)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '14px',
                      flexShrink: 0,
                    }}>
                      {review.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '13px', color: '#1A0800' }}>
                        {review.name}
                      </p>
                      <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {new Date(review.created_at).toLocaleDateString('en-GB', {
                          month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '3px 10px',
                      borderRadius: '50px', background: '#fff5f2', color: '#C8401A'
                    }}>
                      {review.product}
                    </span>
                    {review.verified && (
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '3px 10px',
                        borderRadius: '50px', background: '#f0fdf4', color: '#16a34a'
                      }}>
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

const lblStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  color: '#6b7280', marginBottom: '6px',
}
const inpStyle: React.CSSProperties = {
  width: '100%', border: '2px solid #e5e7eb',
  borderRadius: '12px', padding: '12px 14px',
  fontSize: '14px', outline: 'none',
  fontFamily: 'inherit', background: 'white',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
}
