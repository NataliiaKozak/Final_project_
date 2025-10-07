// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react-swc';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// });

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import path from "path";

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "src")
//     }
//   },
//   server: {
//     port: 3000
//   }
// });


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import path from "node:path";
// import { fileURLToPath } from "node:url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

export default defineConfig({
  server: { host: true, port: 3001 },
  plugins: [react()],
  // resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  // server: { port: 3001 }
});
