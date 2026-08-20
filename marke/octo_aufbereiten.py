#!/usr/bin/env python3
"""Bereitet Marcs Zeichnung (marke/quelle/IDA.svg) fuer die App auf.

Marcs Datei bleibt die Quelle - hier wird nichts umgezeichnet, nur umgebaut:

1. Koerperfarbe auf currentColor, damit die App in der Begleiterfarbe faerbt.
2. Augapfel als VOLLER Kreis. In der Vorlage hat das Augenweiss ein Loch an der
   Pupillenstelle; sobald die Pupille wandert, schaut dort die Koerperfarbe durch.
3. Pupillen in eine Gruppe class="pupille" mit transform. Die App verschiebt nur
   diese Gruppe - keine Neuberechnung, laeuft auf der GPU.
4. Die weisse Aussenkontur wird abschaltbar (Standard: aus). Auf hellem Grund ist
   sie unsichtbar, im Dunkelmodus waere sie ein weisser Saum.
"""
import re, os, sys

HIER   = os.path.dirname(os.path.abspath(__file__))
QUELLE = os.path.join(HIER, "quelle", "IDA.svg")

# Augen aus der Vorlage: Mittelpunkt und Radius des weissen Augapfels.
AUGE   = [(29.09, 33.95), (50.60, 33.95)]
AUGE_R = 9.07
PUP_R  = 4.77
SPIEL  = AUGE_R - PUP_R          # 4.30 - weiter darf die Pupille nie

# Blickrichtungen als Versatz zur Augenmitte, in SVG-Einheiten.
# "ruhig" ist exakt Marcs Original - er hat die Pupillen schon aus der Mitte
# gesetzt, und genau darauf hat er bestanden: mittige Pupillen wirken tot.
BLICKE = {
    "ruhig":    [( 1.92,  1.34), ( 1.85,  1.35)],
    "schielen": [( 3.30,  0.90), (-3.30,  0.90)],
    "hoch":     [( 1.30, -2.90), ( 1.25, -2.90)],
    "runter":   [( 1.60,  3.30), ( 1.55,  3.30)],
    "links":    [(-3.30,  1.00), (-3.30,  1.00)],
    "rechts":   [( 3.30,  1.00), ( 3.30,  1.00)],
    "weg":      [(-2.60, -2.30), (-2.60, -2.30)],
}

def teile(roh):
    """Holt Kontur, Koerper und Mund aus der Vorlage."""
    p = re.findall(r'<path class="(cls-\d)" d="([^"]+)"', roh)
    kontur = [d for c,d in p if c == "cls-1"][0]     # der erste cls-1 ist die Aussenkontur
    koerper = [d for c,d in p if c == "cls-2"][0]
    mund   = [d for c,d in p if c == "cls-3"][0]
    return kontur, koerper, mund

def baue(kontur, koerper, mund, blick="ruhig"):
    v = BLICKE[blick]
    for (dx,dy) in v:
        if (dx*dx+dy*dy)**0.5 > SPIEL:
            raise SystemExit("Blick '%s' stoesst am Augenrand an (max %.2f)" % (blick, SPIEL))
    s  = '<path class="octo-aura" d="%s"/>' % kontur
    s += '<path class="octo-koerper" d="%s"/>' % koerper
    for cx,cy in AUGE:
        s += '<circle class="octo-augapfel" cx="%.2f" cy="%.2f" r="%.2f"/>' % (cx, cy, AUGE_R)
    s += '<path class="octo-mund" d="%s"/>' % mund
    for k,(cx,cy) in enumerate(AUGE):
        dx, dy = v[k]
        s += ('<g class="octo-pupille" data-auge="%s" transform="translate(%.2f %.2f)">'
              '<circle cx="%.2f" cy="%.2f" r="%.2f"/></g>'
              % ("l" if k==0 else "r", dx, dy, cx, cy, PUP_R))
    return s

STIL = ("<style>.octo-aura{fill:var(--octo-aura,none)}"
        ".octo-koerper{fill:currentColor}"
        ".octo-augapfel{fill:#fff}"
        ".octo-mund,.octo-pupille circle{fill:#293a38}"
        ".octo-pupille{transition:transform .28s cubic-bezier(.34,1.4,.5,1)}"
        "@media (prefers-reduced-motion:reduce){.octo-pupille{transition:none}}</style>")

def main():
    roh = open(QUELLE, encoding="utf-8").read()
    k, b, mu = teile(roh)
    for blick in BLICKE:
        open(os.path.join(HIER, "octo-%s.svg" % blick), "w", encoding="utf-8").write(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 79.67 85.62" '
            'width="80" height="86" role="img" aria-label="Begleiter">%s%s</svg>'
            % (STIL, baue(k, b, mu, blick)))
    print("geschrieben:", ", ".join(sorted(BLICKE)))

if __name__ == "__main__":
    main()
