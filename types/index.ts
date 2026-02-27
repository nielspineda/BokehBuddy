export interface PhotographerProfile {
  id: string
  user_id: string
  name: string
  location: string
  specialties: string[]
  style_tags: string[]
  portfolio_links: string[]
  bio: string
  created_at: string
}

export interface GearItem {
  id: string
  user_id: string
  type: 'camera' | 'lens' | 'flash' | 'modifier' | 'support'
  brand: string
  model: string
  focal_range?: string
  max_aperture?: string
  notes?: string
  created_at: string
}

export interface SessionPlan {
  id: string
  user_id: string
  title: string
  session_type: 'wedding' | 'family' | 'street' | 'real_estate' | 'event' | 'portrait'
  location_type: 'indoor' | 'outdoor' | 'mixed'
  time_of_day: 'morning' | 'midday' | 'golden_hour' | 'night'
  constraints?: string
  goals?: string
  created_at: string
}

export interface ShotSuggestion {
  id: string
  name: string
  description: string
  angle: string
  composition: string
  pose_prompt?: string
  session_type: string
}

export interface GearRecommendation {
  item?: GearItem
  reason: string
  priority: 'essential' | 'recommended' | 'nice_to_have'
  suggestion?: string
}
