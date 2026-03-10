// postcss.config.js (ESM)
import tailwindcssPostcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: [tailwindcssPostcss(), autoprefixer],
};
