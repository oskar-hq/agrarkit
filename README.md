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

## Was noch offen ist

Vor dem Livegang zu klären — im Quelltext jeweils als `.offen`-Kasten oder
als HTML-Kommentar markiert, damit nichts davon versehentlich online geht:

- **Preis.** Der Abschnitt „Preis" nimmt an, dass Agrarkit in der Beta nichts
  kostet. Das ist nicht abgestimmt. Siehe Kommentar über `<section id="preis">`
  in `index.html` und die Frage „Was heißt Beta in der Praxis?".
- **Impressum.** Telefonnummer (oder bewusster Verzicht), Umsatzsteuerangabe,
  Bildnachweise der Stockfotos.
- **Datenschutz.** Hoster, Serverstandort, Speicherdauer der Logfiles,
  Auftragsverarbeitungsvertrag.

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
