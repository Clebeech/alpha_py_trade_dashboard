#!/usr/bin/env python3
"""
生成 public/data/file-list.json

- 扫描 public/data 下的 parallel_result_*.tsv
- 提取文件名中的 8 位日期用于排序（日期越新越靠前）
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Optional, Tuple


PROJECT_DIR = Path("/home/shared/alpha_py_trade_dashboard")
DATA_DIR = PROJECT_DIR / "public" / "data"
OUT_PATH = DATA_DIR / "file-list.json"


DATE_RE = re.compile(r"parallel_result_(\d{8})")


def _sort_key(name: str) -> Tuple[int, str]:
    """
    返回排序 key：
    - 第一项：日期（YYYYMMDD -> int），缺失则为 0
    - 第二项：文件名（用于稳定排序）
    说明：最终会 reverse=True，使日期新的排前面。
    """
    m = DATE_RE.search(name)
    d = int(m.group(1)) if m else 0
    return (d, name)


def main() -> None:
    if not DATA_DIR.exists():
        raise SystemExit(f"DATA_DIR not found: {DATA_DIR}")

    files = sorted(
        [p.name for p in DATA_DIR.glob("parallel_result_*.tsv") if p.is_file()],
        key=_sort_key,
        reverse=True,
    )

    OUT_PATH.write_text(json.dumps(files, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"[OK] wrote {len(files)} files -> {OUT_PATH}")


if __name__ == "__main__":
    main()


