import { GearItem, SessionPlan, GearRecommendation, ShotSuggestion } from '@/types'

export function getGearRecommendations(
  session: SessionPlan,
  gear: GearItem[]
): GearRecommendation[] {
  const recommendations: GearRecommendation[] = []
  const cameras = gear.filter(g => g.type === 'camera')
  const lenses = gear.filter(g => g.type === 'lens')
  const flashes = gear.filter(g => g.type === 'flash')
  const supports = gear.filter(g => g.type === 'support')
  const modifiers = gear.filter(g => g.type === 'modifier')

  const isLowLight =
    session.location_type === 'indoor' || session.time_of_day === 'night'
  const isOutdoor = session.location_type === 'outdoor'

  // Always recommend cameras
  if (cameras.length > 0) {
    cameras.forEach((cam, i) => {
      recommendations.push({
        item: cam,
        reason:
          i === 0
            ? 'Primary camera body for this session'
            : session.session_type === 'wedding'
            ? 'Second body for backup and candid shots'
            : 'Backup body',
        priority: i === 0 ? 'essential' : 'recommended',
      })
    })
  } else {
    recommendations.push({
      reason: 'No camera body in inventory — add one to your gear list',
      priority: 'essential',
      suggestion: 'Camera body required',
    })
  }

  // Lens recommendations by session type
  if (session.session_type === 'wedding') {
    const versatileLens = lenses.find(l =>
      l.focal_range?.includes('24') || l.focal_range?.includes('28')
    )
    const telephotoLens = lenses.find(l =>
      l.focal_range?.includes('70') || l.focal_range?.includes('200')
    )
    const primeLens = lenses.find(l =>
      l.focal_range === '35mm' ||
      l.focal_range === '50mm' ||
      l.focal_range === '85mm'
    )

    if (versatileLens) {
      recommendations.push({
        item: versatileLens,
        reason: 'Versatile range for ceremonies, formals, and venue shots',
        priority: 'essential',
      })
    } else {
      recommendations.push({
        reason: 'A 24–70mm or similar zoom is ideal for wedding versatility',
        priority: 'recommended',
        suggestion: '24-70mm f/2.8',
      })
    }

    if (telephotoLens) {
      recommendations.push({
        item: telephotoLens,
        reason: 'Telephoto reach for candid moments and emotional reactions',
        priority: 'essential',
      })
    } else {
      recommendations.push({
        reason: 'A 70–200mm telephoto captures candid distance shots beautifully',
        priority: 'recommended',
        suggestion: '70-200mm f/2.8',
      })
    }

    if (primeLens) {
      recommendations.push({
        item: primeLens,
        reason: 'Fast prime for low-light reception and intimate portraits',
        priority: 'recommended',
      })
    }

    if (flashes.length > 0) {
      flashes.forEach(flash => {
        recommendations.push({
          item: flash,
          reason: 'Essential for reception lighting and fill flash outdoors',
          priority: 'essential',
        })
      })
    } else {
      recommendations.push({
        reason: 'Flash is critical for wedding receptions',
        priority: 'recommended',
        suggestion: 'Speedlight flash',
      })
    }
  } else if (session.session_type === 'family') {
    const portraitLens = lenses.find(l =>
      l.focal_range === '35mm' ||
      l.focal_range === '50mm' ||
      l.focal_range === '85mm' ||
      l.focal_range?.includes('35') ||
      l.focal_range?.includes('50')
    )
    const wideZoom = lenses.find(l =>
      l.focal_range?.includes('24') || l.focal_range?.includes('35')
    )

    if (portraitLens) {
      recommendations.push({
        item: portraitLens,
        reason: 'Natural compression and flattering perspective for family portraits',
        priority: 'essential',
      })
    } else {
      recommendations.push({
        reason: '35mm or 50mm primes give flattering, natural family portraits',
        priority: 'recommended',
        suggestion: '50mm f/1.8 or 35mm f/1.8',
      })
    }

    if (wideZoom && wideZoom !== portraitLens) {
      recommendations.push({
        item: wideZoom,
        reason: 'Great for group shots and environmental portraits',
        priority: 'recommended',
      })
    }
  } else if (session.session_type === 'real_estate') {
    const wideLens = lenses.find(l => {
      const focal = parseInt(l.focal_range || '50')
      return focal <= 24
    })

    if (wideLens) {
      recommendations.push({
        item: wideLens,
        reason: 'Ultra-wide coverage essential for room compositions',
        priority: 'essential',
      })
    } else {
      recommendations.push({
        reason: 'An ultra-wide lens (16-24mm) is essential for real estate interiors',
        priority: 'essential',
        suggestion: '16-35mm or 14mm wide angle',
      })
    }

    if (supports.length > 0) {
      supports.forEach(support => {
        recommendations.push({
          item: support,
          reason: 'Tripod ensures sharp, level shots for interior photography',
          priority: 'essential',
        })
      })
    } else {
      recommendations.push({
        reason: 'A tripod is highly recommended for real estate photography',
        priority: 'essential',
        suggestion: 'Tripod or monopod',
      })
    }
  } else if (session.session_type === 'street') {
    const compactLens = lenses.find(l =>
      l.focal_range === '35mm' ||
      l.focal_range === '28mm' ||
      l.focal_range === '50mm' ||
      l.focal_range?.includes('35') ||
      l.focal_range?.includes('28')
    )

    if (compactLens) {
      recommendations.push({
        item: compactLens,
        reason: 'Compact and discreet — ideal for street photography',
        priority: 'essential',
      })
    } else {
      recommendations.push({
        reason: 'A 35mm or 28mm prime lens is perfect for street work',
        priority: 'recommended',
        suggestion: '35mm f/2 or 28mm f/1.8',
      })
    }
  } else if (session.session_type === 'portrait') {
    const portraitLens = lenses.find(l =>
      l.focal_range === '85mm' ||
      l.focal_range === '50mm' ||
      l.focal_range?.includes('85') ||
      l.focal_range?.includes('105')
    )

    if (portraitLens) {
      recommendations.push({
        item: portraitLens,
        reason: 'Classic focal length for flattering portrait compression',
        priority: 'essential',
      })
    } else {
      recommendations.push({
        reason: '85mm or 105mm portrait lenses provide beautiful background separation',
        priority: 'recommended',
        suggestion: '85mm f/1.8 portrait lens',
      })
    }
  } else if (session.session_type === 'event') {
    const zoomLens = lenses.find(l =>
      l.focal_range?.includes('24') ||
      l.focal_range?.includes('70') ||
      l.focal_range?.includes('28')
    )
    const telephoto = lenses.find(l =>
      l.focal_range?.includes('70') || l.focal_range?.includes('200')
    )

    if (zoomLens) {
      recommendations.push({
        item: zoomLens,
        reason: 'Versatile zoom coverage for unpredictable event moments',
        priority: 'essential',
      })
    }

    if (telephoto && telephoto !== zoomLens) {
      recommendations.push({
        item: telephoto,
        reason: 'Telephoto for capturing speakers and candid moments from a distance',
        priority: 'recommended',
      })
    }

    if (flashes.length > 0) {
      flashes.forEach(flash => {
        recommendations.push({
          item: flash,
          reason: 'Flash for mixed-lighting event environments',
          priority: 'recommended',
        })
      })
    }
  }

  // Low light / indoor adjustments
  if (isLowLight) {
    const fastLens = lenses.find(l => {
      const aperture = parseFloat(l.max_aperture?.replace('f/', '') || '4')
      return aperture <= 1.8
    })

    if (fastLens && !recommendations.some(r => r.item?.id === fastLens.id)) {
      recommendations.push({
        item: fastLens,
        reason: `Fast aperture (${fastLens.max_aperture}) is ideal for ${session.location_type === 'indoor' ? 'indoor' : 'night'} shooting`,
        priority: 'recommended',
      })
    }

    if (flashes.length > 0 && session.session_type !== 'street') {
      flashes.forEach(flash => {
        if (!recommendations.some(r => r.item?.id === flash.id)) {
          recommendations.push({
            item: flash,
            reason: 'Flash helps manage challenging low-light conditions',
            priority: 'recommended',
          })
        }
      })
    }

    if (modifiers.length > 0) {
      modifiers.forEach(mod => {
        if (!recommendations.some(r => r.item?.id === mod.id)) {
          recommendations.push({
            item: mod,
            reason: 'Light modifier for softer, more flattering flash output',
            priority: 'nice_to_have',
          })
        }
      })
    }
  }

  // Add supports for outdoor sessions
  if (isOutdoor && session.session_type !== 'street') {
    supports.forEach(support => {
      if (!recommendations.some(r => r.item?.id === support.id)) {
        recommendations.push({
          item: support,
          reason: 'Useful for stable long-exposure and group shots',
          priority: 'nice_to_have',
        })
      }
    })
  }

  return recommendations
}

export function getShotSuggestions(session: SessionPlan): ShotSuggestion[] {
  const shots: Record<string, ShotSuggestion[]> = {
    wedding: [
      {
        id: 'w1',
        name: 'Getting Ready — Candid Laughter',
        description: 'Capture unscripted emotional moments during preparation',
        angle: 'Eye level or slightly above',
        composition: 'Rule of thirds — subject slightly off-center with mirrors or window light in frame',
        pose_prompt: 'Let moments unfold naturally; watch for interactions between the subject and their support group',
        session_type: 'wedding',
      },
      {
        id: 'w2',
        name: 'Golden Hour Couple Walk',
        description: 'Romantic backlit silhouette or rim-lit portrait during golden hour',
        angle: 'Low angle shooting into the sun for dramatic rim light',
        composition: 'Place couple in lower third, fill sky with warm light',
        pose_prompt: 'Ask couple to walk slowly toward or away from camera, holding hands naturally',
        session_type: 'wedding',
      },
      {
        id: 'w3',
        name: 'Detail Shots — Rings & Florals',
        description: 'Tight macro details of rings, bouquet, and meaningful accessories',
        angle: 'Top-down flat lay or 45° angle',
        composition: 'Minimal backgrounds, shallow depth of field to isolate details',
        pose_prompt: 'Arrange items thoughtfully; use natural window light for soft shadows',
        session_type: 'wedding',
      },
      {
        id: 'w4',
        name: 'First Dance Motion',
        description: 'Dynamic motion blur or frozen moment during the first dance',
        angle: 'Low angle to include guests in background bokeh',
        composition: 'Frame couple tightly; let ambient lights create bokeh in background',
        pose_prompt: 'Capture the spin or dip — brief prompting during a natural pause',
        session_type: 'wedding',
      },
      {
        id: 'w5',
        name: 'Ceremony Kiss',
        description: 'The defining moment — clean, emotional, timeless',
        angle: 'Straight-on or slight side angle from the aisle',
        composition: 'Frame between flower arrangements or officiant shoulders',
        pose_prompt: 'No posing needed — anticipate and be ready',
        session_type: 'wedding',
      },
    ],
    family: [
      {
        id: 'f1',
        name: 'Walking Candid',
        description: 'Family walking together in a relaxed, natural moment',
        angle: 'Side angle at eye level',
        composition: 'Wide enough to show environment; family fills the lower half',
        pose_prompt: 'Ask the family to walk toward you slowly, talking to each other',
        session_type: 'family',
      },
      {
        id: 'f2',
        name: 'Seated Together Portrait',
        description: 'Classic connected family portrait with natural expressions',
        angle: 'Slightly elevated, shooting down at 15–20°',
        composition: 'Stagger heights; use leading lines from the environment',
        pose_prompt: 'Have parents sit with children in laps or snuggled beside; ask them to tell a funny family story',
        session_type: 'family',
      },
      {
        id: 'f3',
        name: 'Child-Led Candid',
        description: 'Let the child(ren) lead the action for authentic energy',
        angle: 'Child eye level — get down low',
        composition: 'Loose framing to allow for movement; keep parents blurred in background',
        pose_prompt: 'Give children simple freedom — "show me your best jump" or "run to mom"',
        session_type: 'family',
      },
      {
        id: 'f4',
        name: 'Parent & Child Connection',
        description: 'Intimate moment between parent and child',
        angle: 'Close, intimate. Slightly above or eye level',
        composition: 'Fill frame with just the two subjects; focus on eyes',
        pose_prompt: "Ask parent to whisper something silly in child's ear",
        session_type: 'family',
      },
    ],
    real_estate: [
      {
        id: 're1',
        name: 'Doorway Entry Framing',
        description: 'Use the front door as a natural frame for the property',
        angle: 'Eye level, dead center',
        composition: 'Stand just outside the doorway; frame the interior through the doorframe',
        session_type: 'real_estate',
      },
      {
        id: 're2',
        name: 'Wide Room Composition',
        description: 'Full-width coverage showing room scale and design',
        angle: 'Corner of the room, shooting diagonally',
        composition: 'Include ceiling and floor; use 1/3 floor, 2/3 room ratio',
        session_type: 'real_estate',
      },
      {
        id: 're3',
        name: 'Kitchen Detail Vignette',
        description: 'Highlight premium features: counters, backsplash, appliances',
        angle: '45° angle at counter height',
        composition: 'Keep lines straight and parallel; use depth to lead eyes toward feature',
        session_type: 'real_estate',
      },
      {
        id: 're4',
        name: 'Exterior Establishing Shot',
        description: 'Full property exterior with sky and landscaping',
        angle: 'Three-quarter angle from the street',
        composition: 'Include driveway or path as leading line; shoot during blue hour for warm interior glow',
        session_type: 'real_estate',
      },
    ],
    street: [
      {
        id: 's1',
        name: 'Subject in Doorway',
        description: 'Environmental portrait using architecture as a natural frame',
        angle: 'Eye level, slightly back',
        composition: 'Doorframe fills edges of image; subject centered or rule-of-thirds within frame',
        pose_prompt: 'Observe and wait — capture the authentic moment of someone pausing or looking out',
        session_type: 'street',
      },
      {
        id: 's2',
        name: 'Motion Blur Crosswalk',
        description: 'Slow shutter to capture movement and city energy',
        angle: 'Eye level or slightly elevated',
        composition: 'Static elements (signs, buildings) anchor the frame; moving people create blur trails',
        session_type: 'street',
      },
      {
        id: 's3',
        name: 'Layered Depth Composition',
        description: 'Multiple planes of interest creating depth and story',
        angle: 'Low or eye level with strong foreground element',
        composition: 'Foreground detail leads to mid-ground subject with blurred background depth',
        session_type: 'street',
      },
      {
        id: 's4',
        name: 'Reflected Light Abstract',
        description: 'Puddles, windows, and reflective surfaces creating geometric patterns',
        angle: 'Low angle to capture reflections',
        composition: 'Find symmetry or interesting distortion; include city elements for context',
        session_type: 'street',
      },
    ],
    portrait: [
      {
        id: 'p1',
        name: 'Window Light Portrait',
        description: 'Classic single-source window light for sculpted, dimensional look',
        angle: '45° to the light source',
        composition: 'Place subject 2-3 feet from window; use wall behind as clean background',
        pose_prompt: 'Ask subject to look toward the light, then slowly turn away — capture the transition',
        session_type: 'portrait',
      },
      {
        id: 'p2',
        name: 'Environmental Portrait',
        description: 'Subject in their natural environment or meaningful location',
        angle: 'Eye level with environment visible',
        composition: 'Wide enough to show setting; subject off-center, interacting with environment',
        pose_prompt: 'Have subject engage with something in their environment naturally',
        session_type: 'portrait',
      },
      {
        id: 'p3',
        name: 'Dramatic Shadow Split',
        description: 'High-contrast split lighting for bold, editorial look',
        angle: 'Direct front, tight crop',
        composition: 'Center face; allow dramatic shadow to bisect the face vertically',
        pose_prompt: 'Strong neutral gaze directly into lens; slight chin down',
        session_type: 'portrait',
      },
    ],
    event: [
      {
        id: 'ev1',
        name: 'Speaker at Podium',
        description: 'Capture keynote or speaker with engaged audience in background',
        angle: 'Side angle or front-center',
        composition: 'Speaker sharp, audience softly blurred for depth and context',
        session_type: 'event',
      },
      {
        id: 'ev2',
        name: 'Networking Candid',
        description: 'Authentic interactions between attendees',
        angle: 'Observe from distance; telephoto compression',
        composition: 'Two or three subjects in natural conversation',
        pose_prompt: 'Do not interrupt — observe and capture genuine moments',
        session_type: 'event',
      },
      {
        id: 'ev3',
        name: 'Room Establishing Shot',
        description: 'Wide environmental shot showing venue scale and atmosphere',
        angle: 'Elevated if possible; corner of the room',
        composition: 'Show full scale of venue, lighting, and crowd',
        session_type: 'event',
      },
    ],
  }

  return shots[session.session_type] || []
}

export function getLensSuggestionForShot(
  shot: ShotSuggestion,
  gear: GearItem[],
  session: SessionPlan
): { item?: GearItem; suggestion: string; reason: string } {
  const lenses = gear.filter(g => g.type === 'lens')

  if (session.session_type === 'wedding') {
    if (shot.id === 'w2' || shot.id === 'w4') {
      // Golden hour / dance - telephoto
      const telephoto = lenses.find(l =>
        l.focal_range?.includes('70') || l.focal_range?.includes('85')
      )
      if (telephoto) return { item: telephoto, suggestion: telephoto.model, reason: 'Telephoto compression for beautiful background separation' }
      return { suggestion: '85mm f/1.8', reason: 'Telephoto for cinematic compression at golden hour' }
    }
    if (shot.id === 'w3') {
      // Details - macro or portrait
      const macroOrPortrait = lenses.find(l =>
        l.focal_range?.includes('100') || l.focal_range?.includes('105') || l.focal_range === '85mm'
      )
      if (macroOrPortrait) return { item: macroOrPortrait, suggestion: macroOrPortrait.model, reason: 'Longer focal length for tight detail shots without distortion' }
      return { suggestion: '100mm macro or 85mm', reason: 'Close-focusing capability for ring and detail shots' }
    }
  }

  if (session.session_type === 'family') {
    const portraitLens = lenses.find(l =>
      l.focal_range === '50mm' || l.focal_range === '35mm' || l.focal_range?.includes('50')
    )
    if (portraitLens) return { item: portraitLens, suggestion: portraitLens.model, reason: 'Natural perspective for family portraits' }
    return { suggestion: '50mm f/1.8', reason: 'Classic focal length for natural, flattering family portraits' }
  }

  if (session.session_type === 'real_estate') {
    const wideLens = lenses.find(l => parseInt(l.focal_range || '50') <= 24)
    if (wideLens) return { item: wideLens, suggestion: wideLens.model, reason: 'Wide coverage essential for interior architecture' }
    return { suggestion: '16-35mm f/4', reason: 'Ultra-wide lens needed for room coverage' }
  }

  if (session.session_type === 'street') {
    const streetLens = lenses.find(l =>
      l.focal_range === '35mm' || l.focal_range === '28mm' || l.focal_range?.includes('35')
    )
    if (streetLens) return { item: streetLens, suggestion: streetLens.model, reason: 'Classic street focal length — natural perspective, compact size' }
    return { suggestion: '35mm f/2', reason: 'The classic street photography focal length' }
  }

  if (session.session_type === 'portrait') {
    const portraitLens = lenses.find(l =>
      l.focal_range === '85mm' || l.focal_range?.includes('85') || l.focal_range?.includes('105')
    )
    if (portraitLens) return { item: portraitLens, suggestion: portraitLens.model, reason: 'Portrait focal length for flattering compression' }
    return { suggestion: '85mm f/1.8', reason: "The portrait photographer's classic choice" }
  }

  // Default
  const anyLens = lenses[0]
  if (anyLens) return { item: anyLens, suggestion: anyLens.model, reason: 'Best available lens from your inventory' }
  return { suggestion: 'Standard zoom 24-70mm', reason: 'Versatile coverage for this shot type' }
}
