import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**"],
    // Plain <a> links do a full page load, which the site's scroll/menu script relies on.
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
];

export default config;
