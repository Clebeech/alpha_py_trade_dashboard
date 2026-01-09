#!/bin/bash

# ============================================================================
# 更新所有文件的收益率并同步到 GitHub
# ============================================================================

PROJECT_DIR="/home/shared/alpha_py_trade_dashboard"
CONDA_BIN="/home/tigerxu/miniconda3/bin/conda"
LOG_FILE="$PROJECT_DIR/scripts/update_returns_cron.log"

DATE=$(date "+%Y-%m-%d %H:%M:%S")
echo "[$DATE] 开始每日收益率更新任务..." >> "$LOG_FILE"

cd "$PROJECT_DIR" || exit 1

# 1. 运行收益率更新脚本
echo "[$DATE] 运行 add_returns.py --all..." >> "$LOG_FILE"
"$CONDA_BIN" run -n pioneer python scripts/add_returns.py --all >> "$LOG_FILE" 2>&1

# 2. 运行时序数据生成脚本
echo "[$DATE] 运行 generate_timeseries_data.py..." >> "$LOG_FILE"
"$CONDA_BIN" run -n pioneer python scripts/generate_timeseries_data.py >> "$LOG_FILE" 2>&1

# 3. 运行同步脚本
echo "[$DATE] 运行 auto_sync.sh..." >> "$LOG_FILE"
./scripts/auto_sync.sh >> "$LOG_FILE" 2>&1

echo "[$DATE] 每日收益率更新任务完成" >> "$LOG_FILE"
echo "----------------------------------------------------" >> "$LOG_FILE"

