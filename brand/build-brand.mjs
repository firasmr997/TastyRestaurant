// Builds the Tasty identity assets: SVG logos (outlined, font-independent), favicons, OG image and
// the path data used by the React <Logo> components.
import opentype from 'opentype.js'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

import { fileURLToPath } from 'node:url'

// Run from /brand: `npm install && npm run build`. Writes into ../frontend/public and ../frontend/src.
const HERE = path.dirname(fileURLToPath(import.meta.url))
const FE = path.resolve(HERE, '../frontend')
const PUB = `${FE}/public`
const BRAND = `${PUB}/brand`
fs.mkdirSync(BRAND, { recursive: true })

const C = {
  pickle: '#1F4D3A',
  pickleDeep: '#163829',
  tomato: '#D63B20',
  tomatoBright: '#E8482C',
  mustard: '#F4B41A',
  paper: '#FFFDF8',
  ink: '#15201B',
}

const load = (p) => opentype.parse(fs.readFileSync(p).buffer)
const inline900 = load(`${HERE}/node_modules/@fontsource/big-shoulders-inline-display/files/big-shoulders-inline-display-latin-900-normal.woff`)
const solid900 = load(`${HERE}/node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-900-normal.woff`)
const solid800 = load(`${HERE}/node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-800-normal.woff`)

const r = (n) => Math.round(n * 100) / 100

/** Serialises opentype path commands (its own formatter emits NaN for some coordinates). */
function pathData(p) {
  const f = (n) => {
    const v = Math.round(n * 100) / 100
    return Object.is(v, -0) ? '0' : String(v)
  }
  return p.commands
    .map((c) => {
      switch (c.type) {
        case 'M': return `M${f(c.x)} ${f(c.y)}`
        case 'L': return `L${f(c.x)} ${f(c.y)}`
        case 'Q': return `Q${f(c.x1)} ${f(c.y1)} ${f(c.x)} ${f(c.y)}`
        case 'C': return `C${f(c.x1)} ${f(c.y1)} ${f(c.x2)} ${f(c.y2)} ${f(c.x)} ${f(c.y)}`
        case 'Z': return 'Z'
        default: return ''
      }
    })
    .join('')
}

/** Outlined text: returns path data with the cap tops at y=0, plus its width. */
function textPath(font, text, capHeight, tracking = 0) {
  const capUnits = font.charToGlyph('H').getBoundingBox().y2
  const size = (capHeight / capUnits) * font.unitsPerEm
  let x = 0
  const parts = []
  for (const ch of text) {
    const glyph = font.charToGlyph(ch)
    if (ch !== ' ') parts.push(pathData(glyph.getPath(x, capHeight, size)) + 'Z')
    x += (glyph.advanceWidth / font.unitsPerEm) * size + tracking
  }
  return { d: parts.join(' ').replace(/ZZ/g, 'Z'), width: r(x - tracking), height: capHeight }
}

/** One glyph centred on (cx, cy). */
function centredGlyph(font, ch, cx, cy, capHeight) {
  const glyph = font.charToGlyph(ch)
  const box = glyph.getBoundingBox()
  const size = (capHeight / (box.y2 - box.y1)) * font.unitsPerEm
  const scale = size / font.unitsPerEm
  const x = cx - ((box.x2 - box.x1) * scale) / 2 - box.x1 * scale
  return pathData(glyph.getPath(x, cy + capHeight / 2, size)) + 'Z'
}

/** Text set along a circle arc (top arc reads clockwise, bottom arc counter-clockwise). */
function arcText(font, text, { cx, cy, radius, capHeight, tracking, position }) {
  const capUnits = font.charToGlyph('H').getBoundingBox().y2
  const size = (capHeight / capUnits) * font.unitsPerEm
  const glyphs = [...text].map((ch) => ({ ch, glyph: font.charToGlyph(ch), adv: (font.charToGlyph(ch).advanceWidth / font.unitsPerEm) * size }))
  const total = glyphs.reduce((sum, g) => sum + g.adv + tracking, -tracking)
  const top = position === 'top'
  const textRadius = top ? radius : radius + capHeight
  const arc = total / textRadius
  let angle = top ? -Math.PI / 2 - arc / 2 : Math.PI / 2 + arc / 2
  const out = []
  for (const g of glyphs) {
    const mid = top ? angle + g.adv / 2 / textRadius : angle - g.adv / 2 / textRadius
    const gx = cx + textRadius * Math.cos(mid)
    const gy = cy + textRadius * Math.sin(mid)
    const rotate = ((mid * 180) / Math.PI) + (top ? 90 : -90)
    if (g.ch !== ' ') {
      const d = pathData(g.glyph.getPath(-g.adv / 2, top ? 0 : capHeight, size)) + 'Z'
      out.push(`<path transform="translate(${r(gx)} ${r(gy)}) rotate(${r(rotate)})" d="${d}"/>`)
    }
    angle = top ? angle + (g.adv + tracking) / textRadius : angle - (g.adv + tracking) / textRadius
  }
  return out.join('')
}

// ---- Mark: a round produce sticker with a bite out of its edge and an inline T ----------------
const BITE = '<circle cx="104" cy="17" r="15"/><circle cx="89" cy="5" r="10"/><circle cx="116" cy="33" r="10"/>'
const T_INLINE = centredGlyph(inline900, 'T', 60, 62, 66)
const T_SOLID = centredGlyph(solid900, 'T', 60, 62, 64)

function mark({ fill, letter, ring, small = false, id }) {
  const t = small ? T_SOLID : T_INLINE
  const ringEl = ring ? `<circle cx="60" cy="60" r="58" fill="${ring}"/>` : ''
  return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120"><rect width="120" height="120" fill="#fff"/><g fill="#000">${BITE}</g></mask></defs>` +
    `<g mask="url(#${id})">${ringEl}<circle cx="60" cy="60" r="${ring ? 53 : 58}" fill="${fill}"/><path d="${t}" fill="${letter}"/></g>`
}

const svgDoc = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`

// ---- Wordmarks --------------------------------------------------------------------------------
const WORD_INLINE = textPath(inline900, 'TASTY', 100, 6)
const WORD_SOLID = textPath(solid900, 'TASTY', 100, 5)
const SUB = textPath(solid800, 'KITCHEN & GRILL', 16, 3.2)

// Primary logo: mark + inline wordmark (horizontal lockup)
function primary({ ink, markFill, markLetter, id }) {
  const markSize = 112
  const gap = 22
  const wx = markSize + gap
  const width = r(wx + WORD_INLINE.width)
  const body =
    `<svg x="0" y="0" width="${markSize}" height="${markSize}" viewBox="0 0 120 120">${mark({ fill: markFill, letter: markLetter, id })}</svg>` +
    `<path transform="translate(${wx} 6)" fill="${ink}" d="${WORD_INLINE.d}"/>`
  return { width, height: 112, body }
}

// Secondary logo: round seal for social avatars, packaging and stickers
function seal({ fill, ink, accent, id }) {
  const body =
    `<circle cx="150" cy="150" r="148" fill="${C.paper}"/>` +
    `<circle cx="150" cy="150" r="138" fill="${fill}"/>` +
    `<circle cx="150" cy="150" r="128" fill="none" stroke="${accent}" stroke-width="3"/>` +
    `<circle cx="150" cy="150" r="121" fill="none" stroke="${accent}" stroke-width="1.2"/>` +
    `<g fill="${accent}">${arcText(solid800, 'BURGERS · SANDWICHES · GRILL', { cx: 150, cy: 150, radius: 98, capHeight: 15, tracking: 3.4, position: 'top' })}</g>` +
    `<g fill="${accent}">${arcText(solid800, 'BUILT LAYER BY LAYER', { cx: 150, cy: 150, radius: 98, capHeight: 15, tracking: 3.4, position: 'bottom' })}</g>` +
    `<svg x="112" y="78" width="76" height="76" viewBox="0 0 120 120">${mark({ fill: C.tomato, letter: C.paper, ring: C.paper, id })}</svg>` +
    `<path transform="translate(${r(150 - (WORD_SOLID.width * 0.56) / 2)} 168) scale(0.56)" fill="${ink}" d="${WORD_SOLID.d}"/>`
  return { width: 300, height: 300, body }
}

const files = {}
const p1 = primary({ ink: C.pickle, markFill: C.tomato, markLetter: C.paper, id: 'tasty-bite' })
files['tasty-logo-primary.svg'] = svgDoc(p1.width, p1.height, p1.body, 'Tasty')
const p2 = primary({ ink: C.paper, markFill: C.mustard, markLetter: C.ink, id: 'tasty-bite' })
files['tasty-logo-primary-reverse.svg'] = svgDoc(p2.width, p2.height, p2.body, 'Tasty')
files['tasty-wordmark.svg'] = svgDoc(WORD_SOLID.width, 100, `<path fill="${C.pickle}" d="${WORD_SOLID.d}"/>`, 'Tasty')
files['tasty-wordmark-inline.svg'] = svgDoc(WORD_INLINE.width, 100, `<path fill="${C.pickle}" d="${WORD_INLINE.d}"/>`, 'Tasty')
files['tasty-mark.svg'] = svgDoc(120, 120, mark({ fill: C.tomato, letter: C.paper, id: 'tasty-bite' }), 'Tasty')
files['tasty-mark-sticker.svg'] = svgDoc(120, 120, mark({ fill: C.tomato, letter: C.paper, ring: C.paper, id: 'tasty-bite' }), 'Tasty')
const s1 = seal({ fill: C.pickle, ink: C.paper, accent: C.mustard, id: 'tasty-bite' })
files['tasty-seal.svg'] = svgDoc(300, 300, s1.body, 'Tasty seal')
const favicon = svgDoc(120, 120, mark({ fill: C.tomato, letter: C.paper, small: true, id: 'fav-bite' }), 'Tasty')

for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(BRAND, name), content)
fs.writeFileSync(path.join(PUB, 'favicon.svg'), favicon)

// ---- Rasters ----------------------------------------------------------------------------------
// Every raster records how it was made in an "impeccable:prompt" text slot (PNG tEXt chunk, JPEG COM
// segment), so its origin travels with the file.
const PROVENANCE =
  'Rendered by brand/build-brand.mjs with sharp from the Tasty brand SVGs; lettering outlined from Big Shoulders (SIL OFL). Not AI-generated.'
const KEYWORD = 'impeccable:prompt'
function embedProvenance(file, what) {
  const text = `${what} ${PROVENANCE}`
  const buf = fs.readFileSync(file)
  if (buf.readUInt32BE(0) === 0x89504e47) {
    const data = Buffer.concat([Buffer.from(`${KEYWORD} `, 'latin1'), Buffer.from(text, 'utf8')])
    const chunk = Buffer.alloc(12 + data.length)
    chunk.writeUInt32BE(data.length, 0)
    chunk.write('tEXt', 4, 'ascii')
    data.copy(chunk, 8)
    chunk.writeUInt32BE(zlib.crc32(chunk.subarray(4, 8 + data.length)), 8 + data.length)
    const iend = buf.lastIndexOf(Buffer.from('IEND', 'ascii')) - 4
    fs.writeFileSync(file, Buffer.concat([buf.subarray(0, iend), chunk, buf.subarray(iend)]))
  } else {
    const segment = Buffer.from(`${KEYWORD} ${text}`, 'utf8')
    const com = Buffer.alloc(4 + segment.length)
    com.writeUInt16BE(0xfffe, 0)
    com.writeUInt16BE(segment.length + 2, 2)
    segment.copy(com, 4)
    fs.writeFileSync(file, Buffer.concat([buf.subarray(0, 2), com, buf.subarray(2)]))
  }
}
const png = async (svg, out, size, what) => {
  await sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png().withMetadata().toFile(out)
  embedProvenance(out, what)
}
await png(favicon, path.join(PUB, 'favicon-32.png'), 32, 'Tasty favicon (32 px): the bitten round sticker mark with a solid T, tomato on transparent.')
const touch = svgDoc(180, 180, `<rect width="180" height="180" fill="${C.pickle}"/><svg x="18" y="18" width="144" height="144" viewBox="0 0 120 120">${mark({ fill: C.tomato, letter: C.paper, ring: C.paper, id: 't' })}</svg>`, 'Tasty')
await png(touch, path.join(PUB, 'apple-touch-icon.png'), 180, 'Tasty home-screen icon (180 px): the sticker mark with a label-white ring on a pickle-green field.')
const icon512 = svgDoc(512, 512, `<rect width="512" height="512" rx="96" fill="${C.pickle}"/><svg x="56" y="56" width="400" height="400" viewBox="0 0 120 120">${mark({ fill: C.tomato, letter: C.paper, ring: C.paper, id: 'i' })}</svg>`, 'Tasty')
await png(icon512, path.join(PUB, 'icon-512.png'), 512, 'Tasty app icon (512 px): the ringed sticker mark on a rounded pickle-green square.')

// Open Graph card 1200x630: pickle field, double-rule label frame, mark, inline wordmark, tagline.
const ogWord = 1.9
const og = svgDoc(1200, 630,
  `<rect width="1200" height="630" fill="${C.pickle}"/>` +
  `<rect x="34" y="34" width="1132" height="562" fill="none" stroke="${C.mustard}" stroke-width="6"/>` +
  `<rect x="50" y="50" width="1100" height="530" fill="none" stroke="${C.mustard}" stroke-width="2"/>` +
  `<svg x="96" y="196" width="238" height="238" viewBox="0 0 120 120">${mark({ fill: C.tomato, letter: C.paper, ring: C.paper, id: 'og' })}</svg>` +
  `<path transform="translate(392 196) scale(${ogWord})" fill="${C.paper}" d="${WORD_INLINE.d}"/>` +
  `<path transform="translate(396 430) scale(1.55)" fill="${C.mustard}" d="${SUB.d}"/>`,
  'Tasty')
await sharp(Buffer.from(og)).jpeg({ quality: 88 }).withMetadata().toFile(path.join(PUB, 'og-image.jpg'))
embedProvenance(
  path.join(PUB, 'og-image.jpg'),
  'Tasty Open Graph card (1200x630): pickle field, mustard double-rule label frame, sticker mark, inline TASTY wordmark, KITCHEN & GRILL line.',
)

// ---- React path data ----------------------------------------------------------------------------
const ts = `// Generated from the Big Shoulders typefaces (SIL Open Font License) by the brand build script.
// Outlined so the logo renders identically everywhere, before any web font has loaded.

export const MARK_BITE = ${JSON.stringify(BITE)}
export const MARK_T_INLINE = ${JSON.stringify(T_INLINE)}
export const MARK_T_SOLID = ${JSON.stringify(T_SOLID)}

/** "TASTY" in Big Shoulders Inline, cap height 100. */
export const WORDMARK_INLINE = { d: ${JSON.stringify(WORD_INLINE.d)}, width: ${WORD_INLINE.width}, height: 100 }
/** "TASTY" in Big Shoulders Display Black, cap height 100. */
export const WORDMARK_SOLID = { d: ${JSON.stringify(WORD_SOLID.d)}, width: ${WORD_SOLID.width}, height: 100 }
`
fs.mkdirSync(`${FE}/src/components/brand`, { recursive: true })
fs.writeFileSync(`${FE}/src/components/brand/logoPaths.ts`, ts)

// ---- Preview sheet for review -----------------------------------------------------------------
const preview = svgDoc(1400, 900,
  `<rect width="1400" height="900" fill="${C.paper}"/>` +
  `<svg x="40" y="40" width="${p1.width * 0.6}" height="${112 * 0.6}" viewBox="0 0 ${p1.width} 112">${p1.body}</svg>` +
  `<rect x="0" y="150" width="1400" height="140" fill="${C.pickle}"/>` +
  `<svg x="40" y="185" width="${p2.width * 0.6}" height="${112 * 0.6}" viewBox="0 0 ${p2.width} 112">${p2.body}</svg>` +
  `<svg x="40" y="320" width="300" height="300" viewBox="0 0 300 300">${s1.body}</svg>` +
  `<svg x="380" y="340" width="200" height="200" viewBox="0 0 120 120">${mark({ fill: C.tomato, letter: C.paper, id: 'pv1' })}</svg>` +
  `<svg x="620" y="340" width="200" height="200" viewBox="0 0 120 120">${mark({ fill: C.tomato, letter: C.paper, small: true, id: 'pv2' })}</svg>` +
  `<svg x="860" y="340" width="32" height="32" viewBox="0 0 120 120">${mark({ fill: C.tomato, letter: C.paper, small: true, id: 'pv3' })}</svg>` +
  `<svg x="910" y="340" width="16" height="16" viewBox="0 0 120 120">${mark({ fill: C.tomato, letter: C.paper, small: true, id: 'pv4' })}</svg>` +
  `<path transform="translate(40 660) scale(0.9)" fill="${C.ink}" d="${WORD_SOLID.d}"/>` +
  `<path transform="translate(420 680) scale(2.2)" fill="${C.tomato}" d="${SUB.d}"/>`,
  'preview')
await sharp(Buffer.from(preview)).png().toFile(path.join(HERE, 'brand-sheet.png'))
embedProvenance(
  path.join(HERE, 'brand-sheet.png'),
  'Tasty brand review sheet: primary lockups (light and reversed), seal, mark at 200/32/16 px, solid wordmark.',
)
console.log('brand built:', Object.keys(files).length, 'svgs, 5 rasters with provenance')
