import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import type { SessionPlan, GearItem, PhotographerProfile } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profileResult, gearResult, sessionsResult] = await Promise.all([
    supabase.from('photographer_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('gear_items').select('*').eq('user_id', user.id),
    supabase.from('session_plans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
  ])

  const profile = profileResult.data as PhotographerProfile | null
  const gear = (gearResult.data || []) as GearItem[]
  const sessions = (sessionsResult.data || []) as SessionPlan[]

  const sessionTypeLabels: Record<string, string> = {
    wedding: 'Wedding',
    family: 'Family',
    street: 'Street',
    real_estate: 'Real Estate',
    event: 'Event',
    portrait: 'Portrait',
  }

  const locationTypeLabels: Record<string, string> = {
    indoor: 'Indoor',
    outdoor: 'Outdoor',
    mixed: 'Mixed',
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">
            {profile?.name ? `Welcome back, ${profile.name.split(' ')[0]}` : 'Welcome to Bokeh Buddy'}
          </h1>
          <p className="text-stone-500 mt-1">Plan your next photography session</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Gear Items', value: gear.length, icon: '🎒' },
            { label: 'Sessions', value: sessions.length, icon: '📋' },
            { label: 'Cameras', value: gear.filter(g => g.type === 'camera').length, icon: '📷' },
            { label: 'Lenses', value: gear.filter(g => g.type === 'lens').length, icon: '🔭' },
          ].map(stat => (
            <div key={stat.label} className="card text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-stone-900">{stat.value}</div>
              <div className="text-xs text-stone-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Setup Banner (if no profile or gear) */}
        {(!profile?.name || gear.length === 0) && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <h3 className="font-semibold text-amber-900 mb-1">Complete your setup</h3>
            <p className="text-amber-700 text-sm mb-4">
              Set up your profile and add your gear to get personalized session recommendations.
            </p>
            <div className="flex gap-3 flex-wrap">
              {!profile?.name && (
                <Link href="/profile" className="btn-primary text-sm py-1.5">
                  Set up profile →
                </Link>
              )}
              {gear.length === 0 && (
                <Link href="/gear" className="btn-secondary text-sm py-1.5">
                  Add your gear →
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Sessions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-900">Recent Sessions</h2>
              <Link href="/session/new" className="text-sm text-stone-500 hover:text-stone-800">
                + New
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-stone-400 text-sm mb-4">No sessions yet</p>
                <Link href="/session/new" className="btn-primary">
                  Plan your first session
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map(session => (
                  <Link
                    key={session.id}
                    href={`/session/${session.id}`}
                    className="card block hover:border-stone-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-stone-900">{session.title}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                            {sessionTypeLabels[session.session_type]}
                          </span>
                          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                            {locationTypeLabels[session.location_type]}
                          </span>
                        </div>
                      </div>
                      <span className="text-stone-400 text-sm">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Gear Preview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-stone-900">Your Gear</h2>
              <Link href="/gear" className="text-sm text-stone-500 hover:text-stone-800">
                Manage →
              </Link>
            </div>

            {gear.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-stone-400 text-sm mb-4">No gear added yet</p>
                <Link href="/gear" className="btn-primary">
                  Add your first item
                </Link>
              </div>
            ) : (
              <div className="card space-y-3">
                {['camera', 'lens', 'flash', 'modifier', 'support'].map(type => {
                  const items = gear.filter(g => g.type === type)
                  if (items.length === 0) return null
                  return (
                    <div key={type}>
                      <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
                        {type}s ({items.length})
                      </h4>
                      {items.map(item => (
                        <div key={item.id} className="text-sm text-stone-700 py-1 border-b border-stone-50 last:border-0">
                          {item.brand} {item.model}
                          {item.focal_range && <span className="text-stone-400 ml-1">· {item.focal_range}</span>}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
