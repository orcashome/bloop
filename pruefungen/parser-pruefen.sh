#!/bin/bash
# Prueft, ob der Kartenparser mit dem umgeht, was KI-Werkzeuge wirklich liefern.
#
# Hintergrund: Die Website verspricht, dass man sich Karten von einer beliebigen
# KI schreiben lassen und einfuegen kann. Ungehaertet erkannte der Parser aus
# einer Markdown-Tabelle NULL Karten - das Versprechen war also unwahr.
# Dieser Test haelt es ehrlich.
#
#   bash pruefungen/parser-pruefen.sh
set -e
cd "$(dirname "$0")/.."
python3 - <<'PY'
import re
q = open("karteibox_1.jsx", encoding="utf-8").read()
teile = []
for name in ["const SEPARATORS", "const TABELLE_TRENN", "function entformatiere", "function splitPairs"]:
    i = q.index(name)
    if name.startswith("const SEPARATORS"): j = q.index("];", i) + 2
    elif name.startswith("const TABELLE"):  j = q.index("\n", i)
    else:                                   j = q.index("\n}\n", i) + 3
    teile.append(q[i:j])
clean_fn = re.search(r'const clean = [^\n]+', q).group(0)
open("/tmp/_parser.js","w",encoding="utf-8").write(clean_fn + "\n" + "\n".join(teile) + """
const proben = JSON.parse(require("fs").readFileSync(process.argv[2],"utf8"));
let fehler = 0;
for (const [name, text] of Object.entries(proben)) {
  const { rows } = splitPairs(text);
  const muell = rows.filter(r => /[*|]|^\\\\d+[.)]/.test(r.f));
  const ok = rows.length > 0 && muell.length === 0;
  if (!ok) fehler++;
  console.log((ok ? "  OK  " : "  FEHL") + "  " + name + "  (" + rows.length + " Karten)");
  if (muell.length) console.log("        Muell: " + JSON.stringify(muell[0].f));
}
process.exit(fehler ? 1 : 0);
""")
PY
node /tmp/_parser.js pruefungen/ki-antworten.json
echo "Alle KI-Stile werden verarbeitet."
