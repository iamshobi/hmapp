# The Ocean Dive — Game Design Rationale

## Overview

An immersive heart coherence game where users dive through the five scientific layers of the ocean by sustaining high heart rate coherence. As coherence holds steady, the session descends deeper — from the sunlit surface through twilight, midnight, the abyss, and down to the hadal trenches. These screens document the complete game flow from introduction to completion.

---

## Ocean treasures by zone (research)

> The ocean's layers harbour distinct treasures, from the sunlit surface to the crushing depths of the trenches. Below is a comprehensive list of 15 rare animals, 15 unique shells, and 15 precious pearls categorised by the five primary ocean zones.

Source: *Sea Animals Shells Pearls.xlsx* (HeartMath Game research).

### Sunlight (Epipelagic)

**Rarest sea animals**

- 1. Vaquita Porpoise — The world's rarest marine mammal, found only in the northern Gulf of California.
- 2. Short-beaked Common Dolphin — Highly social and energetic, though rare in certain isolated regions.
- 3. Banggai Cardinalfish — A striking but endangered fish with an extremely limited geographic range in Indonesia.

**Interesting sea shells**

- 1. Glory of the Sea Cone: Once the rarest shell on Earth, prized for its intricate geometric patterns.
- 2. Queen Conch — Famous for its large size and stunning pink interior, though populations are strictly protected.
- 3. Venus Comb Murex — Distinguished by its incredibly long, delicate spines that protect it from predators.

**Precious pearls**

- 1. Akoya Pearl: The classic saltwater pearl, celebrated for its perfect round shape and mirror-like lustre.
- 2. South Sea Pearl: The largest and most luxurious of all pearls, found in white and deep golden hues.
- 3. Freshwater Pearl — Known for its incredible variety of shapes and soft, pastel colours like lavender and peach.

### Twilight (Mesopelagic)

**Rarest sea animals**

- 1. Barreleye Fish — Features a transparent, fluid-filled dome on its head to protect its upward-facing eyes.
- 2. Sperm Whale — A deep-diving giant that descends into this zone to hunt for large squid.
- 3. Hatchetfish — A tiny, silver fish with a thin, hatchet-shaped body and bioluminescent undersides.

**Interesting sea shells**

- 1. Sphaerocypraea incomparabilis: One of the rarest cowrie-like shells, with fewer than 10 specimens ever recorded.
- 2. Golden Cowrie — Historically a symbol of high rank in the Pacific, found only on deep reef slopes.
- 3. Imperial Volute: A large, heavy shell with a majestic "crown" of spines around its apex.

**Precious pearls**

- 1. Tahitian Black Pearl: Naturally dark pearls with exotic overtones like peacock green, blue, and silver.
- 2. Basra Pearl: Highly rare and historic natural pearls from the Persian Gulf, prized for their unique glow.
- 3. Keshi Pearl: A non-nucleated "accidental" pearl that is made entirely of solid nacre, offering intense lustre.

### Midnight (Bathypelagic)

**Rarest sea animals**

- 1. Gulper Eel — Recognizable by its massive, expandable mouth that allows it to swallow prey much larger than itself.
- 2. Anglerfish — Uses a bioluminescent lure to attract prey in the absolute darkness of the deep sea.
- 3. Vampire Squid — A "living fossil" that uses bioluminescent "eyes" at the tips of its tentacles to confuse predators.

**Interesting sea shells**

- 1. Fulton's Cowrie — A highly polished, rare shell found in remote, deep offshore waters.
- 2. Junonia Shell: A deep-water species with a cream-coloured shell covered in distinctive brown rectangular spots.
- 3. Chambered Nautilus — The last surviving cephalopod with an external shell, featuring a beautiful spiral design.

**Precious pearls**

- 1. Conch Pearl: A rare, non-nacreous pink pearl with a unique "flame" pattern, found in Queen Conch shells.
- 2. Melo Melo Pearl: A non-nacreous, vibrant orange pearl produced by the giant Indian Volute sea snail.
- 3. Abalone Pearl: Extremely rare, naturally occurring pearls with brilliant, iridescent blue and green colours.

### Abyssal (Abyssopelagic)

**Rarest sea animals**

- 1. Tripod Fish — Uses elongated fins to "stand" on the muddy seafloor while waiting for tiny prey.
- 2. Giant Isopod — A massive, deep-sea crustacean that scavenges for food falling from the surface.
- 3. Dumbo Octopus — Named for its ear-like fins, it "hovers" gracefully just above the deep ocean floor.

**Interesting sea shells**

- 1. Carrier Shell (Xenophora) — A unique snail that cements other shells and stones to its own for structural strength and camouflage.
- 2. Glass Sponge — While not a traditional mollusc shell, its intricate silica skeleton is a biological masterpiece.
- 3. Deep Sea Scallop — Specialized bivalves adapted to survive the near-freezing temperatures of the abyss.

**Precious pearls**

- 1. Quahog Pearl: A rare, non-nacreous purple or white pearl found in the hard-shell clams of the North Atlantic.
- 2. Scallop Pearl: Typically matte or satiny, these rare pearls are found in various scallop species.
- 3. Giant Clam Pearl: Massive, non-nacreous pearls that can grow to record-breaking sizes but lack traditional lustre.

### Hadal (Hadalpelagic)

**Rarest sea animals**

- 1. Hadal Snailfish — The deepest-living fish, found in the Mariana Trench at depths of over 8,000 metres.
- 2. Cusk Eel — Slender, eel-like fish that are among the few vertebrates capable of surviving trench pressures.
- 3. Giant Amphipod — Transparent scavengers that grow much larger than their shallow-water relatives due to deep-sea gigantism.

**Interesting sea shells**

- 1. Hadal Bivalve — Specialized clams that live near hydrothermal vents and trenches, often harboring symbiotic bacteria.
- 2. Abyssal Limpet — Small, hardy gastropods that cling to rocky surfaces in the deepest parts of the ocean.
- 3. Vesicomyid Clam — Large, white clams found in the deep trenches that rely on chemical energy instead of sunlight.

**Precious pearls**

- 1. Sea of Cortez Pearl: Extremely rare cultured pearls from Mexico, known for their unique multicoloured overtones.
- 2. Baroque Pearl: Irregularly shaped pearls that are prized for their unique, one-of-a-kind organic forms.
- 3. N/A (Fossilized Pearl): Modern pearl-producing oysters cannot survive hadal pressures; only ancient, mineralized specimens are found.

---

## Game Flow Overview

| Step | Screen | Purpose |
|------|--------|---------|
| 1 | **Game Introduction** (`OceanTideScreen`) | Zone list hub: top-bar **My Shell Collection** orb (white SVG shell + pearl), intro copy, coherence instruction, `OceanHeroOrb`, vertical level timeline |
| 2 | **Level Selection** | Vertical timeline of six dive levels with gradient zone thumbnails |
| 2.5 | **Pre-session interstitial** | After **Dive In**: staged copy + per-step decor → **3 · 2 · 1** countdown → white handoff → `BreathSession` |
| 3 | **Active Gameplay** | Maintain coherence to descend through pelagic zones in real time |
| 4 | **Zone Discovery** | In-session Help modal revealing scientific facts about each zone |
| 5 | **Session Complete + Reward** | Animated zone badge reveal with session stats |
| 6 | **Post-Session Feedback** | Mood check-in with animated face circles on the same screen |

---

## Game Screens

### 1 · Game Introduction (`OceanTideScreen.js`)

The entry point to the Ocean Dive zone list (after Session Complete **Done**, or when returning to this hub). Deep-ocean gradient background, **My Shell Collection** orb in the top bar, then a short zone intro line, coherence instruction, **`OceanHeroOrb`**, and the scrollable level timeline.

**Layout top → bottom:**
- Top bar: back chevron · "The Ocean Dive" title · **My Shell Collection** gradient orb (`TouchableOpacity` → `ShellCollection`) with **`MyShellCollectionIcon`** — white **react-native-svg** line art (open bivalve + pearl, `color` `#FFFFFF`, 22 px inside the orb)
- Intro line + coherence instruction (copy differs slightly from legacy “subtitle only” layout)
- `OceanHeroOrb` — atmospheric ocean globe with pelagic zone bands and polar shimmer
- Vertical level timeline (`LevelRow` × 6)

**Dive In:** from level detail, **`OceanAnalyzingInterstitial`** runs (see §2.5) — not the legacy *Breath deeper · Dive deeper* single overlay.

---

### 2 · Level Selection (within `OceanTideScreen.js`)

Six dive levels are displayed as a vertical timeline — the Full Column Dive at the top, then five scientific pelagic zones in order of depth.

| Level | Zone | Depth Range | Accent Colour |
|-------|------|-------------|---------------|
| Full Column | Surface → 10,994 m | Complete ocean column | Cyan–Blue |
| Epipelagic | Sunlight Zone | 0–200 m | Bright Cyan |
| Mesopelagic | Twilight Zone | 200–1,000 m | Mid Blue |
| Bathypelagic | Midnight Zone | 1,000–4,000 m | Indigo |
| Abyssopelagic | The Abyss | 4,000–6,000 m | Deep Purple |
| Hadalpelagic | The Trenches | 6,000–10,994 m | Magenta |

Each `LevelRow` shows:
- Left timeline column: dashed connector line + zone dot (filled for first, outlined for rest)
- Gradient thumbnail card with `OceanLineIcon` zone glyph
- Level name and "Dive in M:SS" duration
- Right chevron

---

### 2.5 · Pre-session analyzing interstitial (`OceanAnalyzingInterstitial.js` + `OceanAnalyzingInterstitialDecor.js`)

Full-screen dark gradient after **Dive In**. **Script phase:** lines fade in and out one at a time (heartbeat, coherence, breathe deeper, sea animals, ampersand, shells). **`OceanAnalyzingInterstitialDecor`** adds motion per line only for that step:

| Step (index) | Decor |
|--------------|--------|
| Heartbeat | Translucent heart bubbles drifting in edge bands |
| *Discover sea animals* | **`NeonCreaturePng`** — same RGBA creature PNGs and neon ring stack as **`OceanSwimmingCreatures`** (e.g. fish + seahorse accents), not ad-hoc SVG silhouettes |
| *Sea shells* | Shell emoji inside glass bubbles that **spawn sequentially** — one bubble completes its float → burst lifecycle before the next appears (edge bands; short gap between spawns) |

**Countdown phase:** concentric rings appear only here. Digits **3 · 2 · 1** sit in the same **260×260** frame as the rings so the number stays optically centred; typography uses matching `lineHeight` / Android `includeFontPadding: false`. Two independent **`Animated`** loops (~3.2 s and ~4.1 s, sin-eased) drive outer vs inner ring **scale** and **opacity** for a slow ripple. **Game begins** is pinned to the **bottom** with **`useSafeAreaInsets()`** padding. Then a white handoff → **`BreathSessionScreen`**.

---

### 3 · Active Gameplay (`BreathSessionScreen.js`)

The core game screen. Every visual layer responds to the simulated ocean depth `depthM`, which advances as coherence holds. The screen is composed of six stacked rendering layers:

| Layer (back → front) | Component | Purpose |
|---|---|---|
| 1 · Background | `OceanSessionScrollingBackground` | `surface.svg` scrolls vertically as depth increases |
| 2 · Ambient overlay | `OceanUnderwaterAmbientOverlay` | Pelagic tint gradient darkening with depth |
| 3 · Zone lighting | `OceanZoneLightingLayer` | Sunrays + caustic shimmer (Epipelagic), dim blue wash (Mesopelagic), total darkness (Bathypelagic+) |
| 4 · Seafloor | `OceanSeafloorLayer` | Coral, kelp, anemones, rocks fading in near the zone floor |
| 5 · Bubbles | `OceanRisingBubbles` | Physics-based rising bubbles, denser near the surface |
| 6 · Creatures | `OceanSwimmingCreatures` | Flat-style marine creature icons swimming in three parallax lanes |

**HUD overlaid on top:**
- Top bar: Coherence value display · session title · **Help (?)** icon
- Centre: `BreathingDot` — expanding/contracting ring pulsing in sync with breathing phase
- Bottom-right corner: current depth in metres (small, understated)
- Right column: five zone dots, active dot highlighted in the current zone accent colour
- `OceanDepthCinematicOverlay`: floating zone label + depth counter transitioning on zone change

---

### 4 · Zone Discovery Modal (within `BreathSessionScreen.js`)

Tapping the Help (?) icon during a session opens a Modal with detailed scientific information about the current pelagic zone. Content is zone-specific and updates dynamically as the dive deepens.

**Modal layout:**
- Top accent bar (colour matches current zone accent)
- Zone title and depth subtitle
- Thin divider rule
- Scrollable body text (scientific description)
- *"Coherence is simulated…"* note pill at the bottom
- "Got it" close button

**Zone educational content covers:**
- Epipelagic — temperature variation, thermocline, sunlight penetration
- Mesopelagic — twilight bioluminescence, upward-directed eyes, vertical migration
- Bathypelagic — constant 4 °C, extreme pressure, sperm whale dives
- Abyssopelagic — pitch-black abyssal plains, near-freezing, "no bottom" etymology
- Hadalpelagic — Mariana Trench, foraminifera discovery, deepest fish record

---

### 5 · Session Complete + Reward (top half of `SessionRewardsScreen.js`)

On session end, the user arrives at a single scrollable screen with a magenta → indigo gradient background. The top half celebrates the completed session.

**Elements:**
- **Sparkle badge** — white 4-pointed star in a glowing pill
- **"Session Complete"** headline
- **Stats row** — Duration · Coherence · Depth reached (3 glassmorphic stat tiles)
- **Inspirational quote** — italic serif, white 72% opacity
- **Zone reward pill** — `ZoneBadgeIcon` (zone-specific SVG glyph) + zone name + depth range · tapping opens the zone badge detail modal
- **Zone badge modal** — full details: badge icon, zone name, depth range, depth reached, scientific subtitle

---

### 6 · Post-Session Feedback (bottom half of `SessionRewardsScreen.js`)

Immediately below the session stats, without any navigation change, the feedback section prompts a mood check-in.

**Elements:**
- **"How do you feel now?"** section heading
- **Three mood circles** (equal size, 96 px) — happy · neutral · sad — each rendered as a thin-line SVG face
  - Unselected: muted white border, no background
  - Selected: gradient fill (amber → orange → pink), face outline in white
- **"Done" button** — initially muted white outline, becomes solid white fill after a mood is selected

---

## Key Components

### `OceanHeroOrb`
Custom SVG ocean globe rendered on the intro screen. Features atmospheric outer glow, pelagic zone colour bands (light-to-dark blue rings), meridian grid arcs, polar shimmer cap, seafloor shadow, and two animated floating sparkles orbiting the globe.

> SVG-only, no external assets · viewBox 148 × 148 · purely decorative

---

### `MyShellCollectionIcon`
White vector CTA on **`OceanTideScreen`** (and reusable elsewhere). Renders an **open shell with pearl** — upper and lower valves, radial ridges, filled pearl — using **`react-native-svg`** (`Path`, `Line`, `Circle`) in a **64 × 64** viewBox. The **`color`** prop tints all strokes and the pearl fill (defaults **`#FFFFFF`**) so the icon stays on-brand on gradients and glass buttons.

> Inline SVG only — not the legacy HeartMath shell glyph (`assets/my-shell-collection-icon.svg` / `myShellCollectionGlyph.js`); optional raster **`assets/my-shell-collection-shell-icon.png`** may exist as a design reference but is not required by the app bundle.

---

### `OceanSessionScrollingBackground`
Loads `surface.svg` (a full ocean column infographic SVG, surface to hadal floor) via `expo-asset` + `expo-file-system` and renders it with `SvgXml`. The Y-offset of the SVG is driven by `oceanSessionBackdropEasedU`, an easing function that converts `depthM` into a smooth scroll position so the background pans at the correct rate as the dive deepens.

> Used for **all** ocean levels — both zone-specific and the Full Column dive.

---

### `OceanZoneLightingLayer`
A React Native animated layer rendered above the background that simulates zone-appropriate light conditions:

| Zone | Effect |
|------|--------|
| Epipelagic | 9 animated sunray fans fanning down from the surface, swaying gently; caustic shimmer dots dancing across the water |
| Mesopelagic | Cool ambient blue wash; rays barely visible, fading fast with depth |
| Bathypelagic → Hadal | Total darkness; pure ambient black with only bioluminescent creature glow |

Light intensity and colour are driven by `getCinematicZoneIndexByDepth(depthM)`.

---

### `OceanRisingBubbles`
Physics-based bubble system with three visual layers per bubble for realism:
- Transparent body ring (stroke-only circle)
- Specular highlight dot (top-left offset)
- Refraction arc (inner curved stroke)

Bubble density is inversely proportional to depth — abundant near the surface, tapering off below 1,000 m.

---

### `OceanSwimmingCreatures`
Three independent parallax swim lanes (`SwimSlot` × 3), each with its own spawn timing and depth-aware zone pool.

| Lane | Size (× base) | Opacity peak | Speed | Y-band |
|------|----------------|--------------|-------|--------|
| Background | ×0.60 | 55% | ×0.65 | 10–52% of screen |
| Midground | ×0.80 | 78% | ×0.90 | 16–68% of screen |
| Foreground | ×1.00 | 95% | ×1.15 | 22–78% of screen |

Each `SwimSlot` performs:
- Horizontal swim (`translateX`) across the screen; fade in / hold / fade out on opacity
- Direction flip (`scaleX` on a **non-animated** wrapper) so the creature faces its travel direction — avoids mixing flip with native-driver transforms on Android
- Sine-wave vertical undulation (`Animated.loop` on Y-offset)
- **`NeonCreaturePng`:** RGBA-transparent PNG silhouettes with `tintColor="#FFFFFF"`; **three concentric `View` rings** behind the image use the zone tint and **`glowPulse`** opacity interpolation — **no `shadowColor`** (Fabric-safe on Android)

Creature pool by **modelled depth** (random pick within zone):

| Depth band (m) | Tint | Pool |
|----------------|------|------|
| &lt; 200 | `#4DD8F0` | dolphin, fish, seahorse, scallop |
| &lt; 1,000 | `#7AB5FF` | pufferfish, seahorse, starfish, conch |
| &lt; 4,000 | `#8878FF` | octopus, starfish, conch, scallop |
| &lt; 6,000 | `#B060E8` | octopus, starfish, pufferfish, conch |
| ≥ 6,000 | `#E050C8` | octopus, starfish, conch, scallop |

**`NeonCreaturePng`** is exported for reuse (e.g. pre-session **Discover sea animals** decor).

---

### `BreathingDot` (within `OceanDepthCinematicOverlay`)
An animated breathing visual centred on screen, replacing the traditional progress bar track. Three concentric rings inhale and exhale in sync using `Easing.inOut(Easing.sin)` over a 3.2 s in + 3.2 s out cycle:

| Ring | Idle scale | Peak scale | Opacity range |
|------|-----------|-----------|---------------|
| Core dot | 0.65× | 1.55× | 100% |
| Inner ring | 1.0× | 1.6× | 45% → 8% |
| Outer diffuse ring | 1.1× | 2.0× | 22% → 0% |

Dot colour tracks the current zone accent (`ZONE_DOT_COLORS` lookup from `oceanCinematicZones`).

---

### `ZoneBadgeIcon`
Six hand-drawn SVG badge designs — one per pelagic zone — used in `SessionRewardsScreen` as the post-session reward icon:

| Zone | Badge design | Accent colour |
|------|-------------|---------------|
| Epipelagic | Sun disc with water surface and light shafts | Cyan `#4DD8F0` |
| Mesopelagic | Crescent moon with scattered dots | Mid-blue `#6A9FD8` |
| Bathypelagic | Triangle prism with horizontal lines | Indigo-blue `#5870C8` |
| Abyssopelagic | Diamond with vertical axis spine | Purple `#9060C8` |
| Hadalpelagic | Chevron stack (V-marks, 3 deep) | Violet `#B860C8` |
| Full Column | Vertical axis bar spanning all zones | Cyan-blue `#4A90D8` |

---

### `MoodFace` (within `SessionRewardsScreen`)
Thin-line SVG emoji faces rendered inside `MoodCircle` containers. Three states — happy · neutral · sad — drawn with stroke-only paths (no fill) to match the minimalist icon language of the app.

- **Unselected:** white border circle, 30% opacity face lines
- **Selected:** gradient background (amber → orange → magenta), full-opacity white face

---

## Design Notes

### Colour Language & Depth Mapping
Each pelagic zone has a dedicated accent colour that runs consistently across every surface — the level card thumbnail, the breathing dot, zone badge, cinematic overlay text, help modal accent bar, and creature bioluminescent glow.

```
Epipelagic    #4DD8F0  (cyan)
Mesopelagic   #6A9FD8  (mid-blue)
Bathypelagic  #5870C8  (indigo)
Abyssopelagic #9060C8  (deep purple)
Hadalpelagic  #B860C8  (violet-magenta)
```

### Scrolling Background
The entire ocean column — from the sunlit surface at 0 m down to 10,994 m at the Challenger Deep — is encoded in a single `surface.svg` file. The session pans this SVG vertically as `depthM` increases, giving a continuous sense of descending through real ocean geography rather than zone-switched backgrounds.

### Parallax Creature Depth
Three simultaneous creature swim lanes at different scales and speeds create a genuine sense of underwater 3D space without a 3D engine. Background creatures are 60% the size of foreground creatures and move at 65% of the speed, which the human visual system reads as being further away.

### Bioluminescence in Deep Zones
Below the Mesopelagic zone (>1,000 m), all ambient light is removed and the only colour on screen comes from two sources: the breathing dot accent and the creature glow halos. This matches the real ocean condition where bioluminescence is the only light source, and creates the strongest visual reward moment when a glowing Anglerfish swims past.

### Seamless Rewards Screen
Session stats and the post-session mood check-in are combined on a single `ScrollView` with one gradient background. This avoids a screen transition at the emotionally resonant moment of completion, keeping the user in a calm, uninterrupted flow state while still capturing feedback.

### Glassmorphism & Legibility
Stat tiles and card surfaces use `rgba(255,255,255,0.14)` backgrounds with `rgba(255,255,255,0.22)` borders. Text sits on these semi-transparent panes rather than directly on the gradient, ensuring legibility across the full range of zone colours without requiring per-zone text colour overrides.

### Scientific Authenticity
All zone names, depth boundaries, temperature data, pressure values, and creature examples in the Help modal match peer-reviewed oceanographic sources (NOAA zone definitions). The depth counter during gameplay shows the actual modelled depth in metres, grounding the fantasy of "diving" in real scientific data.

---

*Last updated: 31 March 2026 — Ocean Dive v1.4, HeartMath Wellness App. **My Shell Collection** entry icon: **`MyShellCollectionIcon`** — white SVG **open shell + pearl** on Ocean Tide top bar (replaces earlier spiral/conch raster or legacy glyph). Pre-session interstitial: centred **3·2·1** in ring stage, slow dual-ring ripples, **Game begins** at bottom; sea-animals step uses **`NeonCreaturePng`**; shells line uses **sequential** shell bubbles. Ocean treasures (animals, shells, pearls) synced from `Sea Animals Shells Pearls.xlsx`; re-import via `scripts/import_ocean_treasures_md.py`. Aligns with `ocean-dive-design-rationale.html`.*
