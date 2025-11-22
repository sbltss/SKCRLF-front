import { promises as fs } from 'fs'
import path from 'path'

const projectRoot = path.resolve('.')
const assetsDir = path.resolve(projectRoot, 'src', 'assets')

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']

function extractIdFromName(name) {
  const base = name.replace(/\.[^.]+$/, '')
  const match = base.match(/\d+/)
  return match ? match[0] : null
}

async function processAssets() {
  const out = { processed_images: [], stats: { total_images: 0, successful_extractions: 0, assigned_numbers: 0, duplicates: 0 } }
  let seq = 1
  const seen = new Map()
  let entries
  try {
    entries = await fs.readdir(assetsDir, { withFileTypes: true })
  } catch (e) {
    console.error('Missing assets directory or permission error:', e?.message || e)
    return out
  }
  const files = entries.filter(d => d.isFile() && IMAGE_EXTS.includes(path.extname(d.name).toLowerCase()))
  out.stats.total_images = files.length
  for (const f of files) {
    const filename = f.name
    const ext = path.extname(filename).toLowerCase()
    const relPath = path.join('src', 'assets', filename)
    let id = extractIdFromName(filename)
    if (!id) {
      console.warn('No numeric id in filename, assigning sequential number:', filename)
      id = String(seq++)
      out.stats.assigned_numbers++
    } else {
      out.stats.successful_extractions++
    }
    const dup = seen.has(id)
    if (dup) out.stats.duplicates++
    seen.set(id, true)
    out.processed_images.push({ filename, shoe_id: id, filepath: relPath, duplicate: dup })
  }
  return out
}

processAssets().then((json) => {
  console.log(JSON.stringify(json, null, 2))
}).catch((e) => {
  console.error('Failed to process assets:', e?.message || e)
})