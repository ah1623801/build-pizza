import { IMG, DOUGH, SAUCE, CHEESE, MEAT, VEG, EXTRAS } from './config';
import { escapeHtml } from './geometry';
import siteConfig from '@/config/site';
import { getLang, t, getLocalizedItemName, getLocalizedIngredient, getLocalizedCategoryName } from '@/lib/i18n';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

export let MENU_ITEMS = [
  { id: 'fire', cat: ['signature', 'spicy'], name: 'THE FIRE', price: 285, img: IMG.fire, ing: ['Tomato', 'Mozzarella', 'Pepperoni', 'Jalapeño', 'Chili Oil'], preset: { dough: 'classic', sauce: 'tomato', cheese: 'mozzarella', meats: { pepperoni: 'more' }, vegs: ['jalapeno'], extras: ['chili'] } },
  { id: 'truffle', cat: ['signature', 'vegetarian'], name: 'THE TRUFFLE', price: 320, img: IMG.pTruffle, ing: ['Truffle Cream', 'Mozzarella', 'Mushroom', 'Parmesan'], preset: { dough: 'cheese', sauce: 'garlic', cheese: 'four', meats: {}, vegs: ['mushroom'], extras: ['truffle', 'extraCheese'] } },
  { id: 'bbq', cat: ['signature'], name: 'THE BBQ', price: 275, img: IMG.pBBQ, ing: ['BBQ', 'Mozzarella', 'Chicken', 'Smoked Cheese', 'Onion'], preset: { dough: 'classic', sauce: 'bbq', cheese: 'smoked', meats: { chicken: 'normal' }, vegs: ['onion'], extras: ['bbqDrizzle'] } },
  { id: 'green', cat: ['signature', 'vegetarian'], name: 'THE GREEN', price: 240, img: IMG.pGreen, ing: ['Mozzarella', 'Mushroom', 'Olives', 'Green Pepper', 'Basil'], preset: { dough: 'classic', sauce: 'tomato', cheese: 'mozzarella', meats: {}, vegs: ['mushroom', 'olives', 'greenPepper', 'basil'], extras: [] } },
  { id: 'marg', cat: ['classic', 'vegetarian'], name: 'MARGHERITA', price: 190, img: IMG.pMarg, ing: ['Tomato', 'Mozzarella', 'Basil', 'Olive Oil'], preset: { dough: 'thin', sauce: 'tomato', cheese: 'mozzarella', meats: {}, vegs: ['basil'], extras: [] } },
  { id: 'original', cat: ['classic'], name: 'THE ORIGINAL', price: 230, img: IMG.pOriginal, ing: ['Tomato', 'Mozzarella', 'Double Pepperoni'], preset: { dough: 'classic', sauce: 'tomato', cheese: 'extra', meats: { pepperoni: 'more' }, vegs: [], extras: [] } },
  { id: 'diablo', cat: ['spicy'], name: 'DIABLO', price: 295, img: IMG.pOriginal, imgF: 'saturate(1.35) hue-rotate(-10deg) brightness(.95)', ing: ['Spicy Tomato', 'Beef', 'Jalapeño', 'Chili Flakes'], preset: { dough: 'thin', sauce: 'spicy', cheese: 'mozzarella', meats: { beef: 'normal' }, vegs: ['jalapeno'], extras: ['chili'] } },
  { id: 'bread', cat: ['sides'], name: 'GARLIC BUTTER BREAD', price: 60, simple: true, ing: ['Wood-Oven', 'Garlic', 'Herbs', 'Butter'] },
  { id: 'cola', cat: ['drinks'], name: 'CRAFT COLA', price: 35, simple: true, ing: ['Ice Cold', 'House Syrup', 'Citrus'] },
  { id: 'lava', cat: ['desserts'], name: 'CHOCOLATE LAVA', price: 75, simple: true, ing: ['Molten Center', 'Sea Salt', 'Vanilla'] }
];

export let CATS = ['signature', 'classic', 'spicy', 'vegetarian', 'sides', 'drinks', 'desserts'];
export let menuCat = 'signature';

export function resolvePizzaImage(it) {
  if (!it) return IMG.pOriginal;

  const PRESET_MAP = {
    fire: IMG.fire,
    truffle: IMG.pTruffle,
    bbq: IMG.pBBQ,
    green: IMG.pGreen,
    marg: IMG.pMarg,
    margherita: IMG.pMarg,
    original: IMG.pOriginal,
    diablo: IMG.pOriginal,
    bread: IMG.table,
    cola: IMG.table,
    lava: IMG.table
  };

  const id = String(it.item_id || it.id || '').toLowerCase().trim();
  const name = String(it.name || '').toLowerCase().trim();

  // فحص التطابق مع كروت البيتزا الأساسية لضمان ظهور صورها الفخمة دائماً
  for (const [key, path] of Object.entries(PRESET_MAP)) {
    if (id === key || id.includes(key) || name.includes(key)) {
      return path;
    }
  }

  let img = it.image_url || it.img;
  if (typeof img === 'string') {
    img = img.trim();
    if (img && img !== 'null' && img !== 'undefined' && img !== '') {
      if (img.startsWith('images/')) return '/' + img;
      return img;
    }
  }

  return IMG.pOriginal;
}

export async function syncMenuFromServer() {
  try {
    const ingRes = await fetch('/api/ingredients');
    if (ingRes.ok) {
      const ingData = await ingRes.json();
      const applyPrices = (list, remote) => {
        if (!remote) return;
        list.forEach(item => {
          if (remote[item.id] !== undefined) {
            item.prices = typeof remote[item.id] === 'object'
              ? remote[item.id]
              : { small: remote[item.id], med: remote[item.id], large: remote[item.id] };
          }
        });
      };
      applyPrices(DOUGH, ingData.dough);
      applyPrices(SAUCE, ingData.sauce);
      applyPrices(CHEESE, ingData.cheese);
      applyPrices(MEAT, ingData.meat);
      applyPrices(VEG, ingData.veg);
      applyPrices(EXTRAS, ingData.extras);
    }

    const res = await fetch('/api/menu');
    if (!res.ok) return;
    const data = await res.json();

    if (data.categories && data.categories.length > 0) {
      CATS = data.categories.map(c => c.id);
      if (!CATS.includes(menuCat)) menuCat = CATS[0];
    }

    if (data.items && data.items.length > 0) {
      MENU_ITEMS = data.items.map(it => ({
        id: it.item_id || 'item-' + it.id,
        cat: Array.isArray(it.categories) && it.categories.length > 0 ? it.categories : ['signature'],
        name: it.name || 'PIZZA',
        price: Number(it.price) || 0,
        img: resolvePizzaImage(it),
        ing: Array.isArray(it.ingredients) ? it.ingredients : [],
        simple: !!it.is_simple,
        preset: it.preset || { dough: 'classic', sauce: 'tomato', cheese: 'mozzarella', meats: {}, vegs: [], extras: [] }
      }));
    }
  } catch (err) {
    console.warn('Sync fallback:', err);
  }
}

export function renderMenu({ onAddToCart } = {}) {
  const gsap = window.gsap;
  const lang = getLang();
  const items = MENU_ITEMS.filter(i => Array.isArray(i.cat) && i.cat.includes(menuCat));
  const track = $('#menuTrack');
  if (!track) return;

  if (items.length === 0) {
    track.innerHTML = '<div style="padding: 40px 6vw; color: var(--mut); font-size: 14px; letter-spacing: 2px;">' + t('noProducts') + '</div>';
    return;
  }

  track.innerHTML = items.map((it, n) => {
    const safeId = escapeHtml(it.id);
    const resolvedImg = resolvePizzaImage(it);
    const safeImg = escapeHtml(resolvedImg || IMG.fire);
    const localizedName = getLocalizedItemName(it.name, lang);
    const safeName = escapeHtml(localizedName);
    const safeCat = escapeHtml(getLocalizedCategoryName(it.cat[0] || 'FORNO', lang).toUpperCase());
    const safeIngs = (it.ing || []).map(x => '<li>' + escapeHtml(getLocalizedIngredient(x, lang)) + '</li>').join('');
    const safePrice = Number(it.price) || 0;
    const btnText = escapeHtml(t('addToCart'));
    const currencyText = escapeHtml(t('currency'));

    return (
      '<article class="mcard" data-id="' + safeId + '">' +
      (safeImg ? '<div class="mimg"><img loading="lazy" src="' + safeImg + '" style="' + (it.imgF ? 'filter:' + it.imgF : '') + '" alt="' + safeName + '" onerror="this.onerror=null;this.src=\'/images/fire.webp\';"></div>' : '<div class="mnum">0' + (n + 1) + '</div>') +
      '<span class="mcat">' + safeCat + '</span><h3>' + safeName + '</h3>' +
      '<ul class="mings">' + safeIngs + '</ul>' +
      '<div class="mrow"><span class="mprice" data-p="' + safePrice + '">' + currencyText + ' ' + safePrice + '</span>' +
      '<button class="mbtn">' + btnText + '</button></div></article>'
    );
  }).join('');

  $$('#menuTrack .mcard').forEach(card => {
    const it = MENU_ITEMS.find(x => x.id === card.dataset.id);
    if (!it) return;
    card.querySelector('.mbtn')?.addEventListener('click', () => {
      if (onAddToCart) {
        onAddToCart(it);
      }
    });
  });

  if (gsap) {
    const mv = track?.closest('.menu-view');
    if (mv && window.innerWidth <= 980) mv.scrollLeft = 0;
    gsap.fromTo('#menuTrack .mcard', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' });
  }

  const tabs = $('#menuTabs');
  const currentScroll = tabs ? tabs.scrollLeft : 0;

  if (window.ScrollTrigger) window.ScrollTrigger.refresh();

  if (tabs) {
    tabs.scrollLeft = currentScroll;
  }
}

export function buildTabs(callbacks = {}) {
  const tabs = $('#menuTabs');
  if (!tabs) return;
  tabs.setAttribute('data-lenis-prevent', 'true');

  const lang = getLang();
  tabs.innerHTML = CATS.map(c => '<button data-c="' + c + '" class="' + (c === menuCat ? 'on' : '') + '">' + escapeHtml(getLocalizedCategoryName(c, lang).toUpperCase()) + '</button>').join('');

  $$('#menuTabs button').forEach(b => {
    b.addEventListener('click', () => {
      menuCat = b.dataset.c;
      $$('#menuTabs button').forEach(btn => btn.classList.toggle('on', btn === b));
      renderMenu(callbacks);
    });
  });
}

export function setupContactForm({ toast } = {}) {
  $$('#topics button').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#topics button').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
    });
  });

  $('#cForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#fName')?.value.trim();
    const email = $('#fEmail')?.value.trim();
    const phone = $('#fPhone')?.value.trim() || 'NOT PROVIDED';
    const message = $('#fMsg')?.value.trim();

    if (!name || !email || !message) {
      if (toast) toast('FILL NAME, EMAIL & MESSAGE');
      return;
    }

    const topic = $('#topics button.on')?.textContent?.trim() || 'GENERAL';

    try {
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, topic, message })
      }).catch(() => {});
    } catch (_) {}

    const targetWhatsAppNumber = siteConfig.contact.whatsappNumber || '201001234567';
    const formattedMsg =
      `🍕 *رسالة جديدة من موقع FORNO*\n\n` +
      `👤 *الاسم:* ${name}\n` +
      `📞 *الهاتف:* ${phone}\n` +
      `📧 *الإيميل:* ${email}\n` +
      `🏷️ *القسم:* ${topic}\n` +
      `💬 *الرسالة:*\n${message}`;

    const waUrl = `https://wa.me/${targetWhatsAppNumber}?text=${encodeURIComponent(formattedMsg)}`;
    window.open(waUrl, '_blank');

    if ($('#fName')) $('#fName').value = '';
    if ($('#fPhone')) $('#fPhone').value = '';
    if ($('#fEmail')) $('#fEmail').value = '';
    if ($('#fMsg')) $('#fMsg').value = '';

    const cForm = $('#cForm');
    const cThanks = $('#cThanks');
    if (cForm && cThanks) {
      cForm.style.transition = 'opacity 0.4s ease';
      cForm.style.opacity = '0';
      cForm.style.pointerEvents = 'none';
      cThanks.style.display = 'flex';
      setTimeout(() => {
        cThanks.style.display = 'none';
        cForm.style.opacity = '1';
        cForm.style.pointerEvents = 'auto';
      }, 5000);
    }

    if (toast) toast('MESSAGE SENT & OPENING WHATSAPP... 💬🍕');
  });
}
