let products = [];
let site = {
  currencySymbol: "£",
  stripePaymentLink: "https://buy.stripe.com/YOUR_PAYMENT_LINK_HERE",
  paypalPaymentLink: "https://www.paypal.com/ncp/payment/YOUR_PAYPAL_LINK_HERE"
};
let cart = {};
let stripePaymentLink = site.stripePaymentLink;
let paypalPaymentLink = site.paypalPaymentLink;

function money(n) {
  return (site.currencySymbol || "£") + Number(n).toFixed(2);
}

function productImage(p) {
  return p.image || "";
}

function bumpBasket() {
  const el = document.getElementById("basketCount");
  if (!el) return;
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

function renderProducts() {
  const root = document.getElementById("products");
  if (!root) return;

  root.innerHTML = products.map((p) => `
    <div class="card">
      <div class="card-img">
        <img alt="${p.name}" src="${productImage(p)}">
        <span class="card-emoji">${p.emoji || ""}</span>
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="subtitle">${p.subtitle || ""}</p>
        <p class="notes">${p.notes || ""}</p>
        <div class="product-foot">
          <div>
            <div class="price">${money(p.price)}</div>
            <div class="standard">standard price per ${p.unit || "punnet"}</div>
          </div>
          <div class="qty">
            <button onclick="removeItem('${p.id}')">−</button>
            <b id="qty-${p.id}">${cart[p.id] || 0}</b>
            <button class="plus" onclick="addItem('${p.id}')">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

function calc() {
  const subtotal = products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);
  return {
    subtotal,
    discount: 0,
    total: subtotal,
    count: Object.values(cart).reduce((a, b) => a + b, 0)
  };
}

function renderCart() {
  const t = calc();

  products.forEach((p) => {
    const el = document.getElementById("qty-" + p.id);
    if (el) el.textContent = cart[p.id] || 0;
  });

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("basketCount", t.count);
  setText("subtotal", money(t.subtotal));
  setText("discount", "-" + money(t.discount));
  setText("total", money(t.total));
  setText("modalTotal", money(t.total));
  setText("modalPlan", "One-off order");

  const linesRoot = document.getElementById("cartLines");
  if (!linesRoot) return;

  const lines = products
    .filter((p) => cart[p.id] > 0)
    .map((p) => `
      <div class="line">
        <span>${cart[p.id]} × ${p.name}</span>
        <button onclick="removeItem('${p.id}')" style="margin-right:8px;background:#dc2626;color:#fff;border:0;border-radius:14px;padding:4px 8px;cursor:pointer">Remove</button>
        <b>${money(cart[p.id] * p.price)}</b>
      </div>
    `)
    .join("");

  linesRoot.innerHTML = lines || '<p class="line" style="justify-content:center;color:var(--muted)">Your basket is empty.</p>';
}

function addItem(id) {
  if (!(id in cart)) return;
  cart[id] += 1;
  renderCart();
  bumpBasket();
}

function removeItem(id) {
  if (!(id in cart)) return;
  cart[id] = Math.max(0, cart[id] - 1);
  renderCart();
  bumpBasket();
}

function openCheckout() {
  renderCart();
  document.getElementById("checkout")?.classList.add("open");
}

function closeCheckout() {
  document.getElementById("checkout")?.classList.remove("open");
}

function goPayment(type) {
  const t = calc();
  if (t.count === 0) {
    alert("Please add at least one product to your basket first.");
    return;
  }

  const url = type === "stripe" ? stripePaymentLink : paypalPaymentLink;
  if (!url || url.includes("YOUR_")) {
    alert("Demo mode: replace the " + type + " link in data/site.json before publishing.");
    return;
  }

  window.location.href = url;
}

async function loadCatalogue() {
  const [productRes, siteRes] = await Promise.all([
    fetch("data/products.json", { cache: "no-store" }),
    fetch("data/site.json", { cache: "no-store" })
  ]);

  if (!productRes.ok) throw new Error("Could not load data/products.json");
  if (!siteRes.ok) throw new Error("Could not load data/site.json");

  const productData = await productRes.json();
  site = await siteRes.json();

  stripePaymentLink = site.stripePaymentLink;
  paypalPaymentLink = site.paypalPaymentLink;

  products = (productData.products || [])
    .filter((p) => p.active !== false)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));

  cart = Object.fromEntries(products.map((p) => [p.id, 0]));
}

loadCatalogue()
  .then(() => {
    renderProducts();
    renderCart();
  })
  .catch((err) => {
    console.error(err);
    const el = document.getElementById("products");
    if (el) {
      el.innerHTML = "<p style='padding:16px'>Could not load products. Check data/products.json and data/site.json are valid JSON and published with the site.</p>";
    }
  });
