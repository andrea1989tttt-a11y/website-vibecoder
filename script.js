(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".header");
  const burger = document.querySelector(".burger");
  const panel = document.querySelector("#mobile-nav");
  const state = { scrollY: 0, locked: false, lastFocus: null };

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  function currentScroll() {
    return state.locked ? state.scrollY : window.scrollY;
  }

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", currentScroll() > 12);
  }

  function setScrollLock(on) {
    if (on && !state.locked) {
      state.scrollY = window.scrollY;
      state.locked = true;
      document.body.classList.add("scroll-lock");
      document.body.style.top = "-" + state.scrollY + "px";
    } else if (!on && state.locked) {
      const y = state.scrollY;
      state.locked = false;
      document.body.classList.remove("scroll-lock");
      document.body.style.top = "";
      window.scrollTo(0, y);
    }
    updateHeader();
  }

  function syncScrollLock() {
    const menuOpen = document.body.classList.contains("menu-open");
    const modalOpen = Boolean(document.querySelector(".modal.is-open"));
    setScrollLock(menuOpen || modalOpen);
  }

  function setPageInert(on) {
    document.querySelectorAll("body > :not(header):not(#mobile-nav)").forEach((node) => {
      if ("inert" in node) node.inert = on;
    });
  }

  function closeMenu(returnFocus) {
    document.body.classList.remove("menu-open");
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Открыть меню");
    }
    if (panel) {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      if ("inert" in panel) panel.inert = true;
    }
    setPageInert(false);
    syncScrollLock();
    if (returnFocus && burger) burger.focus();
  }

  function openMenu() {
    document.body.classList.add("menu-open");
    if (burger) {
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Закрыть меню");
    }
    if (panel) {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      if ("inert" in panel) panel.inert = false;
      const first = panel.querySelector("a, button");
      if (first) first.focus();
    }
    setPageInert(true);
    syncScrollLock();
  }

  if (burger && panel) {
    if ("inert" in panel) panel.inert = true;
    burger.addEventListener("click", () => {
      if (document.body.classList.contains("menu-open")) closeMenu(false);
      else openMenu();
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024 && document.body.classList.contains("menu-open")) closeMenu(false);
  });

  function focusable(root) {
    return [...root.querySelectorAll("a[href], button, input, select, textarea, video, [tabindex]")].filter((node) => {
      if (node.hasAttribute("disabled") || node.getAttribute("aria-hidden") === "true") return false;
      if (node.closest("[hidden]")) return false;
      return node.tabIndex !== -1;
    });
  }

  function stopModalVideo(modal) {
    const video = modal.querySelector("[data-modal-video]");
    if (!video) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.hidden = true;
  }

  function closeModal(modal, returnFocus) {
    if (!modal || modal.hidden) return;
    stopModalVideo(modal);
    modal.hidden = true;
    modal.classList.remove("is-open");
    syncScrollLock();
    if (returnFocus && state.lastFocus && typeof state.lastFocus.focus === "function") state.lastFocus.focus();
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    document.querySelectorAll(".modal.is-open").forEach((item) => {
      if (item !== modal) closeModal(item, false);
    });
    state.lastFocus = document.activeElement;
    modal.hidden = false;
    modal.classList.add("is-open");
    syncScrollLock();
    const closeBtn = modal.querySelector("[data-close]");
    if (closeBtn) closeBtn.focus();
  }

  function fillWork(article) {
    const modal = document.getElementById("work-modal");
    if (!modal || !article) return;
    const image = modal.querySelector("[data-modal-image]");
    const video = modal.querySelector("[data-modal-video]");
    const note = modal.querySelector("[data-modal-note]");
    const title = article.dataset.title || "Project";
    const text = article.dataset.text || "";
    modal.querySelector("[data-modal-index]").textContent = article.dataset.index || "";
    modal.querySelector("[data-modal-category]").textContent = article.dataset.categoryLabel || "";
    modal.querySelector("[data-modal-title]").textContent = title;
    modal.querySelector("[data-modal-text]").textContent = text;
    modal.querySelector("[data-modal-text]").hidden = !text;
    image.hidden = true;
    video.hidden = true;
    stopModalVideo(modal);
    if (article.dataset.video) {
      video.poster = article.dataset.poster || "";
      video.src = article.dataset.video;
      video.hidden = false;
      if (note) note.hidden = true;
      video.onerror = () => {
        if (!note) return;
        note.hidden = false;
        note.textContent = "Этот ролик в HEVC. Его открывает Safari. Для Chrome нужна версия H.264 — путь к файлу указан в README.";
      };
    } else if (article.dataset.poster) {
      image.src = article.dataset.poster;
      image.alt = article.dataset.alt || title;
      image.hidden = false;
      if (note) note.hidden = true;
    }
    const featured = document.querySelector("#featured-video");
    if (featured && !featured.paused) featured.pause();
    openModal("work-modal");
  }

  function applyFilter(name) {
    document.querySelectorAll(".work").forEach((card) => {
      card.hidden = !(name === "all" || card.dataset.category === name);
    });
    document.querySelectorAll(".filters [data-filter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === name));
    });
    const empty = document.querySelector("[data-empty]");
    if (empty) empty.hidden = document.querySelectorAll(".work:not([hidden])").length !== 0;
  }

  function applyService(value, note) {
    const select = document.querySelector("#service");
    const idea = document.querySelector("#idea");
    const banner = document.querySelector("#selected-service");
    if (!select) return;
    if ([...select.options].some((option) => option.value === value)) select.value = value;
    const selectedText = select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : "";
    const label = note || selectedText;
    if (banner) {
      banner.hidden = !label;
      banner.textContent = label ? "Выбранная услуга: " + label : "";
    }
    if (idea && note && (!idea.value.trim() || idea.dataset.autofill === "true")) {
      idea.value = note;
      idea.dataset.autofill = "true";
    }
  }

  document.addEventListener("click", (event) => {
    const workButton = event.target.closest(".work__open");
    if (workButton) {
      fillWork(workButton.closest(".work"));
      return;
    }

    const opener = event.target.closest("[data-open]");
    if (opener) {
      event.preventDefault();
      openModal(opener.dataset.open);
      return;
    }

    const serviceLink = event.target.closest("[data-select-service]");
    if (serviceLink) applyService(serviceLink.dataset.selectService, serviceLink.dataset.serviceNote || "");

    const filterControl = event.target.closest("[data-filter]");
    if (filterControl && filterControl.dataset.filter) applyFilter(filterControl.dataset.filter);

    const link = event.target.closest("a[href^='#']");
    if (!link) return;
    const id = link.getAttribute("href");
    if (!id || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    if (document.body.classList.contains("menu-open")) closeMenu(false);
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", id);
  });

  document.addEventListener("keydown", (event) => {
    const modal = document.querySelector(".modal.is-open");
    if (event.key === "Escape") {
      if (modal) {
        closeModal(modal, true);
        return;
      }
      if (document.body.classList.contains("menu-open")) closeMenu(true);
      return;
    }
    if (event.key === "Tab" && modal) {
      const nodes = focusable(modal);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal, true);
    });
    modal.querySelectorAll("[data-close]").forEach((button) => {
      button.addEventListener("click", () => closeModal(modal, true));
    });
  });

  document.querySelectorAll(".faq__item button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq__item");
      const panelId = button.getAttribute("aria-controls");
      const region = panelId ? document.getElementById(panelId) : null;
      const open = button.getAttribute("aria-expanded") !== "true";
      item.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      if (region) region.hidden = !open;
    });
  });

  function initForm() {
    const form = document.querySelector("#project-form");
    const success = document.querySelector("#form-success");
    if (!form || !success) return;
    const fields = {
      name: form.querySelector("#name"),
      contact: form.querySelector("#contact-field"),
      service: form.querySelector("#service"),
      idea: form.querySelector("#idea"),
      consent: form.querySelector("#consent")
    };
    const rules = [
      ["name", () => fields.name.value.trim().length >= 2, "Введите имя."],
      ["contact", () => fields.contact.value.trim().length >= 3, "Укажите контакт: Telegram, телефон или почту."],
      ["service", () => fields.service.value !== "", "Выберите, что хотите создать."],
      ["consent", () => fields.consent.checked, "Нужно согласие на обработку персональных данных."]
    ];
    const showError = (key, message) => {
      const error = form.querySelector('[data-error-for="' + key + '"]');
      const field = fields[key];
      if (error) {
        error.textContent = message;
        error.hidden = !message;
      }
      if (field) {
        field.setAttribute("aria-invalid", message ? "true" : "false");
        if (message && error && error.id) field.setAttribute("aria-describedby", error.id);
        else field.removeAttribute("aria-describedby");
      }
    };
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;
      let firstInvalid = null;
      rules.forEach(([key, test, message]) => {
        if (!test()) {
          showError(key, message);
          valid = false;
          if (!firstInvalid) firstInvalid = fields[key];
        } else showError(key, "");
      });
      if (!valid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      form.hidden = true;
      success.hidden = false;
      success.focus();
    });
    const back = document.querySelector("[data-form-back]");
    if (back) {
      back.addEventListener("click", () => {
        success.hidden = true;
        form.hidden = false;
        fields.name.focus();
      });
    }
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
  }

  function initParallax() {
    if (reduce) return;
    const salon = document.querySelector("[data-hero-parallax]");
    if (!salon) return;
    if (window.matchMedia("(max-width: 900px), (pointer: coarse)").matches) return;
    const plates = [...salon.querySelectorAll("[data-depth]")];
    let frame = 0;
    const paint = (x, y) => {
      plates.forEach((plate) => {
        const depth = Number(plate.dataset.depth) || 8;
        const rotate = plate.dataset.rotate || "0";
        plate.style.transform = "translate3d(" + (x * depth) + "px, " + (y * depth) + "px, 0) rotate(" + rotate + "deg)";
      });
    };
    salon.addEventListener("pointermove", (event) => {
      const rect = salon.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => paint(x, y));
    });
    salon.addEventListener("pointerleave", () => {
      plates.forEach((plate) => {
        plate.style.transform = "rotate(" + (plate.dataset.rotate || "0") + "deg)";
      });
    });
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
  initForm();
  initReveal();
  initParallax();
})();
