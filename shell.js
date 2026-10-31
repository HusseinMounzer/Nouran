// Loads AFTER the main inline script, so it can use its variables and functions.
const SHELL = {
  TITLE: "نوران",
  HEADLINE: "تفاصيل صغيرة، سعادة كبيرة",
  SUBTITLE: "اكتشفي مجموعتنا من الدفاتر والقرطاسية والهدايا المصمّمة بحب.",
  ABOUT: "نوران مشروع صغير يصنع الدفاتر والشموع وعلب الهدايا بلمسة يدوية، بحب واهتمام بكل تفصيل. (نص مؤقت: يُستبدل بنص نوران)"
};
const VIEWS = ["home", "shop", "about"];
const $ = id => document.getElementById(id);

document.title = SHELL.TITLE;
$("business-name").textContent = SHELL.HEADLINE;
$("business-tagline").textContent = SHELL.SUBTITLE;
$("about-text").textContent = SHELL.ABOUT;
$("nav-brand").innerHTML = CONFIG.LOGO_URL
  ? `<img src="${CONFIG.LOGO_URL}" alt="${SHELL.TITLE}">`
  : SHELL.TITLE;

function route() {
  let h = (location.hash || "#home").slice(1);
  if (!VIEWS.includes(h)) h = "home";
  VIEWS.forEach(v => { $("view-" + v).hidden = v !== h; });
  document.querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("active", a.dataset.nav === h));
  $("nav-links").classList.remove("open");
  window.scrollTo(0, 0);
}
addEventListener("hashchange", route);
route();

$("nav-burger").addEventListener("click", () => $("nav-links").classList.toggle("open"));
$("nav-cart").addEventListener("click", openCart);

function syncCart() {
  const n = Number($("cart-count").textContent) || 0;
  $("nav-cart-count").textContent = n;
  $("nav-cart-count").classList.toggle("on", n > 0);
}
syncCart();
new MutationObserver(syncCart).observe($("cart-count"), { childList: true, characterData: true, subtree: true });

function goCategory(name) {
  ACTIVE_CATEGORY = name;
  ACTIVE_SUBCATEGORY = "All";
  renderChips(CONFIG.CATEGORY_SHEETS.map(c => c.name));
  renderSubchips();
  renderGrid();
  location.hash = "#shop";
}

let homeBuilt = false;
function buildHome() {
  if (homeBuilt || !ALL_PRODUCTS.length) return;
  homeBuilt = true;
  $("tiles").innerHTML = CONFIG.CATEGORY_SHEETS.map((c, i) => {
    const p = ALL_PRODUCTS.find(x => x.category === c.name && x.photo);
    return `<button class="tile" data-c="${i}"><img src="${p ? p.photo : ""}" alt=""><span>${c.name}</span></button>`;
  }).join("");
  $("tiles").querySelectorAll(".tile").forEach(t =>
    t.addEventListener("click", () => goCategory(CONFIG.CATEGORY_SHEETS[t.dataset.c].name)));

  const price = p => (typeof displayPrice === "function" ? displayPrice(p) : p.price);
  const list = ALL_PRODUCTS.filter(inStock).slice(0, 4);
  $("feat-grid").innerHTML = list.map((p, i) => `
    <div class="card" data-f="${i}">
      <img src="${p.photo || ""}" alt="${p.name}" loading="lazy">
      <div class="card-body"><h3>${p.name}</h3><p class="price">${price(p)}</p></div>
    </div>`).join("");
  $("feat-grid").querySelectorAll(".card").forEach(c =>
    c.addEventListener("click", () => openModal(list[c.dataset.f])));
}

// Build the home sections once the products have loaded.
const _renderGrid = renderGrid;
renderGrid = function () { _renderGrid(); buildHome(); };
