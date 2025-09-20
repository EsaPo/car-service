import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
/*export default defineConfig({
  plugins: [react()],
})
*/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1", // Set here IP-address of the host
    port: 5169,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:2995', // Set here IP-address of the host
        changeOrigin: true,
        secure: false
      }
    }
  }
});

