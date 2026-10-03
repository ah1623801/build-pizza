import { IMG, DOUGH, SAUCE, CHEESE, MEAT, VEG, EXTRAS } from './config';
import { escapeHtml } from './geometry';
import siteConfig from '@/config/site';
import { getLang, t, getLocalizedItemName, getLocalizedIngredient, getLocalizedCategoryName } from '@/lib/i18n';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

export let MENU_ITEMS = [
  { id: 'fire', cat: ['signature', 'spicy'], name: 'PEPPERONI FIRE || بيبروني فاير', price: 285, img: IMG.fire, ing: ['صلصة طماطم', 'موتزاريلا', 'بيبروني', 'هلابينو', 'زيت حار'], preset: { dough: 'classic', sauce: 'tomato', cheese: 'mozzarella', meats: { pepperoni: 'more' }, vegs: ['jalapeno'], extras: ['chili'] } },
  { id: 'truffle', cat: ['signature', 'vegetarian'], name: 'TRUFFLE MUSHROOM || ترافل مشروم', price: 320, img: IMG.pTruffle, ing: ['كريمة ترافل', 'موتزاريلا', 'مشروم', 'بارميزان'], preset: { dough: 'cheese', sauce: 'garlic', cheese: 'four', meats: {}, vegs: ['mushroom'], extras: ['truffle', 'extraCheese'] } },
  { id: 'bbq', cat: ['signature'], name: 'BBQ CHICKEN || تشيكن باربيكيو', price: 275, img: IMG.pBBQ, ing: ['صوص باربيكيو', 'موتزاريلا', 'دجاج مشوي', 'جبنة مدخنة', 'بصل مكرمل'], preset: { dough: 'classic', sauce: 'bbq', cheese: 'smoked', meats: { chicken: 'normal' }, vegs: ['onion'], extras: ['bbqDrizzle'] } },
  { id: 'green', cat: ['signature', 'vegetarian'], name: 'VEGGIE SUPREME || سوبريم خضار', price: 240, img: IMG.pGreen, ing: ['موتزاريلا', 'مشروم', 'زيتون كلاماتا', 'فلفل أخضر', 'ريحان'], preset: { dough: 'classic', sauce: 'tomato', cheese: 'mozzarella', meats: {}, vegs: ['mushroom', 'olives', 'greenPepper', 'basil'], extras: [] } },
  { id: 'marg', cat: ['classic', 'vegetarian'], name: 'MARGHERITA || مارجريتا', price: 190, img: IMG.pMarg, ing: ['صلصة طماطم', 'موتزاريلا', 'ريحان فريش', 'زيت زيتون'], preset: { dough: 'thin', sauce: 'tomato', cheese: 'mozzarella', meats: {}, vegs: ['basil'], extras: [] } },
  { id: 'original', cat: ['classic'], name: 'CLASSIC PEPPERONI || بيبروني كلاسيك', price: 230, img: IMG.pOriginal, ing: ['صلصة طماطم', 'موتزاريلا', 'دبل بيبروني'], preset: { dough: 'classic', sauce: 'tomato', cheese: 'extra', meats: { pepperoni: 'more' }, vegs: [], extras: [] } },
  { id: 'diablo', cat: ['spicy'], name: 'DIABLO SPICY || ديابلو حارة', price: 295, img: IMG.pOriginal, imgF: 'saturate(1.35) hue-rotate(-10deg) brightness(.95)', ing: ['صلصة حارة', 'لحم مفروم', 'هلابينو', 'شطة مجروشة'], preset: { dough: 'thin', sauce: 'spicy', cheese: 'mozzarella', meats: { beef: 'normal' }, vegs: ['jalapeno'], extras: ['chili'] } },
  { id: 'bread', cat: ['sides'], name: 'GARLIC BREAD || خبز بالثوم', price: 60, simple: true, ing: ['فرن حطب', 'ثوم بلدي', 'أعشاب إيطالية', 'زبدة'] },
  { id: 'cola', cat: ['drinks'], name: 'CRAFT COLA || كولا مثلجة', price: 35, simple: true, ing: ['ثلج منعش', 'سيرب كولا', 'ليمون'] },
  { id: 'lava', cat: ['desserts'], name: 'CHOCOLATE LAVA || مولتن لافا', price: 75, simple: true, ing: ['شوكولاتة ذائبة', 'ملح بحري', 'فانيليا'] }
];

export let CATS = ['signature', 'classic', 'spicy', 'vegetarian', 'sides', 'drinks', 'desserts'];
export let menuCat = 'signature';

export function resolvePizzaImage(it) {
  if (!it) return IMG.pOriginal;

  const PRESET_MAP = {
    fire: IMG.fire,
    'فاير': IMG.fire,
    'بيبروني فاير': IMG.fire,
    truffle: IMG.pTruffle,
    'ترافل': IMG.pTruffle,
    bbq: IMG.pBBQ,
    'باربيكيو': IMG.pBBQ,
    'باربكيو': IMG.pBBQ,
    'تشيكن': IMG.pBBQ,
    green: IMG.pGreen,
    'سوبريم': IMG.pGreen,
    'خضار': IMG.pGreen,
    marg: IMG.pMarg,
    margherita: IMG.pMarg,
    'مارجريتا': IMG.pMarg,
    original: IMG.pOriginal,
    'أوريجينال': IMG.pOriginal,
    'كلاسيك دبل': IMG.pOriginal,
    diablo: IMG.pOriginal,
    'ديابلو': IMG.pOriginal,
    bread: '/ico.webp',
    'خبز': '/ico.webp',
    cola: '/ico.webp',
    'كولا': '/ico.webp',
    lava: '/ico.webp',
    'لافا': '/ico.webp',
    'مولتن': '/ico.webp'
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

  return it.simple ? '/ico.webp' : (IMG.pOriginal || '/ico.webp');
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
      MENU_ITEMS = data.items.map(it => {
        const baseP = Number(it.price) || 0;
        return {
          id: it.item_id || 'item-' + it.id,
          cat: Array.isArray(it.categories) && it.categories.length > 0 ? it.categories : ['signature'],
          name: it.name || 'PIZZA',
          price: baseP,
          size_prices: it.size_prices || {
            small: Math.round(baseP * 0.85),
            med: baseP,
            large: Math.round(baseP * 1.25),
          },
          img: resolvePizzaImage(it),
          ing: Array.isArray(it.ingredients) ? it.ingredients : [],
          simple: !!it.is_simple,
          preset: it.preset || { dough: 'classic', sauce: 'tomato', cheese: 'mozzarella', meats: {}, vegs: [], extras: [] }
        };
      });
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
    const basePrice = Number(it.price) || 0;
    const btnText = escapeHtml(t('addToCart'));
    const currencyText = escapeHtml(t('currency'));

    const smallP = it.size_prices?.small || Math.round(basePrice * 0.85);
    const medP = it.size_prices?.med || basePrice;
    const largeP = it.size_prices?.large || Math.round(basePrice * 1.25);

    const sizesHtml = !it.simple
      ? '<div class="mcard-sizes">' +
        '<button type="button" class="msize-btn" data-sz="small" data-price="' + smallP + '" title="Small"><span>S</span></button>' +
        '<button type="button" class="msize-btn active" data-sz="med" data-price="' + medP + '" title="Medium"><span>M</span></button>' +
        '<button type="button" class="msize-btn" data-sz="large" data-price="' + largeP + '" title="Large"><span>L</span></button>' +
        '</div>'
      : '';

    return (
      '<article class="mcard' + (it.simple ? ' is-simple' : '') + '" data-id="' + safeId + '">' +
      (safeImg ? '<div class="mimg"><img loading="lazy" src="' + safeImg + '" style="' + (it.imgF ? 'filter:' + it.imgF : '') + '" alt="' + safeName + '" onerror="this.onerror=null;this.src=\'/ico.webp\';"></div>' : '<div class="mnum">0' + (n + 1) + '</div>') +
      '<span class="mcat">' + safeCat + '</span><h3>' + safeName + '</h3>' +
      '<ul class="mings">' + safeIngs + '</ul>' +
      sizesHtml +
      '<div class="mrow"><span class="mprice" data-p="' + medP + '">' + currencyText + ' ' + medP + '</span>' +
      '<button class="mbtn">' + btnText + '</button></div></article>'
    );
  }).join('');

  $$('#menuTrack .mcard').forEach(card => {
    const it = MENU_ITEMS.find(x => x.id === card.dataset.id);
    if (!it) return;

    let selectedSize = 'med';
    let selectedPrice = it.size_prices?.med || it.price;
    const priceEl = card.querySelector('.mprice');
    const currencyText = t('currency');

    card.querySelectorAll('.msize-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.querySelectorAll('.msize-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSize = btn.dataset.sz;
        selectedPrice = Number(btn.dataset.price) || it.price;
        if (priceEl) {
          priceEl.textContent = `${currencyText} ${selectedPrice}`;
          priceEl.setAttribute('data-p', selectedPrice);
          if (window.gsap) {
            window.gsap.fromTo(priceEl, { scale: 1.15, color: '#ff7a2e' }, { scale: 1, color: 'var(--gold)', duration: 0.3 });
          }
        }
      });
    });

    card.querySelector('.mbtn')?.addEventListener('click', () => {
      if (onAddToCart) {
        onAddToCart(it, selectedSize, selectedPrice);
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
  tabs.innerHTML = CATS.map(c => '<button data-c="' + c + '" data-cat="' + c + '" class="tab ' + (c === menuCat ? 'active on' : '') + '">' + escapeHtml(getLocalizedCategoryName(c, lang).toUpperCase()) + '</button>').join('');

  $$('#menuTabs button').forEach(b => {
    b.addEventListener('click', () => {
      menuCat = b.dataset.c || b.dataset.cat;
      $$('#menuTabs button').forEach(btn => {
        btn.classList.toggle('on', btn === b);
        btn.classList.toggle('active', btn === b);
      });
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

  const cForm = $('#cForm');
  if (!cForm) return;

  cForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#fName')?.value.trim();
    const email = $('#fEmail')?.value.trim();
    const phone = $('#fPhone')?.value.trim() || '';
    const message = $('#fMsg')?.value.trim();

    if (!name || !email || !message) {
      if (toast) toast('FILL NAME, EMAIL & MESSAGE');
      return;
    }

    const topic = $('#topics button.on')?.textContent?.trim() || 'GENERAL';
    const submitBtn = cForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : 'SEND MESSAGE';

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'SENDING...';
        submitBtn.style.opacity = '0.7';
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, topic, message })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        if ($('#fName')) $('#fName').value = '';
        if ($('#fPhone')) $('#fPhone').value = '';
        if ($('#fEmail')) $('#fEmail').value = '';
        if ($('#fMsg')) $('#fMsg').value = '';

        const cThanks = $('#cThanks');
        if (cThanks) {
          cForm.style.transition = 'opacity 0.4s ease';
          cForm.style.opacity = '0';
          cForm.style.pointerEvents = 'none';
          cThanks.style.display = 'flex';
          setTimeout(() => {
            cThanks.style.display = 'none';
            cForm.style.opacity = '1';
            cForm.style.pointerEvents = 'auto';
          }, 6000);
        }

        if (toast) toast('MESSAGE SENT TO DASHBOARD! ✉️🍕');
      } else {
        if (toast) toast(data.error || 'FAILED TO SEND MESSAGE, PLEASE TRY AGAIN');
      }
    } catch (err) {
      if (toast) toast('NETWORK ERROR, PLEASE TRY AGAIN');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        submitBtn.style.opacity = '';
      }
    }
  });
}
