/* ===========================================================================
   Agrarkit — Bewegung

   1. Einblenden beim Hereinrollen, gestaffelt innerhalb einer Gruppe.
   2. Sanfte Parallaxe im Held.
   3. Die Kopfleiste bekommt eine Kante, sobald die Seite nicht mehr oben steht.
   4. Die Kartenaufnahme liegt schraeg und richtet sich beim Rollen auf.
   5. Nur mit Maus: Abendlicht im Held, Karteikarte und Aufnahmen neigen
      sich zum Zeiger, Hauptknoepfe ziehen sich ein Stueck zu ihm hin.

   Bewegt werden nur `transform`, `opacity` und CSS-Variablen, die in
   genau diese beiden muenden. Jede Zeigerbewegung wird auf ein Bild pro
   Bildschirmaktualisierung gebuendelt.

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

    /* --- Kartenaufnahme richtet sich auf --------------------------------
       Liegt anfangs wie ein Blatt auf dem Tisch (14 Grad gekippt) und steht
       gerade, sobald ihre Mitte das obere Fensterdrittel erreicht. */
    const kippKarte = document.querySelector(".buehne-karte .buehne-kipp");
    const kipp = new Map();   // Element -> { rx, ry, kx }
    const setzeKipp = (el) => {
      const z = kipp.get(el) || { rx: 0, ry: 0, kx: 0 };
      const skala = 1 - z.kx * 0.05;
      el.style.transform =
        `rotateX(${(z.kx * 14 + z.rx).toFixed(2)}deg) rotateY(${z.ry.toFixed(2)}deg) scale(${skala.toFixed(3)})`;
    };
    if (kippKarte) {
      kipp.set(kippKarte, { rx: 0, ry: 0, kx: 1 });
      let angemeldet = false;
      const rechnen = () => {
        angemeldet = false;
        const r = kippKarte.getBoundingClientRect();
        const mitte = r.top + r.height / 2;
        // 1 wenn die Mitte am unteren Fensterrand steht, 0 ab 55 % Hoehe.
        const t = Math.min(1, Math.max(0, (mitte - innerHeight * 0.55) / (innerHeight * 0.45)));
        kipp.get(kippKarte).kx = t;
        setzeKipp(kippKarte);
      };
      const anfordern = () => { if (!angemeldet) { angemeldet = true; requestAnimationFrame(rechnen); } };
      addEventListener("scroll", anfordern, { passive: true });
      addEventListener("resize", anfordern, { passive: true });
      rechnen();
    }

    /* --- Alles Weitere nur mit einer echten Maus -------------------------
       Auf dem Handy gibt es keinen Zeiger, dem etwas folgen koennte, und ein
       Finger, der eine Karte kippt, waere nur im Weg. */
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const begrenzen = (w, g) => Math.max(-g, Math.min(g, w));

    // Abendlicht und Karteikarte haengen am selben Zeiger im Held.
    const held = document.querySelector(".held-bild");
    const stapel = document.querySelector(".kartei-stapel");
    if (held) {
      let letztes = null, angemeldet = false;
      const zeichnen = () => {
        angemeldet = false;
        if (!letztes) return;
        const h = held.getBoundingClientRect();
        held.style.setProperty("--mx", `${letztes.clientX - h.left}px`);
        held.style.setProperty("--my", `${letztes.clientY - h.top}px`);
        if (stapel && stapel.offsetParent) {
          const k = stapel.getBoundingClientRect();
          const dx = (letztes.clientX - (k.left + k.width / 2)) / (k.width / 2);
          const dy = (letztes.clientY - (k.top + k.height / 2)) / (k.height / 2);
          // Naeher an der Karte kippt sie staerker; von weit weg nur ein Hauch.
          const naehe = Math.max(0.25, 1 - Math.hypot(dx, dy) / 5);
          stapel.style.setProperty("--ry", `${(begrenzen(dx, 1.4) * 9 * naehe).toFixed(2)}deg`);
          stapel.style.setProperty("--rx", `${(-begrenzen(dy, 1.4) * 7 * naehe).toFixed(2)}deg`);
          stapel.style.setProperty("--gx", `${(50 + begrenzen(dx, 1.2) * 45).toFixed(1)}%`);
          stapel.style.setProperty("--gy", `${(50 + begrenzen(dy, 1.2) * 45).toFixed(1)}%`);
          stapel.style.setProperty("--glanz", (0.18 + naehe * 0.5).toFixed(2));
        }
      };
      held.addEventListener("pointermove", (e) => {
        letztes = e;
        held.classList.add("hat-zeiger");
        stapel?.classList.add("folgt");
        if (!angemeldet) { angemeldet = true; requestAnimationFrame(zeichnen); }
      }, { passive: true });
      held.addEventListener("pointerleave", () => {
        letztes = null;
        held.classList.remove("hat-zeiger");
        if (stapel) {
          stapel.classList.remove("folgt");
          for (const v of ["--rx", "--ry", "--glanz"]) stapel.style.removeProperty(v);
        }
      });
    }

    // Aufnahmen neigen sich leicht zum Zeiger — hoechstens 3 Grad, damit
    // man die Tabelle noch lesen kann.
    for (const buehne of document.querySelectorAll(".buehne")) {
      const el = buehne.querySelector(".buehne-kipp");
      if (!el) continue;
      if (!kipp.has(el)) kipp.set(el, { rx: 0, ry: 0, kx: 0 });
      let letztes = null, angemeldet = false;
      const zeichnen = () => {
        angemeldet = false;
        if (!letztes) return;
        const r = buehne.getBoundingClientRect();
        const z = kipp.get(el);
        z.ry = begrenzen((letztes.clientX - r.left) / r.width - 0.5, 0.5) * 6;
        z.rx = -begrenzen((letztes.clientY - r.top) / r.height - 0.5, 0.5) * 4;
        setzeKipp(el);
      };
      buehne.addEventListener("pointermove", (e) => {
        letztes = e; el.classList.add("folgt");
        if (!angemeldet) { angemeldet = true; requestAnimationFrame(zeichnen); }
      }, { passive: true });
      buehne.addEventListener("pointerleave", () => {
        letztes = null; el.classList.remove("folgt");
        const z = kipp.get(el); z.rx = 0; z.ry = 0; setzeKipp(el);
      });
    }

    // Magnetknoepfe: die grossen Hauptknoepfe ziehen sich bis zu 6 px zum
    // Zeiger. Nur diese — jeder Knopf, der wandert, waere Unruhe.
    for (const k of document.querySelectorAll(".knopf-primaer.knopf-gross")) {
      k.classList.add("magnet");
      k.addEventListener("pointermove", (e) => {
        const r = k.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        k.classList.add("folgt");
        k.style.transform = `translate(${(x * 6).toFixed(1)}px, ${(y * 4).toFixed(1)}px)`;
      }, { passive: true });
      k.addEventListener("pointerleave", () => {
        k.classList.remove("folgt");
        k.style.removeProperty("transform");
      });
    }
  } catch (fehler) {
    // Lieber ohne Bewegung als mit unsichtbarem Inhalt.
    wurzel.classList.remove("js");
    if (window.console) console.warn("Bewegung abgeschaltet:", fehler.message);
  }
})();
