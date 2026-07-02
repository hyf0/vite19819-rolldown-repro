# vitejs/vite#19819 — verification on Rolldown-powered Vite (Vite 8 / rolldown-vite)

**Question:** does the "sourcemap combine maps `return` to the wrong place" bug
(vitejs/vite#19819, related to rollup#5955) still happen when Vite runs on Rolldown?

**Answer (this repro): No.** The minified `return` maps back to the source `return`.

## Setup
- `vite` = `npm:rolldown-vite@^7.3.1` (the Vite 7→8 bridge; Vite 8 uses Rolldown natively)
- bundled `rolldown@1.0.0-beta.53`
- `@vitejs/plugin-react-oxc` (oxc-based JSX transform)
- `minify: 'terser'` — the same minifier as issue #19819 "Exhibit 1"
- source: `src/App.tsx` = a React component whose body is `... return <div>{'.'}</div>`

## Reproduce
```
npm install
npm run build
node verify.mjs
```

## Result
```
minified "return" at generated (0:87)
  -> maps to ../src/App.tsx (7:2)
  -> that source line is: "  return <div>{'.'}</div>"
  ✅ maps to `return` (correct)
```
Minified output (`dist/app.js`), one line:
```
...function o(){return r(()=>{console.log("ReplayAnalyze")},[]),/* @__PURE__ */e("div",{children:"."})}...
```
The `return` keyword (generated column 87) maps to source line 7 `return` — **not** to `<`
(the Rollup bug in #19819) and **not** to `React.` (the esbuild bug).

## Visual check
Open https://evanw.github.io/source-map-visualization/ and drag `app.inline.js`
onto it (it has the sourcemap inlined). Click the minified `return` — it highlights the
source `return`.

## Notes
- This is fixed by Rolldown's own sourcemap pipeline (oxc transform + Rolldown's `collapse`,
  which already fixes rollup#5955), independent of rolldown PR #10074 / oxc-sourcemap PR #392
  (those address a different bug, vitejs's dependency rolldown#10070).
- Issue #19819 "Exhibit 2" is an upstream **esbuild** minifier bug; rolldown-vite defaults to
  the oxc minifier and does not hit it.
