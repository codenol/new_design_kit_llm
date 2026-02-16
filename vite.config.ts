import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      uikit: path.resolve(__dirname, 'design-system/uikit'),
    },
  },
  server: {
    host: true,
    port: 5174,
    open: true,
  },
});
