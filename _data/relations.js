// 人物关系边
// source 和 target 对应 characters.js 中的 id
// type: "师生" | "同志" | "同届" | "亲属"
//
// ⚠️ 以下关系为团队根据公开史料整理的初稿，正式发布前须经校史专家审核。

module.exports = [
  // 团二大相关（1923年8月，梅庵）
  { source: "mzd", target: "dzx", type: "同志" },
  { source: "mzd", target: "zqb", type: "同志" },
  { source: "dzx", target: "zqb", type: "同志" },
  { source: "dzx", target: "lyn", type: "同志" },
  { source: "lrj", target: "dzx", type: "同志" },
  { source: "lrj", target: "mzd", type: "同志" },

  // 青年团早期领导传承
  { source: "sct", target: "lrj", type: "同志" },

  // 林氏兄弟（湖北黄冈，堂兄弟）
  { source: "lyy", target: "lyn", type: "亲属" },
];
