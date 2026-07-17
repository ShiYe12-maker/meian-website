module.exports = function (eleventyConfig) {
  // 复制静态资源到 _site/
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("final");
  eleventyConfig.addPassthroughCopy("inputs");

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
