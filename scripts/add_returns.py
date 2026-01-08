#!/usr/bin/env python3
"""
为 parallel_result TSV 文件添加当天收益率数据
"""
import pandas as pd
import numpy as np
from pathlib import Path
import argparse
import sys

DATA_DIR = Path(__file__).parent.parent / "public" / "data"
PRICE_DATA_PATH = Path("/home/shared/data/raw/market/daily_k_data_hfq.parquet")

def load_price_data(trade_date):
    """加载指定日期的价格数据"""
    try:
        df = pd.read_parquet(PRICE_DATA_PATH)
        df = df[df['trade_date'] == trade_date].copy()
        # 使用完整的股票代码（包含后缀）
        return df[['ts_code', 'pct_chg', 'close', 'name']].set_index('ts_code')
    except Exception as e:
        print(f"加载价格数据失败: {e}")
        return None

def parse_stock_codes(codes_str):
    """解析股票代码字符串，返回代码列表，仅保留 A 股（.SH 和 .SZ）"""
    if pd.isna(codes_str) or not codes_str:
        return []
    # 处理可能的格式：逗号分隔
    codes = str(codes_str).split(',')
    # 只保留 A 股代码（.SH 和 .SZ），过滤掉港股(.HK)和北交所(.BJ)
    return [code.strip() for code in codes if code.strip() and (code.endswith('.SH') or code.endswith('.SZ'))]

def add_returns_to_file(input_file, output_file=None):
    """为 TSV 文件添加收益率"""
    # 从文件名提取日期
    filename = Path(input_file).name
    if 'parallel_result_' not in filename:
        print(f"文件名格式不正确: {filename}")
        return False
    
    trade_date = filename.replace('parallel_result_', '').replace('.tsv', '')
    print(f"处理文件: {filename}, 日期: {trade_date}")
    
    # 读取 TSV 文件
    try:
        df = pd.read_csv(input_file, sep='\t')
        print(f"读取 {len(df)} 条记录")
    except Exception as e:
        print(f"读取文件失败: {e}")
        return False
    
    # 加载价格数据
    price_data = load_price_data(trade_date)
    if price_data is None or price_data.empty:
        print(f"未找到 {trade_date} 的价格数据")
        return False
    
    print(f"加载 {len(price_data)} 只股票的价格数据")
    
    # 为每条记录计算收益率
    returns_list = []
    valid_codes_list = []
    
    for idx, row in df.iterrows():
        codes = parse_stock_codes(row.get('identified_stock_codes', ''))
        
        if not codes:
            returns_list.append(np.nan)
            valid_codes_list.append('')
            continue
        
        # 获取所有有效股票的收益率
        valid_returns = []
        valid_codes = []
        
        for code in codes:
            if code in price_data.index:
                pct_chg = price_data.loc[code, 'pct_chg']
                if pd.notna(pct_chg):
                    valid_returns.append(pct_chg)
                    valid_codes.append(code)
        
        # 计算平均收益率
        if valid_returns:
            avg_return = np.mean(valid_returns)
            returns_list.append(avg_return)
            valid_codes_list.append(','.join(valid_codes))
        else:
            returns_list.append(np.nan)
            valid_codes_list.append('')
    
    # 添加新列
    df['return'] = returns_list
    df['return_valid_codes'] = valid_codes_list
    
    # 统计
    valid_count = df['return'].notna().sum()
    print(f"成功匹配 {valid_count}/{len(df)} 条记录的收益率")
    
    if valid_count > 0:
        print(f"收益率统计: 均值={df['return'].mean():.2f}%, 中位数={df['return'].median():.2f}%")
    
    # 保存文件
    if output_file is None:
        output_file = input_file
    
    df.to_csv(output_file, sep='\t', index=False)
    print(f"已保存到: {output_file}")
    
    return True

def process_all_files():
    """处理 data 目录下的所有 parallel_result 文件"""
    files = sorted(DATA_DIR.glob("parallel_result_*.tsv"))
    
    if not files:
        print(f"未找到任何文件在 {DATA_DIR}")
        return
    
    print(f"找到 {len(files)} 个文件")
    
    success_count = 0
    for file in files:
        print(f"\n{'='*60}")
        if add_returns_to_file(file):
            success_count += 1
        print()
    
    print(f"\n完成! 成功处理 {success_count}/{len(files)} 个文件")

def main():
    parser = argparse.ArgumentParser(description='为 parallel_result 文件添加收益率')
    parser.add_argument('--file', help='指定单个文件路径')
    parser.add_argument('--all', action='store_true', help='处理所有文件')
    args = parser.parse_args()
    
    if args.file:
        add_returns_to_file(args.file)
    elif args.all:
        process_all_files()
    else:
        print("请指定 --file 或 --all 参数")
        print("示例: python add_returns.py --all")
        print("示例: python add_returns.py --file public/data/parallel_result_20260108.tsv")

if __name__ == '__main__':
    main()

