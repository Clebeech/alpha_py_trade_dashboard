# 定时任务设置说明

## 功能
每天 0:00 到 9:00 之间，每隔1小时自动检查 `public/data/` 目录是否有新的 TSV 文件，如果有则自动执行 git 同步并推送到 GitHub。

## 设置步骤

### 1. 确保脚本有执行权限
```bash
chmod +x /home/shared/alpha_py_trade_dashboard/scripts/check_and_sync.sh
chmod +x /home/shared/alpha_py_trade_dashboard/scripts/auto_sync.sh
```

### 2. 设置 crontab
```bash
crontab -e
```

### 3. 添加以下行
```
# 每天0-9点每小时检查一次新文件并同步
0 0-9 * * * /home/shared/alpha_py_trade_dashboard/scripts/check_and_sync.sh >> /home/shared/alpha_py_trade_dashboard/scripts/check_and_sync.log 2>&1

# 每天19点更新所有文件的收益率并同步
0 19 * * * /home/shared/alpha_py_trade_dashboard/scripts/update_returns_and_sync.sh
```

### 4. 保存并退出
- 如果使用 `vi`：按 `Esc`，输入 `:wq`，回车
- 如果使用 `nano`：按 `Ctrl+X`，然后 `Y`，回车

### 5. 验证 crontab 设置
```bash
crontab -l
```

## Cron 表达式说明
```
0 0-9 * * *
│ │  │ │ │
│ │  │ │ └── 星期几 (0-7, 0和7都表示周日)
│ │  │ └──── 月份 (1-12)
│ │  └────── 日期 (1-31)
│ └───────── 小时 (0-23, 0-9表示0点到9点)
└─────────── 分钟 (0-59, 0表示整点)
```

## 日志文件
- 检查日志：`/home/shared/alpha_py_trade_dashboard/scripts/check_and_sync.log`
- 同步日志：在 `auto_sync.sh` 中输出

## 工作原理

1. **check_and_sync.sh**：
   - 检查 `public/data/` 目录中是否有新文件（基于文件修改时间）
   - 如果发现新文件，调用 `auto_sync.sh` 执行同步
   - 记录上次检查时间到 `.last_check_time` 文件

2. **auto_sync.sh**：
   - 执行 git add/commit/push
   - 触发 Vercel 自动部署

## 手动测试

```bash
# 测试检查脚本
/home/shared/alpha_py_trade_dashboard/scripts/check_and_sync.sh

# 查看日志
tail -f /home/shared/alpha_py_trade_dashboard/scripts/check_and_sync.log
```

## 注意事项

- 确保 git 配置正确（用户名、邮箱、远程仓库）
- 确保有 push 权限
- 如果 git pull 失败，脚本会继续执行（但可能产生冲突）
- 建议在设置 cron 前先手动测试一次脚本

