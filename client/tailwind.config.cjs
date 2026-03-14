// tailwind.config.js
module.exports = {
  darkMode: "class", // or 'media' if preferred
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        'chatbot-bounce': {
          '0%, 20%, 100%': { transform: 'translateY(0)' },
          '10%': { transform: 'translateY(-12px)' },
          '15%': { transform: 'translateY(0)' },
          '17.5%': { transform: 'translateY(-6px)' }
        }
      },
      animation: {
        'chatbot-bounce': 'chatbot-bounce 5s infinite ease-in-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
