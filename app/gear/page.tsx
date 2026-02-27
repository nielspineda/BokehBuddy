'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import type { GearItem } from '@/types'

type GearType = GearItem['type']

const GEAR_TYPES: { value: GearType; label: string; emoji: string }[] = [
  { value: 'camera', label: 'Camera', emoji: '📷' },
  { value: 'lens', label: 'Lens', emoji: '🔭' },
  { value: 'flash', label: 'Flash', emoji: '⚡' },
  { value: 'modifier', label: 'Modifier', emoji: '💡' },
  { value: 'support', label: 'Support', emoji: '🦺' },
]

const emptyGear: Omit<GearItem, 'id' | 'user_id' | 'created_at'> = {
  type: 'camera',
  brand: '',
  model: '',
  focal_range: '',
  max_aperture: '',
  notes: '',
}

export default function GearPage() {
  const [gear, setGear] = useState<GearItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ ...emptyGear })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeFilter, setActiveFilter] = useState<GearType | 'all'>('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadGear()
  // loadGear uses supabase and router which are stable references
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadGear() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('gear_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setGear((data || []) as GearItem[])
    setLoading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      type: formData.type,
      brand: formData.brand,
      model: formData.model,
      focal_range: formData.focal_range || null,
      max_aperture: formData.max_aperture || null,
      notes: formData.notes || null,
    }

    if (editingId) {
      await supabase.from('gear_items').update(payload).eq('id', editingId)
    } else {
      await supabase.from('gear_items').insert(payload)
    }

    setSaving(false)
    setShowForm(false)
    setEditingId(null)
    setFormData({ ...emptyGear })
    loadGear()
  }

  async function handleDelete(id: string) {
    await supabase.from('gear_items').delete().eq('id', id)
    setGear(gear.filter(g => g.id !== id))
  }

  function handleEdit(item: GearItem) {
    setFormData({
      type: item.type,
      brand: item.brand,
      model: item.model,
      focal_range: item.focal_range || '',
      max_aperture: item.max_aperture || '',
      notes: item.notes || '',
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const filteredGear = activeFilter === 'all'
    ? gear
    : gear.filter(g => g.type === activeFilter)

  const groupedGear = GEAR_TYPES.reduce((acc, type) => {
    acc[type.value] = gear.filter(g => g.type === type.value)
    return acc
  }, {} as Record<GearType, GearItem[]>)

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Gear Manager</h1>
            <p className="text-stone-500 mt-1">Your camera bag inventory</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ ...emptyGear }) }}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : '+ Add Gear'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="font-semibold text-stone-900 mb-4">
              {editingId ? 'Edit Gear Item' : 'Add New Gear'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Type</label>
                <div className="flex gap-2 flex-wrap">
                  {GEAR_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        formData.type === type.value
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {type.emoji} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Brand</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Sony, Canon, Nikon..."
                    required
                  />
                </div>
                <div>
                  <label className="label">Model</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    placeholder="A7IV, R5, Z6..."
                    required
                  />
                </div>
              </div>

              {formData.type === 'lens' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Focal Range</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.focal_range || ''}
                      onChange={e => setFormData({ ...formData, focal_range: e.target.value })}
                      placeholder="85mm, 24-70mm..."
                    />
                  </div>
                  <div>
                    <label className="label">Max Aperture</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.max_aperture || ''}
                      onChange={e => setFormData({ ...formData, max_aperture: e.target.value })}
                      placeholder="f/1.8, f/2.8..."
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Notes (optional)</label>
                <input
                  type="text"
                  className="input"
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add to Bag'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingId(null); setFormData({ ...emptyGear }) }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        {gear.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              All ({gear.length})
            </button>
            {GEAR_TYPES.map(type => {
              const count = groupedGear[type.value].length
              if (count === 0) return null
              return (
                <button
                  key={type.value}
                  onClick={() => setActiveFilter(type.value)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === type.value ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {type.emoji} {type.label} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* Gear List */}
        {gear.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-4">🎒</p>
            <h3 className="font-semibold text-stone-900 mb-2">Your bag is empty</h3>
            <p className="text-stone-500 text-sm mb-6">Add your cameras, lenses, and accessories to get personalized recommendations</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Add your first item
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGear.map(item => {
              const gearType = GEAR_TYPES.find(t => t.value === item.type)
              return (
                <div key={item.id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gearType?.emoji}</span>
                    <div>
                      <div className="font-medium text-stone-900">
                        {item.brand} {item.model}
                      </div>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-xs text-stone-400 capitalize">{item.type}</span>
                        {item.focal_range && (
                          <span className="text-xs text-stone-400">· {item.focal_range}</span>
                        )}
                        {item.max_aperture && (
                          <span className="text-xs text-stone-400">· {item.max_aperture}</span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-stone-400 mt-0.5">{item.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-sm text-stone-500 hover:text-stone-800 px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-sm text-stone-400 hover:text-red-500 px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
