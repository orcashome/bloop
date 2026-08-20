import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * Robin — Lernkarten, die am Geraet bleiben (Prototyp v0.5)
 * Super easy GUI, cutting-edge backend:
 *  - Vorne 2 Knoepfe (Nochmal / Gewusst).
 *  - Hinten FSRS (Free Spaced Repetition Scheduler): lernendes Gedaechtnismodell,
 *    das jede Karte kurz vor dem Vergessen wieder vorlegt. On-device, kostenlos.
 *  - Einsprechen und Vorlesen sind Bequemlichkeit, kein Verkaufsargument: das
 *    Versprechen ist, dass nichts das Geraet verlaesst. Kein Konto, keine Werbung.
 *  - Sicheres Teilen per Code (keine Kontaktdaten).
 */

/* ============================================================
 * Sprache der Oberflaeche
 * ============================================================
 * Die App soll international nutzbar sein. Englisch zuerst - dort ist das
 * groesste Potenzial -, danach kommen weitere Sprachen einfach als weiterer
 * Block ins Woerterbuch.
 *
 * Zugriff ueber t("schluessel"). Fehlt eine Uebersetzung, faellt sie auf
 * Deutsch zurueck: eine halb uebersetzte Sprache zeigt dann deutsche Reste,
 * aber nie einen leeren Knopf oder einen rohen Schluessel.
 *
 * `SPR` ist bewusst eine Modulvariable und kein React-Context: die Sprache
 * haengt an `meta`, und jede Aenderung an `meta` rendert die App ohnehin
 * komplett neu. Ein Context haette denselben Effekt gehabt, aber `useT()` in
 * ueber vierzig Komponenten eingefuegt werden muessen. Wichtig dabei: SPR wird
 * in der Wurzel gesetzt, BEVOR die Kinder rendern.
 *
 * Die Begruessungen sind KEINE Uebersetzung. Sie sind der Charakter der App -
 * woertlich uebertragen klingen sie steif. Jede Sprache bekommt eigene, im
 * selben Ton. Der Datenschutz-Witz ("ich rate deinen Namen und sage dazu, dass
 * ich rate") muss dabei erhalten bleiben, er traegt die Botschaft.
 */
const SPRACHEN = [
  { c: "de", n: "Deutsch" },
  { c: "en", n: "English" },
];

let SPR = "de";
const setzeSprache = (c) => { SPR = SPRACHEN.some((s) => s.c === c) ? c : "de"; };
const sprachVon = (m) => (m && m.sprache) || null;
/* Vorschlag aus den Browsereinstellungen - nur als Startwert, nie als Zwang.
   Wer sie einmal gewaehlt hat, behaelt seine Wahl. */
/* Deutsch fuer Deutschland, Oesterreich, die Schweiz und Liechtenstein, sonst
   Englisch. Geprueft wird die GANZE Kennung, nicht nur der Sprachteil: "de-AT"
   und "de-CH" sind Deutsch, "en-AT" dagegen nicht - wer sein Geraet auf Englisch
   gestellt hat, will Englisch, auch in Wien.
   Gelesen wird nur, nichts gespeichert oder verschickt. */
const geraeteSprache = () => {
  if (typeof navigator === "undefined") return "de";
  const liste = (navigator.languages && navigator.languages.length)
    ? navigator.languages : [navigator.language || "en"];
  for (const roh of liste) {
    const kurz = String(roh).toLowerCase().split("-")[0];
    if (SPRACHEN.some((s) => s.c === kurz)) return kurz;
  }
  return "en";
};

const TEXTE = {
  /* Deutsch ist die Rueckfallsprache: was hier fehlt, faellt auf den Schluessel
     zurueck. Neue Texte gehoeren deshalb IMMER zuerst hierher. */
  de: {
    "spiel.gegnerstein": "— %N%s Stein",
    "spiel.denkt": "%N% überlegt…",
    "deck.teilen.text": "Lern mit mir! Importiere diese Kartei in %N%:",
    "foto.knopf": "Seite fotografieren",
    "allg.schliessen": "Schließen",
    "bib.hinzu": "Hinzufügen",
    "deck.alle": "Alle Karten",
    "deck.beide.sub": "Beidseitig loopen — hin und zurück, bis alles sitzt.",
    "deck.eine.sub": "Nur von vorne nach hinten.",
    "deck.karte": "+ Karte",
    "deck.teilen": "Kartei teilen",
    "deck.training": "Diese Kartei lernen",
    "deck.training.sub": "Kommt in deine täglichen Runden.",
    "deck.waehlen": "Karten auswählen",
    "ed.fett": "Fett",
    "ed.platz.front": "Begriff oder Frage",
    "ed.platz.warum": "Die Erklärung dahinter — nur wenn sie etwas beiträgt",
    "ed.plus.sub": "die dritte Seite",
    "ed.rueckseite": "Rückseite",
    "ed.sprechen": "Einsprechen",
    "ed.unter": "Unterstrichen",
    "ed.vorderseite": "Vorderseite",
    "ed.warum": "Warum?",
    "ed.weg": "Erklärung entfernen",
    "home.angebot": "Übrigens: du kannst mir auch einen anderen Namen geben.",
    "ub.angefangen": "%N% von %G% Karten angefangen — festsitzen braucht ein paar Runden.",
    "ub.gelernt": "Karten gelernt",
    "ub.gelernt.1": "Karte gelernt",
    "ub.geuebt": "zusammen geübt",
    "ub.ruhig": "Diese Woche war noch nichts dran. Auch gut.",
    "ub.titel": "Dein Überblick",
    "ub.wostehst": "Wo du stehst",
    "name.andere": "Andere zeigen",
    "name.passt": "Passt",
    "modus.auto": "Automatisch",
    "modus.auto.sub": "folgt deinem Handy",
    "modus.hell": "Hell",
    "modus.dunkel": "Dunkel",
    "ed.platz.back": "Die kurze Antwort",
    "profil.keinname": "Keinen Namen verwenden",
    "profil.namehinweis": "Ein ausgedachter Name genügt — %N% muss nicht wissen, wie du wirklich heißt.",
    "profil.buddyname": "Wie soll Bloop heißen?",
    "profil.farbhinweis": "Die Farbe färbt die ganze App — auch %N%.",
    "profil.tonhinweis": "Er schaltet ein gleichmäßiges Rauschen an — keine Musik, nur ein ruhiger Ton, der Lärm ringsum überdeckt. Manche bleiben damit besser bei der Sache. Wenn es dich stört: einfach auslassen.",
    "deck.ueben": "Einfach üben",
    "ende.nfest": "%N% Karten sitzen jetzt fest.",
    "ende.nvor": "%N% Karten sind vorgerückt.",
    "deck.imtraining": "Im Training",
    "deck.pausiert.titel": "Pausiert",
    "deck.festzeile": "von %N% Karten sitzen fest",
    "deck.hinzu": "Karte hinzufügen",
    "ed.plus": "+ Erklärung dazu",
    "ub.fuss": "Diese Zahlen bleiben auf deinem Gerät. Niemand sieht sie außer dir — du kannst sie aber jederzeit jemandem zeigen oder als Bild weitergeben. Die großen Zahlen werden nie weniger, auch wenn du länger nichts machst.",
    "deck.faellig": "%N% Karten · %F% heute fällig",
    "ton.aus": "Aus",
    "ton.aus.voll": "Ton aus",
    "ton.braun": "Braun",
    "ton.braun.voll": "Braunes Rauschen",
    "ton.rosa": "Rosa",
    "ton.rosa.voll": "Rosa Rauschen",
    "ton.weiss": "Weiß",
    "ton.weiss.voll": "Weißes Rauschen",
    "ub.festzeile": "%P%% sitzen fest — %F% von %G% Karten",
    "ub.deckzeile": "%P%% sitzen fest · %F% von %G%",
    "ub.bildfest": "%P% % sitzen fest",

    "ub.woche": "Diese Woche %N% %E% in %Z%.",
    "bib.angelegt": "angelegt am",
    "ende.geschafft": "geschafft",
    "foto.erkannt": "erkannt",
    "ton.wechseln": " — tippen zum Wechseln",
    "ton.an": "Hintergrundton: ",
    "allg.fach": "Fach",
    "allg.stapel": "Stapel",
    "allg.karten": "Karten",
    "allg.karte": "Karte",
    "ub.vonkarten": "%F% von %G% Karten",

    "reife.frisch": "frisch",
    "reife.kommt": "sitzt langsam",
    "reife.fest": "sitzt fest",
    "ub.nie": "noch nicht gelernt",
    "ub.bildok": "Bild gespeichert — du findest es bei deinen Downloads.",
    "ub.bildfehler": "Hat nicht geklappt. Probier es nochmal.",
    "ub.jetag": "Beantwortete Karten je Tag: ",
    "name.frage": "Wie sollst du heißen?",
    "name.zurueck": "Zurück zu ",
    "imp.fehler": "Code nicht erkannt. Hast du den ganzen Text kopiert?",
    "spiel.dranstein": "— dein Stein",
    "spiel.dran": "Du bist dran. Tipp auf eine Spalte.",
    "spiel.zuege": "Züge",
    "spiel.vier.sub": "Gegen Robin — leicht, mittel oder knifflig.",
    "rohr.sub2": "Stücke drehen, bis alles am Anschluss hängt.",
    "bib.faecher": "Fächer",
    "bib.alledrin": "Alle übernommen ✓",
    "bib.fachalle": "Ganzes Fach übernehmen",
    "bib.nachfach": "Nach Fach sortiert. Das Alter ist ein Vorschlag, keine Vorschrift.",
    "bib.medien.sub": "Wie Apps funktionieren, was sie mit dir machen — und wie du sie durchschaust.",
    "deck.leer.front": "Die Vorderseite ist noch leer.",
    "deck.leer.back": "Jetzt noch die Rückseite ausfüllen.",
    "deck.pausiert": "Meldet sich nicht. Fortschritt bleibt.",
    "deck.keine": "Noch keine Karten",
    "ende.einefest": "Eine Karte sitzt jetzt fest.",
    "ende.einevor": "Eine Karte ist vorgerückt.",
    "ende.naechstmal": "Beim nächsten Mal sitzen sie besser.",
    "ende.rest": "Es liegt noch mehr — das bloopt in den nächsten Tagen wieder auf. Alles auf einmal bringt ohnehin nichts.",
    "ende.alles": "Das war alles, was heute dran war.",
    "ende.zurdeck": "Zur Kartei",
    "foto.neu": "Neue Kartei aus Foto",
    "foto.anderes": "Anderes Foto wählen",
    "foto.keine": "Noch keine Karten erkannt",
    "sprachwahl.aria": "Sprache wählen",
    "tour.aria": "Kurze Einführung",
    "menue.aria": "Menü",
    "neu.platz": "Name, z. B. Englisch Unit 3",
    "neu.platz2": "Name der Kartei, z. B. Englisch Unit 4",
    "imp.platz": "Kartei-Code hier einfügen…",
    "menue.titel": "Bibliothek, neue Kartei, Ton und mehr",
    "spiel.brett7": "Spielfeld, 7 Spalten mal 6 Zeilen",
    "spiel.brett5": "Spielfeld, 5 mal 5 Felder",
    "tour.weiter.aria": "Weiter",
    "name.eigen": "Oder selbst ausdenken",
    "bib.suche": "Stapel suchen",
    "bib.suchezu": "Suche zurücksetzen",
    "bib.uebweg": "Übung löschen",
    "deck.foto.titel": "Buchseite oder Mitschrift abfotografieren",
    "allg.zuklappen": "Zuklappen",
    "allg.loeschen": "löschen",
    "lern.springen": "Karte im Stapel wählen",
    "ed.lang.front": "Sprache der Vorderseite",
    "ed.lang.back": "Sprache der Rückseite",
    "foto.zeileweg": "Diese Zeile weglassen",
    "ed.vorlesen": "Vorlesen",

    "prof.ton": "Der Kopfhörer beim Lernen",
    "prof.nichts": "Nichts verlässt dein Gerät",
    "name.spaeter": "Später — rate ruhig weiter",
    "name.team": "Teamwork: Ich rate Namen, du rätst Vokabeln.",
    "spiel.gewonnen": "Du hast gewonnen.",
    "spiel.remis": "Unentschieden — auch schön.",
    "rohr.sub": "Tippen dreht ein Stück. Bring alles an den Anschluss oben links.",
    "rohr.fertig": "Alles läuft.",
    "spiel.neu": "Neues Rätsel",
    "spiel.zurueck": "Zug zurück",
    "bib.uebungen": "Meine Übungen",
    "bib.uebungalle": "Übung aus allen",
    "bib.quizsub": "Fragen zum Raten — allein oder gemeinsam.",
    "deck.uebung": "Übung daraus machen",
    "ende.durch": "Diesen Stapel hast du einmal ganz durch.",
    "ende.naechstes": "Als Nächstes passt",
    "ende.spaeter": "Später",
    "foto.titel": "Fotos zu Karten",
    "tour.skip": "Überspringen",
    "tour.weiter": "Weiter",
    "tour.los": "Los geht\u2019s",
    "tour.1.titel": "Hi, ich bin %N%.",
    "tour.1.text": "Ich merke mir, was du dir merken willst. Deine Karten bloopen immer wieder auf, bis du sie kannst — jedes Mal kurz bevor du sie vergessen würdest.",
    "tour.2.titel": "Frage lesen. Überlegen. Umdrehen.",
    "tour.2.text": "Tipp die Karte an, dann siehst du die Antwort.",
    "tour.2.text.gedreht": "Genau so. Bei manchen Karten geht noch mehr: wisch nach oben oder tipp auf „Warum?“.",
    "tour.2.text.warum": "Das ist die dritte Seite — sie gibt es nur bei Bloop Cards. Du musst sie nicht lesen, aber sie ist da, wenn dich interessiert, warum.",
    "tour.3.titel": "Rechts gewusst, links nochmal.",
    "tour.3.text": "Oder tippen. Beides geht. Mehr musst du nicht bedienen.",
    "tour.4.titel": "Zu laut um dich herum?",
    "tour.4.text": "Ein gleichmäßiges Rauschen, das den Lärm ringsum überdeckt. Keine Musik. Probier es aus.",
    "tour.4.text.an": "Das ist %S%. Tipp weiter, um die anderen zu hören — oder wieder aus.",
    "tour.5.titel": "Keine Punkte, keine Serie.",
    "tour.5.text": "Wenn du mal nichts machst, passiert nichts. Ich warte einfach. Es gibt hier nichts zu verlieren.",
    "tour.6.titel": "Niemand schaut dir zu.",
    "tour.6.text": "Kein Konto, keine Anmeldung, keine Werbung. Was du lernst, bleibt auf deinem Gerät — es gibt keinen Server, der es einsammeln könnte.",
    "tour.7.titel": "Und wir verkaufen dich nicht.",
    "tour.7.text": "Keine Serie, die dich zurückholen soll, kein Abo, das mitten im Lernen aufpoppt. Wir verdienen woanders — nicht an deiner Aufmerksamkeit.",
    "tour.8.titel": "Andere Apps machen das anders.",
    "tour.8.text": "Endloses Scrollen, Serien, die abreißen, Videos, die von selbst weiterlaufen — dahinter steckt jedes Mal ein Trick. In der Bibliothek unter „Medien“ stehen sie alle. Ziemlich interessant, wenn man sie einmal durchschaut hat.",
    "home.leer": "Leg deine erste Kartei an — oder hol dir eine aus der Bibliothek.",
    "home.alleweg": "Alle Stapel liegen in der Bibliothek. Hol dir einen zurück, wenn du magst.",
    "home.nichts": "Nichts fällig. Alles sitzt, wo es sitzen soll.",
    "home.ausgesucht": "Ich hab dir %N% Karten rausgesucht.",
    "home.eine": "Eine Karte ist heute dran.",
    "home.mehrere": "Heute sind %N% Karten dran.",
    "home.los": "Los geht\u2019s",
    "home.fuss": "Ohne Konto · ohne Abo · ohne Werbung",
    "home.menue": "Menü öffnen",
    "menue.bib": "Bibliothek",
    "menue.bib.sub": "Deine Karteien, neue dazuholen, Quiz und Spiele",
    "menue.neu": "Neue Kartei",
    "menue.neu.sub": "Selbst anlegen",
    "menue.code": "Kartei per Code",
    "menue.code.sub": "Von jemandem bekommen",
    "menue.ueber": "Dein Überblick",
    "menue.ueber.sub": "Was schon sitzt",
    "menue.profil": "Begleiter und Farbe",
    "menue.profil.sub": "%N%, hell oder dunkel",
    "lern.nochmal": "Nochmal",
    "lern.gewusst": "Gewusst",
    "lern.tipp": "Tippen oder wischen zum Umdrehen",
    "lern.richtig": "Richtig — weiter geht\u2019s…",
    "lern.vorlesen": "vorlesen",
    "lern.aendern": "Karte ändern",
    "lern.hoert": "Ich höre zu",
    "allg.zurueck": "Zurück",
    "allg.heim": "Zur Startseite",
    "ed.speichern": "Speichern",
    "ed.abbrechen": "Abbrechen",
    "profil.sprache": "Sprache",
    "profil.farbe": "Farbe & Helligkeit",
  },
  en: {
    "spiel.gegnerstein": "— %N%'s piece",
    "spiel.denkt": "%N% is thinking…",
    "deck.teilen.text": "Learn with me! Import this set into %N%:",
    "foto.knopf": "Photograph a page",
    "name.andere": "Show others",
    "name.passt": "That's it",
    "modus.auto": "Automatic",
    "modus.auto.sub": "follows your phone",
    "modus.hell": "Light",
    "modus.dunkel": "Dark",
    "ed.platz.back": "The short answer",
    "profil.keinname": "Use no name",
    "profil.namehinweis": "A made-up name is enough — %N% doesn't need to know your real one.",
    "profil.buddyname": "What should Bloop be called?",
    "profil.farbhinweis": "The colour applies to the whole app — including %N%.",
    "profil.tonhinweis": "It turns on a steady sound — not music, just a calm tone that covers the noise around you. Some people focus better with it. If it bothers you, just leave it off.",
    "deck.ueben": "Just practise",
    "ende.nfest": "%N% cards are solid now.",
    "ende.nvor": "%N% cards moved up.",
    "deck.imtraining": "In training",
    "deck.pausiert.titel": "Paused",
    "deck.festzeile": "of %N% cards are solid",
    "deck.hinzu": "Add a card",
    "ed.plus": "+ Add an explanation",
    "ub.fuss": "These numbers stay on your device. Nobody sees them but you — you can show them to someone or share them as an image whenever you like. The big numbers never go down, even if you take a break.",
    "deck.faellig": "%N% cards · %F% due today",
    "allg.fach": "subject",
    "allg.karte": "card",
    "allg.karten": "cards",
    "allg.loeschen": "delete",
    "allg.stapel": "sets",
    "allg.zuklappen": "Collapse",
    "bib.alledrin": "All added ✓",
    "bib.angelegt": "created on",
    "bib.fachalle": "Add the whole subject",
    "bib.faecher": "subjects",
    "bib.medien.sub": "How apps work, what they do to you — and how to see through them.",
    "bib.nachfach": "Sorted by subject. The age is a suggestion, not a rule.",
    "bib.quizsub": "Questions to guess at — alone or together.",
    "bib.suche": "Search sets",
    "bib.suchezu": "Clear search",
    "bib.uebungalle": "Practice from everything",
    "bib.uebungen": "My practice sets",
    "bib.uebweg": "Delete practice set",
    "deck.foto.titel": "Photograph a book page or your notes",
    "deck.keine": "No cards yet",
    "deck.leer.back": "Now fill in the back.",
    "deck.leer.front": "The front is still empty.",
    "deck.pausiert": "Stays quiet. Your progress is kept.",
    "deck.uebung": "Make a practice set",
    "ed.lang.back": "Language of the back",
    "ed.lang.front": "Language of the front",
    "ed.vorlesen": "Read aloud",
    "ende.alles": "That was everything due today.",
    "ende.durch": "You've been through this set once.",
    "ende.einefest": "One card is solid now.",
    "ende.einevor": "One card moved up.",
    "ende.geschafft": "done",
    "ende.naechstes": "Up next",
    "ende.naechstmal": "They'll sit better next time.",
    "ende.rest": "There's more waiting — it'll bloop back up over the next few days. Doing it all at once doesn't help anyway.",
    "ende.spaeter": "Later",
    "ende.zurdeck": "To the set",
    "foto.anderes": "Choose another photo",
    "foto.erkannt": "recognised",
    "foto.keine": "No cards recognised yet",
    "foto.neu": "New set from a photo",
    "foto.titel": "Photos into cards",
    "foto.zeileweg": "Leave out this line",
    "imp.fehler": "Code not recognised. Did you copy the whole text?",
    "imp.platz": "Paste the set code here…",
    "lern.springen": "Pick a card in the set",
    "menue.aria": "Menu",
    "menue.titel": "Library, new set, sound and more",
    "name.eigen": "Or make one up",
    "name.frage": "What should we call you?",
    "name.spaeter": "Later — keep guessing",
    "name.team": "Teamwork: I guess names, you guess words.",
    "name.zurueck": "Back to ",
    "neu.platz": "Name, e.g. English Unit 3",
    "neu.platz2": "Set name, e.g. English Unit 4",
    "prof.nichts": "Nothing leaves your device",
    "prof.ton": "Headphones while you learn",
    "reife.fest": "solid",
    "reife.frisch": "fresh",
    "reife.kommt": "getting there",
    "rohr.fertig": "Everything's flowing.",
    "rohr.sub": "Tap to turn a piece. Connect everything to the inlet at the top left.",
    "rohr.sub2": "Turn the pieces until everything reaches the inlet.",
    "spiel.brett5": "Board, 5 by 5 squares",
    "spiel.brett7": "Board, 7 columns by 6 rows",
    "spiel.dran": "Your turn. Tap a column.",
    "spiel.dranstein": "— your piece",
    "spiel.gewonnen": "You won.",
    "spiel.neu": "New puzzle",
    "spiel.remis": "A draw — also nice.",
    "spiel.vier.sub": "Against your companion — easy, medium or tricky.",
    "spiel.zuege": "Moves",
    "spiel.zurueck": "Undo",
    "sprachwahl.aria": "Choose a language",
    "ton.an": "Background sound: ",
    "ton.aus": "Off",
    "ton.aus.voll": "Sound off",
    "ton.braun": "Brown",
    "ton.braun.voll": "Brown noise",
    "ton.rosa": "Pink",
    "ton.rosa.voll": "Pink noise",
    "ton.wechseln": " — tap to change",
    "ton.weiss": "White",
    "ton.weiss.voll": "White noise",
    "tour.aria": "Quick introduction",
    "tour.weiter.aria": "Next",
    "ub.bildfehler": "That didn't work. Try again.",
    "ub.bildfest": "%P% % solid",
    "ub.bildok": "Image saved — you'll find it in your downloads.",
    "ub.deckzeile": "%P%% solid · %F% of %G%",
    "ub.festzeile": "%P%% solid — %F% of %G% cards",
    "ub.jetag": "Cards answered per day: ",
    "ub.nie": "not learned yet",
    "ub.vonkarten": "%F% of %G% cards",
    "ub.woche": "This week %N% %E% in %Z%.",

    // --- Tour ---
    "tour.skip": "Skip",
    "tour.weiter": "Next",
    "tour.los": "Let's go",
    "tour.1.titel": "Hi, I'm %N%.",
    "tour.1.text": "I remember what you want to remember. Your cards bloop back up until you know them — each time just before you'd forget.",
    "tour.2.titel": "Read. Think. Flip.",
    "tour.2.text": "Tap the card to see the answer.",
    "tour.2.text.gedreht": "Exactly. Some cards have more: swipe up or tap \u201eWhy?\u201c.",
    "tour.2.text.warum": "That's the third side — only Bloop Cards have it. You don't have to read it, but it's there when you wonder why.",
    "tour.3.titel": "Right if you knew it, left to try again.",
    "tour.3.text": "Or tap. Both work. There's nothing else to learn.",
    "tour.4.titel": "Too noisy around you?",
    "tour.4.text": "A steady sound that covers the noise around you. Not music. Give it a try.",
    "tour.4.text.an": "That's %S%. Tap again for the others — or to turn it off.",
    "tour.5.titel": "No points, no streak.",
    "tour.5.text": "If you do nothing for a while, nothing happens. I just wait. There's nothing to lose here.",
    "tour.6.titel": "Nobody is watching you.",
    "tour.6.text": "No account, no sign-up, no ads. What you learn stays on your device — there is no server that could collect it.",
    "tour.7.titel": "And we don't sell you.",
    "tour.7.text": "No streak to drag you back, no subscription popping up mid-session. We earn our money elsewhere — not from your attention.",
    "tour.8.titel": "Other apps do it differently.",
    "tour.8.text": "Endless scrolling, streaks that break, videos that play by themselves — there's a trick behind every one. They're all in the library under \u201eMedia\u201c. Quite interesting once you see through them.",
    // --- Startseite ---
    "home.leer": "Make your first set — or pick one up from the library.",
    "home.alleweg": "All your sets are resting in the library. Bring one back whenever you like.",
    "home.nichts": "Nothing due. Everything is sitting where it should.",
    "home.ausgesucht": "I picked out %N% cards for you.",
    "home.eine": "One card is due today.",
    "home.mehrere": "%N% cards are due today.",
    "home.los": "Let's go",
    "home.fuss": "No account \u00b7 no subscription \u00b7 no ads",
    "home.menue": "Open menu",
    "home.angebot": "By the way: you can give me a different name.",
    // --- Menue ---
    "menue.bib": "Library",
    "menue.bib.sub": "Your sets, new ones, quizzes and games",
    "menue.neu": "New set",
    "menue.neu.sub": "Make your own",
    "menue.code": "Set from a code",
    "menue.code.sub": "Someone sent you one",
    "menue.ueber": "Your progress",
    "menue.ueber.sub": "What's sticking",
    "menue.profil": "Companion and colour",
    "menue.profil.sub": "%N%, light or dark",
    "allg.heim": "Home",
    // --- Lernen ---
    "lern.nochmal": "Again",
    "lern.gewusst": "Got it",
    "lern.tipp": "Tap or swipe to flip",
    "lern.richtig": "Correct — moving on…",
    "lern.vorlesen": "read aloud",
    "lern.aendern": "Edit card",
    "lern.hoert": "I'm listening",
    // --- Karteneditor ---
    "ed.vorderseite": "Front",
    "ed.rueckseite": "Back",
    "ed.warum": "Why?",
    "ed.platz.front": "Term or question",
    "ed.platz.back": "The short answer",
    "ed.platz.warum": "The explanation behind it — only if it adds something",
    "ed.plus": "+ Add an explanation",
    "ed.plus.sub": "the third side",
    "ed.weg": "Remove explanation",
    "ed.speichern": "Save",
    "ed.abbrechen": "Cancel",
    "ed.fett": "Bold",
    "ed.unter": "Underlined",
    "ed.sprechen": "Speak",
    // --- Fortschritt ---
    "ub.titel": "Your progress",
    "ub.gelernt": "cards learned",
    "ub.gelernt.1": "card learned",
    "ub.angefangen": "%N% of %G% cards started — sticking takes a few rounds.",
    "ub.wostehst": "WHERE YOU STAND",
    "ub.geuebt": "practised in total",
    "ub.ruhig": "Nothing was due this week. That's fine too.",
    "ub.fuss": "These numbers stay on your device. Nobody sees them but you — you can show them to someone whenever you like. The big numbers never go down, even if you take a break.",
    // --- Bibliothek ---
    "bib.hinzu": "Add",
    // --- Kartei ---
    "deck.karte": "+ Card",
    "deck.alle": "All cards",
    "deck.waehlen": "Select cards",
    "deck.training": "In training",
    "deck.training.sub": "Comes up in your daily rounds.",
    "deck.beide.sub": "Loop it both ways until it all sticks.",
    "deck.eine.sub": "Front to back only.",
    "deck.teilen": "Share",
    // --- Profil ---
    "profil.farbe": "Colour and brightness",
    "profil.sprache": "Language",
    // --- Sprachwahl ---
    // --- Allgemein ---
    "allg.zurueck": "Back",
    "allg.schliessen": "Close",
  },
};

function t(schluessel) {
  /* Defensiv, und zwar aus Erfahrung: esbuild macht aus einem Top-Level-`const`
     ein `var`. Wird t() aufgerufen, bevor die Zuweisung gelaufen ist, ist TEXTE
     schlicht `undefined` statt einen klaren Fehler zu werfen - die App blieb
     dann kommentarlos im Ladebildschirm stehen. Deshalb steht der Sprachblock
     ganz oben in der Datei UND t() faengt den Fall ab. Im schlimmsten Fall
     steht ein Schluessel auf dem Bildschirm; die App laeuft weiter. */
  if (typeof TEXTE === "undefined" || !TEXTE) return schluessel;
  const eigen = TEXTE[SPR];
  if (eigen && eigen[schluessel] != null) return eigen[schluessel];
  const de = TEXTE.de && TEXTE.de[schluessel];
  return de != null ? de : schluessel;
}

const STYLES = `
/* Vier geprueffte Paletten. Jede erfuellt 4.5:1 in hell UND dunkel - fuer den
   Knopf (Schrift auf Akzent), den Akzent als Text auf dem Grund, den Fliesstext
   und die leise Schrift. Erzeugt und geprueft von marke/paletten.py; von Hand
   nachbessern heisst, die Pruefung zu umgehen.
   Die Figur (--begleiter) darf heller leuchten als die Bedienfarbe (--accent):
   ein Bild muss gefallen, ein Knopf muss lesbar sein. */
/* Vier geprueffte Paletten. Jede erfuellt 4.5:1 in hell UND dunkel - fuer den
   Knopf (Schrift auf Akzent), den Akzent als Text auf dem Grund, den Fliesstext
   und die leise Schrift. Erzeugt und geprueft aus marke/paletten.json; von Hand
   nachbessern heisst, die Pruefung zu umgehen.
   Die Figur (--begleiter) darf heller leuchten als die Bedienfarbe (--accent):
   ein Bild muss gefallen, ein Knopf muss lesbar sein.

   Der Dunkelmodus hat DREI Zustaende, nicht zwei: "automatisch" folgt dem System
   und stempelt nichts, "hell" und "dunkel" stempeln data-modus. Deshalb steht
   jeder dunkle Satz zweimal - einmal hinter der Systemabfrage mit
   :not([data-modus="hell"]), damit eine bewusste Wahl das System schlaegt, und
   einmal fuer [data-modus="dunkel"], damit sie auch in die andere Richtung wirkt. */
/* Vier geprueffte Paletten, erzeugt aus marke/paletten.json.
   Geprueft wird: Knopf (Schrift auf Akzent), Akzent als Text auf dem Grund,
   Fliesstext und leise Schrift jeweils >= 4.5:1 - in hell UND dunkel.
   Die drei Reifegrade (frisch/kommt/fest) liegen in drei GLEICH grossen
   Schritten zwischen Grund und Akzent. Vorher war --stufe-kommt an die
   Figurfarbe gebunden und im Dunkelmodus mit dem Akzent identisch: der
   Fortschrittsbalken war unlesbar und Vier gewinnt unspielbar.
   Der dunkle Grund ist fast neutral (nur ein Hauch Farbton). Satt getoente
   Gruende wirkten wie eine Farbfolie ueber dem Bild.
   Die Figur (--begleiter) darf heller leuchten als die Bedienfarbe. */
:root{
  --r-s:12px; --r-m:16px; --r-l:20px; --r-xl:24px;
  --danger:#B3382C;
  --disp:ui-rounded,'SF Pro Rounded','Nunito',system-ui,-apple-system,'Segoe UI',sans-serif;
  --ui:ui-rounded,'SF Pro Rounded','Nunito',system-ui,-apple-system,'Segoe UI',sans-serif;
}
/* ============================================================
 * Ein Grundton fuer alle Themes, Farbe nur im Akzent
 * ============================================================
 * Vorher trug jede Palette ihren eigenen Grund und ihre eigene Tinte: Koralle
 * einen rosa Grund mit brauner Schrift, Mint einen gruenlichen mit gruener.
 * Das sah nach Farbfolie aus statt nach Gestaltung - Marcs Beobachtung, und sie
 * trifft zu.
 *
 * Jetzt gibt es genau zwei Grundtoene in der ganzen App: #F6F7F8 hell und
 * #0E0F11 dunkel, beide neutral mit einem Hauch kuehl. Die Palette faerbt nur
 * noch, was faerben soll: Akzent, Figur, Reifegrade.
 *
 * Zwei Nebeneffekte, die beide erwuenscht sind:
 * - **Fliesstext sieht in jedem Theme gleich aus.** Ein Wechsel der Farbe
 *   aendert nicht mehr die Lesefarbe, sondern nur die Bedienfarbe.
 * - Es wirkt ruhiger, weil die grosse Flaeche nichts mehr behauptet.
 *
 * Beim Wechsel nachgerechnet (gemessen am gebauten Stand, nicht geschaetzt):
 * Knopftext, Akzent-als-Text, Fliesstext und leise Schrift liegen in allen vier
 * Paletten und beiden Modi ueber 4.5:1, die Figur ueber 3:1.
 * Drei Akzente mussten dafuer minimal nachdunkeln (mint, koralle, blau), weil
 * der neue Grund heller ist als der jeweils getoente vorher.
 * **Die Mint-Figur war mit 2.0:1 schon vorher zu blass** - das fiel erst beim
 * Nachmessen auf und ist mit #359E80 behoben.
 *
 * Wer eine Palette ergaenzt: NUR Akzent, Figur und Reifegrade setzen. Grund,
 * Karte, Tinte und Linie bleiben, wie sie sind.
 */
:root,
.kbx[data-farbe="violett"]{
  --begleiter:#8349C5; --begleiter-satt:#6D36AC; --auf:#FFFFFF;
  --accent:#8045C4; --accent-press:#6D36AC; --stufe-fest:#8045C4;
  --paper:#F6F7F8; --card:#FFFFFF; --ink:#232830; --ink-soft:#666E7A; --line:#E2E5E9; --rule:#E2E5E9;
  --stufe-frisch:#C4B7D3; --stufe-kommt:#9F7EC6; --gegner:#E8A83A;
}
.kbx[data-farbe="mint"]{
  --begleiter:#359E80; --begleiter-satt:#1F634F; --auf:#FFFFFF;
  --accent:#267E65; --accent-press:#1F634F; --stufe-fest:#267E65;
  --paper:#F6F7F8; --card:#FFFFFF; --ink:#232830; --ink-soft:#666E7A; --line:#E2E5E9; --rule:#E2E5E9;
  --stufe-frisch:#AACBC1; --stufe-kommt:#4AA78D; --gegner:#E8A83A;
}
.kbx[data-farbe="koralle"]{
  --begleiter:#D15B3D; --begleiter-satt:#A13E26; --auf:#FFFFFF;
  --accent:#BE482B; --accent-press:#A13E26; --stufe-fest:#BE482B;
  --paper:#F6F7F8; --card:#FFFFFF; --ink:#232830; --ink-soft:#666E7A; --line:#E2E5E9; --rule:#E2E5E9;
  --stufe-frisch:#D6BCB5; --stufe-kommt:#CB8472; --gegner:#E8A83A;
}
.kbx[data-farbe="blau"]{
  --begleiter:#497FC5; --begleiter-satt:#32609D; --auf:#FFFFFF;
  --accent:#3970B8; --accent-press:#32609D; --stufe-fest:#3970B8;
  --paper:#F6F7F8; --card:#FFFFFF; --ink:#232830; --ink-soft:#666E7A; --line:#E2E5E9; --rule:#E2E5E9;
  --stufe-frisch:#B7C3D3; --stufe-kommt:#7899C3; --gegner:#E8A83A;
}
@media (prefers-color-scheme: dark){
  :root{ --danger:#FF8D7E; }
  .kbx[data-farbe="violett"]:not([data-modus="hell"]){
    --begleiter:#9B6CD0; --begleiter-satt:#B28EDB; --auf:#0E0F11;
    --accent:#9B6CD0; --accent-press:#B28EDB; --stufe-fest:#9B6CD0;
    --paper:#0E0F11; --card:#1A1C1F; --ink:#F0F1F3; --ink-soft:#838A96; --line:#34383E; --rule:#34383E;
    --stufe-frisch:#433454; --stufe-kommt:#7348A3; --gegner:#F2BE55;
  }
  .kbx[data-farbe="mint"]:not([data-modus="hell"]){
    --begleiter:#3DC29C; --begleiter-satt:#60CDAE; --auf:#0E0F11;
    --accent:#3DC29C; --accent-press:#60CDAE; --stufe-fest:#3DC29C;
    --paper:#0E0F11; --card:#1A1C1F; --ink:#F0F1F3; --ink-soft:#838A96; --line:#34383E; --rule:#34383E;
    --stufe-frisch:#2F4C44; --stufe-kommt:#3A826D; --gegner:#F2BE55;
  }
  .kbx[data-farbe="koralle"]:not([data-modus="hell"]){
    --begleiter:#D36043; --begleiter-satt:#DC7F68; --auf:#0E0F11;
    --accent:#D36043; --accent-press:#DC7F68; --stufe-fest:#D36043;
    --paper:#0E0F11; --card:#1A1C1F; --ink:#F0F1F3; --ink-soft:#838A96; --line:#34383E; --rule:#34383E;
    --stufe-frisch:#50342D; --stufe-kommt:#924836; --gegner:#F2BE55;
  }
  .kbx[data-farbe="blau"]:not([data-modus="hell"]){
    --begleiter:#5184C8; --begleiter-satt:#749DD3; --auf:#0E0F11;
    --accent:#5184C8; --accent-press:#749DD3; --stufe-fest:#5184C8;
    --paper:#0E0F11; --card:#1A1C1F; --ink:#F0F1F3; --ink-soft:#838A96; --line:#34383E; --rule:#34383E;
    --stufe-frisch:#2F3C4C; --stufe-kommt:#3D5F8A; --gegner:#F2BE55;
  }
}
.kbx[data-farbe="violett"][data-modus="dunkel"]{
  --begleiter:#9B6CD0; --begleiter-satt:#B28EDB; --auf:#0E0F11;
  --accent:#9B6CD0; --accent-press:#B28EDB; --stufe-fest:#9B6CD0;
  --paper:#0E0F11; --card:#1A1C1F; --ink:#F0F1F3; --ink-soft:#838A96; --line:#34383E; --rule:#34383E;
  --stufe-frisch:#433454; --stufe-kommt:#7348A3; --gegner:#F2BE55;
}
.kbx[data-farbe="mint"][data-modus="dunkel"]{
  --begleiter:#3DC29C; --begleiter-satt:#60CDAE; --auf:#0E0F11;
  --accent:#3DC29C; --accent-press:#60CDAE; --stufe-fest:#3DC29C;
  --paper:#0E0F11; --card:#1A1C1F; --ink:#F0F1F3; --ink-soft:#838A96; --line:#34383E; --rule:#34383E;
  --stufe-frisch:#2F4C44; --stufe-kommt:#3A826D; --gegner:#F2BE55;
}
.kbx[data-farbe="koralle"][data-modus="dunkel"]{
  --begleiter:#D36043; --begleiter-satt:#DC7F68; --auf:#0E0F11;
  --accent:#D36043; --accent-press:#DC7F68; --stufe-fest:#D36043;
  --paper:#0E0F11; --card:#1A1C1F; --ink:#F0F1F3; --ink-soft:#838A96; --line:#34383E; --rule:#34383E;
  --stufe-frisch:#50342D; --stufe-kommt:#924836; --gegner:#F2BE55;
}
.kbx[data-farbe="blau"][data-modus="dunkel"]{
  --begleiter:#5184C8; --begleiter-satt:#749DD3; --auf:#0E0F11;
  --accent:#5184C8; --accent-press:#749DD3; --stufe-fest:#5184C8;
  --paper:#0E0F11; --card:#1A1C1F; --ink:#F0F1F3; --ink-soft:#838A96; --line:#34383E; --rule:#34383E;
  --stufe-frisch:#2F3C4C; --stufe-kommt:#3D5F8A; --gegner:#F2BE55;
}
.kbx[data-modus="dunkel"]{ --danger:#FF8D7E; }
*{box-sizing:border-box}
.kbx{ font-family:var(--ui); color:var(--ink); background:var(--paper); min-height:100dvh;
  display:flex; justify-content:center; -webkit-font-smoothing:antialiased; }
.frame{ width:100%; max-width:480px; min-height:100dvh;
  padding:22px 20px max(10px,env(safe-area-inset-bottom)); display:flex; flex-direction:column; }

.topbar{ display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; min-height:34px; }
.topbar-actions{ display:flex; gap:2px; }
.topbar-rechts{ display:flex; align-items:center; gap:8px; }
.zaehler{ font-size:13px; color:var(--ink-soft); }
.brand{ font-family:var(--disp); font-weight:800; font-size:22px; letter-spacing:-.02em;
  display:flex; align-items:center; gap:9px; }
.brand-mark{ color:var(--begleiter); display:flex; flex-shrink:0; }
.brand-heim{ background:none; border:none; cursor:pointer; color:inherit; padding:6px 8px 6px 0;
  margin-left:-2px; border-radius:10px; }
.brand-heim:hover{ background:var(--card); }
.back-link{ background:none; border:none; color:var(--ink-soft); font-family:var(--ui);
  font-size:15px; cursor:pointer; padding:12px 6px; display:flex; align-items:center; gap:6px; }
/* Heimweg: Feder + Name. Grosse Trefferflaeche, auch fuer kleine Finger. */
.zurueck-knopf{ display:flex; align-items:center; gap:5px; background:none; border:none;
  cursor:pointer; color:var(--ink); font-family:var(--ui); font-size:16px;
  min-height:46px; padding:8px 12px 8px 6px; margin:-6px 0 6px -6px; border-radius:12px; }
.zurueck-knopf:hover{ background:var(--card); }
.zurueck-knopf svg{ width:20px; height:20px; }
.home-brand{ background:none; border:none; cursor:pointer; color:var(--ink);
  font-family:var(--disp); font-weight:600; font-size:19px; letter-spacing:-.01em;
  display:flex; align-items:center; gap:8px; min-height:46px; padding:8px 12px 8px 10px;
  margin-left:-10px; border-radius:14px; }
.home-brand:hover{ background:var(--card); }
.home-brand .brand-mark{ margin-top:1px; }
.topbar-left{ display:flex; align-items:center; gap:2px; min-width:0; }
.back-link:hover{ color:var(--ink); }
.back-label{ max-width:min(46vw,240px); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.icon-btn{ background:none; border:1px solid transparent; border-radius:10px; color:var(--ink-soft);
  cursor:pointer; padding:12px; display:flex; align-items:center; justify-content:center; }
.icon-btn:hover{ color:var(--ink); border-color:var(--line); background:var(--card); }
.icon-btn.danger:hover{ color:var(--danger); border-color:var(--danger); }
.deck.resting{ opacity:.62; }
.rest-title{ display:flex; align-items:center; gap:8px; background:none; border:none; padding:14px 2px 6px;
  font-family:var(--ui); font-size:11px; font-weight:800; letter-spacing:.09em; text-transform:uppercase;
  color:var(--ink-soft); cursor:pointer; width:100%; }

.h1{ font-family:var(--disp); font-size:28px; font-weight:800; letter-spacing:-.02em; margin:2px 0 2px; }
.sub{ color:var(--ink-soft); font-size:13px; font-weight:600; margin-bottom:22px; }
.btn{ font-family:var(--ui); font-weight:800; font-size:16px; border-radius:18px; cursor:pointer;
  border:1px solid transparent; padding:13px 16px; transition:transform .08s ease, background .15s ease; }
.btn:active{ transform:translateY(1px); }
/* Volle Breite auf dem Handy - dort gehoert die Hauptsache unter den Daumen.
   Auf breiten Schirmen aber gedeckelt: ein 720 Pixel breiter Knopf sieht nicht
   wichtiger aus, sondern unfertig. */
.btn-primary{ background:var(--accent); color:var(--auf); width:100%;
  max-width:420px; margin-inline:auto;
  box-shadow:0 3px 0 var(--accent-press); }
.btn-primary:hover{ background:var(--accent-press); }
/* Vorher weiss auf var(--ink-soft) = Kontrast 1.8, der Text war schlicht weg. Jetzt 4.8. */
/* Der ausgegraute Knopf hatte weiter die farbige Unterkante - das sah aus wie
   ein Fehler, nicht wie "geht gerade nicht". Beides muss zusammen ausgrauen. */
.btn-primary:disabled{ background:var(--ink-soft); cursor:default;
  box-shadow:0 3px 0 var(--line); }
.btn-ghost{ background:var(--card); border:none; box-shadow:0 3px 0 var(--line); color:var(--ink); }
.btn-ghost:hover{ box-shadow:0 3px 0 var(--ink-soft); }
:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }

/* „Heute“: Robins Satz zur Lage und der eine Weg ins Lernen. */
/* Eintritt */
.eintritt{ position:fixed; inset:0; z-index:50; background:var(--paper); color:var(--accent);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px;
  animation:eintrittAus .42s ease-in 1.05s forwards; }
.eintritt-octo{ animation:octoAuf .5s cubic-bezier(.34,1.4,.5,1) both; }
@keyframes octoAuf{ from{ opacity:0; transform:scale(.7) translateY(10px) } to{ opacity:1; transform:none } }
/* Die Pupillen sind das einzige Bewegliche am Begleiter. Ein weicher Uebergang
   genuegt - jede groessere Bewegung wuerde vom Lernen ablenken. */
.octo-pupille{ transition:transform .3s cubic-bezier(.34,1.4,.5,1); }
.eintritt-name{ font-family:var(--disp); font-size:30px; font-weight:800; color:var(--ink); letter-spacing:-.02em;
  opacity:0; animation:nameAuf .5s ease .58s forwards; }
@keyframes nameAuf{ from{ opacity:0; transform:translateY(5px) } to{ opacity:1; transform:none } }
@keyframes eintrittAus{ to{ opacity:0; visibility:hidden } }
@media (prefers-reduced-motion: reduce){
  .eintritt{ animation:eintrittAus .3s ease 0.8s forwards }
  .eintritt-octo{ animation:none; opacity:1; transform:none }
  .octo-pupille{ transition:none }
  .eintritt-name{ opacity:1; animation:none }
}

/* Überblick */
.ub-held{ position:relative; width:min(66vw,224px); margin:6px auto 0; aspect-ratio:1; }
.ub-auf{ animation:ubAuf .55s cubic-bezier(.2,.7,.2,1) both; }
@keyframes ubAuf{ from{ opacity:0; transform:scale(.92) } to{ opacity:1; transform:none } }
.ub-bogen{ opacity:0; animation:bogenAuf .5s ease forwards; }
@keyframes bogenAuf{ to{ opacity:1 } }
.ub-legende-gross span{ opacity:0; animation:ubAuf .45s ease .55s both; }
.ub-fakten{ opacity:0; animation:ubAuf .45s ease .7s both; }
.ub-stapel{ opacity:0; animation:ubAuf .45s ease .82s both; }
@media (prefers-reduced-motion: reduce){
  .ub-auf,.ub-bogen,.ub-legende-gross span,.ub-fakten,.ub-stapel{ animation:none; opacity:1; transform:none }
}
.ub-ring{ width:100%; height:100%; transform:rotate(-90deg); }
.ub-ring circle{ fill:none; stroke-width:13; stroke-linecap:butt; }
.ub-ring-grund{ stroke:var(--line); }
.ub-bogen.frisch{ stroke:var(--stufe-frisch); } .ub-bogen.kommt{ stroke:var(--stufe-kommt); } .ub-bogen.fest{ stroke:var(--stufe-fest); }
.ub-mitte{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
  justify-content:center; text-align:center; }
/* Der Text muss in den Innenkreis passen, sonst laeuft er auf den Ring. */
.ub-mitte b, .ub-mitte span{ max-width:62%; }
.ub-mitte b{ font-family:var(--disp); font-size:46px; font-weight:600; line-height:1; letter-spacing:-.02em; }
.ub-mitte span{ font-size:13px; color:var(--ink-soft); margin-top:4px; }
.ub-legende-gross{ justify-content:center; gap:14px; margin-top:16px; font-size:13px; }
.ub-fakten{ display:flex; background:var(--card); border:none; box-shadow:0 2px 0 var(--line); border-radius:var(--r-l);
  margin-top:22px; overflow:hidden; }
.ub-fakten > div{ flex:1; padding:15px 8px; text-align:center; border-left:1px solid var(--line); }
.ub-fakten > div:first-child{ border-left:none; }
.ub-fakten b{ font-family:var(--disp); font-size:19px; font-weight:800; display:block;
  line-height:1.2; white-space:nowrap; letter-spacing:-.01em; }
.ub-fakten span{ font-size:11.5px; color:var(--ink-soft); display:block; margin-top:3px; }
.ub-seit{ font-size:13px; color:var(--ink-soft); margin-top:10px; text-align:center; }
.ub-stapel{ display:block; width:100%; text-align:left; background:var(--card); border:none;
  box-shadow:0 2px 0 var(--line); border-radius:var(--r-m); padding:14px 16px; margin-bottom:10px; cursor:pointer; font:inherit; color:inherit; }
.ub-kopf{ display:flex; flex-direction:column; gap:2px; margin-bottom:10px; }
.ub-leiste{ display:flex; gap:2px; height:8px; border-radius:5px; overflow:hidden; background:var(--line); }
.ub-teil{ display:block; }
.ub-teil.frisch{ background:var(--stufe-frisch); }
.ub-teil.kommt{ background:var(--stufe-kommt); }
.ub-teil.fest{ background:var(--stufe-fest); }
.ub-legende{ display:flex; flex-wrap:wrap; gap:12px; margin-top:9px; font-size:12px; color:var(--ink-soft); }
.ub-punkt{ display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:5px; }
.ub-punkt.frisch{ background:var(--stufe-frisch); } .ub-punkt.kommt{ background:var(--stufe-kommt); } .ub-punkt.fest{ background:var(--accent); }
.schluss-ring{ position:relative; width:172px; aspect-ratio:1; margin:6px auto 2px; }
.schluss-ring .ub-mitte b{ font-size:38px; }
.schluss-ring .ub-mitte span{ font-size:12px; line-height:1.25; }
.schluss-satz{ font-family:var(--disp); font-size:19px; font-weight:500; color:var(--ink);
  margin-top:2px; opacity:0; animation:ubAuf .45s ease .75s both; }
@media (prefers-reduced-motion: reduce){ .schluss-satz{ animation:none; opacity:1 } }
.ub-fuss{ font-size:12.5px; color:var(--ink-soft); line-height:1.5; margin-top:22px; }

/* Der freie Platz der Startseite gehoert VOR und NACH den Gruss, nicht zwischen
   Knopf und Fusszeile. Vorher trugen Startrampe und Fusszeile je ein
   margin-top:auto - die teilten sich den Rest, und heraus kamen zwei Loecher:
   der Gruss klebte oben, der Knopf schwebte in der Mitte. Jetzt sitzt der Gruss
   im oberen Drittel, der Knopf in Daumennaehe, die Fusszeile direkt darunter. */
.today{ margin:auto 0 22px; text-align:center; }
.startrampe{ margin-top:auto; padding-top:26px; }
.ausblick{ display:flex; flex-wrap:wrap; gap:6px; margin-top:12px; justify-content:center; }
.chip-still{ font-size:12px; font-weight:700; color:var(--ink-soft); background:var(--card); border:none; box-shadow:0 2px 0 var(--line);
  border-radius:999px; padding:6px 12px; }
.feier{ position:fixed; inset:0; z-index:60; background:color-mix(in srgb,var(--paper) 94%,transparent); cursor:pointer;
  display:flex; align-items:center; justify-content:center; overflow:hidden;
  animation:ubAuf .35s ease both; }
.feier-regen{ position:absolute; inset:0; pointer-events:none; }
.schnipsel{ position:absolute; top:-6vh; border-radius:1px; opacity:.95;
  animation-name:regnen; animation-timing-function:linear; animation-iteration-count:1;
  animation-fill-mode:forwards; }
.schnipsel.f0{ background:var(--accent); }
.schnipsel.f1{ background:var(--stufe-kommt); }
.schnipsel.f2{ background:var(--stufe-kommt); }
.schnipsel.f3{ background:var(--ink); }
@keyframes regnen{
  0%{ transform:translateY(0) rotate(0) }
  100%{ transform:translateY(112vh) rotate(var(--dreh)) }
}
.feier-text{ position:relative; text-align:center; }
.feier-zahl{ font-family:var(--disp); font-size:76px; font-weight:600; line-height:1;
  letter-spacing:-.03em; color:var(--accent); }
.feier-was{ font-size:15px; color:var(--ink-soft); margin-top:6px; }
.feier-lob{ font-family:var(--disp); font-size:24px; font-weight:500; margin-top:20px; }
@media (prefers-reduced-motion: reduce){ .schnipsel{ display:none } .feier{ animation:none } }
/* Volle Deckung, Inhalt trotzdem 480px schmal - dieselbe Falle wie bei .tour:
   ein position:fixed mit max-width deckt nur einen Streifen, daneben laeuft
   die Seite darunter sichtbar weiter. */
.namenswahl{ position:fixed; inset:0; z-index:40; background:var(--paper); overflow-y:auto;
  padding-left:max(22px,calc((100vw - 480px) / 2)); padding-right:max(22px,calc((100vw - 480px) / 2)); padding-top:max(26px,env(safe-area-inset-top)); padding-bottom:max(26px,env(safe-area-inset-bottom)); display:flex; flex-direction:column;
  justify-content:center;  
  animation:ubAuf .4s cubic-bezier(.2,.7,.2,1) both; }
.nw-liste{ display:flex; flex-wrap:wrap; gap:8px; }
.nw-liste .chip{ font-size:15px; padding:11px 16px; }
.chip-wuerfel{ color:var(--ink-soft); }
.nw-team{ font-size:14px; color:var(--ink-soft); margin-top:22px; }
/* Robin spricht, und zwar gross. Das Zitatzeichen sitzt als eigenes Element darueber —
   es ist Ornament, kein Satzzeichen, und wird deshalb vom Screenreader ausgelassen. */
.gruss{ margin:4px 0 14px; }
.gruss-text{ display:block; font-family:var(--disp); font-size:40px;
  font-weight:800; line-height:1.12; letter-spacing:-.03em; color:var(--ink); text-wrap:balance; }
.gruss.mittel .gruss-text{ font-size:31px; letter-spacing:-.025em; }
.gruss.klein .gruss-text{ font-size:24px; line-height:1.22; letter-spacing:-.015em; }
.today-say{ font-family:var(--ui); font-size:13px; font-weight:600; line-height:1.4;
  color:var(--ink-soft); margin-bottom:14px; text-wrap:balance; }
.btn-go{ width:100%; max-width:420px; margin-inline:auto; font-size:16px;
  padding:16px; letter-spacing:-.01em; }
.start-row{ display:flex; gap:10px; margin-bottom:10px; }
.start-row .btn{ flex:1; padding:14px; justify-content:center; }

/* .deck und .tile sind Knoepfe (Tastatur!) — der Reset holt das Aussehen zurueck. */
.deck,.tile{ display:block; width:100%; text-align:left; font:inherit; color:inherit; -webkit-appearance:none; }
.deck{ background:var(--card); border:none; box-shadow:0 3px 0 var(--line); border-radius:var(--r-l); padding:16px 18px;
  margin-bottom:12px; cursor:pointer; transition:border-color .15s ease, transform .08s ease; }
.deck:hover{ border-color:var(--ink-soft); }
.deck:active{ transform:translateY(1px); }
.deck-row{ display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
.deck-name{ font-family:var(--disp); font-size:17px; font-weight:800; letter-spacing:-.01em; }
.deck-due{ font-size:12px; color:var(--accent); font-weight:800; white-space:nowrap; }
.deck-due.zero{ color:var(--ink-soft); font-weight:500; }
.deck-meta{ font-size:11.5px; font-weight:600; color:var(--ink-soft); margin-top:6px; }
.minibar{ display:flex; gap:3px; margin-top:10px; height:5px; }
.minibar span{ flex:1; background:var(--line); border-radius:3px; }
.minibar span.on{ background:var(--accent); opacity:.75; }

.field{ width:100%; font-family:var(--ui); font-size:15px; color:var(--ink);
  background:var(--card); border:1px solid var(--line); border-radius:var(--r-m); padding:13px 14px; }
.field::placeholder{ color:var(--ink-soft); }
.field:focus{ border-color:var(--accent); outline:none; }
.newdeck{ display:flex; gap:8px; margin-top:14px; }
.newdeck .btn{ padding:12px 16px; white-space:nowrap; }
.btn-ico{ display:inline-flex; align-items:center; gap:7px; }
.btn-ico svg{ width:19px; height:19px; color:var(--accent); flex-shrink:0; }
.link-inline{ background:none; border:none; color:var(--accent); font-family:var(--ui);
  font-size:13px; font-weight:500; cursor:pointer; padding:10px 0 0; }
.link-inline:hover{ color:var(--accent-press); }

.strip{ display:flex; gap:6px; margin:6px 0 22px; }
.slot{ flex:1; background:var(--card); border:none; box-shadow:0 2px 0 var(--line); border-radius:var(--r-s);
  padding:10px 4px 8px; text-align:center; position:relative; }
.slot.hasdue{ border-color:var(--accent); }
.slot-tab{ position:absolute; top:-1px; left:50%; transform:translateX(-50%);
  width:34%; height:4px; background:var(--line); border-radius:0 0 3px 3px; }
.slot.hasdue .slot-tab{ background:var(--accent); }
.slot-count{ font-family:var(--disp); font-size:20px; font-weight:500; line-height:1; }
.slot-label{ font-size:9.5px; color:var(--ink-soft); margin-top:5px; letter-spacing:.02em; }

.panel{ background:var(--card); border:none; box-shadow:0 2px 0 var(--line); border-radius:var(--r-l); padding:16px; margin-bottom:22px; }
.panel-title{ font-size:11px; font-weight:800; letter-spacing:.09em; text-transform:uppercase;
  color:var(--ink-soft); margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; gap:8px; }
.panel-close{ background:none; border:none; color:var(--ink-soft); cursor:pointer; font-size:20px; line-height:1; padding:0 2px; }
.panel-close:hover{ color:var(--ink); }
.dual{ display:flex; flex-direction:column; gap:9px; }
.fieldrow{ display:flex; gap:8px; align-items:center; }
.fieldrow .field{ flex:1; }
.spk{ background:var(--card); border:1px solid var(--line); border-radius:10px; width:44px; height:44px;
  flex-shrink:0; cursor:pointer; color:var(--accent); display:flex; align-items:center; justify-content:center; }
.spk:hover{ border-color:var(--accent); }
.spk:disabled{ color:var(--line); cursor:default; }
.mic-row{ display:flex; align-items:center; gap:10px; margin-top:12px; }
.mic{ width:52px; height:52px; border-radius:50%; border:none; cursor:pointer; flex-shrink:0;
  background:var(--accent); color:var(--auf); display:flex; align-items:center; justify-content:center;
  transition:transform .1s ease, background .15s ease; }
.mic:hover{ background:var(--accent-press); }
.mic:disabled{ background:var(--line); cursor:default; }
.mic.live{ background:var(--danger); animation:pulse 1.3s ease-in-out infinite; }
@keyframes pulse{ 0%,100%{ box-shadow:0 0 0 0 rgba(154,59,52,.35);} 50%{ box-shadow:0 0 0 9px rgba(154,59,52,0);} }
.mic-hint{ font-size:12px; color:var(--ink-soft); line-height:1.45; }
.target-toggle{ display:flex; gap:6px; margin-bottom:11px; align-items:center; }
.chip{ font-size:12px; font-weight:600; padding:7px 13px; border-radius:999px; cursor:pointer;
  border:none; box-shadow:0 2px 0 var(--line); background:var(--card); color:var(--ink-soft); }
.chip.on{ background:var(--accent); color:var(--auf); border-color:var(--accent); }
.lang-sel{ font-family:var(--ui); font-size:12px; border:1px solid var(--line); border-radius:8px;
  padding:6px 8px; color:var(--ink-soft); background:var(--card); margin-left:auto; }

.share-ta{ width:100%; font-family:var(--ui); font-size:12px; color:var(--ink-soft); background:var(--paper);
  border:1px solid var(--line); border-radius:10px; padding:10px; resize:none; height:74px; word-break:break-all; }
.share-actions{ display:flex; gap:8px; margin-top:10px; }
.share-actions .btn{ flex:1; padding:11px; font-size:14px; }
.hint-err{ font-size:12px; color:var(--danger); margin-top:8px; }

.list-title{ font-size:11px; font-weight:800; letter-spacing:.09em; text-transform:uppercase;
  color:var(--ink-soft); margin:4px 0 10px; }
.crow{ display:flex; align-items:center; gap:8px; padding:11px 4px; border-bottom:1px solid var(--line); }
.crow-front{ font-family:var(--disp); font-size:16px; font-weight:500; }
.crow-back{ font-size:13px; color:var(--ink-soft); }
.crow-spk{ background:none; border:none; color:var(--ink-soft); cursor:pointer; padding:0 2px; }
.crow-spk:hover{ color:var(--accent); }
.crow-box{ font-size:10px; font-weight:600; color:var(--accent); border:1px solid var(--line);
  border-radius:6px; padding:2px 7px; margin-left:auto; white-space:nowrap; }
.crow-del{ background:none; border:none; color:var(--ink-soft); cursor:pointer; font-size:18px; padding:0 4px; line-height:1; }
.crow-del:hover{ color:var(--danger); }

/* Die weggewischte Karte darf die Seite nicht seitlich scrollbar machen.
   clip schneidet ab, ohne einen Scrollcontainer zu erzeugen; hidden ist der Fallback. */
.study{ display:flex; flex-direction:column; flex:1; min-height:0; overflow-x:hidden; overflow-x:clip; }
/* Springleiste: eine einzige grosse Trefferflaeche statt 20 winziger Punkte — bei 20 Karten
   waere jeder Punkt 17 px breit und damit nicht sicher zu treffen. Tippen oder ziehen waehlt
   die naechstgelegene Karte. */
.progress{ display:flex; gap:5px; flex-shrink:0; background:none; border:none; width:100%;
  padding:20px 0; margin:0; cursor:pointer; align-items:center; touch-action:none; }
.pdot{ flex:1; height:4px; border-radius:2px; background:var(--line); pointer-events:none; }
.pdot.done{ background:var(--accent); }
.pdot.cur{ background:var(--ink); }
.cardstage{ flex:1; min-height:260px; display:flex; align-items:center; justify-content:center; padding:2px 0 6px; }
/* Der Stapel liegt still, nur die oberste Karte wandert — deshalb sitzt .swipe
   zwischen Stapel und Karte, und die Perspektive fuer den Dreher zieht mit um. */
.deckwrap{ position:relative; width:100%; height:100%; }
.stack{ position:absolute; inset:0; border-radius:var(--r-xl); background:var(--card);
  border:none; box-shadow:0 10px 26px -22px rgba(0,0,0,.35), 0 3px 0 var(--line); }
.stack.s1{ transform:translateY(7px) scale(.977); opacity:.92; }
.stack.s2{ transform:translateY(14px) scale(.954); opacity:.72; }
/* Drehpunkt unterhalb der Karte: sie kippt wie eine echte Karte, die man wegschnippt,
   statt sich um ihre Mitte zu drehen. */
.swipe{ position:absolute; inset:0; perspective:1400px; transform-origin:50% 145%; }
.swipe.armed{ touch-action:none; }
.swipe.settle{ transition:transform .3s cubic-bezier(.2,.7,.2,1); }
.swipe.gone{ transition:transform .26s ease-in, opacity .26s ease-in; }
.flip{ width:100%; height:100%; cursor:pointer; position:relative;
  transform-style:preserve-3d; transition:transform .5s cubic-bezier(.2,.7,.2,1); }
.flip.flipped{ transform:rotateY(180deg); }
.face{ position:absolute; inset:0; backface-visibility:hidden; border-radius:24px;
  background:var(--card); border:none;
  box-shadow:0 18px 40px -26px rgba(0,0,0,.35), 0 3px 0 var(--line);
  font-weight:800; letter-spacing:-.02em; line-height:1.15;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:44px 26px 30px; text-align:center; overflow:hidden; }
/* Eigener Bereich fuer den Text: zentriert, solange er passt, scrollbar sobald
   nicht. Ohne das lief langer Antworttext oben und unten aus der Karte heraus. */
/* Formeln brechen nicht um. Eine Gleichung ueber zwei Zeilen ist schwer zu lesen
   und kann die Bedeutung verschieben - passeSchriftAn() verkleinert stattdessen
   die Schrift, bis die laengste Formel in die Karte passt.

   Eigene Schriftkette: die runde Systemschrift deckt nicht jedes mathematische
   Zeichen ab. Fehlt eines, ersetzt der Browser NUR dieses Zeichen aus einer
   beliebigen anderen Schrift - dann steht eine eckige Wurzel neben runden
   Ziffern. Mit einer festgelegten Kette bestimmen wir, welche Schrift
   einspringt, statt es dem Zufall zu ueberlassen.
   tabular-nums haelt die Ziffern gleich breit, damit untereinanderstehende
   Zahlen fluchten. */
.formel{ white-space:nowrap;
  font-family:ui-rounded,'SF Pro Rounded','Nunito',
    'Segoe UI Symbol','DejaVu Sans','Noto Sans Math','Noto Sans Symbols 2',
    system-ui,-apple-system,sans-serif;
  font-variant-numeric:tabular-nums;
  font-feature-settings:"ss01";
}
.face .term, .face .answer{ width:100%; min-height:0; max-height:100%; overflow-y:auto;
  overscroll-behavior:contain; -webkit-overflow-scrolling:touch;
  padding:2px 2px 4px; hyphens:auto; overflow-wrap:break-word; }
.face .kicker{ position:absolute; top:16px; left:20px; font-size:10px; letter-spacing:.1em;
  font-weight:800; text-transform:uppercase; color:var(--ink-soft); }
.face-spk{ position:absolute; top:6px; right:8px; background:none; border:none; color:var(--ink-soft);
  cursor:pointer; padding:13px; border-radius:10px; }
.face-spk:hover{ color:var(--accent); }
.face-edit-btn{ position:absolute; top:6px; right:52px; background:none; border:none; color:var(--ink-soft);
  cursor:pointer; padding:13px; border-radius:10px; }
.face-edit-btn:hover{ color:var(--accent); }
/* Editor: das Feld sieht aus wie die Karte, nur mit Rahmen — man bearbeitet die Karte,
   nicht ein Formular. Die Leiste schwebt darunter und bleibt schlank. */
.kartenfeld{ width:100%; border:1px solid var(--accent); border-radius:12px; background:var(--card);
  font-family:var(--disp); font-size:22px; line-height:1.3; color:var(--ink); padding:14px;
  min-height:110px; max-height:44vh; overflow:auto; text-align:center; }
.kartenfeld.gross{ font-size:26px; font-weight:500; }
.kartenfeld:focus{ outline:2px solid var(--accent); outline-offset:1px; }
.ed-leiste{ position:absolute; left:8px; right:8px; bottom:10px; display:flex; align-items:center;
  justify-content:center; flex-wrap:nowrap; gap:3px; padding:6px 7px; border-radius:14px;
  overflow-x:auto; scrollbar-width:none;
  background:var(--card); border:1px solid var(--line);
  box-shadow:0 10px 26px -14px rgba(21,33,28,.55); }
.ed-knopf{ min-width:30px; height:32px; flex-shrink:0; border-radius:9px; border:none; background:none; cursor:pointer;
  color:var(--ink); font-family:var(--ui); display:flex; align-items:center; justify-content:center; }
.ed-knopf:hover{ background:var(--paper); }
.ed-fett{ font-weight:700; font-size:15px; }
.ed-unter{ text-decoration:underline; font-size:15px; }
.ed-groesse{ font-family:var(--disp); }
.ed-trenn{ width:1px; height:19px; flex-shrink:0; background:var(--line); margin:0 3px; }
.ed-farbe{ width:19px; height:19px; flex-shrink:0; border-radius:50%; border:1px solid var(--line);
  cursor:pointer; padding:0; margin:0 1px; }
.ed-farbe:hover{ transform:scale(1.12); }
.face-back{ transform:rotateY(180deg); }
.face .term{ font-family:var(--disp); font-size:30px; font-weight:800; letter-spacing:-.02em; line-height:1.16; }
.face .answer{ font-family:var(--disp); font-size:26px; font-weight:800; letter-spacing:-.02em; line-height:1.22; }
.face .term.lang, .face .answer.lang{ font-size:21px; line-height:1.3; letter-spacing:-.01em; }
.face .term.sehr-lang, .face .answer.sehr-lang{ font-size:17px; font-weight:700; line-height:1.4; letter-spacing:0; }
.aufstieg{ text-align:center; font-family:var(--disp); font-size:16px; font-weight:500;
  color:var(--accent); min-height:22px; animation:aufAuf .3s ease both; }
@keyframes aufAuf{ from{ opacity:0; transform:translateY(4px) } to{ opacity:1; transform:none } }
@media (prefers-reduced-motion: reduce){ .aufstieg{ animation:none } }
.tap-hint{ text-align:center; font-size:12px; color:var(--ink-soft); margin-top:12px; min-height:18px; flex-shrink:0; }
.rate-row{ display:flex; gap:10px; margin-top:14px; flex-shrink:0; padding-bottom:env(safe-area-inset-bottom); }
.rate-row .btn{ flex:1; display:flex; align-items:center; justify-content:center;
  padding:17px; font-size:17px; font-weight:800; border-radius:18px; }
.rate-sub{ font-size:12px; font-weight:400; opacity:.9; }
.btn-again{ background:var(--card); border:1px solid var(--line); color:var(--ink); }
.btn-again:hover{ border-color:var(--danger); color:var(--danger); }
.btn-good{ background:var(--accent); color:var(--card); }
.btn-good:hover{ background:var(--accent-press); }
/* „scharf“ = diese Note liegt beim Wischen gerade an */
.rate-row .btn.scharf{ transform:translateY(-2px); }
.btn-again.scharf{ border-color:var(--ink); box-shadow:0 0 0 2px var(--ink) inset; }
.btn-good.scharf{ background:var(--accent-press); box-shadow:0 0 0 2px var(--ink) inset; }

.study-top-right{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end; }

.recall{ margin-top:14px; flex-shrink:0; display:flex; flex-direction:column; gap:10px; padding-bottom:env(safe-area-inset-bottom); }
.recall-actions{ display:flex; gap:10px; }
.recall-actions .btn{ padding:15px 10px; font-size:15px; white-space:nowrap; }
/* „Antwort sagen“ statt Texteingabe — kein Tastaturfeld, das die Karte verdeckt. */
.btn-say{ background:var(--accent); color:var(--auf); display:flex; align-items:center;
  justify-content:center; gap:8px; }
.btn-say svg{ width:19px; height:19px; }
.btn-say:hover{ background:var(--accent-press); }
.btn-say.live{ background:var(--danger); animation:pulse 1.1s ease-in-out infinite; }
@keyframes pulse{ 50%{ opacity:.72 } }
.recall-hint{ text-align:center; font-size:13px; color:var(--ink-soft); min-height:18px; }
.fb{ font-family:var(--ui); font-size:13px; font-weight:600; margin-bottom:6px; }
.fb-correct{ color:var(--accent); }
.fb-wrong{ color:var(--danger); font-weight:500; }
/* Topbar: das Zeichen reicht, der Name steht im Gruss. */
.brand{ padding:0; }
.brand-name{ font-weight:800; letter-spacing:-.02em; }
.brand-mark svg{ width:30px; height:32px; }
.brand-heim,.home-brand{ padding:4px 8px 4px 2px; }
.home-brand .brand-mark svg{ width:28px; height:30px; }

/* Kopfhoerer: Icon plus so viele Punkte wie Stufen. Ohne die Punkte waere nicht
   erkennbar, WELCHES Rauschen laeuft - das Icon allein zeigt nur an/aus. */
.sound-btn{ position:relative; background:var(--card); border:none; box-shadow:0 2px 0 var(--line); border-radius:999px;
  color:var(--ink-soft); cursor:pointer; padding:7px 11px; display:flex; gap:6px;
  align-items:center; min-height:40px; }
.sound-btn.on{ color:var(--accent); box-shadow:0 2px 0 var(--accent); }
.sound-punkte{ display:flex; gap:3px; }
.sound-punkte i{ width:5px; height:5px; border-radius:50%; background:var(--line); }
.sound-btn.on .sound-punkte i.an{ background:var(--accent); }

/* Tour: eine Buehne oben, darunter Text, unten der eine Knopf. Immer gleich
   aufgebaut, damit man nach dem ersten Schritt weiss, wo man tippt. */
/* Der Vorhang muss die GANZE Breite decken. Mit max-width:480px auf einem
   position:fixed-Element deckte er nur die mittleren 480 Pixel - auf einem
   breiten Bildschirm lief die Startseite links und rechts sichtbar weiter, samt
   ihrem Knopf, und der Markenname wurde an der Kante abgeschnitten.
   Die Breitenbegrenzung sitzt jetzt im Innenabstand: der Inhalt bleibt 480px
   schmal, die Flaeche deckt alles. */
.tour{ position:fixed; inset:0; z-index:45; background:var(--paper); overflow-y:auto;
  padding-top:max(26px,env(safe-area-inset-top));
  padding-bottom:max(26px,env(safe-area-inset-bottom));
  padding-left:max(22px,calc((100vw - 480px) / 2));
  padding-right:max(22px,calc((100vw - 480px) / 2));
  display:flex; flex-direction:column;
  animation:tourAuf .32s cubic-bezier(.2,.7,.2,1) both; }
@keyframes tourAuf{ from{ opacity:0 } to{ opacity:1 } }
.tour-skip{ align-self:flex-end; background:none; border:none; color:var(--ink-soft);
  font-family:var(--ui); font-size:14px; font-weight:700; cursor:pointer;
  padding:10px 6px; min-height:44px; }
.tour-buehne{ flex:1; min-height:190px; display:flex; align-items:center; justify-content:center;
  padding:14px 0 22px; }
.tour-octo{ color:var(--begleiter); animation:octoAuf .45s cubic-bezier(.34,1.4,.5,1) both; }
.tour-karte{ background:var(--card); border-radius:24px; box-shadow:0 3px 0 var(--line);
  padding:26px 20px; width:100%; max-width:270px; text-align:center; position:relative;
  font-size:19px; font-weight:800; letter-spacing:-.02em; line-height:1.2; min-height:150px;
  display:flex; flex-direction:column; align-items:center; justify-content:center; }
.tour-karte.klein{ min-height:96px; font-size:22px; padding:18px; max-width:150px; }
/* Mit offener Erklaerung braucht die Karte mehr Platz und weniger Schriftgroesse. */
.tour-karte-echt.weit{ min-height:auto; padding:34px 20px 22px; font-size:17px;
  max-width:300px; display:flex; flex-direction:column; justify-content:flex-start; }
.tour-karte-echt.weit .warum-text{ font-size:13.5px; }
.tour-karte-echt{ touch-action:pan-y; user-select:none; }
.tour-kicker{ position:absolute; top:14px; left:16px; font-size:10px; letter-spacing:.1em;
  font-weight:800; text-transform:uppercase; color:var(--ink-soft); }
.tour-tipp{ position:absolute; bottom:12px; left:0; right:0; font-size:11px; font-weight:700;
  letter-spacing:.09em; text-transform:uppercase; color:var(--accent); }
.tour-wisch{ display:flex; align-items:center; gap:10px; width:100%; justify-content:center; }
.tour-pfeil{ font-size:11px; font-weight:800; letter-spacing:.06em; text-transform:uppercase;
  color:var(--ink-soft); white-space:nowrap; }
.tour-pfeil.rechts{ color:var(--accent); }
.tour-titel{ font-family:var(--disp); font-size:27px; font-weight:800; letter-spacing:-.03em;
  line-height:1.14; margin:0 0 8px; text-wrap:balance; }
.tour-text{ font-size:15px; font-weight:600; color:var(--ink-soft); line-height:1.45;
  margin:0 0 20px; text-wrap:balance; }
/* Bloop steht gross oben auf seiner eigenen Seite. Er traegt die gewaehlte
   Farbe, damit jede Aenderung sofort an IHM sichtbar ist statt nur an einem
   Punkt in einer Reihe. */
.profil-held{ display:flex; flex-direction:column; align-items:center; gap:6px;
  padding:6px 0 22px; }
.profil-held-figur{ color:var(--begleiter); animation:octoAuf .45s cubic-bezier(.34,1.4,.5,1) both; }
.profil-held-name{ font-family:var(--disp); font-size:26px; font-weight:800;
  letter-spacing:-.02em; color:var(--ink); }
@media (prefers-reduced-motion: reduce){ .profil-held-figur{ animation:none } }
.sprach-reihe{ display:flex; flex-wrap:wrap; gap:8px; }
.sprach-chip{ background:var(--card); border:none; box-shadow:0 2px 0 var(--line);
  border-radius:999px; padding:10px 16px; cursor:pointer; font-family:var(--ui);
  font-size:14px; font-weight:800; color:var(--ink-soft); }
.sprach-chip.an{ color:var(--accent); box-shadow:0 2px 0 var(--accent); }
.sprachwahl{ display:flex; flex-direction:column; gap:12px; }
.sprach-knopf{ background:var(--card); border:none; box-shadow:0 3px 0 var(--line);
  border-radius:18px; padding:20px 22px; cursor:pointer; font-family:var(--disp);
  font-size:20px; font-weight:800; color:var(--ink); text-align:center; }
.sprach-knopf:hover{ box-shadow:0 3px 0 var(--accent); }
/* Die vom Geraet vorgeschlagene Sprache steht hervorgehoben da - als Angebot,
   nicht als Vorauswahl: gedrueckt werden muss trotzdem. */
.sprach-knopf.vor{ box-shadow:0 3px 0 var(--accent); }
.tour-luft{ flex:1; min-height:0; }
/* Rasterstapel: jeder Schritt liegt im selben Feld, der hoechste bestimmt die
   Hoehe. Nur der aktive ist sichtbar - visibility statt display, damit die
   verborgenen weiter Platz beanspruchen und die Hoehe halten. */
.tour-worte{ display:grid; }
.tour-wort{ grid-area:1 / 1; visibility:hidden; opacity:0; }
.tour-wort.an{ visibility:visible; opacity:1; }
.tour-punkte{ display:flex; justify-content:center; gap:6px; margin-bottom:16px; }
.tour-punkte i{ width:7px; height:7px; border-radius:50%; background:var(--line); }
.tour-punkte i.an{ background:var(--accent); }
@media (prefers-reduced-motion: reduce){
  .tour{ animation:none } .tour-octo{ animation:none }
}

/* Der Vorschlag am Ende einer Sitzung. Er darf sichtbar sein - hier ist er
   die Antwort auf "und jetzt?", nicht eine Unterbrechung. Trotzdem steht
   "Spaeter" gleichberechtigt daneben. */
.folge-karte{ background:var(--card); box-shadow:0 3px 0 var(--line); border-radius:22px;
  padding:18px 20px; margin-top:20px; width:100%; max-width:340px; text-align:center; }
.folge-titel{ font-size:13px; font-weight:700; color:var(--ink-soft); margin-bottom:6px; }
.folge-text{ font-family:var(--disp); font-size:17px; font-weight:600; line-height:1.35;
  color:var(--ink); margin-bottom:14px; }
.folge-text b{ font-weight:800; }
.folge-knoepfe{ display:flex; flex-direction:column; align-items:center; gap:2px; }
.folge-knoepfe .btn{ width:100%; }

/* Vorschlag unter einer aktiven Kartei: eine Zeile, die man uebersehen darf.
   Kein Kasten, kein Ausrufezeichen - ein Angebot, kein Auftrag. */
.folge{ display:flex; align-items:center; gap:9px; width:100%; text-align:left;
  background:none; border:none; cursor:pointer; font:inherit; color:var(--ink-soft);
  font-size:12.5px; font-weight:600; padding:4px 2px 14px 14px; margin-top:-6px; }
.folge b{ font-weight:800; color:var(--ink); }
.folge:hover{ color:var(--accent); }
.folge:hover b{ color:var(--accent); }
.folge-pfeil{ opacity:.6; flex-shrink:0; }
.folge-plus{ margin-left:auto; font-size:16px; font-weight:800; color:var(--accent);
  width:24px; height:24px; border-radius:999px; background:var(--card);
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
  margin-right:2px; }
.modus-reihe{ display:flex; gap:8px; margin-bottom:22px; }
.modus-knopf{ flex:1; background:var(--card); border:none; box-shadow:0 2px 0 var(--line);
  border-radius:16px; padding:12px 8px; cursor:pointer; font:inherit; color:inherit;
  font-size:14px; font-weight:800; letter-spacing:-.01em; }
.modus-knopf small{ display:block; font-size:10.5px; font-weight:600; color:var(--ink-soft);
  margin-top:3px; letter-spacing:0; }
.modus-knopf.an{ box-shadow:0 0 0 2.5px var(--accent), 0 2px 0 var(--line); }

/* Die Fahne sagt beim Umschalten kurz, was jetzt laeuft. Ein Kopfhoerer-Symbol
   allein erklaert nicht, was "Rauschen" bedeutet - und eine dauerhafte
   Beschriftung wollten wir oben nicht stehen haben. */
.sound-fahne{ position:absolute; top:calc(100% + 6px); right:0; white-space:nowrap;
  background:var(--ink); color:var(--paper); font-size:11.5px; font-weight:700;
  border-radius:999px; padding:5px 11px; pointer-events:none;
  animation:fahneAuf .2s ease both; }
@keyframes fahneAuf{ from{ opacity:0; transform:translateY(-3px) } to{ opacity:1; transform:none } }
@media (prefers-reduced-motion: reduce){ .sound-fahne{ animation:none } }

.tour-kopf{ display:flex; align-items:center; gap:14px; color:var(--accent); }
.tour-kopf svg{ width:64px; height:64px; }
.tour-wellen{ display:flex; align-items:center; gap:5px; }
.tour-wellen i{ width:5px; border-radius:999px; background:var(--accent); opacity:.55; }
.tour-wellen i:nth-child(1){ height:18px } .tour-wellen i:nth-child(2){ height:32px }
.tour-wellen i:nth-child(3){ height:24px }
/* Die Beispielkarte ist ein echter Knopf: sie dreht sich wirklich. Eine Tour,
   in der man nichts anfassen kann, erklaert die Geste - sie bringt sie nicht bei. */
.tour-karte-echt{ border:none; font:inherit; color:inherit; cursor:pointer;
  font-family:var(--disp); transition:transform .18s ease, box-shadow .18s ease; }
.tour-karte-echt:active{ transform:translateY(2px); box-shadow:0 1px 0 var(--line); }
.tour-karte-echt.um{ box-shadow:0 3px 0 var(--accent); }
.tour-karte-echt.um .tour-kicker{ color:var(--accent); }
.tour-kopf-echt{ background:var(--card); border:none; box-shadow:0 3px 0 var(--line);
  border-radius:22px; padding:20px 26px; cursor:pointer; font:inherit;
  flex-direction:column; gap:10px; min-width:190px; }
.tour-kopf-echt.an{ box-shadow:0 3px 0 var(--accent); }
.tour-kopf-echt .tour-wellen i{ transition:height .2s ease; }
.tour-kopf-echt.an .tour-wellen i:nth-child(1){ height:22px }
.tour-kopf-echt.an .tour-wellen i:nth-child(2){ height:38px }
.tour-kopf-echt.an .tour-wellen i:nth-child(3){ height:28px }
.tour-kopf-text{ font-family:var(--ui); font-size:12.5px; font-weight:800;
  color:var(--ink-soft); letter-spacing:.02em; }
.tour-kopf-echt.an .tour-kopf-text{ color:var(--accent); }
.tour-medien{ display:flex; flex-direction:column; align-items:center; gap:14px; }
.tour-lupe{ font-size:44px; line-height:1; }
.tour-werte{ list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap;
  gap:8px; justify-content:center; max-width:290px; }
.tour-werte li{ background:var(--card); box-shadow:0 2px 0 var(--line); border-radius:999px;
  padding:10px 15px; font-size:14px; font-weight:800; letter-spacing:-.01em; }

.tile-leer{ opacity:.5; cursor:default; }
.tile-leer:hover{ box-shadow:0 3px 0 var(--line); }

.teil-knopf{ width:100%; margin-top:26px; display:flex; align-items:center;
  justify-content:center; gap:9px; }
.teil-icon{ display:flex; color:var(--accent); }
.teil-icon svg{ width:18px; height:18px; }
.teil-hinweis{ font-size:13px; font-weight:600; color:var(--ink-soft);
  text-align:center; margin-top:10px; }

/* Profil in Gruppen. Vorher standen fuenf Themen ohne Trennung untereinander -
   man sah nicht, was zusammengehoert. */
.profil-block{ background:var(--card); box-shadow:0 2px 0 var(--line); border-radius:20px;
  padding:16px 16px 18px; margin-bottom:14px; }
.profil-block > .list-title:first-child{ margin-top:0; }
.profil-block .list-title{ margin-top:20px; }
.profil-block > *:first-child{ margin-top:0; }
.profil-ton{ display:flex; align-items:flex-start; gap:14px; margin-top:12px; }
.profil-ton-icon{ flex-shrink:0; width:46px; height:46px; border-radius:14px;
  background:color-mix(in srgb,var(--accent) 12%,transparent); color:var(--accent);
  display:flex; align-items:center; justify-content:center; }
.profil-ton-icon svg{ width:24px; height:24px; }
.profil-hinweis{ font-size:12.5px; font-weight:600; line-height:1.45; color:var(--ink-soft);
  margin:12px 0 0; }
.profil-block .nw-liste .chip{ box-shadow:0 2px 0 var(--line); }
.profil-block .link-inline{ padding-top:12px; }

/* Anteil, der sitzt. Steht klein unter dem Ring: die grosse Zahl darf nur
   wachsen, dieser Wert darf fallen - wer sich neue Karten holt, hat sich mehr
   vorgenommen. Deshalb immer MIT Bezug, nie als nackte Prozentzahl. */
.ub-quote{ text-align:center; font-size:15px; font-weight:600; color:var(--ink-soft);
  margin-top:14px; }
.ub-quote b{ font-family:var(--disp); font-size:26px; font-weight:800; color:var(--accent);
  letter-spacing:-.02em; }

/* Verlauf der letzten zwei Wochen. Balken statt Kette: ein leerer Tag ist leer,
   nicht rot - hier reisst nichts. */
.vl-karte{ background:var(--card); box-shadow:0 3px 0 var(--line); border-radius:20px;
  padding:16px 14px 12px; }
.vl-balken{ display:flex; align-items:flex-end; gap:4px; height:96px; }
.vl-tag{ flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; }
.vl-saeule{ flex:1; width:100%; display:flex; align-items:flex-end;
  background:color-mix(in srgb,var(--line) 22%,transparent); border-radius:6px; overflow:hidden; }
.vl-fuellung{ width:100%; background:var(--accent); border-radius:6px;
  animation:vlAuf .42s cubic-bezier(.2,.7,.2,1) both; transform-origin:bottom; }
.vl-fuellung.leer{ background:color-mix(in srgb,var(--line) 70%,transparent); }
@keyframes vlAuf{ from{ transform:scaleY(0) } to{ transform:none } }
.vl-wt{ font-size:10px; font-weight:700; color:var(--ink-soft); }
.vl-fuss{ font-size:13px; font-weight:600; color:var(--ink-soft); text-align:center;
  margin-top:12px; padding-top:11px; border-top:1.5px solid var(--line); }
.vl-fuss b{ font-weight:800; color:var(--ink); }
@media (prefers-reduced-motion: reduce){ .vl-fuellung{ animation:none } }

/* Angebot des Begleiters: ein Satz, zwei Wege, danach nie wieder. Kein Kaestchen
   mit Ausrufezeichen - es ist ein Angebot, keine Aufgabe. */
.angebot{ background:var(--card); box-shadow:0 2px 0 var(--line); border-radius:18px;
  padding:14px 16px; margin-top:16px; text-align:left; }
.angebot > span{ display:block; font-size:14px; font-weight:600; line-height:1.4;
  color:var(--ink); margin-bottom:10px; }
.angebot-knoepfe{ display:flex; align-items:center; gap:12px; }
.angebot-knoepfe .btn{ padding:10px 14px; font-size:14px; }
.angebot-knoepfe .link-inline{ padding:10px 0; }

/* Kartenblatt: alle drei Seiten untereinander. Keine Backticks hier drin -
   das beendet das Template-Literal und bricht den Build (ist viermal passiert). */
.blatt{ display:flex; flex-direction:column; gap:12px; }
.blatt-feld{ background:var(--card); border-radius:16px; padding:12px 14px 10px;
  box-shadow:0 2px 0 var(--line); transition:box-shadow .15s ease; }
.blatt-feld.aktiv{ box-shadow:0 2px 0 var(--accent); }
.blatt-feld.leise{ background:color-mix(in srgb, var(--card) 82%, var(--paper)); }
.blatt-kopf{ display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.blatt-titel{ font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase;
  color:var(--ink-soft); flex:1; }
.blatt-lang{ font-size:11px; font-weight:700; color:var(--ink-soft); background:none;
  border:none; padding:3px 2px; border-radius:8px; max-width:120px; }
.blatt-weg{ background:none; border:none; color:var(--ink-soft); font-size:17px;
  line-height:1; cursor:pointer; padding:4px 8px; border-radius:8px; }
.blatt-weg:hover{ color:var(--accent); }
/* Die Eingabe waechst mit dem Text - eine feste Hoehe zwingt zum Scrollen in
   einem Feld, das noch gar nicht voll ist. */
.blatt-eingabe{ min-height:44px; font-family:var(--disp); font-size:17px; font-weight:700;
  line-height:1.35; color:var(--ink); outline:none; overflow-wrap:break-word; }
.blatt-feld.leise .blatt-eingabe{ font-size:15px; font-weight:600; color:var(--ink-soft); }
.blatt-eingabe:empty:before{ content:attr(data-platz); color:var(--ink-soft); opacity:.6;
  font-weight:600; pointer-events:none; }
.blatt-werkzeuge{ display:flex; gap:4px; margin-top:4px; }
.blatt-wz{ background:none; border:none; color:var(--ink-soft); cursor:pointer;
  padding:7px 9px; border-radius:10px; display:inline-flex; align-items:center; }
.blatt-wz:hover:not(:disabled){ color:var(--accent); }
.blatt-wz:disabled{ opacity:.35; cursor:default; }
.blatt-wz.live{ color:var(--accent); animation:blattPuls 1.1s ease-in-out infinite; }
@keyframes blattPuls{ 50%{ opacity:.45 } }
@media (prefers-reduced-motion: reduce){ .blatt-wz.live{ animation:none } }
/* Die dritte Seite ist ein Angebot, kein Pflichtfeld: sie liegt zu, bis man sie
   aufmacht. Sonst steht bei jeder Vokabel ein leeres Erklaerungsfeld herum. */
.blatt-plus{ background:none; border:2px dashed var(--line); border-radius:16px;
  padding:13px 14px; cursor:pointer; font-family:var(--ui); font-size:14px;
  font-weight:800; color:var(--ink-soft); text-align:left; }
.blatt-plus:hover{ border-color:var(--accent); color:var(--accent); }
.blatt-plus-sub{ font-weight:600; opacity:.7; margin-left:6px; }
/* Auf der Lernbuehne bekommt der Editor den GANZEN Platz, den die Karte hatte.
   Zentriert schwebend sah er aus wie ein Dialog, der zufaellig dort liegt - und
   die Felder blieben klein, obwohl der halbe Bildschirm leer war. */
/* Das Aenderungsblatt legt sich ueber die Kartei, statt sie zu verschieben -
   sonst springt die Liste unter dem Finger weg. */
/* Der Blick wandert weich, nicht sprunghaft. Etwas laenger als eine uebliche
   Bewegung, damit es wie Umsehen wirkt und nicht wie Zucken. */
.octo-pupille{ transition:transform .55s cubic-bezier(.32,.9,.35,1); }
@media (prefers-reduced-motion: reduce){ .octo-pupille{ transition:none } }
.aender-blatt{ position:fixed; inset:0; z-index:50; display:flex; align-items:flex-end;
  justify-content:center; background:color-mix(in srgb, var(--ink) 34%, transparent);
  animation:aenderAuf .18s ease both; }
.aender-innen{ width:100%; max-width:480px; max-height:92dvh; overflow-y:auto;
  background:var(--paper); border-radius:24px 24px 0 0;
  padding:20px 20px max(20px,env(safe-area-inset-bottom)); }
@keyframes aenderAuf{ from{ opacity:0 } to{ opacity:1 } }
@media (prefers-reduced-motion:reduce){ .aender-blatt{ animation:none } }
@media (min-width:560px){
  .aender-blatt{ align-items:center; }
  .aender-innen{ border-radius:24px; max-height:88dvh; }
}
.blatt-buehne{ flex:1; width:100%; display:flex; flex-direction:column;
  overflow-y:auto; overscroll-behavior:contain; padding:2px 0 8px; }
.blatt-buehne .blatt{ flex:1; }
.blatt-buehne .blatt-feld{ display:flex; flex-direction:column; }
/* Vorder- und Rueckseite teilen sich den freien Platz, die Erklaerung bekommt
   mehr, weil dort Saetze stehen und keine Stichworte. */
.blatt-buehne .blatt-eingabe{ flex:1; min-height:72px; }
.blatt-buehne .blatt-feld.leise .blatt-eingabe{ min-height:96px; }
.blatt-leiste{ position:sticky; bottom:0; background:var(--paper); padding-top:8px; }
/* Auf Tablet und Rechner ist Platz - dort darf getippt werden wie auf Papier. */
@media (min-width:720px){
  .blatt-feld{ padding:16px 18px 13px; }
  .blatt-eingabe{ font-size:20px; min-height:56px; }
  .blatt-feld.leise .blatt-eingabe{ font-size:17px; }
}

/* Drittes Feld: die Erklaerung. Sie steht nie zusammen mit der Frage - sonst
   waere sie ein Hinweis und wuerde den aktiven Abruf untergraben. Erst nach dem
   Aufdecken, und nur auf Wunsch. */
/* Der Knopf steht immer UNTER der Antwort, nie daneben. Jeder Behaelter, der
   ihn enthaelt, braucht deshalb flex-direction:column - .tour-karte hatte es
   vergessen und stellte Antwort und Knopf nebeneinander. Wer hier einen neuen
   Kartentyp anlegt: Richtung pruefen.
   flex-shrink:0 ist Guertel zum Hosentraeger - min-height haelt den Knopf
   bereits auf 40px, aber die Absicht soll dastehen. */
.warum-knopf{ margin-top:16px; flex-shrink:0; background:none; border:none; cursor:pointer;
  color:var(--accent); font-family:var(--ui); font-size:13px; font-weight:800;
  letter-spacing:.02em; padding:9px 14px; border-radius:999px; min-height:40px;
  display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 0 var(--line); }
.warum-knopf:hover{ box-shadow:0 2px 0 var(--accent); }
.warum-pfeil{ font-size:14px; line-height:1; }
.warum-feld{ margin-top:14px; padding-top:13px; border-top:2px solid var(--line);
  width:100%; min-height:0; overflow-y:auto; overscroll-behavior:contain;
  animation:warumAuf .22s ease both; }
@keyframes warumAuf{ from{ opacity:0; transform:translateY(6px) } to{ opacity:1; transform:none } }
.warum-titel{ font-size:10px; font-weight:800; letter-spacing:.1em; text-transform:uppercase;
  color:var(--ink-soft); margin-bottom:5px; }
.warum-text{ font-size:15px; font-weight:600; line-height:1.42; letter-spacing:0;
  color:var(--ink-soft); }
@media (prefers-reduced-motion: reduce){ .warum-feld{ animation:none } }
@media (min-width:520px){ .warum-text{ font-size:16px; } }

/* Menue-Knopf: nur die drei Punkte, in Textfarbe. Kein Kreis - der sah aus wie
   ein Knopf, war aber keiner mit eigener Flaeche. Die Trefferflaeche bleibt
   trotzdem 44px, sie ist nur unsichtbar; kleine Finger brauchen sie. */
/* Der Griff sitzt genau dort, wo im geoeffneten Blatt "Schliessen" steht -
   dann liegt der Daumen beim Auf- und Zumachen an derselben Stelle. */
.menue-knopf{ background:none; border:none; box-shadow:none; color:var(--ink);
  cursor:pointer; width:100%; height:46px; margin:2px 0 0; flex-shrink:0;
  display:flex; align-items:center; justify-content:center; border-radius:999px; }
.menue-knopf:hover{ color:var(--accent); }
.menue-knopf:active{ transform:translateY(1px); }

/* Menue als Blatt von unten - dort erreicht der Daumen sicher. */
.menue-grund{ position:fixed; inset:0; z-index:55; background:rgba(0,0,0,.34);
  display:flex; align-items:flex-end; justify-content:center;
  animation:grundAuf .18s ease both; }
@keyframes grundAuf{ from{ opacity:0 } to{ opacity:1 } }
.menue{ width:100%; max-width:480px; background:var(--paper);
  border-radius:26px 26px 0 0; padding:8px 14px max(18px,env(safe-area-inset-bottom));
  animation:blattAuf .26s cubic-bezier(.2,.7,.2,1) both; }
@keyframes blattAuf{ from{ transform:translateY(26px) } to{ transform:none } }
.menue-griff{ width:38px; height:4px; border-radius:999px; background:var(--line);
  margin:6px auto 12px; }
.menue-zeile{ display:flex; align-items:center; gap:13px; width:100%; text-align:left;
  background:var(--card); border:none; box-shadow:0 2px 0 var(--line); border-radius:16px;
  padding:13px 15px; margin-bottom:8px; cursor:pointer; font:inherit; color:inherit; }
.menue-zeile:hover{ box-shadow:0 2px 0 var(--accent); }
.menue-icon{ color:var(--accent); display:flex; flex-shrink:0; width:22px; justify-content:center; }
.menue-text{ font-size:15px; font-weight:800; letter-spacing:-.01em; flex:1; }
.menue-text small{ display:block; font-size:11.5px; font-weight:600; color:var(--ink-soft);
  margin-top:2px; letter-spacing:0; }
.menue-schliessen{ width:100%; background:none; border:none; color:var(--ink-soft);
  font-family:var(--ui); font-size:14px; font-weight:800; cursor:pointer;
  padding:0; height:46px; }
.menue.zieht{ transition:none; }
.menue.faellt{ transition:transform .2s ease-in; }
@media (prefers-reduced-motion: reduce){
  .menue-grund,.menue{ animation:none }
}

/* Uebersetzung unter dem Gruss */
.gruss-ueber{ font-size:12.5px; font-weight:700; letter-spacing:.02em; color:var(--ink-soft);
  margin:-8px 0 12px; }

/* Profil */
.wahl-reihe{ display:flex; gap:10px; margin-bottom:26px; }
.wahl-karte{ flex:1; background:var(--card); border:none; box-shadow:0 3px 0 var(--line);
  border-radius:22px; padding:18px 10px 14px; cursor:pointer; font:inherit; color:inherit;
  display:flex; flex-direction:column; align-items:center; gap:8px; }
.wahl-karte b{ font-size:16px; font-weight:800; letter-spacing:-.01em; }
.wahl-karte.an{ box-shadow:0 0 0 2.5px var(--accent), 0 3px 0 var(--line); }
.wahl-karte .octo-frida{ color:#8349C5; }
.wahl-karte .octo-finn{ color:#49C5A2; }
.farb-reihe{ display:flex; gap:14px; margin-bottom:26px; }
.farb-punkt{ width:44px; height:44px; border-radius:50%; border:none; cursor:pointer; padding:0;
  box-shadow:0 2px 0 rgba(0,0,0,.16); }
.farb-punkt[aria-pressed="true"]{ box-shadow:0 0 0 3px var(--paper), 0 0 0 6px var(--accent); }
.farb-punkt[data-farbe="violett"]{ background:#8349C5; }
.farb-punkt[data-farbe="mint"]{ background:#49C5A2; }
.farb-punkt[data-farbe="koralle"]{ background:#D15B3D; }
.farb-punkt[data-farbe="blau"]{ background:#497FC5; }
@media (prefers-color-scheme: dark){
  .farb-punkt[data-farbe="violett"]{ background:#9D70D2; }
  .farb-punkt[data-farbe="mint"]{ background:#45C4A0; }
  .farb-punkt[data-farbe="koralle"]{ background:#D5674B; }
  .farb-punkt[data-farbe="blau"]{ background:#588ACA; }
}
.preview-note{ font-size:11px; color:var(--ink-soft); opacity:.85; margin-top:8px; line-height:1.4; }

.center-msg{ flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center; gap:12px; padding:40px 10px; }
.center-msg .big{ font-family:var(--disp); font-size:26px; font-weight:500; }
.center-msg .small{ color:var(--ink-soft); font-size:14px; max-width:290px; line-height:1.5; }

.footer-pay{ padding-top:26px; text-align:center; font-size:12px; color:var(--ink-soft); }

/* Karten-Editor: eine drehbare Karte statt zweier abstrakter Felder */
.edit-stage{ perspective:1200px; margin-bottom:10px; }
.edit-card{ position:relative; background:var(--card); border:none; border-radius:var(--r-l);
  padding:36px 16px 16px; min-height:150px;
  box-shadow:0 12px 28px -24px rgba(0,0,0,.3), 0 3px 0 var(--line);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  animation:cardflip .34s ease; }
.edit-side-tag{ position:absolute; top:13px; left:15px; font-size:10px; letter-spacing:.14em;
  text-transform:uppercase; color:var(--ink-soft); }
.edit-flip{ position:absolute; top:9px; right:10px; width:38px; height:38px; border-radius:50%;
  border:1px solid var(--line); background:var(--card); color:var(--accent); cursor:pointer;
  display:flex; align-items:center; justify-content:center; transition:transform .3s ease, border-color .15s ease; }
.edit-flip:hover{ border-color:var(--accent); background:var(--paper); }
.edit-flip:active{ transform:rotate(-160deg); }
.edit-input{ width:100%; font-family:var(--disp); font-size:22px; font-weight:500; color:var(--ink);
  background:transparent; border:none; outline:none; text-align:center; }
.edit-input::placeholder{ color:var(--ink-soft); font-weight:400; }
.edit-tools{ display:flex; align-items:center; justify-content:center; gap:8px; margin-top:16px; }
.edit-tools .lang-sel{ margin-left:0; }
.edit-tools .mic{ width:44px; height:44px; }
.edit-meta{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; }
.edit-hint{ font-size:12px; color:var(--ink-soft); }
.fill-status{ display:flex; gap:12px; font-size:12px; color:var(--ink-soft); white-space:nowrap; }
.fill-status .ok{ color:var(--accent); font-weight:600; }
@keyframes cardflip{ from{ transform:rotateY(-88deg); opacity:.15 } to{ transform:rotateY(0); opacity:1 } }

/* Startseiten-Kacheln (Bibliothek, Querbeet) + Bibliothek-Zeilen */
.tile{ background:var(--card); border:1px solid var(--line); border-radius:16px; padding:15px 18px; margin-top:12px;
  cursor:pointer; transition:border-color .15s ease, transform .08s ease; }
.tile:hover{ border-color:var(--ink-soft); }
.tile:active{ transform:translateY(1px); }
.tile-title{ font-family:var(--disp); font-size:18px; font-weight:500; }
.tile-head{ display:flex; align-items:center; gap:10px; }
.tile-icon{ color:var(--accent); display:flex; flex-shrink:0; }
.tile-sub{ font-size:12.5px; color:var(--ink-soft); margin-top:4px; line-height:1.4; }
.tile-head + .tile-sub{ margin-left:34px; }
.tile-off{ opacity:.55; cursor:default; }
.tile-off:hover{ border-color:var(--line); }
.cat-row{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 2px; border-bottom:1px solid var(--line); }
.cat-name{ font-family:var(--disp); font-size:16px; font-weight:500; }
.cat-meta{ font-size:13px; color:var(--ink-soft); margin-top:2px; }
/* Regal: eigener Stapel mit Zustand und Schalter */
.gruppe{ margin-bottom:4px; }
.gruppe-kopf{ display:flex; align-items:center; gap:8px; width:100%; background:none; border:none;
  padding:14px 2px 8px; cursor:pointer; font-family:var(--ui); color:var(--ink-soft); }
.gruppe-name{ font-size:12px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; }
.gruppe-zahl{ font-size:12px; background:var(--card); border:1px solid var(--line); border-radius:999px;
  padding:1px 7px; }
.gruppe-pfeil{ margin-left:auto; font-size:12px; }
.gruppe-kopf:hover{ color:var(--ink); }
.gruppe-aktionen{ display:flex; gap:14px; padding:2px 2px 10px; }
.gruppe-aktionen button{ background:none; border:none; color:var(--accent); font-family:var(--ui);
  font-size:13.5px; cursor:pointer; padding:2px 0; }
.gruppe-aktionen button:hover{ color:var(--accent-press); }
.regal-row.ruht .cat-name, .regal-row.ruht .cat-meta{ opacity:.55; }
.suche{ position:relative; margin-bottom:16px; }
.suche .field{ padding-right:38px; }
.suche-weg{ position:absolute; right:6px; top:50%; transform:translateY(-50%); width:30px; height:30px;
  border:none; background:none; color:var(--ink-soft); font-size:20px; line-height:1; cursor:pointer; }
.suche-weg:hover{ color:var(--ink); }
.regal-row{ display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding:8px 0; border-bottom:1px solid var(--line); }
.regal-name{ background:none; border:none; padding:8px 2px; text-align:left; cursor:pointer;
  color:inherit; font:inherit; display:flex; flex-direction:column; min-width:0; flex:1; }
.regal-name .cat-name{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pill{ background:transparent; border:1px solid var(--line); border-radius:999px; cursor:pointer;
  font-family:var(--ui); font-size:14px; color:var(--ink); padding:14px 16px; white-space:nowrap; }
.pill:hover{ border-color:var(--ink-soft); }
/* Kippschalter: vertraut vom Telefon, braucht keine Beschriftung. */
.kipp{ background:none; border:none; cursor:pointer; padding:12px 6px 12px 12px; flex-shrink:0;
  display:flex; align-items:center; }
.kipp-bahn{ width:50px; height:30px; border-radius:999px; background:var(--line); position:relative;
  transition:background .18s ease; display:block; }
.kipp-knopf{ position:absolute; top:3px; left:3px; width:24px; height:24px; border-radius:50%;
  background:var(--card); box-shadow:0 1px 3px rgba(21,33,28,.3); transition:transform .18s ease; }
.kipp.an .kipp-bahn{ background:var(--accent); }
.kipp.an .kipp-knopf{ transform:translateX(20px); }
@media (prefers-reduced-motion: reduce){ .kipp-bahn,.kipp-knopf{ transition:none } }
.kipp-label{ font-size:13px; color:var(--ink-soft); white-space:nowrap; }
.recall-actions{ display:flex; justify-content:center; }
.mic-round{ width:56px; height:56px; flex-shrink:0; border-radius:50%; border:none;
  background:var(--accent); color:var(--card); cursor:pointer; display:flex; align-items:center; justify-content:center;
  box-shadow:0 6px 16px -8px rgba(21,33,28,.6); }
.mic-round:hover{ background:var(--accent-press); }
.mic-round.live{ background:var(--accent-press); animation:puls 1.1s ease-in-out infinite; }
@keyframes puls{ 0%,100%{ box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 35%,transparent) }
  50%{ box-shadow:0 0 0 9px transparent } }
@media (prefers-reduced-motion: reduce){ .mic-round.live{ animation:none } }
/* Loeschen: erreichbar, aber am Ende und leise. */
.fortschritt{ background:var(--card); border:1px solid var(--line); border-radius:14px;
  padding:14px 16px; margin:16px 0 4px; }
.fort-kopf{ display:flex; align-items:baseline; gap:7px; margin-bottom:10px; }
.fort-kopf b{ font-family:var(--disp); font-size:24px; font-weight:600; line-height:1; }
.fort-kopf span{ font-size:13.5px; color:var(--ink-soft); }
.deck-schalter{ display:flex; align-items:center; justify-content:space-between; gap:14px;
  background:var(--card); border:1px solid var(--line); border-radius:14px; padding:12px 14px;
  margin:18px 0 16px; }
.deck-schalter-titel{ font-family:var(--disp); font-size:16px; font-weight:500; }
.deck-schalter-sub{ font-size:12.5px; color:var(--ink-soft); margin-top:2px; }
.crow.waehlbar{ cursor:pointer; padding-left:4px; }
.crow.waehlbar:hover{ background:var(--paper); }
.crow.markiert{ background:var(--paper); }
.haken{ flex-shrink:0; width:24px; height:24px; border-radius:7px; border:1.6px solid var(--line);
  display:flex; align-items:center; justify-content:center; margin-right:10px; color:var(--card);
  font-size:14px; line-height:1; }
.crow.markiert .haken{ background:var(--accent); border-color:var(--accent); }
.wahl-leiste{ position:sticky; bottom:10px; display:flex; align-items:center; justify-content:space-between;
  gap:12px; background:var(--card); border:1px solid var(--line); border-radius:14px;
  padding:10px 12px; margin-top:16px; box-shadow:0 12px 28px -18px rgba(21,33,28,.6); font-size:14px; }
.del-deck{ background:none; border:none; cursor:pointer; color:var(--ink-soft); font-family:var(--ui);
  font-size:14px; display:flex; align-items:center; gap:8px; padding:14px 2px; margin-top:26px; }
.del-deck:hover{ color:var(--danger); }
.del-deck svg{ width:17px; height:17px; }

/* Foto zu Karten */
.imp-photo{ width:100%; max-height:260px; object-fit:contain; border-radius:12px;
  border:1px solid var(--line); margin-top:12px; background:var(--card); }
.crow-off{ opacity:.4; }
.crow-off .crow-front{ text-decoration:line-through; }

/* Aufwaermen: Lichter aus */
.lo{ display:flex; flex-direction:column; flex:1; min-height:0; }
.lo-levels{ display:flex; gap:6px; justify-content:center; margin-bottom:16px; }
/* Ein Rahmen ums Brett, Felder flaechig gefuellt — ruhiger als 25 einzelne Kacheln. */
.lo-board{ display:grid; grid-template-columns:repeat(5,1fr); grid-template-rows:repeat(5,1fr);
  gap:0; width:100%; max-width:340px; aspect-ratio:1/1; margin:0 auto;
  background:var(--card); border:1px solid var(--line); border-radius:18px; overflow:hidden;
  box-shadow:0 14px 32px -26px rgba(21,33,28,.55); }
.lo-cell{ padding:0; cursor:pointer; background:transparent; border:none;
  border-right:1px solid var(--rule); border-bottom:1px solid var(--rule);
  transition:background-color .22s ease; }
.lo-cell:nth-child(5n){ border-right:none; }
.lo-cell:nth-child(n+21){ border-bottom:none; }
.lo-cell:hover{ background:var(--paper); }
.lo-cell.on{ background:var(--accent); }
.lo-cell.on:hover{ background:var(--accent-press); }
.lo-cell:disabled{ cursor:default; }
.lo-cell:disabled:hover{ background:transparent; }
.lo-cell.on:disabled:hover{ background:var(--accent); }
.lo-status{ text-align:center; font-size:13px; color:var(--ink-soft); margin-top:18px; min-height:20px; line-height:1.5; }
.lo-status .done{ font-family:var(--disp); font-size:20px; font-weight:500; color:var(--ink); display:block; margin-bottom:4px; }
.lo-actions{ display:flex; gap:10px; margin-top:16px; padding-bottom:env(safe-area-inset-bottom); }
.lo-actions .btn{ flex:1; }
/* Vier gewinnt */
.vg-brett{ display:grid; grid-template-columns:repeat(7,1fr); gap:4px; background:var(--card);
  border:1px solid var(--line); border-radius:16px; padding:6px; width:100%;
  max-width:min(96vw,430px); margin:0 auto; aspect-ratio:7/6; }
.vg-feld{ padding:0; border:none; background:none; cursor:pointer; display:flex;
  align-items:center; justify-content:center; border-radius:50%; }
.vg-feld:disabled{ cursor:default; }
.vg-feld:hover:not(:disabled){ background:var(--paper); }
/* background-color, NICHT die Kurzform background: eine Transition auf der
   Kurzform bleibt bei Werten aus CSS-Variablen haengen - Steine behielten die
   Farbe des leeren Feldes und das Spiel war nicht mehr spielbar.
   Der Gegenstein laeuft auf --ink (Marcs Vorschlag, nachgerechnet): gegen das
   leere Feld 12-17:1 und gegen den eigenen Stein 2.0-3.4 - in jeder Palette
   besser als eine feste Buntfarbe. Der Ring bleibt trotzdem: bei Mint im
   Dunkelmodus wird es mit 2.0 knapp, und Farbfehlsichtigkeit gibt es auch. */
.vg-stein{ width:86%; aspect-ratio:1; border-radius:50%; background-color:var(--paper);
  box-shadow:inset 0 1px 2px rgba(21,33,28,.16); transition:background-color .18s ease; }
.vg-stein.du{ background-color:var(--accent); box-shadow:0 1px 3px rgba(0,0,0,.28); }
.vg-stein.robin{ background-color:var(--ink);
  box-shadow:0 1px 3px rgba(0,0,0,.28), inset 0 0 0 4px color-mix(in srgb,var(--ink) 78%,var(--paper)); }
.vg-stein.leuchtet{ outline:3px solid var(--ink); outline-offset:2px; }
@media (prefers-reduced-motion: reduce){ .vg-stein{ transition:none } }
/* Rohrleitung */
.rl-brett{ display:grid; gap:3px; background:var(--card); border:1px solid var(--line); border-radius:16px;
  padding:6px; width:100%; max-width:min(92vw,400px); margin:0 auto; aspect-ratio:1; }
.rl-feld{ padding:0; border:none; background:transparent; cursor:pointer; border-radius:10px;
  display:flex; align-items:center; justify-content:center; position:relative; }
.rl-feld:hover:not(:disabled){ background:var(--paper); }
.rl-feld:disabled{ cursor:default; }
.rl-feld.quelle{ background:var(--paper); }
.rl-dreher{ display:flex; width:100%; height:100%; transition:transform .22s cubic-bezier(.2,.7,.2,1); }
.rl-rohr{ width:100%; height:100%; color:var(--stufe-frisch); transition:color .18s ease; }
.rl-rohr.an{ color:var(--accent); }
@media (prefers-reduced-motion: reduce){ .rl-dreher,.rl-rohr{ transition:none } }
@media (min-width:700px){ .lo-board{ max-width:420px; } }

@media (min-width:700px){
  .frame{ max-width:720px; padding:32px 28px 52px; }
  .brand{ font-size:24px; }
  .h1{ font-size:34px; }
  .deck-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .deck-grid .deck{ margin-bottom:0; }
  .cardstage .deckwrap{ max-width:600px; }
  .cardstage{ padding:6px 0 10px; }
  .face .term{ font-size:36px; }
  .face .answer{ font-size:30px; }
  .face .term.lang, .face .answer.lang{ font-size:24px; }
  .face .term.sehr-lang, .face .answer.sehr-lang{ font-size:19px; }
}
@media (prefers-reduced-motion: reduce){ .flip{ transition:none } .mic.live{ animation:none } .edit-card{ animation:none }
  .swipe.settle, .swipe.gone{ transition:none } }
`;

/* Haptik — sparsam und nur an Momenten, die etwas bedeuten.
 * Regel: Haptik markiert, dass etwas *passiert ist*, sie belohnt nicht. Deshalb kein
 * Zucken bei jedem Tipp — das wird zu Rauschen und man schaltet es ab.
 * Werte in Millisekunden; alles ueber ~20 ms fuehlt sich nach Alarm an statt nach Bestaetigung.
 * ACHTUNG: iOS/Safari kennt navigator.vibrate nicht. Auf dem iPhone passiert hier nichts —
 * echte Haptik gaebe es dort erst in einer nativen Huelle. Der Aufruf schadet nicht.
 */
const HAPTIK = { schnapp: 8, ablegen: 15, umdrehen: 6, fertig: [14, 70, 22] };
const haptik = (muster) => { try { navigator.vibrate && navigator.vibrate(muster); } catch {} };

const DAY = 86400000;
// Obergrenze fuer eine Sitzung. Wer zwei Wochen weg war, hat sonst 300 faellige Karten
// vor sich — und genau da hoeren Leute auf. Robin sucht stattdessen eine Handvoll aus,
// der Rest verteilt sich still ueber die naechsten Tage. Gilt fuer jeden Lernweg.
const SESSION_CARDS = 20;
const uid = () => Math.random().toString(36).slice(2, 10);
const STORAGE_KEY = "kbx:decks:v3";
/* Zwei Zahlen, die sich nicht aus den Karten ableiten lassen: wann zum ersten Mal gelernt
 * wurde und wie viel Zeit dabei zusammengekommen ist. Beide **wachsen nur**. Genau das ist
 * die Regel fuer alles Gezaehlte in Robin: Was fallen kann, bestraft die Rueckkehr — und
 * bestrafte Rueckkehr ist der Kern jedes Streak-Zwangs.
 * Bleibt auf dem Geraet wie alles andere. */
const META_KEY = "kbx:meta:v1";

/* Die App heisst **Bloop** - neutral, ohne Figur im Namen. Das ist Absicht:
   das Kind darf seinen Begleiter umbenennen (er heisst dann "Pommes" oder
   "Zappel"), und ein App-Name mit Figur haette dem widersprochen. Ausserdem
   trug "Frida & Finn" immer eine Figur mit, die man gar nicht gewaehlt hat.
   Der Name kommt von **Buddy + Loop**: der Begleiter und die Schleife, in der
   eine Karte zurueckkommt. Deshalb darf auch der Begleiter "Bloop" heissen.
   Frida und Finn bleiben als Begleiter - zwei Figuren, dieselbe Zeichnung,
   verschiedene Farbe. Die Farbe gehoert der Figur, nicht dem Kind, damit ueber
   die Auswahl keine Geschlechterzuweisung zurueckkommt. */
/* **Es gibt nur einen Begleiter: Bloop.** Frida und Finn sind entfallen (Marc,
   20. August 2026) - sie waren immer dieselbe Zeichnung in zwei Farben, also
   keine zwei Figuren, sondern eine mit einer Farbeinstellung. Zwei Namen dafuer
   anzubieten hat nur eine Wahl vorgetaeuscht, die es nicht gab, und stand
   nebenbei quer zum Namen der App.
   Was bleibt: ein Wesen, frei benennbar (`meta.buddyName`) und frei einfaerbbar
   (`meta.farbe`). Frida und Finn leben als Namensvorschlaege weiter - dort sind
   sie eine echte Wahl. */
const BUDDY_STANDARD = "Bloop";
/* Der Begleiter darf umbenannt werden. Das ist der Grund, warum der App-Name am
 * Ende weniger wiegt als gedacht: in der App steht der Name, den das Kind
 * vergeben hat - "Bloop" ist der Name der App, nicht der Figur.
 * Der Wunschname liegt in meta.buddyName und ist, wie der Deckname des Kindes,
 * per Definition keine personenbezogene Angabe. */
const buddyName = (m) => {
  const eigen = (m && m.buddyName || "").trim();
  return eigen || BUDDY_STANDARD;
};
/* Vorschlaege zum Antippen. Bewusst albern und geschlechtsneutral - wer selbst
 * tippen will, kann; wer nur wischen will, findet trotzdem etwas. */
/* "Bloop" darf hier stehen, obwohl die App so heisst (Marcs Entscheidung, und
   sie traegt): Der Name kommt von **Buddy + Loop** - also ist der Begleiter
   ohnehin gemeint. Wer ihn so nennt, trifft den Ursprung, statt sich zu vertun. */
const BUDDY_NAMEN = [
  "Frida", "Finn", "Keks", "Nudel", "Krake", "Tinte", "Pepper", "Wusel", "Kraken-Kalle",
  "Okto", "Sushi", "Blubb", "Struppi", "Perle", "Anker", "Muschel", "Tako",
  "Neptun", "Käpt'n", "Pommes", "Zappel",
];
const FARBEN = [
  { k: "violett", l: "Violett" }, { k: "mint", l: "Mint" },
  { k: "koralle", l: "Koralle" }, { k: "blau", l: "Blau" },
];
const MODI = [
  { k: "auto", get l() { return t("modus.auto"); }, get hint() { return t("modus.auto.sub"); } },
  { k: "hell", get l() { return t("modus.hell"); } },
  { k: "dunkel", get l() { return t("modus.dunkel"); } },
];
const modusVon = (m) => (m && MODI.some((x) => x.k === m.modus) ? m.modus : "auto");
const farbeVon = (m) => {
  const f = m && m.farbe;
  return FARBEN.some((x) => x.k === f) ? f : "violett";   // Violett ist Bloops Grundfarbe
};
/* Fach aus einem Deck-Namen: "Mathematik · Terme & Gleichungen" -> "Mathematik".
   Ohne Trenner steht der ganze Name. */
const fachVon = (name) => {
  const teile = String(name || "").split("·");
  return (teile.length > 1 ? teile[0] : String(name || "")).trim();
};

/* Der Name steht in vierzehn Kopfzeilen. Ihn als Prop durchzureichen hiesse,
   vierzehn Aufrufe fuer einen einzigen Wert anzufassen - und beim naechsten
   Namenswechsel wieder. Der Context haelt ihn an einer Stelle. */
const MarkeCtx = React.createContext(BUDDY_STANDARD);
const useMarke = () => React.useContext(MarkeCtx);
/* Übungen: eigene Zusammenstellungen aus Karten, die in verschiedenen Decks wohnen.
 * **Sie verlinken, sie kopieren nicht** — gespeichert werden nur Karten-Ids. Damit gibt es
 * weiterhin genau eine Wahrheit pro Karte: Bewertung, Bearbeitung und Fortschritt wirken
 * ueberall. (Drei Fehler an einem Tag kamen aus Kopien im Querbeet-Stapel.)
 * Eine geloeschte Karte verschwindet still aus allen Uebungen — eine Leiche mit
 * „Karte geloescht“ waere unbrauchbar und nur laut. */
const UEB_KEY = "kbx:uebungen:v1";
/* Meilensteine. Erlaubt, weil sie **nicht verloren gehen koennen**: Wer 100 Karten gelernt
 * hat, hat sie auch nach drei Monaten Pause gelernt. Das ist der Unterschied zu einer Serie,
 * die reisst — dort ist die Zahl eine Geisel, hier eine Feststellung.
 * Jeder Meilenstein feiert genau einmal (`gefeiert` merkt sich die erreichten Schwellen).
 */
const MEILEN_KARTEN = [10, 25, 50, 100, 250, 500, 1000, 2000, 5000];
const MEILEN_TAGE = [30, 100, 200, 365, 730];
/* Tagesstatistik. Schluessel ist das lokale Datum, damit ein Abend um 23:50 und
   einer um 00:10 nicht in denselben Topf fallen. Aufgehoben werden die letzten
   TAGE_MAX Tage - das genuegt fuer jeden Verlauf und deckelt den Speicher. */
const TAGE_MAX = 120;
const tagSchluessel = (t) => {
  const d = new Date(t);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
    + "-" + String(d.getDate()).padStart(2, "0");
};
function schreibeTag(tage, jetzt, spanne) {
  const k = tagSchluessel(jetzt);
  const neu = { ...(tage || {}) };
  const alt = neu[k] || { n: 0, ms: 0 };
  neu[k] = { n: alt.n + 1, ms: alt.ms + spanne };
  const schluessel = Object.keys(neu).sort();
  // Alte Tage abraeumen, damit der Speicher nicht unbegrenzt waechst.
  while (schluessel.length > TAGE_MAX) delete neu[schluessel.shift()];
  return neu;
}
/* Die letzten n Tage als Liste - auch die ohne Eintrag, sonst haette der Verlauf
   Luecken statt Nullen und die Balken saessen falsch. */
function letzteTage(tage, n) {
  const heute = new Date(); heute.setHours(0, 0, 0, 0);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(heute.getTime() - i * DAY);
    const k = tagSchluessel(d.getTime());
    const e = (tage || {})[k] || { n: 0, ms: 0 };
    out.push({ datum: d, key: k, n: e.n, ms: e.ms });
  }
  return out;
}

const PAUSE_MAX = 90000;   // laenger als anderthalb Minuten pro Karte gilt als Pause, nicht als Lernzeit
/* Diese Liste steuert NUR Vorlesen und Einsprechen, nicht die Inhalte. Sie zu
 * erweitern kostet nichts - welche Stimmen wirklich da sind, entscheidet das
 * Geraet. Fehlt eine, liest der Browser mit der Standardstimme vor; bei Latein
 * ist das der Normalfall, dort gibt es praktisch nirgends eine eigene Stimme.
 * Reihenfolge: erst was in DACH-Schulen unterrichtet wird, dann die Sprachen,
 * die viele Kinder hier zu Hause sprechen. */
const LANGS = [
  { c: "de-DE", n: "Deutsch" }, { c: "en-US", n: "English" }, { c: "fr-FR", n: "Français" },
  { c: "es-ES", n: "Español" }, { c: "it-IT", n: "Italiano" }, { c: "pt-PT", n: "Português" },
  { c: "la", n: "Latina" }, { c: "nl-NL", n: "Nederlands" }, { c: "pl-PL", n: "Polski" },
  { c: "tr-TR", n: "Türkçe" }, { c: "hr-HR", n: "Hrvatski" }, { c: "ro-RO", n: "Română" },
  { c: "uk-UA", n: "Українська" }, { c: "ar-SA", n: "العربية" },
  { c: "sw-KE", n: "Kiswahili" }, { c: "af-ZA", n: "Afrikaans" },
];

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------------- Aufwaermen: „Lichter aus" (Lights Out) ----------------
 * Reine Logik, ohne React: ein Druck schaltet das Feld und seine vier
 * orthogonalen Nachbarn. Ein Druck ist selbstinvers — zweimal dasselbe Feld
 * hebt sich auf. Darum erzeugen wir das Raetsel rueckwaerts aus dem geloesten
 * Zustand: n verschiedene Zufallsfelder druecken. So ist es garantiert loesbar
 * und in hoechstens n Zuegen zu schaffen.
 */
const LO_N = 5;
const LO_LEVELS = [
  { key: "sanft", label: "Sanft", presses: 3 },
  { key: "mittel", label: "Mittel", presses: 6 },
  { key: "knifflig", label: "Knifflig", presses: 10 },
];

function loToggle(grid, idx) {
  const g = grid.slice();
  const r = Math.floor(idx / LO_N), c = idx % LO_N;
  const flip = (rr, cc) => { if (rr < 0 || cc < 0 || rr >= LO_N || cc >= LO_N) return; g[rr * LO_N + cc] = !g[rr * LO_N + cc]; };
  flip(r, c); flip(r - 1, c); flip(r + 1, c); flip(r, c - 1); flip(r, c + 1);
  return g;
}

function loScramble(presses) {
  const n = Math.min(presses, LO_N * LO_N);
  for (let tries = 0; tries < 12; tries++) {
    const cells = shuffle(Array.from({ length: LO_N * LO_N }, (_, i) => i));
    let g = Array.from({ length: LO_N * LO_N }, () => false);
    for (let i = 0; i < n; i++) g = loToggle(g, cells[i]);
    if (g.some(Boolean)) return g; // sehr selten heben sich die Zuege ganz auf
  }
  return loToggle(Array.from({ length: LO_N * LO_N }, () => false), 12);
}

/* ---------------- Bibliothek: kuratierte Starter-Stapel (verifiziert, AHS A1) ---------------- */
/* Oberste Ebene der Bibliothek. Eine Kategorie gehoert genau einem Bereich an; was hier
 * nicht steht, landet unter „Mehr“. So kommen spaeter weitere Schuljahre unter „Schule“
 * und neue Bereiche (Quiz, Schnitzeljagd, Party) einfach als weitere Zeile dazu —
 * ohne dass an den 42 Katalog-Eintraegen etwas geaendert werden muss.
 */
/* Sortiert wird nach FACH, nicht nach Jahrgang - aus drei Gruenden:
 *  1. Der reale Anlass ist das Fach ("morgen ist Bio-Test"), nicht der Jahrgang.
 *  2. Faecher sind stabil, Jahrgaenge wechseln jaehrlich.
 *  3. Der wichtigste: eine Jahrgangs-Ordnerstruktur klassifiziert das Kind.
 *     Wer in Mathe hinterher ist, muesste in einen Ordner greifen, der ihn als
 *     zurueck markiert; wer voraus ist, ebenso. Das ist genau die Beschaemung,
 *     die wir sonst ueberall vermeiden.
 * Auch "Gymnasium" steht nirgends: der Stoff ist derselbe, egal an welcher
 * Schule - und das Wort schliesst alle anderen Schulformen gefuehlt aus.
 * Das Alter steht als *Empfehlung* am Thema. Eine Empfehlung darf man
 * uebergehen, eine Schublade nicht.
 */
const ALTER_VON_STUFE = { 1: "ab 10", 2: "ab 11", 3: "ab 12", 4: "ab 13" };
const KAT_VON_STUFE = (s) => "Unterstufe " + s;
const alterLabel = (cat) => ALTER_VON_STUFE[String(cat).replace("Unterstufe ", "")] || "";
// Medien traegt keine Stufe - dort steht keine Altersangabe, das ist kein Fehler.
const SCHUL_KATS = [1, 2, 3, 4].map(KAT_VON_STUFE);
const BEREICHE = [
  { name: "Schule", get hint() { return t("bib.nachfach"); },
    cats: SCHUL_KATS, icon: "schule" },
  /* Medien steht bewusst NEBEN der Schule, nicht darin: es ist kein Fach, und es
     soll nicht nach Pflicht aussehen. Der Ton ist "durchschauen", nicht "zu viel
     ist schlecht" - Moralisieren wird in diesem Alter zuverlaessig abgelehnt. */
  { name: "Medien", get hint() { return t("bib.medien.sub"); },
    cats: ["Medien"], icon: "medien" },
];
/* „Zum Staunen“ steht nicht mehr als Stapel-Bereich in der Liste — dieselben Fragen sind
 * das Quiz, und zweimal dasselbe unter zwei Namen war verwirrend. Die Bibliothek ist damit
 * das Verzeichnis von allem: deine Stapel, Schule, Quiz, Spiele. */
const bereichVon = (cat) => (BEREICHE.find((b) => b.cats.includes(cat)) || { name: "Mehr" }).name;

/* ---------------- Formatierter Kartentext ----------------
 * Karten duerfen fett, unterstrichen, farbig und in drei Groessen sein. Damit steht in
 * `front`/`back` HTML — und Karteien werden per KBX-Code weitergegeben. Fremdes HTML
 * ungeprueft anzuzeigen waere in einer Kinder-App ein Einfallstor (Skripte, nachladende
 * Bilder, Klick-Fallen). Deshalb geht *jeder* Kartentext durch diesen Filter, bevor er
 * gezeigt wird: erlaubt sind nur die Auszeichnungen unten, alles andere faellt raus.
 * Reiner Text bleibt reiner Text — Altbestand funktioniert unveraendert weiter.
 */
const TAGS_OK = new Set(["B", "STRONG", "I", "EM", "U", "SPAN", "BR", "DIV", "P"]);
const FARBE_OK = /^(#[0-9a-f]{3,8}|rgb\([\d\s,.%]+\))$/i;
const GROESSE_OK = /^(0?\.\d+|[12](\.\d+)?)(em|rem)$|^(small|medium|large|x-large)$/i;

function saeubereHTML(roh) {
  if (typeof document === "undefined" || !roh) return roh || "";
  const topf = document.createElement("div");
  topf.innerHTML = roh;
  const lauf = (el) => {
    [...el.childNodes].forEach((k) => {
      if (k.nodeType === 3) return;                        // Text bleibt
      if (k.nodeType !== 1 || !TAGS_OK.has(k.tagName)) {   // alles Fremde: Inhalt retten, Huelle weg
        const txt = document.createTextNode(k.textContent || "");
        el.replaceChild(txt, k); return;
      }
      const warFormel = k.getAttribute("class") === "formel";
      [...k.attributes].forEach((a) => {
        if (a.name !== "style") { k.removeAttribute(a.name); return; }
      });
      // Genau dieser eine Klassenname darf bleiben - er schaltet nur den
      // Zeilenumbruch ab. Alles andere wurde oben entfernt.
      if (warFormel) k.setAttribute("class", "formel");
      const farbe = k.style.color, groesse = k.style.fontSize;
      const gewicht = k.style.fontWeight, deko = k.style.textDecoration;
      k.removeAttribute("style");
      const fw = (farbe || "").trim().toLowerCase().replace(/\s/g, "");
      const istStandard = fw === TINTE_STANDARD.toLowerCase() || fw === "rgb(107,107,107)";
      if (farbe && !istStandard && FARBE_OK.test(farbe.trim())) k.style.color = farbe;
      if (groesse && GROESSE_OK.test(groesse.trim())) k.style.fontSize = groesse;
      if (/^(bold|[6-9]00)$/i.test(gewicht || "")) k.style.fontWeight = "700";
      if (/underline/i.test(deko || "")) k.style.textDecoration = "underline";
      lauf(k);
    });
  };
  lauf(topf);
  return topf.innerHTML;
}
const istReich = (s) => /<(b|strong|i|em|u|span|br|div|p)\b/i.test(s || "");
// Fuer Vorlesen und Antwortabgleich zaehlt nur der Text, nicht die Auszeichnung.
function nurText(s) {
  if (!istReich(s)) return s || "";
  if (typeof document === "undefined") return (s || "").replace(/<[^>]*>/g, " ");
  const d = document.createElement("div"); d.innerHTML = s;
  return (d.textContent || "").replace(/\s+/g, " ").trim();
}
/* Zeigt Kartentext an: formatiert wenn formatiert, sonst schlicht als Text.
 * Die Laenge bestimmt die Schriftgroesse - ein Vokabelwort soll gross dastehen,
 * ein Absatz muss in dieselbe Karte passen, ohne herauszulaufen. */
const laengenKlasse = (s) => {
  const n = nurText(s || "").length;
  return n > 260 ? " sehr-lang" : n > 110 ? " lang" : "";
};

/* Formeln duerfen NICHT umbrechen. "3a + 4b" auf zwei Zeilen liest sich falsch,
 * und bei Gleichungen kann ein Umbruch die Bedeutung verschieben. Erkannt wird
 * eine Formel an Rechenzeichen mit Zeichen davor und dahinter; sie bekommt
 * `white-space:nowrap`, und passt sie dann nicht mehr, wird die ganze Karte
 * kleiner gesetzt (siehe passeSchriftAn). */
const FORMEL = /(?:^|[\s(])((?:[0-9a-zA-Z()²³√·]+\s*[-+−×÷*/=<>≤≥]\s*)+[0-9a-zA-Z()²³√·]+)/g;
function formelnSchuetzen(text) {
  return String(text).replace(FORMEL, (treffer, ausdruck) =>
    treffer.replace(ausdruck, '<span class="formel">' + ausdruck + "</span>"));
}

/* Misst nach dem Rendern, ob etwas Unbrechbares zu breit ist, und regelt die
 * Schrift herunter, bis es passt. Eine Schaetzung nach Zeichenzahl reicht nicht:
 * "1111" und "MMMM" sind gleich lang und verschieden breit. */
function passeSchriftAn(el) {
  if (!el) return;
  el.style.fontSize = "";
  const passt = () => el.scrollWidth <= el.clientWidth + 1;
  if (passt()) return;
  const start = parseFloat(getComputedStyle(el).fontSize);
  for (let f = start - 1; f >= 11; f -= 1) {
    el.style.fontSize = f + "px";
    if (passt()) return;
  }
}

function Kartentext({ html, className }) {
  const k = (className || "") + laengenKlasse(html);
  const ref = useRef(null);
  const roh = istReich(html) ? saeubereHTML(html) : String(html == null ? "" : html);
  useEffect(() => { passeSchriftAn(ref.current); }, [roh, k]);
  useEffect(() => {
    const auf = () => passeSchriftAn(ref.current);
    window.addEventListener("resize", auf);
    return () => window.removeEventListener("resize", auf);
  }, []);
  // Auch reiner Text geht durch den Saeuberer, weil formelnSchuetzen Markup einfuegt.
  return <div ref={ref} className={k}
    dangerouslySetInnerHTML={{ __html: saeubereHTML(formelnSchuetzen(roh)) }} />;
}

/* Begruessung nach Tageszeit. Bewusst geschlechtsneutral — Robin weiss nicht, wer da ist,
 * und soll es auch nicht raten. Deshalb keine Anreden wie „Meister“ oder „Gebieter“, sondern
 * Kosenamen, die auf jede Person passen (Rakete, Genie, Legende, Wunderwuzzi).
 * Ueberwiegend ruhig, ab und zu zum Schmunzeln — der Ton bleibt Robins Ton.
 * Wird einmal pro Start gewaehlt und aendert sich nicht mitten im Ansehen.
 */
const GRUESSE = {
  morgen: [
    "Guten Morgen.", "Morgen! Ausgeschlafen?", "Guten Morgen, %N%.",
    "Moin. Der Tag ist noch ganz frisch.", "Guten Morgen. Kaffee ist leider nicht dabei.",
    "Hallo, du. Früh unterwegs.", "Servus. Schön früh dran.", "Guten Morgen, %N%.",
    "Morgen. Die Welt wacht gerade auf.", "Guten Morgen. Erstmal ankommen.",
    "Buenos días.", "Bonjour.", "Good morning.", "Buongiorno.", "Bom dia.",
    "Dobré ráno.", "Günaydın.", "Jó reggelt.", "Grüezi.", "Tach auch.",
  ],
  mittag: [
    "Mahlzeit.", "Servus. Halbzeit.", "Hallo. Mittagspause?", "Grüß dich.",
    "Hallo, %N%.", "Servus. Gut hergefunden.", "Mittag. Gute Zeit für ein paar Karten.",
    "Hallo. Der Tag ist noch lang.",
    "Salve.", "Ciao.", "Hola.", "Hej.", "Ahoi.", "Yo.", "Hallöchen.",
    // Robin weiss wirklich nicht, wer da ist — daraus laesst sich der beste Witz machen,
    // den diese App haben kann. Anrede offen lassen statt raten.
    "~¡Hola, muchacho! Oder muchacha. Ich kenn dich ja nicht.",
    "~Ciao, bello. Oder bella. Keine Ahnung, ehrlich.",
  ],
  nachmittag: [
    "Hallo, du.", "Servus, %N%.", "Schön, dass du da bist.", "Guten Tag, %N%.",
    "Hallo. Nachmittag ist auch was Schönes.", "Grüß dich, %N%.",
    "Servus. Wie war die Schule?", "Hallo. Kurz Zeit?", "Servus, %N%.",
    "Hallo. Schon was geschafft heute?",
    "Buenas tardes.", "Bon après-midi.", "Good afternoon.", "Buon pomeriggio.",
    "Boa tarde.", "Salve.", "Hei hei.", "Namasté.",
    "~¿Qué tal, amigo? Amiga? Such dir was aus.",
    "~Servus. Ich weiß nicht, wer du bist — und das bleibt auch so.",
    "~Hallo, Unbekannte:r. Im besten Sinne.",
  ],
  abend: [
    "Guten Abend.", "N'Abend.", "Guten Abend, %N%.", "Hallo. Der Tag klingt aus.",
    "Servus. Noch wach genug?", "Guten Abend. Eine Runde geht immer.",
    "Hallo. Feierabend ist auch Lernzeit.", "Servus. Schön ruhig jetzt.",
    "Buenas noches.", "Bonsoir.", "Good evening.", "Buonasera.", "Boa noite.",
    "İyi akşamlar.", "Dobrý večer.",
  ],
  nacht: [
    "Noch wach?", "Hallo, %N%.", "Servus. Späte Stunde.",
    "Guten Abend — oder schon gute Nacht?", "Hallo. Die Welt schläft schon.",
    "Noch eine Runde? Aber dann schlafen.", "Servus. Ganz schön spät.",
    "Bonne nuit.", "Buenas noches.", "Good night.", "Buonanotte.", "Dobrou noc.",
  ],
  zurueck: [
    "Schön, dass du wieder da bist.", "Hallo! Lang nicht gesehen.", "Da bist du ja wieder.",
    "Willkommen zurück.", "~Hallo, Fremde:r. Schön, dich zu sehen.", "Na, wieder da?",
    "~Bentornato — oder Bentornata. Such dir was aus.", "Welcome back.",
    "Da schau her.", "Lange nichts gehört. Schön!",
  ],
};
/* Fantasiename statt echtem Namen: Robin kann dich ansprechen und weiss trotzdem nichts
 * ueber dich. Ein Deckname ist per Definition keine personenbezogene Angabe. */
const FANTASIENAMEN = [
  "Batman", "Klotilde", "Herta", "Gandalf", "Pippi", "Godzilla", "Einstein", "Kleopatra",
  "Yoda", "Waldemar", "Rosalinde", "Kaktus", "Donnerkeil", "Nachteule", "Zwiebel",
  "Professorin", "Sherlock", "Mathilda", "Obelix", "Merlin", "Käpt'n", "Wildsau",
  "Erdmännchen", "Baron", "Sputnik", "Knöpfchen", "Rakete", "Wasabi",
];
function tageszeit(stunde) {
  if (stunde < 5) return "nacht";
  if (stunde < 11) return "morgen";
  if (stunde < 14) return "mittag";
  if (stunde < 18) return "nachmittag";
  if (stunde < 22) return "abend";
  return "nacht";
}
/* Uebersetzung der fremdsprachigen Gruesse. Steht klein unter dem Gruss - wer
 * "Jó reggelt" nicht kennt, soll nicht raten muessen, und nebenbei nimmt man
 * etwas mit. Deutsche Gruesse stehen bewusst nicht drin: dort waere die Zeile
 * eine leere Wiederholung. */
/* Die Uebersetzungszeile nennt die Sprache eines fremdsprachigen Grusses - und
   zwar in der Sprache der App. Ohne eigenes Verzeichnis stand unter dem
   englischen "Good morning." die Zeile "Guten Morgen · Englisch": in der
   englischen Fassung ist Englisch aber nicht fremd, und Deutsch ist es sehr
   wohl. Jede App-Sprache braucht daher ihr eigenes Verzeichnis. */
const GRUSS_UEBER_EN = {
  "Buenos días.": "Good morning · Spanish",
  "Bonjour.": "Good day · French",
  "Guten Morgen.": "Good morning · German",
  "Buongiorno.": "Good morning · Italian",
  "Bom dia.": "Good morning · Portuguese",
  "Buenas tardes.": "Good afternoon · Spanish",
  "Buon pomeriggio.": "Good afternoon · Italian",
  "Bonne après-midi.": "Good afternoon · French",
  "Boa tarde.": "Good afternoon · Portuguese",
  "Buenas noches.": "Good evening · Spanish",
  "Bonsoir.": "Good evening · French",
  "Buonasera.": "Good evening · Italian",
  "Boa noite.": "Good evening · Portuguese",
  "Bonne nuit.": "Good night · French",
};

const GRUSS_UEBER = {
  "Buenos días.": "Guten Morgen · Spanisch",
  "Bonjour.": "Guten Tag · Französisch",
  "Good morning.": "Guten Morgen · Englisch",
  "Buongiorno.": "Guten Morgen · Italienisch",
  "Bom dia.": "Guten Morgen · Portugiesisch",
  "Dobré ráno.": "Guten Morgen · Tschechisch",
  "Günaydın.": "Guten Morgen · Türkisch",
  "Jó reggelt.": "Guten Morgen · Ungarisch",
  "Grüezi.": "Guten Tag · Schweizerdeutsch",
  "Salve.": "Sei gegrüßt · Latein",
  "Ciao.": "Hallo · Italienisch",
  "Hola.": "Hallo · Spanisch",
  "Hej.": "Hallo · Schwedisch",
  "Namasté.": "Ich grüße dich · Hindi",
  "Buenas tardes.": "Guten Nachmittag · Spanisch",
  "Bon après-midi.": "Schönen Nachmittag · Französisch",
  "Good afternoon.": "Guten Nachmittag · Englisch",
  "Buon pomeriggio.": "Guten Nachmittag · Italienisch",
  "Boa tarde.": "Guten Nachmittag · Portugiesisch",
  "Hei hei.": "Hallo · Norwegisch",
  "Buenas noches.": "Guten Abend · Spanisch",
  "Bonsoir.": "Guten Abend · Französisch",
  "Good evening.": "Guten Abend · Englisch",
  "Buonasera.": "Guten Abend · Italienisch",
  "Boa noite.": "Guten Abend · Portugiesisch",
  "İyi akşamlar.": "Guten Abend · Türkisch",
  "Dobrý večer.": "Guten Abend · Tschechisch",
  "Bonne nuit.": "Gute Nacht · Französisch",
  "Good night.": "Gute Nacht · Englisch",
  "Buonanotte.": "Gute Nacht · Italienisch",
  "Dobrou noc.": "Gute Nacht · Tschechisch",
  "Welcome back.": "Willkommen zurück · Englisch",
};

/* Der Gruss bleibt innerhalb eines Zeitfensters derselbe. Vorher wurde er bei
 * jedem Betreten der Startseite neu gewuerfelt - wer zwischen Bibliothek und
 * Start hin und her ging, wurde jedes Mal anders begruesst, und das wirkt
 * unruhig statt lebendig. Jetzt wechselt er zur naechsten Tageszeit. */
/* Das Fenster enthaelt den Namen mit Absicht: aendert man ihn, wird sofort neu
   gewuerfelt. Sonst stuende auf der Startseite noch der alte Name, und die
   Aenderung waere scheinbar folgenlos. */
const grussFenster = (langeWeg, name) => {
  const d = new Date();
  return (langeWeg ? "zurueck" : tageszeit(d.getHours())) + "|" + d.toDateString()
    + "|" + (name || "");
};
/* Kosenamen fuer alle, die keinen eigenen gewaehlt haben. Bewusst
   geschlechtsneutral - sie passen auf jede Person. */
/* Englische Gruesse - NEU GESCHRIEBEN, nicht uebersetzt. "Guten Morgen. Kaffee
   ist leider nicht dabei." wird woertlich steif; der Ton muss stimmen, nicht
   das Wort. Mit `~` markierte Gruesse sind die "ich kenne dich nicht"-Witze:
   sie fallen weg, sobald ein Name gesetzt ist, sonst waeren sie unwahr.
   Fremdsprachige Gruesse bleiben fremdsprachig - sie sind in jeder Fassung der
   nebenbei mitgelernte Teil. */
const GRUESSE_EN = {
  morgen: [
    "Good morning.", "Morning! Slept well?", "Good morning, %N%.",
    "Morning. The day is still brand new.", "Good morning. Coffee not included, sorry.",
    "Hello there. Up early.", "Morning. Nice and early.", "Good morning, %N%.",
    "Morning. The world is just waking up.", "Good morning. Take your time.",
    "Buenos días.", "Bonjour.", "Guten Morgen.", "Buongiorno.", "Bom dia.",
    "~Morning, Alex. Or whatever your name is.",
  ],
  mittag: [
    "Afternoon.", "Hello. Halfway through.", "Hi. Lunch break?", "Hello there.",
    "Hello, %N%.", "Midday. Good time for a few cards.", "Hi. Glad you found your way.",
    "Buenas tardes.", "Bonjour.", "Buon pomeriggio.",
    "~Hello, Sam. Or whoever you are.",
  ],
  nachmittag: [
    "Afternoon.", "Hello, %N%.", "Hi. School done?", "Good afternoon.",
    "Hello. The quiet part of the day.", "Afternoon. Good time to think.",
    "Buenas tardes.", "Bonne après-midi.", "Boa tarde.",
    "~Afternoon, Robin. Or whatever they call you.",
  ],
  abend: [
    "Good evening.", "Evening, %N%.", "Hi. Winding down?", "Good evening. Nice that you're here.",
    "Evening. The day is nearly done.", "Hello. Still going strong.",
    "Buenas noches.", "Bonsoir.", "Buonasera.", "Boa noite.",
    "~Evening, Charlie. Or whatever your name is.",
  ],
  nacht: [
    "Still awake?", "Late one today.", "Hello, %N%. It's late.",
    "Night owl, then.", "Quiet hour. Good for remembering.",
    "Hi. The world is asleep.", "Buenas noches.", "Bonne nuit.",
    "~Hello, Nico. Or whoever is up this late.",
  ],
  zurueck: [
    "There you are.", "Welcome back, %N%.", "Been a while. Good to see you.",
    "Hello again. Nothing is lost.", "Back again. Your cards waited.",
    "Good to have you back. We'll take it slowly.",
    "~Welcome back, Jamie. Or whatever your name is.",
  ],
};

const KOSENAMEN_EN = ["Rocket", "Genius", "Turbo", "Brainbox", "Legend",
  "Night Owl", "Captain", "Champion", "Ace", "Star", "Chief", "Sunshine"];

const KOSENAMEN = ["Rakete", "Genie", "Turbo", "Superhirn", "Wunderwuzzi",
  "Blitz", "Legende", "Nachteule", "Kapitän", "Champion", "Profi", "Ass"];

/* Setzt die Anrede in einen Gruss ein. Steht ein %N% drin, kommt der Name
   dorthin. Sonst wird er hinter den ersten Satz gehaengt - "Guten Morgen." wird
   zu "Guten Morgen, Rakete.". Das gilt nur fuer Saetze, die auf einen Punkt
   enden: bei Fragen ("Noch wach?") oder Ausrufen saesse ein angehaengter Name
   grammatisch falsch, die bleiben unveraendert. */
function setzeAnrede(text, name) {
  if (!name) return text.split("%N%").join("");
  if (text.includes("%N%")) return text.split("%N%").join(name);
  const m = text.match(/^([^.?!]{2,28})\./);
  // Kein Komma im ersten Satz: sonst steht dort schon eine Anrede ("Hallo, du.")
  // und es wuerde "Hallo, du, Rakete." daraus.
  if (!m || m[1].includes(",")) return text;
  return text.replace(m[0], m[1] + ", " + name + ".");
}

const waehleGruss = (langeWeg, deckname) => {
  // Pro Sprache ein eigener Topf. Faellt eine Sprache aus, greift Deutsch -
  // besser ein deutscher Gruss als gar keiner.
  const topfSprache = SPR === "en" ? GRUESSE_EN : GRUESSE;
  const schluessel = langeWeg ? "zurueck" : tageszeit(new Date().getHours());
  const zeit = topfSprache[schluessel] || GRUESSE[schluessel];
  /* Wer sich einen Namen gegeben hat, wird damit angesprochen - das war Marcs
     Ansage. Zwei Folgen daraus:
     1. Die mit "~" markierten Gruesse fallen weg. Sie leben vom Witz "ich weiss
        nicht, wer du bist" - mit bekanntem Namen waeren sie schlicht unwahr.
     2. Die Gruesse MIT Anrede werden doppelt gewichtet, damit der Name auch
        wirklich haeufig vorkommt statt nur gelegentlich. */
  const hatName = !!(deckname && deckname.trim());
  const erlaubt = zeit.filter((g) => hatName ? g[0] !== "~" : true);
  const topf = hatName ? [...erlaubt, ...(SPR === "en" ? DECKNAMENSGRUESSE_EN : DECKNAMENSGRUESSE)] : erlaubt;
  const vorlage = topf[Math.floor(Math.random() * topf.length)];
  // Ohne eigenen Namen springt ein Kosename ein - nie ein leerer Platz.
  const kose = SPR === "en" ? KOSENAMEN_EN : KOSENAMEN;
  const name = hatName ? deckname.trim()
    : kose[Math.floor(Math.random() * kose.length)];
  const roh = vorlage.replace(/^~/, "");
  // Uebersetzung IMMER am unveraenderten Text nachschlagen - danach steht dort
  // ein Name, und der Eintrag waere nicht mehr zu finden.
  const ueber = (SPR === "en" ? GRUSS_UEBER_EN : GRUSS_UEBER)[roh] || "";
  return { text: setzeAnrede(roh, name), ueber };
};
const DECKNAMENSGRUESSE_EN = [
  "Hello, %N%.", "Hi, %N%!", "Good to see you, %N%.", "There you are, %N%.",
  "Hey %N%.", "%N%! Perfect timing.", "Welcome, %N%.", "Ready when you are, %N%.",
];
const DECKNAMENSGRUESSE = [
  "Hallo, %N%.", "Servus, %N%!", "Schön, dass du da bist, %N%.", "Grüß dich, %N%.",
  "Guten Tag, %N%.", "Da bist du ja, %N%.", "Hi %N%.", "%N%! Genau die richtige Zeit.",
];
// Kurzschreibweise fuer Karten. Der dritte Eintrag ist die Erklaerung ("Warum?")
// und bleibt optional - alte Zweier-Eintraege funktionieren unveraendert.
const P = (arr) => arr.map(([f, b, w]) => (w ? { f, b, w } : { f, b }));
const CATALOG = [
  {
    category: "Unterstufe 1", subject: "Mathematik", name: "Teilbarkeit & Primzahlen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wann ist eine Zahl durch 2 teilbar?", "Wenn die letzte Ziffer 0, 2, 4, 6 oder 8 ist.",
       "Unser Zahlensystem baut auf Zehnern auf, und 10 ist selbst durch 2 teilbar. Deshalb spielt alles vor der letzten Stelle keine Rolle — nur die Einerziffer entscheidet."],
      ["Wann ist eine Zahl durch 5 teilbar?", "Wenn sie auf 0 oder 5 endet.",
       "Gleicher Grund wie bei der 2: Zehner sind durch 5 teilbar, also zählt nur die letzte Ziffer."],
      ["Wann ist eine Zahl durch 3 teilbar?", "Wenn ihre Quersumme durch 3 teilbar ist.",
       "Beispiel 471: 4+7+1 = 12, und 12 ist durch 3 teilbar — also auch 471. Das funktioniert, weil 10, 100 und 1000 beim Teilen durch 3 immer den Rest 1 lassen."],
      ["Wie bildet man die Quersumme von 3856?", "3 + 8 + 5 + 6 = 22.",
       "Die Quersumme ist die Summe aller Ziffern. Sie ist der Schlüssel zu den Teilbarkeitsregeln für 3 und 9."],
      ["Was ist eine Primzahl?", "Eine Zahl größer als 1, die nur durch 1 und sich selbst teilbar ist.",
       "2, 3, 5, 7, 11, 13 … Die 1 zählt bewusst nicht dazu: sonst wäre die Zerlegung in Primfaktoren nicht mehr eindeutig."],
      ["Welche ist die einzige gerade Primzahl?", "Die 2.",
       "Jede andere gerade Zahl lässt sich durch 2 teilen und hat damit einen dritten Teiler — sie fällt also durch die Definition."],
      ["Zerlege 60 in Primfaktoren.", "60 = 2 · 2 · 3 · 5.",
       "Man teilt immer wieder durch die kleinste passende Primzahl: 60:2=30, 30:2=15, 15:3=5. Jede Zahl hat genau eine solche Zerlegung."],
      ["Was ist der größte gemeinsame Teiler (ggT) von 12 und 18?", "6.",
       "Teiler von 12: 1,2,3,4,6,12. Teiler von 18: 1,2,3,6,9,18. Der größte gemeinsame ist 6. Den ggT braucht man zum Kürzen von Brüchen."],
      ["Was ist das kleinste gemeinsame Vielfache (kgV) von 4 und 6?", "12.",
       "Vielfache von 4: 4,8,12… Vielfache von 6: 6,12… Das kgV braucht man, wenn man Brüche mit verschiedenen Nennern addiert."],
      ["Ist 91 eine Primzahl?", "Nein — 91 = 7 · 13.",
       "91 sieht wie eine Primzahl aus, weil sie ungerade ist und keine Quersummenregel greift. Man muss der Reihe nach prüfen: 7 geht auf. Bis zur Wurzel der Zahl zu testen genügt."],
      ["Wann ist eine Zahl durch 9 teilbar?", "Wenn ihre Quersumme durch 9 teilbar ist.",
       "Beispiel 837: 8+3+7 = 18, das ist durch 9 teilbar — also auch 837."],
      ["Wann ist eine Zahl durch 4 teilbar?", "Wenn die letzten beiden Ziffern eine durch 4 teilbare Zahl bilden.",
       "Beispiel 1316: die 16 ist durch 4 teilbar, also auch 1316. Alles davor besteht aus Hundertern, und 100 ist selbst durch 4 teilbar."],
    ]),
  },
  {
    category: "Unterstufe 1", subject: "Mathematik", name: "Brüche verstehen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was sagt der Nenner eines Bruchs?", "In wie viele gleiche Teile das Ganze zerlegt ist.",
       "Bei 3/8 ist die 8 der Nenner: das Ganze wurde in acht gleiche Stücke geteilt. Je größer der Nenner, desto kleiner die einzelnen Stücke."],
      ["Was sagt der Zähler eines Bruchs?", "Wie viele dieser Teile gemeint sind.",
       "Bei 3/8 ist die 3 der Zähler: drei von acht Stücken. Der Zähler zählt, der Nenner benennt."],
      ["Was bedeutet Kürzen?", "Zähler und Nenner durch dieselbe Zahl teilen.",
       "6/8 gekürzt durch 2 ergibt 3/4. Der Wert bleibt gleich — es ist derselbe Anteil, nur anders aufgeschrieben."],
      ["Was bedeutet Erweitern?", "Zähler und Nenner mit derselben Zahl multiplizieren.",
       "1/2 erweitert mit 3 ergibt 3/6. Man braucht es, um Brüche auf denselben Nenner zu bringen."],
      ["Wie addiert man 1/4 + 1/2?", "Auf gleichen Nenner bringen: 1/4 + 2/4 = 3/4.",
       "Man kann nur zählen, was gleich groß ist. Viertel und Hälften sind verschieden große Stücke — deshalb wird 1/2 zu 2/4 erweitert."],
      ["Warum darf man Brüche nicht einfach Zähler plus Zähler addieren?", "Weil die Teile dann unterschiedlich groß wären.",
       "1/2 + 1/2 wäre sonst 2/4, also ein halbes — es ist aber ein Ganzes. Erst der gemeinsame Nenner macht die Stücke vergleichbar."],
      ["Was ist ein echter Bruch?", "Ein Bruch, bei dem der Zähler kleiner ist als der Nenner.",
       "3/4 ist echt und kleiner als 1. Bei 5/4 ist der Zähler größer — das ist ein unechter Bruch und ergibt mehr als ein Ganzes."],
      ["Wandle 7/4 in eine gemischte Zahl um.", "1 3/4.",
       "7 geteilt durch 4 ergibt 1 Rest 3. Das Ganze ist die 1, der Rest bleibt als Bruch stehen."],
      ["Wie multipliziert man 2/3 · 3/5?", "Zähler mal Zähler, Nenner mal Nenner: 6/15, gekürzt 2/5.",
       "Bei der Multiplikation braucht man keinen gemeinsamen Nenner — anders als beim Addieren. Das überrascht viele."],
      ["Wie dividiert man durch einen Bruch?", "Mit dem Kehrwert multiplizieren.",
       "1/2 : 1/4 = 1/2 · 4/1 = 2. Anschaulich: Wie oft passt ein Viertel in eine Hälfte? Zweimal."],
      ["Welcher Bruch ist größer: 3/5 oder 5/8?", "5/8.",
       "Auf gemeinsamen Nenner 40 gebracht: 24/40 und 25/40. Bei ähnlich großen Brüchen hilft nur rechnen, Schätzen täuscht hier leicht."],
      ["Was ist 3/4 als Dezimalzahl?", "0,75.",
       "Der Bruchstrich ist ein Geteiltzeichen: 3 geteilt durch 4 ergibt 0,75. So kann man jeden Bruch in eine Dezimalzahl verwandeln."],
      ["Was ist 1/3 als Dezimalzahl?", "0,333… — eine periodische Dezimalzahl.",
       "1 geteilt durch 3 geht nie auf. Man schreibt 0,3 mit einem Strich über der 3. Nicht jeder Bruch lässt sich sauber als Dezimalzahl schreiben."],
    ]),
  },
  {
    category: "Unterstufe 1", subject: "Deutsch", name: "Wortarten sicher erkennen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist ein Nomen?", "Ein Wort für Lebewesen, Dinge, Orte oder Gedachtes — es wird großgeschrieben.",
       "Hund, Tisch, Wien, Freundschaft. Der Test: Man kann der, die oder das davorsetzen. Auch Wörter für Gefühle sind Nomen, obwohl man sie nicht anfassen kann."],
      ["Was ist ein Verb?", "Ein Wort, das sagt, was jemand tut oder was geschieht.",
       "laufen, denken, regnen. Verben verändern sich nach Person und Zeit — daran erkennt man sie am sichersten."],
      ["Was ist ein Adjektiv?", "Ein Wort, das beschreibt, wie etwas ist.",
       "schnell, blau, müde. Der Test: Es passt in den Satz „Der Hund ist …“. Adjektive kann man steigern: schnell, schneller, am schnellsten."],
      ["Welche Wortart ist „schnell“ in „Er läuft schnell“?", "Adjektiv — hier als Umstandsangabe zum Verb.",
       "Im Deutschen bleibt es dieselbe Wortart, egal ob es ein Nomen beschreibt („der schnelle Läufer“) oder ein Verb („läuft schnell“). Nur die Rolle im Satz ändert sich."],
      ["Was ist ein Pronomen?", "Ein Wort, das ein Nomen ersetzt.",
       "ich, du, er, sie, mein, dieser. Ohne Pronomen müsste man ständig denselben Namen wiederholen — sie halten Texte lesbar."],
      ["Was ist ein Artikel?", "Ein Begleiter des Nomens: der, die, das oder ein, eine.",
       "der, die, das sind bestimmt (ein ganz bestimmter Hund), ein und eine unbestimmt (irgendein Hund)."],
      ["Was ist eine Präposition?", "Ein Wort, das ein Verhältnis angibt — meist Ort oder Zeit.",
       "auf, unter, vor, nach, wegen. Sie stehen vor einem Nomen und bestimmen dessen Fall: „wegen des Regens“ verlangt den zweiten Fall."],
      ["Wie erkennt man ein Nomen sicher?", "Man kann einen Artikel davorsetzen und es großschreiben.",
       "Bei „das Laufen“ wird sogar ein Verb zum Nomen. Diese Probe ist zuverlässiger als die Frage, ob man das Wort anfassen kann."],
      ["Welche Wortart ist „weil“?", "Eine Konjunktion — sie verbindet zwei Sätze.",
       "und, oder, aber, weil, dass. „Weil“ ist besonders: Es schickt das Verb ans Satzende. „Ich bleibe daheim, weil ich krank bin.“"],
      ["Was ist ein Numerale?", "Ein Zahlwort.",
       "drei, erste, viele, wenige. Auch unbestimmte Mengenangaben wie „einige“ gehören dazu."],
      ["Warum schreibt man „das Schöne“ groß?", "Weil das Adjektiv hier als Nomen gebraucht wird.",
       "Der Artikel „das“ macht es zum Nomen. Solche Nominalisierungen erkennt man an Wörtern wie das, ein, alles, nichts davor."],
      ["Welche Wortart ist „sehr“?", "Ein Adverb — es verstärkt ein Adjektiv.",
       "„sehr schnell“, „ziemlich müde“. Adverbien verändern sich nie, egal in welchem Satz sie stehen. Das unterscheidet sie von Adjektiven."],
    ]),
  },
  {
    category: "Unterstufe 1", subject: "Deutsch", name: "Die vier Fälle", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Mit welcher Frage findet man den 1. Fall (Nominativ)?", "Wer oder was?",
       "„Der Hund bellt.“ Wer bellt? Der Hund. Der erste Fall ist fast immer das Subjekt — der Satzgegenstand."],
      ["Mit welcher Frage findet man den 2. Fall (Genitiv)?", "Wessen?",
       "„Das Haus des Nachbarn.“ Wessen Haus? Des Nachbarn. Der zweite Fall zeigt meist Besitz oder Zugehörigkeit."],
      ["Mit welcher Frage findet man den 3. Fall (Dativ)?", "Wem?",
       "„Ich gebe dem Kind das Buch.“ Wem gebe ich es? Dem Kind. Der dritte Fall bezeichnet oft den Empfänger."],
      ["Mit welcher Frage findet man den 4. Fall (Akkusativ)?", "Wen oder was?",
       "„Ich sehe den Hund.“ Wen sehe ich? Den Hund. Der vierte Fall bezeichnet meist das, worauf sich die Handlung richtet."],
      ["In welchem Fall steht „dem Freund“ in „Ich helfe dem Freund“?", "3. Fall (Dativ).",
       "„helfen“ verlangt immer den dritten Fall — anders als das ähnlich klingende „unterstützen“, das den vierten verlangt. Solche Verben muss man sich merken."],
      ["In welchem Fall steht „einen Apfel“ in „Sie isst einen Apfel“?", "4. Fall (Akkusativ).",
       "Wen oder was isst sie? Einen Apfel. Bei männlichen Nomen ist der vierte Fall gut erkennbar: der wird zu den."],
      ["Wie lautet „der Baum“ im 2. Fall?", "des Baumes.",
       "Männliche und sächliche Nomen bekommen im zweiten Fall meist ein -es oder -s angehängt."],
      ["Warum heißt es „wegen des Wetters“ und nicht „wegen dem Wetter“?", "Weil „wegen“ den 2. Fall verlangt.",
       "In der Umgangssprache hört man oft den dritten Fall. Geschrieben gilt der zweite — wie bei während, trotz und statt."],
      ["Welchen Fall verlangt „mit“?", "Immer den 3. Fall.",
       "mit dem Auto, mit der Freundin. Einige Präpositionen legen den Fall fest: mit, nach, bei, seit, von, zu, aus verlangen immer den dritten."],
      ["Welchen Fall verlangt „für“?", "Immer den 4. Fall.",
       "für den Vater, für die Schule. Auch durch, ohne, gegen und um verlangen immer den vierten Fall."],
      ["Warum sind die Fälle im Deutschen wichtig?", "Sie zeigen, welche Rolle ein Wort im Satz spielt.",
       "„Der Hund beißt den Mann“ und „Den Hund beißt der Mann“ bedeuten Verschiedenes — obwohl dieselben Wörter dastehen. Die Fälle tragen die Bedeutung, nicht die Reihenfolge."],
    ]),
  },
  {
    category: "Unterstufe 1", subject: "Biologie", name: "Wirbeltiere & ihre Gruppen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Welche fünf Gruppen von Wirbeltieren gibt es?", "Fische, Amphibien, Reptilien, Vögel, Säugetiere.",
       "Alle haben eine Wirbelsäule aus einzelnen Knochen. Die Reihenfolge entspricht ungefähr der Entwicklungsgeschichte — Fische waren zuerst da."],
      ["Was ist typisch für Säugetiere?", "Sie säugen ihre Jungen mit Milch und haben Haare.",
       "Auch Wale und Delfine sind Säugetiere, obwohl sie im Wasser leben. Sie atmen mit Lungen und müssen zum Luftholen auftauchen."],
      ["Was unterscheidet gleichwarme von wechselwarmen Tieren?", "Gleichwarme halten ihre Körpertemperatur konstant, wechselwarme richten sich nach der Umgebung.",
       "Vögel und Säugetiere sind gleichwarm — das kostet viel Energie, deshalb müssen sie viel fressen. Reptilien sind wechselwarm und sonnen sich morgens, um in Fahrt zu kommen."],
      ["Womit atmen Fische?", "Mit Kiemen.",
       "Kiemen holen den im Wasser gelösten Sauerstoff heraus. An Land kleben sie zusammen und funktionieren nicht mehr — deshalb ersticken Fische außerhalb des Wassers."],
      ["Was ist bei Amphibien besonders an der Entwicklung?", "Sie leben zuerst im Wasser mit Kiemen und später an Land mit Lungen.",
       "Die Kaulquappe des Frosches hat Kiemen und einen Ruderschwanz. Bei der Verwandlung wachsen Beine, die Lunge bildet sich, der Schwanz bildet sich zurück."],
      ["Warum haben Vögel hohle Knochen?", "Um Gewicht zu sparen.",
       "Die Knochen sind innen von feinen Streben durchzogen — leicht und trotzdem stabil. Dieses Bauprinzip nutzt heute auch die Technik im Flugzeugbau."],
      ["Was ist ein Reptil?", "Ein wechselwarmes Wirbeltier mit Schuppenhaut, das an Land Eier legt.",
       "Schlangen, Echsen, Schildkröten, Krokodile. Die trockene Schuppenhaut schützt vor dem Austrocknen — deshalb können Reptilien auch in Wüsten leben."],
      ["Warum können Vögel fliegen, Säugetiere aber fast nie?", "Vögel haben Federn, hohle Knochen und eine starke Flugmuskulatur.",
       "Die Ausnahme unter den Säugetieren ist die Fledermaus — sie fliegt mit einer Flughaut statt mit Federn."],
      ["Was ist ein Beuteltier?", "Ein Säugetier, dessen Junge sehr früh geboren werden und im Beutel weiterwachsen.",
       "Ein neugeborenes Känguru ist etwa so groß wie eine Bohne. Es krabbelt selbstständig in den Beutel und trinkt dort monatelang weiter."],
      ["Welche Wirbeltiergruppe legt Eier mit harter Schale?", "Vögel und viele Reptilien.",
       "Die harte Schale schützt vor dem Austrocknen und macht die Fortpflanzung unabhängig vom Wasser. Amphibien können das nicht — ihr Laich braucht Wasser."],
      ["Warum ist ein Wal kein Fisch?", "Er atmet mit Lungen, säugt seine Jungen und ist gleichwarm.",
       "Die Fischform ist reine Anpassung ans Wasser. Am Skelett sieht man es: Wale haben Fingerknochen in den Flossen, wie alle Säugetiere."],
    ]),
  },
  {
    category: "Unterstufe 1", subject: "Geographie & Wirtschaft", name: "Österreich: Länder & Landschaft", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wie viele Bundesländer hat Österreich?", "Neun.",
       "Burgenland, Kärnten, Niederösterreich, Oberösterreich, Salzburg, Steiermark, Tirol, Vorarlberg und Wien. Wien ist zugleich Stadt und Bundesland."],
      ["Welches Bundesland ist das größte nach Fläche?", "Niederösterreich.",
       "Mit rund 19 200 Quadratkilometern. Das flächenmäßig kleinste ist Wien mit etwa 415 — Niederösterreich ist also rund 46-mal so groß."],
      ["Welcher Fluss durchquert Österreich von West nach Ost?", "Die Donau.",
       "Sie kommt aus Deutschland, fließt durch Linz, Krems und Wien und weiter in die Slowakei. Über sie lief jahrhundertelang der Handel."],
      ["Was ist der höchste Berg Österreichs?", "Der Großglockner mit 3798 Metern.",
       "Er liegt an der Grenze zwischen Kärnten und Tirol in den Hohen Tauern."],
      ["Welche Staaten grenzen an Österreich?", "Acht: Deutschland, Tschechien, Slowakei, Ungarn, Slowenien, Italien, Schweiz, Liechtenstein.",
       "Acht Nachbarn sind viel für ein kleines Land — das erklärt, warum in Österreich so viele Sprachen und Küchen aufeinandertreffen."],
      ["Was ist der größte See Österreichs?", "Der Neusiedler See im Burgenland.",
       "Er ist sehr flach — meist nur ein bis zwei Meter tief — und teilweise von Schilf umgeben. Ein Teil liegt in Ungarn."],
      ["Was versteht man unter dem Alpenvorland?", "Das hügelige Gebiet zwischen Alpen und Donau.",
       "Hier liegt fruchtbarer Boden, deshalb wird viel Landwirtschaft betrieben. Es ist dichter besiedelt als das Gebirge."],
      ["Warum ist der Westen Österreichs dünner besiedelt als der Osten?", "Weil dort die Hochgebirge liegen.",
       "In steilem Gelände lässt sich schlecht bauen und wenig Landwirtschaft betreiben. Die Menschen siedeln in den Tälern — der Osten ist flacher und bietet mehr Platz."],
      ["Was ist eine Passstraße?", "Eine Straße über einen tiefen Einschnitt im Gebirgskamm.",
       "Der Brenner ist der wichtigste Alpenpass Österreichs. Über ihn läuft ein großer Teil des Verkehrs zwischen Nord- und Südeuropa."],
      ["Wie heißt die Hauptstadt der Steiermark?", "Graz.",
       "Graz ist nach Wien die zweitgrößte Stadt Österreichs."],
      ["Was bedeutet „Föhn“ in den Alpen?", "Ein warmer, trockener Fallwind.",
       "Feuchte Luft regnet sich an der einen Seite des Gebirges ab und wird beim Absinken auf der anderen Seite warm und trocken. Manche Menschen bekommen davon Kopfschmerzen."],
    ]),
  },
  {
    category: "Unterstufe 1", subject: "Geschichte & Politik", name: "Steinzeit & erste Städte", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wovon lebten die Menschen in der Altsteinzeit?", "Vom Jagen und Sammeln.",
       "Sie zogen den Tieren hinterher und blieben nirgends lange. Feste Häuser lohnten sich nicht, wenn man ohnehin weiterziehen muss."],
      ["Was änderte sich in der Jungsteinzeit grundlegend?", "Die Menschen wurden sesshaft und begannen mit Ackerbau und Viehzucht.",
       "Das ist die größte Umstellung der Menschheitsgeschichte. Wer Felder bestellt, bleibt — daraus entstanden Dörfer, Vorratshaltung, Besitz und schließlich Städte."],
      ["Warum war das Feuer für die frühen Menschen so wichtig?", "Es gab Wärme, Licht, Schutz vor Tieren und machte Nahrung bekömmlicher.",
       "Gekochtes Essen ist leichter zu verdauen — der Körper bekommt mehr Energie aus derselben Menge. Manche Forscher sehen darin eine Voraussetzung für unser großes Gehirn."],
      ["Was ist ein Faustkeil?", "Ein zugeschlagener Stein, der als Universalwerkzeug diente.",
       "Damit ließ sich schneiden, schaben und hacken. Er ist das älteste bekannte Werkzeug, das planvoll hergestellt wurde."],
      ["Woraus wurden in der Bronzezeit Werkzeuge gemacht?", "Aus Bronze, einer Mischung aus Kupfer und Zinn.",
       "Bronze ist härter als reines Kupfer. Weil Zinn selten ist, entstand Fernhandel — Metall brachte die Menschen ins Reisen."],
      ["Warum entstanden die ersten Städte an großen Flüssen?", "Wegen des fruchtbaren Bodens und des Wassers.",
       "Euphrat, Tigris, Nil und Indus überschwemmten regelmäßig und hinterließen fruchtbaren Schlamm. Das brachte Ernteüberschüsse — und erst ein Überschuss erlaubt es, dass nicht alle Landwirtschaft betreiben müssen."],
      ["Was ist Bewässerungsfeldbau?", "Landwirtschaft, bei der Wasser über Kanäle auf die Felder geleitet wird.",
       "Er verlangt Zusammenarbeit über viele Familien hinweg — jemand muss Kanäle planen und Streit schlichten. Aus dieser Organisation entstanden die ersten Verwaltungen."],
      ["Wozu wurde die Schrift ursprünglich erfunden?", "Zum Festhalten von Besitz und Vorräten.",
       "Die ältesten Tontafeln sind Listen: so viele Krüge Öl, so viele Sack Getreide. Geschichten und Gedichte kamen erst viel später dazu."],
      ["Was ist ein Hügelgrab?", "Ein Grab, über dem ein Erdhügel aufgeschüttet wurde.",
       "Aus den Beigaben lässt sich ablesen, wie wichtig eine Person war. Solche Unterschiede zeigen, dass es schon damals Arm und Reich gab."],
      ["Wie heißt der berühmte Mann aus dem Eis, den man 1991 in den Alpen fand?", "Ötzi.",
       "Er lebte vor rund 5300 Jahren. Weil er im Eis eingeschlossen war, blieben Kleidung, Werkzeuge und sogar sein letzter Mageninhalt erhalten — ein Glücksfall für die Forschung."],
    ]),
  },
  {
    category: "Unterstufe 1", subject: "Englisch", name: "Unregelmäßige Verben 1", flang: "en-US", blang: "de-DE",
    cards: P([
      ["go — went — gone", "gehen",
       "Die drei Formen heißen Grundform, Vergangenheit und Partizip. „I go“, „I went“, „I have gone“. Bei unregelmäßigen Verben hilft nur auswendig lernen — dafür kommen genau diese am häufigsten vor."],
      ["see — saw — seen", "sehen"],
      ["take — took — taken", "nehmen"],
      ["come — came — come", "kommen",
       "Hier sind Grundform und Partizip gleich — das kommt öfter vor und spart Arbeit."],
      ["give — gave — given", "geben"],
      ["make — made — made", "machen, herstellen",
       "„make“ heißt herstellen, „do“ heißt tun. „Make a cake“ — der Kuchen entsteht neu. „Do the homework“ — die Aufgabe war schon da."],
      ["write — wrote — written", "schreiben"],
      ["speak — spoke — spoken", "sprechen"],
      ["buy — bought — bought", "kaufen"],
      ["think — thought — thought", "denken",
       "Achtung bei der Aussprache: „thought“ klingt wie „thort“, das gh ist stumm."],
      ["bring — brought — brought", "bringen"],
      ["find — found — found", "finden"],
      ["know — knew — known", "wissen, kennen",
       "Englisch unterscheidet nicht zwischen wissen und kennen — beides ist „know“. Deutschsprachige machen hier oft den umgekehrten Fehler."],
      ["begin — began — begun", "beginnen"],
      ["drink — drank — drunk", "trinken"],
    ]),
  },
  {
    category: "Unterstufe 1", subject: "Englisch", name: "Present Simple oder Present Progressive?", flang: "en-US", blang: "de-DE",
    cards: P([
      ["Wann benutzt man das Present Simple?", "Für Gewohnheiten und Dauerhaftes.",
       "„I play football every Tuesday.“ Signalwörter: always, usually, often, every day, never."],
      ["Wann benutzt man das Present Progressive?", "Für das, was gerade jetzt passiert.",
       "„I am playing football right now.“ Signalwörter: now, at the moment, look!, listen!"],
      ["Wie bildet man das Present Progressive?", "Mit am/is/are und der -ing-Form.",
       "I am working, he is working, they are working. Die Form von „to be“ richtet sich nach der Person."],
      ["Was passiert im Present Simple bei he, she, it?", "Das Verb bekommt ein -s.",
       "„He plays“, „she works“, „it rains“. Die Merkregel heißt: he, she, it — das s muss mit."],
      ["Übersetze: „Sie liest gerade ein Buch.“", "She is reading a book.",
       "„Gerade“ verlangt das Progressive. Mit „She reads a book“ würde man sagen, dass sie generell Bücher liest."],
      ["Übersetze: „Ich gehe jeden Tag zur Schule.“", "I go to school every day.",
       "„Jeden Tag“ ist eine Gewohnheit, also Present Simple — nicht „I am going“."],
      ["Warum ist „I am knowing the answer“ falsch?", "Weil „know“ ein Zustandsverb ist.",
       "Zustandsverben wie know, like, want, believe, understand stehen nie in der Verlaufsform. Man kann Wissen nicht „gerade tun“."],
      ["Wie verneint man „He plays tennis“?", "He does not play tennis.",
       "Das -s wandert zum Hilfsverb: does. Danach steht die Grundform ohne -s. Ein häufiger Fehler ist „He doesn't plays“."],
      ["Wie fragt man nach „They live in Vienna“?", "Do they live in Vienna?",
       "Im Present Simple braucht man do oder does für Fragen. Nur bei „to be“ nicht: „Are they happy?“"],
      ["Was ist bei der -ing-Form von „write“ zu beachten?", "Das stumme e fällt weg: writing.",
       "Ebenso: make → making, come → coming. Bei „run“ dagegen wird der Endkonsonant verdoppelt: running."],
    ]),
  },
  {
    category: "Medien", subject: "Wie Apps dich halten", name: "Die Tricks im Design", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist „endloses Scrollen“?", "Eine Liste ohne Ende — es kommt immer noch etwas nach.",
       "Erfunden hat es Aza Raskin im Jahr 2006. Er hat sich später öffentlich dafür entschuldigt. Sein Punkt: Früher war eine Seite zu Ende, und dieses Ende war der Moment, in dem man aufhören konnte. Ohne Ende fehlt dieser Moment — man hört nicht auf, weil man genug hat, sondern weil etwas dazwischenkommt."],
      ["Warum sieht das Nachladen bei vielen Apps aus wie ein Hebelziehen?", "Weil es dem Spielautomaten nachempfunden ist.",
       "Man zieht nach unten, es dreht sich kurz — und dann kommt etwas Neues. Oder auch nicht. Genau diese Unsicherheit ist der Reiz. Beim Spielautomaten heißt das Prinzip variable Belohnung, und es hält Menschen nachweislich länger bei der Sache als eine sichere Belohnung."],
      ["Warum ist es spannender, wenn man NICHT weiß, was kommt?", "Weil unser Gehirn auf Unsicherheit stärker anspringt als auf Sicherheit.",
       "Ein Briefkasten, in dem sicher nichts liegt, wird nicht kontrolliert. Einer, in dem vielleicht etwas liegt, ständig. Apps bauen genau diese Unsicherheit ein: mal ist etwas Tolles da, mal nichts."],
      ["Was macht Autoplay?", "Es startet das nächste Video von allein.",
       "Damit verschwindet die Entscheidung. Wer weiterschauen will, muss nichts tun — wer aufhören will, muss aktiv werden. Das klingt nach einem Detail, dreht aber die Richtung um: Aufhören kostet plötzlich Kraft."],
      ["Was ist eine Serie oder ein „Streak“?", "Eine Zählung, die abreißt, wenn man einen Tag aussetzt.",
       "Der Trick liegt nicht im Gewinnen, sondern im Verlieren: Nach 100 Tagen will niemand bei null anfangen. Man kommt dann nicht mehr, weil es Freude macht, sondern damit die Zahl nicht kaputtgeht."],
      ["Warum kommen Benachrichtigungen oft abends?", "Weil dann viele Menschen Zeit haben — und weil sie zurückholen sollen.",
       "Der Zeitpunkt ist nicht zufällig, sondern berechnet. Eine Nachricht, die niemanden erreicht, wäre verschwendet."],
      ["Was bedeutet ein roter Punkt auf einem App-Symbol?", "Er soll das Gefühl erzeugen, dass etwas Unerledigtes wartet.",
       "Rot ist die Farbe für Warnung. Unser Blick springt automatisch dorthin. Bei den meisten dieser Punkte wartet aber nichts Wichtiges — es ist eine Einladung, die wie eine Pflicht aussieht."],
      ["Warum zeigen viele Apps, wenn jemand deine Nachricht gelesen hat?", "Weil das Druck erzeugt, schnell zu antworten.",
       "Für die Unterhaltung ist es meist unwichtig. Aber es macht aus einer freundlichen Nachricht eine offene Rechnung — und hält beide Seiten in der App."],
      ["Was ist ein Algorithmus im Zusammenhang mit Apps?", "Eine Rechenvorschrift, die entscheidet, was du als Nächstes zu sehen bekommst.",
       "Er lernt aus dem, was du anschaust und wie lange. Wichtig zu wissen: Er sucht nicht das Beste für dich, sondern das, was dich am längsten dabei hält. Das ist manchmal dasselbe — oft aber nicht."],
      ["Warum bekommen zwei Menschen bei derselben App völlig Verschiedenes zu sehen?", "Weil jeder seinen eigenen berechneten Kanal hat.",
       "Es gibt keine gemeinsame Sendung wie früher beim Fernsehen. Das heißt auch: Was du für „das Internet“ hältst, ist ein Ausschnitt, den jemand für dich zusammengestellt hat."],
      ["Was ist „FOMO“?", "Die Angst, etwas zu verpassen — von englisch „fear of missing out“.",
       "Sie entsteht, wenn man ständig sieht, was andere gerade machen. Früher wusste man am Montag, was am Wochenende los war. Heute sieht man es in dem Moment, in dem man nicht dabei ist."],
      ["Warum wirkt das Leben anderer Leute online oft besser als das eigene?", "Weil man ihre besten Momente mit dem eigenen Alltag vergleicht.",
       "Niemand postet den langweiligen Dienstagnachmittag. Man sieht bei anderen die Höhepunkte aus Monaten und bei sich selbst alles. Der Vergleich ist unfair aufgebaut, auch wenn niemand lügt."],
    ]),
  },
  {
    category: "Medien", subject: "Wie Apps dich halten", name: "Warum das alles gemacht wird", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Womit verdienen kostenlose Apps ihr Geld?", "Meist mit Werbung.",
       "Sie verkaufen nicht die App, sondern die Aufmerksamkeit ihrer Nutzer an Firmen, die etwas bewerben wollen. Deshalb der alte Satz: Wenn du nicht bezahlst, bist du nicht die Kundin, sondern die Ware."],
      ["Warum ist Zeit für eine Werbe-App wertvoll?", "Je länger jemand bleibt, desto mehr Werbung kann gezeigt werden.",
       "Aus dieser einen Tatsache folgt fast alles andere: endloses Scrollen, Autoplay, Benachrichtigungen. Es ist kein böser Plan, sondern eine sehr direkte Rechnung."],
      ["Was wird über dich gesammelt, wenn du eine App benutzt?", "Zum Beispiel, was du anschaust, wie lange, wann und von wo aus.",
       "Daraus entsteht ein Profil, das erstaunlich genau ist — auch ohne deinen Namen. Es geht nicht darum, wer du bist, sondern darum, was dich zum Anhalten bringt."],
      ["Was ist personalisierte Werbung?", "Werbung, die auf dich zugeschnitten ist.",
       "Wenn zwei Personen dieselbe App öffnen, sehen sie verschiedene Anzeigen. Bei Kindern und Jugendlichen ist das in der EU stark eingeschränkt — genau deshalb, weil es besonders gut wirkt."],
      ["Was ist ein „In-App-Kauf“?", "Ein Kauf innerhalb einer App, oft für Spielvorteile oder Aussehen.",
       "Häufig zahlt man mit einer Zwischenwährung — Münzen, Kristalle, Diamanten. Das ist Absicht: Bei „1200 Juwelen“ merkt man schlechter, wie viel echtes Geld gerade weggeht."],
      ["Was ist eine „Lootbox“?", "Eine Kiste im Spiel, deren Inhalt man erst nach dem Öffnen kennt.",
       "Man zahlt für eine Chance, nicht für eine Sache. Mehrere Länder prüfen deshalb, ob das rechtlich Glücksspiel ist. In Belgien sind Lootboxen weitgehend verboten."],
      ["Warum sind Spiele für Kinder oft gratis, kosten am Ende aber Geld?", "Weil der Einstieg leicht sein soll und das Zahlen später kommt.",
       "Wer schon dreißig Stunden investiert hat, gibt eher etwas aus als jemand, der die App gerade erst installiert. Das Modell heißt Free-to-play und ist genau darauf gebaut."],
      ["Was ist der Unterschied zwischen einer Empfehlung und Werbung?", "Werbung ist bezahlt, eine Empfehlung nicht — man sieht es aber oft nicht.",
       "Deshalb schreibt das Gesetz vor, dass bezahlte Beiträge gekennzeichnet werden müssen: Werbung, Anzeige. Steht das nicht dabei, ist es ein Regelverstoß — und ein Hinweis darauf, dass jemand es dir nicht sagen wollte."],
      ["Woran erkennst du bezahlte Beiträge?", "An Kennzeichnungen wie Werbung, Anzeige oder gesponsert.",
       "Wörter wie „Kooperation“, „Danke an …“ oder ein Rabattcode sind ebenfalls Hinweise. Ein Rabattcode heißt fast immer, dass mitverdient wird."],
    ]),
  },
  {
    category: "Medien", subject: "Kopf & Körper", name: "Was zu viel wirklich macht", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Kann man wirklich mehrere Dinge gleichzeitig tun?", "Nein — man wechselt sehr schnell hin und her.",
       "Das Gehirn schaltet um, statt parallel zu arbeiten. Jeder Wechsel kostet einen Moment, um wieder hineinzufinden. Deshalb dauert Hausaufgaben-mit-Handy-daneben länger als Hausaufgaben ohne — und das Ergebnis wird schlechter."],
      ["Warum stört ein Handy schon, wenn es nur daneben liegt?", "Weil ein Teil der Aufmerksamkeit bei der Frage bleibt, ob etwas kommt.",
       "Man muss gar nicht draufschauen. Schon das Wissen, dass jederzeit etwas kommen kann, bindet Aufmerksamkeit. In eine andere Ecke legen wirkt besser als umdrehen."],
      ["Warum schlafen viele Jugendliche zu wenig?", "Oft, weil abends noch etwas Interessantes kommt — nicht wegen des Bildschirmlichts.",
       "Über Blaulicht wird viel geredet, seine Wirkung ist aber kleiner als gedacht. Der größere Effekt ist einfacher: Wer bis Mitternacht scrollt, ist bis Mitternacht wach. Die Zeit fehlt, nicht die Farbe."],
      ["Wie viel Schlaf brauchen die meisten Jugendlichen?", "Etwa acht bis zehn Stunden pro Nacht.",
       "Das ist mehr als Erwachsene brauchen. In der Pubertät verschiebt sich zusätzlich die innere Uhr nach hinten — Jugendliche werden später müde und müssten eigentlich später aufstehen. Der Schulbeginn macht die Rechnung dann kaputt."],
      ["Stimmt es, dass Handys „süchtig“ machen wie Drogen?", "Der Vergleich hinkt — aber die Mechanismen sind teilweise ähnlich.",
       "Fachleute sind sich uneinig, ob man von Sucht sprechen soll. Unstrittig ist: Manche Menschen verlieren die Kontrolle über ihre Nutzung und leiden darunter. Ob man es Sucht nennt, ändert nichts daran, dass man dann Hilfe holen darf."],
      ["Was ist Dopamin — und was ist es nicht?", "Ein Botenstoff für Erwartung und Antrieb, kein „Glückshormon“.",
       "Es wird ausgeschüttet, BEVOR etwas kommt — es treibt zum Nachschauen an. Deshalb ist „Dopamin-Fasten“ ein irreführendes Schlagwort: Man kann Dopamin nicht abstellen, es steuert auch Lernen und Bewegung."],
      ["Was sagt die Forschung zum Zusammenhang von Bildschirmzeit und Wohlbefinden?", "Es gibt einen Zusammenhang, aber er ist überraschend klein.",
       "Eine große Untersuchung von 2019 fand einen Effekt in derselben Größenordnung wie beim Kartoffelessen oder Brilletragen. Das heißt nicht, dass es egal ist — aber die einfache Rechnung „mehr Stunden gleich unglücklicher“ stimmt so nicht."],
      ["Warum ist WAS man tut wichtiger als WIE LANGE?", "Weil aktive und passive Nutzung verschieden wirken.",
       "Mit Freunden schreiben, etwas bauen, etwas lernen — das ist etwas anderes als stundenlang durchzuwischen, ohne dass hängen bleibt. Eine reine Stundenzahl sagt wenig darüber, wie es einem danach geht."],
      ["Woran merkst du selbst, dass es zu viel war?", "Zum Beispiel: Du wolltest kurz schauen und zwei Stunden sind weg.",
       "Weitere Zeichen: Du bist danach gereizt statt erholt, du greifst zum Handy, sobald es kurz langweilig wird, oder du kannst nicht sagen, was du eigentlich gesehen hast. Das sind bessere Hinweise als jede Stundenvorgabe."],
      ["Warum fühlt man sich nach langem Scrollen oft leer?", "Weil viele kleine Reize kamen, aber nichts davon geblieben ist.",
       "Das Gehirn hat gearbeitet, aber nichts aufgebaut. Anders als nach einem Buch, einem Spiel mit Freunden oder etwas Selbstgemachtem — da bleibt etwas übrig."],
    ]),
  },
  {
    category: "Medien", subject: "Kopf & Körper", name: "Was du dagegen tun kannst", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist die wirksamste einzelne Maßnahme?", "Benachrichtigungen ausschalten — bis auf die von echten Menschen.",
       "Nachrichten von Freundinnen und Freunden dürfen bleiben. Alles, was von einer App selbst kommt („Schau, was du verpasst hast“), darf weg. Damit entscheidest du, wann du hinschaust — nicht die App."],
      ["Warum hilft es, das Handy nachts aus dem Zimmer zu nehmen?", "Weil es dann keine Entscheidung mehr gibt, die man abends treffen muss.",
       "Willenskraft ist am Abend am schwächsten. Eine Entscheidung, die man einmal trifft — Handy lädt in der Küche — schlägt eine, die man jeden Abend neu treffen muss."],
      ["Was bringt es, den Bildschirm auf Graustufen zu stellen?", "Farben sind ein großer Teil des Reizes — ohne sie wird Scrollen langweiliger.",
       "Man kann es in den Bedienungshilfen einstellen. Es ist kein Wundermittel, aber viele merken sofort, dass das Handy weniger anzieht."],
      ["Warum ist „ab jetzt gar kein Handy mehr“ meist keine gute Idee?", "Weil solche Vorsätze fast immer scheitern und danach alles noch schlimmer wirkt.",
       "Besser ist eine kleine, feste Regel, die man wirklich durchhält — etwa: beim Essen liegt das Handy woanders. Eine kleine Regel, die hält, ist mehr wert als eine große, die bricht."],
      ["Was ist ein guter Ersatz, wenn Langeweile aufkommt?", "Alles, wobei etwas entsteht oder man sich bewegt.",
       "Langeweile ist nicht der Feind — aus ihr entstehen Ideen. Wer sie sofort wegwischt, kommt nie an den Punkt, an dem einem etwas einfällt."],
      ["Wie kannst du herausfinden, wie viel Zeit du wirklich verbringst?", "Handys zeigen es unter Bildschirmzeit oder Digitales Wohlbefinden.",
       "Die meisten schätzen deutlich zu niedrig. Nachschauen ist unangenehm und genau deshalb nützlich — man kann nur ändern, was man kennt."],
      ["Was hilft beim Hausaufgabenmachen?", "Das Handy in einen anderen Raum legen, nicht nur umdrehen.",
       "Entfernung wirkt besser als Disziplin. Wenn Aufstehen nötig ist, um nachzuschauen, passiert es viel seltener."],
      ["Warum ist es sinnvoll, Serien und Videos bewusst zu beenden?", "Weil man sonst nicht aufhört, sondern aufgehalten wird.",
       "Sich vorher zu überlegen „zwei Folgen, dann ist Schluss“ ist etwas anderes, als zu warten, bis man von selbst genug hat. Bei Autoplay kommt dieser Punkt nämlich nicht."],
      ["Was kannst du tun, wenn dich ein Kanal regelmäßig schlecht fühlen lässt?", "Entfolgen oder stummschalten — auch bei Leuten, die du kennst.",
       "Das ist kein Streit und muss niemandem erklärt werden. Du bestimmst, was dir täglich gezeigt wird."],
    ]),
  },
  {
    category: "Medien", subject: "Miteinander", name: "Wenn es unangenehm wird", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist Cybermobbing?", "Wenn jemand online wiederholt fertiggemacht, bloßgestellt oder ausgeschlossen wird.",
       "Der Unterschied zum Streit: Es ist einseitig, es wiederholt sich, und es hört nicht am Schultor auf. Genau das macht es so schwer — es gibt keinen Ort mehr, an dem man sicher ist."],
      ["Was solltest du zuerst tun, wenn dich jemand online fertigmacht?", "Screenshots machen, bevor du irgendetwas löschst.",
       "Der erste Impuls ist oft, alles wegzumachen. Aber ohne Belege ist es später schwer, etwas zu unternehmen. Erst sichern, dann blockieren, dann melden."],
      ["Warum ist Zurückschreiben meist keine gute Idee?", "Weil eine Reaktion genau das ist, worauf es abgesehen war.",
       "Wer provoziert, sucht eine Reaktion. Bleibt sie aus, wird es oft langweilig. Und wer selbst beleidigt, steht am Ende schlechter da — auch wenn er im Recht war."],
      ["Wem kannst du es sagen, wenn dir online etwas passiert?", "Einer erwachsenen Person, der du vertraust — Eltern, Lehrkraft, ältere Geschwister.",
       "Viele schweigen aus Angst, das Handy wegnehmen zu lassen. Sag das ruhig dazu: „Ich erzähl dir was, aber bitte nimm mir nicht das Handy weg.“ Schweigen macht es immer schlimmer."],
      ["Welche Nummer hilft in Österreich rund um die Uhr, kostenlos und anonym?", "147 — Rat auf Draht.",
       "Ohne Vorwahl, von jedem Telefon, Tag und Nacht. Auch per Chat auf rataufdraht.at. Man muss keinen Namen sagen, und es kostet nichts."],
      ["Welche Nummer hilft in Deutschland Kindern und Jugendlichen?", "116 111 — die Nummer gegen Kummer.",
       "Kostenlos und anonym. Es gibt dort auch eine eigene Beratung von Jugendlichen für Jugendliche."],
      ["Was tust du, wenn dir jemand ein Nacktbild von einer anderen Person schickt?", "Nicht weiterleiten, nicht speichern, löschen — und einer erwachsenen Person sagen.",
       "Weiterleiten kann strafbar sein, auch wenn man es nur einmal weitergibt und selbst nichts damit zu tun hat. Und für die abgebildete Person ist jede Weitergabe eine weitere Verletzung."],
      ["Was ist, wenn dich jemand mit einem Bild erpresst?", "Nicht zahlen, nichts nachschicken, Kontakt abbrechen — und sofort Hilfe holen.",
       "Diese Masche heißt Sextortion und trifft sehr viele. Wer zahlt, wird weiter erpresst. Es ist nicht deine Schuld, auch wenn du das Bild selbst geschickt hast. Polizei und 147 kennen solche Fälle täglich."],
      ["Warum sollte man Fremden online keine persönlichen Angaben geben?", "Weil man nie sicher weiß, wer wirklich schreibt.",
       "Ein Profilbild beweist nichts. Schule, Wohnort, Nachname und Stundenplan zusammen genügen, um jemanden zu finden. Einzeln wirkt jede Angabe harmlos."],
      ["Was bedeutet es, wenn jemand online besonders schnell besonders nett ist?", "Vorsicht — genau so beginnt oft eine Anbahnung.",
       "Viele Komplimente, schnelles Geheimhalten („Sag das keinem“), Geschenke, und dann eine Bitte. Das Muster heißt Grooming. Kein Erwachsener mit guten Absichten bittet ein Kind darum, etwas geheim zu halten."],
      ["Wie erkennst du, ob ein Bild oder Video echt ist?", "Gar nicht mehr sicher — deshalb ist die Quelle wichtiger als das Bild.",
       "Mit künstlicher Intelligenz lassen sich Bilder, Stimmen und Videos herstellen, die echt aussehen. Die bessere Frage ist: Wer sagt das, und wo steht es noch? Eine einzelne Quelle ist keine Bestätigung."],
      ["Was solltest du tun, bevor du etwas Empörendes weiterleitest?", "Kurz warten und nachsehen, ob es stimmt.",
       "Falschmeldungen verbreiten sich schneller als Richtigstellungen, weil Empörung antreibt. Die Frage „Wer profitiert davon, dass ich das jetzt weiterschicke?“ hilft oft weiter."],
    ]),
  },
  {
    category: "Medien", subject: "Miteinander", name: "Prüf diese App", flang: "de-DE", blang: "de-DE",
    recall: false,
    cards: P([
      ["Du kennst jetzt die Tricks. Prüfen wir diese App: Gibt es hier endloses Scrollen?", "Nein. Eine Lerneinheit ist bei 20 Karten zu Ende.",
       "Danach kommt kein „nur noch eine“. Das Ende ist Absicht — es ist der Moment, an dem du entscheiden kannst, ob du weitermachst."],
      ["Gibt es hier eine Serie, die abreißt, wenn du einen Tag aussetzt?", "Nein. Es gibt gar keine Serie.",
       "Du kannst zwei Wochen nicht kommen, und hier ist nichts kaputt. Gezeigt werden nur Zahlen, die wachsen können — nie welche, die fallen. Was fallen kann, bestraft die Rückkehr."],
      ["Bekommst du Benachrichtigungen, die dich zurückholen sollen?", "Nein. Diese App schickt dir nichts.",
       "Sie meldet sich nie von selbst. Du kommst, wenn du willst."],
      ["Wird hier Werbung gezeigt?", "Nein — und es gibt auch keine Werbe-Bausteine im Programm.",
       "Damit fällt der ganze Grund weg, dich möglichst lange festzuhalten. Das Geld kommt von Erwachsenen, die einmalig zahlen, nicht von deiner Aufmerksamkeit."],
      ["Was weiß diese App über dich?", "Nichts. Es gibt kein Konto und keinen Server.",
       "Alles bleibt auf dem Gerät. Es gibt keine Stelle, an der Daten ankommen könnten — auch nicht bei uns."],
      ["Warum sieht diese App langweiliger aus als andere?", "Weil hier nichts blinkt, das dich halten soll.",
       "Alles, was Aufmerksamkeit fängt, fehlt bewusst: keine Feuerwerke nach jeder Karte, kein Autoplay, keine roten Punkte. Was übrig bleibt, ist das, wofür du gekommen bist."],
      ["Wie kannst du das alles überprüfen, statt es zu glauben?", "Flugmodus einschalten — die App läuft weiter.",
       "Wenn etwas gesendet würde, ginge es ohne Netz nicht. Und wenn dir jemand sagt, seine App sammle keine Daten, ist das genau die richtige Frage: Woran könnte ich das selbst erkennen?"],
      ["Was ist die wichtigste Frage bei jeder App, die du benutzt?", "Womit verdient sie ihr Geld?",
       "Aus der Antwort folgt fast alles andere. Wer mit deiner Zeit verdient, wird um deine Zeit kämpfen. Wer einmalig verkauft, hat keinen Grund dazu. Diese Frage kannst du bei jeder App stellen — auch bei dieser."],
    ]),
  },
  {
    category: "Unterstufe 1", subject: "Mathematik", name: "Größen & Einheiten", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wie viele Zentimeter sind ein Meter?", "100 Zentimeter.",
       "Die Vorsilbe „zenti“ bedeutet Hundertstel — wie beim Jahrhundert. Ein Zentimeter ist also ein Hundertstel Meter."],
      ["Wie viele Millimeter sind ein Zentimeter?", "10 Millimeter.",
       "„Milli“ heißt Tausendstel: Ein Millimeter ist ein Tausendstel Meter. Auf dem Lineal sind es die kleinsten Striche."],
      ["Wie viele Meter sind ein Kilometer?", "1000 Meter.",
       "„Kilo“ heißt tausend — deshalb sind auch 1 Kilogramm genau 1000 Gramm. Dieselbe Vorsilbe, dieselbe Bedeutung."],
      ["Wie viele Gramm sind ein Kilogramm?", "1000 Gramm."],
      ["Wie viele Kilogramm sind eine Tonne?", "1000 Kilogramm.",
       "Ein Kleinwagen wiegt etwa eine Tonne. Das ist eine gute Vergleichsgröße, wenn man sich Massen vorstellen will."],
      ["Wie viele Minuten hat eine Stunde?", "60 Minuten.",
       "Die 60 stammt von den Babyloniern, die im Sechzigersystem rechneten. Deshalb ist die Zeit die einzige Größe, bei der wir nicht in Zehnerschritten rechnen."],
      ["Wie viele Sekunden hat eine Stunde?", "3600 Sekunden.",
       "60 Minuten mal 60 Sekunden. Ein Tag hat 86 400 Sekunden — 24 mal 3600."],
      ["Wie viele Milliliter sind ein Liter?", "1000 Milliliter.",
       "Eine übliche Getränkedose fasst 330 Milliliter, also etwa ein Drittel Liter."],
      ["Rechne 2,5 Kilometer in Meter um.", "2500 Meter.",
       "Beim Umrechnen in die kleinere Einheit wird die Zahl größer. Wer unsicher ist, prüft mit dieser Frage: Viele kleine Teile oder wenige große?"],
      ["Rechne 750 Gramm in Kilogramm um.", "0,75 Kilogramm.",
       "In die größere Einheit umgerechnet wird die Zahl kleiner. 750 geteilt durch 1000."],
      ["Wie viel ist ein Viertel einer Stunde in Minuten?", "15 Minuten.",
       "Eine Viertelstunde. Halbe Stunde: 30 Minuten, Dreiviertelstunde: 45."],
      ["Warum darf man 3 Meter und 40 Zentimeter nicht einfach als 3,40 Meter zusammenzählen — sondern muss aufpassen?", "Man darf es, aber nur weil 40 Zentimeter genau 0,40 Meter sind.",
       "Der Fehler passiert bei Zeit: 3 Stunden 40 Minuten sind NICHT 3,40 Stunden, sondern etwa 3,67. Weil Stunden in 60 statt in 100 Teile zerfallen."],
    ]),
  },
  {
    category: "Unterstufe 1", subject: "Biologie", name: "Pflanzen & wie sie leben", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist Fotosynthese?", "Pflanzen bauen aus Wasser, Kohlendioxid und Licht Zucker auf — und geben Sauerstoff ab.",
       "Das ist die Grundlage fast allen Lebens auf der Erde. Pflanzen sind die Einzigen, die aus Licht Nahrung herstellen können; alle anderen leben letztlich davon."],
      ["Welches Gas geben Pflanzen bei der Fotosynthese ab?", "Sauerstoff.",
       "Der Sauerstoff in unserer Luft stammt praktisch vollständig aus der Fotosynthese. Vor rund 2,4 Milliarden Jahren gab es fast keinen."],
      ["Wozu dienen die Wurzeln?", "Zum Verankern und zur Aufnahme von Wasser und Nährsalzen.",
       "Die feinen Wurzelhaare machen den größten Teil der Aufnahmefläche aus. Bei manchen Bäumen ist das Wurzelwerk so groß wie die Krone."],
      ["Wozu dienen die Blätter?", "Sie sind die Orte der Fotosynthese.",
       "Deshalb sind sie flach und breit: möglichst viel Fläche für möglichst viel Licht. In der Wüste sind Blätter oft zu Dornen umgebaut — dort ist Wasser sparen wichtiger als Licht sammeln."],
      ["Was macht der grüne Farbstoff Chlorophyll?", "Er fängt das Sonnenlicht ein.",
       "Er nimmt vor allem rotes und blaues Licht auf und wirft grünes zurück — deshalb sehen wir Pflanzen grün. Wir sehen genau die Farbe, die die Pflanze nicht braucht."],
      ["Warum werden Blätter im Herbst bunt?", "Die Pflanze zieht das Chlorophyll zurück, andere Farbstoffe bleiben übrig.",
       "Gelb und Orange waren die ganze Zeit da, nur vom Grün überdeckt. Die Pflanze holt sich wertvolle Stoffe zurück, bevor sie das Blatt abwirft."],
      ["Wozu ist die Blüte da?", "Zur Fortpflanzung.",
       "Farbe und Duft sind Werbung für Bestäuber. Windbestäubte Pflanzen wie Gräser haben unscheinbare Blüten — sie müssen niemanden anlocken."],
      ["Was passiert bei der Bestäubung?", "Pollen gelangt von einer Blüte auf die Narbe einer anderen.",
       "Meist übernehmen das Insekten, manchmal der Wind. Aus dem befruchteten Teil entsteht später Samen und Frucht."],
      ["Warum sind Bienen so wichtig?", "Sie bestäuben viele Nutzpflanzen.",
       "Ein großer Teil unserer Obst- und Gemüsearten ist auf Bestäubung angewiesen. Ohne Insekten gäbe es weniger Äpfel, Kirschen und Kürbisse — Getreide käme allerdings mit dem Wind aus."],
      ["Was ist ein Samen?", "Ein Pflanzenkeim mit Nährstoffvorrat und Schutzhülle.",
       "Der Vorrat versorgt den Keimling, bis er eigene Blätter hat und selbst Fotosynthese betreiben kann."],
      ["Was braucht ein Samen zum Keimen?", "Wasser, Wärme und Sauerstoff — Licht meist nicht.",
       "Deshalb keimen Samen unter der Erde. Erst der Keimling braucht Licht — vorher lebt er vom mitgebrachten Vorrat."],
      ["Warum wachsen Wurzeln nach unten und Sprosse nach oben, auch im Dunkeln?", "Die Pflanze nimmt die Schwerkraft wahr.",
       "Man kann einen Keimling drehen, wie man will — die Wurzel dreht sich wieder nach unten. Für Licht wäre das zu spät, unter der Erde gibt es keins."],
    ]),
  },
  {
    category: "Unterstufe 1", subject: "Deutsch", name: "Rechtschreibung: die häufigsten Stolpersteine", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wann schreibt man „das“ und wann „dass“?", "„das“ wenn man es durch dieses, jenes oder welches ersetzen kann — sonst „dass“.",
       "„Das Buch, das ich lese“ — man kann sagen „welches ich lese“, also ein s. „Ich hoffe, dass du kommst“ — Ersatz geht nicht, also zwei s."],
      ["Wann schreibt man „seit“ und wann „seid“?", "„seit“ bei Zeit, „seid“ als Form von „sein“.",
       "„Seit gestern“ — Zeit. „Ihr seid müde“ — das gehört zu ihr seid. Merkhilfe: seid mit d gehört zu ihr, wie find-et, seid-et."],
      ["Was ist der Unterschied zwischen „wieder“ und „wider“?", "„wieder“ heißt nochmal, „wider“ heißt gegen.",
       "„Bis wieder!“ — nochmal. „Widerspruch“, „widerlich“ — gegen. Das zweite ist selten, deshalb ist im Zweifel „wieder“ meist richtig."],
      ["Wann schreibt man „ss“ und wann „ß“?", "Nach kurzem Vokal ss, nach langem Vokal oder Doppellaut ß.",
       "Fluss (kurzes u), Fuß (langes u). Straße (langes a), Kasse (kurzes a). Man hört es an der Länge des Selbstlauts davor."],
      ["Warum schreibt man „Fahrrad“ mit drei r?", "Weil Fahr und Rad zusammengesetzt werden.",
       "Bei zusammengesetzten Wörtern bleiben alle Buchstaben erhalten: Schifffahrt hat drei f, Balletttänzer drei t."],
      ["Wann schreibt man Zeitangaben groß?", "Wenn sie ein Nomen sind: am Montag, der Abend.",
       "Klein bleiben Wörter wie heute, morgen, gestern. Achtung: „Wir treffen uns morgen Abend“ — morgen klein, Abend groß."],
      ["Wie erkennt man, ob man ein Wort mit ä oder e schreibt?", "Wenn es ein verwandtes Wort mit a gibt, schreibt man ä.",
       "Hände, weil Hand. Bäcker, weil backen. Bei Eltern gibt es kein verwandtes a-Wort — deshalb mit e."],
      ["Wann setzt man vor „und“ ein Komma?", "Nur, wenn zwei vollständige Hauptsätze verbunden werden — und auch dann ist es freiwillig.",
       "Bei Aufzählungen steht nie eines: „Äpfel, Birnen und Zwetschken.“ Das ist der häufigste Kommafehler in beide Richtungen."],
      ["Wo steht immer ein Komma?", "Vor Nebensätzen, die mit weil, dass, obwohl, wenn beginnen.",
       "„Ich bleibe daheim, weil ich krank bin.“ Wenn ein solches Wort auftaucht, gehört davor ein Komma."],
      ["Was ist bei der wörtlichen Rede zu beachten?", "Sie steht in Anführungszeichen, davor kommt ein Doppelpunkt.",
       "Er sagte: „Ich komme später.“ Steht die Rede vorne, folgt ein Komma: „Ich komme später“, sagte er."],
    ]),
  },
  {
    category: "Unterstufe 2", subject: "Mathematik", name: "Dezimalzahlen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was bedeutet die erste Stelle nach dem Komma?", "Zehntel.",
       "0,3 sind drei Zehntel, also 3/10. Danach folgen Hundertstel und Tausendstel — jede Stelle ist ein Zehntel der vorigen."],
      ["Was ist 0,25 als Bruch?", "1/4.",
       "25 Hundertstel, gekürzt durch 25 ergibt ein Viertel. Diese drei sollte man auswendig können: 0,5 = 1/2, 0,25 = 1/4, 0,75 = 3/4."],
      ["Warum ist 0,7 größer als 0,25?", "Weil 7 Zehntel mehr sind als 2 Zehntel.",
       "Die Zahl mit mehr Stellen ist nicht automatisch größer. Man vergleicht Stelle für Stelle von links: 7 gegen 2 entscheidet schon."],
      ["Wie addiert man 2,5 + 0,75?", "Kommas untereinander schreiben: 3,25.",
       "Der häufigste Fehler ist rechtsbündiges Untereinanderschreiben. Es zählt die Stelle, nicht das Zeilenende — deshalb: Komma unter Komma."],
      ["Was passiert beim Multiplizieren mit 10?", "Das Komma wandert eine Stelle nach rechts.",
       "3,45 mal 10 ergibt 34,5. Bei 100 wandert es zwei Stellen, bei 1000 drei. Man verschiebt das Komma, nicht die Ziffern."],
      ["Was passiert beim Dividieren durch 100?", "Das Komma wandert zwei Stellen nach links.",
       "250 geteilt durch 100 ergibt 2,5. Deshalb ist Prozentrechnen im Grunde Kommaverschieben."],
      ["Wie rundet man 3,847 auf zwei Nachkommastellen?", "3,85.",
       "Man schaut auf die erste weggelassene Ziffer: Bei 5 oder mehr wird aufgerundet, bei 4 oder weniger ab. Hier ist es die 7, also auf."],
      ["Was ist 1/8 als Dezimalzahl?", "0,125.",
       "1 geteilt durch 8. Der Bruchstrich ist ein Geteiltzeichen — so lässt sich jeder Bruch umwandeln."],
      ["Warum ergibt 0,1 + 0,2 im Taschenrechner manchmal 0,30000000000000004?", "Weil Computer im Zweiersystem rechnen und 0,1 dort nicht exakt darstellbar ist.",
       "Genau wie 1/3 im Zehnersystem nie aufgeht, geht 1/10 im Zweiersystem nie auf. Deshalb rechnen Programme mit Geldbeträgen oft in Cent statt in Euro."],
      ["Wie viel sind 0,5 Stunden in Minuten?", "30 Minuten.",
       "Vorsicht: 0,5 Stunden sind eine halbe Stunde. Aber 1,30 Stunden sind NICHT 1 Stunde 30 — sondern 1 Stunde 18 Minuten, weil 0,30 von 60 Minuten gerechnet wird."],
      ["Ordne der Größe nach: 0,4 — 0,04 — 0,44", "0,04 < 0,4 < 0,44.",
       "Trick beim Vergleichen: gedanklich mit Nullen auffüllen — 0,40, 0,04, 0,44. Dann sieht man es sofort."],
    ]),
  },
  {
    category: "Unterstufe 2", subject: "Mathematik", name: "Umfang & Fläche", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist der Umfang einer Figur?", "Die Länge ihrer Randlinie.",
       "Der Umfang ist eine Länge und wird in cm oder m angegeben — nicht in Quadratmetern. Anschaulich: der Weg einmal rundherum."],
      ["Was ist der Flächeninhalt?", "Wie viel Platz eine Figur einnimmt.",
       "Gemessen in Quadrateinheiten: Wie viele Quadrate mit 1 cm Seitenlänge passen hinein?"],
      ["Wie berechnet man den Umfang eines Rechtecks?", "2 mal Länge plus 2 mal Breite.",
       "Man geht einmal rundherum: zweimal die lange Seite, zweimal die kurze."],
      ["Wie berechnet man die Fläche eines Rechtecks?", "Länge mal Breite.",
       "Bei 5 cm mal 3 cm passen genau 15 Quadrate von 1 cm hinein — deshalb 15 Quadratzentimeter."],
      ["Wie berechnet man die Fläche eines Dreiecks?", "Grundlinie mal Höhe geteilt durch 2.",
       "Jedes Dreieck ist ein halbes Rechteck. Zwei gleiche Dreiecke lassen sich immer zu einem Rechteck zusammenlegen."],
      ["Was ist bei der Höhe eines Dreiecks wichtig?", "Sie steht immer senkrecht auf der Grundlinie.",
       "Nicht die Seitenlänge nehmen. Bei einem schiefen Dreieck liegt die Höhe manchmal sogar außerhalb der Figur."],
      ["Wie viele Quadratzentimeter sind ein Quadratdezimeter?", "100.",
       "Achtung, hier verdoppelt sich die Umrechnung: Bei Längen ist es 10, bei Flächen 10 mal 10. Deshalb sind 1 Quadratmeter 10 000 Quadratzentimeter."],
      ["Ein Quadrat hat 6 cm Seitenlänge. Umfang und Fläche?", "Umfang 24 cm, Fläche 36 Quadratzentimeter.",
       "Vier gleiche Seiten: 4 mal 6. Fläche: 6 mal 6. Die Zahlen sehen ähnlich aus, meinen aber ganz Verschiedenes."],
      ["Können zwei Figuren gleichen Umfang, aber verschiedene Fläche haben?", "Ja.",
       "Ein Rechteck 1 mal 5 und eines 2 mal 4 haben beide Umfang 12, aber Flächen von 5 und 8. Je quadratischer, desto mehr Fläche bei gleichem Umfang."],
      ["Wozu braucht man Umfang im Alltag, wozu Fläche?", "Umfang für Zäune und Rahmen, Fläche für Farbe und Boden.",
       "Das ist die einfachste Probe: Geht es um eine Linie ringsum oder um das, was drinnen ausgefüllt wird?"],
    ]),
  },
  {
    category: "Unterstufe 2", subject: "Geschichte & Politik", name: "Griechenland & Rom", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist eine Polis?", "Ein griechischer Stadtstaat.",
       "Athen, Sparta, Korinth — jede mit eigenen Gesetzen und eigener Armee. Ein gemeinsames Griechenland gab es nicht; verbunden waren sie durch Sprache, Götter und die Spiele."],
      ["Was bedeutet „Demokratie“ wörtlich?", "Herrschaft des Volkes — von demos (Volk) und kratos (Macht).",
       "In Athen durften allerdings nur freie Männer mitbestimmen. Frauen, Sklaven und Zugezogene waren ausgeschlossen — also etwa ein Zehntel der Bevölkerung."],
      ["Wo und wann fanden die ersten Olympischen Spiele statt?", "In Olympia, 776 vor Christus.",
       "Sie fanden alle vier Jahre statt. Während der Spiele galt ein Waffenstillstand, damit alle sicher anreisen konnten."],
      ["Wer war Alexander der Große?", "Ein makedonischer König, der ein Reich bis nach Indien eroberte.",
       "Er starb mit 32 Jahren. Sein Reich zerfiel sofort, aber die griechische Sprache und Kultur blieben im ganzen Gebiet — das nennt man Hellenismus."],
      ["Wie wurde Rom der Sage nach gegründet?", "753 vor Christus von Romulus und Remus.",
       "Eine Sage, kein Bericht. Ausgrabungen zeigen aber, dass es an dieser Stelle tatsächlich um diese Zeit eine Siedlung gab."],
      ["Was war die Römische Republik?", "Eine Staatsform ohne König, mit gewählten Beamten und dem Senat.",
       "An der Spitze standen zwei Konsuln, immer für ein Jahr. Zwei, damit einer den anderen bremsen konnte — eine früh erfundene Machtbegrenzung."],
      ["Wer war Julius Caesar?", "Ein römischer Feldherr und Politiker, der 44 vor Christus ermordet wurde.",
       "Er hatte so viel Macht angehäuft, dass Gegner das Ende der Republik fürchteten. Nach seinem Tod kam sie trotzdem nicht zurück — sein Großneffe Augustus wurde der erste Kaiser."],
      ["Was ist ein Aquädukt?", "Eine Wasserleitung, oft als Brücke gebaut.",
       "Sie brachten Trinkwasser über viele Kilometer in die Städte — mit ganz leichtem Gefälle, das Wasser floss allein. Manche funktionieren heute noch."],
      ["Warum bauten die Römer so gute Straßen?", "Damit Truppen und Nachrichten schnell vorankamen.",
       "Der Handel profitierte auch, aber der Grund war militärisch. Viele heutige Straßen folgen noch immer diesen Linien."],
      ["Was war der Limes?", "Die befestigte Grenze des Römischen Reiches.",
       "Wälle, Gräben, Palisaden und Wachtürme. Er lief auch durch das heutige Österreich — entlang der Donau."],
      ["Wann endete das Weströmische Reich?", "476 nach Christus.",
       "Kein plötzlicher Zusammenbruch: Über Jahrzehnte wurde die Verwaltung schwächer, Grenzen durchlässiger, Städte kleiner. Die Jahreszahl markiert nur die Absetzung des letzten Kaisers."],
    ]),
  },
  {
    category: "Unterstufe 2", subject: "Englisch", name: "Simple Past", flang: "en-US", blang: "de-DE",
    cards: P([
      ["Wann benutzt man das Simple Past?", "Für abgeschlossene Handlungen in der Vergangenheit.",
       "Meist steht ein Zeitpunkt dabei: yesterday, last week, in 2019, two days ago. Was vorbei ist, steht im Simple Past."],
      ["Wie bildet man das Simple Past bei regelmäßigen Verben?", "Mit der Endung -ed.",
       "work → worked, play → played. Die Endung ist für alle Personen gleich — anders als im Present Simple gibt es kein Extra-s."],
      ["Was ist die Vergangenheitsform von „go“?", "went.",
       "Unregelmäßig, also auswendig. Die häufigsten Verben sind fast alle unregelmäßig — das ist in vielen Sprachen so, weil oft gebrauchte Wörter sich seltener anpassen."],
      ["Wie verneint man „She went home“?", "She did not go home.",
       "Die Vergangenheit wandert ins Hilfsverb did. Danach steht die Grundform. Häufiger Fehler: „She didn't went“."],
      ["Wie fragt man nach „They played football“?", "Did they play football?",
       "Auch hier trägt did die Vergangenheit, das Vollverb bleibt in der Grundform."],
      ["Was ist bei „to be“ im Simple Past besonders?", "Es hat zwei Formen: was und were.",
       "I/he/she/it was, you/we/they were. Und es braucht kein did: „Was he happy?“ statt „Did he be happy?“"],
      ["Was ist der Unterschied zwischen Simple Past und Present Perfect?", "Simple Past: abgeschlossen mit Zeitpunkt. Present Perfect: Bezug zur Gegenwart.",
       "„I lost my key yesterday“ — abgeschlossen. „I have lost my key“ — und deshalb stehe ich jetzt vor der Tür. Im Deutschen gibt es diesen Unterschied nicht, deshalb ist er schwer."],
      ["Übersetze: „Ich sah ihn gestern.“", "I saw him yesterday.",
       "„Yesterday“ ist ein klarer Zeitpunkt in der Vergangenheit — also Simple Past, nicht Present Perfect."],
      ["Wie wird die Endung -ed ausgesprochen?", "Meist als t oder d — nur nach t und d als eigene Silbe.",
       "worked klingt wie „workt“, played wie „playd“, aber wanted wird „wan-tid“ gesprochen. Sonst könnte man das Wort nicht aussprechen."],
      ["Was ist die Vergangenheitsform von „read“?", "read — gleich geschrieben, anders gesprochen.",
       "Die Gegenwart klingt wie „riid“, die Vergangenheit wie „red“. Man hört den Unterschied, man sieht ihn nicht."],
    ]),
  },
  {
    category: "Unterstufe 2", subject: "Biologie", name: "Ökosysteme & Nahrungsketten", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist ein Ökosystem?", "Ein Lebensraum samt allen Lebewesen darin und ihren Beziehungen.",
       "Wald, Teich, Wiese. Entscheidend sind nicht die Teile, sondern ihre Verbindungen — verschwindet eine Art, wirkt das auf viele andere."],
      ["Was ist ein Produzent?", "Ein Lebewesen, das seine Nahrung selbst herstellt — also Pflanzen.",
       "Sie stehen am Anfang jeder Nahrungskette. Ohne sie gäbe es keine Energie im System, denn nur sie können Sonnenlicht nutzbar machen."],
      ["Was ist ein Konsument?", "Ein Lebewesen, das sich von anderen ernährt.",
       "Erstkonsumenten fressen Pflanzen (Reh), Zweitkonsumenten fressen Tiere (Fuchs). Man spricht von Nahrungsstufen."],
      ["Was ist ein Destruent?", "Ein Lebewesen, das Totes zersetzt — Pilze, Bakterien, Regenwürmer.",
       "Sie schließen den Kreis: Aus abgestorbenen Resten werden wieder Nährstoffe für Pflanzen. Ohne sie läge der Wald meterhoch voller Laub."],
      ["Warum wird eine Nahrungskette nach oben hin dünner?", "Weil bei jeder Stufe der meiste Teil der Energie verloren geht.",
       "Nur etwa ein Zehntel gelangt in die nächste Stufe — der Rest wird für Bewegung, Wärme und Verdauung gebraucht. Deshalb gibt es viele Rehe und wenige Wölfe."],
      ["Was passiert, wenn ein Räuber aus einem Ökosystem verschwindet?", "Seine Beutetiere vermehren sich stark und fressen ihre Nahrung knapp.",
       "Im Yellowstone-Nationalpark wurden nach Rückkehr der Wölfe sogar die Flussufer stabiler: weniger Rotwild, mehr junge Bäume, festere Ufer. Solche Ketten nennt man Kaskadeneffekt."],
      ["Was ist der Unterschied zwischen Nahrungskette und Nahrungsnetz?", "Die Kette ist eine Linie, das Netz zeigt alle Verbindungen.",
       "In Wirklichkeit frisst fast jedes Tier mehrere Dinge. Die Kette ist eine Vereinfachung zum Verstehen, das Netz ist näher an der Wirklichkeit."],
      ["Was ist Symbiose?", "Ein Zusammenleben, von dem beide Seiten profitieren.",
       "Biene und Blüte: Die Biene bekommt Nektar, die Pflanze wird bestäubt. Flechten sind sogar zwei Lebewesen in einem — Pilz und Alge."],
      ["Was ist ein Parasit?", "Ein Lebewesen, das auf Kosten eines anderen lebt, ohne es sofort zu töten.",
       "Zecken, Läuse, Bandwürmer. Ein Parasit, der seinen Wirt schnell umbringt, schadet sich selbst — deshalb sind die meisten erstaunlich zurückhaltend."],
      ["Warum ist Artenvielfalt wichtig?", "Je mehr Arten, desto stabiler ist ein Ökosystem gegenüber Störungen.",
       "Fällt eine Art aus, können andere ihre Rolle übernehmen. In einer Monokultur kann ein einziger Schädling alles vernichten."],
      ["Was ist ein Zeigerorganismus?", "Eine Art, deren Vorkommen etwas über den Zustand des Lebensraums verrät.",
       "Flechten an Bäumen zeigen saubere Luft an, bestimmte Larven im Bach sauberes Wasser. Man misst nicht — man schaut, wer da ist."],
    ]),
  },
  {
    category: "Unterstufe 2", subject: "Geographie & Wirtschaft", name: "Europa: Länder & Gewässer", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist der längste Fluss Europas?", "Die Wolga in Russland, rund 3530 Kilometer.",
       "Sie mündet ins Kaspische Meer, nicht in einen Ozean. Der längste Fluss der Europäischen Union ist die Donau."],
      ["Welches Gebirge trennt Europa von Asien?", "Der Ural.",
       "Europa ist geologisch kein eigener Kontinent, sondern der Westteil von Eurasien. Die Grenze ist eine Vereinbarung, keine natürliche Trennung."],
      ["Was ist die Hauptstadt von Slowenien?", "Ljubljana.",
       "Slowenien grenzt im Norden an Österreich — von Kärnten und der Steiermark aus ist man schnell dort."],
      ["Welches ist das kleinste Land Europas?", "Vatikanstadt.",
       "Rund 0,44 Quadratkilometer, mitten in Rom. Es hat eigene Briefmarken, eigene Autokennzeichen und weniger Einwohner als eine große Schule Schüler hat."],
      ["Was ist die Nordsee — Meer oder Ozean?", "Ein Randmeer des Atlantiks.",
       "Randmeere sind flacher und teilweise von Land umschlossen. Die Nordsee ist im Schnitt nur etwa 90 Meter tief."],
      ["Welche Länder haben Anteil an den Alpen?", "Acht: Österreich, Deutschland, Schweiz, Italien, Frankreich, Slowenien, Liechtenstein, Monaco.",
       "Österreich hat den größten Anteil an der Alpenfläche — rund 28 Prozent des Gebirges liegen dort."],
      ["Was ist die Iberische Halbinsel?", "Der Südwestzipfel Europas mit Spanien und Portugal.",
       "Die Pyrenäen trennen sie vom Rest des Kontinents. Diese Abgeschlossenheit prägte die Geschichte der Region stark."],
      ["Welches Meer liegt zwischen Italien und dem Balkan?", "Die Adria.",
       "Ein Randmeer des Mittelmeers. Für Österreich war der Zugang zur Adria über Triest jahrhundertelang der einzige Weg zum Meer."],
      ["Was ist der Unterschied zwischen Europa und der Europäischen Union?", "Europa ist der Erdteil, die EU ein Zusammenschluss von Staaten.",
       "Nicht jedes europäische Land ist in der EU — die Schweiz, Norwegen und Großbritannien zum Beispiel nicht."],
      ["Welcher See ist der größte Süßwassersee Europas?", "Der Ladogasee in Russland.",
       "Der größte in Mitteleuropa ist der Bodensee, der an Deutschland, Österreich und die Schweiz grenzt."],
      ["Warum ist Nordeuropa trotz gleicher Breite milder als Kanada?", "Wegen des Golfstroms.",
       "Diese warme Meeresströmung bringt Wärme aus der Karibik nach Nordwesteuropa. Ohne sie wäre Norwegen so kalt wie Grönland — auf gleicher Höhe."],
    ]),
  },
  {
    category: "Unterstufe 2", subject: "Deutsch", name: "Satzglieder bestimmen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist das Subjekt eines Satzes?", "Der Satzgegenstand — wer oder was etwas tut.",
       "Frage: Wer oder was? „Der Hund bellt.“ Das Subjekt steht immer im ersten Fall und richtet sich mit dem Verb: Hund bellt, Hunde bellen."],
      ["Was ist das Prädikat?", "Die Satzaussage — das gebeugte Verb.",
       "Es ist das einzige Satzglied, das nicht verschoben werden kann: Im Aussagesatz steht es immer an zweiter Stelle. Daran kann man den ganzen Satz aufhängen."],
      ["Was ist ein Objekt?", "Eine Ergänzung, auf die sich die Handlung richtet.",
       "„Ich lese das Buch.“ Was lese ich? Das Buch — Objekt im vierten Fall. Es gibt auch Objekte im dritten Fall: „Ich helfe dem Kind.“"],
      ["Wie findet man Satzglieder sicher?", "Mit der Verschiebeprobe: Was zusammen an den Satzanfang wandern kann, ist ein Satzglied.",
       "„Gestern hat mein kleiner Bruder ein Eis gegessen.“ — „Mein kleiner Bruder hat gestern …“ Die drei Wörter wandern zusammen, sind also ein Satzglied."],
      ["Was ist eine adverbiale Bestimmung?", "Eine Angabe zu Ort, Zeit, Grund oder Art und Weise.",
       "Wo? Wann? Warum? Wie? „Er läuft schnell durch den Park.“ — schnell (Art), durch den Park (Ort)."],
      ["Welche Frage stellt man nach der adverbialen Bestimmung des Grundes?", "Warum? Weshalb? Wozu?",
       "„Wegen des Regens bleiben wir daheim.“ Warum? Wegen des Regens."],
      ["Was ist ein Attribut?", "Eine Beifügung zu einem Nomen — es ist kein eigenes Satzglied.",
       "In „der große Hund“ gehört „große“ zum Hund und wandert immer mit. Genau das unterscheidet Attribute von Satzgliedern."],
      ["Wie viele Satzglieder hat „Morgen fahren wir ans Meer“?", "Vier.",
       "morgen (Zeit), fahren (Prädikat), wir (Subjekt), ans Meer (Ort). Wer unsicher ist, verschiebt jedes Stück einzeln an den Satzanfang — was zusammen wandert, gehört zusammen."],
      ["Was ist ein Hauptsatz?", "Ein Satz, der allein stehen kann; das gebeugte Verb steht an zweiter Stelle.",
       "„Ich gehe heute ins Kino.“ Der Nebensatz kann nicht allein stehen und schickt das Verb ans Ende: „…, weil ich Zeit habe.“"],
      ["Woran erkennt man einen Nebensatz?", "Am Einleitewort und am Verb am Satzende.",
       "weil, dass, obwohl, wenn, damit. Beides zusammen ist ein sicheres Zeichen — und davor steht immer ein Komma."],
    ]),
  },
  {
    category: "Unterstufe 2", subject: "Physik", name: "Licht & Sehen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wie breitet sich Licht aus?", "Geradlinig.",
       "Deshalb gibt es scharfe Schatten und deshalb kann man um eine Ecke nicht sehen. Alles, was wir über Schatten und Spiegel wissen, folgt aus diesem einen Satz."],
      ["Wie schnell ist Licht?", "Rund 300 000 Kilometer pro Sekunde im Vakuum.",
       "In einer Sekunde siebenmal um die Erde. Das Licht der Sonne braucht trotzdem gut acht Minuten zu uns — man sieht die Sonne immer so, wie sie vor acht Minuten war."],
      ["Warum sehen wir einen Gegenstand?", "Weil Licht von ihm in unser Auge fällt.",
       "Die meisten Dinge leuchten nicht selbst, sie werfen Licht zurück. Im völlig dunklen Raum sieht man nichts — auch mit den besten Augen nicht."],
      ["Was ist der Unterschied zwischen Lichtquelle und beleuchtetem Körper?", "Eine Lichtquelle sendet selbst Licht aus, ein beleuchteter Körper wirft es zurück.",
       "Sonne, Lampe, Feuer senden selbst. Mond, Buch, Tisch werfen zurück. Der Mond leuchtet nicht — er spiegelt Sonnenlicht."],
      ["Wie entsteht ein Schatten?", "Ein Körper hält geradlinig laufendes Licht auf.",
       "Bei einer punktförmigen Lichtquelle ist der Schatten scharf, bei einer großen entsteht auch ein Halbschatten — deshalb sind Schatten an bewölkten Tagen weich."],
      ["Was gilt beim Spiegel für Einfalls- und Reflexionswinkel?", "Sie sind gleich groß.",
       "Deshalb kann man berechnen, wohin ein Lichtstrahl geht. Beim Billard gilt dieselbe Regel — nur mit Kugeln statt Licht."],
      ["Warum erscheint ein Stab im Wasser geknickt?", "Weil Licht beim Übergang in ein anderes Material die Richtung ändert.",
       "Das nennt man Brechung. Licht ist im Wasser langsamer als in Luft, und beim Übergang knickt es ab. Deshalb greift man beim Fischen daneben."],
      ["Was passiert, wenn weißes Licht durch ein Prisma fällt?", "Es zerlegt sich in die Regenbogenfarben.",
       "Weißes Licht ist eine Mischung. Jede Farbe wird unterschiedlich stark gebrochen, deshalb fächern sie sich auf. Ein Regenbogen entsteht genauso — an Wassertropfen."],
      ["Warum ist ein Blatt grün?", "Es wirft grünes Licht zurück und schluckt die anderen Farben.",
       "Wir sehen immer die Farbe, die NICHT aufgenommen wird. Ein schwarzer Gegenstand schluckt fast alles — deshalb wird er in der Sonne warm."],
      ["Warum ist der Himmel blau?", "Blaues Licht wird an den Luftteilchen stärker gestreut als rotes.",
       "Es kommt deshalb aus allen Richtungen. Beim Sonnenuntergang nimmt das Licht einen längeren Weg durch die Luft — das Blau ist unterwegs schon weggestreut, Rot bleibt übrig."],
      ["Was ist eine Sammellinse?", "Eine Linse, die parallele Lichtstrahlen in einem Punkt bündelt.",
       "Sie ist in der Mitte dicker als am Rand. So eine Linse steckt in jeder Lupe, jeder Kamera und in unserem Auge."],
      ["Warum sehen manche Menschen in der Ferne unscharf?", "Weil das Bild vor der Netzhaut entsteht statt darauf.",
       "Kurzsichtigkeit: Der Augapfel ist etwas zu lang. Eine Zerstreuungslinse in der Brille schiebt den Brennpunkt zurück auf die Netzhaut."],
    ]),
  },
  {
    category: "Unterstufe 2", subject: "Englisch", name: "Fragen & Verneinung", flang: "en-US", blang: "de-DE",
    cards: P([
      ["Wie fragt man im Present Simple?", "Mit do oder does am Satzanfang.",
       "Do you like pizza? Does she play tennis? Bei he, she, it steht does — und das Vollverb verliert dann sein -s."],
      ["Wie fragt man mit „to be“?", "Ohne do — die Form von be rutscht nach vorn.",
       "Are you ready? Is he at home? Das gilt auch für can, must, will: Can you help me?"],
      ["Was sind die wichtigsten Fragewörter?", "who, what, where, when, why, how.",
       "wer, was, wo, wann, warum, wie. Sie stehen ganz vorn, davor kommt nichts."],
      ["Wie fragt man nach dem Subjekt?", "Ohne do: „Who called you?“",
       "Das ist die Ausnahme. Wenn who oder what das Subjekt ist, braucht man kein Hilfsverb. „Who wants ice cream?“ — nicht „Who does want“."],
      ["Was ist ein Question Tag?", "Ein angehängtes Kurzfrägchen: „…, isn’t it?“",
       "Die Regel: positiver Satz, negativer Anhang — und umgekehrt. „You are coming, aren’t you?“ / „You don’t like it, do you?“"],
      ["Wie verneint man mit „to be“?", "Mit not direkt dahinter: „He is not tired.“",
       "Kurzform: isn’t, aren’t, wasn’t. Bei Vollverben braucht man dagegen don’t oder doesn’t."],
      ["Was bedeutet „some“ und wann benutzt man „any“?", "some in Aussagen, any in Fragen und Verneinungen.",
       "„I have some money.“ / „Do you have any money?“ / „I don’t have any money.“ Ausnahme: Bei Angeboten sagt man some — „Would you like some tea?“"],
      ["Warum ist „I don’t know nothing“ falsch?", "Weil im Englischen nur eine Verneinung pro Satz steht.",
       "Richtig: „I don’t know anything“ oder „I know nothing“. Im Deutschen ist die doppelte Verneinung ebenfalls falsch, im Umgangssprachlichen aber verbreitet — das führt zur Verwechslung."],
      ["Übersetze: „Wo wohnst du?“", "Where do you live?",
       "Fragewort, dann do, dann Subjekt, dann Verb. Diese Reihenfolge ist im Englischen fest."],
      ["Was ist der Unterschied zwischen „How are you?“ und „How do you do?“", "Das erste fragt nach dem Befinden, das zweite ist eine formelle Begrüßung.",
       "„How do you do?“ erwartet keine Antwort über das Befinden — man sagt dasselbe zurück. Es ist heute selten und wirkt sehr förmlich."],
    ]),
  },
  {
    category: "Unterstufe 4", subject: "Mathematik", name: "Satz des Pythagoras", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wie lautet der Satz des Pythagoras?", "a² + b² = c².",
       "In Worten: In einem rechtwinkligen Dreieck ist die Summe der Quadrate über den beiden kürzeren Seiten so groß wie das Quadrat über der längsten."],
      ["Was ist die Hypotenuse?", "Die längste Seite — sie liegt dem rechten Winkel gegenüber.",
       "Sie ist immer das c in der Formel. Der häufigste Fehler ist, die falsche Seite als c zu nehmen — sie liegt IMMER gegenüber dem rechten Winkel."],
      ["Wann darf man den Satz des Pythagoras anwenden?", "Nur bei rechtwinkligen Dreiecken.",
       "Ohne rechten Winkel gilt er nicht. Deshalb sucht man zuerst den rechten Winkel — findet man keinen, braucht man ein anderes Werkzeug."],
      ["Die Katheten sind 3 und 4 cm lang. Wie lang ist die Hypotenuse?", "5 cm.",
       "9 + 16 = 25, die Wurzel daraus ist 5. Das 3-4-5-Dreieck ist der bekannteste Fall — Handwerker nutzen ihn bis heute, um rechte Winkel abzustecken."],
      ["Die Hypotenuse ist 13 cm, eine Kathete 5 cm. Wie lang ist die andere?", "12 cm.",
       "169 − 25 = 144, Wurzel 12. Wenn man eine Kathete sucht, wird subtrahiert statt addiert."],
      ["Wie prüft man, ob ein Dreieck rechtwinklig ist?", "Man setzt die Seiten in a² + b² = c² ein — geht es auf, ist es rechtwinklig.",
       "Das ist die Umkehrung des Satzes. Bei 6, 8, 10 gilt 36 + 64 = 100 — also rechtwinklig."],
      ["Wie lang ist die Diagonale eines Quadrats mit 4 cm Seitenlänge?", "Rund 5,66 cm.",
       "16 + 16 = 32, Wurzel aus 32 ist etwa 5,66. Die Diagonale eines Quadrats ist immer die Seite mal Wurzel 2 — etwa das 1,41-Fache."],
      ["Wozu braucht man den Satz im Alltag?", "Um Entfernungen zu berechnen, die man nicht direkt messen kann.",
       "Leiterlänge an einer Wand, Diagonale eines Zimmers, Bildschirmgröße. Fernseher werden in Zoll der Diagonale angegeben — die man mit Pythagoras aus Breite und Höhe bekommt."],
      ["Warum ist eine Bildschirmdiagonale von 32 Zoll kein 32 Zoll breiter Bildschirm?", "Weil die Diagonale schräg verläuft und länger ist als jede Seite.",
       "Ein 32-Zoll-Bildschirm im Format 16:9 ist rund 71 cm breit und 40 cm hoch — die Diagonale misst 81 cm. Die größte Zahl klingt in der Werbung am besten."],
      ["Wie alt ist der Satz des Pythagoras?", "Die Beziehung war schon über 1000 Jahre vor Pythagoras bekannt.",
       "Babylonische Tontafeln zeigen entsprechende Zahlentripel. Pythagoras lebte um 550 vor Christus — ihm wird meist der erste Beweis zugeschrieben, nicht die Entdeckung."],
    ]),
  },
  {
    category: "Unterstufe 4", subject: "Physik", name: "Kraft & Bewegung", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist eine Kraft?", "Etwas, das einen Körper verformt oder seine Bewegung ändert.",
       "Man sieht Kräfte nie selbst, nur ihre Wirkung. Gemessen werden sie in Newton."],
      ["Was besagt das Trägheitsgesetz?", "Ohne Kraft bleibt ein Körper in Ruhe oder in gleichmäßiger geradliniger Bewegung.",
       "Das widerspricht der Alltagserfahrung: Ein rollender Ball wird ja langsamer. Aber das liegt an der Reibung — im Weltraum rollt er ewig weiter."],
      ["Warum wird man im Auto bei einer Vollbremsung nach vorn gedrückt?", "Weil der Körper seine Bewegung beibehalten will.",
       "Nicht das Auto drückt einen nach vorn — der Körper macht einfach weiter, während das Auto bremst. Deshalb ist der Gurt lebenswichtig."],
      ["Was ist der Unterschied zwischen Masse und Gewicht?", "Masse ist die Menge an Materie, Gewicht ist die Kraft, mit der sie angezogen wird.",
       "Auf dem Mond hat man dieselbe Masse, aber nur etwa ein Sechstel des Gewichts. Umgangssprachlich sagt man Gewicht und meint Masse — physikalisch sind es zwei Dinge."],
      ["In welcher Einheit misst man Kraft?", "In Newton (N).",
       "Ein Kilogramm wird auf der Erde mit etwa 9,81 Newton angezogen. Als grobe Faustregel: 1 kg entspricht ungefähr 10 Newton."],
      ["Was besagt „actio gleich reactio“?", "Jede Kraft hat eine gleich große Gegenkraft in entgegengesetzter Richtung.",
       "Beim Gehen drückt man den Boden nach hinten, der Boden drückt einen nach vorn. Eine Rakete funktioniert genauso: Sie stößt Gas nach hinten aus und wird nach vorn geschoben."],
      ["Was ist Reibung?", "Eine Kraft, die einer Bewegung entgegenwirkt.",
       "Sie ist oft lästig, aber ohne sie könnte man nicht gehen, nicht greifen und nicht bremsen. Auf Eis merkt man, wie viel man ihr verdankt."],
      ["Was ist ein Hebel?", "Eine Stange, die sich um einen Drehpunkt bewegt und Kraft verstärkt.",
       "Je länger der Arm, desto weniger Kraft braucht man — dafür muss man einen längeren Weg zurücklegen. Schere, Zange und Türgriff sind Hebel."],
      ["Was ist die Formel für Geschwindigkeit?", "Strecke geteilt durch Zeit.",
       "In Kilometern pro Stunde oder Metern pro Sekunde. Um von km/h auf m/s zu kommen, teilt man durch 3,6."],
      ["Warum fallen eine Feder und ein Stein im Vakuum gleich schnell?", "Weil ohne Luft kein Luftwiderstand bremst.",
       "Die Schwerkraft beschleunigt alle Körper gleich stark, unabhängig von der Masse. Astronauten haben das auf dem Mond mit Hammer und Feder vorgeführt — beide kamen gleichzeitig an."],
    ]),
  },
  {
    category: "Unterstufe 4", subject: "Biologie", name: "Vererbung & Evolution", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist ein Gen?", "Ein Abschnitt der DNA mit einer Bauanleitung.",
       "Meist für ein Eiweiß. Der Mensch hat rund 20 000 Gene — erstaunlich wenige, etwa so viele wie ein Fadenwurm."],
      ["Wo befindet sich die DNA in einer Zelle?", "Im Zellkern, aufgewickelt in Chromosomen.",
       "Aneinandergelegt ergäbe die DNA einer einzigen Zelle rund zwei Meter. Sie ist so dicht gepackt, dass sie in einen Kern von wenigen Tausendstelmillimetern passt."],
      ["Wie viele Chromosomen hat der Mensch?", "46 — also 23 Paare.",
       "Von jedem Paar kommt eines von der Mutter und eines vom Vater. Deshalb hat man von jedem Gen zwei Ausführungen."],
      ["Was ist der Unterschied zwischen dominant und rezessiv?", "Ein dominantes Merkmal setzt sich durch, ein rezessives zeigt sich nur, wenn beide Anlagen rezessiv sind.",
       "Deshalb können zwei braunäugige Eltern ein blauäugiges Kind bekommen: Beide tragen die rezessive Anlage, ohne sie selbst zu zeigen. Bei Augenfarbe wirken allerdings mehrere Gene mit."],
      ["Was ist eine Mutation?", "Eine Veränderung im Erbgut.",
       "Die meisten sind wirkungslos, manche schädlich, sehr wenige nützlich. Ohne Mutationen gäbe es keine Vielfalt — sie sind der Rohstoff der Evolution."],
      ["Was versteht man unter natürlicher Auslese?", "Wer besser zur Umwelt passt, hinterlässt im Schnitt mehr Nachkommen.",
       "Wichtig: Nicht die Stärksten setzen sich durch, sondern die am besten Passenden. Bei manchen Arten ist das der Kleinste oder der Unauffälligste."],
      ["Warum ist „Der Stärkste überlebt“ eine falsche Zusammenfassung der Evolution?", "Weil es nicht um Stärke geht, sondern um Passung und Nachkommen.",
       "Ein winziges Insekt kann erfolgreicher sein als ein Tiger. Erfolg misst sich in Nachkommen, nicht in Muskeln."],
      ["Was ist ein Fossil?", "Ein versteinerter Rest oder Abdruck eines Lebewesens.",
       "Fossilien entstehen nur unter seltenen Bedingungen — deshalb ist die Fundlage lückenhaft. Von den meisten Arten, die je lebten, gibt es keinerlei Spur."],
      ["Warum haben Wale Fingerknochen in den Flossen?", "Weil ihre Vorfahren an Land lebten.",
       "Solche Reste nennt man Rudimente. Sie sind einer der stärksten Hinweise auf gemeinsame Abstammung — ein Bauplan wird umgebaut, nicht neu erfunden."],
      ["Was bedeutet es, wenn zwei Arten verwandt sind?", "Sie haben gemeinsame Vorfahren.",
       "Je ähnlicher das Erbgut, desto näher die Verwandtschaft. Mensch und Schimpanse teilen rund 98 Prozent — die Unterschiede stecken vor allem darin, wann welche Gene abgelesen werden."],
      ["Was ist der Unterschied zwischen Vererbung und Erlerntem?", "Vererbt wird, was in den Genen steht — Erlerntes wird nicht weitergegeben.",
       "Wer Klavierspielen lernt, vererbt das nicht. Diese Vorstellung war im 19. Jahrhundert verbreitet und ist widerlegt."],
    ]),
  },
  {
    category: "Unterstufe 4", subject: "Geschichte & Politik", name: "Industrialisierung", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was war die Industrielle Revolution?", "Der Übergang von Handarbeit zu Maschinenarbeit ab dem späten 18. Jahrhundert.",
       "Sie begann in England mit der Textilherstellung. Innerhalb weniger Generationen änderte sich, wo Menschen wohnten, wie sie arbeiteten und wie lange sie lebten."],
      ["Welche Erfindung war der Auslöser?", "Die verbesserte Dampfmaschine von James Watt.",
       "Erstmals war Energie unabhängig von Wind, Wasser und Muskelkraft verfügbar — und damit auch unabhängig vom Ort. Fabriken mussten nicht mehr am Fluss stehen."],
      ["Warum zogen so viele Menschen in die Städte?", "Weil es dort Arbeit in den Fabriken gab.",
       "Gleichzeitig brauchte die Landwirtschaft durch Maschinen weniger Leute. Beides zusammen ließ Städte in wenigen Jahrzehnten explodieren — mit Wohnungsnot und Seuchen als Folge."],
      ["Wie sahen die Arbeitsbedingungen aus?", "Bis zu 16 Stunden täglich, sechs Tage die Woche, auch für Kinder.",
       "Kinder waren billig und passten in enge Maschinenteile. Erst nach und nach kamen Gesetze — in Österreich wurde die Kinderarbeit unter zehn Jahren 1842 eingeschränkt."],
      ["Was ist eine Gewerkschaft?", "Ein Zusammenschluss von Arbeitnehmern zur Durchsetzung gemeinsamer Interessen.",
       "Einzeln war man ersetzbar, gemeinsam nicht. Der Achtstundentag, bezahlter Urlaub und die Lohnfortzahlung im Krankheitsfall wurden so erkämpft."],
      ["Was bedeutet „soziale Frage“?", "Die Frage, wie mit der Armut der Arbeiterschaft umzugehen sei.",
       "Aus ihr entstanden Sozialversicherung, Arbeitsrecht und politische Parteien. Vieles, was heute selbstverständlich wirkt, ist eine Antwort auf diese Zeit."],
      ["Was veränderte die Eisenbahn?", "Sie machte Waren und Menschen schnell und billig beweglich.",
       "Sie erzwang auch die einheitliche Zeit: Vorher hatte jede Stadt ihre eigene Uhrzeit — mit Fahrplänen ging das nicht mehr."],
      ["Welche Rolle spielte Kohle?", "Sie war der Brennstoff für Dampfmaschinen und die Eisenherstellung.",
       "Wo Kohle lag, entstand Industrie. Der Preis war schlechte Luft und harte Arbeit unter Tage — und der Beginn des Kohlendioxid-Anstiegs, der uns heute beschäftigt."],
      ["Was war der Luddismus?", "Eine Bewegung von Arbeitern, die Maschinen zerstörten.",
       "Sie richtete sich nicht gegen Technik an sich, sondern gegen den Verlust der Existenz. Die Frage, was mit Menschen passiert, deren Arbeit Maschinen übernehmen, ist seither nie verschwunden."],
      ["Was hat die Industrialisierung mit dem Klimawandel zu tun?", "Mit ihr begann das massenhafte Verbrennen fossiler Brennstoffe.",
       "Seit etwa 1850 lässt sich der Anstieg des Kohlendioxids in der Luft messen. Die Erwärmung, über die heute gestritten wird, hat hier ihren Ausgangspunkt."],
    ]),
  },
  {
    category: "Unterstufe 4", subject: "Chemie", name: "Atome & Reaktionen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Woraus besteht ein Atom?", "Aus Kern (Protonen und Neutronen) und Hülle (Elektronen).",
       "Der Kern ist winzig gegenüber dem Ganzen: Wäre das Atom ein Fußballstadion, wäre der Kern eine Erbse in der Mitte. Materie ist fast leer."],
      ["Was unterscheidet die Elemente voneinander?", "Die Anzahl der Protonen im Kern.",
       "Ein Proton mehr, und aus Kohlenstoff wird Stickstoff. Diese Zahl heißt Ordnungszahl und legt den Platz im Periodensystem fest."],
      ["Was ist ein Molekül?", "Zwei oder mehr Atome, die fest verbunden sind.",
       "Wasser besteht aus zwei Wasserstoffatomen und einem Sauerstoffatom — H₂O. Die Eigenschaften des Moleküls haben mit denen der Einzelatome oft nichts zu tun."],
      ["Was ist der Unterschied zwischen Gemisch und Verbindung?", "Ein Gemisch lässt sich physikalisch trennen, eine Verbindung nur chemisch.",
       "Salzwasser ist ein Gemisch — Verdampfen trennt es. Wasser selbst ist eine Verbindung: Um Wasserstoff und Sauerstoff zu trennen, braucht es Strom."],
      ["Was passiert bei einer chemischen Reaktion?", "Bindungen werden gelöst und neu geknüpft — es entstehen neue Stoffe.",
       "Die Atome selbst bleiben erhalten, sie werden nur anders zusammengesetzt. Deshalb ist die Masse vorher und nachher gleich."],
      ["Woran erkennt man eine chemische Reaktion?", "An neuen Stoffen, Farbwechsel, Gasbildung oder Wärme.",
       "Wenn Zucker schmilzt, ist es keine chemische Reaktion — es bleibt Zucker. Wenn er braun wird und riecht, schon."],
      ["Was ist eine Oxidation?", "Eine Reaktion mit Sauerstoff.",
       "Rosten ist eine langsame Oxidation, Feuer eine schnelle. Auch unsere Atmung ist im Kern eine Oxidation — nur sehr kontrolliert."],
      ["Warum brennt Feuer ohne Sauerstoff nicht?", "Weil die Verbrennung eine Reaktion mit Sauerstoff ist.",
       "Deshalb erstickt eine Kerze unter einem Glas. Und deshalb löscht man kleine Brände mit einer Decke — man nimmt die Luft weg."],
      ["Was sagt der pH-Wert?", "Ob ein Stoff sauer, neutral oder basisch ist.",
       "Unter 7 sauer, 7 neutral, über 7 basisch. Die Skala ist nicht linear: pH 4 ist zehnmal so sauer wie pH 5."],
      ["Was passiert, wenn man Säure und Lauge mischt?", "Sie neutralisieren sich, es entstehen Salz und Wasser.",
       "Deshalb hilft ein Basenmittel bei Sodbrennen — es neutralisiert überschüssige Magensäure."],
      ["Warum darf man Wasser niemals in konzentrierte Säure gießen?", "Weil es dabei schlagartig heiß wird und spritzen kann.",
       "Die Merkregel lautet: Erst das Wasser, dann die Säure — sonst geschieht das Ungeheure. Die Säure kommt langsam ins Wasser, nie umgekehrt."],
    ]),
  },
  {
    category: "Unterstufe 4", subject: "Geographie & Wirtschaft", name: "Klima & Klimawandel", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist der Unterschied zwischen Wetter und Klima?", "Wetter ist der Zustand jetzt, Klima der Durchschnitt über Jahrzehnte.",
       "Ein kalter Winter widerlegt die Erwärmung nicht — genauso wenig wie ein Regentag beweist, dass ein Ort feucht ist. Klima misst man üblicherweise über 30 Jahre."],
      ["Was ist der Treibhauseffekt?", "Gase in der Luft lassen Sonnenlicht herein, halten aber Wärmestrahlung zurück.",
       "Ohne ihn wäre die Erde im Schnitt etwa 18 Grad unter null — also unbewohnbar. Das Problem ist nicht der Effekt, sondern seine Verstärkung."],
      ["Welche Gase verstärken den Treibhauseffekt am meisten?", "Kohlendioxid und Methan.",
       "Methan wirkt kurzfristig viel stärker, bleibt aber kürzer in der Luft. Kohlendioxid ist schwächer, dafür über Jahrhunderte wirksam."],
      ["Woher weiß man, wie das Klima vor Tausenden Jahren war?", "Aus Eisbohrkernen, Baumringen und Sedimenten.",
       "In Eisbohrkernen sind winzige Luftbläschen eingeschlossen — echte Luft aus der Vergangenheit. Damit lässt sich der Kohlendioxidgehalt über 800 000 Jahre zurückverfolgen."],
      ["Was ist der Unterschied zwischen Wettervorhersage und Klimamodell?", "Die Vorhersage nennt konkrete Tage, das Modell langfristige Durchschnitte.",
       "Man kann nicht sagen, ob es am 3. Juli 2050 regnet — aber sehr wohl, wie warm dieser Sommer im Mittel sein dürfte. Das ist wie beim Würfel: Der einzelne Wurf ist unvorhersagbar, der Durchschnitt von tausend Würfen nicht."],
      ["Was sind erneuerbare Energien?", "Quellen, die sich von selbst erneuern: Sonne, Wind, Wasser, Biomasse, Erdwärme.",
       "Ihr Gegenteil sind fossile Energieträger — Kohle, Erdöl, Erdgas. Diese sind über Millionen Jahre entstanden und in Jahrzehnten aufgebraucht."],
      ["Warum steigt der Meeresspiegel?", "Weil Eis schmilzt und weil sich warmes Wasser ausdehnt.",
       "Der zweite Grund wird oft vergessen, macht aber einen großen Teil aus. Wasser braucht bei Erwärmung mehr Platz — auch ohne einen Tropfen zusätzliches."],
      ["Warum lässt schmelzendes Meereis den Meeresspiegel kaum steigen?", "Weil es bereits im Wasser schwimmt und dessen Platz einnimmt.",
       "Wie ein Eiswürfel im Glas: Beim Schmelzen läuft nichts über. Entscheidend ist das Eis an Land — Grönland und die Antarktis."],
      ["Was ist eine Klimazone?", "Ein Gebiet der Erde mit ähnlichem Klima.",
       "Von den Tropen über die Subtropen und gemäßigten Zonen bis zu den Polarzonen. Sie hängen vor allem vom Einfallswinkel der Sonne ab."],
      ["Warum ist es am Äquator wärmer als an den Polen?", "Weil die Sonne dort steiler steht und ihre Energie auf weniger Fläche verteilt.",
       "Am Pol trifft dasselbe Lichtbündel schräg auf und verteilt sich auf ein viel größeres Stück Boden. Man kann es mit einer Taschenlampe an der Wand ausprobieren."],
    ]),
  },
  {
    category: "Unterstufe 4", subject: "Deutsch", name: "Texte durchschauen: Argument & Absicht", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist eine These?", "Eine Behauptung, die begründet werden muss.",
       "„Hausaufgaben gehören abgeschafft“ ist eine These. Ohne Begründung ist sie nur eine Meinung — das ist erlaubt, überzeugt aber niemanden."],
      ["Woraus besteht ein vollständiges Argument?", "Aus Behauptung, Begründung und Beispiel.",
       "Behauptung: Hausaufgaben helfen wenig. Begründung: Wer den Stoff nicht verstanden hat, übt Fehler ein. Beispiel: … Fehlt die Begründung, ist es kein Argument."],
      ["Was ist der Unterschied zwischen Tatsache und Meinung?", "Eine Tatsache kann man überprüfen, eine Meinung nicht.",
       "„Wien hat rund zwei Millionen Einwohner“ ist überprüfbar. „Wien ist die schönste Stadt“ nicht. Beides darf man sagen — aber nur das eine kann falsch sein."],
      ["Was ist ein Scheinargument?", "Etwas, das wie eine Begründung aussieht, aber keine ist.",
       "„Das war schon immer so“ begründet nichts — es beschreibt nur die Vergangenheit. Genauso: „Das machen alle so.“"],
      ["Was bedeutet es, wenn jemand persönlich angegriffen wird statt seine Aussage?", "Das ist ein Ausweichmanöver.",
       "„Was weißt denn du schon, du bist erst 13“ sagt nichts darüber, ob die Aussage stimmt. Wer auf die Person zielt, hat zur Sache oft nichts."],
      ["Was ist eine Suggestivfrage?", "Eine Frage, die die Antwort schon enthält.",
       "„Findest du nicht auch, dass das ungerecht ist?“ Man kann kaum nein sagen, ohne sich zu rechtfertigen. In Umfragen verändern solche Fragen das Ergebnis erheblich."],
      ["Wie erkennt man die Absicht eines Textes?", "An der Frage: Was soll ich danach denken, fühlen oder tun?",
       "Informieren, überzeugen, unterhalten oder verkaufen. Ein Text kann mehreres zugleich wollen — problematisch wird es, wenn er das eine vorgibt und das andere tut."],
      ["Was ist der Unterschied zwischen Bericht und Kommentar?", "Der Bericht stellt dar, der Kommentar bewertet.",
       "In Zeitungen sind sie gekennzeichnet. Wo diese Trennung fehlt, sollte man besonders aufmerksam lesen."],
      ["Warum sind Wörter wie „skandalös“ oder „unglaublich“ ein Warnsignal?", "Sie bewerten, statt zu berichten.",
       "Sie erzeugen ein Gefühl, bevor man die Tatsachen kennt. Wer überzeugen will, statt zu informieren, greift früh zu solchen Wörtern."],
      ["Was ist eine Quelle — und warum reicht eine allein nicht?", "Der Ursprung einer Information; eine einzelne kann irren oder täuschen.",
       "Bei wichtigen Behauptungen prüft man, ob unabhängige Quellen dasselbe sagen. „Unabhängig“ heißt: nicht voneinander abgeschrieben."],
    ]),
  },
  {
    category: "Unterstufe 4", subject: "Englisch", name: "Present Perfect & Zeitenfolge", flang: "en-US", blang: "de-DE",
    cards: P([
      ["Wie bildet man das Present Perfect?", "Mit have oder has und dem Partizip.",
       "I have seen, she has gone. Bei he, she, it steht has. Das Partizip ist die dritte Form der Verbliste."],
      ["Wann benutzt man das Present Perfect?", "Wenn etwas Vergangenes bis in die Gegenwart wirkt.",
       "„I have lost my key“ — und deshalb komme ich jetzt nicht rein. Der Zeitpunkt ist unwichtig, die Folge zählt."],
      ["Was ist der Unterschied zu Simple Past?", "Simple Past nennt einen Zeitpunkt, Present Perfect nicht.",
       "„I saw him yesterday“ — abgeschlossen. „I have seen him“ — irgendwann, und es ist noch bedeutsam. Sobald yesterday, last week oder ago dabeisteht, ist Simple Past Pflicht."],
      ["Was ist der Unterschied zwischen „since“ und „for“?", "since nennt den Startpunkt, for die Dauer.",
       "since 2020, since Monday — for three years, for two hours. Beide stehen typischerweise beim Present Perfect."],
      ["Übersetze: „Ich wohne seit drei Jahren hier.“", "I have lived here for three years.",
       "Im Deutschen steht die Gegenwart, im Englischen das Present Perfect — weil es in der Vergangenheit begann und noch andauert. Das ist einer der häufigsten Fehler."],
      ["Was bedeutet „already“, „yet“ und „just“?", "schon, schon/noch nicht, gerade eben.",
       "„I have already eaten.“ / „Have you finished yet?“ / „She has just left.“ Alle drei gehören typischerweise zum Present Perfect."],
      ["Wo steht „yet“ im Satz?", "Am Ende — und nur in Fragen und Verneinungen.",
       "„Have you done it yet?“ / „I haven’t done it yet.“ In Aussagen nimmt man already."],
      ["Was ist das Present Perfect Progressive?", "have/has been plus -ing — es betont die Dauer.",
       "„I have been waiting for an hour.“ Nicht das Ergebnis zählt, sondern dass es die ganze Zeit lief."],
      ["Übersetze: „Warst du schon einmal in London?“", "Have you ever been to London?",
       "„ever“ heißt in Fragen „jemals“. Und es heißt „been to“, nicht „been in“, wenn man von einem Besuch spricht."],
      ["Warum ist „I have seen him yesterday“ falsch?", "Weil yesterday einen Zeitpunkt nennt.",
       "Sobald ein abgeschlossener Zeitpunkt dabeisteht, verlangt das Englische Simple Past: „I saw him yesterday.“"],
    ]),
  },
  {
    category: "Unterstufe 4", subject: "Informatik & Medien", name: "Wie das Internet funktioniert", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist das Internet?", "Ein weltweites Netz aus miteinander verbundenen Rechnernetzen.",
       "Es gehört niemandem. Es ist kein Dienst, sondern eine Verbindungsart — das World Wide Web ist nur einer der Dienste, die darüber laufen."],
      ["Was ist der Unterschied zwischen Internet und World Wide Web?", "Das Internet ist die Verbindung, das Web ein Dienst darauf.",
       "E-Mail, Videoanrufe und Spiele laufen ebenfalls über das Internet, sind aber nicht das Web. Das Web sind die Seiten, die man im Browser öffnet."],
      ["Was ist eine IP-Adresse?", "Die Nummer, unter der ein Gerät im Netz erreichbar ist.",
       "Wie eine Postadresse. Ohne sie wüsste niemand, wohin die Antwort geschickt werden soll — deshalb ist völlige Anonymität im Netz schwer."],
      ["Wozu dient das DNS?", "Es übersetzt Namen in IP-Adressen.",
       "Man tippt einen Namen, der Rechner braucht eine Nummer. Das DNS ist das Telefonbuch des Internets — fällt es aus, ist gefühlt „das Internet weg“, obwohl alles läuft."],
      ["Was passiert, wenn du eine Webseite aufrufst?", "Dein Gerät fragt einen Server, der schickt die Daten zurück.",
       "Die Daten werden in kleine Pakete zerlegt, die verschiedene Wege nehmen können und am Ziel wieder zusammengesetzt werden. Fehlt eines, wird es nachgefordert."],
      ["Was bedeutet das Schloss-Symbol im Browser?", "Die Verbindung ist verschlüsselt (HTTPS).",
       "Es bedeutet NICHT, dass die Seite vertrauenswürdig ist. Auch Betrugsseiten haben ein Schloss — es sagt nur, dass niemand mitlesen kann."],
      ["Was ist ein Cookie?", "Eine kleine Datei, die eine Webseite auf deinem Gerät ablegt.",
       "Sie merkt sich zum Beispiel, dass du angemeldet bist. Andere verfolgen dich über viele Seiten hinweg — deshalb die Zustimmungsbanner."],
      ["Was ist ein Server?", "Ein Rechner, der Daten bereitstellt.",
       "Meist ein Gerät in einem Rechenzentrum, das rund um die Uhr läuft. „In der Cloud“ heißt schlicht: auf dem Rechner von jemand anderem."],
      ["Warum sollte man für jeden Dienst ein anderes Passwort nutzen?", "Weil ein geknacktes Passwort sonst alle Konten öffnet.",
       "Bei Datenlecks werden Zugangsdaten massenhaft ausprobiert. Ein Passwortmanager löst das Problem, weil man sich nur noch eines merken muss."],
      ["Was macht ein Passwort sicher?", "Vor allem die Länge.",
       "Vier zufällige Wörter sind sicherer als acht Zeichen mit Sonderzeichen — und leichter zu merken. Wichtig ist, dass es nicht erratbar ist: kein Name, kein Geburtsdatum."],
      ["Was ist Zwei-Faktor-Anmeldung?", "Neben dem Passwort ein zweiter Nachweis, meist ein Code aufs Handy.",
       "Selbst wer das Passwort kennt, kommt dann nicht hinein. Es ist der wirksamste einzelne Schutz für wichtige Konten."],
      ["Was ist Phishing?", "Der Versuch, mit gefälschten Nachrichten an Zugangsdaten zu kommen.",
       "Typisch sind Dringlichkeit („Ihr Konto wird gesperrt“) und ein Link. Faustregel: Nie über einen Link in einer Nachricht anmelden — immer die Seite selbst aufrufen."],
    ]),
  },
  {
    category: "Medien", subject: "Miteinander", name: "Zeichentest (auf dem Gerät prüfen)", flang: "de-DE", blang: "de-DE",
    recall: false,
    cards: P([
      ["Sehen alle Zeichen gleich aus?", "√ π ² ³ ½ ¼ ≤ ≥ ≠ ± × ÷ · − ° ∞",
       "Wenn eines davon anders wirkt als die übrigen — eckiger, dünner, schief sitzend — dann hat die runde Systemschrift dieses Zeichen nicht und der Browser hat es aus einer anderen Schrift geholt. Genau das soll die Schriftkette für Formeln verhindern."],
      ["Griechische Buchstaben", "α β γ Δ Σ Ω φ λ μ",
       "Kommen in Physik und Mathematik der Oberstufe vor. Für die Unterstufe reichen π und Δ."],
      ["Bleibt diese Gleichung auf einer Zeile?", "3 × (2x + 5) − 4x = 2x + 15",
       "Wenn sie umbricht, greift der Formelschutz nicht. Wenn sie kleiner gesetzt ist als der übrige Text: genau richtig, dann hat die automatische Anpassung gearbeitet."],
      ["Fluchten die Ziffern untereinander?", "1111 · 8888 · 1088 · 8011",
       "Alle vier Zeilen sollten exakt gleich breit sein. Wenn nicht, greift tabular-nums nicht — dann verrutschen in Tabellen die Spalten."],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Englisch", name: "A1 · Alltag & Höflichkeit", flang: "en-US", blang: "de-DE",
    cards: P([["hello", "hallo"], ["good morning", "guten Morgen"], ["good evening", "guten Abend"], ["goodbye", "auf Wiedersehen"],
      ["please", "bitte"], ["thank you", "danke"], ["you're welcome", "gern geschehen"], ["sorry", "Entschuldigung"],
      ["excuse me", "entschuldigen Sie"], ["yes", "ja"], ["no", "nein"], ["see you soon", "bis bald"],
      ["how are you?", "wie geht es dir?"], ["my name is …", "ich heiße …"], ["nice to meet you", "freut mich"]]),
  },
  {
    category: "Unterstufe 3", subject: "Englisch", name: "A1 · Zahlen 1–12", flang: "en-US", blang: "de-DE",
    cards: P([["one", "eins"], ["two", "zwei"], ["three", "drei"], ["four", "vier"], ["five", "fünf"], ["six", "sechs"],
      ["seven", "sieben"], ["eight", "acht"], ["nine", "neun"], ["ten", "zehn"], ["eleven", "elf"], ["twelve", "zwölf"]]),
  },
  {
    category: "Unterstufe 3", subject: "Englisch", name: "A1 · Farben", flang: "en-US", blang: "de-DE",
    cards: P([["red", "rot"], ["blue", "blau"], ["green", "grün"], ["yellow", "gelb"], ["black", "schwarz"], ["white", "weiß"],
      ["orange", "orange"], ["brown", "braun"], ["pink", "rosa"], ["grey", "grau"], ["purple", "lila"]]),
  },
  {
    category: "Unterstufe 3", subject: "Französisch", name: "A1 · Les bases (Höflichkeit)", flang: "fr-FR", blang: "de-DE",
    cards: P([["bonjour", "guten Tag / hallo"], ["salut", "hallo (informell)"], ["bonsoir", "guten Abend"], ["au revoir", "auf Wiedersehen"],
      ["s'il vous plaît", "bitte"], ["merci", "danke"], ["de rien", "gern geschehen"], ["pardon", "Entschuldigung"],
      ["excusez-moi", "entschuldigen Sie"], ["oui", "ja"], ["non", "nein"], ["à bientôt", "bis bald"],
      ["comment ça va ?", "wie geht es dir?"], ["je m'appelle …", "ich heiße …"], ["enchanté", "freut mich"]]),
  },
  {
    category: "Unterstufe 3", subject: "Französisch", name: "A1 · Les nombres 1–12", flang: "fr-FR", blang: "de-DE",
    cards: P([["un", "eins"], ["deux", "zwei"], ["trois", "drei"], ["quatre", "vier"], ["cinq", "fünf"], ["six", "sechs"],
      ["sept", "sieben"], ["huit", "acht"], ["neuf", "neun"], ["dix", "zehn"], ["onze", "elf"], ["douze", "zwölf"]]),
  },
  {
    category: "Unterstufe 3", subject: "Französisch", name: "A1 · Les couleurs", flang: "fr-FR", blang: "de-DE",
    cards: P([["rouge", "rot"], ["bleu", "blau"], ["vert", "grün"], ["jaune", "gelb"], ["noir", "schwarz"], ["blanc", "weiß"],
      ["orange", "orange"], ["marron", "braun"], ["rose", "rosa"], ["gris", "grau"], ["violet", "lila"]]),
  },
  {
    category: "Unterstufe 3", subject: "Französisch", name: "A1 · La famille", flang: "fr-FR", blang: "de-DE",
    cards: P([["la mère", "die Mutter"], ["le père", "der Vater"], ["la sœur", "die Schwester"], ["le frère", "der Bruder"],
      ["les parents", "die Eltern"], ["la grand-mère", "die Großmutter"], ["le grand-père", "der Großvater"], ["le fils", "der Sohn"],
      ["la fille", "die Tochter / das Mädchen"], ["l'enfant", "das Kind"], ["la famille", "die Familie"], ["la tante", "die Tante"], ["l'oncle", "der Onkel"]]),
  },
  /* --- Mathematik: Verstehen vor Rechnen. Jede Karte erklaert das Warum mit. --- */
  {
    category: "Unterstufe 3", subject: "Mathematik", name: "Rationale Zahlen — Rechnen mit Vorzeichen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Warum ist (−3) · (−4) = +12?", "Weil das Gegenteil vom Gegenteil das Original ist.",
       "Minus dreht die Richtung um — zweimal umdrehen führt zurück. Anschaulich mit Geld: Wenn dir jemand dreimal Schulden von 4 Euro erlässt, hast du 12 Euro mehr. Schulden wegnehmen wirkt wie Geld bekommen."],
      ["−7 + 3 = ?", "−4.",
       "Am Zahlenstrahl drei Schritte nach rechts von −7 aus. Plus heißt immer: nach rechts. Auch im Minusbereich."],
      ["5 − (−2) = ?", "7.",
       "Das Minus vor der Klammer dreht das Vorzeichen um: aus −(−2) wird +2. Deshalb wird die Zahl größer, obwohl ein Minuszeichen dasteht."],
      ["Was bedeutet der Betrag |−9|?", "9.",
       "Der Betrag ist der Abstand zur Null — und ein Abstand ist nie negativ. |−9| und |9| sind beide 9, weil beide Zahlen gleich weit von der Null entfernt liegen."],
      ["Welche Zahl ist größer: −8 oder −3?", "−3.",
       "Bei negativen Zahlen ist die mit dem kleineren Betrag die größere. Denk an Temperaturen: −3 Grad sind wärmer als −8 Grad, obwohl 8 die größere Ziffer ist."],
      ["(−12) : (−3) = ?", "4.",
       "Gleiche Vorzeichen ergeben ein positives Ergebnis — dieselbe Regel wie beim Multiplizieren. Probe: 4 · (−3) = −12, es geht auf."],
      ["(−12) : 3 = ?", "−4.",
       "Verschiedene Vorzeichen ergeben ein negatives Ergebnis. Probe: (−4) · 3 = −12."],
      ["Es hat 4 °C und wird um 9 Grad kälter. Wie kalt ist es?", "−5 °C.",
       "4 − 9 = −5. Der Zahlenstrahl hört bei null nicht auf, er geht darunter weiter. Genau dafür wurden negative Zahlen erfunden — anfangs übrigens für Schulden, nicht für Temperaturen."],
      ["Was ist die Gegenzahl von −2,5?", "+2,5.",
       "Eine Zahl und ihre Gegenzahl ergeben zusammen immer 0. Am Zahlenstrahl liegen sie spiegelbildlich zur Null."],
      ["(−2)³ = ?", "−8.",
       "Drei Minus-Faktoren, also eine ungerade Anzahl — es bleibt eines übrig, das Ergebnis ist negativ. Merkregel: gerade Anzahl Minus = plus, ungerade = minus."],
      ["(−2)⁴ = ?", "+16.",
       "Vier Minus-Faktoren, also eine gerade Anzahl — sie heben sich paarweise auf. Achtung auf die Klammer: (−2)⁴ ist +16, aber −2⁴ ist −16, weil dort nur die 2 potenziert wird."],
      ["Kontostand −120 €, dann kommen 200 € dazu. Wie steht es?", "+80 €.",
       "−120 + 200 = 80. Zuerst wird das Loch gefüllt, erst was darüber hinausgeht, ist Guthaben. Das ist die anschaulichste Art, negative Zahlen zu verstehen."],
      ["Warum gilt a − b = a + (−b)?", "Subtrahieren heißt: die Gegenzahl addieren.",
       "Damit braucht man am Ende nur noch eine einzige Rechenart. Das klingt nach Wortklauberei, macht aber alles einfacher: Man muss sich nur noch Regeln fürs Addieren merken, nicht zusätzlich fürs Subtrahieren."],
      ["Ordne der Größe nach: −5; 0,5; −0,5; 5", "−5 < −0,5 < 0,5 < 5.",
       "Je weiter links am Zahlenstrahl, desto kleiner. Der häufigste Fehler ist, nur auf die Ziffern zu schauen — dann landet −5 fälschlich hinter −0,5."],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Mathematik", name: "Terme & Gleichungen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was unterscheidet einen Term von einer Gleichung?", "Ein Term ist ein Rechenausdruck, eine Gleichung behauptet, dass zwei Terme gleich sind.",
       "3x + 2 ist ein Term — man kann ihn ausrechnen, wenn man x kennt. 3x + 2 = 11 ist eine Gleichung: Sie stellt eine Behauptung auf, die nur für bestimmte x stimmt. Deshalb kann man Gleichungen lösen, Terme aber nur umformen."],
      ["Fasse zusammen: 5a + 3b − 2a + b", "3a + 4b.",
       "Zusammenfassen darf man nur, was dieselbe Variable hat: 5a − 2a = 3a und 3b + b = 4b. Das einzelne b zählt als 1b — der häufigste Flüchtigkeitsfehler ist, es zu übersehen."],
      ["Warum darf man 5a und 3b nicht addieren?", "Weil es verschiedene Dinge sind.",
       "Wie 5 Äpfel und 3 Birnen: zusammen sind es 8 Stück Obst, aber weder 8 Äpfel noch 8 Birnen. Solange man nicht weiß, was a und b sind, muss beides nebeneinander stehen bleiben."],
      ["Löse: 3x + 2 = 11", "x = 3.",
       "Erst auf beiden Seiten −2, das ergibt 3x = 9, dann beide Seiten :3. Man arbeitet sich von außen nach innen vor — genau umgekehrt zur Rechenreihenfolge."],
      ["Was ist mit dem Waage-Modell gemeint?", "Eine Gleichung ist eine Waage im Gleichgewicht.",
       "Was du links tust, musst du rechts genauso tun, sonst kippt sie. Dieses Bild erklärt jede Umformung: Man nimmt auf beiden Seiten dasselbe weg oder legt dasselbe dazu. Und es erklärt, warum man nicht durch null teilen darf — das wäre, als würde man die Waage wegnehmen."],
      ["Löse: 4(x − 2) = 12", "x = 5.",
       "Zwei Wege führen hin: ausmultiplizieren zu 4x − 8 = 12, oder gleich beide Seiten durch 4 teilen (x − 2 = 3). Der zweite ist kürzer — bei einer Klammer mit gemeinsamem Faktor lohnt sich immer der Blick, ob Teilen schneller geht."],
      ["Multipliziere aus: 3(2x + 5)", "6x + 15.",
       "Der Faktor vor der Klammer trifft jeden Summanden darin, nicht nur den ersten. Das ist der häufigste Fehler: 6x + 5 statt 6x + 15."],
      ["Hebe heraus: 6x + 9", "3(2x + 3).",
       "Der größte gemeinsame Faktor ist 3. Herausheben ist die Umkehrung des Ausmultiplizierens — zur Probe multipliziert man zurück."],
      ["Wo steckt der Fehler: 2x + 3x = 6x?", "Richtig ist 5x.",
       "Beim Addieren zählt man die Stücke zusammen, man multipliziert sie nicht. Zwei x plus drei x sind fünf x — so wie 2 Äpfel plus 3 Äpfel fünf Äpfel sind, nicht sechs."],
      ["Warum ist 2x + 3x = 5x, aber 2x · 3x = 6x²?", "Beim Addieren bleibt es bei x-Stücken, beim Multiplizieren treffen auch die x aufeinander.",
       "2x · 3x heißt 2 · x · 3 · x. Die Zahlen ergeben 6, die beiden x ergeben x². Deshalb steigt beim Multiplizieren die Hochzahl, beim Addieren nicht."],
      ["Setze x = −2 ein in 3x² − x", "14.",
       "3 · (−2)² = 3 · 4 = 12, und minus (−2) heißt plus 2. Wichtig ist die Klammer beim Quadrieren: (−2)² ist +4, denn minus mal minus gibt plus."],
      ["Wie prüfst du, ob deine Lösung stimmt?", "Einsetzen in die ursprüngliche Gleichung.",
       "Kommt links und rechts dasselbe heraus, passt es. Diese Probe kostet zwanzig Sekunden und findet fast jeden Rechenfehler — und sie geht immer, egal wie kompliziert der Weg war."],
      ["Übersetze: Das Doppelte einer Zahl, vermindert um 5, ergibt 9.", "2x − 5 = 9, also x = 7.",
       "Erst den Text in Symbole übersetzen, dann rechnen. Bei Textaufgaben ist das Übersetzen die eigentliche Arbeit — wer die Gleichung hat, hat das Schwierigste hinter sich."],
      ["Löse: x/4 = 7", "x = 28.",
       "Beide Seiten mal 4. Jede Rechenart wird durch ihre Gegenrechnung rückgängig gemacht: Teilen durch Malnehmen, Minus durch Plus."]
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Mathematik", name: "Prozent & Zinsen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was bedeutet 1 %?", "Ein Hundertstel — also 1 von 100 Teilen oder 0,01.",
       "Das Wort kommt vom lateinischen „pro centum“, für hundert. Deshalb ist Prozentrechnen im Kern nichts anderes als Bruchrechnen mit dem Nenner 100."],
      ["25 % von 80 = ?", "20.",
       "25 % ist ein Viertel, und 80 : 4 = 20. Diese drei sollte man auswendig können: 25 % = ein Viertel, 50 % = die Hälfte, 10 % = Komma eine Stelle nach links."],
      ["Wie berechnest du den Prozentwert allgemein?", "Grundwert mal Prozentsatz, geteilt durch 100.",
       "Beispiel: 200 · 15 : 100 = 30. Kürzer geht es mit der Dezimalzahl: 200 · 0,15. Wer 15 % als 0,15 denkt, spart sich das Teilen."],
      ["Ein Pulli kostet 60 €, es gibt 20 % Rabatt. Was zahlst du?", "48 €.",
       "20 % von 60 sind 12 €, also 60 − 12. Wer sich verrechnet, prüft mit der Grobschätzung: ein Fünftel weg, es müssen also gut 48 sein."],
      ["Wie rechnest du 20 % Rabatt in einem einzigen Schritt?", "Mal 0,8.",
       "Du zahlst ja noch 80 %. Also 60 · 0,8 = 48. Dieser Trick ist bei mehreren Rabatten hintereinander unschlagbar: zweimal 20 % sind 0,8 · 0,8 = 0,64, also 36 % Nachlass."],
      ["Ein Preis steigt von 50 € auf 60 €. Um wie viel Prozent?", "20 %.",
       "Die Änderung von 10 € wird durch den ALTEN Wert geteilt: 10 : 50 = 0,2. Der häufigste Fehler ist, durch den neuen Wert zu teilen — dann käme 16,7 % heraus."],
      ["Warum ist +10 % und danach −10 % nicht wieder der Startwert?", "Weil sich der Grundwert dazwischen ändert.",
       "100 → 110 → 99. Der Abschlag von 10 % bezieht sich auf 110, nicht mehr auf 100. Prozente beziehen sich immer auf den aktuellen Wert — deshalb sind sie in Nachrichten so leicht irreführend."],
      ["Was ist der Grundwert?", "Das Ganze, also die 100 %.",
       "Die Zahl, auf die sich der Prozentsatz bezieht. Bei jeder Prozentaufgabe lohnt die erste Frage: Wovon sind es Prozent? Wer den Grundwert falsch wählt, rechnet richtig und liegt trotzdem daneben."],
      ["500 € zu 3 % pro Jahr — wie viel Zinsen nach einem Jahr?", "15 €.",
       "500 · 3 : 100 = 15. Zinsen sind nichts anderes als Prozentrechnung mit der Zeit als drittem Faktor."],
      ["Wie viel Zinsen bringen 500 € zu 3 % nach 4 Monaten?", "5 €.",
       "Der Jahreszins von 15 € mal 4/12, weil nur ein Drittel des Jahres vergangen ist. Banken rechnen üblicherweise mit 12 Monaten zu 30 Tagen — deshalb funktioniert die einfache Bruchrechnung."],
      ["Was ist Zinseszins?", "Die Zinsen bleiben liegen und werden selbst mitverzinst.",
       "Deshalb wächst Geld nicht gleichmäßig, sondern immer schneller. Faustregel für Überschlagsrechnungen: 70 geteilt durch den Zinssatz ergibt ungefähr die Jahre bis zur Verdopplung — bei 3 % also rund 23 Jahre."],
      ["Netto 200 €, dazu 19 % Mehrwertsteuer. Wie viel brutto?", "238 €.",
       "200 · 1,19. In Österreich sind es meist 20 %, dann wäre es 240 €. Der Satz hängt vom Land und von der Warenart ab — Lebensmittel und Bücher haben ermäßigte Sätze."],
      ["Brutto 119 € bei 19 % Mehrwertsteuer — wie hoch ist netto?", "100 €.",
       "Nicht 19 % abziehen, sondern durch 1,19 teilen. Wer 19 % von 119 abzieht, landet bei 96,39 € und damit falsch — der Steuersatz bezieht sich auf den Nettopreis, nicht auf den Bruttopreis."],
      ["Warum ergeben 20 % plus nochmal 20 % Rabatt nicht 40 %?", "Der zweite Rabatt greift auf den bereits gesenkten Preis.",
       "0,8 · 0,8 = 0,64, zusammen also 36 % Nachlass. Genau damit wird im Handel gern geworben — „20 % plus 20 % extra“ klingt nach 40, ist es aber nie."]
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Mathematik", name: "Flächen, Körper & Einheiten", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wie berechnest du die Fläche eines Dreiecks?", "A = g · h : 2 — Grundlinie mal zugehörige Höhe, halbiert.",
       "Wichtig ist das Wort zugehörig: Die Höhe muss senkrecht auf genau der Grundlinie stehen, die man eingesetzt hat. Bei einem schiefen Dreieck liegt sie manchmal außerhalb der Figur."],
      ["Warum steht in der Dreiecksformel das : 2?", "Weil ein Dreieck die Hälfte eines Parallelogramms ist.",
       "Zwei gleiche Dreiecke lassen sich immer zu einem Parallelogramm zusammenlegen — man dreht das zweite um 180 Grad. Wer die Formel vergisst, kann sie sich so in zehn Sekunden herleiten."],
      ["Rechteck 6 cm mal 4 cm — Fläche und Umfang?", "A = 24 cm², Umfang = 20 cm.",
       "Fläche ist der Inhalt, Umfang die Länge des Randes. Die Einheit verrät, was gemeint ist: cm² für Fläche, cm für Länge. Wer die Einheit mitschreibt, merkt Verwechslungen sofort."],
      ["Was passiert mit der Fläche, wenn du beide Seiten verdoppelst?", "Sie vervierfacht sich.",
       "Fläche wächst mit dem Quadrat des Faktors: 2 · 2 = 4. Deshalb ist eine Pizza mit doppeltem Durchmesser viermal so viel Pizza — und deshalb sind große Pizzen fast immer günstiger je Quadratzentimeter."],
      ["Wie berechnest du die Fläche eines Parallelogramms?", "A = g · h.",
       "Die Höhe steht senkrecht auf der Grundlinie — es ist nicht die schräge Seite. Das ist der häufigste Fehler bei dieser Figur, weil die schräge Seite so einladend danebensteht."],
      ["Wie berechnest du das Volumen eines Quaders?", "V = Länge · Breite · Höhe.",
       "Anders gesagt: Grundfläche mal Höhe. Man kann sich vorstellen, wie die Grundfläche Schicht für Schicht nach oben gestapelt wird."],
      ["Wie berechnest du das Volumen eines Prismas?", "V = G · h — Grundfläche mal Höhe.",
       "Egal welche Form die Grundfläche hat: Dreieck, Sechseck, Kreis. Dieselbe Vorstellung wie beim Quader — die Grundfläche wird nach oben gestapelt. Deshalb gilt beim Zylinder dasselbe."],
      ["Wie viele cm³ sind 1 Liter?", "1000 cm³.",
       "Das ist genau 1 dm³, also ein Würfel mit 10 cm Kante. Diese Verbindung ist praktisch: Ein Milchpaket ist ungefähr so ein Würfel, damit hat man ein Gefühl für einen Liter."],
      ["Wie viele cm² sind 1 m²?", "10 000 cm².",
       "Denn 100 · 100. Bei Flächen zählt der Umrechnungsfaktor doppelt, bei Volumen dreifach: 1 m³ sind eine Million cm³. Das überrascht fast jeden beim ersten Mal."],
      ["Oberfläche eines Würfels mit 5 cm Kante?", "150 cm².",
       "Sechs Flächen zu je 25 cm². Ein Würfel hat sechs gleiche Seiten — die Formel lautet also immer 6 · a²."],
      ["Was ist der Unterschied zwischen Oberfläche und Volumen?", "Die Oberfläche ist die Verpackung, das Volumen der Inhalt.",
       "Oberfläche in cm², Volumen in cm³. Praktisch gedacht: Für Farbe brauchst du die Oberfläche, für Füllmenge das Volumen."],
      ["Ein Becken misst 10 m · 5 m · 2 m. Wie viele Liter fasst es?", "100 000 Liter.",
       "Das sind 100 m³, und 1 m³ entspricht 1000 Litern. Zum Vergleich: Eine Badewanne fasst etwa 150 Liter — dieses Becken also rund 660 Badewannen."],
      ["Warum passt in einen Würfel mit doppelter Kante 8-mal so viel?", "Weil das Volumen mit der dritten Potenz wächst.",
       "2 · 2 · 2 = 8. Genau darum werden große Tiere nicht einfach hochskaliert: Verdoppelt sich die Größe, verachtfacht sich das Gewicht, aber die Knochenquerschnitte vervierfachen sich nur. Deshalb sehen Elefantenbeine anders aus als Rehbeine."]
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Mathematik", name: "Proportionalität & Dreisatz", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was heißt direkt proportional?", "Doppelte Menge, doppelter Preis — der Quotient bleibt gleich.",
       "Bei 3 kg für 6 € kostet 1 kg immer 2 €, egal wie viel man kauft. Dieser gleichbleibende Wert je Einheit ist der Schlüssel zum Dreisatz."],
      ["Was heißt indirekt proportional?", "Doppelt so viele Arbeiter, halbe Zeit — das Produkt bleibt gleich.",
       "Die Arbeit ist ja dieselbe, sie verteilt sich nur auf mehr Schultern. Deshalb bleibt Arbeiter mal Tage konstant."],
      ["3 kg Äpfel kosten 6 €. Was kosten 5 kg?", "10 €.",
       "Erst auf 1 kg herunterrechnen (2 €), dann mal 5. Dieser Umweg über die Einheit heißt Dreisatz und funktioniert bei jeder direkt proportionalen Aufgabe."],
      ["4 Maler brauchen 6 Tage. Wie lange brauchen 3?", "8 Tage.",
       "Die Arbeit umfasst 24 Manntage (4 · 6), geteilt durch 3 Maler. Vorsicht im echten Leben: Ab einer gewissen Zahl behindern sich Leute gegenseitig — die Rechnung gilt nur im Idealfall."],
      ["Woran erkennst du direkte Proportionalität im Diagramm?", "An einer Geraden, die durch den Ursprung geht.",
       "Beides muss stimmen: gerade UND durch den Nullpunkt. Eine Gerade, die bei 5 startet, ist nicht proportional — etwa bei einem Taxi mit Grundgebühr."],
      ["Ist der Zusammenhang von Alter und Körpergröße proportional?", "Nein.",
       "Mit 20 ist niemand doppelt so groß wie mit 10. Gemeinsames Wachsen heißt nicht proportional — das ist der häufigste Denkfehler bei diesem Thema."],
      ["Maßstab 1 : 50 000 — 3 cm auf der Karte sind wie viel in echt?", "1,5 km.",
       "3 · 50 000 cm = 150 000 cm = 1,5 km. Merkhilfe: Bei 1 : 50 000 entspricht 1 cm genau 500 m, bei 1 : 25 000 sind es 250 m."],
      ["Ein Rezept ist für 4 Personen, du kochst für 6. Womit multiplizierst du?", "Mit 1,5.",
       "6 : 4 = 1,5, und damit wird jede Zutat multipliziert. Beim Kochen gilt das allerdings nicht für alles: Garzeiten und Gewürze skalieren nicht mit."],
      ["10 Kühe fressen einen Heuhaufen in 8 Tagen. Wie lange brauchen 20?", "4 Tage.",
       "Mehr Kühe, weniger Zeit — indirekt proportional. Das Produkt bleibt gleich: 10 · 8 = 20 · 4 = 80."],
      ["Was bleibt bei indirekter Proportionalität konstant?", "Das Produkt der beiden Größen.",
       "Zum Beispiel Arbeiter mal Tage oder Geschwindigkeit mal Fahrzeit. Bei direkter Proportionalität ist es dagegen der Quotient — daran lassen sich die beiden Fälle sicher unterscheiden."],
      ["Wie erkennst du beim Dreisatz, ob du mal oder geteilt rechnest?", "Überlege, ob das Ergebnis größer oder kleiner werden muss.",
       "Bei indirekter Proportionalität dreht sich die Rechnung um. Diese Überlegung dauert zwei Sekunden und verhindert den häufigsten Fehler — mechanisch angewandte Dreisätze gehen oft in die falsche Richtung."],
      ["Warum ist „je mehr, desto mehr“ noch keine Proportionalität?", "Proportional heißt: doppelt so viel führt zu exakt doppelt so viel.",
       "Sonst wächst es nur irgendwie mit. Ein Baum wird mit den Jahren größer, aber nicht proportional zum Alter — sonst wären hundertjährige Bäume zehnmal so hoch wie zehnjährige."]
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Mathematik", name: "Statistik & Diagramme lesen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist das arithmetische Mittel?", "Der Durchschnitt: alle Werte addieren, durch die Anzahl teilen.",
       "Es ist der Wert, den alle hätten, wenn man gleichmäßig verteilte. Genau deshalb ist es empfindlich gegen Ausreißer — ein einziger sehr hoher Wert zieht alle mit hoch."],
      ["Was ist der Median?", "Der Wert genau in der Mitte, wenn man alle der Größe nach ordnet.",
       "Bei gerader Anzahl nimmt man den Durchschnitt der beiden mittleren. Der Median sagt: Die eine Hälfte liegt darüber, die andere darunter."],
      ["Warum ist der Median oft aussagekräftiger als der Durchschnitt?", "Weil ein einzelner Ausreißer ihn kaum bewegt.",
       "Beispiel Einkommen: Sitzt in einem Raum mit zehn Leuten ein Milliardär, ist das Durchschnittseinkommen gewaltig — der Median bleibt bei dem, was die meisten verdienen. Deshalb wird bei Löhnen und Mieten meist der Median genannt."],
      ["Noten 1, 2, 2, 3, 5 — wie hoch ist der Mittelwert?", "2,6.",
       "Die Summe ist 13, geteilt durch 5 Werte. Die 5 zieht den Schnitt spürbar nach oben, obwohl sie nur einmal vorkommt."],
      ["Noten 1, 2, 2, 3, 5 — wie hoch ist der Median?", "2.",
       "Es ist der dritte von fünf geordneten Werten. Verglichen mit dem Mittelwert von 2,6 sieht man den Ausreißer-Effekt an einem einzigen Beispiel."],
      ["Was ist der Modus?", "Der Wert, der am häufigsten vorkommt.",
       "Er ist der einzige der drei Mittelwerte, der auch bei nicht-zahlenmäßigen Daten funktioniert: die häufigste Augenfarbe, das meistverkaufte Modell."],
      ["Was ist die Spannweite?", "Größter Wert minus kleinster Wert.",
       "Sie beschreibt, wie weit die Daten streuen — sagt aber nichts darüber, wie sie dazwischen verteilt sind. Zwei völlig verschiedene Datensätze können dieselbe Spannweite haben."],
      ["Wofür eignet sich ein Kreisdiagramm?", "Für Anteile an einem Ganzen.",
       "Alle Sektoren zusammen ergeben 100 %. Bei mehr als etwa fünf Teilen wird es unlesbar — und Größen vergleichen kann das Auge in Kreisen schlechter als in Balken."],
      ["Wofür eignet sich ein Liniendiagramm?", "Für Entwicklungen über die Zeit.",
       "Die Linie zwischen zwei Punkten behauptet dabei etwas: dass sich der Wert dazwischen gleichmäßig geändert hat. Bei monatlichen Messungen stimmt das oft nicht genau."],
      ["Wie kann ein Diagramm täuschen, ohne zu lügen?", "Wenn die senkrechte Achse nicht bei null beginnt.",
       "Dann wirken winzige Unterschiede riesig. Alle Zahlen können stimmen und das Bild trotzdem in die Irre führen. Deshalb: bei jedem Diagramm zuerst auf die Achsenbeschriftung schauen."],
      ["Was ist eine relative Häufigkeit?", "Ein Anteil statt einer Anzahl.",
       "5 von 20 sind 0,25, also 25 %. Erst der Anteil macht Gruppen vergleichbar: 30 Fälle in einer Kleinstadt bedeuten etwas ganz anderes als 30 Fälle in Wien."],
      ["Warum sagt „durchschnittlich 1,5 Kinder“ nichts über eine echte Familie?", "Der Durchschnitt ist eine Rechengröße, keine Beschreibung.",
       "Es gibt keine Familie mit einem halben Kind. Der Wert beschreibt die Gesamtheit, nicht den Einzelfall — dieser Unterschied wird in Zeitungen ständig verwischt."]
    ]),
  },
  /* --- Physik: Alltagsbeobachtung zuerst, Formel danach. --- */
  {
    category: "Unterstufe 3", subject: "Physik", name: "Strom, Spannung & Widerstand", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was fließt in einem Stromkreis eigentlich?", "Elektronen.",
       "Sie sind schon im Draht vorhanden und werden von der Quelle nur in Bewegung gesetzt. Die Batterie liefert also keine Elektronen, sondern den Antrieb — wie eine Pumpe, die vorhandenes Wasser bewegt."],
      ["Warum leuchtet eine Lampe sofort, obwohl Elektronen langsam sind?", "Weil sich der Anstoß fast mit Lichtgeschwindigkeit fortpflanzt.",
       "Die einzelnen Elektronen kriechen mit weniger als einem Millimeter pro Sekunde. Wie bei einer vollen Wasserleitung: Man dreht auf, und es spritzt sofort — nicht weil das Wasser so schnell ist, sondern weil das Rohr schon voll war."],
      ["Was beschreibt die Spannung U?", "Den Antrieb, gemessen in Volt.",
       "Bildlich der Höhenunterschied, der Wasser fließen lässt. Spannung liegt an, auch wenn nichts fließt — eine Batterie im Schrank hat 1,5 V, obwohl kein Strom fließt."],
      ["Was beschreibt die Stromstärke I?", "Wie viel Ladung pro Sekunde fließt, gemessen in Ampere.",
       "Bildlich die Wassermenge pro Sekunde. Für den Menschen gefährlich wird es ab etwa 30 Milliampere — das ist erstaunlich wenig, ein Föhn zieht das Vierzigfache."],
      ["Was beschreibt der Widerstand R?", "Wie stark das Material den Strom bremst, gemessen in Ohm.",
       "Bildlich ein enges Rohr. Bei den meisten Metallen steigt der Widerstand mit der Temperatur — ein heißer Draht leitet also schlechter als ein kalter."],
      ["Wie lautet das ohmsche Gesetz?", "U = R · I.",
       "Mehr Spannung treibt mehr Strom, mehr Widerstand bremst ihn. Aus dieser einen Formel lassen sich alle drei Größen bestimmen, wenn man zwei kennt."],
      ["12 V liegen an 4 Ω an. Wie groß ist die Stromstärke?", "3 A.",
       "I = U : R = 12 : 4. Zur Probe rückwärts einsetzen: 4 · 3 = 12 V, es geht auf."],
      ["Was ist der Unterschied zwischen Reihen- und Parallelschaltung?", "In Reihe fließt derselbe Strom, parallel liegt dieselbe Spannung an.",
       "In Reihe teilt sich die Spannung auf die Bauteile auf, parallel teilt sich der Strom. Das erklärt fast alles, was Schaltungen im Alltag betrifft."],
      ["Warum gehen bei einer alten Lichterkette alle Lampen aus, wenn eine kaputt ist?", "Sie sind in Reihe geschaltet.",
       "Ein Defekt unterbricht den einzigen Weg für den Strom. Moderne Ketten sind deshalb parallel verdrahtet oder haben Überbrückungen in jeder Fassung."],
      ["Warum sind Steckdosen im Haus parallel geschaltet?", "Damit an jedem Gerät die vollen 230 V anliegen.",
       "Und damit man ein Gerät abschalten kann, ohne die anderen zu stören. In Reihe müssten sich alle Geräte die Spannung teilen — der Föhn liefe nur, wenn auch die Lampe an ist."],
      ["Wozu dient eine Sicherung?", "Sie unterbricht den Kreis, wenn zu viel Strom fließt.",
       "Sonst würden die Leitungen in der Wand heiß und könnten einen Brand auslösen. Die Sicherung schützt also nicht das Gerät, sondern das Haus."],
      ["Warum ist ein Kurzschluss gefährlich?", "Der Strom nimmt einen Weg fast ohne Widerstand.",
       "Nach U = R · I schießt die Stromstärke hoch, wenn R gegen null geht. Die Leitung erhitzt sich schlagartig — genau davor schützt die Sicherung."],
      ["Was ist elektrische Leistung?", "P = U · I, gemessen in Watt.",
       "Sie sagt, wie viel Energie pro Sekunde umgesetzt wird. Auf der Stromrechnung stehen dagegen Kilowattstunden — das ist Leistung mal Zeit, also die Energiemenge."],
      ["Warum sind Leiter aus Metall und Isolatoren aus Kunststoff?", "In Metallen sind Elektronen frei beweglich, in Kunststoffen fest gebunden.",
       "Metalle geben ihre äußeren Elektronen gewissermaßen an die Allgemeinheit ab — dieses Elektronengas macht sie leitfähig und nebenbei auch glänzend und verformbar."]
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Physik", name: "Magnetismus & Elektromagnetismus", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Welche Pole hat jeder Magnet?", "Immer einen Nord- und einen Südpol.",
       "Einen einzelnen Pol hat noch nie jemand gefunden. Bei elektrischer Ladung gibt es Plus und Minus getrennt — beim Magnetismus geht das nicht, und niemand weiß genau, warum."],
      ["Was passiert, wenn du einen Stabmagneten in der Mitte zerbrichst?", "Du bekommst zwei vollständige Magnete mit je zwei Polen.",
       "Nicht einen Nord- und einen Südteil. Das lässt sich beliebig fortsetzen: Auch das kleinste Bruchstück hat wieder beide Pole."],
      ["Welche Pole ziehen sich an?", "Ungleiche ziehen sich an, gleiche stoßen sich ab.",
       "Dieselbe Regel wie bei elektrischen Ladungen. Deshalb springen zwei Magnete auseinander, wenn man sie falsch herum zusammenschiebt."],
      ["Welche Stoffe sind magnetisch?", "Eisen, Nickel und Kobalt.",
       "Aluminium und Kupfer zum Beispiel nicht — deshalb bleibt ein Magnet an einer Konservendose haften, an einer Getränkedose aber nicht. Damit lässt sich Müll sortieren."],
      ["Wo zeigt die Nordnadel des Kompasses hin?", "Zum geografischen Nordpol.",
       "Dort liegt physikalisch ein magnetischer Südpol — sonst würde sich die Nadel ja abstoßen. Die Bezeichnung stammt aus der Zeit vor dem Verständnis der Ursache und wurde nie korrigiert."],
      ["Was entsteht rund um einen stromdurchflossenen Draht?", "Ein Magnetfeld.",
       "Strom und Magnetismus gehören untrennbar zusammen. Ørsted entdeckte das 1820 zufällig, als sich eine Kompassnadel neben einem Draht bewegte — eine der folgenreichsten Beobachtungen der Physik."],
      ["Wie verstärkt man einen Elektromagneten?", "Mehr Windungen, mehr Stromstärke, Eisenkern in der Spule.",
       "Der Eisenkern bringt am meisten: Er verstärkt das Feld um ein Vielfaches, weil sich seine eigenen Elementarmagnete ausrichten."],
      ["Was ist der große Vorteil eines Elektromagneten?", "Man kann ihn ein- und ausschalten und seine Stärke regeln.",
       "Ein Dauermagnet ist immer an. Deshalb steckt in fast jedem Gerät ein Elektromagnet — und deshalb kann ein Schrottkran ein Auto anheben und wieder fallen lassen."],
      ["Wo steckt im Alltag ein Elektromagnet?", "In Türklingel, Lautsprecher, Elektromotor und Festplatte.",
       "Im Lautsprecher bewegt er eine Membran im Takt des Stroms — Musik ist also nichts anderes als schnell wechselnder Magnetismus, der Luft in Schwingung versetzt."],
      ["Was ist ein Magnetfeld?", "Der Raum um einen Magneten, in dem seine Kraft wirkt.",
       "Feldlinien laufen außen von Nord nach Süd. Sichtbar machen kann man sie mit Eisenspänen auf einem Blatt Papier — sie ordnen sich genau entlang der Linien."],
      ["Warum schützt uns das Erdmagnetfeld?", "Es lenkt geladene Teilchen der Sonne ab.",
       "Ohne diesen Schutz würde der Sonnenwind die Atmosphäre nach und nach abtragen — das ist vermutlich dem Mars passiert. Sichtbar wird die Ablenkung als Polarlicht."],
      ["Wie funktioniert ein Elektromotor im Kern?", "Ein Magnetfeld stößt und zieht eine stromdurchflossene Spule, die sich dadurch dreht.",
       "Damit sie sich weiterdreht, muss die Stromrichtung im richtigen Moment umgeklappt werden — dafür sorgt der Kommutator. Andersherum betrieben wird derselbe Aufbau zum Generator."]
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Physik", name: "Wärme, Energie & Aggregatzustände", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist Temperatur im Teilchenmodell?", "Ein Maß dafür, wie schnell sich die Teilchen bewegen.",
       "Heiß heißt schnell. Am absoluten Nullpunkt bei −273,15 °C stünde die Bewegung still — deshalb gibt es keine tiefere Temperatur. Nach oben gibt es dagegen keine Grenze."],
      ["Was ist der Unterschied zwischen Wärme und Temperatur?", "Temperatur ist ein Zustand, Wärme ist übertragene Energie.",
       "Eine Badewanne mit 40 °C enthält viel mehr Wärme als eine Tasse mit 40 °C — gleiche Temperatur, ganz andere Energiemenge. Deshalb kann ein Funke sehr heiß sein und trotzdem nicht wehtun."],
      ["Warum dehnen sich Stoffe beim Erwärmen aus?", "Die Teilchen bewegen sich heftiger und brauchen mehr Platz.",
       "Sie werden nicht größer — sie schwingen weiter aus. Genau darauf beruht das Thermometer: Die Flüssigkeit dehnt sich aus und steigt in der engen Röhre sichtbar hoch."],
      ["Warum haben Brücken Dehnungsfugen?", "Damit sich das Material im Sommer ausdehnen kann, ohne dass etwas reißt.",
       "Eine Stahlbrücke von 100 Metern wird zwischen Winter und Sommer um mehrere Zentimeter länger. Ohne Fuge entstünden Kräfte, die Beton sprengen."],
      ["Nenne die drei Arten des Wärmetransports.", "Leitung, Konvektion und Strahlung.",
       "Leitung braucht Material, Konvektion braucht ein strömendes Medium, Strahlung braucht gar nichts — nur so kommt die Sonnenwärme durch das leere Weltall zu uns."],
      ["Warum wärmt eine Thermoskanne so gut?", "Sie unterbindet alle drei Transportwege.",
       "Das Vakuum verhindert Leitung und Konvektion, die verspiegelte Wand wirft die Strahlung zurück. Deshalb hält sie auch Kaltes kalt — sie dämmt in beide Richtungen."],
      ["Was passiert beim Schmelzen im Teilchenmodell?", "Die Teilchen lösen sich aus ihren festen Plätzen und gleiten aneinander vorbei.",
       "Sie bleiben dabei in Kontakt — deshalb hat eine Flüssigkeit noch ein festes Volumen, aber keine feste Form mehr. Beim Verdampfen lösen sie sich ganz voneinander."],
      ["Warum bleibt Eiswasser bei 0 °C, obwohl man weiter heizt?", "Die Energie wird zum Schmelzen gebraucht, nicht zum Erwärmen.",
       "Erst wenn das letzte Eis geschmolzen ist, steigt die Temperatur weiter. Diese verborgene Energie heißt Schmelzwärme — und sie ist der Grund, warum Eiswürfel ein Getränk so wirksam kühlen."],
      ["Warum ist Wasser als Kühlmittel so gut?", "Es nimmt sehr viel Energie auf, bevor seine Temperatur merklich steigt.",
       "Wasser hat eine der höchsten Wärmekapazitäten überhaupt. Deshalb kühlt es Motoren, deshalb bleibt das Klima an Küsten mild, und deshalb schwitzen wir Wasser aus, um uns abzukühlen."],
      ["Was besagt die Energieerhaltung?", "Energie geht nie verloren, sie wird nur umgewandelt.",
       "Meistens landet sie am Ende als Wärme, die sich verteilt und kaum noch nutzbar ist. Deshalb ist ein Perpetuum mobile unmöglich: Es gibt keine Energie aus dem Nichts, und die brauchbare Energie wird bei jedem Schritt weniger."],
      ["Warum ist die Anomalie des Wassers lebenswichtig?", "Wasser ist bei 4 °C am dichtesten, deshalb schwimmt Eis oben.",
       "Fast alle Stoffe werden beim Erstarren dichter und sinken. Wasser nicht — sonst würden Seen vom Grund her zufrieren und im Sommer nicht mehr auftauen. Fische überleben den Winter nur dank dieser Ausnahme."],
      ["Warum fühlt sich Metall kälter an als Holz bei gleicher Temperatur?", "Metall leitet die Wärme schneller von der Hand weg.",
       "Gemessen sind beide gleich warm. Unsere Haut misst keine Temperatur, sondern den Wärmestrom — deshalb ist unser Temperatursinn als Messgerät unbrauchbar."]
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Chemie", name: "Teilchenmodell & Stoffe", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Woraus bestehen alle Stoffe?", "Aus winzigen Teilchen, die ständig in Bewegung sind."],
      ["Wie ordnen sich Teilchen in fest, flüssig und gasförmig?", "Fest: dicht und auf festen Plätzen. Flüssig: dicht, aber beweglich. Gasförmig: weit auseinander und schnell."],
      ["Was ist ein Reinstoff?", "Ein Stoff aus nur einer Teilchensorte, zum Beispiel destilliertes Wasser oder Kupfer."],
      ["Was ist ein Gemisch?", "Mehrere Stoffe nebeneinander, zum Beispiel Luft, Salzwasser oder Granit."],
      ["Wie trennt man Salz von Wasser?", "Durch Eindampfen. Das Wasser verdunstet, das Salz bleibt zurück."],
      ["Wie trennt man Sand von Wasser?", "Durch Filtrieren — die Sandkörner sind zu groß für den Filter."],
      ["Was ist der Unterschied zwischen physikalischer und chemischer Änderung?", "Physikalisch ändert sich nur die Form oder der Zustand. Chemisch entsteht ein neuer Stoff mit neuen Eigenschaften."],
      ["Ist Kerzenwachs schmelzen physikalisch oder chemisch?", "Physikalisch — es bleibt Wachs. Das Verbrennen der Flamme dagegen ist chemisch."],
      ["Was ist ein Atom?", "Der kleinste Baustein eines chemischen Elements."],
      ["Woraus besteht ein Wassermolekül?", "Aus zwei Wasserstoffatomen und einem Sauerstoffatom, kurz H₂O."],
      ["Warum riecht man Parfum quer durch den Raum?", "Weil die Teilchen sich von selbst verteilen. Das nennt man Diffusion."],
      ["Was passiert bei einer Verbrennung grundsätzlich?", "Ein Stoff reagiert mit Sauerstoff, dabei wird Energie frei und es entstehen neue Stoffe."],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Informatik & Medien", name: "Wie Computer denken", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Warum rechnen Computer mit Nullen und Einsen?", "Weil sich zwei Zustände technisch sicher unterscheiden lassen: Strom fließt oder eben nicht."],
      ["Welche Dezimalzahl ist binär 1011?", "11. Denn 8 + 0 + 2 + 1, die Stellen stehen für 8, 4, 2, 1."],
      ["Wie schreibt man 20 binär?", "10100, also 16 + 4."],
      ["Wie viele Werte kann ein Byte annehmen?", "256 — acht Bits mit je zwei Möglichkeiten, also 2 hoch 8."],
      ["Was ist ein Algorithmus?", "Eine eindeutige Schritt-für-Schritt-Anleitung, die zu einem Ergebnis führt. Ein Kochrezept ist einer."],
      ["Was ist eine Schleife?", "Eine Anweisung, die wiederholt wird, solange eine Bedingung gilt."],
      ["Was ist eine Variable?", "Ein benannter Platz im Speicher, in dem ein Wert liegt, der sich ändern kann."],
      ["Warum finden Computer in sortierten Listen so schnell?", "Sie halbieren den Suchbereich immer wieder. Bei einer Million Einträgen reichen rund 20 Schritte."],
      ["Was passiert technisch, wenn du eine Website aufrufst?", "Dein Gerät fragt einen Server nach Daten, der schickt sie in Paketen zurück, der Browser setzt daraus die Seite zusammen."],
      ["Was ist eine IP-Adresse?", "Die Hausnummer eines Geräts im Netz, damit Datenpakete den Weg zurückfinden."],
      ["Warum sind persönliche Daten wertvoll?", "Weil sich damit Verhalten vorhersagen und Werbung verkaufen lässt. Was einmal draußen ist, holt man nicht zurück."],
      ["Was macht ein Passwort sicher?", "Länge vor Kompliziertheit. Ein langer Satz schlägt ein kurzes Zeichenwirrwarr — und für jeden Dienst ein eigenes."],
    ]),
  },
  /* --- Biologie: Bau und Funktion immer zusammen denken. --- */
  {
    category: "Unterstufe 3", subject: "Biologie", name: "Verdauung & Ernährung", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wozu dient die Verdauung überhaupt?", "Sie zerlegt große Nahrungsbausteine so weit, dass sie ins Blut aufgenommen werden können."],
      ["Wo beginnt die Verdauung?", "Im Mund. Zähne zerkleinern mechanisch, der Speichel spaltet bereits Stärke."],
      ["Warum schmeckt lange gekautes Brot süß?", "Ein Enzym im Speichel zerlegt Stärke in Zucker — man schmeckt die Verdauung förmlich."],
      ["Was passiert im Magen?", "Salzsäure tötet Keime und der Nahrungsbrei wird durchmischt. Erste Eiweiße werden gespalten."],
      ["Warum verdaut sich der Magen nicht selbst?", "Eine dicke Schleimschicht schützt die Magenwand vor der eigenen Säure."],
      ["Wo wird das meiste aufgenommen?", "Im Dünndarm. Zotten und Mikrozotten vergrößern die Oberfläche auf die Größe einer Wohnung."],
      ["Warum ist die Oberfläche im Darm so wichtig?", "Je größer die Fläche, desto mehr Nährstoffe können gleichzeitig ins Blut übertreten."],
      ["Welche Aufgabe hat der Dickdarm?", "Er entzieht dem Rest Wasser und Salze. Übrig bleibt der eingedickte Stuhl."],
      ["Was macht die Leber im Stoffwechsel?", "Sie ist das chemische Zentrallabor: speichert Zucker, baut Giftstoffe ab und produziert Gallenflüssigkeit."],
      ["Wofür braucht der Körper Kohlenhydrate, Fette, Eiweiße?", "Kohlenhydrate als schnellen Treibstoff, Fette als Energiespeicher und Zellbaustoff, Eiweiße als Baumaterial."],
      ["Warum sind Ballaststoffe wichtig, obwohl sie nicht verdaut werden?", "Sie halten den Darm in Bewegung und machen lange satt."],
      ["Warum sind Vitamine lebensnotwendig?", "Sie steuern Vorgänge im Körper und können meist nicht selbst hergestellt werden."],
      ["Was ist der Unterschied zwischen Hunger und Appetit?", "Hunger ist ein körperliches Signal bei Energiemangel, Appetit ist Lust auf etwas Bestimmtes."],
      ["Warum sind Darmbakterien nützlich?", "Sie zerlegen Reste, bilden Vitamine und halten Krankheitserreger in Schach."],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Biologie", name: "Atmung & Blutkreislauf", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wozu atmen wir?", "Um Sauerstoff aufzunehmen, mit dem die Zellen Nährstoffe verbrennen, und um Kohlendioxid loszuwerden."],
      ["Wo findet der Gasaustausch statt?", "In den Lungenbläschen. Ihre Wand ist so dünn, dass Gase direkt ins Blut übertreten."],
      ["Wie groß ist die Austauschfläche der Lunge?", "Rund 100 Quadratmeter — etwa eine große Wohnung, zusammengefaltet in den Brustkorb."],
      ["Wie kommt die Luft überhaupt in die Lunge?", "Das Zwerchfell senkt sich, der Brustraum wird größer, der Unterdruck saugt Luft an."],
      ["Warum ist Nasenatmung besser als Mundatmung?", "Die Nase filtert, wärmt und befeuchtet die Luft."],
      ["Welche Aufgabe haben die roten Blutkörperchen?", "Sie transportieren Sauerstoff, gebunden an den roten Farbstoff Hämoglobin."],
      ["Welche Aufgabe haben die weißen Blutkörperchen?", "Sie sind die Abwehr und bekämpfen Krankheitserreger."],
      ["Wozu dienen Blutplättchen?", "Sie lassen das Blut an Wunden gerinnen."],
      ["Was ist der Unterschied zwischen Arterie und Vene?", "Arterien führen vom Herzen weg und haben dicke Wände, Venen führen zum Herzen hin und besitzen Klappen."],
      ["Warum braucht das Blut in den Beinvenen Klappen?", "Weil es gegen die Schwerkraft nach oben muss. Die Klappen verhindern das Zurücksacken."],
      ["Was ist der kleine Kreislauf?", "Der Lungenkreislauf: vom Herzen zur Lunge und mit Sauerstoff beladen zurück."],
      ["Wie viele Kammern hat das menschliche Herz?", "Vier: zwei Vorhöfe und zwei Kammern."],
      ["Warum ist Ausdauersport gut fürs Herz?", "Das Herz wird kräftiger und pumpt pro Schlag mehr Blut. Der Ruhepuls sinkt."],
      ["Was macht Rauchen mit der Lunge?", "Es lähmt die Flimmerhärchen, zerstört Lungenbläschen und verkleinert die Austauschfläche dauerhaft."],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Biologie", name: "Nerven, Sinne & Immunsystem", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Welche Aufgabe hat das Nervensystem?", "Es nimmt Reize auf, verarbeitet sie und steuert die Reaktion des Körpers."],
      ["Was ist ein Reflex?", "Eine blitzschnelle Reaktion, die im Rückenmark verschaltet wird, ohne den Umweg übers Gehirn."],
      ["Warum ist der Reflex so schnell?", "Weil der Weg kurz ist — der Denkapparat wird schlicht übersprungen."],
      ["Wie entsteht ein Bild im Auge?", "Die Linse bündelt Licht auf die Netzhaut, dort wandeln Sinneszellen es in Nervensignale um."],
      ["Warum sehen wir in der Dämmerung kaum Farben?", "Für Farben sind die Zapfen zuständig, die viel Licht brauchen. Im Dunkeln arbeiten nur die lichtempfindlichen Stäbchen."],
      ["Wie funktioniert Hören?", "Schall bringt das Trommelfell zum Schwingen, die Gehörknöchelchen verstärken, im Innenohr entstehen Nervensignale."],
      ["Warum ist laute Musik über Kopfhörer riskant?", "Zerstörte Sinneszellen im Innenohr wachsen nicht nach. Der Hörverlust bleibt."],
      ["Was ist ein Krankheitserreger?", "Ein Bakterium, Virus oder Pilz, der im Körper Schaden anrichtet."],
      ["Was ist der Unterschied zwischen Bakterien und Viren?", "Bakterien sind selbstständige Lebewesen, Viren brauchen fremde Zellen zur Vermehrung."],
      ["Warum helfen Antibiotika nicht gegen Grippe?", "Antibiotika wirken gegen Bakterien. Grippe wird von Viren verursacht."],
      ["Wie funktioniert eine Impfung?", "Der Körper übt an einem harmlosen Teil des Erregers und legt Gedächtniszellen an. Im Ernstfall ist die Abwehr sofort da."],
      ["Warum ist Fieber sinnvoll?", "Höhere Temperatur bremst Erreger und beschleunigt die Abwehr. Nur sehr hohes Fieber wird gefährlich."],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Biologie", name: "Ökologie & Stoffkreisläufe", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist ein Ökosystem?", "Ein Lebensraum samt aller Lebewesen darin und ihren Wechselwirkungen."],
      ["Was sind Produzenten?", "Pflanzen. Sie bauen mit Licht aus Wasser und CO₂ energiereiche Stoffe auf."],
      ["Was sind Konsumenten?", "Tiere, die sich von anderen Lebewesen ernähren, weil sie selbst nichts aufbauen können."],
      ["Was sind Destruenten und warum sind sie unverzichtbar?", "Bakterien und Pilze zersetzen Totes zu Mineralstoffen. Ohne sie wäre der Kreislauf unterbrochen."],
      ["Wie lautet die Fotosynthese in Worten?", "Kohlendioxid und Wasser werden mit Lichtenergie zu Traubenzucker und Sauerstoff."],
      ["Warum ist die Fotosynthese die Grundlage fast allen Lebens?", "Sie bindet Sonnenenergie in Nahrung und liefert nebenbei den Sauerstoff zum Atmen."],
      ["Was ist eine Nahrungskette?", "Die Reihe, wer wen frisst — von der Pflanze über den Pflanzenfresser zum Fleischfresser."],
      ["Warum wird eine Nahrungskette nach oben hin schmaler?", "Bei jedem Schritt geht der Großteil der Energie als Wärme verloren. Nur ein Bruchteil landet in der nächsten Stufe."],
      ["Was ist ein Nahrungsnetz?", "Die realistische Verknüpfung vieler Nahrungsketten, weil die meisten Tiere mehreres fressen."],
      ["Was passiert, wenn ein Glied wegfällt?", "Das Netz gerät aus dem Gleichgewicht: manche Arten vermehren sich stark, andere verschwinden."],
      ["Was ist der Treibhauseffekt?", "Gase in der Atmosphäre halten Wärmestrahlung zurück. Ohne ihn wäre die Erde eisig, zu viel davon heizt sie auf."],
      ["Warum ist Artenvielfalt wichtig?", "Je mehr Arten, desto stabiler das System. Fällt eine aus, können andere die Rolle übernehmen."],
    ]),
  },
  /* --- Geographie & Wirtschaftskunde --- */
  {
    category: "Unterstufe 3", subject: "Geographie & Wirtschaft", name: "Europa: Länder, Hauptstädte, Gewässer", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Hauptstadt von Frankreich?", "Paris."], ["Hauptstadt von Italien?", "Rom."],
      ["Hauptstadt von Spanien?", "Madrid."], ["Hauptstadt von Polen?", "Warschau."],
      ["Hauptstadt von Schweden?", "Stockholm."], ["Hauptstadt von Griechenland?", "Athen."],
      ["Hauptstadt von Portugal?", "Lissabon."], ["Hauptstadt von Ungarn?", "Budapest."],
      ["Hauptstadt der Niederlande?", "Amsterdam — Regierungssitz ist allerdings Den Haag."],
      ["Welche Länder grenzen an Österreich?", "Acht: Deutschland, Tschechien, Slowakei, Ungarn, Slowenien, Italien, Schweiz, Liechtenstein."],
      ["Welcher Fluss fließt durch Wien, Budapest und Belgrad?", "Die Donau — der zweitlängste Fluss Europas."],
      ["In welches Meer mündet die Donau?", "Ins Schwarze Meer."],
      ["Welches Gebirge trennt Spanien von Frankreich?", "Die Pyrenäen."],
      ["Welcher Berg ist der höchste der Alpen?", "Der Mont Blanc mit rund 4808 Metern."],
      ["Welcher ist der höchste Berg Österreichs?", "Der Großglockner mit 3798 Metern."],
      ["Welches Meer liegt zwischen Italien und Griechenland?", "Das Adriatische und weiter südlich das Ionische Meer."],
      ["Was ist die Europäische Union in einem Satz?", "Ein Zusammenschluss von 27 Staaten mit gemeinsamem Binnenmarkt und teils gemeinsamer Währung."],
      ["Was bedeutet der Schengen-Raum?", "Reisen zwischen den Mitgliedsstaaten ohne Grenzkontrollen."],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Geographie & Wirtschaft", name: "Klima, Zonen & Wirtschaft", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist der Unterschied zwischen Wetter und Klima?", "Wetter ist der Zustand jetzt, Klima der Durchschnitt über Jahrzehnte."],
      ["Warum ist es am Äquator wärmer als an den Polen?", "Die Sonne steht dort steil, ihre Energie verteilt sich auf eine kleinere Fläche."],
      ["Welche Klimazonen gibt es grob von Süd nach Nord?", "Tropisch, subtropisch, gemäßigt, kalt beziehungsweise polar."],
      ["In welcher Klimazone liegt Mitteleuropa?", "In der gemäßigten Zone mit vier ausgeprägten Jahreszeiten."],
      ["Warum ist es in Irland milder als in Moskau, obwohl beide gleich weit nördlich liegen?", "Der Golfstrom bringt warmes Wasser nach Westeuropa."],
      ["Wie verändert sich das Klima mit der Höhe?", "Pro 100 Höhenmeter sinkt die Temperatur um etwa 0,6 Grad."],
      ["Was ist die Baumgrenze?", "Die Höhe, oberhalb derer es für Bäume zu kalt und zu windig ist."],
      ["Was versteht man unter den drei Wirtschaftssektoren?", "Primär: Rohstoffe gewinnen. Sekundär: verarbeiten. Tertiär: Dienstleistungen."],
      ["In welchem Sektor arbeiten die meisten Menschen in Österreich?", "Im tertiären Sektor, also bei Dienstleistungen."],
      ["Was ist ein Ballungsraum?", "Ein Gebiet mit sehr hoher Bevölkerungsdichte rund um eine große Stadt."],
      ["Was bedeutet Globalisierung?", "Waren, Geld, Menschen und Informationen bewegen sich weltweit — Länder werden voneinander abhängig."],
      ["Warum ist der Tourismus für Österreich so wichtig?", "Alpen und Kulturstädte bringen Einkommen und Arbeitsplätze, besonders in ländlichen Regionen."],
    ]),
  },
  /* --- Geschichte & Politische Bildung --- */
  {
    category: "Unterstufe 3", subject: "Geschichte & Politik", name: "Entdeckungen & frühe Neuzeit", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was erfand Johannes Gutenberg um 1450?", "Den Buchdruck mit beweglichen Lettern — Wissen wurde erstmals massenhaft verbreitbar."],
      ["Warum war der Buchdruck so folgenreich?", "Bücher wurden billig, immer mehr Menschen lernten lesen, neue Ideen verbreiteten sich rasend schnell."],
      ["Wer erreichte 1492 Amerika?", "Christoph Kolumbus — er suchte den Seeweg nach Indien."],
      ["Warum suchten Europäer neue Seewege?", "Der Landweg nach Asien war teuer und blockiert. Gewürze, Seide und Gold lockten."],
      ["Was bedeutet Kolonialismus?", "Europäische Staaten eroberten fremde Gebiete, beuteten sie aus und unterwarfen die Bevölkerung."],
      ["Was war der Kolumbianische Austausch?", "Pflanzen, Tiere und Krankheiten wanderten zwischen den Kontinenten. Kartoffel und Mais kamen nach Europa, Seuchen nach Amerika."],
      ["Was ist die Renaissance?", "Die Wiedergeburt antiker Ideen ab dem 15. Jahrhundert — der Mensch rückt ins Zentrum von Kunst und Wissenschaft."],
      ["Wofür steht Leonardo da Vinci?", "Für das Ideal des Universalgelehrten: Maler, Anatom, Ingenieur in einer Person."],
      ["Was löste Martin Luther 1517 aus?", "Die Reformation. Seine Kritik am Ablasshandel spaltete die Kirche."],
      ["Was war der Ablasshandel?", "Der Verkauf von Sündenerlass gegen Geld — für Luther unvereinbar mit dem Glauben."],
      ["Was änderte Kopernikus am Weltbild?", "Nicht die Erde, sondern die Sonne steht im Mittelpunkt. Das erschütterte die Stellung des Menschen im Kosmos."],
      ["Was war der Dreißigjährige Krieg?", "Ein Religions- und Machtkrieg 1618 bis 1648, der Mitteleuropa verwüstete und die Bevölkerung stellenweise halbierte."],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Geschichte & Politik", name: "Absolutismus, Aufklärung & Revolution", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist Absolutismus?", "Ein König herrscht unbeschränkt und begründet seine Macht mit Gottes Willen."],
      ["Wer sagte „Der Staat bin ich“?", "Ludwig XIV. von Frankreich, der Sonnenkönig."],
      ["Was ist die zentrale Idee der Aufklärung?", "Der Mensch soll seinen eigenen Verstand gebrauchen statt blind zu gehorchen."],
      ["Was forderte Montesquieu?", "Die Gewaltenteilung: Gesetzgebung, Regierung und Gerichte müssen getrennt sein."],
      ["Welche Reformen brachte Maria Theresia?", "Unter anderem die Schulpflicht ab 1774 und eine geordnete Verwaltung."],
      ["Was tat Joseph II.?", "Er schaffte die Leibeigenschaft ab und erließ das Toleranzpatent für andere Konfessionen."],
      ["Wann begann die Französische Revolution?", "1789 mit dem Sturm auf die Bastille am 14. Juli."],
      ["Welche drei Forderungen prägten die Revolution?", "Freiheit, Gleichheit, Brüderlichkeit."],
      ["Was waren die drei Stände vor der Revolution?", "Klerus, Adel und der dritte Stand — letzterer stellte über 90 Prozent und zahlte fast alle Steuern."],
      ["Warum kam es zur Revolution?", "Hunger, Staatsbankrott und die Ungerechtigkeit der Ständeordnung trafen auf die Ideen der Aufklärung."],
      ["Was ist die Erklärung der Menschen- und Bürgerrechte?", "Ein Dokument von 1789: Menschen sind frei und gleich an Rechten geboren."],
      ["Wer war Napoleon Bonaparte?", "Ein General, der sich 1804 zum Kaiser krönte, halb Europa eroberte und dabei den Code Civil verbreitete."],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Geschichte & Politik", name: "Industrialisierung & Demokratie heute", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was war die Industrielle Revolution?", "Der Übergang von Handarbeit zu Maschinenarbeit ab etwa 1760 in England."],
      ["Welche Erfindung war der Auslöser?", "Die Dampfmaschine — erstmals stand Energie unabhängig von Wind, Wasser und Muskelkraft bereit."],
      ["Wie veränderte die Eisenbahn das Leben?", "Waren und Menschen wurden schnell und billig transportiert. Entfernungen schrumpften gefühlt."],
      ["Was war die soziale Frage?", "Fabrikarbeit brachte Elend: 14-Stunden-Tage, Kinderarbeit, Wohnungsnot, keine Absicherung."],
      ["Wie reagierten die Arbeiter darauf?", "Sie gründeten Gewerkschaften und Parteien und erkämpften Arbeitszeitgrenzen und Versicherungen."],
      ["Was ist Urbanisierung?", "Die starke Wanderung vom Land in die Städte, weil dort Arbeit in den Fabriken lockte."],
      ["Was bedeutet Demokratie wörtlich?", "Herrschaft des Volkes, aus dem Griechischen."],
      ["Was heißt Gewaltenteilung konkret in Österreich?", "Parlament macht Gesetze, Regierung führt sie aus, unabhängige Gerichte sprechen Recht."],
      ["Wer wird bei der Nationalratswahl gewählt?", "Die Abgeordneten des Nationalrats, also das Parlament."],
      ["Ab welchem Alter darf man in Österreich wählen?", "Ab 16 Jahren — das ist im europäischen Vergleich früh."],
      ["Was steht in einer Verfassung?", "Die Grundregeln des Staates und die Grundrechte, die niemand einfach ändern darf."],
      ["Warum sind freie Medien für Demokratie wichtig?", "Sie kontrollieren die Mächtigen und ermöglichen Meinungsbildung aus mehreren Quellen."],
    ]),
  },
  /* --- Deutsch --- */
  {
    category: "Unterstufe 3", subject: "Deutsch", name: "Grammatik: Fälle, Zeiten, Satzglieder", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wie heißen die vier Fälle mit Fragewort?", "Nominativ (wer/was), Genitiv (wessen), Dativ (wem), Akkusativ (wen/was)."],
      ["In welchem Fall steht „dem Kind“?", "Im Dativ — Frage: wem?"],
      ["Wie findest du das Subjekt im Satz?", "Frage „Wer oder was tut etwas?“ — die Antwort ist das Subjekt."],
      ["Was ist ein Prädikat?", "Der Satzkern aus Verbformen. Er sagt, was geschieht."],
      ["Wie unterscheidest du Dativ- und Akkusativobjekt?", "Dativ antwortet auf „wem?“, Akkusativ auf „wen oder was?“."],
      ["Bilde das Perfekt von „gehen“ (ich).", "Ich bin gegangen — mit „sein“, weil es eine Ortsveränderung ist."],
      ["Wann nimmt man „haben“, wann „sein“ im Perfekt?", "„Sein“ bei Bewegung und Zustandswechsel (ich bin gelaufen), sonst „haben“."],
      ["Was drückt das Plusquamperfekt aus?", "Etwas, das noch vor einem anderen Vergangenen passiert ist: Ich hatte gegessen, bevor er kam."],
      ["Was ist der Unterschied zwischen Aktiv und Passiv?", "Aktiv: Der Hund beißt den Mann. Passiv: Der Mann wird gebissen — die Tat rückt in den Vordergrund."],
      ["Was ist ein Nebensatz?", "Ein Satz, der allein nicht stehen kann. Das gebeugte Verb rutscht ans Ende."],
      ["Warum steht vor „dass“ ein Komma?", "Weil „dass“ einen Nebensatz einleitet und Nebensätze abgetrennt werden."],
      ["Was ist eine Konjunktion?", "Ein Bindewort wie und, weil, obwohl. Es verknüpft Sätze oder Satzteile."],
      ["Wie erkennst du ein Adverb?", "Es beschreibt näher, wie, wann oder wo etwas geschieht, und wird nicht dekliniert."],
      ["Was ist der Konjunktiv II und wofür braucht man ihn?", "Die Möglichkeitsform: Ich hätte, ich würde. Für Wünsche, Höflichkeit und Unwirkliches."],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Deutsch", name: "Rechtschreibung: die klassischen Stolpersteine", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wann schreibt man „das“, wann „dass“?", "„Das“ wenn man dieses/welches einsetzen kann. Sonst „dass“ als Bindewort."],
      ["Probe: Ich weiß, ___ du kommst.", "dass — man kann nicht „dieses“ einsetzen."],
      ["Probe: Das Buch, ___ ich lese.", "das — hier passt „welches“."],
      ["Wann „seit“, wann „seid“?", "„Seit“ bei Zeit (seit gestern), „seid“ ist die Form von sein (ihr seid)."],
      ["Wann „wider“, wann „wieder“?", "„Wider“ heißt gegen (Widerspruch), „wieder“ heißt nochmal."],
      ["Wann schreibt man ss, wann ß?", "Nach kurzem Vokal ss (Fluss), nach langem Vokal oder Doppellaut ß (Fuß, heiß)."],
      ["Was wird immer großgeschrieben?", "Nomen und alles, was wie ein Nomen gebraucht wird: das Laufen, etwas Schönes."],
      ["Signalwörter für Großschreibung?", "Ein Artikel oder ein Wort wie etwas, nichts, viel davor: das Gute, nichts Neues."],
      ["Wann schreibt man Zeitangaben groß?", "Wenn sie Nomen sind: am Morgen, heute Abend. Klein bleibt: morgens, abends."],
      ["Wie schreibt man: „Es tut mir leid“?", "Getrennt und klein — leid ist hier kein Nomen."],
      ["Wann setzt man ein Komma bei „und“?", "Meist gar nicht. Nur wenn ein Nebensatz dazwischenliegt, wird abgetrennt."],
      ["Warum ist Zeichensetzung mehr als Kosmetik?", "Sie steuert den Sinn: „Wir essen, Opa.“ gegen „Wir essen Opa.“"],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Deutsch", name: "Texte & Stilmittel", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist eine Metapher?", "Ein bildhafter Ausdruck ohne „wie“: ein Meer aus Menschen."],
      ["Was ist ein Vergleich?", "Ein Bild mit „wie“ oder „als“: stark wie ein Bär."],
      ["Was ist eine Personifikation?", "Etwas Unbelebtes handelt wie ein Mensch: Der Wind flüstert."],
      ["Was ist eine Alliteration?", "Gleicher Anfangslaut bei aufeinanderfolgenden Wörtern: Milch macht müde Männer munter."],
      ["Was ist eine Übertreibung, fachlich Hyperbel?", "Bewusst maßlose Steigerung: Ich habe dir tausendmal gesagt …"],
      ["Was gehört in eine Inhaltsangabe?", "Präsens, eigene Worte, nur das Wesentliche, keine wörtliche Rede, keine eigene Meinung."],
      ["Woran erkennst du eine Argumentation?", "Behauptung, Begründung, Beispiel — die drei B."],
      ["Was ist der Unterschied zwischen Erzähler und Autor?", "Der Autor schreibt das Buch, der Erzähler ist die erfundene Stimme darin."],
      ["Was ist ein Ich-Erzähler?", "Eine Figur erzählt aus ihrer Sicht und weiß nur, was sie selbst erlebt."],
      ["Was macht eine gute Einleitung aus?", "Sie nennt Titel, Autor, Textsorte und das Thema in wenigen Sätzen."],
      ["Was ist eine Ballade?", "Ein erzählendes Gedicht mit Spannungsbogen — Handlung in Versform."],
      ["Wozu dient ein Reimschema wie abab?", "Es gibt dem Gedicht Rhythmus und Struktur; hier reimen sich Zeile 1 mit 3 und 2 mit 4."],
    ]),
  },
  /* --- Englisch (A2, 3. Lernjahr) --- */
  {
    category: "Unterstufe 3", subject: "Englisch", name: "A2 · Unregelmäßige Verben", flang: "en-US", blang: "de-DE",
    cards: P([
      ["go — went — gone", "gehen"], ["see — saw — seen", "sehen"], ["take — took — taken", "nehmen"],
      ["write — wrote — written", "schreiben"], ["speak — spoke — spoken", "sprechen"], ["buy — bought — bought", "kaufen"],
      ["bring — brought — brought", "bringen"], ["think — thought — thought", "denken"], ["find — found — found", "finden"],
      ["give — gave — given", "geben"], ["know — knew — known", "wissen, kennen"], ["drink — drank — drunk", "trinken"],
      ["begin — began — begun", "beginnen"], ["break — broke — broken", "zerbrechen"], ["choose — chose — chosen", "wählen"],
      ["forget — forgot — forgotten", "vergessen"], ["understand — understood — understood", "verstehen"],
      ["leave — left — left", "verlassen, gehen"], ["win — won — won", "gewinnen"], ["become — became — become", "werden"],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Englisch", name: "A2 · Zeiten richtig wählen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wann nimmt man das Present Perfect?", "Wenn die Vergangenheit bis jetzt wirkt oder der Zeitpunkt egal ist: I have lost my key."],
      ["Wann nimmt man das Past Simple?", "Bei einem abgeschlossenen Zeitpunkt in der Vergangenheit: I lost my key yesterday."],
      ["Signalwörter für Present Perfect?", "already, yet, just, ever, never, since, for."],
      ["Signalwörter für Past Simple?", "yesterday, last week, in 2019, ago."],
      ["Was ist der Unterschied: since oder for?", "since nennt den Startpunkt (since 2020), for die Dauer (for two years)."],
      ["Wann benutzt man das Present Progressive?", "Für etwas, das gerade jetzt passiert: I am reading."],
      ["Warum sagt man nicht „I am knowing“?", "Verben des Denkens und Fühlens stehen nicht in der Verlaufsform."],
      ["Wie bildet man das Going-to-Future?", "am/is/are going to + Grundform — für Geplantes: I am going to visit her."],
      ["Wann nimmt man will?", "Für spontane Entschlüsse und Vorhersagen: I think it will rain."],
      ["Wie bildet man das Past Progressive und wofür?", "was/were + ing. Für einen laufenden Vorgang, in den etwas hineinplatzt: I was cooking when he called."],
      ["Übersetze: Ich habe ihn seit Montag nicht gesehen.", "I haven't seen him since Monday."],
      ["Übersetze: Wir sind letztes Jahr nach Rom gefahren.", "We went to Rome last year."],
      ["Was ist der Unterschied: I have been to London / I have gone to London?", "been to heißt, man war dort und ist zurück. gone to heißt, man ist noch dort."],
      ["Wie bildet man Fragen im Past Simple?", "Mit did und der Grundform: Did you see it? Das Verb bleibt unverändert."],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Englisch", name: "A2 · Wortschatz Schule, Freizeit, Reisen", flang: "en-US", blang: "de-DE",
    cards: P([
      ["timetable", "Stundenplan"], ["homework", "Hausübung"], ["subject", "Unterrichtsfach"], ["break", "Pause"],
      ["exam", "Prüfung"], ["to pass an exam", "eine Prüfung bestehen"], ["to fail", "durchfallen"],
      ["team sport", "Mannschaftssport"], ["hobby", "Hobby"], ["to hang out with friends", "mit Freunden abhängen"],
      ["luggage", "Gepäck"], ["departure", "Abfahrt, Abflug"], ["arrival", "Ankunft"], ["return ticket", "Rückfahrkarte"],
      ["accommodation", "Unterkunft"], ["abroad", "im Ausland"], ["to book a room", "ein Zimmer buchen"],
      ["crowded", "überfüllt"], ["on time", "pünktlich"], ["delayed", "verspätet"],
    ]),
  },
  /* --- Zweite lebende Fremdsprache (startet in der 3. Klasse) --- */
  {
    category: "Unterstufe 3", subject: "Französisch", name: "A1 · Verben être, avoir, aller", flang: "fr-FR", blang: "de-DE",
    cards: P([
      ["je suis", "ich bin"], ["tu es", "du bist"], ["il/elle est", "er/sie ist"], ["nous sommes", "wir sind"],
      ["vous êtes", "ihr seid / Sie sind"], ["ils/elles sont", "sie sind"],
      ["j'ai", "ich habe"], ["tu as", "du hast"], ["il/elle a", "er/sie hat"], ["nous avons", "wir haben"],
      ["vous avez", "ihr habt / Sie haben"], ["ils/elles ont", "sie haben"],
      ["je vais", "ich gehe"], ["tu vas", "du gehst"], ["nous allons", "wir gehen"], ["ils vont", "sie gehen"],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Französisch", name: "A1 · Schule & Alltag", flang: "fr-FR", blang: "de-DE",
    cards: P([
      ["l'école", "die Schule"], ["la classe", "die Klasse"], ["le professeur", "der Lehrer"], ["le cahier", "das Heft"],
      ["le livre", "das Buch"], ["le stylo", "der Kugelschreiber"], ["les devoirs", "die Hausübungen"],
      ["la récréation", "die Pause"], ["le sac à dos", "der Rucksack"], ["l'emploi du temps", "der Stundenplan"],
      ["aujourd'hui", "heute"], ["demain", "morgen"], ["hier", "gestern"], ["toujours", "immer"], ["souvent", "oft"],
      ["j'aime", "ich mag"], ["je n'aime pas", "ich mag nicht"], ["c'est facile", "das ist leicht"], ["c'est difficile", "das ist schwierig"],
    ]),
  },
  {
    category: "Unterstufe 3", subject: "Latein", name: "1. Lernjahr · Grundwortschatz & Formen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["servus, servi (m.)", "der Sklave, der Diener"], ["puella, puellae (f.)", "das Mädchen"],
      ["templum, templi (n.)", "der Tempel"], ["amicus, amici (m.)", "der Freund"],
      ["vita, vitae (f.)", "das Leben"], ["terra, terrae (f.)", "die Erde, das Land"],
      ["videre", "sehen"], ["audire", "hören"], ["dicere", "sagen"], ["venire", "kommen"], ["dare", "geben"],
      ["Wie lauten die sechs Fälle im Lateinischen?", "Nominativ, Genitiv, Dativ, Akkusativ, Ablativ, Vokativ."],
      ["Woran erkennt man im Lateinischen den Fall?", "An der Endung. Deshalb ist die Wortstellung viel freier als im Deutschen."],
      ["Was bedeutet „amicus puellae“?", "Der Freund des Mädchens — die Endung -ae zeigt hier den Genitiv."],
      ["Welches deutsche Wort steckt in „templum“?", "Tempel. Sehr viele Fremdwörter stammen direkt aus dem Lateinischen."],
      ["Warum lohnt Latein für andere Sprachen?", "Französisch, Spanisch und Italienisch stammen davon ab, und im Englischen ist rund die Hälfte des Wortschatzes lateinisch beeinflusst."],
    ]),
  },
  /* --- Zum Staunen: gemeinsam raten, im Auto, am Tisch, zu zweit oder zu fünft.
   * Kein Lernstoff, keine Noten — trotzdem nimmt jeder etwas mit. --- */
  {
    category: "Zum Staunen", subject: "Kaum zu glauben", name: "Größenordnungen, die niemand erwartet", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was gab es früher: die Pyramiden von Gizeh oder Kleopatra?", "Die Pyramiden — und zwar mit großem Abstand.",
       "Kleopatra lebte rund 2500 Jahre nach dem Bau der Großen Pyramide, aber nur etwa 2000 Jahre vor der Mondlandung. Sie war der Mondlandung zeitlich näher als dem Pyramidenbau."],
      ["Wie viele Zellen im menschlichen Körper sind gar keine menschlichen Zellen?", "Etwa die Hälfte.",
       "Vor allem Bakterien, die meisten im Darm. Früher hieß es zehnmal so viele wie Körperzellen — eine Neuberechnung von 2016 ergab ein Verhältnis von ungefähr eins zu eins."],
      ["Wie viele Atemzüge Luft, die Julius Caesar ausgeatmet hat, sind in deinem nächsten Atemzug?", "Statistisch etwa ein paar Moleküle.",
       "Es sind so unfassbar viele Moleküle in einem Atemzug — mehr als es Atemzüge in der Erdatmosphäre gibt — dass sich seine Luft längst überall verteilt hat."],
      ["Wie lange bräuchte ein Auto mit 100 km/h bis zur Sonne?", "Rund 170 Jahre.",
       "Und bis zum nächsten Stern danach über 45 Millionen Jahre. Das ist der Grund, warum interstellare Reisen so schwierig sind — nicht die Technik, sondern die Entfernung."],
      ["Wie viel Prozent des Meeresbodens ist genauer kartiert als die Marsoberfläche?", "Deutlich weniger — der Mars ist besser vermessen.",
       "Radar durchdringt Weltraum problemlos, aber kaum Wasser. Deshalb wissen wir über die Oberfläche fremder Planeten mehr als über unseren eigenen Meeresboden."],
      ["Wie viele Wege gibt es, ein Kartenspiel mit 52 Karten zu mischen?", "Mehr, als es Atome auf der Erde gibt.",
       "Die Zahl hat 68 Stellen. Jedes ordentlich gemischte Kartenspiel liegt fast sicher in einer Reihenfolge, in der noch nie eines lag."],
      ["Wie alt ist der älteste bekannte lebende Baum ungefähr?", "Über 4800 Jahre.",
       "Eine Grannenkiefer in Kalifornien. Sie keimte, als in Ägypten die ersten Pyramiden gebaut wurden — und sie lebt heute noch."],
      ["Wie viel wiegt eine Wolke ungefähr?", "Eine mittlere Schönwetterwolke mehrere hundert Tonnen.",
       "Sie fällt nicht herunter, weil die Tröpfchen winzig sind und die warme Luft darunter sie trägt. Gewicht und Schweben widersprechen sich nicht."],
      ["Was ist schwerer: alle Ameisen der Erde oder alle Menschen?", "Nach heutigen Schätzungen die Menschen.",
       "Lange hieß es, die Ameisen wögen mehr. Neuere Arbeiten schätzen die Ameisenmasse auf einen Bruchteil der menschlichen — die alte Behauptung hält sich trotzdem hartnäckig."],
      ["Wie lange dauert es, bis Licht von der Sonne die Erde erreicht?", "Etwa 8 Minuten und 20 Sekunden.",
       "Würde die Sonne erlöschen, bemerkten wir es erst dann. Bis dahin schiene sie am Himmel weiter — wir sehen immer die Vergangenheit."],
      ["Wie viele Menschen haben insgesamt jemals gelebt?", "Schätzungen liegen bei rund 100 bis 110 Milliarden.",
       "Etwa sieben Prozent davon leben heute. Die oft gehörte Behauptung, es lebten heute mehr Menschen als jemals zuvor zusammen, stimmt also nicht."],
      ["Was war der „Bloop“?", "Ein extrem lautes Unterwassergeräusch aus dem Jahr 1997 — verursacht von brechendem Eis.",
       "Messstationen im Südpazifik zeichneten einen Ton auf, der lauter war als jedes bekannte Tier. Jahrelang wurde über ein unbekanntes Riesenwesen spekuliert. Später ordnete man ihn einem Eisbeben in der Antarktis zu: Wenn ein Eisberg abbricht, ist das noch tausende Kilometer weit zu hören."],
      ["Wie tief ist die tiefste Stelle im Meer?", "Rund 11 000 Meter — der Marianengraben.",
       "Der Mount Everest hätte darin Platz, mit über zwei Kilometern Wasser darüber. Dort unten lastet mehr als das Tausendfache des Drucks an der Oberfläche."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Draußen zurechtkommen", name: "Erste Hilfe, die man wirklich braucht", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist die wichtigste Regel bei jedem Notfall?", "Erst schauen, ob es für einen selbst sicher ist.",
       "Wer selbst verunglückt, hilft niemandem mehr und bindet Rettungskräfte. Deshalb bei Verkehr, Strom oder Wasser: zuerst die Lage sichern."],
      ["Welche drei Angaben braucht die Leitstelle mindestens?", "Wo, was passiert ist, und dass man erreichbar bleibt.",
       "Die alten „fünf W-Fragen“ muss niemand auswendig können — die Leitstelle fragt selbst. Wichtig ist nur: nicht auflegen, bis sie es sagt."],
      ["Was tut man bei einer stark blutenden Wunde?", "Fest draufdrücken — mit allem, was greifbar ist.",
       "Druck ist entscheidend, nicht Sauberkeit. Ein Pullover tut es. Nichts abbinden, außer man ist geschult; und die Hand nicht wegnehmen, um nachzuschauen."],
      ["Was ist die stabile Seitenlage — und wann braucht man sie?", "Bei Bewusstlosen, die normal atmen.",
       "Sie hält die Atemwege frei, falls die Person erbricht. Auf den Rücken gelegt kann die Zunge zurückfallen — das ist die eigentliche Gefahr."],
      ["Woran erkennt man, dass jemand nicht mehr normal atmet?", "Kein Heben des Brustkorbs, keine Luft an der Wange, nur Schnappatmung.",
       "Schnappen ist keine Atmung, sondern ein Zeichen für Herzstillstand — und wird oft für Atmung gehalten. Im Zweifel handeln."],
      ["Was tut man bei einem Herzstillstand?", "Notruf, dann kräftig in der Mitte des Brustkorbs drücken, etwa zweimal pro Sekunde.",
       "Mindestens 100 Mal pro Minute, fünf bis sechs Zentimeter tief. Beatmen ist optional — Drücken ist das Entscheidende. Falsch machen kann man nur eines: nichts tun."],
      ["Was tut man bei einer Verbrennung?", "Zehn bis zwanzig Minuten mit lauwarmem Wasser kühlen.",
       "Kein Eis, keine Butter, keine Zahnpasta. Eis schädigt das Gewebe zusätzlich. Blasen nicht öffnen."],
      ["Was tut man bei einem verstauchten Knöchel?", "Ruhigstellen, kühlen, hochlagern.",
       "Kühlen nie direkt auf der Haut — immer ein Tuch dazwischen, sonst gibt es Erfrierungen. Zwanzig Minuten genügen."],
      ["Wann darf man einen Verletzten bewegen?", "Nur wenn er sonst in Gefahr wäre.",
       "Bei Verdacht auf Wirbelsäulenverletzung kann Bewegen schaden. Ausnahme: Feuer, Verkehr, Wasser — dann rettet Bewegen mehr, als sie schadet."],
      ["Was ist der häufigste Fehler von Ersthelfern?", "Nichts tun aus Angst, etwas falsch zu machen.",
       "In Österreich und Deutschland ist unterlassene Hilfeleistung strafbar, ein Fehler beim Helfen dagegen nicht. Wer hilft, ist rechtlich geschützt."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Nützlich zu wissen", name: "Kleine Kniffe, große Wirkung", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wie hält man sich in einer Menschenmenge sicher?", "Am Rand bleiben und dorthin gehen, wo Platz ist — nie gegen die Richtung.",
       "Gefährlich wird es durch Druck, nicht durch Panik. Wer sich diagonal mit dem Strom bewegt, kommt nach außen; wer dagegen drückt, verliert."],
      ["Warum sollte man bei einem Wohnungsbrand nicht durch Rauch laufen?", "Zwei bis drei Atemzüge Brandrauch können bewusstlos machen.",
       "Nicht die Flammen töten die meisten Menschen, sondern der Rauch. Wenn der Fluchtweg verraucht ist: Tür zu, Ritzen abdichten, ans Fenster, Notruf."],
      ["Warum ist die Tür bei einem Brand wichtiger als das Fenster?", "Eine geschlossene Tür hält Feuer und Rauch minutenlang auf.",
       "Feuerwehrleute empfehlen sogar, nachts die Zimmertür zu schließen — das kann im Ernstfall den Unterschied machen."],
      ["Was tut man, wenn man im Wasser in eine Strömung gerät, die vom Ufer wegzieht?", "Parallel zum Ufer schwimmen, nicht dagegen.",
       "Solche Strömungen sind schmal. Wer dagegen anschwimmt, erschöpft sich; wer seitlich herausschwimmt, ist nach wenigen Metern frei."],
      ["Warum soll man erschöpft nicht ins kalte Wasser springen?", "Kälteschock lässt einen unwillkürlich einatmen.",
       "Der erste Reflex im kalten Wasser ist ein tiefer Atemzug — unter Wasser ist das tödlich. Langsam hineingehen gibt dem Körper Zeit."],
      ["Wie prüft man, ob Eis auf einem See tragfähig ist?", "Gar nicht zuverlässig — nur freigegebene Flächen betreten.",
       "Faustregeln wie „fünf Zentimeter reichen“ versagen bei Strömung, Zuflüssen und Schnee auf dem Eis. Bricht man ein: Arme ausbreiten, in Richtung zurück, aus der man kam."],
      ["Was hilft gegen Reisekrankheit?", "Nach vorn aus dem Fenster schauen, an die frische Luft, nicht lesen.",
       "Übelkeit entsteht, wenn die Augen Stillstand melden und das Gleichgewichtsorgan Bewegung. Wer den Horizont sieht, bringt beides in Einklang."],
      ["Wie findet man heraus, ob ein Ei noch gut ist?", "In ein Glas Wasser legen: Sinkt es, ist es frisch.",
       "Mit der Zeit dringt Luft durch die Schale und die Luftkammer wächst. Steht das Ei aufrecht, sollte man es nur noch durchgegart essen; schwimmt es oben, weg damit."],
      ["Warum brennt scharfes Essen weniger, wenn man Milch trinkt?", "Der Schärfestoff löst sich in Fett, nicht in Wasser.",
       "Capsaicin ist fettlöslich. Wasser verteilt es nur; Milch, Joghurt oder Öl nehmen es auf. Deshalb steht in Indien Joghurt auf dem Tisch."],
      ["Warum sollte man einen brennenden Fettbrand nie mit Wasser löschen?", "Das Wasser verdampft schlagartig und schleudert brennendes Fett heraus.",
       "Aus einem Glas Wasser wird ein meterhoher Feuerball. Richtig ist: Deckel drauf, Herd aus, Luft wegnehmen."],
      ["Was ist die einfachste Art, sich einen Namen zu merken?", "Ihn beim Kennenlernen einmal laut wiederholen.",
       "„Freut mich, Anna.“ Wer den Namen ausspricht, ruft ihn ab statt ihn nur zu hören — und aktives Abrufen ist derselbe Effekt, auf dem diese ganze App beruht."],
      ["Warum lernt man mit Pausen mehr als am Stück?", "Weil das Gedächtnis in den Pausen sortiert.",
       "Vier mal fünfzehn Minuten über eine Woche bringen mehr als eine Stunde am Stück — dasselbe Prinzip wie beim Wiederholen kurz vor dem Vergessen."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Draußen zurechtkommen", name: "Sich zurechtfinden ohne Handy", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wo steht die Sonne mittags in Mitteleuropa?", "Im Süden.",
       "Um die Mittagszeit steht sie am höchsten und genau im Süden — der Schatten zeigt dann nach Norden. Das ist die einfachste Himmelsrichtung, die man ohne Hilfsmittel bekommt."],
      ["Wie findet man mit einer Analoguhr die Himmelsrichtung?", "Stundenzeiger zur Sonne richten; die Mitte zwischen Zeiger und 12 zeigt nach Süden.",
       "Funktioniert auf der Nordhalbkugel. Bei Sommerzeit nimmt man statt der 12 die 1. Ohne Zeigeruhr kann man sich das Zifferblatt vorstellen."],
      ["Wie findet man nachts den Norden?", "Über den Polarstern.",
       "Man verlängert die hintere Kante des Großen Wagens etwa fünfmal — dort steht der Polarstern. Er steht fast genau über dem Nordpol und wandert deshalb praktisch nicht."],
      ["Warum ist Moos an Bäumen ein schlechter Kompass?", "Es wächst dort, wo es feucht ist — nicht zuverlässig im Norden.",
       "Das hängt von Wind, Regenrichtung und Nachbarbäumen ab. Ein hübscher Merksatz, aber im Ernstfall unbrauchbar."],
      ["Was macht man zuerst, wenn man merkt, dass man sich verlaufen hat?", "Stehen bleiben.",
       "Weitergehen vergrößert den Suchraum für alle, die einen suchen. Kurz setzen, trinken, nachdenken — die meisten Fehler entstehen in den ersten aufgeregten Minuten."],
      ["Warum sollte man bergab dem Wasser folgen, wenn man sich verirrt hat?", "Bäche führen talwärts, und im Tal liegen Wege und Siedlungen.",
       "Das gilt in Mitteleuropa gut. In Schluchten kann es allerdings gefährlich werden — dann lieber oberhalb bleiben und dem Lauf nur mit den Augen folgen."],
      ["Was ist das internationale Notsignal?", "Sechsmal in der Minute ein Signal, eine Minute Pause, dann wiederholen.",
       "Rufen, pfeifen oder mit Licht. Die Antwort ist dreimal pro Minute. Ein Pfiff trägt viel weiter als ein Ruf und kostet fast keine Kraft."],
      ["Was ist beim Absetzen eines Notrufs am wichtigsten?", "Der genaue Ort.",
       "Alles andere kann man nachfragen — ohne Ort hilft keine Information. Wenn möglich: markante Punkte nennen, Höhe, letzte bekannte Abzweigung."],
      ["Welche Notrufnummer gilt in ganz Europa?", "112.",
       "Sie funktioniert auch ohne Guthaben und in vielen Fällen sogar ohne eigenes Netz, wenn ein anderes Netz verfügbar ist. In Österreich ist die Bergrettung zusätzlich unter 140 erreichbar."],
      ["Wie schätzt man ab, wie lange es noch hell ist?", "Mit der Handbreit-Regel: Finger zwischen Sonne und Horizont.",
       "Jeder Finger entspricht etwa 15 Minuten, eine ganze Hand rund einer Stunde. Grob, aber gut genug für die Entscheidung, ob man noch weitergeht oder ein Lager baut."],
      ["Warum sollte man beim Wandern jemandem sagen, wohin man geht?", "Damit im Notfall jemand weiß, wo gesucht werden muss.",
       "Das ist die wirksamste Sicherheitsmaßnahme überhaupt — und die einzige, die nichts wiegt."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Draußen zurechtkommen", name: "Essbares & Gefährliches", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Warum ist Hunger draußen weniger dringend als gedacht?", "Der Körper kommt Wochen ohne Nahrung aus.",
       "Wärme, Wasser und Orientierung sind viel dringlicher. Wer hungrig Pilze probiert, tauscht ein kleines Problem gegen ein großes."],
      ["Welche Regel gilt beim Sammeln von Beeren und Pilzen?", "Nur essen, was man sicher erkennt.",
       "„Sieht essbar aus“ genügt nie. Es gibt keine allgemeine Regel, an der man Giftiges erkennt — Tiere fressen vieles, was für uns giftig ist."],
      ["Welche Beeren sind in Mitteleuropa leicht sicher zu erkennen?", "Brombeere, Himbeere, Heidelbeere, Hagebutte, Holunder (gekocht).",
       "Diese fünf verwechselt man kaum. Holunder muss erhitzt werden — roh verursacht er Übelkeit."],
      ["Woran erkennt man Brennnessel — und wozu taugt sie?", "Gezähnte, gegenständige Blätter mit Brennhaaren; gekocht ist sie ein gutes Gemüse.",
       "Kochen oder kräftiges Zerdrücken zerstört die Brennhaare. Sie ist eine der nahrhaftesten Wildpflanzen überhaupt und praktisch überall zu finden."],
      ["Warum sind Pilze für Anfänger tabu?", "Weil tödlich giftige Arten essbaren sehr ähnlich sehen.",
       "Der Grüne Knollenblätterpilz wird mit Champignons verwechselt. Seine Vergiftung beginnt oft erst nach Stunden — wenn die Leber schon geschädigt ist."],
      ["Was ist die Gefahr an Fuchsbandwurm-Warnungen?", "Sie werden meist überschätzt, das Grundprinzip stimmt aber.",
       "Ansteckungen sind sehr selten. Trotzdem: bodennah gesammelte Beeren waschen oder erhitzen — das kostet nichts."],
      ["Was macht man bei einem Zeckenbiss?", "Zecke möglichst rasch mit einer Pinzette nah an der Haut herausziehen.",
       "Nicht mit Öl oder Klebstoff ersticken — dann gibt sie eher Erreger ab. Danach die Stelle beobachten: Ein wandernder roter Ring ist ein Grund für den Arztbesuch."],
      ["Was tut man bei einem Insektenstich im Mund oder Rachen?", "Sofort Notruf — Schwellungen können die Atemwege verschließen.",
       "Bis Hilfe kommt: kühlen, möglichst von außen und innen (Eis lutschen). Das ist einer der wenigen Fälle, in denen ein Insektenstich lebensgefährlich ist."],
      ["Woran erkennt man eine Kreuzotter — und wie gefährlich ist sie?", "Am dunklen Zickzackband auf dem Rücken; ihr Biss ist selten lebensgefährlich.",
       "Sie ist die einzige heimische Giftschlange, die man häufiger antrifft, und sie beißt nur bei Bedrohung. Wichtig: ruhig bleiben, betroffenes Glied ruhigstellen, Arzt aufsuchen. Nicht aussaugen, nicht abbinden."],
      ["Was gilt bei Gewitter draußen?", "Freie Flächen, Bäume und Metall meiden, in die Hocke gehen, Füße zusammen.",
       "Am besten in ein Gebäude oder Auto. Draußen: kleine Auflagefläche, nicht flach hinlegen — der Strom breitet sich im Boden aus."],
      ["Wie schätzt man die Entfernung eines Gewitters?", "Sekunden zwischen Blitz und Donner zählen, durch drei teilen — das ergibt Kilometer.",
       "Drei Sekunden entsprechen etwa einem Kilometer. Unter zehn Sekunden ist es zu nah, um im Freien zu bleiben."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Draußen zurechtkommen", name: "Wasser finden und trinkbar machen", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wie lange hält ein Mensch ohne Wasser durch?", "Meist etwa drei Tage.",
       "Ohne Essen sind es Wochen. Deshalb gilt draußen immer: Wasser zuerst, Nahrung später. Bei Hitze und Anstrengung kann es auch nur ein Tag sein."],
      ["Was ist die zuverlässigste Art, Wasser trinkbar zu machen?", "Abkochen — einmal sprudelnd aufkochen genügt.",
       "Das tötet Bakterien, Viren und Parasiten. Eine Minute sprudelndes Kochen reicht; in großer Höhe drei Minuten, weil Wasser dort schon bei niedrigerer Temperatur siedet."],
      ["Was macht ein selbstgebauter Filter aus Sand und Kohle — und was nicht?", "Er entfernt Schmutz und Trübung, aber keine Krankheitserreger.",
       "Das ist der häufigste Irrtum. Filtern und Abkochen sind zwei verschiedene Dinge: erst filtern, damit das Wasser klar wird, dann abkochen, damit es sicher wird."],
      ["Warum sollte man Wasser aus einem stehenden Tümpel meiden?", "Weil sich dort Keime stark vermehren.",
       "Fließendes Wasser ist meist besser, oberhalb von Siedlungen und Weiden noch besser. Aber auch klares Bergwasser kann Erreger enthalten — ein totes Tier hundert Meter flussaufwärts sieht man nicht."],
      ["Wie gewinnt man Wasser aus einer Pflanze?", "Einen durchsichtigen Sack über einen belaubten Ast binden.",
       "Die Pflanze verdunstet Wasser, es schlägt sich innen nieder und sammelt sich unten. Es geht langsam — ein paar Schluck am Tag — aber es ist sauberes Wasser."],
      ["Ist Schnee essen eine gute Idee, wenn man Durst hat?", "Nein — erst schmelzen lassen.",
       "Schnee ist zu 90 Prozent Luft; man müsste sehr viel essen. Vor allem kostet das Schmelzen im Mund Körperwärme, und genau die braucht man bei Kälte am dringendsten."],
      ["Woran erkennt man in der Natur, dass Wasser in der Nähe ist?", "An Tierspuren, Insektenschwärmen und grüner Vegetation.",
       "Spuren laufen oft zusammen, je näher man dem Wasser kommt. Auch Vögel fliegen morgens und abends zu Wasserstellen — meist niedrig und geradlinig."],
      ["Warum sollte man Meerwasser nicht trinken?", "Weil der Körper zum Ausscheiden des Salzes mehr Wasser braucht, als er bekommt.",
       "Man dehydriert dadurch schneller als ohne. Aus demselben Grund ist auch Urin keine Lösung."],
      ["Was hilft, wenn man in der Sonne unterwegs ist und wenig Wasser hat?", "In der Hitze rasten, in der Kühle gehen.",
       "Nachts oder früh morgens verliert man durch Schwitzen viel weniger. Und: nicht sparsam schlucken, sondern trinken, wenn man Durst hat — Wasser nützt im Körper mehr als in der Flasche."],
      ["Wie lange ist abgekochtes Wasser sicher?", "So lange es abgedeckt bleibt und nichts hineinkommt.",
       "Beim Umfüllen in ein verschmutztes Gefäß ist die Arbeit zunichte. Deshalb: möglichst im selben Behälter kochen und aufbewahren."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Draußen zurechtkommen", name: "Wärme halten & Unterschlupf", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Was ist die größte Gefahr, wenn man draußen übernachten muss?", "Auskühlen — schon bei Temperaturen deutlich über null.",
       "Unterkühlung passiert am häufigsten zwischen 0 und 10 Grad, weil man sie unterschätzt. Nass und Wind zusammen kühlen schneller aus als trockene Kälte."],
      ["Warum ist Nässe gefährlicher als Kälte?", "Nasse Kleidung leitet Wärme viel schneller ab als trockene.",
       "Wasser entzieht dem Körper Wärme etwa fünfundzwanzigmal so schnell wie Luft. Deshalb gilt: trocken bleiben hat Vorrang vor warm anziehen."],
      ["Warum sollte man beim Anstrengen eine Schicht ausziehen?", "Damit man nicht durchschwitzt.",
       "Schweiß macht die Kleidung nass, und nass wird man in der Pause sofort kalt. Bergsteiger sagen: Lieber beim Gehen etwas frieren als danach."],
      ["Was ist der wichtigste Teil eines Notlagers?", "Die Isolierung nach unten.",
       "Der Boden zieht mehr Wärme aus dem Körper als die Luft. Laub, Äste, ein Rucksack — Hauptsache eine dicke Schicht zwischen Körper und Erde. Eine Decke unter sich nützt mehr als über sich."],
      ["Warum ist ein kleiner Unterschlupf besser als ein großer?", "Weil man einen kleinen Raum mit Körperwärme wärmen kann.",
       "Gerade groß genug zum Hineinkriechen. Ein großer Unterstand bleibt kalt, egal wie gut er gebaut ist."],
      ["Über welchen Körperteil verliert man am meisten Wärme?", "Über alles, was unbedeckt ist — meist Kopf und Hände.",
       "Der oft gehörte Satz, man verliere die Hälfte über den Kopf, stimmt nicht. Der Kopf ist einfach häufig der einzige unbedeckte Teil — deshalb hilft eine Mütze so viel."],
      ["Was bedeutet „Zwiebelprinzip“?", "Mehrere dünne Schichten statt einer dicken.",
       "Zwischen den Schichten steht Luft, und Luft isoliert. Außerdem kann man einzeln an- und ausziehen, wenn sich die Anstrengung ändert."],
      ["Was tut man zuerst, wenn jemand unterkühlt ist?", "Vor Wind und Nässe schützen, nasse Kleidung wechseln, warm einpacken.",
       "Nicht abrupt aufwärmen, nicht kräftig reiben, kein Alkohol — der weitet die Gefäße und lässt noch mehr Wärme entweichen. Warme, gezuckerte Getränke helfen, wenn die Person klar ansprechbar ist."],
      ["Wo baut man ein Notlager besser nicht?", "In Senken, auf Bergrücken und unter toten Ästen.",
       "In Senken sammelt sich kalte Luft, auf Rücken bläst der Wind, tote Äste fallen. Ein leichter Hang mit Windschutz ist meist die beste Wahl."],
      ["Warum sind mehrere Menschen im Kalten besser dran als einer?", "Weil sie sich gegenseitig wärmen.",
       "Zusammenrücken bringt spürbar mehr als jede Ausrüstung, die man nicht dabeihat. Die Schwächsten kommen in die Mitte."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Schätzfragen", name: "Wie groß, wie weit, wie viel?", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wie hoch ist der Eiffelturm?", "Rund 330 Meter mit Antennen — etwa so hoch wie ein Haus mit 100 Stockwerken."],
      ["Wie weit ist der Mond von der Erde entfernt?", "Rund 384 000 km. Dazwischen hätten alle anderen Planeten des Sonnensystems nebeneinander Platz."],
      ["Wie lange braucht das Sonnenlicht bis zur Erde?", "Gut 8 Minuten. Erlischt die Sonne, merken wir es erst 8 Minuten später."],
      ["Wie hoch ist der Mount Everest?", "8849 Meter — und er wächst jedes Jahr um wenige Millimeter weiter."],
      ["Wie tief ist die tiefste Stelle im Meer?", "Rund 11 000 Meter im Marianengraben. Der Everest hätte darin Platz und wäre noch überflutet."],
      ["Wie schnell dreht sich die Erde am Äquator?", "Etwa 1670 km/h. Wir merken es nicht, weil sich alles mitdreht."],
      ["Wie schnell bewegt sich die Erde auf ihrer Bahn um die Sonne (in km/h)?", "Rund 107 000 km/h.",
       "Das sind etwa 30 Kilometer pro Sekunde. Wir merken nichts davon, weil sich alles um uns herum genau gleich schnell mitbewegt — Luft, Meer, Häuser. Bewegung spürt man nur, wenn sie sich ändert."],
      ["Wie alt ist die Erde?", "Etwa 4,5 Milliarden Jahre. Der Mensch gibt es davon nur die letzten Sekunden."],
      ["Wie viele Menschen leben auf der Erde?", "Über 8 Milliarden — vor 200 Jahren war es noch nicht einmal eine."],
      ["Wie oft schlägt ein Herz an einem Tag?", "Rund 100 000 Mal."],
      ["Wie lang wären alle Blutgefäße eines Menschen aneinandergelegt?", "Etwa 100 000 Kilometer — zweieinhalbmal um die Erde."],
      ["Wie viele Atemzüge macht ein Mensch pro Tag?", "Ungefähr 20 000."],
      ["Wie viele Haare hat ein Mensch auf dem Kopf?", "Rund 100 000. Etwa 100 davon fallen täglich aus und wachsen nach."],
      ["Wie viele Zellen hat ein menschlicher Körper?", "Etwa 30 Billionen — eine 3 mit 13 Nullen."],
      ["Wie viel Prozent der Erdoberfläche ist Wasser?", "Rund 71 Prozent. Davon sind aber 97 Prozent Salzwasser."],
      ["Wie viel Wasser steckt in einem Kilo Rindfleisch?", "Etwa 15 000 Liter, wenn man Futter und Aufzucht mitrechnet."],
      ["Wie viele Blüten braucht eine Biene für ein Glas Honig?", "Rund zwei Millionen. Das Volk fliegt dafür eine Strecke wie dreimal um die Erde."],
      ["Wie schnell fällt ein Regentropfen?", "20 bis 30 km/h. Größere Tropfen fallen schneller als kleine."],
      ["Wie lange dauert ein Flug zum Mars?", "Sechs bis neun Monate, je nachdem wie die Planeten zueinander stehen."],
      ["Wie viele Sterne hat unsere Milchstraße?", "Schätzungen reichen von 100 bis 400 Milliarden."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Tiere", name: "Erstaunliches aus dem Tierreich", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Warum ertrinkt ein Delfin nicht im Schlaf?", "Es schläft immer nur eine Gehirnhälfte. Die andere hält wach und steuert das Auftauchen zum Atmen."],
      ["Wie oft schlägt ein Kolibri pro Sekunde mit den Flügeln?", "Bis zu 80 Mal.",
       "So schnell, dass man sie nicht mehr einzeln sieht — daher das Summen. Der Kolibri kann dadurch auf der Stelle stehen und sogar rückwärts fliegen. Sein Herz schlägt dabei über 1000 Mal pro Minute."],
      ["Welche Tiere haben blaues Blut?", "Tintenfische und Krebse. Ihr Sauerstoffträger enthält Kupfer statt Eisen."],
      ["Warum sind Flamingos rosa?", "Durch Farbstoffe aus Algen und kleinen Krebsen im Futter. Ohne diese Nahrung werden sie blass."],
      ["Wie schwer ist die Zunge eines Blauwals?", "So schwer wie ein ausgewachsener Elefant."],
      ["Wie viele Zähnchen hat eine Schnecke?", "Über 10 000 winzige auf ihrer Raspelzunge — damit schabt sie Blätter ab."],
      ["Wie viel kann eine Ameise tragen?", "Das Zehn- bis Fünfzigfache ihres eigenen Gewichts."],
      ["Warum läuft ein Gecko an einer Glasscheibe hoch?", "Millionen feinster Härchen an den Füßen erzeugen winzige Anziehungskräfte — kein Klebstoff, reine Physik."],
      ["Welches Tier kann sein Alter zurücksetzen?", "Die Qualle Turritopsis dohrnii. Sie kann in ein früheres Lebensstadium zurückkehren."],
      ["Welches Tier ist das schnellste der Welt?", "Der Wanderfalke — im Sturzflug über 300 km/h."],
      ["Warum bekommt ein Specht keine Kopfschmerzen?", "Sein Schädel federt den Aufprall ab, und das Zungenbein liegt wie ein Gurt um das Gehirn."],
      ["Wie viele Muskeln hat ein Elefantenrüssel?", "Etwa 40 000. Damit kann er einen Baum umwerfen und eine Erdnuss aufheben."],
      ["Wie lange kommt ein Kamel ohne Wasser aus?", "Ein bis zwei Wochen. Danach trinkt es bis zu 100 Liter in wenigen Minuten."],
      ["Warum leuchten Glühwürmchen?", "Durch eine chemische Reaktion, die fast keine Wärme erzeugt — kaltes Licht mit riesigem Wirkungsgrad."],
      ["Wozu dienen die Streifen des Zebras?", "Sie verwirren stechende Fliegen und lösen in der Herde die Umrisse des einzelnen Tieres auf."],
      ["Wie gut riecht ein Eisbär?", "Er wittert eine Robbe über einen Kilometer weit und sogar unter einer Eisschicht."],
      ["Können Kühe Freundschaften schließen?", "Ja. Bei ihrer bevorzugten Partnerin sinkt messbar der Stresspegel."],
      ["Welches Tier hat den größten Augapfel?", "Der Riesenkalmar — sein Auge ist so groß wie ein Fußball."],
      ["Warum können Katzen im Dunkeln so gut sehen?", "Eine Spiegelschicht hinter der Netzhaut wirft das Licht ein zweites Mal zurück. Deshalb leuchten ihre Augen im Scheinwerfer."],
      ["Wie verständigen sich Bienen über Futterplätze?", "Mit einem Schwänzeltanz. Richtung und Dauer verraten Winkel zur Sonne und Entfernung."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Alltag erklärt", name: "Warum ist das eigentlich so?", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Warum knallt es beim Gewitter?", "Der Blitz heizt die Luft schlagartig auf über 20 000 Grad. Sie dehnt sich explosionsartig aus — das ist der Donner."],
      ["Wie weit ist ein Gewitter entfernt?", "Sekunden zwischen Blitz und Donner zählen und durch 3 teilen. Das Ergebnis sind Kilometer."],
      ["Warum ist Schnee weiß, Eis aber durchsichtig?", "Schnee besteht aus unzähligen kleinen Kristallen. Sie streuen alle Farben gleichmäßig zurück."],
      ["Warum schwimmt ein Schiff aus Stahl?", "Weil es mehr Wasser verdrängt, als es selbst wiegt. Entscheidend ist die Form, nicht das Material."],
      ["Warum sieht man im Winter den Atem?", "Warme, feuchte Atemluft kühlt schlagartig ab. Der Wasserdampf wird zu winzigen Tröpfchen."],
      ["Warum kocht Wasser am Berg schon unter 100 Grad?", "Weil der Luftdruck geringer ist. Das Ei braucht dort oben trotzdem länger."],
      ["Warum brennt Chili im Mund?", "Der Stoff Capsaicin reizt genau jene Nerven, die sonst Hitze melden. Das Gehirn glaubt an Feuer."],
      ["Was hilft besser gegen Schärfe: Wasser oder Milch?", "Milch. Capsaicin löst sich in Fett, nicht in Wasser — Wasser verteilt es nur."],
      ["Warum weint man beim Zwiebelschneiden?", "Die verletzte Zelle setzt eine Schwefelverbindung frei, die mit der Augenflüssigkeit einen Reizstoff bildet."],
      ["Warum sind Seifenblasen bunt?", "Licht spiegelt sich an Vorder- und Rückseite der hauchdünnen Haut. Die Wellen überlagern sich und verstärken einzelne Farben."],
      ["Warum fliegt ein Flugzeug?", "Der Flügel lenkt Luft nach unten ab. Als Gegenkraft drückt es die Maschine nach oben."],
      ["Warum wird ein geparktes Auto so heiß?", "Sonnenlicht kommt durch die Scheiben herein, die Wärmestrahlung aber kaum wieder hinaus — Treibhauseffekt im Kleinen."],
      ["Warum knacken Fingergelenke?", "In der Gelenkflüssigkeit platzt ein Gasbläschen. Es dauert etwa 20 Minuten, bis es sich neu bildet."],
      ["Warum wird manchen im Auto schlecht?", "Das Gleichgewichtsorgan meldet Bewegung, die Augen im Innenraum melden Stillstand. Der Widerspruch macht übel."],
      ["Warum ist Meerwasser salzig?", "Flüsse lösen Salze aus Gestein und tragen sie ins Meer. Wasser verdunstet, das Salz bleibt und sammelt sich über Jahrmillionen."],
      ["Woher kommt Schluckauf?", "Das Zwerchfell zuckt unwillkürlich, die Stimmritze schnappt zu. Das typische Hicks ist dieses Zuschnappen."],
      ["Warum werden Blätter im Herbst bunt?", "Der Baum holt das grüne Chlorophyll zurück. Übrig bleiben gelbe und rote Farbstoffe, die vorher überdeckt waren."],
      ["Warum sind Golfbälle nicht glatt?", "Die Dellen halten die Luftströmung am Ball und verkleinern den Sog dahinter. Er fliegt dadurch fast doppelt so weit wie ein glatter."],
      ["Warum haben Flugzeugfenster runde Ecken?", "An eckigen Ecken sammelt sich die Materialspannung. In den 1950ern führte das zu Abstürzen — seither sind sie rund."],
      ["Warum hallt es in einem leeren Zimmer?", "Ohne Möbel, Teppiche und Vorhänge wird der Schall von den kahlen Wänden immer wieder zurückgeworfen."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Unglaublich", name: "Kaum zu glauben, aber wahr", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Lebte Kleopatra näher an der Mondlandung oder am Bau der Cheops-Pyramide?", "An der Mondlandung. Zwischen ihr und dem Pyramidenbau liegen mehr Jahre als zwischen ihr und uns."],
      ["Wie lange dauert ein Tag auf der Venus?", "Länger als ihr Jahr: 243 Erdtage Drehung gegenüber 225 Tagen Umlauf um die Sonne."],
      ["Warum ist Pluto kein Planet mehr?", "Seit 2006 gilt er als Zwergplanet — er hat seine Umlaufbahn nicht von anderen Objekten freigeräumt."],
      ["Welches Land hat keinen einzigen dauerhaften Fluss?", "Saudi-Arabien. Wasser kommt aus Brunnen und Meerwasserentsalzung."],
      ["Wie viele Zeitzonen hat Russland?", "Elf. Wenn im Westen die Schule beginnt, ist im Osten schon Abend."],
      ["Welche Stadt hat mehr Brücken als Venedig und Amsterdam zusammen?", "Hamburg — über 2500 Stück."],
      ["Wie alt ist das älteste noch existierende Unternehmen der Welt?", "Über 1400 Jahre. Eine japanische Baufirma wurde im Jahr 578 gegründet."],
      ["Welche Gemüse sind botanisch eigentlich Früchte?", "Tomate, Gurke, Paprika, Zucchini und Kürbis — alle enthalten Samen."],
      ["Wie schnell wachsen Fingernägel?", "Etwa 3,5 Millimeter im Monat. Zehennägel brauchen für dieselbe Strecke fast viermal so lang."],
      ["Wie viel Zeit verschläft ein Mensch im Leben?", "Rund ein Drittel — bei 75 Jahren sind das etwa 25 Jahre."],
      ["Wie oft schlägt ein Herz in einem ganzen Leben?", "Etwa drei Milliarden Mal, ohne eine einzige Pause."],
      ["Wie viel Gold wurde in der ganzen Menschheitsgeschichte gefördert?", "Alles zusammengeschmolzen ergäbe einen Würfel mit etwa 22 Metern Kantenlänge."],
      ["Wie viel Rechenleistung hatte der Computer der Mondlandung?", "Weniger als ein einfacher Taschenrechner heute. Er hatte etwa 64 Kilobyte Speicher."],
      ["Wie schwer war das erste Mobiltelefon?", "Fast ein Kilogramm, und der Akku hielt eine halbe Stunde Gespräch."],
      ["Woher hat die Achterbahn ihren Namen?", "Frühe Bahnen waren als liegende Acht gebaut."],
      ["Wie viele Wörter hat die deutsche Sprache?", "Der Duden führt rund 150 000. Der gesamte Wortschatz wird auf mehrere Hunderttausend geschätzt."],
      ["Was passiert mit einem Menschen ohne Schwerkraft?", "Er wird im All ein paar Zentimeter größer, weil sich die Bandscheiben entspannen."],
      ["Wie viel Prozent des menschlichen Körpers ist Wasser?", "Etwa 60 Prozent bei Erwachsenen, bei Babys sogar rund 75."],
      ["Warum sieht man auf alten Fotos niemanden lachen?", "Die Belichtung dauerte Minuten. Ein Lächeln so lange zu halten war unmöglich."],
      ["Wie lange gibt es die Kartoffel schon in Europa?", "Erst seit dem 16. Jahrhundert. Davor kannte niemand hier Pommes oder Erdäpfelsalat."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Knobeln", name: "Knobelfragen für unterwegs", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Zwei Väter und zwei Söhne fahren fischen. Jeder fängt einen Fisch, zusammen sind es drei. Wie geht das?", "Es sind nur drei Personen: Großvater, Vater und Sohn. Der Vater ist beides zugleich."],
      ["Was wird nasser, je mehr es trocknet?", "Das Handtuch."],
      ["Ein Zug fährt nach Norden, der Wind weht nach Süden. In welche Richtung zieht der Rauch?", "Gar nicht — es ist eine Elektrolok."],
      ["Wie oft kann man 25 von 100 abziehen?", "Genau einmal. Danach zieht man es von 75 ab."],
      ["Ein Bauer hat 17 Schafe. Alle bis auf 9 laufen weg. Wie viele bleiben?", "Neun. Die Frage klingt nur nach Rechnung."],
      ["Was hat einen Hals, aber keinen Kopf?", "Die Flasche."],
      ["Was geht nach oben, kommt aber nie wieder herunter?", "Das Alter."],
      ["Was ist schwerer: ein Kilo Federn oder ein Kilo Blei?", "Beides gleich schwer. Nur das Volumen ist völlig verschieden."],
      ["Fünf Maschinen brauchen 5 Minuten für 5 Teile. Wie lange brauchen 100 Maschinen für 100 Teile?", "Auch 5 Minuten. Jede Maschine schafft ein Teil in 5 Minuten."],
      ["Seerosen verdoppeln sich täglich. Nach 48 Tagen ist der See voll. Wann war er halb voll?", "Am 47. Tag. Verdopplung heißt: der letzte Schritt macht die Hälfte aus."],
      ["Schläger und Ball kosten zusammen 1,10 €. Der Schläger kostet 1 € mehr als der Ball. Was kostet der Ball?", "5 Cent. Bei 10 Cent wäre die Differenz nur 90 Cent."],
      ["Was gehört dir, wird aber fast immer von anderen benutzt?", "Dein Name."],
      ["Wie viele Monate haben 28 Tage?", "Alle zwölf — jeder Monat hat mindestens 28."],
      ["Ein Arzt gibt dir drei Tabletten, alle halbe Stunde eine. Wie lange reichen sie?", "Eine Stunde. Die erste nimmst du sofort."],
      ["Was ist leichter als eine Feder, und trotzdem kann es niemand lange halten?", "Der Atem."],
      ["Vater und Sohn verunglücken. Der Chirurg sagt: Das ist mein Sohn, ich kann nicht operieren. Wie geht das?", "Der Chirurg ist die Mutter. Die meisten stolpern nur über ihr eigenes Bild im Kopf."],
      ["Was geht am Morgen auf vier Beinen, mittags auf zwei und abends auf drei?", "Der Mensch: krabbelnd, gehend, und im Alter mit Stock. Das Rätsel der Sphinx."],
      ["Wie viele Geburtstage hat ein Mensch?", "Genau einen. Alle weiteren sind Jahrestage davon."],
      ["Was kann man nie zum Frühstück essen?", "Mittag- und Abendessen."],
      ["Ein Mann wohnt im zehnten Stock. Nach oben fährt er nur bis zum siebten und geht den Rest. Außer wenn es regnet. Warum?", "Er ist zu klein für den obersten Knopf. Bei Regen hat er einen Schirm dabei."],
    ]),
  },
  {
    category: "Zum Staunen", subject: "Smalltalk", name: "Fakten fürs Smalltalk", flang: "de-DE", blang: "de-DE",
    cards: P([
      ["Wie viele Herzen hat ein Krake?", "Drei — zwei für die Kiemen, eins für den Körper."],
      ["Welcher Planet dreht sich rückwärts?", "Die Venus — die Sonne geht dort im Westen auf."],
      ["Wie lange dauerte der kürzeste Krieg der Geschichte?", "Rund 38 Minuten (England–Sansibar, 1896)."],
      ["Kann Honig schlecht werden?", "Praktisch nie — er hält über Jahrtausende."],
      ["Wie viele Knochen hat ein erwachsener Mensch?", "206."],
      ["Bananen sind botanisch gesehen …?", "Beeren. Erdbeeren dagegen nicht."],
      ["Welche Farbe hat ein Sonnenuntergang auf dem Mars?", "Bläulich."],
      ["Wie alt kann ein Grönlandhai werden?", "Über 250, womöglich 400 Jahre."],
      ["Wie viele Sprachen gibt es weltweit?", "Rund 7.000."],
      ["Warum ist der Himmel blau?", "Blaues Licht wird von der Luft am stärksten gestreut (Rayleigh-Streuung).",
       "Sonnenlicht enthält alle Farben. Die kurzen blauen Wellen prallen an den winzigen Luftteilchen ab und verteilen sich über den ganzen Himmel — deshalb kommt Blau aus allen Richtungen. Beim Sonnenuntergang nimmt das Licht einen längeren Weg durch die Luft, dann ist das Blau unterwegs schon weggestreut und Rot bleibt übrig."],
      ["Wie schwer ist eine mittlere Schönwetterwolke?", "Mehrere hundert Tonnen Wasser."],
      ["Welches Land hat die meisten Zeitzonen?", "Frankreich — 12, dank der Überseegebiete."],
      ["Wie schnell rennt ein Gepard?", "Bis zu 100–120 km/h."],
      ["Was war zuerst da: die Uni Oxford oder das Aztekenreich?", "Oxford — es lehrte schon um 1096."],
      ["Wie viele Menschen haben heute Geburtstag?", "Rund 21 Millionen (etwa 1/365 der Menschheit)."],
      ["Welches Organ erneuert sich am schnellsten?", "Die Darmschleimhaut — alle paar Tage."],
    ]),
  },
];

/* ============================================================
 * FSRS — Free Spaced Repetition Scheduler (4.5, 17 Parameter)
 * Modelliert pro Karte Stabilitaet (S), Schwierigkeit (D) und
 * Abrufwahrscheinlichkeit (R). Terminiert die Karte so, dass die
 * Erinnerung mit ~90% Wahrscheinlichkeit gerade noch sitzt.
 * ============================================================ */
const FSRS_W = [0.4197, 1.1869, 3.0412, 15.2441, 7.1434, 0.6477, 1.0007, 0.0674,
  1.6597, 0.1712, 1.1178, 2.0225, 0.0904, 0.3025, 2.1214, 0.2498, 2.9466];
const DECAY = -0.5, FACTOR = 19 / 81, RETENTION = 0.9;
const clampD = (x) => Math.min(10, Math.max(1, x));
const initStability = (g) => Math.max(0.1, FSRS_W[g - 1]);
const initDifficulty = (g) => clampD(FSRS_W[4] - Math.exp(FSRS_W[5] * (g - 1)) + 1);
const retrievability = (t, s) => Math.pow(1 + FACTOR * t / s, DECAY);
const nextDifficulty = (d, g) => clampD(FSRS_W[7] * initDifficulty(4) + (1 - FSRS_W[7]) * (d - FSRS_W[6] * (g - 3)));
const recallStability = (d, s, r, g) => {
  const hard = g === 2 ? FSRS_W[15] : 1, easy = g === 4 ? FSRS_W[16] : 1;
  const inc = Math.exp(FSRS_W[8]) * (11 - d) * Math.pow(s, -FSRS_W[9]) * (Math.exp((1 - r) * FSRS_W[10]) - 1) * hard * easy;
  return Math.max(0.1, s * (1 + inc));
};
const forgetStability = (d, s, r) => {
  const sf = FSRS_W[11] * Math.pow(d, -FSRS_W[12]) * (Math.pow(s + 1, FSRS_W[13]) - 1) * Math.exp((1 - r) * FSRS_W[14]);
  return Math.max(0.1, Math.min(sf, s));
};
const intervalDaysFor = (s) => Math.min(3650, Math.max(1, Math.round((s / FACTOR) * (Math.pow(RETENTION, 1 / DECAY) - 1))));

// grade: 1=Nochmal (Again), 3=Gewusst (Good). Pure: liefert neuen Zustand.
function computeNext(card, grade, now) {
  if (card.s == null) {
    const s = initStability(grade), d = initDifficulty(grade);
    return { s, d, intervalDays: intervalDaysFor(s) };
  }
  const elapsed = Math.max(0, (now - (card.last || now)) / DAY);
  const r = retrievability(elapsed, card.s);
  const d = nextDifficulty(card.d, grade);
  const s = grade === 1 ? forgetStability(card.d, card.s, r) : recallStability(card.d, card.s, r, grade);
  return { s, d, intervalDays: intervalDaysFor(s) };
}

const isDue = (c) => !c.due || c.due <= Date.now();

/* ---------------- Beide Richtungen abfragen ----------------
 * Bei Vokabeln ist "Haus -> house" eine ANDERE Gedaechtnisleistung als
 * "house -> Haus". Wer das eine sicher kann, steht beim anderen oft ratlos da -
 * und die Rueckrichtung ist genau die, die man beim Sprechen braucht.
 *
 * Deshalb bekommt die Rueckrichtung einen **eigenen Lernstand** in `card.rueck`.
 * Wuerden sich beide Richtungen einen teilen, haette der Scheduler die Karte fuer
 * gelernt gehalten, obwohl nur die Haelfte sitzt - das haette das Gedaechtnismodell
 * ausgehebelt, das die eigentliche Staerke der App ist.
 *
 * Es wird NICHTS dupliziert: eine Karte, zwei Staende. (Kopien haben in diesem
 * Projekt schon dreimal Fehler verursacht.)
 */
const RUECK = "rueck";
/* Liefert den Lernstand einer Richtung. Weil computeNext() und bucketOf() nur
   s/d/last/due lesen, koennen sie unveraendert damit arbeiten. */
const standVon = (c, richtung) => (richtung === RUECK ? (c.rueck || {}) : c);
const istFaellig = (c, richtung) => isDue(standVon(c, richtung));
/* Eine Kartei taugt zur Umkehr, wenn Vorder- und Rueckseite verschiedene Sprachen
   tragen - dann sind es Vokabeln. Bei Verstaendnisfragen ("Warum ist der Himmel
   blau?") waere die Rueckrichtung sinnlos, es gaebe unendlich viele Antworten. */
const istVokabelDeck = (d) => !!d && (d.cards || []).some(
  (c) => c.flang && c.blang && c.flang !== c.blang);
/* Richtungen, die von dieser Kartei gelernt werden. */
const richtungenVon = (d) => (d && d.beide && istVokabelDeck(d)) ? ["vor", RUECK] : ["vor"];
/* Alle Lerneinheiten einer Kartei: bei eingeschalteter Umkehr zaehlt jede
   Richtung einzeln, denn jede hat ihren eigenen Faelligkeitstermin und ihren
   eigenen Reifegrad. Ohne das zeigte der Fortschritt die halbe Wahrheit. */
const einheitenVon = (d) => (d.cards || []).flatMap(
  (c) => richtungenVon(d).map((r) => ({ karte: c, richtung: r, stand: standVon(c, r) })));
const faelligeVon = (d) => einheitenVon(d).filter((e) => isDue(e.stand)).length;
function fmtDays(d) {
  d = Math.max(1, Math.round(d));
  if (d === 1) return "morgen";
  if (d < 7) return `in ${d} Tagen`;
  if (d < 30) { const w = Math.round(d / 7); return w <= 1 ? "in 1 Woche" : `in ${w} Wochen`; }
  if (d < 365) { const m = Math.round(d / 30); return m <= 1 ? "in 1 Monat" : `in ${m} Monaten`; }
  const y = d / 365; return y < 1.5 ? "in 1 Jahr" : `in ${Math.round(y)} Jahren`;
}

// Reifegrad nach Stabilitaet — ersetzt die alten starren Faecher.
const MATURITY = [
  { key: "neu", label: "Neu" }, { key: "lernend", label: "Lernend" },
  { key: "jung", label: "Jung" }, { key: "reif", label: "Reif" }, { key: "fest", label: "Fest" },
];
function bucketOf(c) {
  if (c.s == null) return "neu";
  if (c.s < 7) return "lernend";
  if (c.s < 30) return "jung";
  if (c.s < 180) return "reif";
  return "fest";
}
const bucketLabel = (c) => MATURITY.find((m) => m.key === bucketOf(c)).label;
/* Nach aussen zeigt Robin **drei** Stufen in Kindersprache. Fuenf Namen (Neu/Lernend/Jung/
 * Reif/Fest) haelt ein Zehnjaehriger nicht auseinander — „Jung“ und „Reif“ sagen ihm nichts.
 * Innen rechnet FSRS unveraendert fein weiter; nur die Anzeige ist grober. */
/* Die Beschriftungen sind GETTER, keine festen Werte. Eine Konstante auf
   Modulebene wird genau einmal ausgewertet - beim Laden, in der damals
   eingestellten Sprache. Nach einem Sprachwechsel waeren die Reifegrade dann
   die einzigen Woerter, die noch deutsch dastehen. Als Getter wird t() bei
   jedem Zugriff neu gefragt. Gilt fuer jede Modulkonstante mit Text: BEREICHE,
   STUFE3, REIFE3, SPIELE, BLATT_FELDER. */
const STUFE3 = [
  { key: "frisch", get label() { return t("reife.frisch"); }, quellen: ["neu", "lernend"] },
  { key: "kommt", get label() { return t("reife.kommt"); }, quellen: ["jung"] },
  // "reif" gehoert zu "sitzt fest", nicht darunter: FSRS erreicht s>=180 erst nach
  // fuenf Wiederholungen ueber gut sieben Monate - bis dahin stand hier bei jedem
  // Kind dauerhaft 0 %, egal wie fleissig es war. s>=30 heisst: die Karte
  // uebersteht einen Monat. Fuer Schulwissen ist das "sitzt fest", und es ist
  // nach drei Wiederholungen in gut zwei Wochen erreichbar. FSRS selbst rechnet
  // unveraendert weiter - nur die Anzeige zaehlt jetzt, was ein Mensch zaehlen wuerde.
  { key: "fest", get label() { return t("reife.fest"); }, quellen: ["reif", "fest"] },
];
const stufe3Von = (c) => STUFE3.find((r) => r.quellen.includes(bucketOf(c))) || STUFE3[0];
const STUFE3_RANG = { frisch: 0, kommt: 1, fest: 2 };

/* --- Teilen: Kartei <-> Code (Unicode-sicher, ohne Kontaktdaten) --- */
function encodeDeck(deck) {
  const payload = { v: 1, name: deck.name, cards: deck.cards.map((c) => {
    const k = { f: c.front, b: c.back, fl: c.flang, bl: c.blang };
    if (c.warum) k.w = c.warum;        // Erklaerung mitgeben, sonst geht sie beim Teilen verloren
    return k;
  }) };
  return "KBX1:" + btoa(encodeURIComponent(JSON.stringify(payload)));
}
function decodeDeck(code) {
  const raw = code.trim().replace(/^KBX1:/, "");
  const p = JSON.parse(decodeURIComponent(atob(raw)));
  return {
    id: uid(), name: p.name || "Geteilte Kartei",
    cards: (p.cards || []).map((c) => ({ id: uid(), front: c.f, back: c.b, warum: c.w || "",
      flang: c.fl || "en-US", blang: c.bl || "de-DE", due: 0 })),
  };
}

/* Beim ersten Start ist die App leer - absichtlich. Vorher lag hier eine Kartei
 * mit neunzehn Karten Fliesstext, die die App erklaeren sollte. Genau die
 * Altersgruppe, fuer die sie gedacht war, liest so etwas nicht (das sagt auch die
 * Recherche: lange Erklaertexte werden uebersprungen). Stattdessen fuehrt die Tour
 * einmal kurz durch, und danach holt man sich in der Bibliothek etwas Echtes.
 */
/* Der rote Faden fuers Gespraech mit einer Fachperson. Er ist bewusst *als
 * Kartei* gebaut und nicht als PDF: wer ihn durchblaettert, benutzt dabei die
 * App und sieht, wovon die Rede ist. Die Fragen sind echte Rueckfragen, die
 * Schulpsychologie, Beratungslehrkraefte und Eltern stellen - samt der
 * unangenehmen. Die letzten Karten benennen die Schwaechen; ein Stapel, der nur
 * wirbt, ueberzeugt niemanden vom Fach.
 */
const PSYCH_CARDS = P([
  ["Was sind Bloop Cards?",
   "Lernkarten mit drei Seiten statt zwei: Frage, kurze Antwort — und dahinter eine Erklärung, wenn man sie braucht.",
   "Gewöhnliche Karteikarten zwingen zur Kürze: Steht auf der Rückseite ein Absatz, prüft man nicht mehr ehrlich, ob man es wusste, sondern liest. Kurz muss die Antwort trotzdem sein — nur reicht Kurz nicht immer zum Verstehen. Die dritte Seite löst diesen Widerspruch: Die Antwort bleibt knapp und abrufbar, das Warum steht dahinter und erscheint nur auf Wunsch (nach oben wischen oder antippen)."],
  ["Warum heißt die App Bloop?",
   "Von Buddy und Loop — der Begleiter und die Schleife, in der eine Karte zurückkommt.",
   "Wir nennen die Methode bloopen: Die Karten tauchen immer wieder auf, bis man sie kann. Den Namen gibt es übrigens wirklich — 1997 zeichneten Messstationen im Südpazifik ein Geräusch auf, das lauter war als jedes bekannte Tier. Es stellte sich als Eisbeben heraus."],
  ["Welche Daten sammelt die App über mein Kind?",
   "Keine. Es gibt kein Konto, keine Anmeldung, keine Analytik und keinen Server, an den etwas ginge. Alles liegt im Speicher des Geräts. Auch die Schriften liegen lokal — es geht nicht einmal eine Anfrage an Google hinaus."],
  ["Wie finanziert sich das dann?",
   "Auf der Erwachsenenseite: einmalig ein kleiner Betrag, dazu Patenschaften für Schulen. Auf der Kinderseite fließt kein Geld und läuft keine Werbung. Kinder sind hier nicht die Ware."],
  ["Was hält ein Kind bei der Stange?",
   "Nichts. Das ist Absicht. Keine Serien, keine Punkte, keine Abzeichen, keine Erinnerungen, die ein schlechtes Gewissen machen. Eine Einheit darf enden, und wer eine Woche nicht kommt, findet nichts Kaputtes vor."],
  ["Ist das nicht naiv? Kinder brauchen doch Motivation.",
   "Die Selbstbestimmungstheorie nennt drei Quellen: Autonomie, Kompetenz, Verbundenheit. Belohnungsschleifen bedienen keine davon — sie ersetzen sie. Wir setzen auf sichtbaren Fortschritt (Kompetenz) und darauf, dass das Kind Tempo und Reihenfolge selbst bestimmt (Autonomie)."],
  ["Nach welchem Lernprinzip arbeitet sie?",
   "Verteiltes Wiederholen mit aktivem Abruf. Ein Gedächtnismodell (FSRS) schätzt für jede Karte, wann sie zu verblassen beginnt, und legt sie kurz davor wieder vor. Der Effekt ist einer der am besten belegten der Lernforschung."],
  ["Warum sieht mein Kind nicht, wie viel es noch aufholen müsste?",
   "Weil ein Berg von 300 offenen Karten niemanden ans Lernen bringt. Eine Einheit ist auf 20 Karten gedeckelt. Gezeigt werden nur Zahlen, die wachsen können — was fallen kann, bestraft die Rückkehr."],
  ["Kann mein Kind mit Fremden in Kontakt kommen?",
   "Nein. Es gibt keinen Feed, keine Profile, kein Folgen, keine Nachrichten und keine Kommentare. Karteien lassen sich als Code weitergeben — an Menschen, die man kennt, und der Code wird außerhalb der App verschickt."],
  ["Kann sie im Unterricht eingesetzt werden?",
   "Ja. Eine Lehrkraft baut eine Kartei und gibt den Code an die Klasse. Es braucht keine Konten, keine Lizenzverwaltung und keine Einverständniserklärungen für die Datenverarbeitung — es findet keine statt."],
  ["Wie steht es um Barrierefreiheit?",
   "Alle Farbkombinationen sind auf 4,5:1 geprüft, in hell und dunkel. Bedienen geht per Tastatur, Beschriftungen sind für Screenreader gesetzt, und wer im System weniger Bewegung eingestellt hat, bekommt keine Animationen."],
  ["Was ist mit Kindern, die sich schwer konzentrieren?",
   "Es gibt ein zuschaltbares gleichmäßiges Rauschen, das Umgebungslärm überdeckt. Sonst: kurze Einheiten, eine Handlung pro Bildschirm, keine blinkenden Belohnungen, die den Faden zerreißen."],
  ["Wo sind die Schwächen? Bitte ehrlich.",
   "Drei. Erstens: Geht das Gerät verloren, sind die Karten weg — kein Konto heißt auch kein Backup. Zweitens: Wer die App gar nicht öffnet, wird an nichts erinnert; das ist gewollt, aber es ist eine Wette. Drittens: Verbundenheit, die dritte Motivationsquelle, ist kaum bedient — bewusst, weil jede Antwort darauf ein Netzwerk wäre."],
  ["Für welches Alter ist sie gedacht?",
   "Zehn bis achtzehn. Das ist ehrlich gesagt eine große Spanne: Was Zehnjährige ansprechend finden, wirkt auf Sechzehnjährige kindisch. Deshalb der dunkle Modus und die Farbwahl — und deshalb ist das ein Punkt, an dem wir noch arbeiten."],
  ["Was, wenn ich Ihnen widerspreche?",
   "Dann interessiert uns das mehr als Zustimmung. Diese App wird von wenigen Leuten gebaut, ohne Marktforschungsabteilung. Fachlicher Widerspruch ist das Wertvollste, was wir bekommen können."],
]);

/* Beim ersten Start liegt etwas Echtes da: drei Karteien zum Lernen und der
 * Stapel fuer das Fachgespraech. Vorher war die App leer - das war sauber, aber
 * man konnte nichts ausprobieren, ohne sich erst etwas zu holen.
 */
const START_KARTEIEN = [
  ["Englisch", "A1 \u00b7 Alltag & Höflichkeit"],
  ["Mathematik", "Terme & Gleichungen"],
  ["Biologie", "Verdauung & Ernährung"],
];
const seed = () => {
  const ausKatalog = START_KARTEIEN
    .map(([fach, name]) => CATALOG.find((d) => d.subject === fach && d.name === name))
    .filter(Boolean)
    .map((d) => ({
      id: uid(), name: d.subject + " \u00b7 " + d.name, recall: d.recall !== false,
      cards: d.cards.map((c) => ({ id: uid(), front: c.f, back: c.b, warum: c.w || "",
        flang: d.flang, blang: d.blang || "de-DE", due: 0 })),
    }));
  return [...ausKatalog, {
    // Ruhend: dieser Stapel gehoert nicht in die taegliche Runde eines Kindes.
    // Er liegt in der Bibliothek bereit, wenn ihn jemand braucht - sonst waeren
    // beim Lernen ploetzlich Fragen zur Finanzierung dazwischen.
    id: uid(), name: "Für Fachleute \u00b7 Fragen & Antworten", recall: false, resting: true,
    cards: PSYCH_CARDS.map((c) => ({ id: uid(), front: c.f, back: c.b, warum: c.w || "",
      flang: "de-DE", blang: "de-DE", due: 0 })),
  }];
};

/* --- Vorlesen (on-device Text-to-Speech) --- */
function useSpeech() {
  const [voices, setVoices] = useState([]);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => setVoices(window.speechSynthesis.getVoices() || []);
    load(); window.speechSynthesis.onvoiceschanged = load;
    return () => { try { window.speechSynthesis.onvoiceschanged = null; } catch {} };
  }, []);
  const speak = useCallback((text, lang) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || "de-DE";
    const code = (lang || "de").slice(0, 2).toLowerCase();
    const cands = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(code));
    const rank = (v) => (/(google|natural|premium|enhanced|neural|siri)/i.test(v.name) ? 0 : 1);
    cands.sort((a, b) => rank(a) - rank(b));
    if (cands[0]) u.voice = cands[0];
    u.rate = 0.92; u.pitch = 1;
    window.speechSynthesis.speak(u);
  }, [voices]);
  return { speak, supported: typeof window !== "undefined" && !!window.speechSynthesis };
}

/* --- Fokus-Sound: prozedural erzeugtes weisses/rosa/braunes Rauschen (loopt, keine Dateien) --- */
function fillNoise(data, type) {
  if (type === "white") { for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1; return; }
  if (type === "brown") { let last = 0; for (let i = 0; i < data.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; data[i] = last * 3.2; } return; }
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0; // pink (Paul Kellet)
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.96900 * b2 + w * 0.1538520;
    b3 = 0.86650 * b3 + w * 0.3104856; b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
  }
}
function useNoise() {
  const ctxRef = useRef(null), srcRef = useRef(null);
  const stop = useCallback(() => { if (srcRef.current) { try { srcRef.current.stop(); } catch {} srcRef.current = null; } }, []);
  const play = useCallback((type) => {
    stop();
    if (type === "off") return;
    try {
      if (!ctxRef.current) { const AC = window.AudioContext || window.webkitAudioContext; ctxRef.current = new AC(); }
      const ctx = ctxRef.current; if (ctx.state === "suspended") ctx.resume();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      fillNoise(buf.getChannelData(0), type);
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      // Pegel pro Rauschart, nicht pauschal: Braun und Rosa liegen tief und kommen aus einem
      // Handylautsprecher kaum heraus, Weiss dagegen sticht. Mit einem gemeinsamen Wert (0.12)
      // war Braun — die erste Stufe! — praktisch unhoerbar und wirkte wie ein Defekt.
      // Werte auf gleiche *wahrnehmbare* Lautstaerke oberhalb 250 Hz gebracht.
      const PEGEL = { brown: 0.34, pink: 0.30, white: 0.075 };
      const g = ctx.createGain();
      const ziel = PEGEL[type] || 0.12;
      // Sanft einblenden, sonst knackt der Einsatz.
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(ziel, ctx.currentTime + 0.35);
      src.connect(g).connect(ctx.destination); src.start(); srcRef.current = src;
    } catch {}
  }, [stop]);
  useEffect(() => () => { stop(); if (ctxRef.current) { try { ctxRef.current.close(); } catch {} } }, [stop]);
  return { play, stop, supported: typeof window !== "undefined" && !!(window.AudioContext || window.webkitAudioContext) };
}

/* Fokus-Sound: liegt bewusst auf App-Ebene, damit der Ton beim Wechsel
 * zwischen Startseite, Lernen und Aufwaermen weiterlaeuft. */
const NOISES = [
  { k: "off",   get l() { return t("ton.aus"); },   get voll() { return t("ton.aus.voll"); } },
  { k: "brown", get l() { return t("ton.braun"); }, get voll() { return t("ton.braun.voll"); } },
  { k: "pink",  get l() { return t("ton.rosa"); },  get voll() { return t("ton.rosa.voll"); } },
  { k: "white", get l() { return t("ton.weiss"); }, get voll() { return t("ton.weiss.voll"); } },
];

function KopfhoererIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14v-2.5a8 8 0 0 1 16 0V14" />
      <rect x="2" y="13.5" width="4.6" height="7.5" rx="2.3" />
      <rect x="17.4" y="13.5" width="4.6" height="7.5" rx="2.3" />
    </svg>
  );
}
function SoundToggle({ sound }) {
  const [zeigt, setZeigt] = useState(false);
  const ersteRunde = useRef(true);
  useEffect(() => {
    if (ersteRunde.current) { ersteRunde.current = false; return; }
    setZeigt(true);
    const t = setTimeout(() => setZeigt(false), 1900);
    return () => clearTimeout(t);
  }, [sound && sound.idx]);
  if (!sound || !sound.supported) return null;
  const on = sound.idx > 0;
  return (
    <button className={"sound-btn" + (on ? " on" : "")} onClick={sound.cycle} aria-pressed={on}
      aria-label={NOISES[sound.idx].voll + t("ton.wechseln")}
      title={NOISES[sound.idx].voll + " — gleichmäßiger Ton, der Umgebungslärm überdeckt"}>
      <KopfhoererIcon />
      <span className="sound-punkte" aria-hidden="true">
        {NOISES.slice(1).map((n, i) => (
          <i key={n.k} className={i < sound.idx ? "an" : ""} />
        ))}
      </span>
      {zeigt && (
        <span className="sound-fahne" aria-hidden="true">
          {NOISES[sound.idx].voll}
        </span>
      )}
    </button>
  );
}

export default function Robin() {
  const [decks, setDecks] = useState(null);
  /* Navigation mit echtem Verlauf. Zwei Gruende:
   * 1. Die Forschung ist eindeutig — Kinder dieser Altersgruppe *verlassen sich* auf Zurueck.
   * 2. In einer installierten PWA gibt es keinen Browser-Zurueck-Knopf, auf iOS im Vollbild
   *    gar keinen. Also braucht Robin einen eigenen — und muss zusaetzlich die Systemgeste
   *    bedienen (Android-Zurueck, iOS-Wischen), damit beides dasselbe tut.
   * Jeder Sprung legt einen History-Eintrag an; `popstate` nimmt ihn zurueck.
   */
  const [view, setViewRoh] = useState({ name: "home" });
  const stapel = useRef([]);
  const jetzt = useRef({ name: "home" });
  jetzt.current = view;
  const setView = useCallback((v) => {
    stapel.current.push(jetzt.current);
    try { window.history.pushState({ robin: stapel.current.length }, ""); } catch {}
    setViewRoh(v);
  }, []);
  const zurueck = useCallback(() => {
    const vorher = stapel.current.pop();
    setViewRoh(vorher || { name: "home" });
  }, []);
  useEffect(() => {
    const aufPop = () => {
      if (stapel.current.length) { setViewRoh(stapel.current.pop()); }
      else { setViewRoh({ name: "home" }); }
    };
    window.addEventListener("popstate", aufPop);
    return () => window.removeEventListener("popstate", aufPop);
  }, []);
  const [mixDeck, setMixDeck] = useState(null);
  const [quizDeck, setQuizDeck] = useState(null);
  // Der Vorhang geht, sobald *beides* fertig ist: die kurze Bewegung und das Laden.
  const [eintrittVorbei, setEintrittVorbei] = useState(false);
  const loaded = useRef(false);
  const tts = useSpeech();
  const noise = useNoise();
  const [nIdx, setNIdx] = useState(0);
  const sound = {
    supported: noise.supported, idx: nIdx,
    cycle: () => { const n = (nIdx + 1) % NOISES.length; setNIdx(n); noise.play(NOISES[n].k); },
  };

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(STORAGE_KEY); setDecks(r ? JSON.parse(r.value) : seed()); }
      catch { setDecks(seed()); }
      finally { loaded.current = true; }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setEintrittVorbei(true), 1470);   // Zeichnen + Ausblenden
    return () => clearTimeout(t);
  }, []);

  const [uebungen, setUebungen] = useState([]);
  const uebGeladen = useRef(false);
  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(UEB_KEY); if (r) setUebungen(JSON.parse(r.value)); }
      catch {} finally { uebGeladen.current = true; }
    })();
  }, []);
  useEffect(() => {
    if (!uebGeladen.current) return;
    (async () => { try { await window.storage.set(UEB_KEY, JSON.stringify(uebungen)); } catch {} })();
  }, [uebungen]);
  // Ids zu echten Karten aufloesen — was es nicht mehr gibt, faellt weg.
  const uebungKarten = (u) => {
    const alle = new Map(decks.flatMap((d) => d.cards).map((c) => [c.id, c]));
    return u.kartenIds.map((id) => alle.get(id)).filter(Boolean);
  };
  const startUebung = (u) => {
    const karten = uebungKarten(u);
    if (!karten.length) return;
    setMixDeck({ id: "__ueb__" + u.id, name: u.name, cards: shuffle(karten.slice()).slice(0, SESSION_CARDS),
      mehr: karten.length > SESSION_CARDS });
    setView({ name: "mix" });
  };

  const [meta, setMeta] = useState({ seit: 0, ms: 0 });
  const metaGeladen = useRef(false);
  const letzteAntwort = useRef(0);
  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(META_KEY); if (r) setMeta(JSON.parse(r.value)); }
      catch {}
      finally { metaGeladen.current = true; }
    })();
  }, []);
  useEffect(() => {
    if (!metaGeladen.current) return;
    (async () => { try { await window.storage.set(META_KEY, JSON.stringify(meta)); } catch {} })();
  }, [meta]);

  const [feier, setFeier] = useState(null);
  const [ohrNeu, setOhrNeu] = useState(false);
  // Nach jeder Aenderung schauen, ob eine Schwelle frisch ueberschritten wurde.
  useEffect(() => {
    if (!metaGeladen.current || decks == null) return;
    const gelernt = decks.flatMap((d) => d.cards).filter((c) => c.reps).length;
    const tage = meta.seit ? Math.floor((Date.now() - meta.seit) / DAY) : 0;
    const schon = meta.gefeiert || [];
    const karte = MEILEN_KARTEN.filter((m) => gelernt >= m && !schon.includes("k" + m)).pop();
    const tag = MEILEN_TAGE.filter((m) => tage >= m && !schon.includes("t" + m)).pop();
    if (!karte && !tag) return;
    const marke = karte ? "k" + karte : "t" + tag;
    setFeier(karte
      ? { zahl: karte, was: karte === 1 ? t("ub.gelernt.1") : t("ub.gelernt") }
      : { zahl: tag, was: "Tage dabei" });
    setMeta((m) => ({ ...m, gefeiert: [...(m.gefeiert || []), marke] }));
  }, [decks, meta.seit]);

  // Bei jeder Bewertung: Startdatum festhalten und die Spanne seit der letzten Karte addieren.
  // Gedeckelt, damit eine Pause nicht als Lernzeit durchgeht.
  const zaehleZeit = () => {
    const jetzt = Date.now();
    const spanne = letzteAntwort.current ? Math.min(jetzt - letzteAntwort.current, PAUSE_MAX) : 0;
    letzteAntwort.current = jetzt;
    // `...m` ist Pflicht: ohne das Ausbreiten loescht jede Bewertung Deckname,
    // gefeierte Meilensteine und die „später“-Merkung.
    setMeta((m) => ({
      ...m, seit: m.seit || jetzt, ms: m.ms + spanne,
      // Tagesstatistik: pro Tag nur zwei Zahlen (beantwortet, Zeit). Damit laesst
      // sich ein Verlauf zeichnen - vorher gab es nur Momentaufnahmen. Es sind
      // reine Zaehler ohne Bezug zu einer Person, und sie bleiben auf dem Geraet.
      tage: schreibeTag(m.tage, jetzt, spanne),
    }));
  };

  useEffect(() => {
    if (!loaded.current || decks == null) return;
    (async () => { try { await window.storage.set(STORAGE_KEY, JSON.stringify(decks)); } catch {} })();
  }, [decks]);

  /* Sprache setzen, BEVOR die Kinder rendern. t() liest die Modulvariable SPR;
     stuende sie noch auf dem alten Wert, zeigte der erste Rahmen nach einem
     Sprachwechsel die alte Sprache. */
  setzeSprache(sprachVon(meta) || geraeteSprache());

  const update = useCallback((fn) => setDecks((d) => fn(structuredClone(d))), []);

  // Immer gleich lang. Ein Vorhang, der mal kuerzer und mal laenger dauert, macht den
  // Start unruhig — und genau das soll er nicht. Das Laden aus dem Geraetespeicher
  // dauert ohnehin nur Sekundenbruchteile.
  const zeigeEintritt = !eintrittVorbei;

  if (decks == null) {
    return (<div className="kbx" data-farbe={farbeVon(meta)} data-modus={modusVon(meta)}><style>{STYLES}</style>
      <div className="frame" />
      {zeigeEintritt && <Eintritt onSkip={() => setEintrittVorbei(true)}
        marke={buddyName(meta)} />}
    </div>);
  }

  const deck = view.deckId ? decks.find((d) => d.id === view.deckId) : null;

  // Gibt die neue id zurueck, damit die Bibliothek direkt ins Lernen springen kann.
  const addCatalogDeck = (entry) => {
    const id = uid();
    update((d) => {
      // Fach mit in den Namen: auf der Startseite sieht man sonst nur „1. Lernjahr …“
      d.push({ id, name: `${entry.subject} · ${entry.name}`, cards: entry.cards.map((c) => ({ id: uid(), front: c.f, back: c.b, warum: c.w || "", flang: entry.flang, blang: entry.blang || "de-DE", due: 0 })) });
      return d;
    });
    return id;
  };
  const startMix = () => {
    // Ruhende Karteien mischen nicht mit — sie sollen sich ja gerade nicht melden.
    const aktiv = decks.filter((d) => !d.resting);
    // Jede Karte bekommt ihr Fach mit. Der Deckname ist "Fach · Thema"; steht kein
    // Trenner drin, ist der ganze Name das Fach.
    const mitFach = (d) => d.cards.map((c) => ({ ...c, fach: fachVon(d.name) }));
    const dueAll = aktiv.flatMap((d) => mitFach(d).filter(isDue));
    const pool = shuffle((dueAll.length ? dueAll : aktiv.flatMap(mitFach)).slice()).slice(0, SESSION_CARDS);
    // `mehr` muss mitreisen: der Stapel ist hier schon gekappt, Study koennte sonst
    // nicht mehr erkennen, dass noch etwas liegt, und wuerde „alles durch“ behaupten.
    setMixDeck({ id: "__mix__", name: "Querbeet", cards: pool, mehr: dueAll.length > SESSION_CARDS });
    setView({ name: "mix" });
  };
  /* Quiz: sofort spielbar, ohne vorher etwas zu uebernehmen. Nimmt die „Zum Staunen“-Fragen
   * aus dem Katalog, mischt sie und legt nichts ab — kein Scheduler, keine Bewertung,
   * kein Fortschritt. Es ist ein Spiel, kein Lernstoff, und soll sich auch so anfuehlen.
   */
  const startQuiz = (fach) => {
    const quellen = CATALOG.filter((d) => d.category === "Zum Staunen" && (!fach || d.subject === fach));
    const pool = shuffle(quellen
      .flatMap((d) => d.cards.map((c) => ({ id: uid(), front: c.f, back: c.b, warum: c.w || "",
        fach: d.subject, flang: d.flang, blang: d.blang || "de-DE", due: 0 }))))
      .slice(0, SESSION_CARDS);
    setQuizDeck({ id: "__quiz__", name: fach || "Quiz", cards: pool, recall: false });
    setView({ name: "quiz" });
  };
  /* `felder` traegt front, back, warum und die beiden Sprachen. Vorher waren es
     zwei Einzelwerte - die dritte Seite konnte damit gar nicht gespeichert werden. */
  const editAcrossDecks = (cid, felder) => {
    update((d) => {
      for (const dk of d) {
        const c = dk.cards.find((x) => x.id === cid);
        if (c) { Object.assign(c, felder); break; }
      }
      return d;
    });
    // Der Querbeet-Stapel haelt eigene Kopien der Karten — ohne das hier bliebe auf dem
    // Bildschirm der alte Text stehen, obwohl gespeichert schon der neue ist.
    setMixDeck((md) => md ? { ...md, cards: md.cards.map((c) => c.id === cid ? { ...c, ...felder } : c) } : md);
  };
  /* Bewertung im Querbeet. Der Mix-Stapel haelt eigene Kopien der Karten — deshalb wird
   * der neue Stand *zuerst* berechnet und dann an beide Stellen geschrieben: in die
   * Ursprungskartei und in den Mix. Ohne das sieht der Endbildschirm den Fortschritt nicht,
   * den er gerade selbst ausgeloest hat. (Dieselbe Falle wie bei `mehr` und beim Bearbeiten.)
   */
  const rateAcrossDecks = (cid, grade, richtung) => {
    zaehleZeit();
    const quelle = decks.flatMap((d) => d.cards).find((c) => c.id === cid);
    if (!quelle) return;
    const now = Date.now();
    // Auch quer durch alle Karteien traegt jede Richtung ihren eigenen Stand.
    const alt = standVon(quelle, richtung);
    const nx = computeNext(alt, grade, now);
    const felder = {
      s: nx.s, d: nx.d, last: now, due: now + nx.intervalDays * DAY,
      reps: (alt.reps || 0) + 1, lapses: (alt.lapses || 0) + (grade === 1 ? 1 : 0),
    };
    update((d) => {
      for (const dk of d) {
        const c = dk.cards.find((x) => x.id === cid);
        if (c) {
          if (richtung === RUECK) c.rueck = { ...(c.rueck || {}), ...felder };
          else Object.assign(c, felder);
          break;
        }
      }
      return d;
    });
    setMixDeck((md) => md ? { ...md, cards: md.cards.map((c) => c.id !== cid ? c
      : (richtung === RUECK ? { ...c, rueck: { ...(c.rueck || {}), ...felder } } : { ...c, ...felder })) } : md);
  };

  return (
    <div className="kbx" lang={SPR} data-farbe={farbeVon(meta)} data-modus={modusVon(meta)}>
      <style>{STYLES}</style>
      <MarkeCtx.Provider value={buddyName(meta)}>
      {zeigeEintritt && <Eintritt onSkip={() => setEintrittVorbei(true)}
        marke={buddyName(meta)} />}
      {/* KEINE Sprachwahl beim Start. Bloop spricht sofort die Sprache des
          Geraets - Deutsch in DACH, sonst Englisch. Ein Dialog vor der Tour
          haette den ersten Eindruck mit einer Entscheidung begonnen, die das
          Geraet ohnehin schon beantwortet. Umschalten geht im Profil. */}
      {eintrittVorbei && metaGeladen.current && !meta.tourFertig && (
        <Tour marke={buddyName(meta)} sound={sound}
          onFertig={() => setMeta((m) => ({ ...m, tourFertig: true }))} />
      )}
      {feier && <Feier feier={feier} deckname={meta.deckname} onZu={() => setFeier(null)} />}
      <div className="frame">
        {view.name === "home" && (
          <Home decks={decks} sound={sound} deckname={meta.deckname}
            meta={meta} onMeta={(teil) => setMeta((m) => ({ ...m, ...teil }))}
            /* Nach dem Anlegen direkt in die neue Kartei. Vorher blieb man auf der
               Startseite stehen, wo eine leere Kartei nirgends auftaucht - es sah
               aus, als haette der Knopf nichts getan. Wer eine Kartei anlegt, will
               als Naechstes Karten hineintun; genau dort landet er jetzt, und das
               Kartenblatt steht dort schon offen, weil die Kartei leer ist. */
            onAdd={(name) => {
              const id = uid();
              update((d) => { d.push({ id, name, cards: [] }); return d; });
              // Der Schluessel heisst deckId, nicht id - sonst findet die Ansicht
              // die Kartei nicht und rendert gar nichts.
              setView({ name: "deck", deckId: id });
            }}
            /* Auch beim Import: die uebernommene Kartei zeigen, statt sie still
               in die Liste zu legen. Sonst wirkt der Code-Import wie ein Fehler. */
            onImport={(dk) => {
              update((d) => { d.push(dk); return d; });
              setView({ name: "deck", deckId: dk.id });
            }}
            onCatalog={() => setView({ name: "bib" })}
            onUeberblick={() => setView({ name: "ueberblick" })}
            onFoto={() => setView({ name: "foto" })}
            onMix={startMix} onProfil={() => setView({ name: "profil" })} />
        )}
        {view.name === "bib" && (
          <Bibliothek onBack={zurueck} onHeim={() => setView({ name: "home" })} onAdd={addCatalogDeck}
            onStudy={(id) => setView({ name: "study", deckId: id })}
            eigene={decks} onOpen={(id) => setView({ name: "deck", deckId: id })}
            onQuiz={() => setView({ name: "quizwahl" })} onSpiele={() => setView({ name: "spiele" })}
            onToggleRest={(id) => update((d) => { const dk = d.find((x) => x.id === id); dk.resting = !dk.resting; return d; })}
            uebungen={uebungen} zaehleUebung={(u) => uebungKarten(u).length}
            onUebungStart={startUebung}
            onUebungWeg={(id) => setUebungen((u) => u.filter((x) => x.id !== id))}
            onGruppeSchalten={(g, anschalten) => update((d) => {
              const ids = new Set(g.decks.map((x) => x.id));
              d.forEach((dk) => { if (ids.has(dk.id)) dk.resting = !anschalten; });
              return d;
            })}
            onUebungAusGruppe={(g) => {
              const ids = g.decks.flatMap((d) => d.cards.map((c) => c.id));
              if (!ids.length) return;
              setUebungen((u) => [...u, { id: uid(), name: g.name + " · alles", erstellt: Date.now(), kartenIds: ids }]);
            }} />
        )}
        {view.name === "foto" && (
          // Aus einer Kartei heraus wandern die Karten *in* diese Kartei, nicht in eine neue.
          <FotoImport sound={sound} zielName={view.deckId ? (decks.find((d) => d.id === view.deckId) || {}).name : null}
            onBack={zurueck}
            onImport={(dk) => {
              if (view.deckId) {
                update((d) => { const z = d.find((x) => x.id === view.deckId); if (z) z.cards.push(...dk.cards); return d; });
                setView({ name: "deck", deckId: view.deckId });
              } else {
                update((d) => { d.push(dk); return d; });
                setView({ name: "deck", deckId: dk.id });
              }
            }} />
        )}
        {view.name === "warmup" && (
          <LightsOut sound={sound} onBack={zurueck} />
        )}
        {view.name === "vier" && (
          <VierGewinnt sound={sound} onBack={zurueck} />
        )}
        {view.name === "rohr" && (
          <Rohrleitung sound={sound} onBack={zurueck} />
        )}
        {/* Einmalig beim ersten Start, sobald der Vorhang weg ist. */}
        {eintrittVorbei && metaGeladen.current && !meta.deckname && !meta.namenSpaeter && (
          <Namenswahl
            onFertig={(n) => setMeta((m) => ({ ...m, deckname: n }))}
            onSpaeter={() => setMeta((m) => ({ ...m, namenSpaeter: true }))} />
        )}
        {view.name === "ueberblick" && (
          <Ueberblick decks={decks} meta={meta} onBack={zurueck}
            onOpen={(id) => setView({ name: "deck", deckId: id })} />
        )}
        {view.name === "profil" && (
          <Profil meta={meta} onBack={zurueck} sound={sound}
            onSetzen={(teil) => setMeta((m) => ({ ...m, ...teil }))} />
        )}
        {view.name === "quizwahl" && (
          <QuizWahl onBack={zurueck} onStart={startQuiz} />
        )}
        {view.name === "spiele" && (
          <SpieleWahl onBack={zurueck}
            onStart={(key) => setView({ name: key === "lichter" ? "warmup" : key })} />
        )}
        {view.name === "quiz" && quizDeck && (
          // Bewertung geht ins Leere: ein Quiz veraendert keinen Lernfortschritt.
          <Study deck={quizDeck} tts={tts} sound={sound}
            onBack={zurueck}
            onHome={zurueck}
            onRate={() => {}} />
        )}
        {view.name === "mix" && mixDeck && (
          <Study deck={mixDeck} tts={tts} sound={sound}
            onBack={zurueck}
            onHome={zurueck}
            onEditCard={editAcrossDecks}
            onRate={rateAcrossDecks} />
        )}
        {view.name === "deck" && deck && (
          <DeckView deck={deck} tts={tts}
            onBack={zurueck} onHeim={() => setView({ name: "home" })}
            onFoto={() => setView({ name: "foto", deckId: deck.id })}
            onUebung={(ids) => {
              const name = deck.name.split("·").pop().trim() + " · Auswahl";
              setUebungen((u) => [...u, { id: uid(), name, erstellt: Date.now(), kartenIds: ids }]);
              setView({ name: "bib" });
            }}
            onStudy={() => setView({ name: "study", deckId: deck.id })}
            onAddCard={(felder) => update((d) => {
              d.find((x) => x.id === deck.id).cards.push({ id: uid(), due: 0, ...felder });
              return d;
            })}
            onEditCard={(cid, felder) => update((d) => {
              const c = d.find((x) => x.id === deck.id).cards.find((x) => x.id === cid);
              if (c) Object.assign(c, felder);
              return d;
            })}
            onDelCard={(cid) => update((d) => {
              const dk = d.find((x) => x.id === deck.id); dk.cards = dk.cards.filter((c) => c.id !== cid); return d;
            })}
            onDelDeck={() => { update((d) => d.filter((x) => x.id !== deck.id)); setView({ name: "home" }); }}
            onRest={() => update((d) => { const dk = d.find((x) => x.id === deck.id); dk.resting = !dk.resting; return d; })}
            onBeide={() => update((d) => { const dk = d.find((x) => x.id === deck.id); dk.beide = !dk.beide; return d; })}
          />
        )}
        {view.name === "study" && deck && (
          <Study key={deck.id} deck={deck} tts={tts} sound={sound}
            alleDecks={decks}
            onFolgeholen={(eintrag) => {
              const name = eintrag.subject + " · " + eintrag.name;
              const id = uid();
              update((d) => { d.push({ id, name, cards: eintrag.cards.map((c) => ({
                id: uid(), front: c.f, back: c.b, warum: c.w || "",
                flang: eintrag.flang, blang: eintrag.blang || "de-DE", due: 0 })) }); return d; });
              setView({ name: "study", deckId: id });
            }}
            onBack={zurueck}
            onHome={zurueck}
            onEditCard={(cid, felder) => update((d) => {
              const c = d.find((x) => x.id === deck.id).cards.find((c) => c.id === cid);
              if (c) Object.assign(c, felder);
              return d;
            })}
            onRate={(cid, grade, richtung) => { zaehleZeit(); return update((d) => {
              const c = d.find((x) => x.id === deck.id).cards.find((c) => c.id === cid);
              // Die Rueckrichtung fuehrt ihren eigenen Stand in `c.rueck` - sonst
              // haette der Scheduler die Karte fuer gelernt gehalten, obwohl nur
              // eine Richtung sitzt.
              const ziel = richtung === RUECK ? (c.rueck = c.rueck || {}) : c;
              const now = Date.now(); const nx = computeNext(ziel, grade, now);
              ziel.s = nx.s; ziel.d = nx.d; ziel.last = now; ziel.due = now + nx.intervalDays * DAY;
              ziel.reps = (ziel.reps || 0) + 1;
              if (grade === 1) ziel.lapses = (ziel.lapses || 0) + 1;
              return d;
            }); }}
          />
        )}
      </div>
      </MarkeCtx.Provider>
    </div>
  );
}

/* ---------------- Home ---------------- */
/* Profil: Begleiter und Farbe. Bewusst nur diese zwei Dinge - es ist keine
 * Einstellungsseite, sondern die Stelle, an der man sich die App zu eigen macht.
 * Die Farbe faerbt alles, auch die Figur: sie gehoert dem Kind, nicht der Figur.
 * Hinweis: Frida und Klaus sind bis auf die Farbe dieselbe Zeichnung. Erst mit
 * Marcs Varianten (Bart, Hut) werden sie wirklich unterscheidbar - bis dahin
 * zeigt die Wahl sie in ihren Standardfarben, sonst waeren sie identisch. */
/* Sprachwahl beim allerersten Start - VOR der Tour, denn eine Tour in der
 * falschen Sprache erklaert nichts. Sie erscheint genau einmal: sobald
 * `meta.sprache` steht, ist sie erledigt.
 *
 * Bewusst ohne Laenderflaggen. Eine Flagge steht fuer ein Land, nicht fuer eine
 * Sprache - Englisch mit Union Jack schliesst gefuehlt alle aus, die es anders
 * gelernt haben, und bei Spanisch oder Portugiesisch waere jede Wahl falsch.
 * Der Sprachname in der eigenen Sprache ist eindeutig und kraenkt niemanden.
 *
 * Der Vorschlag oben kommt aus den Browsereinstellungen. Das ist keine Angabe
 * ueber die Person: sie wird gelesen, nicht gespeichert oder verschickt.
 */
function SprachWahl({ onWaehlen }) {
  const vorschlag = geraeteSprache();
  return (
    <div className="tour" role="dialog" aria-label={t("sprachwahl.aria")}>
      <div className="tour-buehne">
        <div className="tour-octo"><OctoIcon s={104} blick="ruhig" /></div>
      </div>
      <div className="sprachwahl">
        {SPRACHEN.map((s) => (
          <button key={s.c} className={"sprach-knopf" + (s.c === vorschlag ? " vor" : "")}
            lang={s.c} onClick={() => onWaehlen(s.c)}>{s.n}</button>
        ))}
      </div>
      <div className="tour-luft" aria-hidden="true" />
    </div>
  );
}

/* Guided Tour: einmal kurz durch, dann nie wieder. Vier Schritte, jeder eine
 * Sache. Ueberspringen steht von Anfang an sichtbar da - eine Tour, aus der man
 * nicht rauskommt, ist eine Falle, und wir bauen keine Fallen.
 * Am Ende steht kein "Fertig", sondern der erste echte Schritt: etwas aussuchen.
 */
function Tour({ marke, onFertig, sound }) {
  const [i, setI] = useState(0);
  // In der Tour wird nichts vorgefuehrt, was man nicht selbst anfassen kann:
  // die Beispielkarte dreht sich wirklich, der Ton schaltet wirklich.
  const [gedreht, setGedreht] = useState(false);
  const [warumAuf, setWarumAuf] = useState(false);
  const zugY = useRef(null);
  /* Alle Texte kommen aus dem Woerterbuch. Der Begleitername und die Rauschart
     werden als %N% / %S% eingesetzt - sie stehen in jeder Sprache an anderer
     Stelle im Satz, deshalb Platzhalter statt Zusammenkleben. */
  const schritte = [
    { octo: "ruhig", titel: t("tour.1.titel").replace("%N%", marke), text: t("tour.1.text") },
    { bild: "karte", titel: t("tour.2.titel"),
      text: warumAuf ? t("tour.2.text.warum") : gedreht ? t("tour.2.text.gedreht") : t("tour.2.text") },
    { bild: "wischen", titel: t("tour.3.titel"), text: t("tour.3.text") },
    { bild: "kopfhoerer", titel: t("tour.4.titel"),
      text: (sound && sound.supported && sound.idx > 0)
        ? t("tour.4.text.an").replace("%S%", NOISES[sound.idx].voll.toLowerCase())
        : t("tour.4.text") },
    { octo: "schielen", titel: t("tour.5.titel"), text: t("tour.5.text") },
    { bild: "werte", titel: t("tour.6.titel"), text: t("tour.6.text") },
    { octo: "ruhig", titel: t("tour.7.titel"), text: t("tour.7.text") },
    /* Der Medien-Teil kommt hier nur als Angebot vor. Ein Vortrag ueber
       Bildschirmzeit in der Einfuehrung waere genau das Moralisieren, das in
       diesem Alter abgelehnt wird - und ausgerechnet von einer App, die selbst
       auf dem Bildschirm laeuft. Neugier traegt weiter. */
    { bild: "medien", titel: t("tour.8.titel"), text: t("tour.8.text") },
  ];
  const s = schritte[i];
  const letzter = i === schritte.length - 1;
  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label={t("tour.aria")}>
      <button className="tour-skip" onClick={onFertig}>{t("tour.skip")}</button>
      <div className="tour-buehne">
        {/* In der Tour bestimmt der SCHRITT den Blick, nicht der Zufall - dort
            ist er Teil der Aussage ("schielen" beim Datenschutz-Schritt). */}
        {s.octo && <div className="tour-octo">
          <OctoIcon s={104} blick={s.octo}
            kopfhoerer={!!(sound && sound.supported && sound.idx > 0)} />
        </div>}
        {s.bild === "karte" && (
          <div className={"tour-karte tour-karte-echt" + (gedreht ? " um" : "") + (warumAuf ? " weit" : "")}
            onPointerDown={(e) => { zugY.current = e.clientY; }}
            onPointerUp={(e) => {
              const hoch = zugY.current == null ? 0 : zugY.current - e.clientY;
              zugY.current = null;
              if (gedreht && hoch >= 40) { setWarumAuf(true); haptik(HAPTIK.umdrehen); return; }
              if (gedreht && hoch <= -40) { setWarumAuf(false); return; }
              if (Math.abs(hoch) < 12) { setGedreht((g) => !g); setWarumAuf(false); haptik(HAPTIK.umdrehen); }
            }}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setGedreht((g) => !g); setWarumAuf(false); } }}
            aria-label={gedreht ? "Antwort: gracias. Tippen dreht zurück, nach oben wischen zeigt die Erklärung" : "Beispielkarte umdrehen"}>
            <span className="tour-kicker">{gedreht ? "Antwort" : "Frage"}</span>
            <b>{gedreht ? "gracias" : "Was heißt „danke“ auf Spanisch?"}</b>
            {gedreht && !warumAuf && (
              /* Auch die Zeiger-Ereignisse abfangen, nicht nur den Klick:
                 pointerup feuert VOR click und blubbert zur Karte hoch. Dort galt
                 der Druck als kurzes Tippen, die Karte drehte sich zurueck und
                 setzte warumAuf wieder auf false - danach schaltete der Knopf es
                 auf true, aber die Karte war nicht mehr gedreht, also blieb die
                 dritte Seite unsichtbar. Der Knopf tat scheinbar nichts. */
              <button className="warum-knopf"
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setWarumAuf(true); haptik(HAPTIK.umdrehen); }}>
                <span className="warum-pfeil" aria-hidden="true">↑</span> Warum?
              </button>
            )}
            {gedreht && warumAuf && (
              <div className="warum-feld">
                <div className="warum-titel">Warum</div>
                <div className="warum-text">Von „gracia“ — Gnade, Gunst. Im Spanischen sagt man den Dank in der Mehrzahl: „gracias“, also wörtlich „Gnaden“. Im Italienischen ist es „grazie“, im Portugiesischen „obrigado“ — dasselbe Wort, andere Wege.</div>
              </div>
            )}
            {!gedreht && <span className="tour-tipp">tippen</span>}
          </div>
        )}
        {s.bild === "kopfhoerer" && (
          sound && sound.supported ? (
            <button className={"tour-kopf tour-kopf-echt" + (sound.idx > 0 ? " an" : "")}
              onClick={sound.cycle}
              aria-label={t("ton.an") + NOISES[sound.idx].voll + t("ton.wechseln")}>
              <KopfhoererIcon />
              <span className="tour-wellen"><i /><i /><i /></span>
              <span className="tour-kopf-text">{NOISES[sound.idx].voll}</span>
            </button>
          ) : (
            <div className="tour-kopf" aria-hidden="true">
              <KopfhoererIcon /><span className="tour-wellen"><i /><i /><i /></span>
            </div>
          )
        )}
        {s.bild === "medien" && (
          <div className="tour-medien" aria-hidden="true">
            <span className="tour-lupe">🔍</span>
            <ul className="tour-werte">
              <li>Endlos-Scrollen</li><li>Autoplay</li><li>Streaks</li><li>Roter Punkt</li>
            </ul>
          </div>
        )}
        {s.bild === "werte" && (
          <ul className="tour-werte" aria-hidden="true">
            <li>Kein Konto</li><li>Keine Werbung</li><li>Kein Abo</li><li>{t("prof.nichts")}</li>
          </ul>
        )}
        {s.bild === "wischen" && (
          <div className="tour-wisch" aria-hidden="true">
            <span className="tour-pfeil links">Nochmal</span>
            <div className="tour-karte klein"><b>gracias</b></div>
            <span className="tour-pfeil rechts">Gewusst</span>
          </div>
        )}
      </div>
      {/* ALLE Texte liegen uebereinander im selben Rasterfeld. Dadurch ist der
          Block so hoch wie der laengste Schritt - und Punkte und Knopf sitzen
          auf jedem Screen an derselben Stelle. Vorher wanderten sie mit der
          Textlaenge, was beim Weiterblaettern unruhig aussah.
          Der Trick braucht keine gemessene Hoehe: der Browser rechnet sie aus,
          und sie stimmt auch bei anderer Schriftgroesse oder Sprache. */}
      <div className="tour-worte">
        {schritte.map((sx, k) => (
          <div key={k} className={"tour-wort" + (k === i ? " an" : "")} aria-hidden={k !== i}>
            <h2 className="tour-titel">{sx.titel}</h2>
            <p className="tour-text">{sx.text}</p>
          </div>
        ))}
      </div>
      {/* Freier Raum NACH dem Text. Ohne ihn nimmt die Buehne allein den ganzen
          Rest, und auf einem hohen Display klebte der Text ganz unten am Knopf.
          Mit zwei flexiblen Feldern verteilt sich die Luft auf oben und unten -
          der Inhalt sitzt mittig, der Knopf bleibt in Daumennaehe. */}
      <div className="tour-luft" aria-hidden="true" />
      <div className="tour-punkte" aria-hidden="true">
        {schritte.map((_, k) => <i key={k} className={k === i ? "an" : ""} />)}
      </div>
      <button className="btn btn-primary btn-go" onClick={() => letzter ? onFertig() : setI(i + 1)}>
        {letzter ? t("tour.los") : t("tour.weiter")}
      </button>
    </div>
  );
}

/* Namenswahl - einmal gebaut, zweimal benutzt: fuer das Kind und fuer den
 * Begleiter. Beide funktionieren gleich, also darf es sie nicht zweimal im Code
 * geben. Sechs Vorschlaege zum Antippen, ein Feld zum Selbstausdenken.
 */
function NamensWahl({ titel, wert, topf, platzhalter, zuruecksetzen, onWaehlen }) {
  const [wuerfel, setWuerfel] = useState(0);
  const [eigen, setEigen] = useState("");
  /* Der aktuell gewaehlte Name steht IMMER vorn - auch wenn er selbst ausgedacht
     war und gar nicht im Topf liegt. Sonst sieht man nirgends, wie man gerade
     heisst, und weiss nicht, was das Antippen aendern wuerde. */
  const vorschlaege = React.useMemo(() => {
    const zufall = shuffle([...topf]).filter((n) => n !== wert).slice(0, wert ? 5 : 6);
    return wert ? [wert, ...zufall] : zufall;
  }, [wuerfel, topf, wert]);
  const uebernehmen = () => { if (eigen.trim()) { onWaehlen(eigen.trim()); setEigen(""); } };
  return (
    <>
      <div className="list-title">{titel}</div>
      <div className="nw-liste" style={{ marginBottom: 10 }}>
        {vorschlaege.map((n) => (
          <button key={n} className={"chip" + (wert === n ? " on" : "")}
            onClick={() => onWaehlen(n)}>{n}</button>
        ))}
        <button className="chip chip-wuerfel" onClick={() => setWuerfel((w) => w + 1)}>
          {t("name.andere")}
        </button>
      </div>
      <div className="fieldrow">
        <input className="field" placeholder={platzhalter} value={eigen}
          onChange={(e) => setEigen(e.target.value.slice(0, 18))}
          onKeyDown={(e) => e.key === "Enter" && uebernehmen()} />
        <button className="btn btn-ghost" disabled={!eigen.trim()} onClick={uebernehmen}>{t("name.passt")}</button>
      </div>
      {zuruecksetzen && (
        <button className="link-inline" onClick={zuruecksetzen.tu}>{zuruecksetzen.l}</button>
      )}
    </>
  );
}

/* Profil - die Reihenfolge ist Marcs und folgt der Logik "erst verstehen, dann
 * gestalten": Sprache (sonst kann man den Rest nicht lesen), eigener Name,
 * dann Bloop selbst, dann das Aussehen der App, zuletzt die Erklaerung zum
 * Kopfhoerer.
 *
 * **Es gibt nur einen Begleiter.** Die Wahl zwischen Frida und Finn ist
 * entfallen: es war dieselbe Zeichnung in zwei Farben, also keine Wahl zwischen
 * Figuren, sondern eine Farbeinstellung mit zwei Namen davor. Jetzt gibt es
 * Bloop - benennbar und einfaerbbar.
 */
function Profil({ meta, onSetzen, onBack, sound }) {
  const f = farbeVon(meta);
  const name = buddyName(meta);
  const leben = useOctoLeben();
  return (
    <>
      <ZurueckKnopf onClick={onBack} />

      {/* Bloop steht oben und traegt die gewaehlte Farbe: Die Seite handelt von
          ihm, also zeigt sie ihn - und jede Farbaenderung ist sofort an ihm zu
          sehen, statt nur an einem Punkt in einer Reihe. */}
      <div className="profil-held">
        <div className="profil-held-figur">
          <OctoIcon s={96} blick={leben.blick}
            kopfhoerer={!!(sound && sound.idx > 0)} />
        </div>
        <div className="profil-held-name">{name}</div>
      </div>

      {/* 1. Sprache - zuerst, weil ohne sie nichts anderes lesbar ist. */}
      <div className="profil-block">
        <div className="list-title">{t("profil.sprache")}</div>
        <div className="sprach-reihe">
          {SPRACHEN.map((x) => (
            <button key={x.c} lang={x.c}
              className={"sprach-chip" + (x.c === SPR ? " an" : "")}
              aria-pressed={x.c === SPR}
              onClick={() => onSetzen({ sprache: x.c })}>{x.n}</button>
          ))}
        </div>
      </div>

      {/* 2. Der eigene Name. */}
      <div className="profil-block">
        <NamensWahl
          titel={t("name.frage")}
          wert={meta.deckname || ""}
          topf={FANTASIENAMEN}
          platzhalter={t("name.eigen")}
          onWaehlen={(n) => onSetzen({ deckname: n, namenSpaeter: true })}
          zuruecksetzen={meta.deckname ? {
            l: t("profil.keinname"),
            tu: () => onSetzen({ deckname: "" }),
          } : null}
        />
        <p className="profil-hinweis">
          {t("profil.namehinweis").replace("%N%", name)}
        </p>
      </div>

      {/* 3. Bloops Name. */}
      <div className="profil-block">
        <NamensWahl
          titel={t("profil.buddyname")}
          wert={meta.buddyName || ""}
          topf={BUDDY_NAMEN}
          platzhalter={t("name.eigen")}
          onWaehlen={(n) => onSetzen({ buddyName: n })}
          zuruecksetzen={meta.buddyName ? {
            l: t("name.zurueck") + BUDDY_STANDARD,
            tu: () => onSetzen({ buddyName: "" }),
          } : null}
        />
      </div>

      {/* 4. Farbe und Helligkeit. */}
      <div className="profil-block">
        <div className="list-title">{t("profil.farbe")}</div>
        <div className="farb-reihe">
          {FARBEN.map((x) => (
            <button key={x.k} className="farb-punkt" data-farbe={x.k} aria-label={x.l}
              aria-pressed={x.k === f} onClick={() => onSetzen({ farbe: x.k })} />
          ))}
        </div>
        <div className="modus-reihe">
          {MODI.map((x) => (
            <button key={x.k} className={"modus-knopf" + (x.k === modusVon(meta) ? " an" : "")}
              aria-pressed={x.k === modusVon(meta)} onClick={() => onSetzen({ modus: x.k })}>
              {x.l}{x.hint && <small>{x.hint}</small>}
            </button>
          ))}
        </div>
        <p className="profil-hinweis">{t("profil.farbhinweis").replace("%N%", name)}</p>
      </div>

      {/* 5. Der Kopfhoerer - Erklaerung, keine Einstellung. */}
      <div className="profil-block">
        <div className="list-title">{t("prof.ton")}</div>
        {/* Das Symbol gehoert hierher: der Absatz erklaert genau dieses Zeichen
            aus der Topbar. Ohne Bild muss man sich erinnern, wovon die Rede ist. */}
        <div className="profil-ton">
          <span className="profil-ton-icon" aria-hidden="true"><KopfhoererIcon /></span>
          <p className="profil-hinweis" style={{ margin: 0 }}>{t("profil.tonhinweis")}</p>
        </div>
      </div>
    </>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="2.1" />
      <circle cx="12" cy="12" r="2.1" />
      <circle cx="19" cy="12" r="2.1" />
    </svg>
  );
}

/* Menue als Blatt von unten. Auf dem Handy ist das die einzige Stelle, die der
 * Daumen sicher erreicht - und es raeumt die Startseite frei, damit dort nur
 * noch Begruessung und der eine Weg ins Lernen stehen.
 * Der Ton steht mit drin: er ist eine Einstellung, kein staendiger Begleiter.
 */
function Menue({ onZu, sound, eintraege }) {
  // Nach unten wischen schliesst - dieselbe Richtung, aus der das Blatt kam.
  // Erst ab 70px, damit ein Daumenrutsch beim Tippen nichts zumacht.
  const zug = useRef(null);
  const [dy, setDy] = useState(0);
  const [faellt, setFaellt] = useState(false);
  const runter = (e) => { zug.current = e.clientY; setFaellt(false); };
  const zieh = (e) => {
    if (zug.current == null) return;
    const d = e.clientY - zug.current;
    if (d > 0) setDy(d);
  };
  const los = () => {
    if (zug.current == null) return;
    zug.current = null;
    if (dy > 70) { setFaellt(true); setDy(420); setTimeout(onZu, 190); }
    else setDy(0);
  };
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onZu();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onZu]);
  return (
    <div className="menue-grund" onClick={onZu} role="presentation">
      <div className={"menue" + (faellt ? " faellt" : dy ? " zieht" : "")}
        style={dy ? { transform: `translateY(${dy}px)` } : undefined}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={runter} onPointerMove={zieh} onPointerUp={los} onPointerCancel={los}
        role="dialog" aria-modal="true" aria-label={t("menue.aria")}>
        <div className="menue-griff" aria-hidden="true" />
        {sound && sound.supported && (
          <button className="menue-zeile" onClick={sound.cycle}>
            <span className="menue-icon"><KopfhoererIcon /></span>
            <span className="menue-text">
              Hintergrundton
              <small>{NOISES[sound.idx].voll}{t("ton.wechseln")}</small>
            </span>
            <span className="sound-punkte" aria-hidden="true">
              {NOISES.slice(1).map((n, i) => (
                <i key={n.k} className={i < sound.idx ? "an" : ""} />
              ))}
            </span>
          </button>
        )}
        {eintraege.map((e) => (
          <button key={e.l} className="menue-zeile" onClick={() => { onZu(); e.tu(); }}>
            <span className="menue-icon">{e.icon}</span>
            <span className="menue-text">{e.l}{e.sub && <small>{e.sub}</small>}</span>
          </button>
        ))}
        <button className="menue-schliessen" onClick={onZu}>{t("allg.schliessen")}</button>
      </div>
    </div>
  );
}

function Home({ decks, sound, deckname, meta, onMeta, onAdd, onImport, onCatalog, onFoto, onMix, onUeberblick, onProfil }) {
  const marke = useMarke();
  const [name, setName] = useState("");
  // Ohne Karteien ist das Anlegen das Naheliegende — sonst bleibt es weggeraeumt.
  const [menue, setMenue] = useState(false);
  const [newOpen, setNewOpen] = useState(decks.length === 0);
  const [impOpen, setImpOpen] = useState(false);
  const [imp, setImp] = useState("");
  const [impErr, setImpErr] = useState("");
  const [restOpen, setRestOpen] = useState(false);
  const aktive = decks.filter((d) => !d.resting);
  const gesamtKarten = aktive.reduce((n, d) => n + d.cards.length, 0);
  const faellig = aktive.reduce((n, d) => n + faelligeVon(d), 0);
  const heute = Math.min(faellig, SESSION_CARDS);
  // Welche Faecher sind heute dabei? Bei Katalog-Stapeln steht das Fach vor dem ersten „·“.
  const heuteDabei = [...new Set(aktive.filter((d) => d.cards.some(isDue))
    .map((d) => d.name.split("·")[0].trim()))];
  // Robin sagt einen Satz zur Lage — und zeigt nie den ganzen Berg. Wer lange weg war,
  // bekommt eine Handvoll, nicht 300 Karten und ein schlechtes Gewissen.
  // War wirklich lange nichts? Das steht schon in den Karten (`last`) — kein neues Feld,
  // keine neue Datenspur. Nur so ist „Willkommen zurueck“ auch wahr.
  const zuletzt = aktive.reduce((t, d) => d.cards.reduce((m, c) => Math.max(m, c.last || 0), t), 0);
  const langeWeg = zuletzt > 0 && Date.now() - zuletzt > 7 * DAY;
  // Erst die Begruessung, dann was ansteht. „Willkommen zurueck“ steckt jetzt im Gruss,
  // deshalb sagt der Karten-Satz es nicht noch einmal.
  // Zaehlt, wie oft ueberhaupt geantwortet wurde - steht schon in den Karten,
  // braucht also kein neues Feld und keine neue Datenspur.
  const antwortenGesamt = decks.reduce((n, d) => n + d.cards.reduce((m, c) => m + (c.reps || 0), 0), 0);
  const zeigeNamensangebot = antwortenGesamt >= 40 && !(meta && meta.namensangebot) && !(meta && meta.buddyName);
  const fenster = grussFenster(langeWeg, deckname);
  const gruss = React.useMemo(
    () => (meta && meta.grussFenster === fenster && meta.grussText)
      ? { text: meta.grussText, ueber: meta.grussUeber || "" }
      : waehleGruss(langeWeg, deckname),
    [fenster, deckname]
  );
  useEffect(() => {
    if (!onMeta) return;
    if (!meta || meta.grussFenster !== fenster || meta.grussText !== gruss.text) {
      onMeta({ grussFenster: fenster, grussText: gruss.text, grussUeber: gruss.ueber });
    }
  }, [fenster, gruss.text]);
  const satz = decks.length === 0 ? t("home.leer")
    : aktive.length === 0 ? t("home.alleweg")
      : faellig === 0 ? t("home.nichts")
        : faellig > SESSION_CARDS
          ? t("home.ausgesucht").replace("%N%", SESSION_CARDS)
          : faellig === 1 ? t("home.eine")
            : t("home.mehrere").replace("%N%", faellig);
  const create = () => { const n = name.trim(); if (n) { onAdd(n); setName(""); setNewOpen(false); } };
  const doImport = () => {
    try {
      const dk = decodeDeck(imp);
      if (!dk.cards.length) throw new Error("leer");
      onImport(dk); setImp(""); setImpOpen(false); setImpErr("");
    } catch { setImpErr(t("imp.fehler")); }
  };
  return (
    <>
      <div className="topbar">
        {/* Auf der Startseite fuehrt das Zeichen ins Profil - der Weg nach Hause
            waere hier folgenlos. Auf allen anderen Seiten fuehrt es nach Hause. */}
        <button className="brand brand-heim" onClick={onProfil}
          aria-label={marke + " — Begleiter und Farbe"} title={t("menue.profil")}>
          <span className="brand-mark"><OctoIcon kopfhoerer={!!(sound && sound.idx > 0)} /></span>
          <span className="brand-name">{marke}</span>
        </button>
      </div>
      {/* „Heute“ statt Inventar: die Startseite beantwortet, was jetzt dran ist —
          nicht, was alles da ist. Ein Tap bis zum Lernen. */}
      <div className="today">
        {/* Robin spricht — deshalb in Anfuehrungszeichen. Die Schriftgroesse haengt an der
            Laenge: kurze Grüße stehen gross da, lange bleiben lesbar statt zu zerbrechen. */}
        <div className={"gruss" + (gruss.text.length > 46 ? " klein" : gruss.text.length > 24 ? " mittel" : "")}>
          <span className="gruss-text">„{gruss.text}“</span>
        </div>
        {/* Uebersetzung nur bei fremdsprachigen Gruessen - bei deutschen waere
            die Zeile eine leere Wiederholung. */}
        {gruss.ueber && <div className="gruss-ueber">{gruss.ueber}</div>}
        <div className="today-say">{satz}</div>
        {/* Einmalig, nach 40 Antworten: da kennt man sich schon. Wegklickbar,
            und danach nie wieder - ein Angebot, keine Aufgabe. */}
        {zeigeNamensangebot && (
          <div className="angebot">
            <span>{t("home.angebot")}</span>
            <div className="angebot-knoepfe">
              <button className="btn btn-ghost" onClick={() => { onMeta({ namensangebot: "erledigt" }); onProfil(); }}>
                Namen aussuchen
              </button>
              <button className="link-inline" onClick={() => onMeta({ namensangebot: "erledigt" })}>
                Passt schon
              </button>
            </div>
          </div>
        )}
        {/* Ausblick, aber qualitativ: *was* kommt, nicht *wie viel*. Eine Menge vor dem Start
            waere ein Pensum — und ein Pensum, das man nicht schafft, ist ein Vorwurf. */}
        {heuteDabei.length > 0 && (
          <div className="ausblick">
            {heuteDabei.slice(0, 4).map((f) => <span key={f} className="chip-still">{f}</span>)}
            {heuteDabei.length > 4 && <span className="chip-still">+{heuteDabei.length - 4}</span>}
          </div>
        )}
      </div>

      {/* Anlegen und Importieren erscheinen nur, wenn man sie aus dem Menue
          geholt hat - oder wenn noch gar keine Kartei da ist. Sonst waere die
          Startseite wieder eine Verwaltungsseite. */}
      {newOpen && (
        <div className="newdeck">
          <input className="field" placeholder={t("neu.platz")} value={name} autoFocus
            onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} />
          <button className="btn btn-ghost" onClick={create} disabled={!name.trim()}>Anlegen</button>
        </div>
      )}
      {impOpen && (
        <div className="panel" style={{ marginTop: 10 }}>
          <div className="panel-title">Kartei per Code
            <button className="panel-close" onClick={() => setImpOpen(false)} aria-label="Schließen">×</button>
          </div>
          <textarea className="share-ta" placeholder={t("imp.platz")} value={imp} onChange={(e) => setImp(e.target.value)} />
          {impErr && <div className="hint-err">{impErr}</div>}
          <button className="btn btn-ghost" style={{ width: "100%", marginTop: 10 }} onClick={doImport} disabled={!imp.trim()}>Importieren</button>
        </div>
      )}
      {menue && (
        <Menue onZu={() => setMenue(false)} sound={sound} eintraege={[
          { l: t("menue.bib"), sub: t("menue.bib.sub"), icon: <BooksIcon />, tu: onCatalog },
          { l: t("menue.neu"), sub: t("menue.neu.sub"), icon: <PencilIcon />, tu: () => setNewOpen(true) },
          { l: t("menue.code"), sub: t("menue.code.sub"), icon: <ShareIcon />, tu: () => { setImpOpen(true); setImpErr(""); } },
          { l: t("menue.ueber"), sub: t("menue.ueber.sub"), icon: <GridIcon />, tu: onUeberblick },
          { l: t("menue.profil"), sub: t("menue.profil.sub").replace("%N%", marke), icon: <OctoIcon s={20} />, tu: onProfil },
        ]} />
      )}
      {/* Die Querbeet-Kachel ist entfallen: „Los geht's“ oben macht genau das,
          und zwar als Hauptsache statt als eine Kachel unter vielen. */}
      {/* Startrampe unten: der Daumen liegt am unteren Bildschirmdrittel, dort gehoert die
          Hauptsache hin. `margin-top:auto` schiebt sie ans Ende, ohne etwas zu ueberdecken. */}
      {/* Ein Knopf, ein Wort, immer gruen. Ob heute etwas faellig ist, steht in der
          Ueberschrift — der Knopf bleibt die Einladung und wechselt nicht das Aussehen.
          Quiz und Spiele liegen in der Bibliothek, wo alles andere auch liegt. */}
      <div className="startrampe">
        {gesamtKarten > 0 && (
          <button className="btn btn-primary btn-go" onClick={onMix}>{t("home.los")}</button>
        )}
      </div>

      <div className="footer-pay">{t("home.fuss")}</div>
      {/* Ganz unten, auf derselben Hoehe wie "Schliessen" im geoeffneten Blatt:
          der Daumen liegt beim Auf- und Zumachen an derselben Stelle. */}
      <button className="menue-knopf" onClick={() => setMenue(true)} aria-label={t("home.menue")}
        title={t("menue.titel")}>
        <MenuIcon />
      </button>
    </>
  );
}

function DeckRow({ d, onOpen, resting }) {
  const due = resting ? 0 : faelligeVon(d);
  const present = STUFE3.map((m) => d.cards.some((c) => stufe3Von(c).key === m.key));
  return (
    // Echter Knopf, kein div mit onClick: sonst ist die Hauptfunktion der App
    // per Tastatur nicht erreichbar und fuer Screenreader gar kein Bedienelement.
    <button type="button" className={"deck" + (resting ? " resting" : "")} onClick={() => onOpen(d.id)}>
      <div className="deck-row">
        <span className="deck-name">{d.name}</span>
        <span className={"deck-due" + (due ? "" : " zero")}>
          {/* Ueber einer Sitzung wird nicht mehr ausgezaehlt: „180 fällig“ ist der Berg,
              vor dem man aufgibt. „20+“ sagt dasselbe, ohne zu druecken. */}
          {resting ? "ruht" : due > SESSION_CARDS ? `${SESSION_CARDS}+ fällig`
            : due ? `${due} fällig` : "nichts fällig"}
        </span>
      </div>
      <div className="deck-meta">{d.cards.length} {t("allg.karten")}</div>
      <div className="minibar">{present.map((on, i) => <span key={i} className={on ? "on" : ""} />)}</div>
    </button>
  );
}

/* ---------------- Vier gewinnt ----------------
 * 7x6, Robin setzt danach. Drei Stufen, die sich wirklich unterscheiden:
 *  Leicht   — Robin nimmt einen zufaelligen sinnvollen Zug, gewinnt aber, wenn er kann.
 *  Mittel   — Robin gewinnt sofort und blockt den direkten Gegenzug.
 *  Knifflig — Minimax mit Tiefe 4, sieht also zwei Zuege voraus.
 * Kein Punktestand, keine Uhr. Man kann jederzeit neu anfangen.
 */
const VG_S = 7, VG_Z = 6;                    // Spalten, Zeilen
const vgLeer = () => Array(VG_S * VG_Z).fill(0);
const vgFrei = (b, sp) => { for (let z = VG_Z - 1; z >= 0; z--) if (!b[z * VG_S + sp]) return z; return -1; };
const vgMoeglich = (b) => [...Array(VG_S).keys()].filter((sp) => vgFrei(b, sp) >= 0);
const vgSetze = (b, sp, wer) => { const z = vgFrei(b, sp); if (z < 0) return b; const n = b.slice(); n[z * VG_S + sp] = wer; return n; };
// Gibt die vier Felder der Gewinnreihe zurueck, sonst null
function vgSieg(b, wer) {
  const richtungen = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let z = 0; z < VG_Z; z++) for (let sp = 0; sp < VG_S; sp++) {
    if (b[z * VG_S + sp] !== wer) continue;
    for (const [dx, dy] of richtungen) {
      const reihe = [];
      for (let k = 0; k < 4; k++) {
        const x = sp + dx * k, y = z + dy * k;
        if (x < 0 || x >= VG_S || y < 0 || y >= VG_Z || b[y * VG_S + x] !== wer) break;
        reihe.push(y * VG_S + x);
      }
      if (reihe.length === 4) return reihe;
    }
  }
  return null;
}
// Stellungsbewertung fuer die knifflige Stufe: Mitte ist mehr wert, Dreierreihen zaehlen.
function vgWert(b, wer) {
  const gegner = 3 - wer;
  if (vgSieg(b, wer)) return 10000;
  if (vgSieg(b, gegner)) return -10000;
  let w = 0;
  for (let z = 0; z < VG_Z; z++) w += b[z * VG_S + 3] === wer ? 3 : b[z * VG_S + 3] === gegner ? -3 : 0;
  const richtungen = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let z = 0; z < VG_Z; z++) for (let sp = 0; sp < VG_S; sp++)
    for (const [dx, dy] of richtungen) {
      const f = [];
      for (let k = 0; k < 4; k++) {
        const x = sp + dx * k, y = z + dy * k;
        if (x < 0 || x >= VG_S || y < 0 || y >= VG_Z) { f.length = 0; break; }
        f.push(b[y * VG_S + x]);
      }
      if (f.length !== 4) continue;
      const meine = f.filter((v) => v === wer).length, seine = f.filter((v) => v === gegner).length;
      if (meine && seine) continue;                      // blockiertes Fenster zaehlt nicht
      if (meine === 3) w += 12; else if (meine === 2) w += 3;
      if (seine === 3) w -= 14; else if (seine === 2) w -= 3;
    }
  return w;
}
function vgMinimax(b, tiefe, wer, amZug, alpha, beta) {
  const zuege = vgMoeglich(b);
  if (!tiefe || !zuege.length || vgSieg(b, 1) || vgSieg(b, 2)) return { wert: vgWert(b, wer) };
  let bester = null;
  if (amZug === wer) {
    let max = -Infinity;
    for (const sp of zuege) {
      const w = vgMinimax(vgSetze(b, sp, amZug), tiefe - 1, wer, 3 - amZug, alpha, beta).wert;
      if (w > max) { max = w; bester = sp; }
      alpha = Math.max(alpha, w); if (beta <= alpha) break;
    }
    return { wert: max, zug: bester };
  }
  let min = Infinity;
  for (const sp of zuege) {
    const w = vgMinimax(vgSetze(b, sp, amZug), tiefe - 1, wer, 3 - amZug, alpha, beta).wert;
    if (w < min) { min = w; bester = sp; }
    beta = Math.min(beta, w); if (beta <= alpha) break;
  }
  return { wert: min, zug: bester };
}
function vgZug(b, stufe) {
  const zuege = vgMoeglich(b);
  if (!zuege.length) return -1;
  for (const sp of zuege) if (vgSieg(vgSetze(b, sp, 2), 2)) return sp;      // selbst gewinnen: immer
  if (stufe === 0) return zuege[Math.floor(Math.random() * zuege.length)];
  for (const sp of zuege) if (vgSieg(vgSetze(b, sp, 1), 1)) return sp;      // Gegner stoppen
  if (stufe === 1) {
    const mitte = zuege.sort((a, c) => Math.abs(3 - a) - Math.abs(3 - c));
    return mitte[0];
  }
  const z = vgMinimax(b, 4, 2, 2, -Infinity, Infinity).zug;
  return z === null || z === undefined ? zuege[0] : z;
}

const VG_STUFEN = [{ label: "Leicht" }, { label: "Mittel" }, { label: "Knifflig" }];

function VierGewinnt({ sound, onBack }) {
  const marke = useMarke();
  const [stufe, setStufe] = useState(1);
  const [brett, setBrett] = useState(vgLeer);
  const [dran, setDran] = useState(1);          // 1 = du, 2 = der Begleiter
  const [denkt, setDenkt] = useState(false);
  const meinSieg = vgSieg(brett, 1), robinSieg = vgSieg(brett, 2);
  const voll = !vgMoeglich(brett).length;
  const vorbei = !!meinSieg || !!robinSieg || voll;
  const leuchtet = meinSieg || robinSieg || [];

  /* Robins Antwort haengt direkt am Zug, nicht an einem Effekt ueber dem Brett:
   * ein Effekt mit `brett` in den Abhaengigkeiten feuert bei *jeder* Brettaenderung und
   * hat Robin mehrfach ziehen lassen. So gilt: ein Klick, genau ein Zugpaar. */
  const uhr = useRef(null);
  useEffect(() => () => clearTimeout(uhr.current), []);

  const wirf = (sp) => {
    if (vorbei || dran !== 1 || denkt || vgFrei(brett, sp) < 0) return;
    const nach = vgSetze(brett, sp, 1);
    setBrett(nach); haptik(HAPTIK.ablegen);
    if (vgSieg(nach, 1) || !vgMoeglich(nach).length) return;   // Spiel ist aus, Robin zieht nicht mehr
    setDran(2); setDenkt(true);
    clearTimeout(uhr.current);
    uhr.current = setTimeout(() => {                            // kurze Pause, sonst wirkt es hektisch
      const z = vgZug(nach, stufe);
      if (z >= 0) { setBrett(vgSetze(nach, z, 2)); haptik(HAPTIK.umdrehen); }
      setDran(1); setDenkt(false);
    }, 380);
  };
  const neu = (st) => { clearTimeout(uhr.current); setStufe(st); setBrett(vgLeer()); setDran(1); setDenkt(false); };

  return (
    <div className="lo">
      <ZurueckKnopf onClick={onBack} sound={sound} />
      <div className="h1">Vier gewinnt</div>

      <div className="lo-levels">
        {VG_STUFEN.map((l, i) => (
          <button key={l.label} className={"chip" + (i === stufe ? " on" : "")}
            onClick={() => neu(i)} aria-pressed={i === stufe}>{l.label}</button>
        ))}
      </div>

      <div className="vg-brett" role="group" aria-label={t("spiel.brett7")}>
        {brett.map((v, idx) => {
          const sp = idx % VG_S;
          return (
            <button key={idx} className="vg-feld" onClick={() => wirf(sp)}
              disabled={vorbei || dran !== 1 || vgFrei(brett, sp) < 0}
              aria-label={`Spalte ${sp + 1} ${v === 1 ? t("spiel.dranstein") : v === 2 ? t("spiel.gegnerstein").replace("%N%", marke) : "— frei"}`}>
              <span className={"vg-stein" + (v === 1 ? " du" : v === 2 ? " robin" : "")
                + (leuchtet.includes(idx) ? " leuchtet" : "")} />
            </button>
          );
        })}
      </div>

      <div className="lo-status">
        {meinSieg ? <><span className="done">Vier in einer Reihe.</span>{t("spiel.gewonnen")}</>
          : robinSieg ? <><span className="done">Robin hat vier.</span>Nochmal?</>
            : voll ? <><span className="done">Voll.</span>{t("spiel.remis")}</>
              : denkt ? t("spiel.denkt").replace("%N%", marke) : t("spiel.dran")}
      </div>

      <div className="lo-actions">
        <button className="btn btn-ghost" onClick={() => neu(stufe)}>Neues Spiel</button>
      </div>
    </div>
  );
}

/* ---------------- Rohrleitung ----------------
 * Kacheln drehen, bis alles am Anschluss haengt. Bitmaske je Feld: 1=oben, 2=rechts,
 * 4=unten, 8=links. Drehen im Uhrzeigersinn schiebt die Bits um eins weiter.
 *
 * Erzeugt wird zuerst die *Loesung*: ein zufaelliger Spannbaum ueber alle Felder. Danach
 * wird jedes Feld zufaellig verdreht. Damit ist jedes Raetsel garantiert loesbar — dieselbe
 * Idee wie bei „Lichter aus“, wo rueckwaerts aus dem geloesten Zustand gemischt wird.
 *
 * Gewonnen ist, wenn vom Anschluss aus *alle* Felder erreichbar sind. Das genuegt als
 * Pruefung: Ein Spannbaum hat 2*(n-1) offene Enden, ein Paar passender Enden ergibt genau
 * eine Verbindung — mehr als n-1 Verbindungen kann es also nicht geben. Sind alle Felder
 * verbunden, sitzt zwangslaeufig jedes Ende an seinem Partner, es bleibt nichts offen.
 */
const RL_STUFEN = [{ label: "Sanft", n: 4 }, { label: "Mittel", n: 5 }, { label: "Knifflig", n: 6 }];
const RL_SEITEN = [{ bit: 1, dx: 0, dy: -1, gegen: 4 }, { bit: 2, dx: 1, dy: 0, gegen: 8 },
                   { bit: 4, dx: 0, dy: 1, gegen: 1 }, { bit: 8, dx: -1, dy: 0, gegen: 2 }];
const rlDreh = (m) => ((m << 1) | (m >> 3)) & 15;

function rlBaue(n) {
  const masken = Array(n * n).fill(0);
  const gesehen = Array(n * n).fill(false);
  const stapel = [0];
  gesehen[0] = true;
  while (stapel.length) {
    const hier = stapel[stapel.length - 1];
    const x = hier % n, y = Math.floor(hier / n);
    const offen = shuffle(RL_SEITEN.filter((s) => {
      const nx = x + s.dx, ny = y + s.dy;
      return nx >= 0 && nx < n && ny >= 0 && ny < n && !gesehen[ny * n + nx];
    }).slice());
    if (!offen.length) { stapel.pop(); continue; }
    const s = offen[0];
    const ziel = (y + s.dy) * n + (x + s.dx);
    masken[hier] |= s.bit; masken[ziel] |= s.gegen;
    gesehen[ziel] = true; stapel.push(ziel);
  }
  return masken;
}
// Vom Anschluss aus fluten: welche Felder haengen dran?
function rlVerbunden(masken, n) {
  const dran = Array(n * n).fill(false);
  const stapel = [0]; dran[0] = true;
  while (stapel.length) {
    const hier = stapel.pop();
    const x = hier % n, y = Math.floor(hier / n);
    for (const s of RL_SEITEN) {
      if (!(masken[hier] & s.bit)) continue;
      const nx = x + s.dx, ny = y + s.dy;
      if (nx < 0 || nx >= n || ny < 0 || ny >= n) continue;
      const ziel = ny * n + nx;
      if (dran[ziel] || !(masken[ziel] & s.gegen)) continue;
      dran[ziel] = true; stapel.push(ziel);
    }
  }
  return dran;
}
/* Die aktuelle Maske ergibt sich aus Grundform + Drehung. EINE Wahrheit:
   vorher wurde die Maske gedreht UND die Grafik per CSS - das Feld stand damit
   um 90 Grad neben dem, was die App rechnete. Wer optisch alles richtig legte,
   bekam kein "fertig"; genau der gemeldete Fehler.
   Gezeichnet wird deshalb immer die GRUNDFORM, gedreht wird nur per CSS, und
   gerechnet wird mit dieser abgeleiteten Maske. */
const rlMaskeBei = (grund, winkel) => {
  const schritte = ((Math.round(winkel / 90) % 4) + 4) % 4;
  let x = grund;
  for (let k = 0; k < schritte; k++) x = rlDreh(x);
  return x;
};
const rlMasken = (sp) => sp.grund.map((g, i) => rlMaskeBei(g, sp.winkel[i]));

function rlMische(n) {
  const grund = rlBaue(n);
  let winkel;
  do {
    winkel = grund.map(() => Math.floor(Math.random() * 4) * 90);
  } while (rlVerbunden(grund.map((g, i) => rlMaskeBei(g, winkel[i])), n).every(Boolean));
  return { grund, winkel };   // nicht schon geloest ausliefern
}

function RohrIcon({ maske, an }) {
  const teile = [];
  if (maske & 1) teile.push(<line key="n" x1="12" y1="12" x2="12" y2="0" />);
  if (maske & 2) teile.push(<line key="e" x1="12" y1="12" x2="24" y2="12" />);
  if (maske & 4) teile.push(<line key="s" x1="12" y1="12" x2="12" y2="24" />);
  if (maske & 8) teile.push(<line key="w" x1="12" y1="12" x2="0" y2="12" />);
  return (
    <svg viewBox="0 0 24 24" className={"rl-rohr" + (an ? " an" : "")} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="4.6" strokeLinecap="round">{teile}</g>
      {maske && maske !== 1 && maske !== 2 && maske !== 4 && maske !== 8
        ? null : <circle cx="12" cy="12" r="3.1" fill="currentColor" />}
    </svg>
  );
}

function Rohrleitung({ sound, onBack }) {
  const [stufe, setStufe] = useState(1);
  const n = RL_STUFEN[stufe].n;
  const [spiel, setSpiel] = useState(() => rlMische(RL_STUFEN[1].n));
  const dran = rlVerbunden(rlMasken(spiel), n);
  const fertig = dran.every(Boolean);

  const drehe = (i) => {
    if (fertig) return;
    haptik(HAPTIK.umdrehen);
    // Nur der Winkel wandert. Die Maske wird daraus abgeleitet, nie getrennt
    // mitgedreht - sonst laufen Bild und Rechnung auseinander.
    setSpiel((sp) => ({ ...sp, winkel: sp.winkel.map((w, k) => (k === i ? w + 90 : w)) }));
  };
  const neu = (st) => { setStufe(st); setSpiel(rlMische(RL_STUFEN[st].n)); };

  return (
    <div className="lo">
      <ZurueckKnopf onClick={onBack} sound={sound} />
      <div className="h1">Rohrleitung</div>
      <div className="sub">{t("rohr.sub")}</div>

      <div className="lo-levels">
        {RL_STUFEN.map((l, i) => (
          <button key={l.label} className={"chip" + (i === stufe ? " on" : "")}
            onClick={() => neu(i)} aria-pressed={i === stufe}>{l.label}</button>
        ))}
      </div>

      <div className="rl-brett" style={{ gridTemplateColumns: `repeat(${n},1fr)` }}
        role="group" aria-label={`Spielfeld, ${n} mal ${n} Felder`}>
        {spiel.grund.map((m, i) => (
          <button key={i} className={"rl-feld" + (i === 0 ? " quelle" : "")} onClick={() => drehe(i)}
            disabled={fertig}
            aria-label={`Zeile ${Math.floor(i / n) + 1}, Spalte ${(i % n) + 1}${dran[i] ? " — angeschlossen" : ""}`}>
            <span className="rl-dreher" style={{ transform: `rotate(${spiel.winkel[i]}deg)` }}>
              <RohrIcon maske={m} an={dran[i]} />
            </span>
          </button>
        ))}
      </div>

      <div className="lo-status">
        {fertig ? <><span className="done">{t("rohr.fertig")}</span>Kein Tropfen daneben.</>
          : `${dran.filter(Boolean).length} von ${n * n} hängen dran.`}
      </div>

      <div className="lo-actions">
        <button className="btn btn-ghost" onClick={() => neu(stufe)}>{t("spiel.neu")}</button>
      </div>
    </div>
  );
}

/* Konfettiregen zum Meilenstein. Kurz, einmalig, und er verlangt nichts — man kann ihn
 * jederzeit wegtippen. Farben aus der Palette plus zwei warme Toene.
 * Bei `prefers-reduced-motion` bleibt der Satz, das Konfetti entfaellt.
 */
const LOB = [
  "Das hast du toll gemacht", "Stark", "Alle Achtung", "Sauber", "Da schau her", "Respekt",
];
function Feier({ feier, deckname, onZu }) {
  const [lob] = useState(() => LOB[Math.floor(Math.random() * LOB.length)]);
  const [schnipsel] = useState(() => Array.from({ length: 70 }, () => ({
    x: Math.random() * 100,
    v: 2.2 + Math.random() * 2.2,
    d: Math.random() * 0.9,
    dreh: Math.random() * 720 - 360,
    art: Math.floor(Math.random() * 4),
    breit: 5 + Math.random() * 5,
  })));
  useEffect(() => { const t = setTimeout(onZu, 5200); return () => clearTimeout(t); }, [onZu]);
  return (
    <div className="feier" onClick={onZu} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onZu()} aria-label={t("tour.weiter.aria")}>
      <div className="feier-regen" aria-hidden="true">
        {schnipsel.map((k, i) => (
          <i key={i} className={"schnipsel f" + k.art}
            style={{ left: k.x + "%", width: k.breit, height: k.breit * 1.7,
                     animationDuration: k.v + "s", animationDelay: k.d + "s",
                     "--dreh": k.dreh + "deg" }} />
        ))}
      </div>
      <div className="feier-text">
        <div className="feier-zahl">{feier.zahl}</div>
        <div className="feier-was">{feier.was}</div>
        <div className="feier-lob">{lob}{deckname ? `, ${deckname}` : ""}.</div>
      </div>
    </div>
  );
}

/* Namensdialog beim ersten Start. Kurz, ueberspringbar, mit Robins Teamwork-Zeile. */
function Namenswahl({ onFertig, onSpaeter }) {
  const [vorschlaege, setVorschlaege] = useState(() => shuffle(FANTASIENAMEN.slice()).slice(0, 6));
  const [eigen, setEigen] = useState("");
  const wuerfeln = () => setVorschlaege(shuffle(FANTASIENAMEN.slice()).slice(0, 6));
  return (
    <div className="namenswahl">
      <div className="h1">Wie soll ich dich nennen?</div>
      <div className="sub">
        Bitte nicht deinen echten Namen — such dir was Lustiges aus. Ich merk mir nichts über
        dich, und ein ausgedachter Name bleibt ausgedacht.
      </div>
      <div className="nw-liste">
        {vorschlaege.map((n) => (
          <button key={n} className="chip" onClick={() => onFertig(n)}>{n}</button>
        ))}
        <button className="chip chip-wuerfel" onClick={wuerfeln}>{t("name.andere")}</button>
      </div>
      <div className="newdeck" style={{ marginTop: 16 }}>
        <input className="field" placeholder={t("name.eigen")} value={eigen} maxLength={24}
          onChange={(e) => setEigen(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && eigen.trim() && onFertig(eigen.trim())} />
        <button className="btn btn-ghost" disabled={!eigen.trim()} onClick={() => onFertig(eigen.trim())}>
          Passt
        </button>
      </div>
      <div className="nw-team">{t("name.team")}</div>
      <button className="link-inline" onClick={onSpaeter}>{t("name.spaeter")}</button>
    </div>
  );
}

/* ---------------- Überblick ----------------
 * Alles hier waechst nur oder beschreibt einen Zustand — nichts kann fallen und damit eine
 * Rueckkehr bestrafen. Deshalb: beantwortete Karten statt „heute geschafft“, Gesamtzeit statt
 * Tagespensum, und der Reifegrad als *Verteilung* statt als Punktzahl. Bewusst nicht auf der
 * Startseite: Wer die App oeffnet, soll lernen, nicht sich selbst betrachten.
 */
const REIFE3 = [
  { key: "frisch", get label() { return t("reife.frisch"); }, quellen: ["neu", "lernend"] },
  { key: "kommt", get label() { return t("reife.kommt"); }, quellen: ["jung"] },
  // "reif" gehoert zu "sitzt fest", nicht darunter: FSRS erreicht s>=180 erst nach
  // fuenf Wiederholungen ueber gut sieben Monate - bis dahin stand hier bei jedem
  // Kind dauerhaft 0 %, egal wie fleissig es war. s>=30 heisst: die Karte
  // uebersteht einen Monat. Fuer Schulwissen ist das "sitzt fest", und es ist
  // nach drei Wiederholungen in gut zwei Wochen erreichbar. FSRS selbst rechnet
  // unveraendert weiter - nur die Anzeige zaehlt jetzt, was ein Mensch zaehlen wuerde.
  { key: "fest", get label() { return t("reife.fest"); }, quellen: ["reif", "fest"] },
];
/* Kurzform fuer enge Stellen (die dreispaltige Faktenzeile). Die Langform
   bleibt fuer Fliesstext - dort liest sich "39 Minuten" besser als "39 min". */
function fmtDauerKurz(ms) {
  const min = Math.round(ms / 60000);
  if (min < 1) return "< 1 min";
  if (min < 60) return min + " min";
  const std = Math.floor(min / 60), rest = min % 60;
  if (std < 24) return rest ? std + " h " + rest + " min" : std + " h";
  return Math.floor(std / 24) + " d " + (std % 24) + " h";
}
function fmtDauer(ms) {
  const min = Math.round(ms / 60000);
  if (min < 1) return "ein paar Minuten";      // „0 Minuten“ sieht nach Fehler aus
  if (min === 1) return "1 Minute";
  if (min < 60) return `${min} Minuten`;
  const std = Math.floor(min / 60), rest = min % 60;
  if (std < 24) return rest ? `${std} Std. ${rest} Min.` : `${std} Stunden`;
  return `${Math.floor(std / 24)} Tage ${std % 24} Std.`;
}
/* Wann wurde in dieser Kartei zuletzt geantwortet? Steht schon in den Karten
   (`last`), braucht also kein neues Feld und keine neue Datenspur. */
const zuletztGelernt = (d) => (d.cards || []).reduce((m, c) => Math.max(m, c.last || 0), 0);
function fmtZuletzt(t) {
  if (!t) return t("ub.nie");
  const tage = Math.floor((Date.now() - t) / DAY);
  if (tage <= 0) return "heute gelernt";
  if (tage === 1) return "gestern gelernt";
  if (tage < 7) return "vor " + tage + " Tagen";
  if (tage < 14) return "vor einer Woche";
  if (tage < 60) return "vor " + Math.round(tage / 7) + " Wochen";
  return "vor " + Math.round(tage / 30) + " Monaten";
}
function fmtDatum(t) {
  return new Date(t).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
}

// Zaehlt eine Zahl weich hoch. Motivierend, ohne etwas zu behaupten — am Ende steht
// genau der Wert, der ohnehin stimmt. Bei `prefers-reduced-motion` sofort fertig.
function useHochzaehlen(ziel, dauer = 850) {
  const ruhig = typeof window !== "undefined"
    && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [wert, setWert] = useState(ruhig ? ziel : 0);
  useEffect(() => {
    if (ruhig || ziel === 0) { setWert(ziel); return; }
    let roh; const t0 = performance.now();
    const schritt = (t) => {
      const p = Math.min(1, (t - t0) / dauer);
      setWert(Math.round(ziel * (1 - Math.pow(1 - p, 3))));   // weich auslaufend
      if (p < 1) roh = requestAnimationFrame(schritt);
    };
    roh = requestAnimationFrame(schritt);
    return () => cancelAnimationFrame(roh);
  }, [ziel, dauer, ruhig]);
  return wert;
}

/* Erzeugt ein Bild des Fortschritts zum Weitergeben. Bewusst KEIN Abzug der
 * Seite: ein selbst gezeichnetes Bild ist aufgeraeumter, hat ein festes Format
 * fuer Messenger (4:5) und enthaelt nur, was hineingehoert.
 * Enthalten sind ausschliesslich Zahlen und der selbst gewaehlte Name - nichts,
 * was auf eine Person zeigt. Das Bild entsteht im Geraet und wird nirgends
 * hochgeladen; das Verschicken uebernimmt das Betriebssystem.
 */
/* Genitiv im Deutschen: Namen auf s, ss, ß, x, z bekommen nur einen Apostroph.
   Sonst stuende dort "Klaus's Fortschritt". */
function besitz(name) {
  if (!name) return "Mein Fortschritt";
  return /[sxzß]$/i.test(name) ? name + "' Fortschritt" : name + "s Fortschritt";
}

async function baueFortschrittsbild({ marke, name, gelernt, prozent, fest, gesamtKarten,
                                      wocheKarten, wocheMs, tageDabei, verlauf, stufen,
                                      beantwortet, gesamtZeit, farben }) {
  const B = 1080, H = 1350, c = document.createElement("canvas");
  c.width = B; c.height = H;
  const g = c.getContext("2d");
  const F = (px, w) => (w || 700) + " " + px + 'px ui-rounded, "SF Pro Rounded", system-ui, sans-serif';

  g.fillStyle = farben.grund; g.fillRect(0, 0, B, H);

  // Kopf
  g.fillStyle = farben.leise; g.font = F(34, 700); g.textAlign = "left";
  g.fillText(marke, 80, 110);
  g.fillStyle = farben.ink; g.font = F(62, 800);
  g.fillText(besitz(name), 80, 190);

  // Grosse Zahl
  g.textAlign = "center";
  g.fillStyle = farben.akzent; g.font = F(210, 800);
  g.fillText(String(gelernt), B / 2, 430);
  g.fillStyle = farben.leise; g.font = F(38, 600);
  g.fillText(gelernt === 1 ? t("ub.gelernt.1") : t("ub.gelernt"), B / 2, 490);

  // Anteil
  g.fillStyle = farben.ink; g.font = F(44, 800);
  g.fillText(t("ub.bildfest").replace("%P%", prozent), B / 2, 585);
  g.fillStyle = farben.leise; g.font = F(30, 600);
  g.fillText(t("ub.vonkarten").replace("%F%", fest).replace("%G%", gesamtKarten), B / 2, 632);

  // Verlauf
  const bx = 80, by = 720, bw = B - 160, bh = 250;
  g.fillStyle = farben.karte;
  if (g.roundRect) { g.beginPath(); g.roundRect(bx, by, bw, bh + 90, 40); g.fill(); }
  else g.fillRect(bx, by, bw, bh + 90);
  g.fillStyle = farben.leise; g.font = F(26, 800); g.textAlign = "left";
  g.fillText("DIE LETZTEN ZWEI WOCHEN", bx + 44, by + 56);

  const spitze = Math.max(1, ...verlauf.map((t) => t.n));
  const sw = (bw - 88) / verlauf.length;
  verlauf.forEach((t, i) => {
    const hoehe = t.n ? Math.max(10, (t.n / spitze) * (bh - 110)) : 6;
    const x = bx + 44 + i * sw, y = by + 96 + (bh - 110) - hoehe;
    g.fillStyle = t.n ? farben.akzent : farben.linie;
    if (g.roundRect) { g.beginPath(); g.roundRect(x, y, sw - 10, hoehe, 8); g.fill(); }
    else g.fillRect(x, y, sw - 10, hoehe);
  });

  // Fusszeile im Verlaufsfeld
  g.textAlign = "center"; g.fillStyle = farben.ink; g.font = F(30, 700);
  g.fillText(wocheKarten > 0
    ? "Diese Woche " + wocheKarten + " Karten in " + wocheMs
    : "Diese Woche war noch nichts dran.", B / 2, by + bh + 58);

  /* Bewusst KEIN Reifegrad-Band mehr: es sagte dasselbe wie die Prozentzahl
     weiter oben und drueckte die Fakten in die Fusszeile. Ein Bild zum
     Weitergeben vertraegt vier Aussagen, nicht sieben. */

  // Fakten in einer Zeile
  const fy = 1150;
  g.textAlign = "center";
  const fakten = [[String(beantwortet), "mal beantwortet"],
                  [gesamtZeit, "zusammen geübt"],
                  [String(tageDabei), tageDabei === 1 ? "Tag dabei" : "Tage dabei"]];
  fakten.forEach(([wert, label], i) => {
    const x = 80 + ((B - 160) / 3) * (i + 0.5);
    g.fillStyle = farben.ink; g.font = F(48, 800); g.fillText(wert, x, fy);
    g.fillStyle = farben.leise; g.font = F(25, 600); g.fillText(label, x, fy + 44);
  });

  g.fillStyle = farben.leise; g.font = F(23, 600);
  g.fillText("Bloop — ohne Konto, ohne Werbung", B / 2, H - 70);

  return new Promise((res) => c.toBlob(res, "image/png"));
}

/* Der Ueberblick beantwortet drei Fragen, in dieser Reihenfolge:
 *   1. Wie weit bin ich?      (Ring + Anteil, der sitzt)
 *   2. Wie lief es zuletzt?   (Verlauf der letzten 14 Tage)
 *   3. Wo genau stehe ich?    (pro Fach)
 *
 * Zwei Regeln, die sich widersprechen und beide gelten:
 * - **Was fallen kann, bestraft die Rueckkehr.** Deshalb steht gross die Zahl der
 *   gelernten Karten - sie waechst und faellt nie.
 * - **Ohne Prozent fehlt die Einordnung.** Deshalb steht der Anteil daneben, aber
 *   klein und mit Bezug ("von deinen 120 Karten"). Er darf fallen, wenn man sich
 *   neue Karten holt - dann hat man sich mehr vorgenommen, das ist kein Rueckschritt.
 *
 * Die Seite ist zum HERZEIGEN gebaut, nicht zum Ueberwachen: Es gibt keinen
 * Elternzugang und kein Passwort. Wer sie sehen will, bekommt sie vom Kind gezeigt -
 * das ist der Unterschied zwischen Stolz und Kontrolle.
 */
function Ueberblick({ decks, meta, onBack, onOpen }) {
  const marke = useMarke();
  /* Gezaehlt werden Lerneinheiten, nicht Karten: bei eingeschalteter Umkehr sind
     "Haus -> house" und "house -> Haus" zwei Dinge mit eigenem Reifegrad. */
  const alle = decks.flatMap(einheitenVon).map((e) => e.stand);
  const beantwortet = alle.reduce((n, c) => n + (c.reps || 0), 0);
  const gelernt = alle.filter((c) => c.reps).length;
  const tageDabei = meta.seit ? Math.max(1, Math.round((Date.now() - meta.seit) / DAY)) : 0;
  const anteil = (karten) => REIFE3.map((r) => ({
    ...r, n: karten.filter((c) => r.quellen.includes(bucketOf(c))).length,
  }));
  const gesamt = anteil(alle);
  const fest = gesamt.find((t) => t.key === "fest").n;
  const prozent = alle.length ? Math.round((fest / alle.length) * 100) : 0;
  const zaehler = useHochzaehlen(gelernt);

  const verlauf = letzteTage(meta.tage, 14);
  const spitze = Math.max(1, ...verlauf.map((t) => t.n));
  const wocheKarten = verlauf.slice(-7).reduce((n, t) => n + t.n, 0);
  const wocheMs = verlauf.slice(-7).reduce((n, t) => n + t.ms, 0);
  const aktiveTage = verlauf.filter((t) => t.n > 0).length;

  const R = 52, U = 2 * Math.PI * R;
  let versatz = 0;
  const boegen = gesamt.filter((t) => t.n > 0).map((t) => {
    const laenge = (t.n / Math.max(1, alle.length)) * U;
    const bogen = { key: t.key, laenge, versatz };
    versatz += laenge;
    return bogen;
  });

  const WT = ["S", "M", "D", "M", "D", "F", "S"];
  const [teilt, setTeilt] = useState("");

  /* Bild erzeugen und weitergeben. Das Verschicken macht das Betriebssystem -
     wir oeffnen nur den Teilen-Dialog. Kann das Geraet keine Dateien teilen
     (aeltere Browser), wird das Bild stattdessen gespeichert; von dort aus geht
     es ueber Fotos in jede Nachrichten-App. */
  const teile = async () => {
    setTeilt("Bild wird gebaut …");
    try {
      const cs = getComputedStyle(document.querySelector(".kbx"));
      const w = (n) => cs.getPropertyValue(n).trim();
      const blob = await baueFortschrittsbild({
        marke, name: meta.deckname || "", gelernt, prozent, fest,
        gesamtKarten: alle.length, wocheKarten, wocheMs: fmtDauer(wocheMs),
        tageDabei, verlauf, stufen: gesamt,
        beantwortet, gesamtZeit: fmtDauer(meta.ms),
        farben: { grund: w("--paper"), karte: w("--card"), ink: w("--ink"),
                  leise: w("--ink-soft"), akzent: w("--accent"), linie: w("--line"),
                  frisch: w("--stufe-frisch"), kommt: w("--stufe-kommt") },
      });
      const datei = new File([blob], "fortschritt.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [datei] })) {
        await navigator.share({ files: [datei], title: "Mein Fortschritt" });
        setTeilt("");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "fortschritt.png"; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        setTeilt(t("ub.bildok"));
      }
    } catch (e) {
      // Abbruch im Teilen-Dialog ist kein Fehler und braucht keine Meldung.
      setTeilt(e && e.name === "AbortError" ? "" : t("ub.bildfehler"));
    }
  };

  return (
    <>
      <ZurueckKnopf onClick={onBack} />
      <div className="h1">{t("ub.titel")}</div>

      <div className="ub-held ub-auf">
        <svg viewBox="0 0 140 140" className="ub-ring" role="img"
          aria-label={gesamt.map((t) => `${t.n} ${t.label}`).join(", ")}>
          <circle cx="70" cy="70" r={R} className="ub-ring-grund" />
          {boegen.map((b, i) => (
            <circle key={b.key} cx="70" cy="70" r={R} className={"ub-bogen " + b.key}
              style={{ animationDelay: `${140 + i * 190}ms` }}
              strokeDasharray={`${b.laenge} ${U - b.laenge}`} strokeDashoffset={-b.versatz} />
          ))}
        </svg>
        <div className="ub-mitte">
          <b>{zaehler}</b>
          <span>{gelernt === 1 ? t("ub.gelernt.1") : t("ub.gelernt")}</span>
        </div>
      </div>

      {/* Solange nichts fest sitzt, waere "0 % sitzen fest — 0 von 58" die
          entmutigendste Zeile der App: sie steht dort zwangslaeufig, weil eine
          Karte erst nach ein paar Wiederholungen ueber Tage stabil wird. Wer am
          ersten Abend fleissig war, liest sie als Defekt. Also sagt die Zeile
          dann, was tatsaechlich passiert ist - und warum die Null dort steht. */}
      {alle.length > 0 && (
        fest > 0 ? (
          <div className="ub-quote">
            {t("ub.festzeile").replace("%P%", prozent).replace("%F%", fest).replace("%G%", alle.length)}
          </div>
        ) : gelernt > 0 ? (
          <div className="ub-quote">
            {t("ub.angefangen").replace("%N%", gelernt).replace("%G%", alle.length)}
          </div>
        ) : null
      )}

      <div className="ub-legende ub-legende-gross">
        {gesamt.map((t) => (
          <span key={t.key}><i className={"ub-punkt " + t.key} />{t.n} {t.label}</span>
        ))}
      </div>

      {/* Verlauf: zeigt Regelmaessigkeit, ohne eine Kette zu bauen, die reissen kann.
          Ein leerer Tag ist einfach leer - kein rotes Feld, keine Luecke im Streak. */}
      <div className="list-title" style={{ marginTop: 30 }}>Die letzten zwei Wochen</div>
      <div className="vl-karte">
        <div className="vl-balken" role="img"
          aria-label={t("ub.jetag") + verlauf.map((t) => t.n).join(", ")}>
          {verlauf.map((t, i) => (
            <div key={t.key} className="vl-tag">
              <div className="vl-saeule">
                <div className={"vl-fuellung" + (t.n ? "" : " leer")}
                  style={{ height: t.n ? Math.max(8, (t.n / spitze) * 100) + "%" : "3px",
                           animationDelay: (i * 35) + "ms" }} />
              </div>
              <span className="vl-wt">{WT[t.datum.getDay()]}</span>
            </div>
          ))}
        </div>
        <div className="vl-fuss">
          {wocheKarten > 0
            ? t("ub.woche")
                .replace("%N%", wocheKarten)
                .replace("%E%", wocheKarten === 1 ? t("allg.karte") : t("allg.karten"))
                .replace("%Z%", fmtDauer(wocheMs))
            : <>{t("ub.ruhig")}</>}
        </div>
      </div>

      <div className="ub-fakten">
        <div><b>{beantwortet}</b><span>mal beantwortet</span></div>
        <div><b>{fmtDauerKurz(meta.ms)}</b><span>{t("ub.geuebt")}</span></div>
        {meta.seit > 0 && <div><b>{tageDabei}</b><span>{tageDabei === 1 ? "Tag dabei" : "Tage dabei"}</span></div>}
      </div>
      {meta.seit > 0 && (
        <div className="ub-seit">
          Angefangen am {fmtDatum(meta.seit)}
          {aktiveTage > 0 ? ` · an ${aktiveTage} der letzten 14 Tage geübt` : ""}.
        </div>
      )}

      {decks.length > 0 && <div className="list-title" style={{ marginTop: 28 }}>{t("ub.wostehst")}</div>}
      {decks.map((d) => {
        const teile = anteil(einheitenVon(d).map((e) => e.stand));
        const dFest = teile.find((t) => t.key === "fest").n;
        const dEinheiten = einheitenVon(d).length;
        const dProzent = dEinheiten ? Math.round((dFest / dEinheiten) * 100) : 0;
        return (
          <button key={d.id} type="button" className="ub-stapel" onClick={() => onOpen(d.id)}>
            <div className="ub-kopf">
              <span className="cat-name">{d.name}</span>
              <span className="cat-meta">
                {t("ub.deckzeile").replace("%P%", dProzent).replace("%F%", dFest).replace("%G%", einheitenVon(d).length)}
                {d.beide ? " · beide Richtungen" : ""}
                {d.resting ? " · gerade pausiert" : ""}
              </span>
            </div>
            <div className="ub-leiste" role="img" aria-label={teile.map((t) => `${t.n} ${t.label}`).join(", ")}>
              {teile.map((t) => t.n > 0 && (
                <span key={t.key} className={"ub-teil " + t.key} style={{ flexGrow: t.n }} />
              ))}
            </div>
          </button>
        );
      })}

      {/* Teilen ist eine Handlung des Kindes, kein Bericht, der irgendwohin geht.
          Deshalb steht der Knopf hier unten und nicht oben: erst anschauen, dann
          entscheiden, ob man ihn jemandem zeigt. */}
      <button className="btn btn-ghost teil-knopf" onClick={teile}>
        <span className="teil-icon" aria-hidden="true"><ShareIcon /></span>
        Als Bild weitergeben
      </button>
      {teilt && <div className="teil-hinweis" role="status">{teilt}</div>}

      <div className="ub-fuss">{t("ub.fuss")}</div>
    </>
  );
}

/* ---------------- Quiz- und Spiele-Auswahl ----------------
 * Beide Startknoepfe fuehren auf eine Auswahl statt direkt loszulegen: „Quiz“ und „Spiele“
 * sind Rubriken, keine einzelnen Sachen. Bei den Spielen steht heute nur „Lichter aus“ —
 * weitere Logikraetsel kommen in dieselbe Liste, ohne dass sich die Wege aendern.
 */
function QuizWahl({ onBack, onStart }) {
  const faecher = [...new Set(CATALOG.filter((d) => d.category === "Zum Staunen").map((d) => d.subject))];
  const anzahl = (f) => CATALOG.filter((d) => d.category === "Zum Staunen" && (!f || d.subject === f))
    .reduce((n, d) => n + d.cards.length, 0);
  return (
    <>
      <ZurueckKnopf onClick={onBack} />
      <div className="h1">Quiz</div>
      <button type="button" className="tile" onClick={() => onStart(null)}>
        <div className="tile-title">Bunt gemischt</div>
        <div className="tile-sub">{anzahl(null)} Fragen aus allen Rubriken</div>
      </button>
      {faecher.map((f) => (
        <button key={f} type="button" className="tile" onClick={() => onStart(f)}>
          <div className="tile-title">{f}</div>
          <div className="tile-sub">{anzahl(f)} Fragen</div>
        </button>
      ))}
    </>
  );
}
const SPIELE = [
  { key: "lichter", name: "Lichter aus", sub: "Alle 25 Felder dunkel bekommen.", Icon: GridIcon },
  { key: "vier", name: "Vier gewinnt", get sub() { return t("spiel.vier.sub"); }, Icon: VierIcon },
  { key: "rohr", name: "Rohrleitung", get sub() { return t("rohr.sub2"); }, Icon: RohrMenuIcon },
];
function SpieleWahl({ onBack, onStart }) {
  return (
    <>
      <ZurueckKnopf onClick={onBack} />
      <div className="h1">Spiele</div>
      {SPIELE.map((sp) => (
        <button key={sp.key} type="button" className="tile" onClick={() => onStart(sp.key)}>
          <div className="tile-head">
            <span className="tile-icon"><sp.Icon /></span>
            <div className="tile-title">{sp.name}</div>
          </div>
          <div className="tile-sub">{sp.sub}</div>
        </button>
      ))}
    </>
  );
}

/* ---------------- Bibliothek ---------------- */
/* Findet zu einer eigenen Kartei den logisch naechsten Katalogeintrag: gleiches
   Fach, noch nicht uebernommen, moeglichst dieselbe oder die naechste Stufe.
   Bewusst genau EINER - eine Liste waere wieder ein Katalog. */
function naechsterVorschlag(deck, eigene) {
  const teile = String(deck.name).split("·").map((s) => s.trim());
  const fach = teile.length > 1 ? teile[0] : null;
  if (!fach) return null;
  const schonDa = new Set(eigene.map((d) => d.name));
  const passend = CATALOG
    .filter((k) => k.subject === fach)
    .filter((k) => !schonDa.has(k.subject + " · " + k.name));
  if (!passend.length) return null;
  const meineStufe = CATALOG.find((k) => deck.name === k.subject + " · " + k.name);
  const stufeVon = (k) => Number(String(k.category).replace("Unterstufe ", "")) || 99;
  const ab = meineStufe ? stufeVon(meineStufe) : 0;
  const sortiert = [...passend].sort((x, y) => {
    const dx = stufeVon(x) - ab, dy = stufeVon(y) - ab;
    // erst gleiche Stufe, dann hoehere, erst danach niedrigere
    const rang = (d) => (d === 0 ? 0 : d > 0 ? 1 : 2);
    return rang(dx) - rang(dy) || Math.abs(dx) - Math.abs(dy);
  });
  const k = sortiert[0];
  return { name: k.name, eintrag: k };
}

function Bibliothek({ onBack, onHeim, onAdd, onStudy, eigene, onOpen, onToggleRest, onQuiz, onSpiele, uebungen = [], zaehleUebung = () => 0, onUebungStart, onUebungWeg, onUebungAusGruppe = () => {}, onGruppeSchalten = () => {} }) {
  const [sec, setSec] = useState(null);
  const [cat, setCat] = useState(null);
  const [subj, setSubj] = useState(null);
  // merkt sich die id der uebernommenen Stapel — damit aus „Hinzufuegen“ direkt „Los geht's“ wird
  const [added, setAdded] = useState({});
  const [liegtOffen, setLiegtOffen] = useState(false);
  const [suche, setSuche] = useState("");
  const uebernehmen = (d) => setAdded((a) => ({ ...a, [d.name]: onAdd(d) }));
  /* Suche statt Scrollen. Bei 100+ Decks ist eine Liste kein Verzeichnis mehr, sondern
   * ein Heuhaufen — und jede Auswahl-, Uebungs- und Fortschrittsfunktion haengt daran,
   * dass man etwas *findet*. Sucht in Deck-Namen und in den Karten selbst, damit man auch
   * ueber eine Vokabel zum richtigen Stapel kommt. */
  const norm = (t) => (t || "").toLowerCase();
  const passt = (d) => {
    const q = norm(suche.trim());
    if (!q) return true;
    if (norm(d.name).includes(q)) return true;
    return d.cards.some((c) => norm(nurText(c.front)).includes(q) || norm(nurText(c.back)).includes(q));
  };
  /* Ein Zurueck fuer alles: die Bibliothek hat eigene Ebenen (Bereich → Fach → Stapel),
   * die keine Views sind. Der Knopf geht erst diese Ebenen hoch und verlaesst die Bibliothek
   * erst, wenn oben angekommen. Sonst spraenge er aus jeder Tiefe direkt zur Startseite. */
  const zurueckInBib = () => {
    if (subj) return setSubj(null);
    if (sec) return setSec(null);
    onBack();
  };
  const gefunden = eigene.filter(passt);
  const vieleStapel = eigene.length > 6;
  // Gruppe = der Teil vor dem ersten „·“. Ohne Trenner steht der Stapel fuer sich.
  const [offeneGruppen, setOffeneGruppen] = useState({});
  const schalteGruppe = (n) => setOffeneGruppen((g) => ({ ...g, [n]: g[n] === false }));
  const gruppen = (() => {
    const topf = new Map();
    gefunden.forEach((d) => {
      const teile = d.name.split("·");
      const name = teile.length > 1 ? teile[0].trim() : d.name;
      if (!topf.has(name)) topf.set(name, []);
      topf.get(name).push(d);
    });
    return [...topf.entries()]
      .map(([name, decks]) => ({ name, decks, mehrere: decks.length > 1 }))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  })();
  // Bereiche aus BEREICHE; was dort (noch) nicht zugeordnet ist, sammelt „Mehr“ ein,
  // damit ein neuer Katalog-Eintrag nie unsichtbar wird.
  // „Zum Staunen“ ist das Quiz und hat dort seinen Platz — es darf nicht zusaetzlich
  // als Stapel-Bereich unter „Mehr“ auftauchen. Sonst steht dasselbe zweimal da.
  const zugeordnet = new Set([...BEREICHE.flatMap((b) => b.cats), "Zum Staunen"]);
  const rest = [...new Set(CATALOG.map((d) => d.category))].filter((c) => !zugeordnet.has(c));
  const bereiche = rest.length ? [...BEREICHE, { name: "Mehr", hint: "", cats: rest }] : BEREICHE;

  // Ebene 1: Bereiche
  if (!cat && !sec) {
    return (
      <>
        <ZurueckKnopf onClick={onBack} />
        <div className="h1">Bibliothek</div>

        {/* Getrennt statt gemischt: was man lernt, steht oben und bleibt kurz. Weggelegtes
            waechst mit den Jahren an und wuerde die Liste sonst zulaufen lassen — es liegt
            eingeklappt darunter und wird nie automatisch geloescht. */}
        {vieleStapel && (
          <div className="suche">
            <input className="field" type="search" value={suche} placeholder={"In " + eigene.length + " Stapeln suchen…"}
              onChange={(e) => setSuche(e.target.value)} aria-label={t("bib.suche")} />
            {suche && <button className="suche-weg" onClick={() => setSuche("")} aria-label={t("bib.suchezu")}>×</button>}
          </div>
        )}
        {suche && !gefunden.length && (
          <div className="sub" style={{ marginTop: 4 }}>Nichts gefunden. Andere Schreibweise?</div>
        )}

        {/* Nach Gruppe sortiert — der Teil vor dem „·“ im Namen ist das Fach. Weggelegte
            Stapel stehen *nicht* woanders, sondern an ihrem Platz, nur ausgegraut: so ist
            jeder Stapel immer dort zu finden, wo man ihn sucht. */}
        {uebungen.length > 0 && (
          <>
            <div className="list-title">{t("bib.uebungen")}</div>
            {uebungen.map((u) => {
              const n = zaehleUebung(u);
              return (
                <div key={u.id} className="regal-row">
                  <button className="regal-name" onClick={() => n && onUebungStart(u)} disabled={!n}>
                    <span className="cat-name">{u.name}</span>
                    <span className="cat-meta">
                      {n} {n === 1 ? t("allg.karte") : t("allg.karten")} · {t("bib.angelegt")} {fmtDatum(u.erstellt)}
                    </span>
                  </button>
                  <button className="icon-btn danger" aria-label={t("bib.uebweg")}
                    onClick={() => { if (confirm("Übung „" + u.name + "“ löschen? Die Karten selbst bleiben.")) onUebungWeg(u.id); }}>
                    <TrashIcon />
                  </button>
                </div>
              );
            })}
          </>
        )}
        {/* EINE Liste. "Pausiert" war eine kuenstliche dritte Kategorie: nicht
            aktiv ist kein eigener Zustand, sondern der Normalfall - alles im
            Katalog ist nicht aktiv. Der Schalter zeigt den Unterschied, die
            Sortierung stellt das Aktive nach oben. */}
        {gefunden.length > 0 && <div className="list-title">Deine Karteien</div>}
        {gruppen.map((g) => (
          <div key={g.name} className="gruppe">
            {g.mehrere ? (
              <button className="gruppe-kopf" onClick={() => schalteGruppe(g.name)}
                aria-expanded={offeneGruppen[g.name] !== false}>
                <span className="gruppe-name">{g.name}</span>
                <span className="gruppe-zahl">{g.decks.length}</span>
                <span className="gruppe-pfeil">{offeneGruppen[g.name] === false ? "▸" : "▾"}</span>
              </button>
            ) : null}
            {g.mehrere && offeneGruppen[g.name] !== false ? (
              <div className="gruppe-aktionen">
                <button onClick={() => onGruppeSchalten(g, g.decks.some((d) => d.resting))}>
                  {g.decks.some((d) => d.resting) ? "Alle ins Training" : "Alle pausieren"}
                </button>
                <button onClick={() => onUebungAusGruppe(g)}>{t("bib.uebungalle")}</button>
              </div>
            ) : null}
            {(!g.mehrere || offeneGruppen[g.name] !== false) && g.decks.map((d) => (
              <div key={d.id}>
                <div className={"regal-row" + (d.resting ? " ruht" : "")}>
                  <button className="regal-name" onClick={() => onOpen(d.id)}>
                    <span className="cat-name">{g.mehrere ? d.name.split("·").slice(1).join("·").trim() || d.name : d.name}</span>
                    <span className="cat-meta">
                      {d.cards.length} {t("allg.karten")}
                      {d.resting && zuletztGelernt(d) ? " · " + fmtZuletzt(zuletztGelernt(d)) : ""}
                    </span>
                  </button>
                  <Kippschalter an={!d.resting} onChange={() => onToggleRest(d.id)} label={d.name + " lernen"} />
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="list-title" style={{ marginTop: 26 }}>Zum Dazuholen</div>
        {/* Bereiche statt Kategorien: „Schule“ traegt spaeter mehrere Schuljahre,
            daneben koennen Quiz, Schnitzeljagd oder Party als eigene Bereiche stehen. */}
        {bereiche.map((b) => {
          const decks = CATALOG.filter((d) => b.cats.includes(d.category));
          if (!decks.length) return null;
          const nCards = decks.reduce((n, d) => n + d.cards.length, 0);
          const nSubj = new Set(decks.map((d) => d.subject)).size;
          return (
            <button key={b.name} type="button" className="tile"
              onClick={() => { setSec(b.name); setCat(null); setSubj(null); }}>
              <div className="tile-head">
                <span className="tile-icon">{b.icon === "schule" ? <SchuleIcon /> : b.icon === "medien" ? <MedienIcon /> : <BooksIcon />}</span>
                <div className="tile-title">{b.name}</div>
              </div>
              <div className="tile-sub">{nSubj} {nSubj === 1 ? t("allg.fach") : t("bib.faecher")} · {decks.length} {t("allg.stapel")} · {nCards} {t("allg.karten")}</div>
            </button>
          );
        })}
        {/* Quiz und Spiele holt man sich nicht — man macht sie sofort. Deshalb
            eigene Ueberschrift statt derselben Liste. */}
        <div className="list-title" style={{ marginTop: 26 }}>Zum Spielen</div>
        <button type="button" className="tile" onClick={onQuiz}>
          <div className="tile-head">
            <span className="tile-icon"><QuizIcon /></span>
            <div className="tile-title">Quiz</div>
          </div>
          <div className="tile-sub">{t("bib.quizsub")}</div>
        </button>
        <button type="button" className="tile" onClick={onSpiele}>
          <div className="tile-head">
            <span className="tile-icon"><WuerfelIcon /></span>
            <div className="tile-title">Spiele</div>
          </div>
          <div className="tile-sub">Lichter aus, Vier gewinnt, Rohrleitung.</div>
        </button>
      </>
    );
  }

  // Ebene 2: Faecher. Der Jahrgang ist KEINE Ebene mehr - er stand vorher hier
  // und hat das Kind einsortiert. Jetzt greift man zum Fach und sieht am Thema,
  // fuer welches Alter es gedacht ist.
  if (sec && !subj) {
    const b = bereiche.find((x) => x.name === sec);
    if (!b) return null;
    const imBereich = CATALOG.filter((d) => b.cats.includes(d.category));
    const faecher = [...new Set(imBereich.map((d) => d.subject))].sort((a, c) => a.localeCompare(c, "de"));
    return (
      <>
        <ZurueckKnopf onClick={zurueckInBib} onHeim={onHeim} />
        <div className="h1">{sec}</div>
        {b.hint && <div className="sub">{b.hint}</div>}
        {faecher.map((f) => {
          const decks = imBereich.filter((d) => d.subject === f);
          const nCards = decks.reduce((n, d) => n + d.cards.length, 0);
          const stufen = [...new Set(decks.map((d) => alterLabel(d.category)))].filter(Boolean).sort();
          const done = decks.every((d) => added[d.name]);
          return (
            <button key={f} type="button" className="tile" onClick={() => setSubj(f)}>
              <div className="tile-title">{f}{done ? " ✓" : ""}</div>
              <div className="tile-sub">
                {decks.length} {decks.length === 1 ? "Thema" : "Themen"} · {nCards} Karten
                {stufen.length ? " · " + (stufen.length === 1 ? stufen[0] : stufen[0] + " bis " + stufen[stufen.length - 1].replace("ab ", "")) : ""}
              </div>
            </button>
          );
        })}
      </>
    );
  }

  // Ebene 3: Themen im Fach. Jedes Thema traegt seine Altersempfehlung.
  const bAkt = bereiche.find((x) => x.name === sec) || { cats: SCHUL_KATS };
  const decks = CATALOG.filter((d) => bAkt.cats.includes(d.category) && d.subject === subj)
    .sort((a, c) => String(a.category).localeCompare(String(c.category)) || a.name.localeCompare(c.name, "de"));
  const addAll = () => decks.forEach((d) => { if (!added[d.name]) uebernehmen(d); });
  const allAdded = decks.every((d) => added[d.name]);
  return (
    <>
      <ZurueckKnopf onClick={zurueckInBib} onHeim={onHeim} />
      <div className="h1">{subj}</div>
      {decks.length > 1 && (
        <button className="btn btn-ghost" style={{ width: "100%", marginBottom: 16 }} onClick={addAll} disabled={allAdded}>
          {allAdded ? t("bib.alledrin") : t("bib.fachalle")}
        </button>
      )}
      {decks.map((d) => (
        <div key={d.name} className="cat-row">
          <div>
            <div className="cat-name">{d.name}</div>
            <div className="cat-meta">
              {d.cards.length} {t("allg.karten")}
              {alterLabel(d.category) ? " · " + alterLabel(d.category) : ""}
            </div>
          </div>
          {/* Uebernommen heisst nicht Sackgasse: derselbe Knopf fuehrt direkt ins Lernen. */}
          <button className="btn btn-primary" style={{ width: "auto", padding: "9px 14px", whiteSpace: "nowrap" }}
            onClick={() => (added[d.name] ? onStudy(added[d.name]) : uebernehmen(d))}>
            {added[d.name] ? "Los geht's" : t("bib.hinzu")}
          </button>
        </div>
      ))}
    </>
  );
}

/* ---------------- Deck ---------------- */
function DeckView({ deck, tts, onBack, onHeim, onStudy, onAddCard, onEditCard, onDelCard, onDelDeck, onRest, onBeide, onFoto, onUebung }) {
  const marke = useMarke();
  /* Eine Karte ist ein Entwurf mit drei Seiten, nicht zwei Einzelfelder plus
     ein "welche Seite sehe ich gerade". Das Umdrehen beim Anlegen ist entfallen. */
  const LEER = { front: "", back: "", warum: "", flang: "en-US", blang: "de-DE" };
  const [entwurf, setEntwurf] = useState(LEER);
  /* Karten liessen sich bisher nur beim Lernen aendern - wer in der Liste einen
     Tippfehler sah, musste die Karte erst drankommen lassen. Jetzt oeffnet der
     Stift dasselbe Kartenblatt direkt hier. */
  const [aendert, setAendert] = useState(null);
  const [aenderung, setAenderung] = useState(LEER);
  const [mikroFuer, setMikroFuer] = useState(null);
  const [shareCode, setShareCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saveHint, setSaveHint] = useState("");
  const [addOpen, setAddOpen] = useState(deck.cards.length === 0);
  const [waehlen, setWaehlen] = useState(false);
  const [markiert, setMarkiert] = useState({});
  const anzahlMarkiert = Object.values(markiert).filter(Boolean).length;
  const recRef = useRef(null);
  // Die Spracherkennung liest den Stand im Callback - dort ist der State nicht
  // sicher aktuell, deshalb der Ref daneben.
  const entwurfRef = useRef(entwurf); entwurfRef.current = entwurf;

  const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  /* Das Mikro gehoert jetzt zum Feld, nicht zur "sichtbaren Seite": man tippt auf
     das Mikro neben der Zeile, die man besprechen will. Ein zweiter Druck stoppt. */
  const spracheIn = (feld, sprache) => {
    if (!SR) return;
    if (mikroFuer) { recRef.current && recRef.current.stop(); if (mikroFuer === feld) return; }
    const rec = new SR();
    rec.lang = sprache; rec.interimResults = true; rec.continuous = false;
    const vorher = nurText(entwurfRef.current[feld] || "");
    const prefix = vorher ? vorher + " " : "";
    rec.onresult = (e) => {
      let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setEntwurf((w) => ({ ...w, [feld]: prefix + t.trim() }));
    };
    rec.onerror = () => setMikroFuer(null);
    rec.onend = () => setMikroFuer(null);
    recRef.current = rec; setMikroFuer(feld); rec.start();
  };

  const save = () => {
    if (!nurText(entwurf.front).trim()) { setSaveHint(t("deck.leer.front")); return; }
    if (!nurText(entwurf.back).trim()) { setSaveHint(t("deck.leer.back")); return; }
    onAddCard({ ...entwurf });
    // Sprachen bleiben stehen: wer Vokabeln tippt, tippt meist mehrere.
    setEntwurf({ ...LEER, flang: entwurf.flang, blang: entwurf.blang });
    setSaveHint("");
  };

  const openShare = () => { setShareCode(encodeDeck(deck)); setCopied(false); };
  const copyCode = async () => { try { await navigator.clipboard.writeText(shareCode); setCopied(true); } catch {} };
  const nativeShare = async () => {
    try { await navigator.share({ title: marke, text: t("deck.teilen.text").replace("%N%", marke) + "\n\n" + shareCode }); } catch {}
  };

  const due = faelligeVon(deck);
  const counts = STUFE3.map((m) => ({
    ...m, n: deck.cards.filter((c) => stufe3Von(c).key === m.key).length,
  }));
  const fest = counts.find((c) => c.key === "fest").n;

  return (
    <>
      {/* ZurueckKnopf bringt seine eigene Kopfzeile mit (Marke + Ton). Er darf nicht in
          eine weitere topbar gewickelt werden — dann landet „Zurueck“ neben der Marke
          statt darunter. */}
      <ZurueckKnopf onClick={onBack} onHeim={onHeim} />
      <div className="h1">{deck.name}</div>
      <div className="sub">{t("deck.faellig").replace("%N%", deck.cards.length).replace("%F%", due)}</div>

      {shareCode && (
        <div className="panel">
          <div className="panel-title">{t("deck.teilen")}</div>
          <div className="mic-hint" style={{ marginBottom: 10 }}>
            Schick diesen Code per SMS oder Mail an Freunde — sie fügen ihn unter „Kartei per Code importieren" ein.
            Es werden keine Kontaktdaten gespeichert oder verschickt.
          </div>
          <textarea className="share-ta" readOnly value={shareCode} onFocus={(e) => e.target.select()} />
          <div className="share-actions">
            {canShare && <button className="btn btn-primary" onClick={nativeShare}>Teilen…</button>}
            <button className="btn btn-ghost" onClick={copyCode}>{copied ? "Kopiert ✓" : "Code kopieren"}</button>
            <button className="btn btn-ghost" onClick={() => setShareCode(null)}>{t("allg.schliessen")}</button>
          </div>
        </div>
      )}

      {/* Fortschritt dort, wo man lernt — nicht nur im Ueberblick. Die Zahl oben waechst
          nur; die Leiste darunter zeigt, wie sich der Stoff verteilt. */}
      {deck.cards.length > 0 && (
        <div className="fortschritt">
          <div className="fort-kopf">
            <b>{fest}</b>
            <span>{t("deck.festzeile").replace("%N%", deck.cards.length)}</span>
          </div>
          <div className="ub-leiste">
            {counts.map((stufe) => stufe.n > 0 && (
              <span key={stufe.key} className={"ub-teil " + stufe.key} style={{ flexGrow: stufe.n }} />
            ))}
          </div>
          <div className="ub-legende">
            {counts.filter((s) => s.n > 0).map((s) => (
              <span key={s.key}><i className={"ub-punkt " + s.key} />{s.n} {s.label}</span>
            ))}
          </div>
        </div>
      )}

      <div className="deck-schalter">
        <div>
          <div className="deck-schalter-titel">{deck.resting ? t("deck.pausiert.titel") : t("deck.imtraining")}</div>
          <div className="deck-schalter-sub">
            {deck.resting ? t("deck.pausiert") : t("deck.training.sub")}
          </div>
        </div>
        <Kippschalter an={!deck.resting} onChange={onRest} label={t("deck.training")} />
      </div>

      {/* Nur bei Vokabeln: Bei Verstaendnisfragen ("Warum ist der Himmel blau?")
          gaebe es unendlich viele richtige Rueckfragen - der Schalter waere dort
          nur Verwirrung. Erkannt an zwei verschiedenen Sprachen auf der Karte. */}
      {istVokabelDeck(deck) && onBeide && (
        <div className="deck-schalter">
          <div>
            <div className="deck-schalter-titel">
              {deck.beide ? "Beidseitig loopen" : "Eine Richtung"}
            </div>
            <div className="deck-schalter-sub">
              {deck.beide
                ? t("deck.beide.sub")
                : t("deck.eine.sub")}
            </div>
          </div>
          <Kippschalter an={!!deck.beide} onChange={onBeide} label="Beide Richtungen abfragen" />
        </div>
      )}

      <button className="btn btn-primary" onClick={onStudy} disabled={deck.cards.length === 0} style={{ marginBottom: 22 }}>
        {/* Der Knopf nennt, was die Sitzung wirklich bringt — nicht den ganzen Stapel.
            Sonst verspricht er 180 und liefert 20. */}
        {due ? t("home.los")
          : deck.cards.length ? t("deck.ueben") : t("deck.keine")}
      </button>

      {!addOpen && (
        <div className="newdeck" style={{ marginTop: 0, marginBottom: 22 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setAddOpen(true)}>{t("deck.karte")}</button>
          <button className="btn btn-ghost btn-ico" onClick={onFoto} title={t("deck.foto.titel")}>
            <CameraCardIcon /> Aus Foto
          </button>
        </div>
      )}

      {addOpen && (
      <div className="panel">
        <div className="panel-title">
          {t("deck.hinzu")}
          <button className="panel-close" onClick={() => setAddOpen(false)} aria-label={t("allg.zuklappen")}>×</button>
        </div>

        <KartenBlatt wert={entwurf} onChange={(w) => { setSaveHint(""); setEntwurf(w); }}
          tts={tts} mikroFuer={mikroFuer} onMikro={SR ? spracheIn : null} autoFokus />

        {!SR && (
          <div className="mic-hint" style={{ marginTop: 8, marginBottom: 4 }}>
            Spracheingabe kann dieser Browser nicht — tipp die Karte ein.
          </div>
        )}

        <button className="btn btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={save}>{t("ed.speichern")}</button>
        {saveHint && <div className="hint-err">{saveHint}</div>}

        <div className="preview-note">
          Hinweis: In der Chat-Vorschau können Mikrofon und Vorlesen von der Sandbox blockiert sein — im echten App- oder Browserfenster funktionieren sie.
        </div>
      </div>
      )}

      {deck.cards.length > 0 && <div className="list-title">{t("deck.alle")}</div>}
      {deck.cards.length > 1 && (
        <button className="link-inline" style={{ marginTop: 2 }}
          onClick={() => { setWaehlen((w) => !w); setMarkiert({}); }}>
          {waehlen ? "× Auswahl beenden" : t("deck.waehlen")}
        </button>
      )}
      {deck.cards.map((c) => (
        <div key={c.id} className={"crow" + (waehlen ? " waehlbar" : "") + (markiert[c.id] ? " markiert" : "")}
          onClick={waehlen ? () => setMarkiert((m) => ({ ...m, [c.id]: !m[c.id] })) : undefined}>
          {waehlen && (
            <span className={"haken" + (markiert[c.id] ? " an" : "")} aria-hidden="true">
              {markiert[c.id] ? "✓" : ""}
            </span>
          )}
          <div>
            <div className="crow-front">{c.front}</div>
            <div className="crow-back">{c.back}</div>
          </div>
          <button className="crow-spk" onClick={() => tts.speak(c.front, c.flang)} disabled={!tts.supported} aria-label={t("lern.vorlesen")}><SpeakerIcon s={16} /></button>
          {onEditCard && !waehlen && (
            <button className="crow-spk" aria-label={t("lern.aendern")}
              onClick={(e) => {
                e.stopPropagation();
                setAendert(c.id);
                setAenderung({ front: c.front || "", back: c.back || "", warum: c.warum || "",
                  flang: c.flang || "de-DE", blang: c.blang || "de-DE" });
              }}><PencilIcon /></button>
          )}
          <span className="crow-box">{stufe3Von(c).label}</span>
          <button className="crow-del" onClick={() => onDelCard(c.id)} aria-label={t("allg.loeschen")}>×</button>
        </div>
      ))}

      {aendert && (
        <div className="aender-blatt" role="dialog" aria-label={t("lern.aendern")}>
          <div className="aender-innen">
            <div className="panel-title">{t("lern.aendern")}
              <button className="panel-close" onClick={() => setAendert(null)}
                aria-label={t("allg.schliessen")}>×</button>
            </div>
            <KartenBlatt wert={aenderung} onChange={setAenderung} tts={tts}
              spracheAn={!!(aenderung.flang && aenderung.blang && aenderung.flang !== aenderung.blang)} />
            <div className="recall-actions" style={{ gap: 10, marginTop: 12 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }}
                onClick={() => setAendert(null)}>{t("ed.abbrechen")}</button>
              <button className="btn btn-primary" style={{ flex: 1 }}
                onClick={() => {
                  // Vorder- und Rueckseite sind Pflicht, die Erklaerung nicht.
                  if (nurText(aenderung.front).trim() && nurText(aenderung.back).trim()) {
                    onEditCard(aendert, aenderung);
                  }
                  setAendert(null);
                }}>{t("ed.speichern")}</button>
            </div>
          </div>
        </div>
      )}

      {waehlen && anzahlMarkiert > 0 && (
        <div className="wahl-leiste">
          <span>{anzahlMarkiert} {anzahlMarkiert === 1 ? t("allg.karte") : t("allg.karten")}</span>
          <button className="btn btn-primary" style={{ width: "auto", padding: "11px 16px" }}
            onClick={() => {
              const ids = Object.keys(markiert).filter((k) => markiert[k]);
              onUebung(ids);
              setWaehlen(false); setMarkiert({});
            }}>{t("deck.uebung")}</button>
        </div>
      )}

      <button className="del-deck" onClick={openShare} style={{ marginTop: 24 }}>
        <ShareIcon /> Kartei teilen
      </button>
      <button className="del-deck" style={{ marginTop: 0 }} onClick={() => {
        if (confirm(`Kartei „${deck.name}" endgültig löschen? Der Lernfortschritt geht verloren. „Weglegen" behält ihn — der Stapel liegt dann in der Bibliothek.`)) onDelDeck();
      }}>
        <TrashIcon /> Diese Kartei löschen
      </button>
    </>
  );
}

/* --- Aktives Abrufen: toleranter Antwort-Abgleich (Artikel/Akzente/Tippfehler) --- */
const ARTICLES = /\b(der|die|das|den|dem|des|ein|eine|einen|einem|the|a|an|el|la|los|las|un|una|le|les|il|lo|gli|o|os|as)\b/g;
function normAnswer(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(ARTICLES, " ")
    .replace(/\s+/g, " ").trim();
}
function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++)
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
function answerMatches(input, correct) {
  const a = normAnswer(input), b = normAnswer(correct);
  if (!a || !b) return false;
  if (a === b) return true;
  const tol = b.length <= 4 ? 0 : b.length <= 8 ? 1 : 2;
  if (lev(a, b) <= tol) return true;
  const at = new Set(a.split(" "));
  return b.split(" ").every((t) => at.has(t));
}

/* ---------------- Study ---------------- */
/* Was hat sich in dieser Sitzung bewegt? Vergleicht den Reifegrad der Sitzungskarten mit
 * dem Stand von vorher. Nur nach vorne gerutschte Karten werden genannt — nichts, was
 * zurueckgefallen ist. Ein Abschluss soll den Moment wuerdigen, nicht Buch fuehren.
 * Beim Quiz entfaellt das komplett: dort wird nichts gespeichert, es gaebe nichts zu zeigen.
 */
const REIFE_RANG = { neu: 0, lernend: 1, jung: 2, reif: 3, fest: 4 };
function werteAus(deck, queue, vorher) {
  if (deck.id === "__quiz__" || !vorher) return { zeigen: false };
  const karten = queue.map((id) => deck.cards.find((c) => c.id === id)).filter(Boolean);
  if (!karten.length) return { zeigen: false };
  const vor = karten.filter((c) => (REIFE_RANG[bucketOf(c)] ?? 0) > (REIFE_RANG[vorher[c.id]] ?? 0)).length;
  const fest = karten.filter((c) => bucketOf(c) === "fest" && vorher[c.id] !== "fest").length;
  const teile = REIFE3.map((r) => ({ ...r, n: karten.filter((c) => r.quellen.includes(bucketOf(c))).length }));
  const U = 2 * Math.PI * 52;
  let versatz = 0;
  // Parameter NICHT `t` nennen - das verdeckt die Uebersetzungsfunktion.
  const boegen = teile.filter((s) => s.n > 0).map((s) => {
    const laenge = (s.n / karten.length) * U;
    const b = { key: s.key, laenge, rest: U - laenge, versatz };
    versatz += laenge;
    return b;
  });
  const satz = fest > 0
    ? (fest === 1 ? t("ende.einefest") : t("ende.nfest").replace("%N%", fest))
    : vor > 0
      ? (vor === 1 ? t("ende.einevor") : t("ende.nvor").replace("%N%", vor))
      : t("ende.naechstmal");
  return { zeigen: true, gemacht: karten.length, teile, boegen, satz };
}

function Study({ deck, tts, sound, onBack, onHome, onRate, onEditCard, alleDecks = [], onFolgeholen }) {
  /* Jeder Eintrag ist eine Richtung einer Karte: {id, richtung}. Bei Vokabel-
     karteien mit eingeschalteter Umkehr stehen beide Richtungen in der Liste -
     mit eigenem Faelligkeitstermin, also meist an verschiedenen Tagen. */
  const [queue] = useState(() => {
    const richtungen = richtungenVon(deck);
    const alle = deck.cards.flatMap((c) => richtungen.map((r) => ({ id: c.id, richtung: r, karte: c })));
    const due = alle.filter((e) => istFaellig(e.karte, e.richtung));
    const basis = due.length ? due : alle;
    // Gemischt, damit Vorder- und Rueckrichtung derselben Karte nicht direkt
    // hintereinander kommen - sonst ist die zweite geraten statt erinnert.
    const roh = richtungen.length > 1 ? shuffle(basis.slice()) : basis;
    return roh.slice(0, SESSION_CARDS).map(({ id, richtung }) => ({ id, richtung }));
  });
  // Lag mehr an, als in eine Sitzung passt? Dann darf der Schluss nicht so tun, als waere alles durch.
  const [gekappt] = useState(() => {
    if (deck.mehr) return true;
    const richtungen = richtungenVon(deck);
    const alle = deck.cards.flatMap((c) => richtungen.map((r) => ({ karte: c, richtung: r })));
    const due = alle.filter((e) => istFaellig(e.karte, e.richtung));
    return (due.length ? due : alle).length > SESSION_CARDS;
  });
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [warum, setWarum] = useState(false);   // drittes Feld: die Erklaerung
  // Karteien duerfen das Abrufen abschalten (z. B. die Willkommens-Kartei, die man nicht erraten soll)
  const [recall, setRecall] = useState(deck.recall !== false);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState(null); // null | "correct" | "wrong"
  const [listening, setListening] = useState(false);
  const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const recRef = useRef(null);
  const timerRef = useRef(null);
  const fertigGemeldet = useRef(false);
  // Reifegrad beim Start festhalten, um am Ende sagen zu koennen, was sich bewegt hat.
  const vorher = useRef(null);
  if (vorher.current === null) {
    vorher.current = {};
    deck.cards.forEach((c) => { vorher.current[c.id] = bucketOf(c); });
  }
  const [aufstieg, setAufstieg] = useState(null);
  const aufstiegUhr = useRef(null);
  useEffect(() => () => clearTimeout(aufstiegUhr.current), []);
  const [bearbeiten, setBearbeiten] = useState(false);
  const [entwurf, setEntwurf] = useState({ front: "", back: "", warum: "", flang: "de-DE", blang: "de-DE" });
  const guessRef = useRef("");
  guessRef.current = guess;

  const eintrag = queue[i] || {};
  const rohKarte = deck.cards.find((c) => c.id === eintrag.id);
  const rueck = eintrag.richtung === RUECK;
  /* Fuer die Anzeige wird die Karte gedreht: Vorder- und Rueckseite tauschen samt
     ihren Sprachen, damit auch das Vorlesen die richtige Stimme nimmt. Der
     Lernstand kommt aus `rueck` - deshalb wird er hier mit hineingelegt, damit
     alles Weitere (Vorschau der Intervalle, Reifegrad) unveraendert arbeitet. */
  const card = !rohKarte ? null : (rueck ? {
    ...rohKarte, ...(rohKarte.rueck || {}),
    front: rohKarte.back, back: rohKarte.front,
    flang: rohKarte.blang, blang: rohKarte.flang,
    // Die Erklaerung gehoert zur Antwort, nicht zur Seite - sie bleibt.
    warum: rohKarte.warum,
  } : rohKarte);
  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  const stopMic = () => { if (recRef.current) { try { recRef.current.stop(); } catch {} } };

  const advance = (grade) => {
    /* Rueckmeldung im Moment, in dem der Fortschritt passiert — laut Forschung der
     * unterschaetzte Hebel („Kompetenz“). Nur beim Aufstieg, nur ein Wort, und nur kurz:
     * es soll bemerkt, nicht gefeiert werden. Ein Abstieg wird bewusst nicht gemeldet. */
    if (card) {
      const vorherStufe = stufe3Von(card);
      const nx = computeNext(card, grade, Date.now());
      const nachher = stufe3Von({ s: nx.s });
      if (STUFE3_RANG[nachher.key] > STUFE3_RANG[vorherStufe.key]) {
        setAufstieg(nachher.key === "fest" ? "Sitzt fest." : "Sitzt langsam.");
        clearTimeout(aufstiegUhr.current);
        aufstiegUhr.current = setTimeout(() => setAufstieg(null), 1500);
      }
    }
    clearTimer(); stopMic();
    window.speechSynthesis && window.speechSynthesis.cancel();
    onRate(eintrag.id, grade, eintrag.richtung);
    setFlipped(false); setWarum(false); setGuess(""); setResult(null); setListening(false); setI(i + 1);
    setDrag(0); setWeg(0); dragRef.current.aktiv = false;
  };
  // Tippen schaltet in beide Richtungen: aufdecken — und wieder zurueck zur Frage,
  // falls man zu frueh gedreht hat. Ein Weg hin ohne Weg zurueck ist eine Falle.
  // Zu einer Karte springen, ohne zu bewerten: nur der Blick wandert, die Terminierung bleibt.
  const geheZu = (k) => {
    const ziel = Math.max(0, Math.min(queue.length - 1, k));
    if (ziel === i) return;
    clearTimer(); stopMic();
    window.speechSynthesis && window.speechSynthesis.cancel();
    setI(ziel); setFlipped(false); setWarum(false); setGuess(""); setResult(null); setListening(false);
    setDrag(0); setWeg(0); setBearbeiten(false); dragRef.current.aktiv = false;
  };
  /* Karten unterwegs korrigieren: wer beim Lernen merkt, dass eine Antwort falsch oder
   * veraltet ist, soll sie sofort aendern koennen — nicht erst zurueck in die Kartei.
   * Geaendert wird immer die *sichtbare* Seite, passend zur Dreh-Metapher. */
  /* Bearbeitet wird die GANZE Karte, nicht die sichtbare Seite. Vorher hing der
     Editor an `flipped` - man konnte die Rueckseite nur aendern, wenn man sie
     gerade sah, und die dritte Seite ueberhaupt nicht. */
  const starteBearbeiten = () => {
    setEntwurf({ front: card.front || "", back: card.back || "", warum: card.warum || "",
      flang: card.flang || "de-DE", blang: card.blang || "de-DE" });
    setBearbeiten(true);
  };
  const speichereBearbeitung = () => {
    if (!bearbeiten) return;
    // Eine Karte ohne Vorder- oder Rueckseite waere unbrauchbar; die Erklaerung
    // darf leer bleiben, sie ist ein Angebot.
    if (nurText(entwurf.front).trim() && nurText(entwurf.back).trim()) {
      onEditCard(card.id, entwurf);
    }
    setBearbeiten(false);
  };
  const springeZu = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const anteil = (e.clientX - r.left) / r.width;
    geheZu(Math.floor(anteil * queue.length));
  };
  const reveal = () => {
    if (dragRef.current.bewegt || result === "correct" || bearbeiten) return;
    setResult(null); setFlipped((f) => !f);
    haptik(HAPTIK.umdrehen);
  };

  /* ---- Wischen ----
   * Rechts = gewusst, links = nochmal. Nur wenn die Antwort schon zu sehen ist —
   * vorher waere es Raten. Die Knoepfe bleiben, Wischen ist die Kuer.
   * Ab SCHNAPP zieht die Karte weg, darunter faengt der Widerstand sie ab.
   */
  const [drag, setDrag] = useState(0);
  const [weg, setWeg] = useState(0);
  // Muss State sein, nicht nur die Ref: sonst haengt beim ersten Bewegungsschritt noch die
  // 300-ms-Transition der Ruhelage dran und die Karte klebt nicht am Finger.
  const [ziehend, setZiehend] = useState(false);
  const dragRef = useRef({ aktiv: false, x0: 0, y0: 0, dxRoh: 0, achse: null, bewegt: false });
  const SCHNAPP = 92;
  const AUFDECK_ZUG = 44;               // so weit muss man ziehen, um vor dem Aufdecken umzublaettern
  const WARUM_ZUG = 52;                 // nach oben: Erklaerung. Grosszuegiger als seitlich,
                                        // weil senkrechte Wische leichter versehentlich passieren
  const kannWischen = flipped && result !== "correct" && !weg;
  const kannZiehen = !weg && result !== "correct" && !bearbeiten;

  // Bis zum Schnapppunkt klebt die Karte 1:1 am Finger — das fuehlt sich direkt an.
  // Erst danach kommt Widerstand, damit man den Punkt spuert, ab dem es zaehlt.
  // Vor dem Aufdecken gibt die Karte nur ein Stueck nach: bewerten kann man noch nicht,
  // aber die Geste ist auch nicht tot — Loslassen deckt auf.
  const bremse = (dx) => {
    const a = Math.abs(dx);
    if (!flipped) return Math.sign(dx) * Math.min(a * 0.5, AUFDECK_ZUG + 14);
    return Math.sign(dx) * (a <= SCHNAPP ? a : SCHNAPP + (a - SCHNAPP) * 0.35);
  };
  const onDown = (e) => {
    if (!kannZiehen) return;
    dragRef.current = { aktiv: true, x0: e.clientX, y0: e.clientY, dxRoh: 0, achse: null, bewegt: false };
    setZiehend(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };
  const onMove = (e) => {
    const d = dragRef.current;
    if (!d.aktiv) return;
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (!d.achse) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      d.achse = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (d.achse === "x") d.bewegt = true;
    }
    if (d.achse !== "x") { d.dyRoh = dy; return; }
    d.dxRoh = dx;               // Schwellen gelten fuer die echte Fingerbewegung, nicht fuer den gebremsten Weg
    setDrag(bremse(dx));
  };
  const onUp = () => {
    const d = dragRef.current;
    if (!d.aktiv) return;
    d.aktiv = false;
    setZiehend(false);
    const zug = d.dxRoh || 0;
    if (d.achse === "y") {
      const hoch = -(d.dyRoh || 0);
      if (flipped && card && card.warum) {
        if (hoch >= WARUM_ZUG) { haptik(HAPTIK.umdrehen); setWarum(true); }
        else if (hoch <= -WARUM_ZUG) setWarum(false);
      }
      setTimeout(() => { dragRef.current.bewegt = false; }, 0);
      return;
    }
    if (!flipped) {
      // Vor dem Aufdecken bewertet niemand — ein deutlicher Zug deckt einfach auf.
      setDrag(0);
      if (Math.abs(zug) >= AUFDECK_ZUG) { haptik(HAPTIK.umdrehen); dragRef.current.bewegt = false; setResult(null); setFlipped(true); }
    } else if (Math.abs(zug) >= SCHNAPP) {
      const richtung = zug > 0 ? 1 : -1;
      haptik(HAPTIK.ablegen);       // die Karte ist wirklich weg — das darf man spueren
      setWeg(richtung);
      clearTimer();
      timerRef.current = setTimeout(() => advance(richtung > 0 ? 3 : 1), 260);
    } else {
      setDrag(0);
    }
    // Der Klick nach dem Ziehen darf die Karte nicht nochmal umdrehen
    setTimeout(() => { dragRef.current.bewegt = false; }, 0);
  };
  const pruefe = (wert) => {
    if (!card || !wert) return;
    const ok = answerMatches(wert, nurText(card.back));
    setResult(ok ? "correct" : "wrong");
    setFlipped(true);
    if (ok) { clearTimer(); timerRef.current = setTimeout(() => advance(3), 1100); }
  };
  const check = () => pruefe(guessRef.current);
  const toggleMic = () => {
    if (!SR) return;
    if (listening) { stopMic(); return; }
    const rec = new SR();
    rec.lang = card ? card.blang : "de-DE";
    rec.interimResults = true; rec.continuous = false;
    // Ohne „Pruefen“-Knopf muss das Ergebnis von selbst geprueft werden. Der erkannte Text
    // wird im Closure gehalten — der State waere beim onend womoeglich noch nicht da.
    let erkannt = "";
    rec.onresult = (e) => {
      let t = ""; for (let k = 0; k < e.results.length; k++) t += e.results[k][0].transcript;
      erkannt = t.trim(); setGuess(erkannt);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => { setListening(false); pruefe(erkannt); };
    recRef.current = rec; setListening(true); rec.start();
  };

  useEffect(() => () => { clearTimer(); stopMic(); }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) {
        if (e.key === "Enter" && recall && !flipped) { e.preventDefault(); check(); }
        return;
      }
      if (e.code === "Space") { e.preventDefault(); reveal(); }
      if (flipped && result !== "correct" && e.key.toLowerCase() === "j") advance(3);
      if (flipped && result !== "correct" && e.key.toLowerCase() === "n") advance(1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  if (i >= queue.length || !card) {
    // Ende der Sitzung: einmal kurz spuerbar, dann Ruhe. Keine Fanfare.
    if (!fertigGemeldet.current) { fertigGemeldet.current = true; haptik(HAPTIK.fertig); }
    const schluss = werteAus(deck, queue, vorher.current);
    // "Durch" heisst: jede Karte des Stapels wurde mindestens einmal beantwortet.
    // Nicht "Sitzung zu Ende" - nach 20 von 60 Karten ist nichts durch.
    const ganzDurch = !gekappt && deck.cards.length > 0
      && deck.cards.every((c) => (c.reps || 0) > 0);
    const folge = ganzDurch && onFolgeholen ? naechsterVorschlag(deck, alleDecks) : null;
    return (
      <div className="study">
        <ZurueckKnopf onClick={onHome} />
        <div className="center-msg">
          <div className="big">Fertig.</div>
          {schluss.zeigen && (
            <>
              <div className="schluss-ring ub-auf">
                <svg viewBox="0 0 140 140" className="ub-ring" role="img"
                  aria-label={schluss.teile.map((t) => `${t.n} ${t.label}`).join(", ")}>
                  <circle cx="70" cy="70" r="52" className="ub-ring-grund" />
                  {schluss.boegen.map((b, i) => (
                    <circle key={b.key} cx="70" cy="70" r="52" className={"ub-bogen " + b.key}
                      style={{ animationDelay: `${180 + i * 190}ms` }}
                      strokeDasharray={`${b.laenge} ${b.rest}`} strokeDashoffset={-b.versatz} />
                  ))}
                </svg>
                <div className="ub-mitte">
                  <b>{schluss.gemacht}</b>
                  <span>{schluss.gemacht === 1 ? t("allg.karte") : t("allg.karten")} {t("ende.geschafft")}</span>
                </div>
              </div>
              <div className="schluss-satz">{schluss.satz}</div>
            </>
          )}
          <div className="small">{gekappt
            ? t("ende.rest")
            : t("ende.alles")}</div>
          {/* Der Begleiter empfiehlt - im richtigen Moment: wenn der Stapel
              wirklich einmal ganz durch ist. In der Bibliothek stand dieselbe
              Zeile vorher nur im Weg. */}
          {folge && (
            <div className="folge-karte">
              <div className="folge-titel">{t("ende.durch")}</div>
              <div className="folge-text">{t("ende.naechstes")} <b>{folge.name}</b>.</div>
              <div className="folge-knoepfe">
                <button className="btn btn-primary" onClick={() => onFolgeholen(folge.eintrag)}>
                  Holen und loslegen
                </button>
                <button className="link-inline" onClick={onBack}>{t("ende.spaeter")}</button>
              </div>
            </div>
          )}
          {!folge && (
            <button className="btn btn-ghost" onClick={onBack} style={{ marginTop: 8 }}>
              {deck.id === "__mix__" ? "Zur Startseite" : t("ende.zurdeck")}
            </button>
          )}
        </div>
      </div>
    );
  }

  const now = Date.now();
  const rest = queue.length - i - 1;
  const scharf = Math.abs(drag) >= SCHNAPP ? Math.sign(drag) : 0; // welche Note liegt gerade an
  const pAgain = fmtDays(computeNext(card, 1, now).intervalDays);
  const pGood = fmtDays(computeNext(card, 3, now).intervalDays);
  const answerLangName = LANGS.find((l) => l.c === card.blang)?.n || "";

  return (
    <div className="study">
      <ZurueckKnopf onClick={onHome} sound={sound}
        rechts={<span className="zaehler">{i + 1} / {queue.length}</span>} />
      {/* Frei durch den Stapel: die Leiste zeigt nicht nur, wo man ist, man kommt darueber
          auch hin. Springen bewertet nichts — der Lernfortschritt bleibt unangetastet. */}
      <div className="progress" role="slider" tabIndex={0} aria-label={t("lern.springen")}
        aria-valuemin={1} aria-valuemax={queue.length} aria-valuenow={i + 1}
        onPointerDown={(e) => { springeZu(e); try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} }}
        onPointerMove={(e) => { if (e.buttons) springeZu(e); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); geheZu(i - 1); }
          if (e.key === "ArrowRight") { e.preventDefault(); geheZu(i + 1); }
        }}>
        {queue.map((_, k) => <span key={k} className={"pdot" + (k < i ? " done" : k === i ? " cur" : "")} />)}
      </div>

      <div className="cardstage">
       {/* Beim Bearbeiten tritt das Kartenblatt an die Stelle der Karte. Drei
           Felder passen nicht auf eine Kartenseite, und die Karte umdrehen zu
           muessen, um die Rueckseite zu tippen, war genau das Umstaendliche. */}
       {bearbeiten ? (
        <div className="blatt-buehne">
          <KartenBlatt wert={entwurf} onChange={setEntwurf} tts={tts}
            spracheAn={!!(card.flang && card.blang && card.flang !== card.blang)} autoFokus />
        </div>
       ) : (
       <div className="deckwrap">
        {rest > 1 && <span className="stack s2" />}
        {rest > 0 && <span className="stack s1" />}
        <div className={"swipe" + (kannZiehen ? " armed" : "") + (weg ? " gone" : ziehend ? "" : " settle")}
          style={{ transform: `translateX(${weg ? weg * 520 : drag}px) rotate(${(weg ? weg * 520 : drag) / 22}deg)`,
                   opacity: weg ? 0 : 1 }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div className={"flip" + (flipped ? " flipped" : "")} onClick={reveal}>
          <div className="face">
            <span className="kicker">{card.fach ? card.fach : "Frage"}</span>
            <button className="face-spk" onClick={(e) => { e.stopPropagation(); tts.speak(nurText(card.front), card.flang); }} disabled={!tts.supported} aria-label={t("lern.vorlesen")}><SpeakerIcon /></button>
            {onEditCard && <button className="face-edit-btn" onClick={(e) => { e.stopPropagation(); starteBearbeiten(); }} aria-label={t("lern.aendern")}><PencilIcon /></button>}
            <Kartentext className="term" html={card.front} />
          </div>
          <div className="face face-back">
            <span className="kicker">{card.fach ? card.fach + " · Antwort" : "Antwort"}</span>
            <button className="face-spk" onClick={(e) => { e.stopPropagation(); tts.speak(nurText(card.back), card.blang); }} disabled={!tts.supported} aria-label={t("lern.vorlesen")}><SpeakerIcon /></button>
            {onEditCard && <button className="face-edit-btn" onClick={(e) => { e.stopPropagation(); starteBearbeiten(); }} aria-label={t("lern.aendern")}><PencilIcon /></button>}
            {result === "correct" && <div className="fb fb-correct">Richtig ✓</div>}
            {result === "wrong" && guess.trim() && <div className="fb fb-wrong">Du: „{guess.trim()}"</div>}
            {(
                <>
                  <Kartentext className="answer" html={card.back} />
                  {/* Das dritte Feld. Der Hinweis ist ein Knopf, nicht nur eine
                      Geste - eine Geste, die man nicht sieht, gibt es nicht. */}
                  {card.warum && !warum && (
                    <button className="warum-knopf" onClick={(e) => { e.stopPropagation(); haptik(HAPTIK.umdrehen); setWarum(true); }}>
                      <span className="warum-pfeil" aria-hidden="true">↑</span> Warum?
                    </button>
                  )}
                  {card.warum && warum && (
                    <div className="warum-feld">
                      <div className="warum-titel">Warum</div>
                      <Kartentext className="warum-text" html={card.warum} />
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
        </div>
       </div>
       )}
      </div>

      {bearbeiten ? (
        <div className="recall-actions" style={{ gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setBearbeiten(false)}>{t("ed.abbrechen")}</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={speichereBearbeitung}>{t("ed.speichern")}</button>
        </div>
      ) : recall && !flipped ? (
        // Keine Texteingabe mehr: sie oeffnet die Tastatur, verdeckt die Karte und
        // reisst den Fluss ab. Antwort sagen — oder einfach weiter. Beides ohne Tippen.
        <div className="recall">
          <div className="recall-actions">
            {SR && (
              // Rund und ohne Text: ein Mikrofon erklaert sich selbst. Wer nicht sprechen
              // will, drueckt es einfach nicht — dafuer braucht es keinen Schalter.
              <button className={"mic-round" + (listening ? " live" : "")} onClick={toggleMic}
                aria-label={listening ? t("lern.hoert") : "Antwort sagen"}
                title={listening ? t("lern.hoert") : "Antwort sagen"}><MicIcon /></button>
            )}

          </div>
        </div>
      ) : (
        <div className="tap-hint">
          {result === "correct" ? t("lern.richtig")
            : flipped ? ""
              : t("lern.tipp")}
        </div>
      )}

      {aufstieg && <div className="aufstieg" role="status">{aufstieg}</div>}
      {flipped && result !== "correct" && !bearbeiten && (
        <div className="rate-row">
          {/* Beim Ziehen leuchtet der Knopf auf, der gerade anliegt — so lernt man die Geste nebenbei. */}
          <button className={"btn btn-again" + (scharf < 0 ? " scharf" : "")} onClick={() => advance(1)}>{t("lern.nochmal")}</button>
          <button className={"btn btn-good" + (scharf > 0 ? " scharf" : "")} onClick={() => advance(3)}>{t("lern.gewusst")}</button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Foto & Text -> Kartei ----------------
 * Realistischer Weg ohne Server: Das Handy kann Text im Bild selbst erkennen
 * (iOS Live Text, Android Google Lens). Der erkannte Text wird eingefuegt,
 * Robin macht daraus Karten. Das Foto bleibt zur Kontrolle daneben liegen und
 * verlaesst das Geraet nie. Kein Upload, kein Dienst, keine Kosten.
 */
const SEPARATORS = [
  /\t+/, / [—–] /, / - /, / = /, /\s*[;|]\s*/, /:\s+/, / \/ /, /\s{2,}/,
];

const clean = (s) => s.replace(/^\s*(\d+\s*[.)]|[-•*·])\s+/, "").trim();

// Modus 1: Vokabelliste — pro Zeile ein Paar, getrennt durch Strich, Tab, Doppelpunkt …
/* Was KI-Werkzeuge tatsaechlich liefern - nachgemessen, nicht vermutet:
   ChatGPT nummeriert und setzt fett ("1. **Schnecke** — ..."), Gemini baut gern
   eine Markdown-Tabelle, andere haengen Einleitungs- und Schlusssaetze an.
   Ungehaertet erkannte der Parser aus einer Tabelle NULL Karten und aus einer
   nummerierten Liste Vorderseiten wie "1. **Schnecke**".
   Deshalb wird jede Zeile zuerst von Formatierung befreit. Wer hier etwas
   aendert: die Faelle stehen als Test in der Projektablage. */
const TABELLE_TRENN = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
function entformatiere(zeile) {
  let s = zeile;
  // Markdown-Tabellenzeile: die aeusseren Striche weg, die inneren werden
  // vom normalen Trennzeichen | ohnehin erkannt.
  if (/^\s*\|.*\|\s*$/.test(s)) s = s.replace(/^\s*\|/, "").replace(/\|\s*$/, "");
  // Aufzaehlungszeichen und Nummerierung am Zeilenanfang
  s = s.replace(/^\s*(?:[-*+\u2022]\s+|\d{1,3}[.)]\s+)/, "");
  // Fett, kursiv, Code
  s = s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1");
  s = s.replace(/(^|\s)\*(\S[^*]*?)\*(?=\s|$)/g, "$1$2");
  s = s.replace(/`([^`]+)`/g, "$1");
  return s;
}

function splitPairs(text) {
  const rows = [], skipped = [];
  for (const raw of (text || "").split(/\r?\n/)) {
    if (TABELLE_TRENN.test(raw)) continue;          // |---|---|
    const line = clean(entformatiere(raw));
    if (!line) continue;
    // Kopfzeile einer Tabelle ueberspringen
    if (/^(vorderseite|frage|begriff|front|question|term)\s*[|:\t]/i.test(line)) continue;
    let pair = null;
    for (const re of SEPARATORS) {
      const parts = line.split(re);
      if (parts.length >= 2) {
        const f = parts[0].trim(), b = parts.slice(1).join(" ").trim();
        if (f && b) { pair = { f, b }; break; }
      }
    }
    if (pair) rows.push(pair); else skipped.push(line);
  }
  return { rows, skipped };
}

// Modus 2: Mitschrift, Merksaetze, Rechenaufgaben — Frage und Antwort stehen untereinander.
// Leerzeilen trennen Bloecke; gibt es keine, werden immer zwei Zeilen zu einer Karte.
function splitAlternating(text) {
  const rows = [], skipped = [];
  const raw = (text || "").split(/\r?\n/);
  const hasBlocks = /\n\s*\n/.test(text || "");
  if (hasBlocks) {
    let block = [];
    const flush = () => {
      if (!block.length) return;
      if (block.length === 1) skipped.push(block[0]);
      else rows.push({ f: block[0], b: block.slice(1).join(" ") });
      block = [];
    };
    for (const r of raw) { const l = clean(r); if (l) block.push(l); else flush(); }
    flush();
  } else {
    const lines = raw.map(clean).filter(Boolean);
    for (let i = 0; i < lines.length; i += 2) {
      if (lines[i + 1]) rows.push({ f: lines[i], b: lines[i + 1] });
      else skipped.push(lines[i]);
    }
  }
  return { rows, skipped };
}

// Welcher Modus passt? Wenn die meisten Zeilen ein Trennzeichen haben, sind es Paare.
function detectMode(text) {
  const lines = (text || "").split(/\r?\n/).map(clean).filter(Boolean).length;
  if (!lines) return "paare";
  return splitPairs(text).rows.length * 2 >= lines ? "paare" : "wechsel";
}

function parseCards(text, mode) {
  return mode === "wechsel" ? splitAlternating(text) : splitPairs(text);
}

function FotoImport({ sound, onBack, onImport, zielName }) {
  const [photo, setPhoto] = useState(null);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [flang, setFlang] = useState("en-US");
  const [blang, setBlang] = useState("de-DE");
  const [dropped, setDropped] = useState({});
  const [modeOverride, setModeOverride] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);

  const pick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (photo) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(f));
  };

  const mode = modeOverride || detectMode(text);
  const { rows, skipped } = parseCards(text, mode);
  const keep = rows.filter((_, i) => !dropped[i]);

  const save = () => {
    if (!keep.length) return;
    onImport({
      id: uid(), name: name.trim() || t("foto.neu"),
      cards: keep.map((r) => ({ id: uid(), front: r.f, back: r.b, flang, blang, due: 0 })),
    });
  };

  return (
    <>
      <ZurueckKnopf onClick={onBack} sound={sound} />
      <div className="h1">{t("foto.titel")}</div>
      {zielName && <div className="sub">Die Karten landen in „{zielName}“.</div>}
      <div className="sub">
        Vokabelliste, Mathe-Seite, Merksätze, eigene Mitschrift — fotografieren, den Text vom
        Handy erkennen lassen, hier einfügen. Robin macht die Karten daraus, und das Foto bleibt
        auf deinem Gerät.
      </div>

      <div className="panel">
        <div className="panel-title">1 · Foto (optional)</div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment"
          onChange={pick} style={{ display: "none" }} />
        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => fileRef.current && fileRef.current.click()}>
          {photo ? t("foto.anderes") : t("foto.knopf")}
        </button>
        {photo && <img className="imp-photo" src={photo} alt="Fotografierte Buchseite" />}
        <div className="mic-hint" style={{ marginTop: 10 }}>
          So kommst du an den Text: <b>iPhone</b> — Foto öffnen, lange auf den Text tippen,
          „Alles auswählen“, kopieren. <b>Android</b> — in Google Fotos auf „Lens“ tippen, Text kopieren.
          Beides passiert direkt am Gerät.
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">2 · Text einfügen</div>
        <textarea className="share-ta" style={{ height: 130 }} value={text} onChange={(e) => { setText(e.target.value); setDropped({}); }}
          placeholder={"hello — hallo\nplease — bitte\n\noder untereinander:\nWas ist der Median?\nDer mittlere Wert einer geordneten Reihe."} />
        <div className="target-toggle" style={{ marginTop: 12, marginBottom: 0, flexWrap: "wrap" }}>
          <button className={"chip" + (mode === "paare" ? " on" : "")} onClick={() => setModeOverride("paare")} aria-pressed={mode === "paare"}>
            Zwei Spalten
          </button>
          <button className={"chip" + (mode === "wechsel" ? " on" : "")} onClick={() => setModeOverride("wechsel")} aria-pressed={mode === "wechsel"}>
            Untereinander
          </button>
          {!modeOverride && <span className="edit-hint">automatisch erkannt</span>}
        </div>
        <div className="mic-hint" style={{ marginTop: 10 }}>
          {mode === "paare"
            ? "Vokabelliste: eine Zeile pro Karte. Dazwischen darf stehen: Gedankenstrich, Bindestrich, Tabulator, Semikolon, Doppelpunkt oder mehrere Leerzeichen."
            : "Mitschrift, Merksätze, Rechenaufgaben: Frage oben, Antwort darunter. Leerzeilen trennen die Karten — ohne Leerzeilen werden immer zwei Zeilen zu einer Karte."}
        </div>
      </div>

      {(rows.length > 0 || skipped.length > 0) && (
        <div className="panel">
          <div className="panel-title">3 · {keep.length} {keep.length === 1 ? t("allg.karte") : t("allg.karten")} {t("foto.erkannt")}</div>

          <div className="fieldrow" style={{ marginBottom: 10 }}>
            <input className="field" placeholder={t("neu.platz2")}
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="target-toggle" style={{ marginBottom: 12 }}>
            <span className="edit-hint">Sprachen:</span>
            <select className="lang-sel" style={{ marginLeft: 0 }} value={flang} onChange={(e) => setFlang(e.target.value)} title={t("ed.lang.front")}>
              {LANGS.map((l) => <option key={l.c} value={l.c}>{l.n}</option>)}
            </select>
            <span className="edit-hint">→</span>
            <select className="lang-sel" style={{ marginLeft: 0 }} value={blang} onChange={(e) => setBlang(e.target.value)} title={t("ed.lang.back")}>
              {LANGS.map((l) => <option key={l.c} value={l.c}>{l.n}</option>)}
            </select>
          </div>

          {rows.map((r, i) => (
            <div key={i} className={"crow" + (dropped[i] ? " crow-off" : "")}>
              <div>
                <div className="crow-front">{r.f}</div>
                <div className="crow-back">{r.b}</div>
              </div>
              <button className="crow-del" style={{ marginLeft: "auto" }} aria-label={t("foto.zeileweg")}
                onClick={() => setDropped((d) => ({ ...d, [i]: !d[i] }))}>{dropped[i] ? "+" : "×"}</button>
            </div>
          ))}

          {skipped.length > 0 && (
            <div className="mic-hint" style={{ marginTop: 12 }}>
              {skipped.length} {skipped.length === 1 ? "Zeile wurde" : "Zeilen wurden"} nicht erkannt und
              {skipped.length === 1 ? " bleibt" : " bleiben"} weg — dort fehlt ein Trennzeichen.
              Beispiel: „{skipped[0].slice(0, 40)}“
            </div>
          )}

          <button className="btn btn-primary" style={{ width: "100%", marginTop: 14 }} onClick={save} disabled={!keep.length}>
            {keep.length ? `Kartei mit ${keep.length} Karten anlegen` : t("foto.keine")}
          </button>
        </div>
      )}
    </>
  );
}

/* ---------------- Aufwaermen: Lichter aus ----------------
 * Eigene View, kein Bezug zum Scheduler: keine Punkte, kein Streak,
 * nichts wird gespeichert. Nur kurz den Kopf freimachen.
 */
function LightsOut({ sound, onBack }) {
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState(() => loScramble(LO_LEVELS[1].presses));
  const [history, setHistory] = useState([]);
  const solved = !grid.some(Boolean);
  const lit = grid.filter(Boolean).length;

  const press = (idx) => {
    if (solved) return;
    setGrid((g) => loToggle(g, idx));
    setHistory((h) => [...h, idx]);
  };
  const undo = () => {
    if (!history.length) return;
    const idx = history[history.length - 1];
    setGrid((g) => loToggle(g, idx)); // ein Druck ist selbstinvers
    setHistory((h) => h.slice(0, -1));
  };
  const fresh = (li) => { setLevel(li); setGrid(loScramble(LO_LEVELS[li].presses)); setHistory([]); };

  return (
    <div className="lo">
      <ZurueckKnopf onClick={onBack} sound={sound} />
      <div className="h1">Lichter aus</div>
      <div className="sub">
        Tippen schaltet ein Feld — und seine vier direkten Nachbarn gleich mit.
        Ziel: alle Lichter aus. Kein Timer, keine Punkte, du kannst jederzeit aufhören.
      </div>

      <div className="lo-levels">
        {LO_LEVELS.map((l, i) => (
          <button key={l.key} className={"chip" + (i === level ? " on" : "")}
            onClick={() => fresh(i)} aria-pressed={i === level}>{l.label}</button>
        ))}
      </div>

      <div className="lo-board" role="group" aria-label={t("spiel.brett5")}>
        {grid.map((on, idx) => (
          <button key={idx} className={"lo-cell" + (on ? " on" : "")} onClick={() => press(idx)} disabled={solved}
            aria-pressed={on}
            aria-label={`Zeile ${Math.floor(idx / LO_N) + 1}, Spalte ${(idx % LO_N) + 1} — ${on ? "an" : "aus"}`} />
        ))}
      </div>

      <div className="lo-status">
        {solved ? (
          <>
            <span className="done">Alle aus.</span>
            Schön gemacht — {history.length} {history.length === 1 ? "Zug" : t("spiel.zuege")}. Noch eins, oder zurück zu den Karten?
          </>
        ) : (
          <>{lit} {lit === 1 ? "Licht" : "Lichter"} brennen noch · {history.length} {history.length === 1 ? "Zug" : t("spiel.zuege")}</>
        )}
      </div>

      <div className="lo-actions">
        <button className="btn btn-ghost" onClick={undo} disabled={solved || !history.length}>{t("spiel.zurueck")}</button>
        <button className={"btn " + (solved ? "btn-primary" : "btn-ghost")} onClick={() => fresh(level)}>
          {solved ? "Noch eins!" : "Neu mischen"}
        </button>
      </div>
    </div>
  );
}

/* Navigation: Pfeil statt Zeichen, damit lange Kartei-Namen nicht umbrechen. */
function ChevronIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v13" /><path d="m8 7 4-4 4 4" /><path d="M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
    </svg>
  );
}

// An/Aus statt zweier Verben: den Schieber kennt jeder vom Telefon, er braucht kein Wort.
// `role="switch"` sagt Screenreadern dasselbe, was das Bild den Augen sagt.
function Kippschalter({ an, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={an} aria-label={label}
      className={"kipp" + (an ? " an" : "")} onClick={onChange}>
      <span className="kipp-bahn"><span className="kipp-knopf" /></span>
    </button>
  );
}
function BackLink({ label, onClick }) {
  return (
    <button className="back-link" onClick={onClick}>
      <ChevronIcon /><span className="back-label">{label}</span>
    </button>
  );
}
// Feder *mit* dem Namen: allein muesste man die Feder erklaeren, zusammen mit „Robin“
// sagt der Knopf selbst, wohin er fuehrt — und es ist dieselbe Marke wie auf der Startseite.
/* Zurueck steht ueberall an derselben Stelle oben links — das ist die Konvention auf beiden
 * Systemen, und Konsistenz ist laut Forschung wichtiger als jede clevere Loesung. */
function ZurueckKnopf({ onClick, onHeim, sound, rechts }) {
  const marke = useMarke();
  return (
    <>
      <div className="topbar">
        {/* Die Marke ist zugleich der Weg nach Hause — erwartet man von einem Logo. */}
        <button className="brand brand-heim" onClick={onHeim || onClick} aria-label={t("allg.heim")}>
          <span className="brand-mark"><OctoIcon kopfhoerer={!!(sound && sound.idx > 0)} /></span>
          <span className="brand-name">{marke}</span>
        </button>
        <div className="topbar-rechts">
          {rechts}
          {sound ? <SoundToggle sound={sound} /> : null}
        </div>
      </div>
      <button className="zurueck-knopf" onClick={onClick} aria-label="Zurück">
        <ChevronIcon /><span>{t("allg.zurueck")}</span>
      </button>
    </>
  );
}
function HomeButton({ onClick }) {
  const marke = useMarke();
  return (
    <button className="home-brand" onClick={onClick} aria-label={t("allg.heim")} title={t("allg.heim")}>
      <span className="brand-mark"><OctoIcon s={21} /></span>
      <span className="brand-name">{marke}</span>
    </button>
  );
}

/* Kachel-Icons: erklaeren die Funktion schneller als jede Zeile Text. */
function CameraCardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="6" width="14" height="11" rx="2.5" />
      <path d="M6 6l1.1-2h3.8L12 6" />
      <circle cx="8.5" cy="11.5" r="3" />
      <rect x="13.5" y="11.5" width="9" height="10" rx="2" fill="#fff" />
      <path d="M16 15h4M16 18h2.5" />
    </svg>
  );
}
function BooksIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h5.5a2.5 2.5 0 0 1 2.5 2.5V20a2.5 2.5 0 0 0-2.5-2.5H4z" />
      <path d="M20 4h-5.5A2.5 2.5 0 0 0 12 6.5V20a2.5 2.5 0 0 1 2.5-2.5H20z" />
    </svg>
  );
}
function MedienIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2.6" width="12" height="18.8" rx="2.6" />
      <path d="M10.6 5.4h2.8" />
      <circle cx="12" cy="17.4" r="1.15" />
    </svg>
  );
}
function SchuleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.2 21 8v1.6H3V8z" />
      <path d="M4.6 9.6V20M19.4 9.6V20M2.6 20h18.8" />
      <path d="M9.8 20v-4.4a2.2 2.2 0 0 1 4.4 0V20" />
      <path d="M7.6 12.6h1.2M15.2 12.6h1.2" />
    </svg>
  );
}
function QuizIcon() {
  // Geschlossene Sprechblase — eine gestellte Frage. Der offene Bogen davor sah aus,
  // als waere der Kreis kaputt.
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 4.5H3.5a1.5 1.5 0 0 0-1.5 1.5v9a1.5 1.5 0 0 0 1.5 1.5H7v4l4.4-4h9.1a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5Z" />
      <path d="M9.6 8.9a2.5 2.5 0 0 1 4.8.9c0 1.6-2.4 2-2.4 3.5" />
      <circle cx="12" cy="15.4" r=".95" fill="currentColor" stroke="none" />
    </svg>
  );
}
function WuerfelIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4" />
      <circle cx="8.4" cy="8.4" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="15.6" cy="15.6" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="15.6" cy="8.4" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="8.4" cy="15.6" r="1.35" fill="currentColor" stroke="none" />
    </svg>
  );
}
function VierIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="2.5" y="3.5" width="19" height="17" rx="3" />
      <circle cx="8" cy="16" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="2.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function RohrMenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h6a3 3 0 0 1 3 3v4a3 3 0 0 0 3 3h6" />
      <circle cx="3" cy="7" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" strokeWidth="1.1" />
    </svg>
  );
}

// Marke: Frida und Klaus. Die Zeichnung ist von Marc; hier ist sie nur fuer die
// App aufbereitet. Zwei Dinge sind dafuer noetig:
//  - Der Koerper laeuft auf currentColor, damit die Begleiterfarbe ihn faerbt.
//  - Der Augapfel ist ein VOLLER Kreis. In der Vorlage hat das Augenweiss ein Loch
//    an der Pupillenstelle; sobald die Pupille wandert, schaut dort sonst die
//    Koerperfarbe durch.
// Die Pupillen liegen in einer eigenen Gruppe und werden per transform bewegt.
// Das ist die ganze Animation - kein Neuzeichnen, laeuft auf der GPU.
const OCTO_AUGE = [[29.09, 33.95], [50.60, 33.95]];
/* Pupillenversatz je Blickrichtung, in Einheiten des viewBox.
   Der Spielraum ist 4.3 (Augenradius 9.07 minus Pupillenradius 4.77) - darueber
   stiesse die Pupille am Augenrand an. Deshalb bleibt alles unter 3.5.
   `ruhig` sitzt bewusst NICHT mittig: mittige Pupillen wirken tot. */
const OCTO_BLICKE = {
  ruhig:    [[1.92, 1.34], [1.85, 1.35]],
  links:    [[-2.90, 1.10], [-2.95, 1.10]],
  rechts:   [[3.40, 1.10], [3.35, 1.10]],
  schielen: [[3.30, 0.90], [-3.30, 0.90]],
  hoch:     [[1.30, -2.90], [1.25, -2.90]],
  runter:   [[1.60, 3.30], [1.55, 3.30]],
  weg:      [[-2.60, -2.30], [-2.60, -2.30]],
};
/* Bloop mit Kopfhoerer. Der Buegel liegt AUF dem Kopf statt darueber: der
 * Scheitel beruehrt schon den oberen Rand des viewBox, ein Buegel darueber
 * waere abgeschnitten. Die Muscheln sitzen dort, wo bei einem Oktopus Ohren
 * waeren - er hat keine, aber genau das ist der Witz.
 * Gezeichnet wird VOR den Augen, damit nichts das Gesicht verdeckt. */
function Kopfhoerer() {
  return (
    <g className="octo-kopfhoerer" aria-hidden="true">
      {/* Der Buegel folgt der KOPFKONTUR, nicht einer geschaetzten Rundung.
          Nachgemessen am Koerperpfad ist der Kopf ein Kreis um (40, 38.8) mit
          Radius 38.8. Der Buegel liegt mit Radius 34.5 knapp darauf: Scheitel
          bei y=3, also drei Einheiten unter dem Kopfscheitel - er sitzt auf,
          statt darueber zu schweben. Wer die Endpunkte verschiebt, muss den
          Radius mitrechnen, sonst rutscht der Bogen vom Kopf.
          Die Farbe kommt aus --ink und folgt dem Thema: dunkel auf hellem
          Grund, hell auf dunklem. */}
      <path d="M5.5,34 A34.5,34.5 0 0 1 74.2,34" fill="none" stroke="var(--ink)"
        strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="5.5" cy="35.5" rx="5" ry="9" fill="var(--ink)" />
      <ellipse cx="74.2" cy="35.5" rx="5" ry="9" fill="var(--ink)" />
    </g>
  );
}

/* Bloop lebt ein bisschen. Der Blick wandert alle paar Sekunden, dazwischen
 * blinzelt er. Beides bewusst unregelmaessig: ein Takt waere ein Metronom, und
 * genau das wirkt tot.
 *
 * Regel dabei: **Er reagiert nicht auf Leistung.** Kein trauriger Blick nach
 * einer falschen Antwort, kein Jubeln nach einer richtigen - das waere die
 * Belohnungsschleife durch die Hintertuer. Er schaut sich einfach um, so wie
 * jemand, der neben einem sitzt.
 *
 * Kostet nichts, wenn niemand hinsieht: die Zeitgeber laufen nur, solange die
 * Komponente montiert ist, und `prefers-reduced-motion` schaltet die Bewegung
 * per CSS ab (die Zeitgeber duerfen weiterlaufen, sie aendern dann nur Werte,
 * die niemand sieht).
 */
const OCTO_WANDER = ["links", "rechts", "hoch", "runter", "schielen"];

/* **Ruhe ist der Normalzustand.** Bloop schaut alle zehn bis zwanzig Sekunden
   einmal kurz woanders hin und kommt dann zurueck - er wandert nicht dauernd.
   Eine erste Fassung wechselte alle drei Sekunden den Blick und blinzelte dazu;
   das war keine Lebendigkeit mehr, sondern Unruhe, und man konnte nicht mehr
   danebensitzen, ohne hinzusehen.
   Geblinzelt wird gar nicht: die Augen sind gross und rund, ein Zuklappen
   liest sich in dieser Groesse als Zucken statt als Blinzeln. */
function useOctoLeben(an = true) {
  const [blick, setBlick] = useState("ruhig");
  useEffect(() => {
    if (!an) return;
    let naechster, zurueck;
    const schauen = () => {
      setBlick(OCTO_WANDER[Math.floor(Math.random() * OCTO_WANDER.length)]);
      // Kurz hinsehen, dann wieder geradeaus.
      zurueck = setTimeout(() => setBlick("ruhig"), 1100 + Math.random() * 900);
      naechster = setTimeout(schauen, 10000 + Math.random() * 10000);
    };
    naechster = setTimeout(schauen, 4000 + Math.random() * 5000);
    return () => { clearTimeout(naechster); clearTimeout(zurueck); };
  }, [an]);
  return { blick };
}

function OctoIcon({ s = 26, blick = "ruhig", kopfhoerer = false }) {
  const v = OCTO_BLICKE[blick] || OCTO_BLICKE.ruhig;
  return (
    <svg width={s} height={Math.round(s * 1.0747)} viewBox="0 0 79.67 85.62" aria-hidden="true"
      className="octo">
      <path fill="currentColor" d="M45.86,64.96c-4.09-.64-7.87-.11-12-.26.52,6.07-2.57,23.47-10.2,20.54-2.25-.86-3.75-3.7-2.49-6.27,1.87-3.84,6.49-20.79-.57-19.32-.99,6.13-2.03,13.95-8.15,17.59-2.85,1.7-8.72-.66-10.61-3.11-3.73-4.84-1.27-10.99,2.53-14.81,7.45-7.49.31-10.98.09-25.18C4.18,15.23,18.21,1.28,36.87.09c13.87-.88,27.18,4.52,34.08,16.81,5.43,9.67,5.19,20.83,1.79,31.25-1.45,4.45-.8,7.99,2.59,11.16,3.78,3.52,5.98,9.59,2.88,14.51-1.68,2.67-8.05,5.21-10.96,3.42-10.19-6.26-5.25-21.2-10.73-17.05-2.66,2.01-.44,13.36,2.18,18.79,1.23,2.55-.57,5.4-2.78,6.27-7.48,2.96-10.35-13.22-10.04-20.29ZM38.16,33.95c0-5-4.06-9.06-9.07-9.06s-9.07,4.06-9.07,9.06,4.06,9.06,9.07,9.06,9.07-4.06,9.07-9.06ZM59.67,33.95c0-5-4.06-9.06-9.07-9.06s-9.07,4.06-9.07,9.06,4.06,9.06,9.07,9.06,9.07-4.06,9.07-9.06ZM34.51,48.61c-.95-.62-2.37.1-2.8.7-.28.4-.66,1.38-.02,2.07,4.2,4.49,11.43,4.78,15.82.45.89-.87.67-1.94.41-2.51-1.7-3.7-5.21,4.61-13.41-.71Z" />
      {kopfhoerer && <Kopfhoerer />}
      <g className="octo-augen">
        {OCTO_AUGE.map(([cx, cy], i) => (
          <circle key={"a" + i} cx={cx} cy={cy} r="9.07" fill="#fff" />
        ))}
      </g>
      <path fill="#293A38" d="M34.51,48.61c8.2,5.32,11.71-2.99,13.41.71.26.57.48,1.64-.41,2.51-4.39,4.33-11.62,4.04-15.82-.45-.64-.69-.27-1.67.02-2.07.42-.6,1.85-1.31,2.8-.7Z" />
      <g className="octo-augen">
        {OCTO_AUGE.map(([cx, cy], i) => (
          <g key={"p" + i} className="octo-pupille" transform={`translate(${v[i][0]} ${v[i][1]})`}>
            <circle cx={cx} cy={cy} r="4.77" fill="#293A38" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function NoiseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 12h2l2-5 3 12 3-16 3 14 2-5h3" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v4" />
    </svg>
  );
}
/* ---------------- Kleiner Editor ----------------
 * Schlank: fett, unterstrichen, drei Groessen, fuenf Farben — mehr braucht eine Lernkarte
 * nicht, und mehr wuerde die Karte zumuellen. Die Leiste schwebt unter der Karte und
 * verschwindet mit dem Editor. Auswahl bleibt beim Antippen erhalten (onMouseDown
 * verhindert, dass das contenteditable den Fokus verliert).
 */
const SCHRIFTGROESSEN = [
  { l: "klein", v: "0.75em" }, { l: "normal", v: "" }, { l: "groß", v: "1.5em" },
];
const TINTE_STANDARD = "#6B6B6B";
const TEXTFARBEN = [
  { l: "Standard", v: TINTE_STANDARD }, { l: "Violett", v: "#B042FE" }, { l: "Koralle", v: "#D94D2A" },
  { l: "Blau", v: "#517EBD" }, { l: "Mint", v: "#0F8E6E" }, { l: "Ocker", v: "#A07511" },
];

/* ---------------- Kartenblatt: alle drei Seiten auf einmal ----------------
 * Vorher gab es zwei halbe Editoren: beim Anlegen eine Karte, die man umdrehen
 * musste (zwei Felder, eines immer verdeckt), und beim Aendern einen Editor fuer
 * genau die Seite, die man gerade sah. **Die dritte Seite liess sich nirgends
 * bearbeiten** - ausgerechnet die, die Bloop Cards ausmacht.
 *
 * Jetzt stehen alle drei untereinander, beschriftet, alle sichtbar. Marcs
 * Vorgabe: "soll gewohnt funktionieren wie eine Nachricht schreiben." Beim
 * Nachrichtenschreiben dreht man nichts um - man sieht, was man tippt.
 *
 * Die Formatierungsleiste wirkt auf das ZULETZT FOKUSSIERTE Feld (`aktiv`).
 * Deshalb liegt sie unten und nicht in jedem Feld einzeln: drei Leisten waeren
 * dreimal derselbe Platzverbrauch.
 *
 * Jedes Feld ist contentEditable, weil Karten Auszeichnung tragen duerfen. Der
 * Text geht bei JEDER Aenderung durch saeubereHTML() - fremdes HTML kommt ueber
 * KBX-Codes herein, und daran darf nie vorbeigerendert werden.
 */
const BLATT_FELDER = [
  { k: "front", get titel() { return t("ed.vorderseite"); }, get platz() { return t("ed.platz.front"); }, sprache: "flang" },
  { k: "back", get titel() { return t("ed.rueckseite"); }, get platz() { return t("ed.platz.back"); }, sprache: "blang" },
  { k: "warum", get titel() { return t("ed.warum"); }, get platz() { return t("ed.platz.warum"); },
    leise: true },
];

function KartenBlatt({ wert, onChange, tts, mikroFuer, onMikro, spracheAn = true, autoFokus }) {
  const felder = useRef({});
  const [aktiv, setAktiv] = useState("front");
  const [warumAuf, setWarumAuf] = useState(!!(wert.warum || "").trim());

  // Nur beim ersten Aufbau schreiben. Bei jedem Tastendruck neu zu setzen wuerde
  // den Cursor ans Ende reissen - der klassische contentEditable-Fehler.
  useEffect(() => {
    for (const f of BLATT_FELDER) {
      const el = felder.current[f.k];
      if (el && el.innerHTML !== (wert[f.k] || "")) el.innerHTML = wert[f.k] || "";
    }
    if (autoFokus && felder.current.front) felder.current.front.focus();
  }, []);

  const melde = (k) => {
    const el = felder.current[k];
    if (el) onChange({ ...wert, [k]: saeubereHTML(el.innerHTML) });
  };
  const kommando = (befehl, arg) => {
    const el = felder.current[aktiv];
    if (!el) return;
    el.focus();
    try { document.execCommand("styleWithCSS", false, true); } catch {}
    try { document.execCommand(befehl, false, arg); } catch {}
    melde(aktiv);
  };
  const halteAuswahl = (e) => e.preventDefault();

  /* Eingefuegt wird nur REINER TEXT. Beim Einfuegen haengt der Browser fremdes
     HTML sofort ins Dokument - ein <img onerror=...> feuert dann, BEVOR
     saeubereHTML() ueberhaupt drankommt. Der Saeuberer schuetzt die gespeicherte
     Karte, aber nicht den Moment des Einfuegens. Getippt werden kann so etwas
     nicht, eingefuegt schon: aus einer Webseite, aus einer Nachricht.
     In einer Kinder-App ist das der Weg, der zubleiben muss. */
  const nurTextEinfuegen = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    try { document.execCommand("insertText", false, text); }
    catch { /* sehr alte Browser: dann eben ohne Einfuegen */ }
  };

  return (
    <div className="blatt">
      {BLATT_FELDER.map((f) => {
        if (f.k === "warum" && !warumAuf) return null;
        const spr = f.sprache ? wert[f.sprache] : null;
        const roh = nurText(wert[f.k] || "");
        return (
          <div key={f.k} className={"blatt-feld" + (aktiv === f.k ? " aktiv" : "") + (f.leise ? " leise" : "")}>
            <div className="blatt-kopf">
              <span className="blatt-titel">{f.titel}</span>
              {f.k === "warum" && (
                <button className="blatt-weg" onClick={() => { onChange({ ...wert, warum: "" }); setWarumAuf(false); }}
                  aria-label={t("ed.weg")}>×</button>
              )}
              {spracheAn && f.sprache && (
                <select className="blatt-lang" value={spr} aria-label={"Sprache der " + f.titel}
                  onChange={(e) => onChange({ ...wert, [f.sprache]: e.target.value })}>
                  {LANGS.map((l) => <option key={l.c} value={l.c}>{l.n}</option>)}
                </select>
              )}
            </div>
            <div ref={(el) => { felder.current[f.k] = el; }} className="blatt-eingabe"
              contentEditable suppressContentEditableWarning data-platz={f.platz}
              onPaste={nurTextEinfuegen}
              onInput={() => melde(f.k)} onBlur={() => melde(f.k)}
              onFocus={() => setAktiv(f.k)} onClick={(e) => e.stopPropagation()} />
            {f.sprache && (tts || onMikro) && (
              <div className="blatt-werkzeuge">
                {tts && (
                  <button className="blatt-wz" onClick={() => tts.speak(roh, spr)}
                    disabled={!tts.supported || !roh.trim()} aria-label={t("ed.vorlesen")}><SpeakerIcon s={16} /></button>
                )}
                {onMikro && (
                  <button className={"blatt-wz" + (mikroFuer === f.k ? " live" : "")}
                    onClick={() => onMikro(f.k, spr)} aria-label={t("ed.sprechen")}><MicIcon /></button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!warumAuf && (
        <button className="blatt-plus" onClick={() => { setWarumAuf(true); setTimeout(() => felder.current.warum && felder.current.warum.focus(), 30); }}>
          {t("ed.plus")} <span className="blatt-plus-sub">{t("ed.plus.sub")}</span>
        </button>
      )}

      <div className="ed-leiste blatt-leiste" onClick={(e) => e.stopPropagation()}>
        <button className="ed-knopf ed-fett" onMouseDown={halteAuswahl} onClick={() => kommando("bold")} aria-label={t("ed.fett")}>F</button>
        <button className="ed-knopf ed-unter" onMouseDown={halteAuswahl} onClick={() => kommando("underline")} aria-label={t("ed.unter")}>U</button>
        <span className="ed-trenn" />
        {SCHRIFTGROESSEN.map((g) => (
          <button key={g.l} className="ed-knopf ed-groesse" onMouseDown={halteAuswahl} aria-label={"Schrift " + g.l}
            onClick={() => kommando("fontSize", g.v === "" ? "3" : g.v === "0.75em" ? "2" : "5")}
            style={{ fontSize: g.v === "0.75em" ? 12 : g.v === "" ? 15 : 19 }}>A</button>
        ))}
        <span className="ed-trenn" />
        {TEXTFARBEN.map((f) => (
          <button key={f.l} className="ed-farbe" onMouseDown={halteAuswahl} aria-label={"Farbe " + f.l}
            style={{ background: f.v }} onClick={() => kommando("foreColor", f.v)} />
        ))}
      </div>
    </div>
  );
}


/* ---------------- Eintritt ----------------
 * Kurzer gruener Vorhang beim Start: die Feder zeichnet sich selbst, dann oeffnet sich die
 * Papierwelt. Bewusst *ehrlich* gebaut — er deckt genau die Zeit ab, in der die Karteien
 * geladen werden, statt kuenstlich zu bremsen. Er endet, sobald beides fertig ist:
 * die kurze Bewegung und das Laden. Ein Tipp ueberspringt ihn sofort.
 * `prefers-reduced-motion` laesst das Zeichnen weg und blendet nur weich auf.
 */
function Eintritt({ onSkip, marke = "Frida" }) {
  return (
    <div className="eintritt" onClick={onSkip} role="presentation">
      <div className="eintritt-octo"><OctoIcon s={96} blick="ruhig" /></div>
      <div className="eintritt-name">{marke}</div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
function SpeakerIcon({ s = 20 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}
