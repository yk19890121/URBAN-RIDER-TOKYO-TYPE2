import fs from 'node:fs/promises';
import path from 'node:path';
import { collections } from '../src/collections.mjs';

const root = path.resolve(import.meta.dirname, '..');
const assets = JSON.parse(await fs.readFile(path.join(root, 'src/assets.json'), 'utf8'));
const products = JSON.parse(await fs.readFile(path.join(root, 'src/products.json'), 'utf8'));
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const arrow = '<span class="arrow" aria-hidden="true">&#8599;</span>';
const line = '<svg class="draw-line" viewBox="0 0 300 3" preserveAspectRatio="none" aria-hidden="true"><path d="M0 1.5H300" fill="none" stroke="currentColor" stroke-width="1" pathLength="1"/></svg>';
const price = value => `¥${value.toLocaleString('ja-JP')}`;
const collectionHref = (prefix, slug) => `${prefix}collections/${slug}/`;
const lookbookNote = '※掲載している着用イメージは、商品画像をもとに制作したイメージビジュアルです。実際の商品を着用して撮影したものではないため、色味・質感・サイズ感などが実物と異なる場合があります。';

function responsiveImage(src, prefix, alt, extra = '') {
  const small = src.replace('.webp', '-640.webp');
  return `<img src="${prefix}${src}" srcset="${prefix}${small} 640w, ${prefix}${src} 1400w" sizes="(max-width: 720px) 92vw, 68vw" alt="${esc(alt)}" decoding="async" ${extra}>`;
}

function renderLookbook(files, prefix, collection) {
  return `<section class="lookbook-section" aria-labelledby="lookbook-title"><header class="lookbook-heading"><h2 id="lookbook-title">LOOK BOOK</h2><p>着用イメージ</p><span class="micro">05 VISUALS / HORIZONTAL SCROLL</span></header><div class="lookbook-track" tabindex="0" role="group" aria-label="${esc(collection.name)}の着用イメージ（横スクロール）">${files.map((src, index) => `<button class="lookbook-item" type="button" data-lightbox="${prefix}${src}" data-caption="${esc(collection.short)} LOOK BOOK ${String(index + 1).padStart(2, '0')}" data-cursor="VIEW" aria-label="着用イメージ${index + 1}を拡大表示"><picture><source media="(max-width:720px)" srcset="${prefix}${src.replace('.webp', '-640.webp')}"><img src="${prefix}${src}" alt="${esc(collection.name)} 着用イメージ ${index + 1}" width="941" height="1672" loading="lazy" decoding="async"></picture><span>${String(index + 1).padStart(2, '0')}</span></button>`).join('')}</div><p class="lookbook-note">${lookbookNote}</p></section>`;
}

function slideshow(files, prefix, alt, priority = false) {
  const list = files.map(file => prefix + file);
  return `<div class="slideshow" data-slides="${esc(JSON.stringify(list))}">${responsiveImage(files[0], prefix, alt, `class="slide is-active" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'}`)}<img class="slide slide-next" alt="" aria-hidden="true" decoding="async"></div>`;
}

function menu(prefix, current = '') {
  return `<button class="menu-toggle" aria-label="コレクションメニューを開く" aria-expanded="false" aria-controls="collection-menu"><span></span><span></span><span class="menu-label">MENU</span></button>
  <dialog class="nav-dialog" id="collection-menu" aria-label="コレクションメニュー"><div class="nav-top"><a class="wordmark" href="${prefix}">URBAN RIDER TOKYO</a><button class="menu-close" aria-label="メニューを閉じる">CLOSE <span>×</span></button></div><div class="nav-layout"><div class="nav-intro"><span class="eyebrow">COLLECTION INDEX</span><p>好きな絵を選ぶ。<br>街へ出る。</p><a href="${prefix}" class="text-link">TOPへ戻る ${arrow}</a></div><nav aria-label="コレクション一覧">${collections.map(c => `<a href="${collectionHref(prefix, c.slug)}" ${current === c.slug ? 'aria-current="page"' : ''}><span class="index">${c.number}</span><span><strong class="nav-name">${c.slug === 'animal' ? 'ANIMAL DESIGN' : c.short}</strong><small class="nav-collection">COLLECTION</small></span>${arrow}</a>`).join('')}</nav></div><div class="nav-bottom micro"><span>GRAPHIC T-SHIRT SHOP</span><span>URBAN RIDER TOKYO</span></div></dialog>`;
}

function footer(prefix) {
  return `<footer class="site-footer"><div class="footer-brand"><a href="${prefix}" class="footer-wordmark">URBAN<br>RIDER TOKYO</a><span class="micro">TOKYO STREET CULTURE WEAR</span></div><p class="footer-message">いつもの毎日が、<br>少しだけ特別になる。</p><nav aria-label="フッターナビゲーション"><a href="${prefix}#collections">COLLECTIONS</a><a href="${prefix}#about">ABOUT</a><a href="https://suzuri.jp/URBAN_RIDER_TOKYO" target="_blank" rel="noopener noreferrer">ONLINE STORE ${arrow}</a></nav><div class="copyright micro"><span>© ${new Date().getFullYear()} URBAN RIDER TOKYO</span><a href="#top">BACK TO TOP ↑</a></div></footer>`;
}

function shell(content, { prefix = '', collection = null } = {}) {
  const title = collection ? `${collection.name} | URBAN RIDER TOKYO` : 'URBAN RIDER TOKYO | 都市を駆ける、自由な魂へ。';
  const description = collection ? collection.concept : '都市を駆ける、自由な魂へ。東京のバイク＆ストリートカルチャーを、毎日のグラフィックTシャツに。6つのコレクションから、自分らしい一枚を。';
  const bodyClass = collection ? `brand-page brand-${collection.slug}` : 'home-page';
  return `<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#c7c9cb"><meta name="description" content="${esc(description)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><title>${esc(title)}</title><link rel="icon" href="${prefix}favicon.svg" type="image/svg+xml"><script>(function(){try{var w=JSON.parse(sessionStorage.getItem('urt:wipe')||'null');sessionStorage.removeItem('urt:wipe');if(!w||Date.now()-w.t>2500)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var r=document.documentElement;r.style.setProperty('--wx',w.x+'px');r.style.setProperty('--wy',w.y+'px');r.classList.add('wipe-enter');}catch(e){}})();</script><link rel="preload" href="${prefix}fonts/BodoniModa-Variable.ttf" as="font" type="font/ttf" crossorigin><link rel="preload" href="${prefix}fonts/BebasNeue-Regular.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="${prefix}styles.css"><script type="module" src="${prefix}app.js"></script></head><body class="${bodyClass}" id="top"><a href="#main" class="skip-link">本文へスキップ</a>${content}<dialog class="lightbox" aria-label="画像の拡大表示"><button class="lightbox-close" aria-label="拡大表示を閉じる">CLOSE ×</button><div class="lightbox-content"><img class="lightbox-image" alt=""><div class="lightbox-caption"><p></p><a class="purchase-link" target="_blank" rel="noopener noreferrer">購入する ${arrow}</a></div></div></dialog><div class="custom-cursor" aria-hidden="true"><span></span></div><div class="fx-layer" aria-hidden="true"></div></body></html>`;
}

function topCollection(slug, size = '') {
  const c = collections.find(item => item.slug === slug);
  return `<a class="collection-entry collection-${slug} ${size}" href="${collectionHref('', slug)}" data-nav-reveal data-cursor="OPEN"><div class="entry-copy"><span class="index">${c.number}</span><h2>${c.name}</h2><span class="short-rule"></span><p>${c.tagline}</p><span class="micro">${c.galleryText[0]}</span></div><div class="collection-art">${slideshow(assets[slug].top, '', `${c.name} キービジュアル`, slug === 'bike')}<span class="image-note">COLLECTION ${arrow}</span></div>${line}</a>`;
}

function home() {
  return shell(`<div class="page-frame home-frame"><header class="home-masthead"><div class="mast-meta micro">FASHION<br>ART<br>ILLUSTRATION<br>CULTURE<br>TOKYO</div><h1><span>URBAN RIDER</span><span>TOKYO</span></h1><p class="mast-note">好きな場所へ<br>好きなスタイルで<br>生きていく。</p><div class="mast-copy"><strong>都市を駆ける、自由な魂へ。</strong><span class="micro">FOR THOSE WHO RIDE THROUGH THE CITY WITH A FREE SOUL.</span></div><p class="mast-purpose">6つのコレクションから選ぶ<br><strong>GRAPHIC T-SHIRT SHOP</strong></p>${menu('')}</header><main id="main"><section id="collections" class="collection-index" aria-label="6つのコレクション"><div class="collection-columns"><div class="collection-left">${topCollection('bike', 'entry-tall')}${topCollection('gakusei', 'entry-tall')}</div><div class="collection-right">${topCollection('animal', 'entry-compact')}${topCollection('army', 'entry-compact')}${topCollection('dokuro', 'entry-compact')}</div></div><a class="brand-band" href="collections/brand/" data-cursor="OPEN"><span class="index">06</span><div class="brand-band-label"><strong>BRAND<br>COLLECTION</strong><p>すべての、<br>ライダーたちへ。</p></div><div class="brand-band-type">URBAN RIDER<br><span>TOKYO</span></div><div class="brand-band-copy"><strong>都市を駆ける、<br>自由な魂へ。</strong><span class="micro">TOKYO PEOPLE<br>STREET FASHION<br>ART FOREVER</span></div></a></section><section class="about-urt" id="about"><h2>着る。走る。<br>自分らしく、生きる。</h2><p>東京という街のエネルギーと、自由を愛するライダーのスピリット。バイクに乗る日も、街を歩く日も、好きな一枚から、いつもと少し違う一日へ。</p><a class="text-link" href="https://suzuri.jp/URBAN_RIDER_TOKYO" target="_blank" rel="noopener noreferrer">ONLINE STORE ${arrow}</a></section></main>${footer('')}</div>`);
}

function productName(product, collection) {
  if (/^\d+$/.test(product.number)) return `${collection.short} TEE ${product.number}`;
  return product.number.replace('dokuro_', 'DOKURO ').replaceAll('_', ' / ');
}

function productCard(product, collection, prefix, index) {
  const name = productName(product, collection);
  const seq = String(index + 1).padStart(2, '0');
  return `<article class="product-card" data-product-id="${product.id}" data-product-index="${index}"><button class="product-image torn-reveal" data-lightbox="${prefix}${product.image}" data-caption="${esc(name)} / ${price(product.price)}（税込）" data-url="${esc(product.url)}" data-cursor="ZOOM" aria-label="${esc(name)}の画像を拡大">${responsiveImage(product.image, prefix, name, 'loading="lazy"')}<span class="zoom-mark" aria-hidden="true">＋</span></button><div class="product-info"><span class="product-seq">${seq}</span><div><h3>${esc(name)}</h3><p class="product-price">${price(product.price)} <small>税込</small></p><a class="purchase-link" href="${esc(product.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)}を購入する（SUZURI・新しいタブ）">購入する ${arrow}</a></div></div></article>`;
}

function brand(collection) {
  const prefix = '../../';
  const collectionAssets = assets[collection.slug];
  let collectionProducts = products.filter(product => product.brand === collection.slug);
  if (collection.slug === 'brand') collectionProducts = [...collectionProducts.filter(product => product.name.includes('_Tシャツ')), ...collectionProducts.filter(product => !product.name.includes('_Tシャツ'))];
  const isBrand = collection.slug === 'brand';
  const heroImages = collectionAssets.hero;
  const galleryImages = collectionAssets.gallery || [];
  for (let index = 0; index < galleryImages.length; index += 1) {
    collection.captions[index] ||= `${collection.short} GALLERY ${String(index + 1).padStart(2, '0')}`;
    collection.galleryText[index] ||= `${index + 1} / ${galleryImages.length}`;
  }
  return shell(`<div class="page-frame brand-frame"><header class="brand-header"><a href="${prefix}" class="brand-logo"><span class="wordmark">URBAN RIDER TOKYO</span><span class="micro">GRAPHIC T-SHIRT SHOP</span></a><nav class="header-links" aria-label="ページ内ナビゲーション"><a href="${prefix}">HOME</a><a href="#gallery">COLLECTION</a><a href="#concept">CONCEPT</a><a href="#products">ONLINE STORE</a></nav>${menu(prefix, collection.slug)}</header><main id="main"><section class="brand-hero" aria-label="${esc(collection.name)}"><div class="hero-index"><p class="hero-tagline">${collection.tagline}</p><span class="short-rule"></span><span class="micro">${collection.short}<br>COLLECTION<br>NO. ${collection.number}</span><strong class="hero-number">${collection.number}</strong><h1>${collection.name}</h1><span class="micro hero-season">TOKYO / ALL SEASONS<br>${new Date().getFullYear()}</span></div><div class="hero-visual ${isBrand ? 'identity-visual' : ''}">${slideshow(heroImages, prefix, `${collection.name} キービジュアル`, true)}<div class="hero-image-meta"><span class="micro">${collection.short} COLLECTION</span><button class="motion-toggle" aria-label="画像の切替を一時停止" aria-pressed="false">Ⅱ</button><span class="slide-count micro">01 / ${String(heroImages.length).padStart(2, '0')}</span></div></div><aside class="hero-side"><p>${collection.captions[0]}<br>${collection.captions[1]}</p><span class="side-rule"></span><span class="micro">SAME CITY.<br>NEW VIEW.<br>DIFFERENT ROADS.</span></aside></section><section class="concept-band" id="concept"><div class="concept-label"><span class="micro">CONCEPT</span><span class="concept-line"></span></div><div><h2>${collection.heading}</h2><p>${collection.concept}</p></div><div class="concept-aside"><span class="micro">${collection.english}</span><p>${collection.tagline}</p></div></section><section class="editorial-gallery" id="gallery" aria-label="${collection.short} アートギャラリー">${galleryImages.map((src, index) => `<figure class="gallery-item"><button class="gallery-image" data-lightbox="${prefix}${src}" data-caption="${esc(collection.captions[index])}" data-expand-gallery data-cursor="VIEW" aria-label="${esc(collection.captions[index])}の画像を拡大">${responsiveImage(src, prefix, collection.captions[index], 'loading="lazy"')}<span class="zoom-mark" aria-hidden="true">＋</span></button><figcaption><h3>${collection.captions[index]}</h3><span class="micro">${collection.galleryText[index]}</span></figcaption></figure>`).join('')}</section><section class="product-section" id="products"><div class="section-heading"><h2>COLLECTION</h2><span class="section-line"></span><p>好きなものを着て、どこへでも。</p><span class="micro">${String(collectionProducts.length).padStart(2, '0')} ITEMS</span></div><div class="product-grid">${collectionProducts.map((product, index) => productCard(product, collection, prefix, index)).join('')}</div>${collectionProducts.length > 6 ? `<div class="load-more-wrap"><p class="product-progress micro" aria-live="polite">${collectionProducts.length} ITEMS</p><button class="load-more purchase-link" hidden>もっと見る <span>＋</span></button></div>` : ''}<p class="shop-note">購入・サイズ選択はSUZURIの商品ページで。表示価格は税込です。</p></section>${renderLookbook(assets.lookbook[collection.slug], prefix, collection)}<section class="next-collection"><span class="micro">NEXT COLLECTION</span><a href="${collectionHref(prefix, collections[(collections.indexOf(collection) + 1) % 6].slug)}"><span class="next-name">${collections[(collections.indexOf(collection) + 1) % 6].name}</span>${arrow}</a></section></main>${footer(prefix)}</div>`, { prefix, collection });
}

await fs.mkdir(path.join(root, 'dist'), { recursive: true });
await fs.cp(path.join(root, 'public'), path.join(root, 'dist'), { recursive: true });
await fs.writeFile(path.join(root, 'dist/index.html'), home());
for (const collection of collections) {
  const folder = path.join(root, 'dist/collections', collection.slug);
  await fs.mkdir(folder, { recursive: true });
  let html = brand(collection);
  if (collection.slug === 'brand') html = html.replace('<a href="#gallery">COLLECTION</a>', '').replace(/<section class="editorial-gallery"[^>]*><\/section>/, '');
  await fs.writeFile(path.join(folder, 'index.html'), html);
}
await fs.writeFile(path.join(root, 'dist/404.html'), '<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ページが見つかりません | URBAN RIDER TOKYO</title><body style="font-family:sans-serif;padding:10vw;background:#c7c9cb;color:#171717"><h1>PAGE NOT FOUND</h1><p>お探しのページは見つかりませんでした。</p><a href="javascript:history.back()">前のページへ戻る</a></body></html>');
console.log(`Built 7 pages / ${products.length} products. Output: dist/`);
