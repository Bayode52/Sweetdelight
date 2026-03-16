// src/components/layout/Footer.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Instagram, Phone, Mail, MessageCircle, Facebook, Music2 } from 'lucide-react'

export default async function Footer() {
  let phone = '+44 7000 000000'
  let whatsapp = '447000000000'
  let email = 'hello@sweetdelites.co.uk'
  let instagram = '@sweetdelites'
  let facebook = ''
  let tiktok = ''
  let tagline = 'Handcrafting moments of joy with premium ingredients and Nigerian warmth.'
  let copyright = '© 2026 Sweet Delites. All rights reserved.'

  try {
    const sb = await createClient()
    const { data } = await sb
      .from('site_content')
      .select('section, field, value')
      .eq('page', 'footer')

    data?.forEach(row => {
      if (row.section === 'contact') {
        if (row.field === 'phone')     phone     = row.value
        if (row.field === 'whatsapp')  whatsapp  = row.value
        if (row.field === 'email')     email     = row.value
        if (row.field === 'instagram') instagram = row.value
      }
      if (row.section === 'social') {
        if (row.field === 'facebook') facebook = row.value
        if (row.field === 'tiktok')   tiktok   = row.value
      }
      if (row.section === 'brand') {
        if (row.field === 'tagline')   tagline   = row.value
        if (row.field === 'copyright') copyright = row.value
      }
    })
  } catch (err) {
    console.error('Footer content fetch error:', err)
  }
  const waNumber = whatsapp.replace(/\D/g, '')

  return (
    <footer style={{ background: '#1A0800', color: 'rgba(255,255,255,0.7)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 80px)' }}>
        
        {/* Grid — 1 col mobile, 4 col desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: 'clamp(32px, 5vw, 64px)',
          paddingBottom: '48px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          
          {/* Brand */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.35rem', fontWeight: 700,
                fontStyle: 'italic', color: 'white', lineHeight: 1,
              }}>
                Sweet <span style={{ color: '#D4A843' }}>Delites</span>
              </p>
              <p style={{
                fontSize: '9px', letterSpacing: '0.15em',
                color: 'rgba(212,168,67,0.7)', fontWeight: 600,
                textTransform: 'lowercase', marginTop: '3px',
              }}>
                cakesnmore ✦
              </p>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.7, maxWidth: '260px' }}>
              {tagline}
            </p>
            {/* Socials */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {instagram && (
                <a href={`https://instagram.com/${instagram.replace('@','')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={socialStyle} title="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {waNumber && (
                <a href={`https://wa.me/${waNumber}`}
                  target="_blank" rel="noopener noreferrer"
                  style={socialStyle} title="WhatsApp">
                  <MessageCircle size={18} />
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer"
                  style={socialStyle} title="Facebook">
                  <Facebook size={18} />
                </a>
              )}
              {tiktok && (
                <a href={tiktok} target="_blank" rel="noopener noreferrer"
                  style={socialStyle} title="TikTok">
                  <Music2 size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p style={footerHeadStyle}>Quick Links</p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/', label: 'Home' },
                { href: '/menu', label: 'Menu' },
                { href: '/custom-order', label: 'Custom Order' },
                { href: '/about', label: 'About Us' },
                { href: '/blog', label: 'Blog' },
                { href: '/reviews', label: 'Reviews' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} style={footerLinkStyle}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p style={footerHeadStyle}>Help</p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/track-order', label: 'Track Order' },
                { href: '/contact', label: 'FAQs & Contact' },
                { href: '/terms', label: 'Terms' },
                { href: '/privacy', label: 'Privacy Policy' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} style={footerLinkStyle}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — LIVE FROM DATABASE */}
          <div>
            <p style={footerHeadStyle}>Contact Us</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {phone && (
                <a href={`tel:${phone.replace(/\s/g,'')}`} style={contactItemStyle}>
                  <Phone size={16} color="#C8401A" />
                  <span style={{ fontSize: '13px' }}>{phone}</span>
                </a>
              )}
              {instagram && (
                <a href={`https://instagram.com/${instagram.replace('@','')}`}
                  target="_blank" rel="noopener noreferrer" style={contactItemStyle}>
                  <Instagram size={16} color="#C8401A" />
                  <span style={{ fontSize: '13px' }}>{instagram}</span>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} style={contactItemStyle}>
                  <Mail size={16} color="#C8401A" />
                  <span style={{ fontSize: '13px' }}>{email}</span>
                </a>
              )}
              {waNumber && (
                <a href={`https://wa.me/${waNumber}`}
                  target="_blank" rel="noopener noreferrer" style={contactItemStyle}>
                  <MessageCircle size={16} color="#25D366" />
                  <span style={{ fontSize: '13px' }}>WhatsApp Us</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          paddingTop: '24px',
          fontSize: '12px',
        }}>
          <span>{copyright}</span>
          <span>Made in the UK 🇬🇧 with Nigerian Soul ❤️</span>
        </div>
      </div>
    </footer>
  )
}

const socialStyle: React.CSSProperties = {
  width: '36px', height: '36px', borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '15px', textDecoration: 'none', transition: 'all 0.2s',
}
const footerHeadStyle: React.CSSProperties = {
  color: 'white', fontSize: '11px', fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px',
}
const footerLinkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
  fontSize: '13px', transition: 'color 0.2s',
}
const contactItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  textDecoration: 'none', color: 'rgba(255,255,255,0.65)',
}
