# -*- coding: utf-8 -*-
"""Erzeugt die App-Icons aus Marcs Octopus-Zeichnung.

Die Icons lagen bis hierher in Mint auf Dunkelgruen - den Farben aus der
Frida-und-Klaus-Zeit. Bloop ist violett, also muessen sie es auch sein.
Farben kommen aus marke/paletten.json, damit Icon und App nie auseinanderlaufen.
"""
import json, os

KOERPER = ("M45.86,64.96c-4.09-.64-7.87-.11-12-.26.52,6.07-2.57,23.47-10.2,20.54-2.25-.86-3.75-3.7-2.49-6.27,"
  "1.87-3.84,6.49-20.79-.57-19.32-.99,6.13-2.03,13.95-8.15,17.59-2.85,1.7-8.72-.66-10.61-3.11-3.73-4.84-1.27-10.99,"
  "2.53-14.81,7.45-7.49.31-10.98.09-25.18C4.18,15.23,18.21,1.28,36.87.09c13.87-.88,27.18,4.52,34.08,16.81,"
  "5.43,9.67,5.19,20.83,1.79,31.25-1.45,4.45-.8,7.99,2.59,11.16,3.78,3.52,5.98,9.59,2.88,14.51-1.68,2.67-8.05,"
  "5.21-10.96,3.42-10.19-6.26-5.25-21.2-10.73-17.05-2.66,2.01-.44,13.36,2.18,18.79,1.23,2.55-.57,5.4-2.78,6.27-7.48,"
  "2.96-10.35-13.22-10.04-20.29ZM38.16,33.95c0-5-4.06-9.06-9.07-9.06s-9.07,4.06-9.07,9.06,4.06,9.06,9.07,9.06,"
  "9.07-4.06,9.07-9.06ZM59.67,33.95c0-5-4.06-9.06-9.07-9.06s-9.07,4.06-9.07,9.06,4.06,9.06,9.07,9.06,9.07-4.06,"
  "9.07-9.06ZM34.51,48.61c-.95-.62-2.37.1-2.8.7-.28.4-.66,1.38-.02,2.07,4.2,4.49,11.43,4.78,15.82.45.89-.87.67-1.94.41-2.51-1.7-3.7-5.21,4.61-13.41-.71Z")
MUND = ("M34.51,48.61c8.2,5.32,11.71-2.99,13.41.71.26.57.48,1.64-.41,2.51-4.39,4.33-11.62,4.04-15.82-.45-.64-.69-.27-1.67.02-2.07.42-.6,1.85-1.31,2.8-.7Z")

# Bildmasse der Originalzeichnung
B, H = 79.67, 85.62

def svg(groesse, figur, grund, detail, anteil, mit_grund=True):
    """anteil: wie viel der Kante die Figur einnimmt. Maskable braucht weniger,
    weil Android das Icon zu einem Kreis beschneiden darf."""
    s = groesse * anteil / max(B, H)
    tx = (groesse - B * s) / 2.0
    ty = (groesse - H * s) / 2.0
    # Das Favicon laeuft OHNE Grundflaeche: im Browsertab saesse die Figur sonst
    # in einem dunklen Kaestchen, das neben dem Tab fremd wirkt. Die
    # Homescreen-Icons brauchen die Flaeche dagegen zwingend - iOS setzt bei
    # Transparenz schwarze Ecken, Android beschneidet ins Leere.
    flaeche = ('<rect width="%d" height="%d" fill="%s"/>' % (groesse, groesse, grund)) if mit_grund else ""
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d">'
      '%s'
      '<g transform="translate(%.3f %.3f) scale(%.5f)">'
      '<path fill="%s" d="%s"/>'
      '<circle cx="29.09" cy="33.95" r="9.07" fill="#fff"/>'
      '<circle cx="50.60" cy="33.95" r="9.07" fill="#fff"/>'
      '<path fill="%s" d="%s"/>'
      '<circle cx="31.01" cy="35.29" r="4.77" fill="%s"/>'
      '<circle cx="52.45" cy="35.30" r="4.77" fill="%s"/>'
      '</g></svg>') % (groesse, groesse, groesse, groesse, flaeche,
                       tx, ty, s, figur, KOERPER, detail, MUND, detail, detail)

if __name__ == "__main__":
    hier = os.path.dirname(os.path.abspath(__file__))
    pal = {p["name"]: p for p in json.load(open(os.path.join(hier, "paletten.json")))}
    v = pal["violett"]
    FIGUR, DETAIL = v["d_fig"], v["h_ink"]      # #9B6CD0 auf #2B1F38
    GRUND = "#221936"                            # dunkles Violett, wie frueher das Dunkelgruen

    aus = os.path.join(hier, "..", "docs", "app")
    # Wie gross die Figur sitzen muss: Gemessen an den fertigen PNGs deckte der
    # Oktopus bei 76% Kantenanteil nur 36% der Kachel - zwischen den Armen ist
    # Luft, die Bounding Box luegt. Auf dem Homescreen wirkte er dadurch verloren.
    # 88% Kante bringt die Deckung auf rund die Haelfte der Kachel.
    #
    # apple-touch bleibt knapp darunter: iOS legt eine Squircle-Maske an und
    # schneidet die Ecken weg.
    #
    # maskable ist der Sonderfall: Android beschneidet auf einen Kreis mit 80%
    # Durchmesser. Ein FORMATFUELLENDES Motiv duerfte dort nur 58% breit sein.
    # Der Oktopus hat aber leere Ecken - oben ein runder Kopf, unten Arme mit
    # Zwischenraum - deshalb sind 64% vertretbar: was rechnerisch aus dem Kreis
    # ragt, ist Hintergrund. Bitte nicht weiter aufdrehen, sonst faellt die
    # aeusserste Armspitze weg.
    plaene = [("icon-1024", 1024, .88), ("icon-512", 512, .88), ("icon-192", 192, .88),
              ("apple-touch-icon", 180, .84), ("icon-maskable", 512, .64), ("icon", 64, .88)]
    # Jede Vorlage wird in 1024 geschrieben, egal welche Zielgroesse sie hat:
    # qlmanage rendert ein kleines SVG in eine grosse Kachel und laesst den Rest
    # WEISS. Genau so entstand das Icon, das auf dem iPhone nur ein Viertel der
    # Kachel fuellte. Verkleinert wird erst danach mit sips.
    # Ausnahme: icon.svg geht als Vektor direkt in die App und behaelt 64.
    for name, px, anteil in plaene:
        vorlage = 64 if name == "icon" else 1024
        # Ohne Grundflaeche nimmt die Figur die ganze Kachel ein - im Tab zaehlt
        # jedes Pixel, und es gibt keine Ecken mehr, die abgeschnitten wuerden.
        with open(os.path.join(hier, "bau_%s.svg" % name), "w") as f:
            if name == "icon":
                f.write(svg(vorlage, FIGUR, GRUND, DETAIL, 1.0, mit_grund=False))
            else:
                f.write(svg(vorlage, FIGUR, GRUND, DETAIL, anteil))
    print("Figur %s / Grund %s / Detail %s" % (FIGUR, GRUND, DETAIL))
    print("%d SVG-Vorlagen geschrieben" % len(plaene))
