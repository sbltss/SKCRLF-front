const BASE = (import.meta.env.VITE_ASSETS_BASE || '/src/assets').replace(/\/$/, '')
const ROOT = import.meta.env.BASE_URL || '/'

function buildUrl(id: number | string, ext: string, absolute = true) {
  const filename = `${id}.${ext}`
  const path = `${BASE}/${filename}`
  return absolute ? path : path.replace(ROOT, '')
}

async function urlExists(url: string) {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (res.ok) return true
  } catch {}
  try {
    const res = await fetch(url, { cache: 'no-store' })
    return res.ok
  } catch {
    return false
  }
}

export async function resolveImagePath(shoeId: number | string) {
  const idStr = String(shoeId).trim()
  if (!idStr || /[^\w\-]/.test(idStr)) {
    console.warn('Invalid shoe_id format', shoeId)
    return null
  }
  const exts = ['png', 'jpg', 'jpeg', 'webp']
  for (const ext of exts) {
    const url = buildUrl(idStr, ext, true)
    const exists = await urlExists(url)
    if (exists) return url
  }
  return null
}

export async function mapShoeImages(apiData: any[], options?: { absolute?: boolean; fallback?: string }) {
  const absolute = options?.absolute !== false
  const fallback = options?.fallback || '/Image/product1.jpg'
  const results: any[] = []
  for (const item of apiData) {
    const shoeId = item?.shoe_id ?? item?.id ?? item?.product_id
    const imagePath = shoeId != null ? await resolveImagePath(shoeId) : null
    if (!imagePath) console.warn('No matching image found for shoe_id', shoeId)
    results.push({ ...item, imagePath: imagePath || fallback })
  }
  return results
}