#!/usr/bin/env python3
import pandas as pd
import numpy as np
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "public" / "data"
PRICE_DATA_PATH = Path("/home/shared/data/raw/market/daily_k_data_hfq.parquet")

def generate_timeseries():
    files = sorted(DATA_DIR.glob("parallel_result_*.tsv"))
    if not files:
        print("No data files found.")
        return

    industry_ts = []
    segment_ts = []
    high_score_stocks = set()
    stock_first_hit_80 = {} # ts_code -> first_date

    for file in files:
        trade_date = file.name.replace('parallel_result_', '').replace('.tsv', '')
        try:
            df = pd.read_csv(file, sep='\t')
        except Exception as e:
            print(f"Error reading {file}: {e}")
            continue
        
        if 'return' not in df.columns or 'final_score_penalized' not in df.columns:
            continue
            
        df['return'] = pd.to_numeric(df['return'], errors='coerce')
        df['score'] = pd.to_numeric(df['final_score_penalized'], errors='coerce')
        df = df.dropna(subset=['return', 'score'])
        
        if df.empty:
            continue

        # 1. Industry Aggregate
        if 'industry' in df.columns:
            ind_groups = df.groupby('industry')['return'].mean().to_dict()
            for ind, ret in ind_groups.items():
                industry_ts.append({
                    'date': trade_date,
                    'industry': ind,
                    'return': round(ret, 4)
                })

        # 2. Segment Aggregate
        segments = {
            'High (>=80)': df[df['score'] >= 80],
            'Mid (70-80)': df[(df['score'] >= 70) & (df['score'] < 80)],
            'Low (<70)': df[df['score'] < 70]
        }
        for label, seg_df in segments.items():
            if not seg_df.empty:
                avg_ret = seg_df['return'].mean()
                segment_ts.append({
                    'date': trade_date,
                    'segment': label,
                    'return': round(avg_ret, 4),
                    'count': len(seg_df)
                })

        # 3. Track 80+ Score Stocks
        hits = df[df['score'] >= 80]
        for _, row in hits.iterrows():
            codes = str(row.get('identified_stock_codes', '')).split(',')
            for code in codes:
                code = code.strip()
                if code and (code.endswith('.SH') or code.endswith('.SZ')):
                    high_score_stocks.add(code)
                    if code not in stock_first_hit_80 or trade_date < stock_first_hit_80[code]:
                        stock_first_hit_80[code] = trade_date

    # Save aggregated TS
    with open(DATA_DIR / "industry_timeseries.json", 'w', encoding='utf-8') as f:
        json.dump(industry_ts, f, ensure_ascii=False, indent=2)
    
    with open(DATA_DIR / "segment_timeseries.json", 'w', encoding='utf-8') as f:
        json.dump(segment_ts, f, ensure_ascii=False, indent=2)

    # 4. Get Price History for High Score Stocks
    if high_score_stocks:
        print(f"Fetching prices for {len(high_score_stocks)} high-score stocks...")
        price_df = pd.read_parquet(PRICE_DATA_PATH)
        # Filter price data to only include these stocks and dates since their first hit
        # To keep it simple, we'll take all price data for these stocks from the earliest hit date
        min_date = min(stock_first_hit_80.values())
        
        # Filter and keep only necessary columns to save space
        tracking_data = price_df[
            (price_df['ts_code'].isin(high_score_stocks)) & 
            (price_df['trade_date'] >= min_date)
        ][['ts_code', 'trade_date', 'close', 'name', 'pct_chg']].copy()
        
        # Sort
        tracking_data = tracking_data.sort_values(['ts_code', 'trade_date'])
        
        # Group by stock for frontend ease
        stock_prices = {}
        for code in high_score_stocks:
            stock_info = tracking_data[tracking_data['ts_code'] == code]
            if not stock_info.empty:
                stock_prices[code] = {
                    'name': stock_info['name'].iloc[0],
                    'first_hit_date': stock_first_hit_80[code],
                    'history': stock_info[['trade_date', 'close', 'pct_chg']].to_dict('records')
                }
        
        with open(DATA_DIR / "high_score_stocks_prices.json", 'w', encoding='utf-8') as f:
            json.dump(stock_prices, f, ensure_ascii=False, indent=2)

    print("Timeseries data generation complete.")

if __name__ == "__main__":
    generate_timeseries()

