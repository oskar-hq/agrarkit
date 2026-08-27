/* ===========================================================================
   Agrarkit — Bewegung

   Drei Dinge, mehr nicht:
   1. Einblenden beim Hereinrollen, gestaffelt innerhalb einer Gruppe.
   2. Sanfte Parallaxe im Held.
   3. Die Kopfleiste bekommt eine Kante, sobald die Seite nicht mehr oben steht.

   Die Klasse `js` setzt das Vorspann-Skript im <head> — nicht diese Datei.
   Sonst blitzt der Inhalt kurz auf, bevor die Blende zugeht.

   Keine Abhaengigkeiten, kein Bauschritt. Faellt etwas aus, bleibt die Seite
   vollstaendig benutzbar: der `catch`-Zweig unten nimmt die Blende weg.
   =========================================================================== */

(() => {
  "use strict";

  const wurzel = document.documentElement;
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)");

  /* --- Kopfleiste -------------------------------------------------------
     Laeuft auch im ruhigen Modus: eine Kante, die erscheint, ist kein
     Bewegungseffekt, sondern eine Zustandsanzeige. */
  const kopf = document.querySelector(".kopf");
  if (kopf) {
    let angemeldet = false;
    const pruefen = () => {
      kopf.classList.toggle("ist-gerollt", window.scrollY > 8);
      angemeldet = false;
    };
    addEventListener("scroll", () => {
      if (!angemeldet) { angemeldet = true; requestAnimationFrame(pruefen); }
    }, { passive: true });
    pruefen();
  }

  /* Alles Weitere ist Bewegung und entfaellt, wenn sie unerwuenscht ist.
     Das Aufraeumen uebernimmt dabei das Stylesheet, nicht dieses Skript. */
  if (ruhig.matches) return;

  /* --- Einblenden beim Hereinrollen ------------------------------------- */
  try {
    if (!("IntersectionObserver" in window)) throw new Error("kein IntersectionObserver");

    // Die Liste steht im Stylesheet, damit Ausgangszustand und Beobachtung
    // nicht auseinanderlaufen koennen.
    const liste = getComputedStyle(wurzel).getPropertyValue("--blende-ziele").trim();
    if (!liste) throw new Error("--blende-ziele ist leer");

    const ziele = Array.from(document.querySelectorAll(liste));

    // Staffelung: Geschwister derselben Gruppe kommen nacheinander, aber die
    // Kette wird gedeckelt. Ohne Deckel warten die letzten Karten einer
    // Sechsergruppe so lange, dass es wie ein Fehler aussieht.
    const zaehler = new Map();
    for (const el of ziele) {
      const gruppe = el.parentElement;
      const n = zaehler.get(gruppe) || 0;
      zaehler.set(gruppe, n + 1);
      el.style.setProperty("--verzug", Math.min(n, 4) * 70 + "ms");
      el.classList.add("ist-blende");
    }

    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("ist-da");
        beobachter.unobserve(e.target);           // einmal reicht
        // Nach dem Uebergang die Verzoegerung wegnehmen, sonst haengt sie
        // spaeter an jedem anderen Uebergang desselben Elements.
        e.target.addEventListener("transitionend", () => {
          e.target.style.removeProperty("--verzug");
        }, { once: true });
      }
    }, {
      // Erst ausloesen, wenn das Element ein Stueck weit im Bild ist —
      // sonst ist die Blende schon durch, bevor man hinsieht.
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.01,
    });

    for (const el of ziele) beobachter.observe(el);

    /* --- Parallaxe im Held ---------------------------------------------
       Das Bild laeuft langsamer als die Seite. Der Faktor ist klein
       gewaehlt: bei 0,06 bleibt die groesste Verschiebung innerhalb des
       Vorrats, den scale(1.16) schafft — darueber zeigte sich am oberen
       oder unteren Rand ein Streifen Grund. */
    const bild = document.querySelector(".held-bild > img");
    const rahmen = document.querySelector(".held-bild");
    if (bild && rahmen) {
      const FAKTOR = 0.06;
      let sichtbar = false, angemeldet = false;

      const zeichnen = () => {
        angemeldet = false;
        if (!sichtbar) return;
        const k = rahmen.getBoundingClientRect();
        const versatz = (innerHeight / 2 - (k.top + k.height / 2)) * FAKTOR;
        bild.style.transform = `translate3d(0, ${versatz.toFixed(2)}px, 0) scale(1.16)`;
      };
      const anfordern = () => {
        if (!angemeldet) { angemeldet = true; requestAnimationFrame(zeichnen); }
      };

      new IntersectionObserver(([e]) => {
        sichtbar = e.isIntersecting;
        // Ausserhalb des Bildes nichts mehr rechnen — und dem Browser sagen,
        // dass er die Ebene wieder einsammeln darf.
        bild.style.willChange = sichtbar ? "transform" : "auto";
        if (sichtbar) anfordern();
      }).observe(rahmen);

      addEventListener("scroll", anfordern, { passive: true });
      addEventListener("resize", anfordern, { passive: true });
      anfordern();
    }
  } catch (fehler) {
    // Lieber ohne Bewegung als mit unsichtbarem Inhalt.
    wurzel.classList.remove("js");
    if (window.console) console.warn("Bewegung abgeschaltet:", fehler.message);
  }
})();
