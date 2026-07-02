// Zero-dependency check: does the minified `return` map back to source `return`?
// Usage: node verify.mjs
import { readFileSync } from 'node:fs'
const code = readFileSync('dist/app.js', 'utf8')
const map = JSON.parse(readFileSync('dist/app.js.map', 'utf8'))
const B = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const dec = (s) => { const r = []; let sh = 0, v = 0; for (const c of s) { let d = B.indexOf(c); const k = d & 32; d &= 31; v += d << sh; if (k) sh += 5; else { r.push(v & 1 ? -(v >> 1) : v >> 1); v = 0; sh = 0 } } return r }
let gl = 0, src = 0, sl = 0, sc = 0; const toks = []
for (const line of map.mappings.split(';')) { let gc = 0; for (const seg of line.split(',').filter(Boolean)) { const v = dec(seg); gc += v[0]; if (v.length >= 4) { src += v[1]; sl += v[2]; sc += v[3]; toks.push([gl, gc, src, sl, sc]) } } gl++ }
const lines = code.split('\n')
for (let li = 0; li < lines.length; li++) {
  for (let m; (m = /return/g.exec(lines[li]));) {
    const col = m.index
    let cover = null
    for (const t of toks) if (t[0] === li && t[1] <= col && (!cover || t[1] > cover[1])) cover = t
    const srcLine = map.sourcesContent?.[cover[2]]?.split('\n')[cover[3]] ?? '?'
    console.log(`minified "return" at generated (${li}:${col})`)
    console.log(`  -> maps to ${map.sources[cover[2]]} (${cover[3]}:${cover[4]})`)
    console.log(`  -> that source line is: ${JSON.stringify(srcLine)}`)
    console.log(srcLine.trimStart().startsWith('return') ? '  ✅ maps to `return` (correct)' : '  ❌ does NOT map to `return`')
    break
  }
}
