
const contactBtn = document.getElementById("contactBtn");
const modal = document.getElementById("contactModal");
const closeBtn = document.getElementById("closeModal");

let previousFocus = null;

function openContact() {
  previousFocus = document.activeElement;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  closeBtn.focus();
}

function closeContact() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (previousFocus) {
    previousFocus.focus();
  }
}

contactBtn.addEventListener("click", openContact);
closeBtn.addEventListener("click", closeContact);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeContact();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    modal.classList.contains("show")
  ) {
    closeContact();
  }
});



/* PIXORA LABS - Interactive effects */

// Scroll smoothly to the services
const exploreBtn = document.getElementById("exploreServices");
const servicesSection = document.getElementById("services");

if (exploreBtn && servicesSection) {
  exploreBtn.addEventListener("click", () => {
    servicesSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

// Reuse the existing header contact popup
const heroContactBtn = document.getElementById("heroContact");
const bottomContactBtn = document.getElementById("bottomContact");
const headerContactBtn = document.getElementById("contactBtn");

[heroContactBtn, bottomContactBtn].forEach((button) => {
  if (!button || !headerContactBtn) return;

  button.addEventListener("click", () => {
    headerContactBtn.click();
  });
});

// Reveal content as it enters the screen
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}

// Subtle 3D tilt on service cards
const tiltCards = document.querySelectorAll("[data-tilt]");
const canHover = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
);

if (canHover.matches) {
  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const percentX = (x / rect.width - 0.5) * 2;
      const percentY = (y / rect.height - 0.5) * 2;

      const rotateY = percentX * 4;
      const rotateX = percentY * -4;

      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) ` +
        `rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

// Avoid animation when the user prefers reduced motion
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

if (reduceMotion.matches) {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}




/* ===== PIXORA LABS VIDEO SHOWREEL ===== */
(() => {
  const cards = [...document.querySelectorAll(".reel-card")];
  const videos = [...document.querySelectorAll(".reel-video")];
  const status = document.getElementById("reelStatus");
  const soundAll = document.getElementById("soundAll");

  if (!cards.length || videos.length !== 3) return;

  let current = 0;
  let voiceEnabled = false;
  let switching = false;

  function updateStatus(index) {
    if (status) {
      status.textContent =
        `NOW PLAYING · SAMPLE ${String(index + 1).padStart(2, "0")}`;
    }
  }

  function updateSoundButtons() {
    videos.forEach((video, index) => {
      const button = cards[index].querySelector(".sound-toggle");
      if (button) {
        button.textContent = video.muted
          ? "🔇 Sound Off"
          : "🔊 Sound On";
        button.setAttribute("aria-label",
          video.muted ? "Turn sound on" : "Turn sound off");
      }
    });

    if (soundAll) {
      soundAll.textContent = voiceEnabled
        ? "🔊 Voice Enabled"
        : "🔇 Enable Voice";
    }
  }

  async function playVideo(index) {
    current = index;
    switching = true;

    videos.forEach((video, i) => {
      if (i !== index) {
        video.pause();
        video.currentTime = 0;
      }
      video.muted = !voiceEnabled;
      cards[i].classList.toggle("active", i === index);
    });

    updateStatus(index);
    updateSoundButtons();

    try {
      videos[index].currentTime = 0;
      await videos[index].play();
    } catch (error) {
      // If autoplay is blocked, the user can press the video play button.
    } finally {
      switching = false;
    }
  }

  videos.forEach((video, index) => {
    video.loop = false;

    video.addEventListener("ended", () => {
      if (current === index && !switching) {
        playVideo((index + 1) % videos.length);
      }
    });

    video.addEventListener("error", () => {
      console.warn("Check video path:", video.currentSrc);
    });

    const soundButton =
      cards[index].querySelector(".sound-toggle");

    soundButton?.addEventListener("click", async () => {
      voiceEnabled = true;
      videos.forEach((item, i) => {
        item.muted = i !== current;
      });

      if (current !== index) {
        await playVideo(index);
      } else {
        try {
          await video.play();
        } catch (error) {}
      }

      video.muted = false;
      updateSoundButtons();
    });

    video.addEventListener("play", () => {
      if (index !== current) {
        video.pause();
      }
    });
  });

  soundAll?.addEventListener("click", async () => {
    voiceEnabled = !voiceEnabled;

    // Only the currently playing sample has sound.
    videos.forEach((video, index) => {
      video.muted = !voiceEnabled || index !== current;
    });

    if (voiceEnabled) {
      try {
        await videos[current].play();
      } catch (error) {}
    }

    updateSoundButtons();
  });

  // Start the first sample when the portfolio enters the screen.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];

      if (entry.isIntersecting) {
        if (videos[current].paused) {
          videos[current].play().catch(() => {});
        }
      } else {
        videos.forEach(video => video.pause());
      }
    }, { threshold: 0.15 });

    observer.observe(document.getElementById("videoPortfolio"));
  }

  updateSoundButtons();
  playVideo(0);
})();




/* ===== BANNER GALLERY INTERACTIONS ===== */
(() => {
  const lightbox = document.getElementById("bannerLightbox");
  const fullImage = document.getElementById("bannerFullImage");
  const closePreview = document.getElementById("closeBannerPreview");

  if (!lightbox || !fullImage || !closePreview) return;

  let previousFocus = null;

  function openPreview(src, alt, trigger) {
    previousFocus = trigger;
    fullImage.src = src;
    fullImage.alt = alt;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closePreview.focus();
  }

  function closePreviewBox() {
    lightbox.hidden = true;
    fullImage.src = "";
    document.body.style.overflow = "";
    previousFocus?.focus();
  }

  document.querySelectorAll(".design-preview").forEach(button => {
    button.addEventListener("click", () => {
      const img = button.querySelector("img");
      const src = button.dataset.full || img.src;
      openPreview(src, img.alt, button);
    });
  });

  closePreview.addEventListener("click", closePreviewBox);

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closePreviewBox();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closePreviewBox();
    }
  });

  const bannerContact = document.getElementById("bannerContactBtn");

  bannerContact?.addEventListener("click", () => {
    const headerButton = document.getElementById("contactBtn");

    if (headerButton) {
      headerButton.click();
    } else {
      window.open("https://wa.me/923192686812", "_blank", "noopener");
    }
  });
})();




/* PIXORA LABS FOOTER */
(() => {
  const year = document.getElementById("footerYear");
  if (year) year.textContent = new Date().getFullYear();

  const footerContact = document.getElementById("footerContactLink");

  footerContact?.addEventListener("click", event => {
    event.preventDefault();

    const contactButton = document.getElementById("contactBtn");

    if (contactButton) {
      contactButton.click();
    } else {
      window.open(
        "https://wa.me/923192686812",
        "_blank",
        "noopener,noreferrer"
      );
    }
  });
})();
