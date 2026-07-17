module.exports = function (eleventyConfig) {
  // 复制静态资源到 _site/
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("final");
  eleventyConfig.addPassthroughCopy("inputs");

  // 忽略工具目录和文档
  eleventyConfig.ignores.add("docs/");
  eleventyConfig.ignores.add(".claude/");
  eleventyConfig.ignores.add("**/.git/**");

  return {
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
