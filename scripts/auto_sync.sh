#!/bin/bash

# ============================================================================
# 自动同步数据到 GitHub 并触发 Vercel 部署
# ============================================================================
# 说明：
#   1. parallel_pipeline.py 在 --is-for-trade 模式下会自动保存文件到
#      /home/shared/alpha_py_trade_dashboard/public/data/parallel_result_YYYYMMDD.tsv
#   2. 此脚本检查是否有新文件，然后 git add/commit/push 触发 Vercel 自动部署
# ============================================================================

# =================配置区域=================
PROJECT_DIR="/home/shared/alpha_py_trade_dashboard"
DATA_DIR="$PROJECT_DIR/public/data"

# =================脚本逻辑=================

# 获取当前日期，用于日志
DATE=$(date "+%Y-%m-%d %H:%M:%S")

echo "[$DATE] 开始自动同步数据..."

# 1. 进入项目目录
cd "$PROJECT_DIR" || { echo "错误: 无法进入项目目录 $PROJECT_DIR"; exit 1; }

# 2. 确保代码是最新的（避免冲突）
echo "[$DATE] 拉取最新代码..."
git pull origin main || { echo "警告: git pull 失败，继续执行..."; }

# 3. 检查是否有新的 TSV 文件（文件已经由 parallel_pipeline.py 直接保存到这里）
echo "[$DATE] 检查数据文件..."

# 检查 public/data 目录是否存在
if [ ! -d "$DATA_DIR" ]; then
    echo "错误: 数据目录不存在: $DATA_DIR"
    exit 1
fi

# 4. 更新 file-list.json（可选，如果需要的话）
# 这里可以添加逻辑来更新文件列表

# 5. Git 提交和推送
# 添加 public/data 下的所有变化
git add public/data/

# 检查是否有变更需要提交
if git diff --staged --quiet; then
    echo "[$DATE] 没有检测到数据变化，跳过提交"
else
    # 显示将要提交的文件
    echo "[$DATE] 检测到以下文件变更:"
    git diff --staged --name-only
    
    # 提交变更
    git commit -m "Auto-update data: $DATE"
    
    # 推送到远程仓库 (Vercel 会监听这个推送)
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "[$DATE] ✅ 数据已推送到 GitHub，Vercel 将自动更新"
    else
        echo "[$DATE] ❌ Git push 失败"
        exit 1
    fi
fi

echo "[$DATE] 同步完成"

