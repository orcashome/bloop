# Bloop

Lernkarten mit **drei Seiten**: Frage, kurze Antwort — und dahinter die
Erklärung, wenn sie gebraucht wird. Ohne Konto, ohne Abo, ohne Werbung.

**Live:** https://orcashome.github.io/bloop/

## Was das ist

Eine Lern-App für Kinder und Jugendliche, die im Browser läuft und auf dem
Startbildschirm wie eine App startet — auch offline. Ein
Gedächtnismodell (FSRS-4.5) legt jede Karte kurz vor dem Vergessen wieder vor.

**Es verlässt nichts das Gerät.** Kein Konto, kein Server, keine Tracker.
Nachprüfbar: Flugmodus einschalten, die App läuft weiter.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `docs/` | Was GitHub Pages ausliefert |
| `docs/index.html` | Startseite |
| `docs/app/` | die App (eine einzige HTML-Datei plus Icons) |
| `karteibox_1.jsx` | Quellcode der App |
| `build_pages.sh` | bündelt React + App via esbuild nach `docs/app/index.html` |
| `marke/` | Icon-Generator und geprüfte Farbpaletten |

## Bauen

```bash
bash build_pages.sh
```

Danach **`CACHE` in `docs/app/sw.js` hochzählen** — sonst sehen Rückkehrer
weiter die alte Fassung.

## Sprachen

Die Oberfläche ist deutsch und englisch. Eine weitere Sprache ist ein
zusätzlicher Block im Wörterbuch `TEXTE` plus ein Eintrag in `SPRACHEN`.
Die Begrüßungen werden dabei **neu geschrieben, nicht übersetzt** — sie sind
der Ton der App, nicht ihre Information.
