"""Generate research section HTML from ocean-dive-game-design-rationale.md"""
import html
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
md = (ROOT / "docs" / "ocean-dive-game-design-rationale.md").read_text(encoding="utf-8")
start = md.index("## Ocean treasures")
end = md.index("\n---\n\n## Game Flow")
block = md[start:end].strip()
lines = block.split("\n")
out = []
in_ul = False
for line in lines:
    if line.startswith("## "):
        out.append(f'    <h2 class="research-h2">{html.escape(line[3:])}</h2>')
    elif line.startswith("### "):
        if in_ul:
            out.append("    </ul>")
            in_ul = False
        out.append(f'    <h3 class="research-h3">{html.escape(line[4:])}</h3>')
    elif line.startswith("> "):
        out.append(f'    <blockquote class="research-quote">{html.escape(line[2:])}</blockquote>')
    elif line.startswith("Source:"):
        out.append(
            '    <p class="research-source"><em>Source: Sea Animals Shells Pearls.xlsx</em> '
            "(HeartMath Game research).</p>"
        )
    elif line.startswith("**") and line.endswith("**") and line.count("**") == 2:
        if in_ul:
            out.append("    </ul>")
            in_ul = False
        out.append(f'    <p class="research-cat"><strong>{html.escape(line[2:-2])}</strong></p>')
    elif line.startswith("- "):
        if not in_ul:
            out.append('    <ul class="research-list">')
            in_ul = True
        out.append(f"      <li>{html.escape(line[2:])}</li>")
if in_ul:
    out.append("    </ul>")
out_path = ROOT / "docs" / "_research_fragment.html"
out_path.write_text("\n".join(out), encoding="utf-8")
print("Wrote", out_path, "lines", len(out))
