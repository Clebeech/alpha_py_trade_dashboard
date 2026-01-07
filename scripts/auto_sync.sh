#!/bin/bash

# =================配置区域=================
# 1. 项目在服务器上的绝对路径
PROJECT_DIR="/path/to/your/trade_dashboard"

# 2. 数据生成位置（新生成的TSV文件在哪里）
# 假设您的 Python 脚本生成的最新文件总是在这里，或者您可以通过参数传入
SOURCE_DATA_DIR="/path/to/your/generated/data"

# =================脚本逻辑=================

# 获取当前日期，用于日志
DATE=$(date "+%Y-%m-%d %H:%M:%S")

echo "[$DATE] 开始自动同步数据..."

# 1. 进入项目目录
cd "$PROJECT_DIR" || { echo "无法进入项目目录"; exit 1; }

# 2. 确保代码是最新的（避免冲突）
git pull origin main

# 3. 复制最新的 TSV 文件到 public/data
# 假设我们要复制最新的一个文件，或者您可以指定具体文件名
# 这里使用 cp 命令将源目录下的所有 tsv 复制过去，或者您可以写得更具体
cp "$SOURCE_DATA_DIR"/parallel_result_*.tsv "$PROJECT_DIR/public/data/"

echo "[$DATE] 文件复制完成"

# 4. Git 提交和推送
# 添加 public/data 下的所有变化
git add public/data/

# 检查是否有变更需要提交
if git diff-index --quiet HEAD --; then
    echo "[$DATE] 没有检测到数据变化，跳过提交"
else
    # 提交变更
    git commit -m "Auto-update data: $DATE"
    
    # 推送到远程仓库 (Vercel 会监听这个推送)
    git push origin main
    
    echo "[$DATE] 数据已推送到 GitHub，Vercel 将自动更新"
fi

