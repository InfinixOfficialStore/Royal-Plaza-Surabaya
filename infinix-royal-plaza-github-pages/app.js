/* ============================================================
   Infinix Store Catalog — shared data + render logic
   Reads window.STORE_CONFIG (set inline per page) for store name,
   contact info, and links. Product + stock data comes from two
   Google Sheets tabs published as CSV (URLs below).
   ============================================================ */

/* ---- 1. GANTI DUA LINK INI dengan link "Publish to web" (CSV)
   dari sheet kamu — satu untuk tab Produk, satu untuk tab Stok.
   Caranya: Google Sheets > File > Share > Publish to web >
   pilih tab yang benar > format CSV > Publish > copy link. ---- */
const SHEET_PRODUK_CSV_URL = "PASTE_LINK_CSV_TAB_PRODUK_DI_SINI";
const SHEET_STOK_CSV_URL   = "PASTE_LINK_CSV_TAB_STOK_DI_SINI";

/* Urutan tampil kategori di halaman (harus sama persis dengan
   isi kolom "Kategori" di sheet Produk) */
const CATEGORY_ORDER = [
  "Handphone",
  "Tablet",
  "Laptop (AIOT)",
  "Smart TV (AIOT)",
  "Smart Watch (AIOT)",
  "TWS (AIOT)",
  "Powerbank (AIOT)",
  "Data Cable (AIOT)",
  "Phone Charger (AIOT)",
  "Phone Case (AIOT)",
];

function groupOf(kategori) {
  if (!kategori) return "Lainnya";
  return kategori.includes("AIOT") ? "AIOT" : kategori.trim();
}

/* ---- Minimal CSV parser (handles quoted fields with commas) ---- */
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1)
    .filter((r) => r.some((cell) => cell.trim() !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] || "").trim(); });
      return obj;
    });
}

async function fetchCSV(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat data (" + res.status + ")");
  return parseCSV(await res.text());
}

function formatRupiah(n) {
  const num = Number(String(n).replace(/[^0-9]/g, ""));
  if (!num) return n || "-";
  return "Rp " + num.toLocaleString("id-ID");
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

async function initCatalog() {
  const cfg = window.STORE_CONFIG;
  const catalogEl = document.getElementById("catalog");
  const navEl = document.getElementById("catNav");

  let produk, stok;
  try {
    [produk, stok] = await Promise.all([
      fetchCSV(SHEET_PRODUK_CSV_URL),
      fetchCSV(SHEET_STOK_CSV_URL),
    ]);
  } catch (err) {
    catalogEl.innerHTML =
      '<div class="state-msg"><strong>Katalog belum bisa dimuat</strong>' +
      "Pastikan link Google Sheets sudah di-publish sebagai CSV dan dimasukkan ke assets/app.js.</div>";
    console.error(err);
    return;
  }

  /* stok khusus toko ini */
  const stokByStore = {};
  stok
    .filter((r) => (r.Nama_Toko || "").trim() === cfg.storeName)
    .forEach((r) => { stokByStore[r.ID_SKU] = Number(r.Stok) || 0; });

  const items = produk
    .filter((p) => (p.Status || "Aktif").toLowerCase() !== "nonaktif")
    .map((p) => ({ ...p, stok: stokByStore[p.ID_SKU] ?? 0 }));

  /* kelompokkan per Kategori, urut sesuai CATEGORY_ORDER */
  const byCategory = {};
  items.forEach((p) => {
    const k = p.Kategori || "Lainnya";
    (byCategory[k] = byCategory[k] || []).push(p);
  });
  const categories = Object.keys(byCategory).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
  );

  /* ---- render nav tabs (Semua / Handphone / Tablet / AIOT) ---- */
  const groups = ["Semua", "Handphone", "Tablet", "AIOT"];
  groups.forEach((g, idx) => {
    const btn = el("button", idx === 0 ? "active" : "", g);
    btn.dataset.group = g;
    btn.addEventListener("click", () => {
      navEl.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCatalog(g);
    });
    navEl.appendChild(btn);
  });

  function renderCatalog(activeGroup) {
    catalogEl.innerHTML = "";
    let shown = 0;
    categories.forEach((cat) => {
      const grp = groupOf(cat);
      if (activeGroup !== "Semua" && grp !== activeGroup) return;
      const list = byCategory[cat];
      shown += list.length;

      const section = el("div", "cat-section");
      section.appendChild(
        el("h2", "", cat + '<span class="cat-count">' + list.length + " produk</span>")
      );
      const grid = el("div", "grid");
      list.forEach((p) => grid.appendChild(renderCard(p)));
      section.appendChild(grid);
      catalogEl.appendChild(section);
    });
    if (!shown) {
      catalogEl.innerHTML =
        '<div class="state-msg"><strong>Belum ada produk</strong>Kategori ini belum punya produk aktif.</div>';
    }
  }

  function renderCard(p) {
    const card = el("div", "card");
    const photo = el("div", "card-photo" + (p.Foto_URL ? "" : " empty"));
    if (p.Foto_URL) {
      const img = el("img");
      img.src = p.Foto_URL;
      img.alt = p.Nama_Produk || "";
      img.loading = "lazy";
      photo.appendChild(img);
    } else {
      photo.textContent = p.Nama_Produk || "";
    }
    card.appendChild(photo);
    if (p.Series) card.appendChild(el("div", "card-series", p.Series));
    card.appendChild(el("div", "card-name", p.Nama_Produk || "-"));
    if (p.Varian) card.appendChild(el("div", "card-variant", p.Varian));

    const bottom = el("div", "card-bottom");
    bottom.appendChild(el("div", "card-price", formatRupiah(p.Harga)));
    const badge = el(
      "div",
      "badge " + (p.stok > 0 ? "badge-in" : "badge-out"),
      p.stok > 0 ? "Tersedia" : "Habis"
    );
    bottom.appendChild(badge);
    card.appendChild(bottom);
    return card;
  }

  renderCatalog("Semua");
}

document.addEventListener("DOMContentLoaded", initCatalog);
