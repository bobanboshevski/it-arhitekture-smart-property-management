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

// const isDev = process.env.NODE_ENV !== 'production';

// const mfeUrl = (base: string) =>
//     isDev ? `${base}/remoteEntry.js` : `${base}/assets/remoteEntry.js`;

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        federation({
            name: 'shell',
            remotes: {
                propertiesMfe: `${process.env.VITE_PROPERTIES_MFE_URL ?? 'http://localhost:3010'}/assets/remoteEntry.js`,
                bookingsMfe: `${process.env.VITE_BOOKINGS_MFE_URL ?? 'http://localhost:3020'}/assets/remoteEntry.js`,
                pricingMfe: `${process.env.VITE_PRICING_MFE_URL ?? 'http://localhost:3030'}/assets/remoteEntry.js`,

                // propertiesMfe: mfeUrl(
                //     process.env.VITE_PROPERTIES_MFE_URL ?? 'http://localhost:3010',
                // ),
                // bookingsMfe: mfeUrl(
                //     process.env.VITE_BOOKINGS_MFE_URL ?? 'http://localhost:3020',
                // ),
                // pricingMfe: mfeUrl(
                //     process.env.VITE_PRICING_MFE_URL ?? 'http://localhost:3030',
                // ),
            },
            shared: ['react', 'react-dom'],
        }),
    ],
    build: {target: 'esnext', minify: false, cssCodeSplit: false},
    server: {port: 3040, strictPort: true},
    preview: {port: 3040, strictPort: true},
});