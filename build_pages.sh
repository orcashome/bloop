#!/bin/bash
# Baut die eigenstaendige App nach docs/app/index.html.
#
# docs/index.html ist die Startseite und wird NICHT von hier erzeugt -
# die App liegt bewusst in einem Unterordner, damit ihre Adresse stabil
# bleibt, wenn die Website die Wurzel bekommt.
#
# Einmalig vorher im Projektordner:
#   npm install react react-dom esbuild
#
# Danach immer:
#   bash build_pages.sh
#
set -e
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$HERE/docs/app"
NM="$HERE/node_modules"

if [ ! -d "$NM/react" ]; then
  echo "Fehlt: node_modules. Bitte einmal ausfuehren:"
  echo "  cd \"$HERE\" && npm install react react-dom esbuild"
  exit 1
fi

npx esbuild "$HERE/web.jsx" --bundle --minify \
  --define:process.env.NODE_ENV='"production"' \
  --outfile="$HERE/app.min.js"

python3 - "$HERE/app.min.js" "$HERE/page.head.html" "$OUT/index.html" <<'PY'
import sys, re
js   = open(sys.argv[1], encoding='utf-8').read()
head = open(sys.argv[2], encoding='utf-8').read()
# Google-Fonts-Import aus dem Bundle entfernen: im Web laden wir die Schriften lokal aus docs/fonts.
js, n = re.subn(r"@import url\(\\?'https://fonts\.googleapis\.com[^)]*\\?'\);", "", js)
# </script> im Bundle wuerde das inline-script vorzeitig beenden
js = js.replace('</script>', '<\\/script>')
open(sys.argv[3], 'w', encoding='utf-8').write(head + '\n<script>' + js + '</script>\n</body>\n</html>\n')
print('Google-Fonts-Import entfernt:', n)
print('docs/app/index.html geschrieben:', len(head) + len(js), 'Zeichen')
PY

rm -f "$HERE/app.min.js"
echo "Fertig. Nicht vergessen: bei inhaltlichen Aenderungen CACHE in docs/app/sw.js hochzaehlen."
