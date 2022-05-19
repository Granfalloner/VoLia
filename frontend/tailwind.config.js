module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  daisyui: {
    themes: [
      {
        mytheme: {
          neutral: '#7C3AED',
          'base-100': '#E5E5E5',
        },
      },
    ],
  },
  plugins: [require('daisyui')],
};