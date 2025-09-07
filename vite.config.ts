import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa'; 

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Slate',
        short_name: 'Slate',
        description: 'A live, fast timetable for your campus schedule.',
        theme_color: '#000000', 
        background_color: '#000000', 
        icons: [
          {
            src: 'pwa-192x192.png', 
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});