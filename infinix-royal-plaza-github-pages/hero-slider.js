/* ============================================================
   Hero product auto-slider.
   Taruh foto produk di folder assets/ dengan nama:
   hero-product-1.png, hero-product-2.png, hero-product-3.png, dst.
   Boleh 1 foto saja (tidak akan slide) atau lebih dari 1 (auto-slide
   setiap 4 detik). Tidak perlu edit kode ini — cukup tambah/ganti file gambar.
   ============================================================ */
(function () {
  const MAX_CANDIDATES = 8;
  const SLIDE_INTERVAL_MS = 4000;

  document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("heroSlider");
    if (!container) return;

    const candidates = [];
    for (let i = 1; i <= MAX_CANDIDATES; i++) {
      candidates.push("assets/hero-product-" + i + ".png");
    }

    const loaded = [];
    let pending = candidates.length;

    candidates.forEach((src, idx) => {
      const probe = new Image();
      probe.onload = () => { loaded.push({ src, idx }); settle(); };
      probe.onerror = () => { settle(); };
      probe.src = src;
    });

    function settle() {
      pending--;
      if (pending === 0) render();
    }

    function render() {
      loaded.sort((a, b) => a.idx - b.idx);

      if (!loaded.length) {
        container.innerHTML =
          '<div class="hero-media-fallback">Tambahkan foto produk: simpan sebagai assets/hero-product-1.png (bisa lebih dari satu, urut angka 1, 2, 3… untuk auto-slide)</div>';
        return;
      }

      loaded.forEach((item, i) => {
        const img = document.createElement("img");
        img.src = item.src;
        img.alt = "Produk unggulan";
        img.className = "hero-slide" + (i === 0 ? " active" : "");
        container.appendChild(img);
      });

      if (loaded.length > 1) {
        let current = 0;
        setInterval(() => {
          const slides = container.querySelectorAll(".hero-slide");
          slides[current].classList.remove("active");
          current = (current + 1) % slides.length;
          slides[current].classList.add("active");
        }, SLIDE_INTERVAL_MS);
      }
    }
  });
})();
