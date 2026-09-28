# agrarkit.de

Website zu Agrarkit — der Ackerschlagkartei unter
[app.agrarkit.de](https://app.agrarkit.de).

Statisches HTML, kein Build-Schritt, keine Abhängigkeiten. Hochladen genügt.

## Aufbau

```
index.html            Startseite
impressum.html        Impressum (§ 5 DDG)
datenschutz.html      Datenschutzerklärung der Website
404.html              Fehlerseite
robots.txt
sitemap.xml
assets/
  css/agrarkit.css    das einzige Stylesheet
  fonts/              Space Grotesk als WOFF2, auf Latin-1 verkleinert
                      Instrument Serif (kursiv) als Akzentschrift, Latin
  img/                Fotos und Bildschirmfotos, WebP in zwei Größen
  img/favicon.svg     Logo aus dem Logo-Material
  img/og.jpg          Vorschaubild 1200 × 630
```

## Gestaltung

Das Stylesheet übernimmt die Tokens aus dem Designsystem der Anwendung
(`_ds_bundle.css`) unverändert: Papiergrund `#FBF7F1`, Tinte und Grün
`#26392F`, die Kulturfarben der Kartenlegende, Radien 8/20/28, dieselben
Schatten, dieselbe Schrift. Wer dort eine Farbe ändert, ändert sie hier im
Block `:root` mit — es gibt bewusst keine zweite Palette.

Ergänzt sind nur die Bausteine, die eine Anwendung nicht braucht: Held,
Abschnittsrhythmus, Bildkarten, Preis, Fragen. Die Anwendung setzt Titel auf
34 px; die Startseite hat eine eigene, größere Skala in gleicher Bauart
(Gewicht 500, eng gesperrt).

Dunkelmodus und `prefers-reduced-motion` sind aus demselben Designsystem
übernommen.

### Slogan und Leitbild

Der Slogan lautet **„Die Ackerschlagkartei von nebenan."** Er steht im Held
als Überschrift, im `<title>`, im Vorschaubild-Titel (`og:title`), als
`slogan` im strukturierten Datensatz und in der Fußzeile.

Drei Dinge geben der Seite ein eigenes Gesicht und gehören zusammen:

- **Der Karteikasten im Held** (`.kartei`). Drei Karten mit blauen Linien,
  roter Kopflinie, Reiter und Stempel „ENDO‑SH geprüft". Namen und Kulturen
  (Mühlenberg, Langfeld, Domstag) stammen aus dem Bildschirmfoto der Karte,
  die Zahlen sind ein Beispiel. Antippen blättert (`assets/js/kartei.js`);
  welche Karte vorn liegt, steht in `data-pos`, die Lage macht das
  Stylesheet. Die Reiterstelle hängt an der Lage, nicht an der Karte, sonst
  überdecken sich die Reiter in manchen Reihenfolgen. Sie bleibt in beiden Farbmodi
  Papier. Unter 1000 px rutscht sie unter den Text und schaut unten aus dem
  ersten Bildschirm heraus.
- **Instrument Serif kursiv** als zweite Stimme, nur für den betonten Teil
  einer Überschrift (`<em class="serif">`), nie für Fließtext oder Zahlen in
  Tabellen. Selbst gehostet wie Space Grotesk (SIL OFL), also keine
  Verbindung zu Google Fonts.
- **Ein einziger dunkler Block** (`.abschnitt-dunkel`, derzeit ENDO‑SH). Er
  stellt die Tokens lokal um, alles darin stimmt ohne eigene Regeln. Nicht
  direkt hinter den Held legen, sonst folgen zwei dunkle Flächen aufeinander.

- **Bühnen für die Bildschirmfotos** (`.buehne`). Jede Aufnahme liegt auf
  einer Fläche in ihrer Kulturfarbe (`--ton`) mit feinen Fahrgassen, in
  einem Fenster mit Adressleiste — die drei Punkte sind Raps, Gerste, Mais.
  Dazu je ein **Notizzettel** in Handschrift, dessen Pfeil sich beim
  Hereinrollen zeichnet. Die Pfeillagen sind je Aufnahme von Hand
  nachgemessen; wer eine Aufnahme austauscht, muss `.notiz-*` nachziehen.
- **Punkte auf der Karte** (`.ziel`) sitzen in Prozent der Aufnahme auf
  echten Schlägen. Mit Maus genügt Zeigen, auf dem Handy öffnet Antippen.

Dazu ein Hauch Papierkorn über der ganzen Seite (`body::after`), nur über die
Deckkraft, ohne Mischmodus.

### Der Held

Randlos über die volle Fensterbreite und -höhe. Drei Dinge hängen daran und
sollten zusammen bleiben:

- Die Kopfleiste klebt, steht dabei aber im normalen Fluss und nimmt Platz
  weg. Ohne `.hat-held .held { margin-top: calc(-1 * var(--kopf)) }` läge der
  Held *unter* ihr statt hinter ihr, und über dem Bild bliebe ein
  cremefarbener Streifen.
- **`--kopf` rechnet den Sicherheitsrand des Geräts mit**
  (`calc(var(--kopf-basis) + env(safe-area-inset-top, 0px))`). Vorher standen
  dort nur 64 px, während die Kopfleiste auf einem iPhone mit Aussparung
  112 px hoch war — die Differenz blieb als cremefarbener Spalt stehen und
  machte die klebende Leiste obendrein zu hoch. Kopfhöhe und Hochzug des Helds
  müssen aus **derselben** Zahl kommen.
- `100svh`, nicht `100vh`: auf dem Handy meint `vh` die Höhe ohne die ein- und
  ausfahrende Browserleiste, der Held wäre beim Laden angeschnitten.
- Die Klasse `hat-held` steht **nur** auf der Startseite. Sie macht die
  Kopfleiste durchsichtig und ihre Schrift hell, solange nicht gerollt wird;
  auf den Rechtsseiten gibt es kein Bild, dort wäre helle Schrift unlesbar.
- **`overflow: hidden` auf `.held-bild` muss bleiben.** Das Bild trägt für die
  Parallaxe ein `scale(1.16)` und ragt damit rund 68 px über seinen Rahmen
  hinaus. Ohne Beschnitt lief es oben über den Beta-Balken und unten als
  heller Grasstreifen in den nächsten Abschnitt.

Achtung beim Prüfen: Wer nur mit `prefers-reduced-motion: reduce`
kontrolliert, sieht solche Fehler **nicht** — dort ist die Skalierung aus.
Der Beschnittfehler oben ist genau so durchgerutscht. Immer auch einmal mit
eingeschalteter Bewegung ansehen.

Der Schleier über dem Foto besteht aus drei Verläufen: einer oben für die
Kopfleiste, einer von links für den Text, einer von unten. Auf schmalen
Fenstern greift ein eigener, weitgehend gleichmäßiger Schleier — dort
schneidet `object-fit: cover` die helle Bildmitte an, und der Text läuft über
die volle Breite, der waagerechte Verlauf hilft also nicht mehr.

## Bewegung

`assets/js/bewegung.js`, keine Abhängigkeiten. Einblenden beim Hereinrollen
mit Staffelung, sanfte Parallaxe im Held, eine Kopfleiste, die beim Rollen
eine Kante bekommt, und die Kartenaufnahme, die schräg liegt und sich beim
Rollen aufrichtet. Dazu klappen die Fragen weich auf.

**Nur mit echter Maus** (`hover: hover` und `pointer: fine`) kommen dazu:
ein warmes Abendlicht, das dem Zeiger über das Heldfoto folgt; die
Karteikarte neigt sich zum Zeiger, mit wanderndem Lichtreflex; die
Bildschirmfotos neigen sich um höchstens 3 Grad; die großen Hauptknöpfe
ziehen sich bis zu 6 px zum Zeiger. Jede Zeigerbewegung wird auf ein Bild
pro Bildschirmaktualisierung gebündelt.

`assets/js/kartei.js` ist keine Bewegung, sondern Funktion (Blättern,
Kartenpunkte antippen) und läuft deshalb auch im ruhigen Modus.

Alles läuft auf `--kurve-sheet` — derselben Kurve, die die Anwendung für ihre
Sheets benutzt. Bewegt werden ausschließlich `opacity` und `transform`, damit
nichts das Layout neu berechnet.

Drei Bedingungen, die beim Ändern nicht fallen dürfen:

- **Ohne JavaScript ist alles sichtbar.** Der Ausgangszustand hängt an
  `html.js`, gesetzt von einem Einzeiler im `<head>` *vor* dem Stylesheet.
  Steht er danach, blitzt der Inhalt kurz auf, bevor die Blende zugeht.
- **`prefers-reduced-motion: reduce` schaltet alles ab**, nicht nur die Dauer.
- **Bricht etwas, wird die Blende weggenommen** — der `catch`-Zweig im Skript
  entfernt `html.js` wieder. Lieber ohne Bewegung als mit unsichtbarem Inhalt.

Die Liste der Elemente steht als `--blende-ziele` im Stylesheet und wird vom
Skript zur Laufzeit ausgelesen, damit Ausgangszustand und Beobachtung nicht
auseinanderlaufen. Direkt darunter steht dieselbe Liste als Regel — beide
zusammen ändern.

Gemessen nach dem Einbau: Layoutsprünge (CLS) 0,0007, Median 16,7 ms je Bild
über die ganze Seite, kein Bild über 33 ms.

## Versionsnummer an CSS und JS

Stylesheet und Skript werden mit `?v=JJJJ-MM-TT` eingebunden, auf **allen
vier Seiten**. GitHub Pages lässt Browser Dateien zwischenspeichern; ohne die
Nummer zeigte Safari nach einem Update das neue HTML mit dem alten CSS. Wer
`agrarkit.css` oder `bewegung.js` ändert, setzt das Datum neu:

```
sed -i 's/?v=[0-9-]*/?v=NEUES-DATUM/g' *.html
```

## Hosting: GitHub Pages

Die Seite liegt auf GitHub Pages. Zwei Dinge sind deshalb Absicht und sollten
so bleiben:

- **Alle Pfade sind relativ** (`assets/…`, nicht `/assets/…`). Ein Projekt-Repo
  wird unter `oskar-hq.github.io/<repo>/` ausgeliefert, nicht im Wurzelpfad —
  mit absoluten Pfaden landet der Browser bei `oskar-hq.github.io/assets/…` und
  bekommt kein CSS. Relative Pfade funktionieren unter beiden Adressen, auch
  später unter `agrarkit.de`.
- **`.nojekyll`** schaltet die Jekyll-Verarbeitung ab. Sie wird hier nicht
  gebraucht und würde nur Bauzeit kosten.

### Eigene Domain einrichten

`canonical`, `og:url` und `sitemap.xml` zeigen bereits auf `agrarkit.de`. Damit
das stimmt, fehlen zwei Schritte:

1. **DNS** beim Anbieter der Domain setzen — vier A-Records für `agrarkit.de`
   auf `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
   `185.199.111.153` (dazu passend AAAA auf `2606:50c0:8000::153` bis
   `…8003::153`). Für `www` ein CNAME auf `oskar-hq.github.io`. Der bestehende
   Eintrag für `app.agrarkit.de` bleibt davon unberührt.
2. **In GitHub** unter *Settings → Pages → Custom domain* `agrarkit.de`
   eintragen und „Enforce HTTPS" anhaken. GitHub legt dabei selbst eine Datei
   `CNAME` im Repo an.

Die Reihenfolge ist wichtig: Wird die Domain in GitHub eingetragen, bevor DNS
steht, leitet `oskar-hq.github.io` auf eine Adresse um, die noch nicht
auflöst — die Seite ist dann vorübergehend über keine der beiden Adressen
erreichbar. Deshalb liegt hier bewusst noch keine `CNAME`-Datei im Repo.

Bis die Domain steht, zeigt das Vorschaubild für geteilte Links
(`og:image`) auf `agrarkit.de` und wird noch nicht angezeigt. Das ist der
einzige Punkt, der unter der `github.io`-Adresse nicht funktioniert.

## Beta ohne Versionsnummer

Auf der Website steht **nur Beta, nie eine Nummer**. Das ist Absicht: eine 1.2
wäre immer noch eine Beta, und die Website deshalb anzufassen wäre Arbeit ohne
Ertrag. Die Versionsnummer steht in der Anwendung, wo sie hingehört.

Beta steht an zwei Stellen, mehr braucht es nicht:

- als **Balken direkt unter der Navigation**, auf jeder Seite. Er ist
  ausdrücklich **nicht** `sticky`: wer die Seite öffnet, sieht ihn zuerst; wer
  weiterliest, hat ihn nicht dauerhaft vor der Nase. Die klebende Kopfleiste
  bleibt, der Balken verschwindet unter ihr.
- als Marke in der Fußzeile jeder Seite.

Auf der Startseite liegt der Balken **im Held** (`position: absolute; top:
var(--kopf)`) und damit auf dem Bild; auf den übrigen Seiten steht er im
normalen Fluss hinter der Kopfleiste. Beides ergibt dieselbe Bewegung.

Der kürzere Satz auf schmalen Fenstern bleibt — nicht mehr aus Rechengründen,
sondern damit der Balken dort einzeilig bleibt und nicht ein Drittel des
ersten Bildschirms frisst.

Die Farbe ist der Ockerton der Wintergerste aus der Kartenlegende —
**bewusst nicht Rot**: Rot ist in der Anwendung für Storno, Löschen und
Überschreitung belegt, und Beta ist keine Warnung, sondern ein Zustand. Grün
ginge auch nicht, das ist die Primäraktion. Der reine Gerstenton trägt auf dem
Papiergrund nur 2,9:1 und ist als Text unbrauchbar; `--beta` ist deshalb
derselbe Farbton vertieft und kommt auf 6,0:1 (5,0:1 auf der getönten Fläche
der Marke).

## Was noch offen ist

- **Data Privacy Framework.** Die Datenschutzerklärung stützt die Übermittlung
  an GitHub in die USA auf die DPF-Zertifizierung von GitHub, Inc. Die muss
  jährlich erneuert werden — einmal im Jahr auf
  [dataprivacyframework.gov/list](https://www.dataprivacyframework.gov/list)
  nachsehen.
- **Umsatzsteuer.** Im Impressum fehlt der Abschnitt bewusst, solange Agrarkit
  unentgeltlich ist. Sobald Geld fließt, gehört dort eine USt-IdNr. oder der
  Satz zur Kleinunternehmerregelung hin (Kommentar steht an der Stelle).
- **Preis.** In der Beta unentgeltlich, ein Preis für danach steht noch nicht
  fest. Wenn er feststeht: `<section id="preis">` in `index.html` und die Frage
  „Was heißt ‚Beta' in der Praxis?".

## Örtlich ansehen

```
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen. Seit die Pfade relativ sind, lässt sich
`index.html` zur Not auch direkt per `file://` öffnen.

## Fotos

Auf der Seite sind fünf Fotos. Drei davon von Pexels, zwei von Pixabay
(Seitenkopf und unterer Aufrufbereich). Beide Lizenzen erlauben die
kommerzielle Nutzung ohne Namensnennung; die Nennung im Impressum ist
freiwillig.

| Datei | Wo | Quelle |
| --- | --- | --- |
| `hero-pflug.webp` | Seitenkopf | Pixabay |
| `praxis-aehren.webp` | Karte „Aus der Praxis" | Pexels — Pawel Hordjewicz |
| `sh-wind.webp` | Karte „Für Schleswig-Holstein" | Pexels — Wolfgang Weiser |
| `hof.webp` | Karte „Ein Ansprechpartner" | Pexels — shsh |
| `feld-wolken.webp` | Aufrufbereich unten | Pixabay |

**Kein Foto zeigt eine erkennbare Person.** Das ist Absicht: die
Stocklizenzen nehmen ausdrücklich aus, dass Abbildungen erkennbarer Personen
so verwendet werden, dass eine Zustimmung oder Verbindung unterstellt wird.
Ausgerechnet die Karte „Ein Ansprechpartner" hätte das getan — daneben steht,
die E-Mail lande „direkt bei dem, der die Software baut". Dort steht jetzt ein
Hof statt eines Menschen. Wenn ein eigenes Porträt dazukommt, ist das die
bessere Lösung und rechtlich unproblematisch.

Von den zehn hochgeladenen Pexels-Aufnahmen sind drei im Einsatz. Die übrigen
sechs — Schwader mit Kühen, Strohballen, Maisfeld hochkant, Feld mit
Baumreihe, zweites Maishäckseln, Luftbild Rapsfelder — liegen nicht mehr im
Arbeitsverzeichnis, sind aber im Commit `ca33ade` erhalten und lassen sich
jederzeit zurückholen:

```
git show ca33ade:assets/img/<dateiname>.jpg > <dateiname>.jpg
```

## Bilder neu erzeugen

Die Bilder unter `assets/img/` sind aus den Originalen abgeleitet (Zuschnitt,
Skalierung, WebP). Die Originale liegen nicht im Repo. Zwei Zuschnitte sind
Absicht und kein Zufall:

- `app/karte.webp` ist rechts bei x = 1573 beschnitten — dort begann im
  Bildschirmfoto ein Band aus nicht geladenen Kartenkacheln.
- `app/schlag.webp` beginnt unterhalb von y = 118, weil darüber im
  Bildschirmfoto ein Stück Vorlagentext sichtbar war (`action="/schlaege/33">`).
  Das ist ein Fehler in der Anwendung, kein Fehler der Aufnahme.
