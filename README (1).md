# 体育赛事榜单资讯站 - GitHub Pages 部署文档

## 项目简介
纯原生 HTML + CSS + JavaScript 实现的综合体育赛事榜单资讯站点。含 6 个模块：综合体育资讯 / 足球三大联赛积分榜（英超、西甲、中超）/ NBA 东西部 + CBA / ATP & WTA 网球排名 / LPL & KPL 电竞赛事积分 / 近期赛程表。每日自动刷新数据，保持内容新鲜。

## 功能特性
- ✅ 原生 HTML/CSS/JS，零框架依赖
- ✅ 暗色/浅色主题切换，记忆偏好
- ✅ 6 大 Tab 模块切换：资讯 / 足球 / 篮球 / 网球 / 电竞 / 赛程
- ✅ 站内关键词搜索：搜索球队、球员、赛事、资讯标题
- ✅ 积分榜 Top3 金银铜奖牌高亮，欧冠区/保级区彩色区分
- ✅ 球队 Logo 渐变首字母占位图（无需图片资源，不占体积）
- ✅ 近 5 场战绩色点（W/D/L 红绿灰）
- ✅ 响应式表格（移动端左右横滑）
- ✅ GitHub Actions 每日自动对数据做小幅扰动，保持积分榜动态变化
- ✅ 本地 data/data.json，零跨域问题

## 目录结构
```
web14/
├── index.html
├── css/style.css
├── js/app.js
├── data/data.json          # 资讯 + 五大积分榜 + 赛程
└── .github/workflows/deploy.yml
```

## 部署步骤

### 方案 A：独立仓库（推荐）
1. GitHub 新建 **Public 仓库**，例如 `sports-info`。
2. 将 **web14 目录下所有内容**原样拷贝到仓库根目录（隐藏目录 `.github` 必须一起上传）。
3. 仓库 → **Settings** → **Pages** → **Build and deployment**：
   - **Source** 选择 `GitHub Actions`。
4. 手动触发构建：**Actions** → `Daily Sports Data and Deploy` → `Run workflow` → main。
5. 2~4 分钟后访问：`https://<用户名>.github.io/<仓库名>/`。

### 方案 B：子目录（整库一起推）
整个 yuanmadaquan 推到 GitHub 时，工作流设置 `folder: web14` 会自动只部署 web14 目录。仍需在仓库 Settings → Pages → Source 选 `GitHub Actions`。

## 防止静态资源 404 关键配置（全部已内置）
1. **全站相对路径**：index.html 使用 `./css/`、`./js/`、`./data/`。
2. **`fetch` 自动带 base**：app.js 会自动识别 `<base>` 标签前缀，保证子路径部署 data.json 也能加载。
3. **纯 Actions 方式部署**：无需 `gh-pages` 分支；无需 `.nojekyll`。
4. **不使用外链 CSS/JS 依赖**：全站无 CDN 依赖，离线也能显示。

## 每日自动更新说明
- Cron：`10 2 * * *` = UTC 02:10 = 北京时间 10:10 每天一次。
- `refresh_sports.py`：
  - 对积分榜数据做小幅扰动（胜场、积分、胜率随机 ±1 或 ±2%），模拟赛季中排名变化。
  - 排名按积分/胜率重排。
  - 网球 ATP/WTA 积分随机微调。
  - 已过期赛程自动顺延 7 天，保持时间一直是「未来」。
  - 前 3 条资讯日期改为最近 3 天。
  - 更新 `lastUpdate` 时间戳。

## 如何接入真实数据
把 `refresh_sports.py` 改成请求真实体育 API 再写回 data.json 即可。推荐免费接口：
- 足球 API：football-data.org（免费额度）
- NBA 数据：balldontlie.io（免费 Key）
- 网球：sportmonks.com（免费额度）
- 国内赛事：可爬取懂球帝、虎扑公开榜单页面

## 本地预览
```bash
python3 -m http.server 8080 -d web14
# 或
npx serve web14
```
浏览器打开 http://localhost:8080/ 。

## 常见问题

**Q: 积分榜表格在手机上显示不全？**
A: 这是预期行为，表格外层 `.table-wrap` 有 `overflow-x: auto`，左右滑动即可查看全部列。列宽控制在 `rank-table { min-width }`，可自行调大。

**Q: 球队图标能不能换成真实 Logo？**
A: 修改 data.json，给每支球队加 `"logo": "https://cdn.example/logo.png"`；再改 style.css 中 `.team-logo` 规则，用 `background-image` 代替渐变色即可。

**Q: 想改成中文球队全名+英文名？**
A: data.json 中 `team` 字段可直接写 `曼城 Manchester City`，app.js `initial` 会取前 2 字作为图标，无需改代码。

**Q: 切换主题后刷新失效？**
A: 主题设置保存在 `localStorage` 的 `sports_theme` 键下。若出现异常，可执行 `localStorage.removeItem('sports_theme')` 重置。
