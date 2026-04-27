"""One-off: read Sea Animals Shells Pearls.xlsx → markdown section."""
import re
import pathlib
import openpyxl

XLSX = pathlib.Path(r"c:\Users\MSUSERSL123\Desktop\Sho\HeartMath Game\Research\Sea Animals Shells Pearls.xlsx")
OUT_SNIPPET = pathlib.Path(__file__).resolve().parent.parent / "docs" / "_ocean_treasures_snippet.md"


def fmt_cell(s):
    if not s:
        return []
    s = str(s).replace("\r\n", "\n")
    s = s.replace("\u2019", "'").replace("\u2018", "'")
    s = s.replace("Fulton\u0178\u2019s", "Fulton's").replace("Fulton�s", "Fulton's")
    chunks = re.split(r"\n(?=\d+\.\s)", s.strip())
    out = []
    for ch in chunks:
        ch = re.sub(r"\n:\s*", " — ", ch.strip())
        out.append(ch)
    return out


def main():
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    ws = wb["Sheet1"]
    all_rows = list(ws.iter_rows(values_only=True))
    wb.close()

    intro = all_rows[0][0]
    lines = []
    lines.append("## Ocean treasures by zone (research)")
    lines.append("")
    lines.append("> " + " ".join(intro.replace("\n", " ").split()))
    lines.append("")
    lines.append("Source: *Sea Animals Shells Pearls.xlsx* (HeartMath Game research).")
    lines.append("")

    headers = ["Rarest sea animals", "Interesting sea shells", "Precious pearls"]
    for r in range(3, 8):
        row = all_rows[r]
        zone = " ".join((row[0] or "").split())
        animals, shells, pearls = row[1], row[2], row[3]
        lines.append(f"### {zone}")
        lines.append("")
        for title, cell in zip(headers, [animals, shells, pearls]):
            lines.append(f"**{title}**")
            lines.append("")
            for item in fmt_cell(cell):
                lines.append(f"- {item}")
            lines.append("")

    OUT_SNIPPET.write_text("\n".join(lines), encoding="utf-8")
    print("Wrote", OUT_SNIPPET, OUT_SNIPPET.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
