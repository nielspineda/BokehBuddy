import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { getGearRecommendations, getShotSuggestions, getLensSuggestionForShot } from '@/lib/recommendations'
import type { SessionPlan, GearItem } from '@/types'
import Link from 'next/link'

const SESSION_TYPE_LABELS: Record<string, string> = {
  wedding: 'Wedding',
  family: 'Family',
  street: 'Street',
  real_estate: 'Real Estate',
  event: 'Event',
  portrait: 'Portrait',
}

const LOCATION_LABELS: Record<string, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  mixed: 'Mixed',
}

const TIME_LABELS: Record<string, string> = {
  morning: 'Morning',
  midday: 'Midday',
  golden_hour: 'Golden Hour',
  night: 'Night',
}

const PRIORITY_CONFIG = {
  essential: { label: 'Essential', color: 'bg-stone-900 text-white' },
  recommended: { label: 'Recommended', color: 'bg-stone-100 text-stone-700' },
  nice_to_have: { label: 'Nice to Have', color: 'bg-stone-50 text-stone-500' },
}

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [sessionResult, gearResult] = await Promise.all([
    supabase.from('session_plans').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('gear_items').select('*').eq('user_id', user.id),
  ])

  if (!sessionResult.data) notFound()

  const session = sessionResult.data as SessionPlan
  const gear = (gearResult.data || []) as GearItem[]

  const gearRecommendations = getGearRecommendations(session, gear)
  const shotSuggestions = getShotSuggestions(session)

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <Link href="/dashboard" className="text-sm text-stone-400 hover:text-stone-600 mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-stone-900">{session.title}</h1>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-stone-900 text-white px-2 py-1 rounded-full">
                  {SESSION_TYPE_LABELS[session.session_type]}
                </span>
                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                  {LOCATION_LABELS[session.location_type]}
                </span>
                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                  {TIME_LABELS[session.time_of_day]}
                </span>
              </div>
            </div>
          </div>

          {(session.goals || session.constraints) && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              {session.goals && (
                <div className="card">
                  <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Goals</h3>
                  <p className="text-sm text-stone-700">{session.goals}</p>
                </div>
              )}
              {session.constraints && (
                <div className="card">
                  <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">Constraints</h3>
                  <p className="text-sm text-stone-700">{session.constraints}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gear Recommendations */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-stone-900 mb-4">
            🎒 Gear Recommendations
          </h2>

          {gearRecommendations.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-stone-400 text-sm">
                Add gear to your inventory to get personalized recommendations.
              </p>
              <Link href="/gear" className="btn-primary mt-4 inline-block">
                Add Gear
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {gearRecommendations.map((rec, i) => {
                const config = PRIORITY_CONFIG[rec.priority]
                return (
                  <div key={i} className="card flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
                          {config.label}
                        </span>
                        {rec.item ? (
                          <span className="font-medium text-stone-900">
                            {rec.item.brand} {rec.item.model}
                          </span>
                        ) : (
                          <span className="font-medium text-stone-500 italic">
                            {rec.suggestion}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-500">{rec.reason}</p>
                    </div>
                    {rec.item && (
                      <span className="text-xs text-stone-400 capitalize flex-shrink-0">{rec.item.type}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Shot Suggestions */}
        <section>
          <h2 className="text-lg font-bold text-stone-900 mb-4">
            📸 Shot Suggestions
          </h2>

          {shotSuggestions.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-stone-400 text-sm">No shot templates available for this session type yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {shotSuggestions.map(shot => {
                const lensSuggestion = getLensSuggestionForShot(shot, gear, session)
                return (
                  <div key={shot.id} className="card">
                    <h3 className="font-semibold text-stone-900 mb-2">{shot.name}</h3>
                    <p className="text-sm text-stone-600 mb-3">{shot.description}</p>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Angle</span>
                        <p className="text-stone-600 mt-0.5">{shot.angle}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Composition</span>
                        <p className="text-stone-600 mt-0.5">{shot.composition}</p>
                      </div>
                      {shot.pose_prompt && (
                        <div>
                          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Direction</span>
                          <p className="text-stone-600 mt-0.5">{shot.pose_prompt}</p>
                        </div>
                      )}
                    </div>

                    {/* Lens Suggestion */}
                    <div className="mt-4 pt-4 border-t border-stone-100">
                      <span className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Lens</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-stone-900">
                          {lensSuggestion.item
                            ? `${lensSuggestion.item.brand} ${lensSuggestion.item.model}`
                            : lensSuggestion.suggestion}
                        </span>
                        {lensSuggestion.item && (
                          <span className="text-xs text-stone-400">
                            {lensSuggestion.item.focal_range}
                            {lensSuggestion.item.max_aperture && ` · ${lensSuggestion.item.max_aperture}`}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{lensSuggestion.reason}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
