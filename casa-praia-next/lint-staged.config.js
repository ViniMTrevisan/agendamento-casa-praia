module.exports = {
  // Roda o type-check nos arquivos TS/TSX
  '*.{ts,tsx}': () => 'npm run build',
  
  // Roda o ESLint (com --fix) nos arquivos de código
  '*.{js,jsx,ts,tsx}': 'eslint --fix',
  
  // Roda o Prettier (format) em todos os arquivos
  '*.{js,jsx,ts,tsx,css,md}': 'prettier --write'
};