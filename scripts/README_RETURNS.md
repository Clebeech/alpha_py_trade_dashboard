# 收益率数据功能说明

## 功能概述

为 `parallel_result` TSV 文件自动添加当日收益率数据，并在前端看板中展示收益率、相关性分析等指标。

## 核心脚本

### `add_returns.py`

自动为 TSV 文件添加收益率数据。

**使用方法：**

```bash
# 处理单个文件
conda run -n pioneer python scripts/add_returns.py --file public/data/parallel_result_20260108.tsv

# 处理所有文件
conda run -n pioneer python scripts/add_returns.py --all
```

**功能说明：**
- 从文件名提取日期（如 `parallel_result_20260108.tsv` → `20260108`）
- 从价格数据库 `/home/shared/data/raw/market/daily_k_data_hfq.parquet` 中读取该日期的收益率
- 为每条记录匹配股票代码，计算平均收益率（如果有多只股票）
- 添加 `return` 列（平均收益率）和 `return_valid_codes` 列（有效股票代码）
- 仅匹配 A 股（.SH 和 .SZ），自动过滤港股和北交所

## 前端展示功能

### 1. Statistics 卡片

新增三个统计卡片：
- **平均收益率**：所有有收益率数据的记录的平均值，绿色/红色显示涨跌
- **收益率区间**：最小值 ~ 最大值
- **评分-收益相关性**：皮尔逊相关系数，评估评分与实际收益的相关性
  - |r| > 0.5：强相关
  - 0.3 < |r| ≤ 0.5：中等相关
  - |r| ≤ 0.3：弱相关

### 2. DataList 排序

新增排序按钮：
- **按评分排序**（默认）：按 `final_score_penalized` 降序
- **按收益率排序**：按 `return` 降序，无收益率的记录排在最后

每个列表项显示：
- 评分（大字体，颜色编码）
- 收益率（如果有，绿色/红色，带 +/- 符号）

### 3. DataDetail 详情页

在股票核心概览区域显示：
- 最终得分
- **当日收益率**（如果有，带趋势图标和颜色）

## 数据更新流程

### 方案一：定期批量更新

使用 cron job 定期处理所有文件：

```bash
# 每天晚上 19:00 更新所有文件的收益率
0 19 * * * conda run -n pioneer python /home/shared/alpha_py_trade_dashboard/scripts/add_returns.py --all >> /home/shared/data/logs/add_returns.log 2>&1
```

### 方案二：实时更新（推荐）

在 `run_parallel_pipeline.sh` 中，当 `--is-for-trade` 模式运行时，自动在保存到 dashboard 后添加收益率。

**注意：** 此功能需要在 `parallel_pipeline.py` 中添加调用 `add_returns.py` 的代码。

## 数据格式

### 新增列

- `return`: 平均收益率（百分比，如 `2.35` 表示 2.35%）
- `return_valid_codes`: 有效匹配的股票代码（逗号分隔，如 `600031.SH,000425.SZ`）

### 示例

```tsv
identified_stock_codes	return	return_valid_codes
688012.SH,601138.SH	1.23	688012.SH,601138.SH
600031.SH,1316.HK	2.45	600031.SH
```

## 注意事项

1. **价格数据依赖**：需要确保 `/home/shared/data/raw/market/daily_k_data_hfq.parquet` 已更新到最新日期
2. **交易日匹配**：非交易日（周末、节假日）无法匹配收益率
3. **股票范围**：目前仅支持 A 股（沪深），港股和北交所股票会被过滤
4. **多股票处理**：如果一条记录涉及多只股票，取平均收益率

## 监控和日志

建议检查以下日志确保功能正常：
- 匹配成功率（应 > 70%）
- 收益率统计（均值、中位数）
- 相关系数变化趋势

## 未来优化方向

1. 支持港股收益率匹配
2. 添加个股权重配置（目前是简单平均）
3. 计算多日累计收益率
4. 添加收益率分布直方图

