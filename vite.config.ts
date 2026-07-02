import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-oxc'
// Reproduces vitejs/vite#19819 on the Rolldown-powered Vite (Vite 8 / rolldown-vite).
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    minify: 'terser', // same minifier as issue #19819 "Exhibit 1"
    lib: { entry: 'src/App.tsx', formats: ['es'], fileName: 'app' },
    rollupOptions: { external: ['react', 'react/jsx-runtime'] },
  },
})
