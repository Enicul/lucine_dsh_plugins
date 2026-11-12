/** The animated night-sea canvas behind a voyage page. */
import { useEffect, useRef } from 'react'
import { H, paintSea, paintStillWater, W, type SeaOptions } from './paint.ts'
import css from './Voyage.module.css'

/** Which scene to paint. */
export type SceneKind = 'home' | 'waiting' | 'still'

/**
 * Paint one scene and keep it moving while the page is visible.
 * @param props - `kind` picks the scene, `progress` is the number of finished steps (0 to 3), `lanterns` the number of open thoughts.
 * @returns a canvas that fills its positioned parent.
 */
export function Scene({ kind, progress, lanterns }: { readonly kind: SceneKind; readonly progress: number; readonly lanterns: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  // The loop reads the latest props through this ref so a prop change does not restart the animation.
  const latest = useRef({ kind, progress, lanterns })
  latest.current = { kind, progress, lanterns }

  useEffect(() => {
    const g = canvas.current?.getContext('2d')
    if (g === null || g === undefined) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let t = 0
    let shown = latest.current.progress
    const draw = (): void => {
      const now = latest.current
      shown += still ? now.progress - shown : (now.progress - shown) * 0.035
      if (now.kind === 'still') paintStillWater(g, t)
      else {
        const options: SeaOptions = now.kind === 'home'
          ? { horizon: 0.58, moon: [0.5, 0.3, 70], stars: 70, boatX: W * (0.3 + 0.1 * shown), light: Math.min(1, shown / 3) }
          : { horizon: 0.62, moon: [0.7, 0.2, 46], stars: 70, lanterns: now.lanterns }
        paintSea(g, t, options)
      }
      t += 1 / 60
      // With reduced motion the boat jumps to its place and the picture is redrawn only when something changes.
      frame = still ? 0 : requestAnimationFrame(draw)
    }
    const start = (): void => {
      cancelAnimationFrame(frame)
      if (document.visibilityState === 'visible') draw()
    }
    start()
    document.addEventListener('visibilitychange', start)
    const redraw = still ? window.setInterval(draw, 1000) : 0
    return () => {
      cancelAnimationFrame(frame)
      window.clearInterval(redraw)
      document.removeEventListener('visibilitychange', start)
    }
  }, [])

  return <canvas ref={canvas} className={css.scene} width={W} height={H} aria-hidden="true" />
}
