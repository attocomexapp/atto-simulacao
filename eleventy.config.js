import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function youtubeId(url) {
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function embed(url, formato) {
  if (!url) return "";
  const id = youtubeId(url);
  const vertical = formato === "vertical" || /\/shorts\//.test(url);
  const cls = "video" + (vertical ? " vertical" : "");
  if (id) {
    return `<div class="${cls}"><iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="Vídeo" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  return `<div class="${cls}"><video src="${url}" controls playsinline preload="metadata"></video></div>`;
}

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/**");

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/blog/posts/*.md").filter((p) => !p.data.rascunho)
  );

  eleventyConfig.addFilter("dataBR", (d) => {
    const x = new Date(d);
    return `${x.getUTCDate()} ${MESES[x.getUTCMonth()]} ${x.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("tempoLeitura", (html) =>
    Math.max(1, Math.round(String(html).replace(/<[^>]+>/g, " ").split(/\s+/).length / 200))
  );
  eleventyConfig.addFilter("videoEmbed", embed);

  // Um link de YouTube sozinho num parágrafo do texto vira vídeo embutido
  eleventyConfig.addTransform("youtube-no-texto", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(
      /<p>\s*(?:<a[^>]*>)?(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s<]+)(?:<\/a>)?\s*<\/p>/g,
      (_, url) => embed(url.replace(/&amp;/g, "&"))
    );
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
