import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],

  server: {
    proxy: {
      "/api": {
        target: "https://blog-gej1.onrender.com", // Your backend URL
        changeOrigin: true,
        secure: true,
      },
    },
  },
  
});
