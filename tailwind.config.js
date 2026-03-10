export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SUITE-Regular', 'system-ui', 'sans-serif'],
        // 또는 다른 폰트를 원한다면:
        // sans: ['Pretendard', 'system-ui', 'sans-serif'],
        // sans: ['Nanum Gothic', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        "custom-image": "url('./public/node.png')",
        "time-image": "url('./public/time.png')",
      },
    },
  },
  plugins: [],
};
