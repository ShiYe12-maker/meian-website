const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
  // 自动为 HTML 中的 href/src 添加 pathPrefix（GitHub Pages 项目托管必需）
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // 复制静态资源到 _site/（仅站点实际引用的资源）
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("final");
  eleventyConfig.addPassthroughCopy("inputs/inputsF");
  eleventyConfig.addPassthroughCopy("inputs/IMG_20260704_151528.jpg");

  // dump filter: JSON.stringify for Nunjucks templates
  eleventyConfig.addFilter("dump", function (obj) {
    return JSON.stringify(obj);
  });

  // findById filter: 按ID查找人物（用于关系图谱等）
  eleventyConfig.addFilter("findById", function (arr, id) {
    if (!arr) return null;
    return arr.find(function (item) { return item.id === id; });
  });

  // 忽略工具目录和文档
  eleventyConfig.ignores.add("docs/");
  eleventyConfig.ignores.add(".claude/");
  eleventyConfig.ignores.add("**/.git/**");

  return {
    // 默认无前缀；GitHub Actions 构建时通过 --pathprefix 覆盖
    pathPrefix: "/",
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // 使用 Nunjucks 作为 Markdown 和 HTML 的模板引擎（而非 Liquid）
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
