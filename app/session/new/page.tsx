'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const SESSION_TYPES = [
  { value: 'wedding', label: 'Wedding', emoji: '💍', desc: 'Ceremony & reception' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧', desc: 'Family portraits' },
  { value: 'portrait', label: 'Portrait', emoji: '🧑', desc: 'Individual portraits' },
  { value: 'street', label: 'Street', emoji: '🏙️', desc: 'Documentary street' },
  { value: 'real_estate', label: 'Real Estate', emoji: '🏠', desc: 'Property photography' },
  { value: 'event', label: 'Event', emoji: '🎉', desc: 'Events & conferences' },
]

const LOCATION_TYPES = [
  { value: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { value: 'indoor', label: 'Indoor', emoji: '🏠' },
  { value: 'mixed', label: 'Mixed', emoji: '🌥️' },
]

const TIME_OF_DAY = [
  { value: 'morning', label: 'Morning', emoji: '🌅', desc: '6am – 11am' },
  { value: 'midday', label: 'Midday', emoji: '☀️', desc: '11am – 3pm' },
  { value: 'golden_hour', label: 'Golden Hour', emoji: '🌇', desc: '3pm – sunset' },
  { value: 'night', label: 'Night', emoji: '🌙', desc: 'After sunset' },
]

export default function NewSessionPage() {
  const [formData, setFormData] = useState({
    title: '',
    session_type: '',
    location_type: '',
    time_of_day: '',
    constraints: '',
    goals: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.session_type || !formData.location_type || !formData.time_of_day) {
      setError('Please select a session type, location, and time of day.')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error: err } = await supabase
      .from('session_plans')
      .insert({
        user_id: user.id,
        title: formData.title || `${SESSION_TYPES.find(s => s.value === formData.session_type)?.label} Session`,
        session_type: formData.session_type,
        location_type: formData.location_type,
        time_of_day: formData.time_of_day,
        constraints: formData.constraints || null,
        goals: formData.goals || null,
      })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(`/session/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">Plan a Session</h1>
          <p className="text-stone-500 mt-1">Tell us about your upcoming shoot</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Title */}
          <div className="card">
            <label className="label">Session Name (optional)</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Smith Family Wedding"
            />
          </div>

          {/* Session Type */}
          <div className="card">
            <h2 className="font-semibold text-stone-900 mb-4">Session Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SESSION_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, session_type: type.value })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.session_type === type.value
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.emoji}</div>
                  <div className="font-medium text-sm text-stone-900">{type.label}</div>
                  <div className="text-xs text-stone-500">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Location Type */}
          <div className="card">
            <h2 className="font-semibold text-stone-900 mb-4">Location</h2>
            <div className="grid grid-cols-3 gap-3">
              {LOCATION_TYPES.map(loc => (
                <button
                  key={loc.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, location_type: loc.value })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    formData.location_type === loc.value
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{loc.emoji}</div>
                  <div className="font-medium text-sm text-stone-900">{loc.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day */}
          <div className="card">
            <h2 className="font-semibold text-stone-900 mb-4">Time of Day</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIME_OF_DAY.map(time => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, time_of_day: time.value })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    formData.time_of_day === time.value
                      ? 'border-stone-900 bg-stone-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{time.emoji}</div>
                  <div className="font-medium text-sm text-stone-900">{time.label}</div>
                  <div className="text-xs text-stone-500">{time.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Details */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-stone-900">Details (optional)</h2>
            <div>
              <label className="label">Constraints</label>
              <textarea
                className="input"
                rows={2}
                value={formData.constraints}
                onChange={e => setFormData({ ...formData, constraints: e.target.value })}
                placeholder="Limited time, small spaces, challenging lighting..."
              />
            </div>
            <div>
              <label className="label">Goals</label>
              <textarea
                className="input"
                rows={2}
                value={formData.goals}
                onChange={e => setFormData({ ...formData, goals: e.target.value })}
                placeholder="What do you want to capture? Emotions, details, wide shots..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 text-base"
            disabled={loading}
          >
            {loading ? 'Creating Plan...' : 'Generate Session Plan →'}
          </button>
        </form>
      </main>
    </div>
  )
}
