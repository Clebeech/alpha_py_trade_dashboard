#!/bin/bash

# ============================================================================
# 检查新文件并自动同步到 GitHub
# ============================================================================
# 此脚本检查 public/data 目录是否有新的 TSV 文件（基于文件修改时间）
# 如果有新文件（最近1小时内修改的），则执行 git 同步
# ============================================================================

PROJECT_DIR="/home/shared/alpha_py_trade_dashboard"
DATA_DIR="$PROJECT_DIR/public/data"
LAST_CHECK_FILE="$PROJECT_DIR/scripts/.last_check_time"

# 获取当前时间戳
CURRENT_TIME=$(date +%s)

# 读取上次检查时间（如果存在）
if [ -f "$LAST_CHECK_FILE" ]; then
    LAST_CHECK_TIME=$(cat "$LAST_CHECK_FILE")
else
    # 如果不存在，设置为1小时前
    LAST_CHECK_TIME=$((CURRENT_TIME - 3600))
fi

# 进入项目目录
cd "$PROJECT_DIR" || { echo "错误: 无法进入项目目录 $PROJECT_DIR"; exit 1; }

# 检查是否有新文件（修改时间晚于上次检查时间）
HAS_NEW_FILES=false

# 检查所有 TSV 文件
for file in "$DATA_DIR"/parallel_result_*.tsv; do
    if [ -f "$file" ]; then
        # 获取文件修改时间戳
        FILE_MOD_TIME=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null)
        
        # 如果文件修改时间晚于上次检查时间，说明有新文件
        if [ "$FILE_MOD_TIME" -gt "$LAST_CHECK_TIME" ]; then
            HAS_NEW_FILES=true
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] 检测到新文件: $(basename "$file")"
        fi
    fi
done

# 如果有新文件，执行同步
if [ "$HAS_NEW_FILES" = true ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 发现新文件，开始同步..."
    
    # 调用 auto_sync.sh 执行同步
    "$PROJECT_DIR/scripts/auto_sync.sh"
    
    SYNC_EXIT_CODE=$?
    
    if [ $SYNC_EXIT_CODE -eq 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 同步完成"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 同步失败，退出码: $SYNC_EXIT_CODE"
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 没有检测到新文件，跳过同步"
fi

# 更新上次检查时间
echo "$CURRENT_TIME" > "$LAST_CHECK_FILE"


