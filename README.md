# 交易数据看板

一个用于展示和分析每日交易数据的可视化看板。

## 功能特性

- 📊 数据统计概览（总数、平均分、最高/最低分、分数分布）
- 📈 按最终得分（final_score_penalized）从高到低排序展示
- 🔍 点击查看详细信息
- 📝 Markdown 渲染支持（enhanced_map）
- 📅 支持多日期文件切换

## 安装和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 使用说明

1. 将每日生成的 `parallel_result_YYYYMMDD.tsv` 文件放入 `data/` 目录
2. 在 `src/components/FileSelector.jsx` 中添加新文件选项
3. 刷新页面，选择对应日期的文件即可查看数据

## 数据结构

看板会展示以下关键信息：
- **股票信息**：股票名称和代码
- **得分详情**：各项得分和最终得分
- **当日纪要**：CONTENT 字段内容
- **分析图谱**：enhanced_map（支持 Markdown）
- **推理过程**：reasoning_content

