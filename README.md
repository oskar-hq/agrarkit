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

## Bewegung

`assets/js/bewegung.js`, rund 130 Zeilen, keine Abhängigkeiten. Drei Effekte:
Einblenden beim Hereinrollen mit Staffelung, sanfte Parallaxe im Held, und
eine Kopfleiste, die beim Rollen eine Kante bekommt. Dazu klappen die Fragen
weich auf.

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

## Was noch offen ist

- **Das Personenfoto in „Ein Ansprechpartner".** `landwirt.webp` zeigt einen
  erkennbaren Menschen von Pixabay. Die Lizenz erlaubt die kommerzielle
  Nutzung, nimmt aber ausdrücklich aus, dass Abbildungen erkennbarer Personen
  so verwendet werden, dass eine Zustimmung oder Verbindung unterstellt wird —
  und genau das legt die Karte nahe, weil daneben steht, die E-Mail lande
  „direkt bei dem, der die Software baut". Wer das liest, hält den Abgebildeten
  für Oskar Jacobsen. Zwei saubere Wege: ein eigenes Foto an die Stelle setzen
  (für diese Karte ohnehin die bessere Lösung), oder auf ein Bild ohne
  erkennbare Person wechseln.
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

Dann `http://localhost:8000` öffnen. Die Seiten verlinken absolut (`/assets/…`),
ein Aufruf per `file://` funktioniert deshalb nicht.

## Bilder neu erzeugen

Die Bilder unter `assets/img/` sind aus den Originalen abgeleitet (Zuschnitt,
Skalierung, WebP). Die Originale liegen nicht im Repo. Zwei Zuschnitte sind
Absicht und kein Zufall:

- `app/karte.webp` ist rechts bei x = 1573 beschnitten — dort begann im
  Bildschirmfoto ein Band aus nicht geladenen Kartenkacheln.
- `app/schlag.webp` beginnt unterhalb von y = 118, weil darüber im
  Bildschirmfoto ein Stück Vorlagentext sichtbar war (`action="/schlaege/33">`).
  Das ist ein Fehler in der Anwendung, kein Fehler der Aufnahme.
