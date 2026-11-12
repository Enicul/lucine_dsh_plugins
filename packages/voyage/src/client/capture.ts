/** Open and close signal for the capture box, shared by the shortcut, the side-panel button and the box. */
import { useSyncExternalStore } from 'react'

let open = false
const listeners = new Set<() => void>()

/**
 * Show or hide the capture box.
 * @param next - whether the box is open.
 */
export function setCaptureOpen(next: boolean): void {
  if (open === next) return
  open = next
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Subscribe a component to the capture box state.
 * @returns whether the box is open.
 */
export function useCaptureOpen(): boolean {
  return useSyncExternalStore(subscribe, () => open)
}
