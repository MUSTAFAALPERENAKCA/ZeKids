import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import postcssJitProps from 'postcss-jit-props';
import OpenProps from 'open-props';


export default defineConfig(() => ({
  base: '/Koirodoku/',
  css: {
    postcss: {
      plugins: [postcssJitProps(OpenProps)]
    }
  },
  plugins: [solidPlugin()]
}));


