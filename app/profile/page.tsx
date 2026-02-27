'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import type { PhotographerProfile } from '@/types'

const SPECIALTIES = ['Wedding', 'Portrait', 'Family', 'Street', 'Real Estate', 'Event', 'Travel', 'Editorial', 'Commercial', 'Sports', 'Nature', 'Architecture']
const STYLE_TAGS = ['Natural Light', 'Flash-Heavy', 'Documentary', 'Editorial', 'Fine Art', 'Moody', 'Bright & Airy', 'Film-Inspired', 'Dark & Dramatic', 'Minimalist']

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<PhotographerProfile>>({
    name: '',
    location: '',
    bio: '',
    specialties: [],
    style_tags: [],
    portfolio_links: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [portfolioInput, setPortfolioInput] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('photographer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile(data)
      }
      setLoading(false)
    }
    loadProfile()
  }, [router, supabase])

  function toggleTag(tag: string, field: 'specialties' | 'style_tags') {
    setProfile(prev => {
      const current = prev[field] || []
      return {
        ...prev,
        [field]: current.includes(tag)
          ? current.filter(t => t !== tag)
          : [...current, tag],
      }
    })
  }

  function addPortfolioLink() {
    if (!portfolioInput.trim()) return
    setProfile(prev => ({
      ...prev,
      portfolio_links: [...(prev.portfolio_links || []), portfolioInput.trim()],
    }))
    setPortfolioInput('')
  }

  function removePortfolioLink(link: string) {
    setProfile(prev => ({
      ...prev,
      portfolio_links: (prev.portfolio_links || []).filter(l => l !== link),
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('photographer_profiles')
      .upsert({
        user_id: user.id,
        name: profile.name || '',
        location: profile.location || '',
        bio: profile.bio || '',
        specialties: profile.specialties || [],
        style_tags: profile.style_tags || [],
        portfolio_links: profile.portfolio_links || [],
      }, { onConflict: 'user_id' })

    setSaving(false)
    if (error) {
      setMessage('Error saving profile: ' + error.message)
    } else {
      setMessage('Profile saved!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-stone-400">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">Your Profile</h1>
          <p className="text-stone-500 mt-1">Tell us about your photography style and specialties</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.startsWith('Error')
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-stone-900">Basic Info</h2>
            <div>
              <label className="label">Your Name</label>
              <input
                type="text"
                className="input"
                value={profile.name || ''}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                type="text"
                className="input"
                value={profile.location || ''}
                onChange={e => setProfile({ ...profile, location: e.target.value })}
                placeholder="New York, NY"
              />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea
                className="input"
                rows={3}
                value={profile.bio || ''}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself and your photography..."
              />
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-stone-900 mb-4">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag, 'specialties')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    (profile.specialties || []).includes(tag)
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-stone-900 mb-4">Photography Style</h2>
            <div className="flex flex-wrap gap-2">
              {STYLE_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag, 'style_tags')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    (profile.style_tags || []).includes(tag)
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-stone-900 mb-4">Portfolio Links</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                className="input flex-1"
                value={portfolioInput}
                onChange={e => setPortfolioInput(e.target.value)}
                placeholder="https://yourportfolio.com"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPortfolioLink())}
              />
              <button type="button" onClick={addPortfolioLink} className="btn-secondary">
                Add
              </button>
            </div>
            {(profile.portfolio_links || []).map(link => (
              <div key={link} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-stone-600 hover:text-stone-900 truncate flex-1">
                  {link}
                </a>
                <button
                  type="button"
                  onClick={() => removePortfolioLink(link)}
                  className="text-stone-400 hover:text-red-500 ml-2 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </main>
    </div>
  )
}
