const IMG_API = (typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? CONFIG.API_URL.replace('/api', '') : 'http://localhost:5000';

const imagesCache = {};

async function loadSiteImages() {
  try {
    const res = await fetch(`${IMG_API}/api/images`);
    const data = await res.json();
    data.forEach(img => { imagesCache[img.key] = img; });
    return data;
  } catch {
    return [];
  }
}

async function getSiteImageUrl(key) {
  if (imagesCache[key]) {
    return imagesCache[key].url || imagesCache[key].defaultUrl;
  }
  try {
    const res = await fetch(`${IMG_API}/api/images/${key}`);
    const data = await res.json();
    imagesCache[key] = data;
    return data.url || data.defaultUrl;
  } catch {
    return '';
  }
}

async function renderSiteImages() {
  await loadSiteImages();
  document.querySelectorAll('[data-site-image]').forEach(el => {
    const key = el.dataset.siteImage;
    const img = imagesCache[key];
    if (img) {
      el.src = img.url || img.defaultUrl;
      if (img.alt && !el.alt) el.alt = img.alt;
    }
  });
}

document.addEventListener('DOMContentLoaded', renderSiteImages);
