"""
Parse DHBVN CIN PDFs and output per-circle feeder catalog JSON files.
Usage:
  py scripts/parse-cin-pdfs.py                  # fetch + parse all 11 circles
  py scripts/parse-cin-pdfs.py --local <path>    # parse a single local PDF (prints JSON)
  py scripts/parse-cin-pdfs.py --id 7            # parse single circle by id
"""

import pdfplumber
import json
import sys
import urllib.request
import os
import tempfile

USER_AGENT = "Mozilla/5.0"

BASE_URL = "https://www.dhbvn.org.in/staticContent/information/feeder_level/"

_config_path = os.path.join(os.path.dirname(__file__), "..", "public", "data", "districts.json")
with open(_config_path, encoding="utf-8") as _f:
    _districts = json.load(_f)["districts"]
    # circles absent → default to [district name]; circles null → no CIN data, skip
    CIRCLES = [
        name
        for d in _districts
        for name in (d.get("circles") if "circles" in d else [d["name"]]) or []
    ]

def circle_to_pdf(name):
    # Gurugram-1 → Gurugram1_Circle_CIN.pdf, Gurugram-2 → Gurugram2_Circle_CIN.pdf
    import re
    base = re.sub(r'-(\d+)$', r'\1', name)
    return base + "_Circle_CIN.pdf"

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data", "feeders")

HEADER_MARKER = "S.No."

def norm(s):
    return ' '.join((s or '').upper().split())

def circle_filename(circle_name):
    return circle_name.lower() + ".json"

def parse_pdf(pdf_path):
    feeders = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                for row in table:
                    if not row or row[0] == HEADER_MARKER or row[0] is None:
                        continue
                    if len(row) < 13:
                        continue
                    feeder_name = row[9]
                    if not feeder_name:
                        continue
                    feeders.append({
                        "division":     norm(row[3]),
                        "sub_division": norm(row[5]),
                        "ss_name":      norm(row[7]),
                        "feeder_name":  norm(feeder_name),
                        "cin_14":       (row[12] or "").strip(),
                    })
    return feeders


def fetch_pdf(url):
    print(f"  Downloading {url} ...", flush=True)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    tmp.close()
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req) as resp, open(tmp.name, "wb") as out:
        out.write(resp.read())
    return tmp.name


def write_circle(circle_name, feeders):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = os.path.join(OUTPUT_DIR, circle_filename(circle_name))
    with open(path, "w", encoding="utf-8") as f:
        json.dump(feeders, f, ensure_ascii=False, indent=2)
    return path


def main():
    args = sys.argv[1:]

    # --local <path>: parse and print JSON (no circle name known)
    if "--local" in args:
        idx = args.index("--local")
        pdf_path = args[idx + 1]
        print(f"Parsing local: {pdf_path}", flush=True)
        feeders = parse_pdf(pdf_path)
        print(json.dumps(feeders, ensure_ascii=False, indent=2))
        return

    # --id <n>: parse single circle by 1-based index
    if "--id" in args:
        idx = args.index("--id")
        circle_idx = int(args[idx + 1]) - 1
        if circle_idx < 0 or circle_idx >= len(CIRCLES):
            print(f"No circle at index {circle_idx + 1}")
            sys.exit(1)
        circles = [CIRCLES[circle_idx]]
    else:
        circles = list(CIRCLES)

    for i, circle in enumerate(circles, 1):
        print(f"[{i}/{len(CIRCLES)}] {circle}", flush=True)
        url = BASE_URL + circle_to_pdf(circle)
        tmp_path = fetch_pdf(url)
        try:
            feeders = parse_pdf(tmp_path)
            out = write_circle(circle, feeders)
            print(f"  -> {len(feeders)} feeders -> {out}")
        finally:
            os.unlink(tmp_path)


if __name__ == "__main__":
    main()
