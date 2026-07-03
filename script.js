/* ============================================================
   BIRTHDAY PAGE — MAIN SCRIPT
   Menangani: amplop pembuka, musik latar, tiup lilin,
   reveal pesan & galeri, lightbox foto, dan confetti.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- ELEMEN UTAMA ---------- */
  const introOverlay = document.getElementById('intro-overlay');
  const envelopeWrap  = document.getElementById('envelope-wrap');
  const envelope      = document.getElementById('envelope');
  const body          = document.body;

  const music        = document.getElementById('bg-music');
  const musicToggle   = document.getElementById('music-toggle');

  const scrollCue     = document.getElementById('scroll-cue');
  const candleSection = document.getElementById('candle-section');

  const blowBtn    = document.getElementById('blow-btn');
  const flameGroup = document.getElementById('flame-group');
  const smoke      = document.getElementById('smoke');
  const cakeStatus = document.getElementById('cake-status');

  const messageText = document.getElementById('message-text');
  const galleryGrid  = document.getElementById('gallery-grid');

  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  const confettiCanvas = document.getElementById('confetti-canvas');

  let candleBlown = false;

  /* ============================================================
     1. AMPLOP / SURAT PEMBUKA
     ============================================================ */
  function openEnvelope() {
    if (envelope.classList.contains('open')) return;

    envelope.classList.add('open');

    // Coba putar musik begitu user berinteraksi (memenuhi syarat autoplay browser)
    playMusic();

    // Tunggu animasi amplop terbuka selesai sebelum overlay hilang
    setTimeout(() => {
      introOverlay.classList.add('closing');
      body.classList.remove('no-scroll');

      setTimeout(() => {
        introOverlay.classList.add('hidden');
      }, 850);
    }, 1100);
  }

  envelopeWrap.addEventListener('click', openEnvelope);
  envelopeWrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openEnvelope();
    }
  });

  /* ============================================================
     2. MUSIK LATAR
     ============================================================ */
  function playMusic() {
    if (!music) return;
    const playPromise = music.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          musicToggle.classList.add('playing');
          musicToggle.setAttribute('aria-pressed', 'true');
        })
        .catch(() => {
          // Autoplay diblokir browser; tombol musik tetap bisa dipakai manual
          musicToggle.classList.remove('playing');
          musicToggle.setAttribute('aria-pressed', 'false');
        });
    }
  }

  function toggleMusic() {
    if (!music) return;
    if (music.paused) {
      playMusic();
    } else {
      music.pause();
      musicToggle.classList.remove('playing');
      musicToggle.setAttribute('aria-pressed', 'false');
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  /* ============================================================
     3. SCROLL CUE (dari hero ke bagian lilin)
     ============================================================ */
  if (scrollCue && candleSection) {
    scrollCue.addEventListener('click', () => {
      candleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ============================================================
     4. TIUP LILIN
     ============================================================ */
  function blowCandle() {
    if (candleBlown) return;
    candleBlown = true;

    flameGroup.classList.add('blown-out');
    smoke.setAttribute('opacity', '1');
    smoke.classList.add('rising');
    cakeStatus.textContent = 'permohonanmu terkirim ke langit… 🎉';

    fireConfetti();

    // Reset asap setelah animasi selesai (agar tidak menumpuk kalau elemen dipakai lagi)
    setTimeout(() => {
      smoke.classList.remove('rising');
    }, 1700);
  }

  blowBtn.addEventListener('click', blowCandle);

  /* ============================================================
     5. REVEAL PESAN (muncul satu per satu saat discroll)
     ============================================================ */
  const messageParagraphs = messageText ? Array.from(messageText.querySelectorAll('p')) : [];

  const messageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = messageParagraphs.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 350);
        messageObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  messageParagraphs.forEach((p) => messageObserver.observe(p));

  /* ============================================================
     6. REVEAL GALERI FOTO
     ============================================================ */
  const galleryItems = galleryGrid ? Array.from(galleryGrid.querySelectorAll('.gallery-item')) : [];

  const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = galleryItems.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 120);
        galleryObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  galleryItems.forEach((item) => galleryObserver.observe(item));

  /* ============================================================
     7. LIGHTBOX FOTO
     ============================================================ */
  const galleryPhotos = galleryGrid ? Array.from(galleryGrid.querySelectorAll('.gallery-photo')) : [];

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
  }

  galleryPhotos.forEach((img) => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });

  if (lightbox) {
    lightbox.addEventListener('click', closeLightbox);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  /* ============================================================
     8. CONFETTI (canvas, dipicu saat tiup lilin)
     ============================================================ */
  const ctx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiPieces = [];
  let confettiAnimId = null;

  const confettiColors = ['#c9a24b', '#e6cb8f', '#e3b7bd', '#f4ead9', '#b98a91'];

  function resizeCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function createConfettiPiece() {
    return {
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * confettiCanvas.height * 0.3,
      size: 4 + Math.random() * 6,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      speedY: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      shape: Math.random() > 0.5 ? 'circle' : 'rect'
    };
  }

  function fireConfetti() {
    if (!ctx) return;
    confettiPieces = confettiPieces.concat(
      Array.from({ length: 90 }, createConfettiPiece)
    );

    if (!confettiAnimId) {
      animateConfetti();
    }

    // Hentikan otomatis setelah beberapa detik agar tidak terus berjalan
    setTimeout(() => {
      confettiPieces = [];
    }, 4500);
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiPieces.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }

      ctx.restore();
    });

    // Buang partikel yang sudah keluar layar
    confettiPieces = confettiPieces.filter((p) => p.y < confettiCanvas.height + 40);

    if (confettiPieces.length > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimId = null;
    }
  }

});