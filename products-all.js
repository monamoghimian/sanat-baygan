/* products-all.js — منطق مشترک صفحات «مشاهده همه»: فیلتر کارت‌ها + مودال رنگ‌ها */
(function () {
  const D = document.body.dataset;            // تنظیمات صفحه (مسیر عکس، شماره تماس، کاتالوگ)
  const LABELS = window.PIECE_LABELS || {};   // متن توضیحی هر تعداد پارچه (در هر صفحه تعریف می‌شود)
  const $ = (s, r = document) => r.querySelector(s);
  const fa = n => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);

  // رنگ بدنه و رنگ چاپ: نام فارسی + کد رنگ
  const COLORS = { gray: ["خاکستری", "#8b8b86"], white: ["سفید", "#f4f1ea"], black: ["مشکی", "#222"], cream: ["کرم", "#d9bd8f"], beige: ["بژ", "#b99b6b"], blue: ["آبی", "#1f3550"], red: ["قرمز", "#6e2430"], gold: ["طلایی", "#7a6a35"], green: ["سبز", "#1f4a38"], purple: ["بنفش", "#4a2a45"], smoky: ["دودی", "#7d7f7c"] };
const PRINTS = { black: ["مشکی", "#111"], white: ["سفید", "#fff"], gold: ["طلایی", "#c9a227"], silver: ["نقره‌ای", "#b5b5b5"] };

  // توکن "gray-black" = رنگ بدنه + رنگ چاپ. دایره رنگ: نیمه‌ی بدنه، نیمه‌ی چاپ
  const sw = t => { const [c, p] = t.split("-"); return p ? `linear-gradient(135deg,${COLORS[c][1]} 55%,${PRINTS[p][1]} 55%)` : COLORS[c][1]; };
  const nm = t => { const [c, p] = t.split("-"); return COLORS[c][0] + (p ? " - چاپ " + PRINTS[p][0] : ""); };
  // توکن‌های یک کارت برای تعداد پارچه‌ی مشخص (p = "" برای محصولات بدون تعداد)
  const vars = (el, p) => (el.dataset["v" + p] || "").split(" ").filter(Boolean);

  /* ---------- دایره‌های رنگ روی کارت‌ها ---------- */
  const items = [...document.querySelectorAll("[data-item]")];
  items.forEach(el => {
    const keys = Object.keys(el.dataset).filter(k => /^v\d*$/.test(k));
    const all = [...new Set(keys.flatMap(k => vars(el, k.slice(1))))];
    $("[data-dots]", el).innerHTML = all.map(t => `<span class="swatch-sm" title="${nm(t)}" style="background:${sw(t)}"></span>`).join("");
    // اگر عکس انتخابی کارت پیدا نشد، یک بار عکس اولین تعداد پارچه را امتحان کن
    const im = $("img", el);
    im.addEventListener("error", () => {
      if (im.dataset.fb) return;
      im.dataset.fb = 1;
      const p = el.dataset.pieces.split(" ")[0] || "";
      im.src = D.imgDir + el.dataset.base + "-" + vars(el, p)[0] + (p ? "-" + p : "") + ".webp";
    });
    // باز شدن کارت با کیبورد (Enter / Space)
    const card = $(".card", el);
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); card.click(); } });
  });

  /* ---------- عکس روی کارت‌ها ---------- */
  // قانون: اگر فیلتر ۱۵ پارچه فعال باشد عکس ۱۵ پارچه، وگرنه (همه / ۷ پارچه) عکس ۷ پارچه.
  // کالکشنی که ۷ پارچه ندارد (مثل Time) عکس ۱۵ پارچه را نشان می‌دهد.
  // اگر فیلتر رنگ فعال باشد، عکس همان رنگ نمایش داده می‌شود.
  function setCovers() {
    items.forEach(el => {
      const ps = el.dataset.pieces.split(" ").filter(Boolean);
      const p = ps.includes(fp) ? fp : (ps.includes("7") ? "7" : (ps[0] || ""));
      const vs = vars(el, p);
      const t = vs.find(x => x.split("-")[0] === fc) || vs[0];
      const file = D.imgDir + el.dataset.base + "-" + t + (p ? "-" + p : "") + ".webp";
      const img = $("img", el);
      if (!img.src.endsWith(file)) { delete img.dataset.fb; img.src = file; }
    });
  }

  /* ---------- فیلتر ---------- */
  let fp = "all", fc = "all";                 // فیلتر فعلی: تعداد پارچه، رنگ
  const empty = $("#emptyMsg");
  function applyFilters() {
    let n = 0;
    items.forEach(el => {
      const ok = (fp === "all" || (fp === "single" ? !el.dataset.pieces : el.dataset.pieces.split(" ").includes(fp))) &&  // single = محصولات ۱ پارچه (سطل و استند)
                 (fc === "all" || el.dataset.colors.split(" ").includes(fc));
      el.hidden = !ok;                        // مخفی کردن ستون کارت
      if (ok) n++;
    });
    setCovers();                              // عکس کارت‌ها را با فیلتر هماهنگ کن
    empty.hidden = n > 0;                     // پیام «محصولی یافت نشد»
    document.querySelectorAll("[data-filter]").forEach(b => {
      const cur = b.dataset.filter === "pieces" ? fp : fc;
      b.classList.toggle("active", b.dataset.value === cur);
    });
  }
  document.querySelectorAll("[data-filter]").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.filter === "pieces") fp = b.dataset.value; else fc = b.dataset.value;
    applyFilters();
  }));
  document.querySelectorAll("[data-reset]").forEach(b => b.addEventListener("click", () => { fp = fc = "all"; applyFilters(); }));
  applyFilters();

  /* ---------- مودال ---------- */
  const M = $("#productModal"), mImg = $("[data-m-img]", M), mMsg = $("[data-m-msg]", M);
  const mSub = $("[data-m-sub]", M), mPcs = $("[data-m-pieces]", M), mSw = $("[data-m-swatches]", M);
  $("[data-m-tel]", M).href = D.tel;          // دکمه‌ی مشاوره
 
  let cur, pcs, tok;                          // کارت، تعداد پارچه و رنگ انتخاب‌شده

  function render() {
    const vs = vars(cur, pcs);
    if (!vs.includes(tok)) tok = vs[0];
    // الگوی اسم عکس: کالکشن-رنگ-چاپ-تعدادپارچه.webp
    mImg.hidden = false; mMsg.hidden = true;
    mImg.src = D.imgDir + cur.dataset.base + "-" + tok + (pcs ? "-" + pcs : "") + ".webp";
    mImg.alt = cur.dataset.name + " - " + nm(tok);
    $("[data-m-title]", M).textContent = cur.dataset.name;
    mSub.textContent = (LABELS[pcs] ? LABELS[pcs] + " | " : "") + nm(tok);
    const ps = (cur.dataset.pieces || "").split(" ").filter(Boolean);
    mPcs.innerHTML = ps.length > 1 ? ps.map(p => `<button type="button" class="filter-chip ${p === pcs ? "active" : ""}" data-p="${p}">${fa(p)} پارچه</button>`).join("") : "";
    mSw.innerHTML = vs.map(t => `<button type="button" class="swatch ${t === tok ? "active" : ""}" data-t="${t}" title="${nm(t)}" aria-label="${nm(t)}" style="background:${sw(t)}"></button>`).join("");
  }
  mImg.addEventListener("error", () => { mImg.hidden = true; mMsg.hidden = false; });  // عکس موجود نیست
  mPcs.addEventListener("click", e => { const b = e.target.closest("[data-p]"); if (b) { pcs = b.dataset.p; render(); } });
  mSw.addEventListener("click", e => { const b = e.target.closest("[data-t]"); if (b) { tok = b.dataset.t; render(); } });

  // با باز شدن مودال: کارت را از دکمه‌ی بازکننده می‌گیریم و تعداد پارچه/رنگ فیلتر را از پیش انتخاب می‌کنیم
  M.addEventListener("show.bs.modal", e => {
    cur = e.relatedTarget.closest("[data-item]");
    const ps = (cur.dataset.pieces || "").split(" ");
    pcs = ps.includes(fp) ? fp : ps[0];
    tok = vars(cur, pcs).find(t => t.split("-")[0] === fc) || "";
    render();
  });

  /* ---------- بزرگ‌نمایی عکس با لایت‌باکس (استایل موجود در style.css) ---------- */
  const lb = $("#lightbox"), lbImg = $("img", lb);
  mImg.addEventListener("click", () => { lbImg.src = mImg.src; lb.showModal(); });
  lb.addEventListener("click", e => { if (e.target !== lbImg) lb.close(); });
})();
