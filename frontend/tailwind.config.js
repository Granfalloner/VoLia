module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  daisyui: {
    themes: [
      {
        mytheme: {
          ...require('daisyui/src/colors/themes')['[data-theme=light]'],
          neutral: '#7C3AED',
          'base-100': '#FBFBFF',
        },
      },
    ],
  },
  plugins: [require('daisyui')],
};
