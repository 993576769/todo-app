import PocketBase from 'pocketbase'
import type { TypedPocketBase } from '@/types/pocketbase'

const getPBUrl = () => {
  if (import.meta.env.VITE_PB_URL) return import.meta.env.VITE_PB_URL
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return '/'
}

export const pb = new PocketBase(getPBUrl()) as TypedPocketBase

if (import.meta.env.DEV) {
  pb.autoCancellation(false)
}
