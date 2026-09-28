/* ===========================================================================
   Agrarkit — Karteikasten im Held und Punkte auf der Karte

   Antippen, Klicken oder Enter blaettert zur naechsten Beispielkarte. Die
   vordere Karte wird abgehoben und hinten eingesteckt; die Lage kommt ganz
   aus dem Stylesheet (`data-pos`), dieses Skript dreht nur die Werte weiter.

   Laeuft auch im ruhigen Modus: Blaettern ist eine Funktion, kein Effekt.
   Dort entfaellt nur das Abheben, die Karten tauschen sofort.
   =========================================================================== */

(() => {
  "use strict";

  const kasten = document.querySelector(".kartei");
  if (!kasten) return;

  const knopf = kasten.querySelector(".kartei-weiter");
  const ansage = kasten.querySelector("[data-kartei-ansage]");
  const blaetter = Array.from(kasten.querySelectorAll(".kartei-blatt"));
  if (!knopf || blaetter.length < 2) return;

  const ruhig = matchMedia("(prefers-reduced-motion: reduce)");
  let beschaeftigt = false;

  // Was ein Vorlesewerkzeug nach dem Blaettern hoert: Reiter, Name, Kultur,
  // Flaeche. Aus der Karte selbst gelesen, damit nichts doppelt gepflegt wird.
  const beschreiben = (blatt) => {
    const t = (sel) => (blatt.querySelector(sel)?.textContent || "").trim();
    const zeilen = Array.from(blatt.querySelectorAll(".kartei-zeilen > div"))
      .map((z) => `${z.querySelector("dt").textContent}: ${z.querySelector("dd").textContent.trim()}`);
    return `${t(".kartei-reiter")}, ${t(".kartei-name")}. ${zeilen.slice(0, 2).join(", ")}.`;
  };

  const umstecken = () => {
    for (const b of blaetter) {
      const pos = (Number(b.dataset.pos) + blaetter.length - 1) % blaetter.length;
      b.dataset.pos = String(pos);
      if (pos === 0) b.removeAttribute("aria-hidden");
      else b.setAttribute("aria-hidden", "true");
    }
    const vorn = blaetter.find((b) => b.dataset.pos === "0");
    if (ansage && vorn) ansage.textContent = beschreiben(vorn);
  };

  const weiter = () => {
    if (beschaeftigt) return;
    const vorn = blaetter.find((b) => b.dataset.pos === "0");
    if (!vorn || ruhig.matches) { umstecken(); return; }

    beschaeftigt = true;
    vorn.classList.add("hebt");
    // Erst abheben, dann hinten einstecken — zwei Schritte, sonst verschwaende
    // die Karte schlagartig hinter den anderen.
    setTimeout(() => {
      vorn.classList.remove("hebt");
      umstecken();
      setTimeout(() => { beschaeftigt = false; }, 380);
    }, 260);
  };

  knopf.addEventListener("click", weiter);
})();

/* Punkte auf der Kartenaufnahme: mit Maus genuegt das Zeigen (CSS). Auf dem
   Handy gibt es kein Zeigen, dort oeffnet Antippen das Kaertchen und ein
   Tippen daneben schliesst es wieder. */
(() => {
  "use strict";
  const ziele = Array.from(document.querySelectorAll(".ziel"));
  if (!ziele.length) return;

  const schliessen = (ausser) => {
    for (const z of ziele) if (z !== ausser) {
      z.classList.remove("offen");
      z.setAttribute("aria-expanded", "false");
    }
  };
  for (const z of ziele) {
    z.setAttribute("aria-expanded", "false");
    z.addEventListener("click", (e) => {
      e.stopPropagation();
      const offen = !z.classList.contains("offen");
      schliessen(z);
      z.classList.toggle("offen", offen);
      z.setAttribute("aria-expanded", String(offen));
    });
  }
  document.addEventListener("click", () => schliessen(null));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") schliessen(null); });
})();

/* Fuer alle, die unter die Haube schauen. */
if (window.console && console.log) {
  console.log(
    "%cMoin!%c\nAgrarkit wird in Pommerby gebaut, von Hand und ohne Rahmenwerk.\nFragen, Ideen, Fehler: info@agrarkit.de",
    "font: italic 22px 'Instrument Serif', Georgia, serif; color: #B98A2E;",
    "font: 12px 'Space Grotesk', system-ui, sans-serif; color: inherit;"
  );
}
