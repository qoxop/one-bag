const autoprefixer = require("autoprefixer");

module.exports = {
  plugins: [
    // 兼容浏览器，添加前缀
    autoprefixer({
      grid: true,
    }),

  ],
}
