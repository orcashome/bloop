# Markenzeichen Oktopus. Kernidee: Arme laufen als Klothoide - gerade beginnend,
# zum Ende hin zunehmend gekruemmt. Das ergibt die eingerollte Spitze, die einen
# Oktopus als Zeichen erkennbar macht. Eine Bezier kann das nicht.
import math

def spur(x, y, grad, schritt, gerade, zu, n):
    """Mittellinie: erst 'gerade' Schritte geradeaus, dann rollt die Spitze mit
    zunehmender Drehung ein. Die gerade Strecke gibt dem Arm Laenge, ohne dass
    die Locke ausufert."""
    p, a, d = [], math.radians(grad), 0.0
    for i in range(n):
        p.append((x, y))
        x += math.cos(a)*schritt; y += math.sin(a)*schritt
        if i >= gerade:
            a += math.radians(d); d += zu
    return p

def band(p, w0, w1, kegel=0.75):
    """Mittellinie zu verjuengter Fuellform."""
    n = len(p); li = []; re = []
    for i,(x,y) in enumerate(p):
        if i == 0:      dx,dy = p[1][0]-x, p[1][1]-y
        elif i == n-1:  dx,dy = x-p[-2][0], y-p[-2][1]
        else:           dx,dy = p[i+1][0]-p[i-1][0], p[i+1][1]-p[i-1][1]
        L = math.hypot(dx,dy) or 1
        nx,ny = -dy/L, dx/L
        w = (w0 + (w1-w0)*((i/(n-1))**kegel))/2
        li.append((x+nx*w, y+ny*w)); re.append((x-nx*w, y-ny*w))
    r = w1/2
    d  = "M%.2f %.2f " % li[0]
    d += " ".join("L%.2f %.2f" % q for q in li[1:])
    d += " A%.2f %.2f 0 0 0 %.2f %.2f " % (r, r, re[-1][0], re[-1][1])   # runde Kuppe
    d += " ".join("L%.2f %.2f" % q for q in re[::-1][1:])
    return d + " Z"

def arm(x, y, grad, schritt, dreh, zu, n, w0, w1):
    return band(spur(x,y,grad,schritt,dreh,zu,n), w0, w1)

# Sechs sichtbare Arme, bewusst ungleich: Rhythmus statt Tischbeine.
# (x, y, startwinkel, schritt, dreh, zunahme, schritte, breite_basis, breite_spitze)
# (x, y, startwinkel, schritt, gerade_schritte, drehzunahme, schritte, breite_basis, breite_spitze)
ARME = [
    (19, 32, 101, 2.1, 4,  6.2, 13, 8.6, 2.5),
    (24, 35,  95, 2.0, 4,  5.6, 12, 8.0, 2.3),
    (29, 37,  91, 1.9, 4,  5.0, 11, 7.4, 2.2),
    (35, 37,  89, 1.9, 4, -5.0, 11, 7.4, 2.2),
    (40, 35,  85, 2.0, 4, -5.6, 12, 8.0, 2.3),
    (45, 32,  79, 2.1, 4, -6.2, 13, 8.6, 2.5),
]

# Mantel: eifoermig, oben etwas spitzer, mit leichter Schulter ueber den Augen.
MANTEL = ("M32 3.5c12.4 0 21.5 9.4 21.5 21.2 0 4.6-1.1 8.2-3.2 11-2.6 3.4-7.2 5.3-"
          "12.4 5.8-2.1.2-3.9.3-5.9.3s-3.8-.1-5.9-.3c-5.2-.5-9.8-2.4-12.4-5.8-2.1-2.8"
          "-3.2-6.4-3.2-11C10.5 12.9 19.6 3.5 32 3.5Z")

AUG_R  = 5.8    # Augenweiss
PUP_R  = 2.9    # Pupille
BEWEG  = 2.4    # wie weit die Pupille aus der Mitte darf, ohne anzustossen
AUG    = [(24.0, 25.0), (40.0, 25.0)]

# Blickrichtungen als Versatz je Auge, in Einheiten von BEWEG (-1 .. +1).
# "ruhig" ist bewusst nicht mittig - mittige Pupillen wirken tot.
BLICKE = {
    "ruhig":    [( 0.22,  0.26), ( 0.22,  0.26)],
    "hoch":     [( 0.14, -0.78), ( 0.14, -0.78)],
    "schielen": [( 0.80,  0.16), (-0.80,  0.16)],
    "links":    [(-0.82,  0.20), (-0.82,  0.20)],
    "rechts":   [( 0.82,  0.20), ( 0.82,  0.20)],
    "runter":   [( 0.18,  0.80), ( 0.18,  0.80)],
}

def augen(blick="ruhig"):
    v = BLICKE[blick]
    s = ""
    for k,(cx,cy) in enumerate(AUG):
        s += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#fff"/>' % (cx, cy, AUG_R)
    for k,(cx,cy) in enumerate(AUG):
        dx, dy = v[k][0]*BEWEG, v[k][1]*BEWEG
        # Pupille und Glanzpunkt in einer Gruppe: die App verschiebt nur diese
        # Gruppe per transform, das ist die billigste Animation, die es gibt.
        s += ('<g class="pupille" data-auge="%s" transform="translate(%.2f %.2f)">'
              '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#14213D"/>'
              '<circle cx="%.1f" cy="%.1f" r="1.15" fill="#fff"/></g>'
              % ("l" if k==0 else "r", dx, dy, cx, cy, PUP_R, cx-1.0, cy-1.1))
    return s

def krake(farbe, blick="ruhig"):
    s = "".join('<path d="%s" fill="%s"/>' % (arm(*a), farbe) for a in ARME)
    s += '<path d="%s" fill="%s"/>' % (MANTEL, farbe)
    s += augen(blick)
    s += ('<path d="M28.8 34.4c1.3 2 5.1 2 6.4 0" stroke="#14213D" stroke-width="2.4" '
          'stroke-linecap="round" fill="none"/>')
    return s

def blatt(datei, farbe="#7B4FD4"):
    g = ''
    for i, a in enumerate(["ruhig","schielen","hoch"]):
        g += '<g transform="translate(%d,6)">%s</g>' % (8+i*76, krake(farbe, a))
        g += ('<text x="%d" y="80" font-family="system-ui" font-size="6" fill="#6D6187" '
              'text-anchor="middle">%s</text>' % (40+i*76, a))
        # Kleintest 24px daneben
        g += '<g transform="translate(%d,88) scale(%.4f)">%s</g>' % (28+i*76, 24/64, krake(farbe, a))
        g += '<g transform="translate(%d,88) scale(%.4f)">%s</g>' % (2+i*76, 16/64, krake(farbe, a))
    open(datei,'w',encoding='utf-8').write(
        '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="480" viewBox="0 0 236 126">'
        '<rect width="236" height="126" fill="#F4F1F9"/>' + g + '</svg>')

blatt('marke.svg')
xs, ys = [], []
for a in ARME:
    for x,y in spur(*a[:7]):
        xs.append(x); ys.append(y)
w = max(a[7] for a in ARME)/2
print("Aussenkante  x %.1f..%.1f   y bis %.1f   (viewBox 0..64)" % (min(xs)-w, max(xs)+w, max(ys)+w))
