export default {
  plugins: {
    // Tailwind CSS
    'tailwindcss': {},

    // Autoprefixer - Fixed grid configuration
    'autoprefixer': {
      flexbox: 'no-2009',
      // Remove the problematic grid: 'autoplace' setting
      // or set it properly:
      grid: false, // Disable grid autoplacement to avoid warnings
    },

    // PostCSS Import
    'postcss-import': {},

    // PostCSS Nested
    'postcss-nested': {},
  },
};