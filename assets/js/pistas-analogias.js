/*--------------------------------------------------------------
# Pistas y analogías — lógica del recurso
# Condicionamiento (según guion):
#  - "Verificar respuesta" permanece bloqueado hasta que se elige una opción.
#  - Si la respuesta es incorrecta, la pregunta se reactiva (se limpia la
#    selección) hasta que se elija la correcta.
#  - No se puede pasar al siguiente acertijo sin respuesta correcta verificada
#    y sin diligenciar el campo de analogía: se muestra un error.
--------------------------------------------------------------*/
(function () {
  "use strict";

  var MIN_ANALOGY = 15; // caracteres mínimos para aceptar la analogía
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Utilidades ---------- */
  function goToTab(id) {
    revealNav(id);
    var link = document.querySelector('.tab-link[data-tab="' + id + '"]');
    if (link) link.click();
    syncIntroMode();
  }

  /* Menú progresivo: cada pestaña aparece cuando el recorrido llega a ella */
  function revealNav(id) {
    var li = document.querySelector('[data-pa-nav="' + id + '"]');
    if (!li || !li.classList.contains("pa-nav-hidden")) return;
    li.classList.remove("pa-nav-hidden");
    li.classList.add("pa-nav-in");
  }

  function hideNav(id) {
    var li = document.querySelector('[data-pa-nav="' + id + '"]');
    if (li) li.classList.add("pa-nav-hidden");
  }

  /* Al empezar, la portada se retira para dar todo el espacio al recurso */
  function startResource(done) {
    var hero = document.getElementById("seccion1");
    if (document.body.classList.contains("pa-started") || !hero) {
      if (done) done();
      return;
    }
    stopNeural();
    var finish = function () {
      document.body.classList.add("pa-started");
      hero.classList.remove("is-leaving");
      window.scrollTo(0, 0);
      updateHeaderHeight();
      if (done) done();
    };
    if (reduceMotion || window.scrollY > hero.offsetHeight) { finish(); return; }
    hero.classList.add("is-leaving");
    setTimeout(finish, 430);
  }

  function updateHeaderHeight() {
    var header = document.getElementById("header");
    if (header) document.documentElement.style.setProperty("--pa-header-h", header.offsetHeight + "px");
  }

  /* La pestaña de acertijos entra en modo inmersivo en las pantallas de apertura */
  function syncIntroMode() {
    var sec = document.getElementById("seccion3");
    var active = document.querySelector("#paStage .pa-screen.is-active");
    sec.classList.toggle("is-intro", !!active && active.classList.contains("pa-intro"));
  }

  /* Chispas que flotan sobre las imágenes */
  function seedSparks() {
    document.querySelectorAll(".pa-sparks").forEach(function (box) {
      var inIntro = !!box.closest(".pa-intro");
      var count = inIntro ? 16 : 9;
      for (var i = 0; i < count; i++) {
        var sp = document.createElement("span");
        sp.className = "pa-spark";
        var left = inIntro ? 45 + Math.random() * 52 : 5 + Math.random() * 90;
        sp.style.left = left + "%";
        sp.style.top = (8 + Math.random() * 84) + "%";
        sp.style.setProperty("--x", (Math.random() * 80 - 40).toFixed(0) + "px");
        sp.style.setProperty("--y", (Math.random() * -70 - 10).toFixed(0) + "px");
        sp.style.setProperty("--d", (3.5 + Math.random() * 3.5).toFixed(2) + "s");
        sp.style.setProperty("--delay", (Math.random() * 5).toFixed(2) + "s");
        box.appendChild(sp);
      }
    });
  }

  function scrollToEl(el) {
    var header = document.getElementById("header");
    var offset = header ? header.offsetHeight + 20 : 120;
    var top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
  }

  var stopNeural = function () {};

  /* ---------- Red neuronal animada de la portada ---------- */
  function initNeural() {
    var canvas = document.getElementById("paNeural");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var nodes = [];
    var pulses = [];
    var w, h, dpr;
    var LINK = 130;
    var running = false;
    var visible = true;
    var stopped = false;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(48, (w * h) / 20000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 0.8
        });
      }
    }

    function spawnPulse() {
      var a = nodes[Math.floor(Math.random() * nodes.length)];
      var best = null, bd = Infinity;
      nodes.forEach(function (b) {
        if (b === a) return;
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK && d < bd) { bd = d; best = b; }
      });
      if (best) pulses.push({ a: a, b: best, t: 0 });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (!reduceMotion) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        }
        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < LINK) {
            ctx.strokeStyle = "rgba(150,175,255," + (0.22 * (1 - d / LINK)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(200,215,255,.7)";
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      // impulsos nerviosos (chispas naranjas)
      for (var k = pulses.length - 1; k >= 0; k--) {
        var p = pulses[k];
        p.t += 0.018;
        if (p.t >= 1) { pulses.splice(k, 1); continue; }
        var x = p.a.x + (p.b.x - p.a.x) * p.t;
        var y = p.a.y + (p.b.y - p.a.y) * p.t;
        var g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, "rgba(255,180,130,1)");
        g.addColorStop(1, "rgba(255,154,98,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduceMotion) {
        if (Math.random() < 0.05 && pulses.length < 10) spawnPulse();
        if (visible && !stopped && !document.hidden) {
          requestAnimationFrame(draw);
        } else {
          running = false;
        }
      }
    }

    function start() {
      if (running || stopped || reduceMotion) return;
      running = true;
      requestAnimationFrame(draw);
    }

    resize();
    if (reduceMotion) draw(); else start();

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
      }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });
    stopNeural = function () { stopped = true; };
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () { resize(); if (reduceMotion) draw(); }, 150);
    });
  }

  /* ---------- Chispas al acertar ---------- */
  function burst(target) {
    if (reduceMotion) return;
    var count = 14;
    for (var i = 0; i < count; i++) {
      var s = document.createElement("span");
      s.className = "pa-burst";
      var ang = (Math.PI * 2 * i) / count;
      var dist = 50 + Math.random() * 40;
      s.style.left = "30px";
      s.style.top = "50%";
      s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      s.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      target.appendChild(s);
      setTimeout(function (el) { el.remove(); }, 850, s);
    }
  }

  /* ---------- Recorrido de acertijos ---------- */
  var screens = [];
  var current = 0;
  var results = {}; // { riddleNumber: { title, concept, analogy } }

  function showScreen(index) {
    screens.forEach(function (s) { s.classList.remove("is-active"); });
    current = index;
    var sc = screens[index];
    sc.classList.add("is-active");
    updateTrack();
    syncIntroMode();
    window.scrollTo({ top: 0, behavior: "auto" });
    var focusable = sc.querySelector("[data-pa-next], .pa-riddle-head h2");
    if (focusable) {
      if (!focusable.hasAttribute("tabindex") && focusable.tagName === "H2") focusable.setAttribute("tabindex", "-1");
      setTimeout(function () { focusable.focus({ preventScroll: true }); }, 350);
    }
  }

  function updateTrack() {
    var done = Object.keys(results).length;
    var track = document.getElementById("paTrack");
    track.style.setProperty("--pa-progress", Math.min(done, 2) / 2);
    track.querySelectorAll(".pa-track-step").forEach(function (step) {
      var n = parseInt(step.getAttribute("data-track"), 10);
      var dot = step.querySelector(".pa-track-dot");
      step.classList.remove("is-current", "is-done");
      if (results[n]) {
        step.classList.add("is-done");
        dot.innerHTML = '<i class="bi bi-check-lg"></i>';
      } else if (n === done + 1) {
        step.classList.add("is-current");
        dot.innerHTML = '<i class="bi bi-' + n + '-circle"></i>';
      } else {
        dot.innerHTML = '<i class="bi bi-lock-fill"></i>';
      }
    });
  }

  function setupRiddle(sc) {
    var correct = sc.getAttribute("data-correct");
    var question = sc.querySelector(".pa-question");
    var radios = sc.querySelectorAll('input[type="radio"]');
    var verify = sc.querySelector(".pa-verify");
    var hint = sc.querySelector(".pa-verify-hint");
    var feedback = sc.querySelector(".pa-feedback");
    var editor = sc.querySelector(".pa-rte-area");
    var box = sc.querySelector(".pa-analogy-box");
    var counter = sc.querySelector(".pa-analogy-count");
    var error = sc.querySelector(".pa-error");
    var cont = sc.querySelector(".pa-continue");

    function src(value) {
      return sc.querySelector('.pa-feedback-src[data-for="' + value + '"]');
    }

    function lockVerify(locked) {
      verify.disabled = locked;
      verify.innerHTML = (locked ? '<i class="bi bi-lock-fill"></i>' : '<i class="bi bi-unlock-fill"></i>') + " Verificar respuesta";
      hint.style.display = locked ? "" : "none";
    }

    radios.forEach(function (r) {
      r.addEventListener("change", function () {
        if (question.classList.contains("is-solved")) return;
        sc.querySelectorAll(".pa-option").forEach(function (o) { o.classList.remove("is-wrong"); });
        lockVerify(false);
      });
    });

    verify.addEventListener("click", function () {
      var chosen = sc.querySelector('input[type="radio"]:checked');
      if (!chosen) return;
      var option = chosen.closest(".pa-option");
      var source = src(chosen.value);

      if (chosen.value === correct) {
        question.classList.add("is-solved");
        option.classList.add("is-correct");
        radios.forEach(function (r) { r.disabled = true; });
        verify.disabled = true;
        verify.classList.add("is-done");
        verify.innerHTML = '<i class="bi bi-patch-check-fill"></i> Respuesta verificada';
        var tag = source.getAttribute("data-tag");
        feedback.className = "pa-feedback pa-feedback--ok is-visible";
        feedback.innerHTML = '<i class="bi bi-patch-check-fill" aria-hidden="true"></i><div>' +
          (tag ? '<span class="pa-feedback-tag">' + tag + "</span>" : "") +
          "<p>" + source.innerHTML + "</p></div>";
        burst(option);
        sc.setAttribute("data-concept", option.textContent.trim());
        hideError();
      } else {
        option.classList.add("is-wrong");
        feedback.className = "pa-feedback pa-feedback--err is-visible";
        feedback.innerHTML = '<i class="bi bi-x-octagon-fill" aria-hidden="true"></i><div><p>' + source.innerHTML + "</p></div>";
        // Reactivar la pregunta: se limpia la selección y se bloquea de nuevo la verificación
        setTimeout(function () {
          chosen.checked = false;
          lockVerify(true);
        }, 450);
      }
    });

    window.PAEditor.init(editor, function () {
      counter.textContent = editor.textContent.length + "/" + window.PAEditor.MAX;
      if (editor.textContent.trim().length >= MIN_ANALOGY) box.classList.remove("is-invalid");
    });

    function hideError() {
      error.classList.remove("is-visible");
      error.innerHTML = "";
    }

    cont.addEventListener("click", function () {
      var problems = [];
      var solved = question.classList.contains("is-solved");
      var text = editor.textContent.trim();
      if (!solved) problems.push("Selecciona y verifica la respuesta correcta del acertijo.");
      if (text.length === 0) problems.push("Declara tu analogía completando la frase \"Esto es como cuando…\"");
      else if (text.length < MIN_ANALOGY) problems.push("Desarrolla un poco más tu analogía (mínimo " + MIN_ANALOGY + " caracteres).");

      if (problems.length) {
        error.innerHTML = '<strong><i class="bi bi-exclamation-triangle-fill"></i> Aún no puedes continuar</strong><ul>' +
          problems.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>";
        error.classList.remove("is-visible");
        void error.offsetWidth; // reinicia la animación
        error.classList.add("is-visible");
        if (text.length < MIN_ANALOGY) box.classList.add("is-invalid");
        setTimeout(function () { box.classList.remove("is-invalid"); }, 500);
        if (!solved) question.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        else editor.focus();
        return;
      }

      hideError();
      var n = parseInt(sc.getAttribute("data-riddle"), 10);
      results[n] = {
        title: sc.getAttribute("data-title"),
        concept: sc.getAttribute("data-concept"),
        clue: sc.querySelector(".pa-clue p").textContent.trim(),
        analogy: window.PAEditor.toModel(editor)
      };

      if (cont.hasAttribute("data-last")) {
        updateTrack();
        completeAll();
      } else {
        showScreen(current + 1);
      }
    });
  }

  /* ---------- Resumen final ---------- */
  function completeAll() {
    var list = document.getElementById("paBridges");
    list.innerHTML = "";
    Object.keys(results).sort().forEach(function (key) {
      var r = results[key];
      var li = document.createElement("li");
      li.className = "pa-bridge";

      var node = document.createElement("span");
      node.className = "pa-bridge-node";
      node.textContent = key;

      var card = document.createElement("div");
      card.className = "pa-bridge-card";
      var h = document.createElement("h3");
      h.textContent = "Acertijo " + key + ": " + r.title;
      var concept = document.createElement("span");
      concept.className = "pa-bridge-concept";
      concept.innerHTML = '<i class="bi bi-check-circle-fill"></i> ';
      concept.appendChild(document.createTextNode(r.concept));
      var q = document.createElement("div");
      q.className = "pa-bridge-quote";
      q.innerHTML = window.PAEditor.toHtml(r.analogy, "<em>Esto es como cuando </em>");

      card.appendChild(h);
      card.appendChild(concept);
      card.appendChild(q);
      li.appendChild(node);
      li.appendChild(card);
      list.appendChild(li);
    });

    document.getElementById("seccion4").classList.add("is-complete");
    goToTab("seccion4");
  }

  function restart() {
    results = {};
    screens.forEach(function (sc) {
      if (!sc.classList.contains("pa-riddle")) return;
      var q = sc.querySelector(".pa-question");
      q.classList.remove("is-solved");
      sc.removeAttribute("data-concept");
      sc.querySelectorAll('input[type="radio"]').forEach(function (r) { r.checked = false; r.disabled = false; });
      sc.querySelectorAll(".pa-option").forEach(function (o) { o.classList.remove("is-correct", "is-wrong"); });
      var v = sc.querySelector(".pa-verify");
      v.disabled = true;
      v.classList.remove("is-done");
      v.innerHTML = '<i class="bi bi-lock-fill"></i> Verificar respuesta';
      sc.querySelector(".pa-verify-hint").style.display = "";
      sc.querySelector(".pa-feedback").className = "pa-feedback";
      sc.querySelector(".pa-feedback").innerHTML = "";
      window.PAEditor.reset(sc.querySelector(".pa-rte-area"));
      sc.querySelector(".pa-analogy-count").textContent = "0/500";
      var e = sc.querySelector(".pa-error");
      e.classList.remove("is-visible");
      e.innerHTML = "";
    });
    document.getElementById("seccion4").classList.remove("is-complete");
    hideNav("seccion4");
    goToTab("seccion3");
    showScreen(0);
  }

  /* ---------- PDF con la plantilla "Aprender a aprender" ---------- */
  function todayText() {
    var d = new Date();
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
  }

  function sortedResults() {
    return Object.keys(results).sort().map(function (k) {
      var r = results[k];
      r.n = k;
      return r;
    });
  }

  // PDF con la plantilla: encabezado y pie en cada página, separador entre analogías
  function pdfText(t) {
    // Las fuentes estándar del PDF solo cubren Latin-1
    return String(t)
      .replace(/[\u201C\u201D\u00AB\u00BB]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\u2026/g, "...")
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/[^\x00-\xFF]/g, "");
  }

  function downloadPdf() {
    var note = document.getElementById("paDownloadNote");
    var tpl = window.PA_PLANTILLA_PDF;
    if (!window.jspdf || !tpl) {
      note.textContent = "No se pudo generar el PDF. Revisa tu conexión a internet e inténtalo de nuevo.";
      return;
    }
    note.textContent = "Generando tu documento…";

    var NAVY = [0, 0, 135], PURPLE = [130, 36, 211], TEXT = [27, 27, 27], GREY = [68, 68, 68], LINE = [213, 221, 251];
    var doc = new window.jspdf.jsPDF({ unit: "pt", format: "letter" });
    var W = doc.internal.pageSize.getWidth();
    var H = doc.internal.pageSize.getHeight();
    var M = 85; // 3 cm, igual que la plantilla Word
    var headH = W * tpl.header.h / tpl.header.w;
    var footH = W * tpl.footer.h / tpl.footer.w;
    var top = headH + 34;
    var bottom = H - footH - 30;
    var y;

    function decorate() {
      doc.addImage(tpl.header.data, "JPEG", 0, 0, W, headH, "pa-head");
      doc.addImage(tpl.footer.data, "JPEG", 0, H - footH, W, footH, "pa-foot");
      y = top;
    }

    function ensure(h) {
      if (y + h > bottom) { doc.addPage(); decorate(); }
    }

    function font(o) {
      doc.setFont("helvetica", (o.b && o.i) ? "bolditalic" : o.b ? "bold" : o.i ? "italic" : "normal");
      doc.setFontSize(o.size || 11.5);
      doc.setTextColor.apply(doc, o.color || TEXT);
    }

    // Párrafo con tramos de distinto estilo que se ajustan al ancho.
    // Cada tramo puede llevar negrilla (b), cursiva (i), subrayado (u), color,
    // resaltado (bg) y enlace (href). opts: { align, indent, marker }.
    function rich(parts, size, after, opts) {
      size = size || 11.5;
      opts = opts || {};
      var lh = size * 1.45;
      var indent = opts.indent || 0;
      var maxW = W - M * 2 - indent;
      var lines = [[]], lineW = 0;
      parts.forEach(function (part) {
        part.size = size;
        font(part);
        // Cada salto de línea escrito por la persona abre una línea nueva
        pdfText(part.text).split(/\r?\n/).forEach(function (row, r) {
          if (r > 0) {
            trimEnd(lines[lines.length - 1]);
            lines.push([]);
            lineW = 0;
          }
          row.split(/([ \t]+)/).forEach(addWord);
        });

        function addWord(word) {
          if (!word) return;
          var ww = doc.getTextWidth(word);
          if (/^\s+$/.test(word)) {
            if (lineW === 0) return;
            ww = doc.getTextWidth(" ");
            word = " ";
          } else if (lineW + ww > maxW && lineW > 0) {
            lineW -= trimEnd(lines[lines.length - 1]);
            lines.push([]);
            lineW = 0;
          }
          lines[lines.length - 1].push({ t: word, w: ww, o: part });
          lineW += ww;
        }
      });
      trimEnd(lines[lines.length - 1]);

      lines.forEach(function (line, li) {
        ensure(lh);
        var used = line.reduce(function (a, t) { return a + t.w; }, 0);
        var spaces = line.filter(function (t) { return t.t === " "; }).length;
        var extra = 0, x = M + indent;
        if (opts.align === "center") x += (maxW - used) / 2;
        else if (opts.align === "right") x += maxW - used;
        else if (opts.align === "justify" && li < lines.length - 1 && spaces) extra = (maxW - used) / spaces;
        if (li === 0 && opts.marker) drawMarker(opts.marker, size);
        line.forEach(function (tok) {
          var w = tok.w + (tok.t === " " ? extra : 0);
          var o = tok.o;
          if (o.bg) {
            doc.setFillColor.apply(doc, o.bg);
            doc.rect(x, y + size * 0.12, w + 0.4, size * 1.16, "F");
          }
          font(o);
          if (tok.t !== " ") doc.text(tok.t, x, y + size);
          if (o.u) {
            doc.setDrawColor.apply(doc, o.color || TEXT);
            doc.setLineWidth(size / 18);
            doc.line(x, y + size + 1.6, x + w, y + size + 1.6);
          }
          if (o.href) doc.link(x, y, w, lh, { url: o.href });
          x += w;
        });
        y += lh;
      });
      y += after == null ? 6 : after;

      function trimEnd(line) {
        var cut = 0;
        while (line.length && line[line.length - 1].t === " ") cut += line.pop().w;
        return cut;
      }
      function drawMarker(m, sz) {
        var mx = M + indent;
        if (m === "•") {
          doc.setFillColor.apply(doc, TEXT);
          doc.circle(mx - 9, y + sz * 0.66, sz / 7, "F");
        } else {
          font({ size: sz });
          doc.text(m, mx - 5, y + sz, { align: "right" });
        }
      }
    }

    // Analogía con el formato que le dio la persona en el editor
    function analogy(blocks) {
      var prefix = { text: "Esto es como cuando ", b: true, i: true, color: NAVY };
      var used = false;
      if (blocks.length && blocks[0].list) { rich([prefix], null, 2); used = true; }
      blocks.forEach(function (b, k) {
        var parts = b.runs.map(function (r) {
          return { text: r.text, b: r.b, i: r.i, u: r.u, color: r.color, bg: r.bg, href: r.href };
        });
        if (!used && !b.list) { parts.unshift(prefix); used = true; }
        var last = k === blocks.length - 1;
        if (!parts.length || !parts.some(function (p) { return p.text.trim(); })) {
          ensure(11.5 * 1.45); y += 11.5 * 1.45; return; // línea en blanco
        }
        rich(parts, null, last ? 0 : (b.list ? 2 : 5), {
          align: b.align, indent: b.list ? 22 : 0,
          marker: b.list ? (b.list === "ol" ? b.n + "." : "•") : null
        });
      });
      if (!used) rich([prefix], null, 0);
    }

    decorate();
    rich([{ text: "Unidad 3", b: true, color: NAVY }], 20, 4);
    rich([{ text: "Experto temático: Mateo Muñetones Rico.", b: true, color: PURPLE }], 16, 14);
    rich([{ text: "Pistas y analogías: mis analogías", b: true, color: NAVY }], 16, 2);
    rich([{ text: "Fecha: " + todayText(), color: GREY }], 11, 14);

    var items = sortedResults();
    items.forEach(function (r, i) {
      ensure(90); // evita dejar el título solo al final de una página
      y += 6;
      rich([{ text: "Acertijo " + r.n + ": " + r.title, b: true, color: NAVY }], 14, 4);
      rich([{ text: "Pista: ", b: true, color: PURPLE }, { text: r.clue, i: true }]);
      rich([{ text: "Concepto: ", b: true, color: PURPLE }, { text: r.concept }]);
      analogy(r.analogy);
      if (i < items.length - 1) {
        ensure(30);
        y += 14;
        doc.setDrawColor.apply(doc, LINE);
        doc.setLineWidth(1);
        doc.line(M, y, W - M, y);
        doc.setFillColor(255, 154, 98);
        doc.circle(W / 2, y, 2.5, "F");
        y += 12;
      }
    });

    try {
      doc.save("Mis_analogias_Aprender_a_aprender.pdf");
      note.textContent = "¡Listo! Tu documento se descargó.";
      confetti(document.getElementById("paDownload"));
    } catch (e) {
      note.textContent = "No se pudo generar el PDF. Inténtalo de nuevo.";
    }
  }

  /* ---------- Confeti al descargar ---------- */
  // Un solo canvas temporal: se crea al disparar y se elimina al terminar
  function confetti(origin) {
    if (reduceMotion) return;
    var canvas = document.createElement("canvas");
    canvas.className = "pa-confetti";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var colors = ["#000087", "#3037bc", "#5882f8", "#a9bcff", "#ff9a62", "#f5b81c", "#8224d3"];
    var r = origin.getBoundingClientRect();
    var ox = r.left + r.width / 2, oy = r.top + r.height / 2;
    var pieces = [];
    for (var i = 0; i < 140; i++) {
      var ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
      var speed = 7 + Math.random() * 9;
      pieces.push({
        x: ox, y: oy,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        color: colors[i % colors.length],
        round: Math.random() < 0.3
      });
    }

    var start = null, DURATION = 2600;
    function frame(t) {
      if (!start) start = t;
      var elapsed = t - start;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = elapsed > DURATION - 600 ? Math.max(0, (DURATION - elapsed) / 600) : 1;
      pieces.forEach(function (p) {
        p.vy += 0.32;           // gravedad
        p.vx *= 0.985;          // resistencia del aire
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill();
        } else {
          // el "aleteo" del papel: se achica en un eje según su giro
          ctx.fillRect(-p.w / 2, -p.h / 2 * Math.abs(Math.cos(p.rot * 2)), p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
        }
        ctx.restore();
      });
      if (elapsed < DURATION) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Animaciones al hacer scroll ---------- */
  function initScrollReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    var groups = [
      ".pa-section > h1", ".pa-section > .pa-section-lead", ".pa-block > h2",
      ".pa-pillar", ".pa-case", ".pa-rules-panel", ".pa-rule",
      ".pa-closing", ".pa-summary-actions"
    ];
    var targets = document.querySelectorAll(groups.join(","));
    if (!targets.length) return;
    document.documentElement.classList.add("pa-js");

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    targets.forEach(function (el) {
      // Escalonado entre tarjetas hermanas (pilares y reglas)
      if (el.matches(".pa-pillar, .pa-rule")) {
        var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(".pa-pillar, .pa-rule"); });
        el.style.setProperty("--pa-delay", (siblings.indexOf(el) * 0.12 + (el.matches(".pa-rule") ? 0.2 : 0)) + "s");
      }
      el.classList.add("pa-scroll");
      io.observe(el);
    });
  }

  /* ---------- Arranque ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNeural();

    screens = Array.prototype.slice.call(document.querySelectorAll("#paStage .pa-screen"));
    screens.forEach(function (sc) {
      if (sc.classList.contains("pa-riddle")) setupRiddle(sc);
    });
    document.querySelectorAll("[data-pa-next]").forEach(function (btn) {
      btn.addEventListener("click", function () { showScreen(current + 1); });
    });
    updateTrack();

    document.querySelectorAll("[data-pa-goto]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-pa-goto");
        startResource(function () { goToTab(id); });
      });
    });

    var heroCta = document.getElementById("paHeroCta");
    if (heroCta) heroCta.addEventListener("click", function () { startResource(); });

    // Cualquier cambio de pestaña desde el menú actualiza el modo inmersivo
    document.querySelectorAll(".tab-link").forEach(function (l) {
      l.addEventListener("click", function () { setTimeout(syncIntroMode, 0); });
    });

    seedSparks();
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    initScrollReveal();

    var downloadBtn = document.getElementById("paDownload");
    if (downloadBtn) downloadBtn.addEventListener("click", downloadPdf);

    var restartBtn = document.getElementById("paRestart");
    if (restartBtn) restartBtn.addEventListener("click", restart);
  });
})();
