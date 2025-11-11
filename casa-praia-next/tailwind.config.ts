import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    // Aponta para todos os arquivos dentro da pasta 'src'
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    // Você pode adicionar './components/**/*.{js,ts,jsx,tsx,mdx}' se criar essa pasta
  ],
  theme: {
    extend: {
      // Você pode adicionar suas extensões de tema aqui
    },
  },
  plugins: [],
};
export default config;