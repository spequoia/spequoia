import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Spequoia",
  description: "A specification format for web applications",
  base: "/spequoia/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide" },
      { text: "Example", link: "/example" },
      { text: "Schema", link: "/schema" }
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is Spequoia", link: "/guide" },
          { text: "Example", link: "/example" },
          { text: "Schema", link: "/schema" }
        ]
      }
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/spequoia/spequoia" }]
  }
});
