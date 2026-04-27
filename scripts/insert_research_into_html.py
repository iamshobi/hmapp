import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
html_path = ROOT / "docs" / "ocean-dive-design-rationale.html"
frag_path = ROOT / "docs" / "_research_fragment.html"
text = html_path.read_text(encoding="utf-8")
frag_lines = frag_path.read_text(encoding="utf-8").splitlines()
# drop first line (duplicate h2)
body = "\n".join(frag_lines[1:])
block = f"""  <section class="section research-section">
    <div class="section-header">
      <h2>Ocean treasures by zone (research)</h2>
      <p>Research-backed examples of rare animals, shells, and pearls by pelagic layer — aligned with the design workbook <code>Sea Animals Shells Pearls.xlsx</code> (synced in <code>ocean-dive-game-design-rationale.md</code>).</p>
    </div>
{body}
  </section>

"""
needle = "  <div class=\"divider\"></div>\n\n  <!-- ══ EXPERIENCE VIDEO ════════════════════════════════════════════ -->"
if needle not in text:
    raise SystemExit("needle not found")
text = text.replace(needle, "  <div class=\"divider\"></div>\n\n" + block + "  <!-- ══ EXPERIENCE VIDEO ════════════════════════════════════════════ -->", 1)
html_path.write_text(text, encoding="utf-8")
print("Inserted research section")
