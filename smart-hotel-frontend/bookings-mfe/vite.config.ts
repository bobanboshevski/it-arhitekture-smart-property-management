// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
//
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        federation({
            name: 'bookingsMfe',
            filename: 'remoteEntry.js',
            exposes: {'./App': './src/App.tsx'},
            shared: ['react', 'react-dom'],
        }),
    ],
    build: {target: 'esnext', minify: false, cssCodeSplit: false},
    preview: {port: 3020, strictPort: true},
    server: {port: 3020, strictPort: true, cors: true},
});
