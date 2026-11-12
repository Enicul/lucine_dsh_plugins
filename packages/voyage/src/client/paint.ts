/**
 * Canvas painting for the night-sea scenes. Every function draws into a
 * 1280 by 800 coordinate space; the canvas element scales that to its box.
 */

/** Scene width in canvas units. */
export const W = 1280
/** Scene height in canvas units. */
export const H = 800

/** What to place on the water. */
export interface SeaOptions {
  /** Horizon height as a fraction of the scene height. */
  readonly horizon: number
  /** Moon centre (fractions of width and height) and radius in canvas units. */
  readonly moon: readonly [number, number, number]
  readonly stars: number
  /** Boat position along the width in canvas units; omitted for no boat. */
  readonly boatX?: number
  /** Lighthouse brightness from 0 to 1; omitted for no lighthouse. */
  readonly light?: number
  /** Number of floating lanterns. */
  readonly lanterns?: number
}

type G = CanvasRenderingContext2D

/** Fixed pseudo-random triples so stars and sparks keep their places between frames. */
const R = Array.from({ length: 120 }, (_, index) => {
  const at = (salt: number): number => {
    const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453
    return value - Math.floor(value)
  }
  return { a: at(1), b: at(2), c: at(3) }
})

function sky(g: G, stops: readonly (readonly [number, string])[], y0: number, y1: number): void {
  const gradient = g.createLinearGradient(0, y0, 0, y1)
  for (const [offset, color] of stops) gradient.addColorStop(offset, color)
  g.fillStyle = gradient
  g.fillRect(0, y0, W, y1 - y0)
}

function glow(g: G, x: number, y: number, r: number, rgb: string, alpha: number): void {
  const gradient = g.createRadialGradient(x, y, 0, x, y, r)
  gradient.addColorStop(0, `rgba(${rgb},${alpha})`)
  gradient.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = gradient
  g.fillRect(x - r, y - r, 2 * r, 2 * r)
}

const waveY = (y: number, amp: number, f: number, phase: number, x: number): number =>
  y - (Math.sin(x * f + phase) + 0.45 * Math.sin(x * f * 2.3 + phase * 1.7 + 1)) * amp

function ridge(g: G, y: number, amp: number, f: number, phase: number, fill: string, crest: number): void {
  g.beginPath()
  g.moveTo(0, H)
  for (let x = 0; x <= W; x += 12) g.lineTo(x, waveY(y, amp, f, phase, x))
  g.lineTo(W, H)
  g.closePath()
  g.fillStyle = fill
  g.fill()
  if (crest <= 0) return
  g.strokeStyle = `rgba(140,255,240,${crest})`
  g.lineWidth = 2.5
  g.beginPath()
  for (let x = 0; x <= W; x += 12) g.lineTo(x, waveY(y, amp, f, phase, x))
  g.stroke()
}

function disc(g: G, x: number, y: number, rx: number, fill: string, ry = rx): void {
  g.fillStyle = fill
  g.beginPath()
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  g.fill()
}

function poly(g: G, points: readonly (readonly [number, number])[], fill: string): void {
  g.fillStyle = fill
  g.beginPath()
  points.forEach(([x, y], index) => (index === 0 ? g.moveTo(x, y) : g.lineTo(x, y)))
  g.closePath()
  g.fill()
}

function stroke(g: G, points: readonly (readonly [number, number])[], color: string, width: number): void {
  g.strokeStyle = color
  g.lineWidth = width
  g.lineCap = 'round'
  g.beginPath()
  points.forEach(([x, y], index) => (index === 0 ? g.moveTo(x, y) : g.lineTo(x, y)))
  g.stroke()
}

function stars(g: G, t: number, count: number, maxY: number): void {
  for (let index = 0; index < count; index += 1) {
    const r = R[index % R.length]!
    disc(g, r.a * W, r.b * maxY, 0.8 + r.c * 1.5, `rgba(255,255,255,${0.4 + 0.5 * Math.sin(t * (1 + r.c * 2) + index)})`)
  }
}

function lighthouse(g: G, t: number, x: number, y: number, light: number): void {
  disc(g, x, y + 14, 90, '#2c2f63', 26)
  poly(g, [[x - 16, y], [x + 16, y], [x + 10, y - 120], [x - 10, y - 120]], '#f3efff')
  poly(g, [[x - 14, y - 44], [x + 14, y - 44], [x + 12, y - 70], [x - 12, y - 70]], '#e9765b')
  poly(g, [[x - 13, y - 120], [x + 13, y - 120], [x + 13, y - 142], [x - 13, y - 142]], '#2a2a55')
  poly(g, [[x - 16, y - 142], [x + 16, y - 142], [x, y - 160]], '#e9765b')
  glow(g, x, y - 131, 60 + 240 * light, '255,222,140', 0.35 + 0.6 * light)
  disc(g, x, y - 131, 8, light > 0.05 ? '#fff0b8' : '#9a9ac4')
  if (light < 0.98) return
  const reach = 620 * Math.abs(Math.cos(t * 0.5)) + 80
  g.save()
  g.globalAlpha = 0.2
  poly(g, [[x, y - 131], [x - reach, y - 190], [x - reach, y - 60]], '#fff0b8')
  g.restore()
}

function boat(g: G, x: number, y: number, tilt: number): void {
  g.save()
  g.translate(x, y)
  g.rotate(tilt)
  g.fillStyle = '#e9a45c'
  g.beginPath()
  g.moveTo(-48, -8)
  g.quadraticCurveTo(0, 28, 52, -8)
  g.closePath()
  g.fill()
  stroke(g, [[0, -6], [0, -80]], '#4a3b36', 3)
  g.fillStyle = '#f3f0ff'
  g.beginPath()
  g.moveTo(5, -78)
  g.quadraticCurveTo(46, -46, 40, -14)
  g.lineTo(5, -14)
  g.closePath()
  g.fill()
  poly(g, [[-5, -68], [-30, -14], [-5, -14]], '#f3f0ff')
  glow(g, 50, -22, 90, '255,210,120', 0.85)
  disc(g, 50, -20, 6, '#ffd27a')
  g.restore()
}

const WAVE_FILLS = ['rgba(50,110,160,.6)', 'rgba(40,98,150,.75)', 'rgba(30,86,138,.85)', 'rgba(24,74,124,.92)', '#143f6c']

/**
 * Paint the glowing night sea.
 * @param g - canvas context.
 * @param t - animation time in seconds.
 * @param o - horizon, moon, and what floats on the water.
 */
export function paintSea(g: G, t: number, o: SeaOptions): void {
  const hz = o.horizon
  sky(g, [[0, '#1d2c66'], [0.6, '#4257a8'], [1, '#8f8fdc']], 0, H * hz)
  stars(g, t, o.stars, H * hz * 0.9)
  const [mx, my, mr] = o.moon
  glow(g, W * mx, H * my, mr * 6, '225,232,255', 0.8)
  disc(g, W * mx, H * my, mr, '#fbfbff')
  ridge(g, H * hz - 4, 22, 0.004, 1, '#3d4a94', 0)
  ridge(g, H * hz + 4, 13, 0.007, 4, '#2f3a7c', 0)
  sky(g, [[0, '#6f79cf'], [0.3, '#285f95'], [1, '#123a66']], H * hz + 4, H)
  for (let index = 0; index < 14; index += 1) {
    const y = H * hz + 16 + index * 13
    const half = 50 + index * 9 + Math.sin(t * 1.4 + index) * 22
    if (y < H) stroke(g, [[W * mx - half, y], [W * mx + half, y]], `rgba(225,232,255,${0.42 - index * 0.028})`, 4)
  }
  if (o.light !== undefined) lighthouse(g, t, W * 0.86, H * (hz + 0.05), o.light)
  const gap = (1 - hz) * 0.19
  for (let k = 0; k < 5; k += 1) {
    const y = H * (hz + gap * (k + 1))
    const amp = 6 + 3 * k
    const f = 0.011 - 0.001 * k
    const phase = t * (0.6 + 0.15 * k) + k * 2
    if (o.boatX !== undefined && k === 2) {
      const slope = (waveY(y, amp, f, phase, o.boatX + 30) - waveY(y, amp, f, phase, o.boatX - 30)) / 60
      boat(g, o.boatX, waveY(y, amp, f, phase, o.boatX) - 6, slope * 0.7)
    }
    for (let index = 0; index < (o.lanterns ?? 0); index += 1) {
      if (index % 4 !== k) continue
      const x = W * (0.1 + 0.8 * ((index * 0.618 + 0.13) % 1))
      const ly = waveY(y, amp, f, phase, x) - 10
      glow(g, x, ly, 90, '255,206,120', 0.8)
      poly(g, [[x - 9, ly - 14], [x + 9, ly - 14], [x + 11, ly + 8], [x - 11, ly + 8]], '#ffd27a')
      poly(g, [[x - 11, ly + 6], [x + 11, ly + 6], [x + 8, ly + 12], [x - 8, ly + 12]], '#7a5540')
    }
    ridge(g, y, amp, f, phase, WAVE_FILLS[k]!, 0.5 + 0.3 * Math.sin(t + k))
  }
  const span = H * (1 - hz + 0.2)
  for (let index = 0; index < 34; index += 1) {
    const r = R[index + 70]!
    const y = H - ((r.b * span + t * (5 + r.c * 12)) % span)
    glow(g, r.a * W + Math.sin(t * (0.4 + r.c) + index) * 26, y, 5 + r.c * 5, '170,255,220', 0.5 + 0.4 * Math.sin(t * 1.5 + index))
  }
  vignette(g)
}

/**
 * Paint dark still water with slow ripples.
 * @param g - canvas context.
 * @param t - animation time in seconds.
 */
export function paintStillWater(g: G, t: number): void {
  sky(g, [[0, '#0e1536'], [0.7, '#16214e'], [1, '#1b2a5c']], 0, H)
  stars(g, t, 40, H * 0.5)
  glow(g, W * 0.5, -60, 520, '200,212,255', 0.3)
  for (let index = 0; index < 5; index += 1) {
    const r = (t * 16 + index * 96) % 480
    g.strokeStyle = `rgba(140,255,240,${0.3 * (1 - r / 480)})`
    g.lineWidth = 2
    g.beginPath()
    g.ellipse(W * 0.5, H * 0.93, r * 1.6, r * 0.22, 0, 0, Math.PI * 2)
    g.stroke()
  }
  glow(g, W * 0.5, H * 0.93, 90, '225,232,255', 0.35)
  vignette(g)
}

function vignette(g: G): void {
  const gradient = g.createRadialGradient(W / 2, H / 2, H * 0.5, W / 2, H / 2, H)
  gradient.addColorStop(0, 'rgba(10,10,40,0)')
  gradient.addColorStop(1, 'rgba(10,10,40,.3)')
  g.fillStyle = gradient
  g.fillRect(0, 0, W, H)
}
