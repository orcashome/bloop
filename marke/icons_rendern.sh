#!/bin/bash
# Rendert die Icon-SVGs nach PNG.
#
# WICHTIG: qlmanage rendert kleine Zielgroessen NICHT zuverlaessig - bei
# "-s 180" kam ein Bild heraus, das das Motiv links oben in eine groessere
# weisse Kachel setzte. Auf dem iPhone fuellte das Icon dadurch nur ein
# Viertel der Flaeche. Deshalb wird jede Vorlage in 1024 gerendert und erst
# danach mit sips auf die Zielgroesse gebracht.
set -e
cd "$(dirname "$0")"
python3 icons_bauen.py
rm -rf /tmp/icons_ql && mkdir -p /tmp/icons_ql

rendere() {   # $1 = Vorlagenname, $2 = Zielgroesse, $3 = Zieldatei
  qlmanage -t -s 1024 -o /tmp/icons_ql "bau_$1.svg" > /dev/null 2>&1
  sips -z "$2" "$2" "/tmp/icons_ql/bau_$1.svg.png" --out "../docs/app/$3" > /dev/null 2>&1
}

rendere icon-1024        1024 icon-1024.png
rendere icon-512          512 icon-512.png
rendere icon-192          192 icon-192.png
rendere apple-touch-icon  180 apple-touch-icon.png
rendere icon-maskable     512 icon-maskable.png
cp bau_icon.svg ../docs/app/icon.svg
rm -f bau_*.svg
echo "Icons gerendert."
