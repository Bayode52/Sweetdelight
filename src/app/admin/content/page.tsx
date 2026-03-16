'use client'
import { useState, useEffect, useCallback } from 'react'
import { ImageUploader } from '@/components/admin/ImageUploader'

type ContentMap = Record<string, string>

// All editable fields organised by tab
const TABS = [
  {
    id: 'images',
    label: '🖼️ Images',
    sections: [] // handled separately below
  },
  {
    id: 'contact',
    label: '📞 Contact & Footer',
    sections: [
      {
        title: 'Contact Details',
        hint: 'These show in the footer and contact page',
        fields: [
          { page: 'footer', section: 'contact', field: 'phone',     label: 'Phone Number',     placeholder: '+44 7000 000000',          type: 'text' },
          { page: 'footer', section: 'contact', field: 'whatsapp',  label: 'WhatsApp Number',  placeholder: '447000000000 (no + or spaces)', type: 'text' },
          { page: 'footer', section: 'contact', field: 'email',     label: 'Email Address',    placeholder: 'hello@sweetdelites.co.uk', type: 'email' },
          { page: 'footer', section: 'contact', field: 'instagram', label: 'Instagram Handle', placeholder: '@sweetdelites',            type: 'text' },
          { page: 'footer', section: 'social',  field: 'facebook',  label: 'Facebook URL',     placeholder: 'https://facebook.com/...',  type: 'url' },
          { page: 'footer', section: 'social',  field: 'tiktok',   label: 'TikTok URL',       placeholder: 'https://tiktok.com/@...',  type: 'url' },
        ]
      },
      {
        title: 'Footer Brand Text',
        hint: 'Shown at the bottom of every page',
        fields: [
          { page: 'footer', section: 'brand', field: 'tagline',   label: 'Tagline',        placeholder: 'Handcrafting moments of joy...', type: 'textarea' },
          { page: 'footer', section: 'brand', field: 'copyright', label: 'Copyright Text', placeholder: '© 2026 Sweet Delites. All rights reserved.', type: 'text' },
        ]
      },
    ]
  },
  {
    id: 'homepage',
    label: '🏠 Homepage',
    sections: [
      {
        title: 'Hero Section',
        hint: 'The main banner customers see first',
        fields: [
          { page: 'homepage', section: 'hero', field: 'badge',    label: 'Badge Text',    placeholder: '🇬🇧 Proudly Serving the UK', type: 'text' },
          { page: 'homepage', section: 'hero', field: 'headline', label: 'Main Headline', placeholder: 'Baking Joy, One Bite At A Time.', type: 'text' },
          { page: 'homepage', section: 'hero', field: 'subtext',  label: 'Subtext',       placeholder: 'Premium Nigerian pastries...', type: 'textarea' },
          { page: 'homepage', section: 'hero', field: 'btn1',     label: 'Button 1 Text', placeholder: 'Order Fresh Now', type: 'text' },
          { page: 'homepage', section: 'hero', field: 'btn2',     label: 'Button 2 Text', placeholder: 'View Our Menu', type: 'text' },
        ]
      },
      {
        title: 'Announcement Strip',
        hint: 'The scrolling bar across the top',
        fields: [
          { page: 'homepage', section: 'announcement', field: 'text', label: 'Announcement Text', placeholder: '🚚 Free delivery over £50 · Custom cakes 5 days notice', type: 'textarea' },
        ]
      },
    ]
  },
  {
    id: 'about',
    label: '👩🍳 About Us',
    sections: [
      {
        title: 'About Page Content',
        hint: 'Your story and mission',
        fields: [
          { page: 'about', section: 'header', field: 'heading',    label: 'Page Heading',  placeholder: 'Our Story', type: 'text' },
          { page: 'about', section: 'header', field: 'subheading', label: 'Subheading',    placeholder: 'Made with love since...', type: 'text' },
          { page: 'about', section: 'story',  field: 'paragraph1', label: 'Paragraph 1',   placeholder: 'Our journey began...', type: 'textarea' },
          { page: 'about', section: 'story',  field: 'paragraph2', label: 'Paragraph 2',   placeholder: 'We believe that...', type: 'textarea' },
          { page: 'about', section: 'story',  field: 'paragraph3', label: 'Paragraph 3',   placeholder: 'Today we serve...', type: 'textarea' },
        ]
      },
    ]
  },
]

function ImagesTab({ 
  content, 
  onSave 
}: { 
  content: ContentMap
  onSave: (page: string, section: string, field: string, value: string) => Promise<void>
}) {

  const IMAGE_FIELDS = [
    {
      group: '🏠 Homepage Hero',
      hint: 'The main large image customers see first when they visit',
      items: [
        {
          label: 'Hero Image',
          hint: 'Best size: 900×900px or larger. Shows on the right side of the homepage.',
          page: 'homepage', section: 'hero', field: 'image',
          aspect: '3:2' as const,
          currentUrl: content['homepage__hero__image'] || '',
        },
      ]
    },
    {
      group: '📦 Category Cards',
      hint: 'Images shown in the "Explore Categories" section on the homepage',
      items: [
        {
          label: 'Celebration Cakes',
          hint: 'Best: a beautiful cake photo. Landscape works best.',
          page: 'homepage', section: 'category', field: 'cakes_image',
          aspect: '4:3' as const,
          currentUrl: content['homepage__category__cakes_image'] || '',
        },
        {
          label: 'Small Chops',
          hint: 'Best: platter or spread photo. Landscape works best.',
          page: 'homepage', section: 'category', field: 'smallchops_image',
          aspect: '4:3' as const,
          currentUrl: content['homepage__category__smallchops_image'] || '',
        },
        {
          label: 'Chin Chin & Snacks',
          hint: 'Best: chin chin or snack photo. Landscape works best.',
          page: 'homepage', section: 'category', field: 'chinchin_image',
          aspect: '4:3' as const,
          currentUrl: content['homepage__category__chinchin_image'] || '',
        },
        {
          label: 'Party Boxes',
          hint: 'Best: gift box or spread photo. Landscape works best.',
          page: 'homepage', section: 'category', field: 'partybox_image',
          aspect: '4:3' as const,
          currentUrl: content['homepage__category__partybox_image'] || '',
        },
      ]
    },
    {
      group: '📋 Menu Page Banner',
      hint: 'Background image shown at the top of the menu page',
      items: [
        {
          label: 'Menu Page Hero Image',
          hint: 'Best: wide food photo. 1400×400px recommended.',
          page: 'menu', section: 'hero', field: 'image',
          aspect: '16:9' as const,
          currentUrl: content['menu__hero__image'] || '',
        },
      ]
    },
    {
      group: '👩🍳 About Page',
      hint: 'Photo shown on the About Us page',
      items: [
        {
          label: 'Baker / Owner Photo',
          hint: 'A warm personal photo of the baker. Square or portrait works best.',
          page: 'about', section: 'story', field: 'baker_image',
          aspect: '1:1' as const,
          currentUrl: content['about__story__baker_image'] || '',
        },
      ]
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Instructions banner */}
      <div style={{
        background: 'linear-gradient(135deg, #fff5f2, #fffbeb)',
        border: '1.5px solid rgba(200,64,26,0.15)',
        borderRadius: '16px', padding: '16px 20px',
        display: 'flex', gap: '12px', alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '24px', flexShrink: 0 }}>💡</span>
        <div>
          <p style={{ fontWeight: 700, color: '#1A0800', fontSize: '14px', marginBottom: '4px' }}>
            How to update images
          </p>
          <p style={{ fontSize: '13px', color: '#7A6555', lineHeight: 1.6 }}>
            Click any upload box or drag your photo onto it. 
            The image uploads automatically and shows on your 
            website within seconds. Use your own bakery photos 
            for the best results — real food photos always 
            perform better than stock images!
          </p>
        </div>
      </div>

      {IMAGE_FIELDS.map(group => (
        <div key={group.group} style={{
          background: 'white', borderRadius: '20px',
          border: '1px solid #f0ebe3',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(26,8,0,0.04)',
        }}>
          {/* Group header */}
          <div style={{
            padding: '14px 20px',
            background: '#FAF7F2',
            borderBottom: '1px solid #f0ebe3',
          }}>
            <p style={{ fontWeight: 700, color: '#1A0800', fontSize: '14px' }}>
              {group.group}
            </p>
            <p style={{ fontSize: '11px', color: '#7A6555', marginTop: '2px' }}>
              {group.hint}
            </p>
          </div>

          {/* Image uploaders */}
          {group.items.map(item => (
            <ImageUploader
              key={`${item.page}__${item.section}__${item.field}`}
              label={item.label}
              hint={item.hint}
              aspect={item.aspect}
              currentUrl={item.currentUrl}
              onSave={async (url) => {
                await onSave(item.page, item.section, item.field, url)
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Single field key for lookup
function key(page: string, section: string, field: string) {
  return `${page}__${section}__${field}`
}

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('contact')
  const [content, setContent] = useState<ContentMap>({})
  const [editing, setEditing] = useState<ContentMap>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved]   = useState<string | null>(null)
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load all content from database on mount
  const loadContent = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/content')
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      const map: ContentMap = {}
      for (const row of json.data || []) {
        map[key(row.page, row.section, row.field)] = row.value
      }
      setContent(map)
      setEditing(map) // editing starts as a copy of saved values
    } catch (err: any) {
      setError('Failed to load content: ' + err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadContent() }, [loadContent])

  // Save a single field
  async function saveField(
    page: string, section: string, field: string, value: string
  ) {
    const k = key(page, section, field)
    setSaving(k)
    setError(null)

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, section, field, value }),
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || `HTTP ${res.status}`)
      }

      // Update local state so UI reflects saved value immediately
      setContent(prev => ({ ...prev, [k]: value }))
      setSaved(k)
      setTimeout(() => setSaved(null), 2500)

    } catch (err: any) {
      console.error('Save error:', err)
      setError(`Failed to save "${field}": ${err.message}`)
    }

    setSaving(null)
  }

  const currentTab = TABS.find(t => t.id === activeTab)!

  return (
    <div style={{ padding: 'clamp(16px, 3vw, 32px)', maxWidth: '780px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 700, color: '#1A0800', marginBottom: '6px'
        }}>
          Edit Website Content
        </h1>
        <p style={{ fontSize: '13px', color: '#7A6555' }}>
          Changes save instantly and show on the website straight away.
        </p>
      </div>

      {/* Global error */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '2px solid #fecaca',
          borderRadius: '12px', padding: '12px 16px',
          color: '#dc2626', fontSize: '13px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          ❌ {error}
          <button onClick={() => setError(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: '16px', color: '#dc2626' }}>
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px'
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px', borderRadius: '50px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: activeTab === tab.id ? 'none' : '1.5px solid #e5e0d8',
              background: activeTab === tab.id ? '#C8401A' : 'white',
              color: activeTab === tab.id ? 'white' : '#7A6555',
              transition: 'all 0.2s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              height: '80px', background: '#f3f4f6',
              borderRadius: '16px', animation: 'pulse 1.5s infinite'
            }} />
          ))}
        </div>
      ) : activeTab === 'images' ? (
        <ImagesTab content={content} onSave={saveField} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {currentTab.sections.map(section => (
            <div key={section.title} style={{
              background: 'white', borderRadius: '20px',
              border: '1px solid #f0ebe3',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(26,8,0,0.04)',
            }}>
              {/* Section header */}
              <div style={{
                padding: '14px 20px',
                background: '#FAF7F2',
                borderBottom: '1px solid #f0ebe3',
              }}>
                <p style={{ fontWeight: 700, color: '#1A0800', fontSize: '14px' }}>
                  {section.title}
                </p>
                {section.hint && (
                  <p style={{ fontSize: '11px', color: '#7A6555', marginTop: '2px' }}>
                    {section.hint}
                  </p>
                )}
              </div>

              {/* Fields */}
              <div style={{ padding: '4px 0' }}>
                {section.fields.map(f => {
                  const k = key(f.page, f.section, f.field)
                  const currentVal = editing[k] ?? ''
                  const savedVal   = content[k]  ?? ''
                  const isDirty    = currentVal !== savedVal
                  const isSaving   = saving === k
                  const isSaved    = saved  === k

                  return (
                    <div key={k} style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #faf7f2',
                    }}>
                      {/* Label */}
                      <label style={{
                        display: 'block',
                        fontSize: '11px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        color: '#7A6555', marginBottom: '8px',
                      }}>
                        {f.label}
                      </label>

                      {/* Input row */}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        {f.type === 'textarea' ? (
                          <textarea
                            value={currentVal}
                            placeholder={f.placeholder}
                            rows={3}
                            onChange={e => setEditing(prev => ({
                              ...prev, [k]: e.target.value
                            }))}
                            style={{
                              flex: 1,
                              border: `2px solid ${isDirty ? '#C8401A' : '#e5e7eb'}`,
                              borderRadius: '12px',
                              padding: '10px 14px',
                              fontSize: '14px',
                              outline: 'none',
                              resize: 'vertical',
                              fontFamily: 'inherit',
                              lineHeight: 1.6,
                              transition: 'border-color 0.2s',
                              background: isDirty ? '#fff8f6' : 'white',
                            }}
                          />
                        ) : (
                          <input
                            type={f.type}
                            value={currentVal}
                            placeholder={f.placeholder}
                            onChange={e => setEditing(prev => ({
                              ...prev, [k]: e.target.value
                            }))}
                            style={{
                              flex: 1,
                              border: `2px solid ${isDirty ? '#C8401A' : '#e5e7eb'}`,
                              borderRadius: '12px',
                              padding: '10px 14px',
                              fontSize: '14px',
                              outline: 'none',
                              fontFamily: 'inherit',
                              transition: 'border-color 0.2s',
                              background: isDirty ? '#fff8f6' : 'white',
                            }}
                          />
                        )}

                        {/* Save button */}
                        <button
                          onClick={() => saveField(f.page, f.section, f.field, currentVal)}
                          disabled={isSaving || !isDirty}
                          style={{
                            padding: '10px 18px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '13px',
                            border: 'none',
                            cursor: isSaving || !isDirty ? 'not-allowed' : 'pointer',
                            background: isSaved  ? '#16a34a'
                                      : isSaving ? '#9ca3af'
                                      : isDirty  ? '#C8401A'
                                      : '#f3f4f6',
                            color: isDirty || isSaved ? 'white' : '#9ca3af',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            minWidth: '80px',
                          }}>
                          {isSaving ? '⏳' : isSaved ? '✅ Saved' : isDirty ? 'Save' : 'Saved'}
                        </button>
                      </div>

                      {/* Dirty indicator */}
                      {isDirty && !isSaving && (
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', marginTop: '6px'
                        }}>
                          <p style={{ fontSize: '11px', color: '#C8401A', fontWeight: 600 }}>
                            ● Unsaved change
                          </p>
                          <button
                            onClick={() => setEditing(prev => ({ ...prev, [k]: savedVal }))}
                            style={{ fontSize: '11px', color: '#9ca3af',
                              background: 'none', border: 'none',
                              cursor: 'pointer', textDecoration: 'underline' }}>
                            Revert
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
