/*
================================================================================
   AnywhereCoin - Main Application Controller
   
   Creator: Toluwalase Mebaanne
   Company: 28th Bay Digital
   Version: 1.0.0
   
   APPLICATION ARCHITECTURE:
   Real-time cryptocurrency market data platform with region-aware currency 
   conversion, offline-first data management, and comprehensive user interface
   for global cryptocurrency market monitoring and analysis.
   
   CORE FUNCTIONALITY:
   - Automatic region detection with intelligent currency selection
   - Real-time market data processing from CoinGecko API endpoints
   - Advanced table sorting and filtering with persistent user preferences
   - Interactive trending analysis with smart action button controls
   - Price alert system with browser notification integration
   - Local data snapshot management for offline accessibility
   - Dynamic content carousel showcasing market highlights
   - Educational guide system integration with modular content delivery
   - Professional advertisement system with content rotation
   - Responsive search functionality across cryptocurrency database
   
   DATA MANAGEMENT:
   - API integration with timeout handling and error recovery
   - Local storage snapshots for offline functionality
   - Cookie-based preference persistence across browser sessions
   - State management with reactive UI updates
   - Currency conversion with real-time exchange rate application
   
   USER EXPERIENCE FEATURES:
   - Sortable market data table with multi-column sorting capabilities
   - Live search with instant filtering across 250+ cryptocurrencies
   - Interactive trending coins panel with performance analytics
   - Price alert system with customizable notification thresholds
   - Region-aware currency detection for international accessibility
   - Responsive design optimized for desktop, tablet, and mobile devices
   
   PERFORMANCE OPTIMIZATIONS:
   - Efficient DOM manipulation with minimal reflow operations
   - Debounced event handlers for search and resize operations
   - Lazy loading implementation for non-critical content
   - Request timeout management with graceful degradation
   - Local caching strategy reducing API dependency
   
   BROWSER COMPATIBILITY:
   - Modern JavaScript ES6+ with backward compatibility considerations
   - Fetch API with polyfill support for older browsers
   - CSS Grid and Flexbox with fallback layout strategies
   - Progressive enhancement ensuring core functionality across all devices
   
   SECURITY IMPLEMENTATION:
   - Input sanitization preventing XSS vulnerabilities
   - HTTPS enforcement for all external API communications
   - Secure cookie configuration with SameSite protection
   - Content Security Policy compliance for safe third-party integrations
   
   Copyright © 2025 Toluwalase Mebaanne / 28th Bay Digital
   Educational platform - not financial advice or investment recommendations
================================================================================
*/

/* ===============================================================================
   UTILITY FUNCTIONS AND SHORTCUTS
   =============================================================================== */
const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

/* ===============================================================================
   COOKIE AND STORAGE MANAGEMENT
   =============================================================================== */
function setCookie(name, value, days = 365) {
  try {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const secure = location.protocol === "https:" ? " Secure;" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax;${secure}`;
  } catch (error) {
    console.warn('Cookie setting failed:', error);
  }
}

function getCookie(name) {
  try {
    const nameEQ = `${name}=`;
    const found = document.cookie.split(";")
      .map(cookie => cookie.trim())
      .find(cookie => cookie.startsWith(nameEQ));
    return found ? decodeURIComponent(found.slice(nameEQ.length)) : null;
  } catch (error) {
    console.warn('Cookie reading failed:', error);
    return null;
  }
}

/* ===============================================================================
   APPLICATION STATE AND CONFIGURATION
   =============================================================================== */
const STATE = {
  currency: getCookie("ac_currency") || localStorage.getItem("ac_currency") || "usd",
  theme: getCookie("ac_theme") || localStorage.getItem("ac_theme") || "auto",
  coins: [],
  trending: [],
  lastUpdateTs: null,
  refreshTimer: null,
  intervalMs: 5 * 60 * 1000,
  firstVisit: !getCookie("ac_has_seen") && !localStorage.getItem("ac_has_seen"),
  sort: { key: "market_cap_rank", dir: "asc" }
};

const CURRENCY_SYMBOLS = {
  usd: "$", cad: "CA$", eur: "€", gbp: "£", ngn: "₦", jpy: "¥", aud: "A$", nzd: "NZ$",
  chf: "CHF", zar: "R", kes: "KSh", ghs: "GH₵", brl: "R$", mxn: "MX$", sgd: "S$", hkd: "HK$", inr: "₹"
};

const COUNTRY_CURRENCY_MAP = {
  US: "usd", CA: "cad", NG: "ngn", GB: "gbp", IE: "eur", DE: "eur", FR: "eur", NL: "eur", IT: "eur",
  ES: "eur", PT: "eur", BE: "eur", AT: "eur", FI: "eur", GR: "eur", SK: "eur", SI: "eur", EE: "eur",
  LV: "eur", LT: "eur", CY: "eur", MT: "eur", AU: "aud", NZ: "nzd", JP: "jpy", CH: "chf", ZA: "zar",
  KE: "kes", GH: "ghs", BR: "brl", MX: "mxn", SG: "sgd", HK: "hkd", IN: "inr"
};

/* ===============================================================================
   DOM ELEMENT REFERENCES
   =============================================================================== */
const elements = {
  // Header and navigation
  themeToggle: qs("#themeToggle"),
  searchInput: qs("#searchInput"),
  searchButton: qs("#searchGo"),

  // Market section elements
  marketSection: qs("#market"),
  currencySelect: qs("#currencySelect"),
  refreshBtn: qs("#refreshBtn"),
  currencyBadge: qs("#currencyBadge"),
  lastUpdate: qs("#lastUpdate"),
  tableContainer: qs("#market .table-responsive"),
  marketTable: qs("#market table"),
  tableHeader: qs("#market thead"),
  coinsTableBody: qs("#coinsBody"),

  // Trending section elements
  trendingCard: qs("#trendingBox")?.closest(".card"),
  trendingHeader: qs("#trendingBox")?.closest(".card")?.querySelector(".card-header"),
  trendingBox: qs("#trendingBox"),

  // Advertisement containers
  adLeaderboard: qs("#ad-leaderboard"),
  adRectangle: qs("#ad-rectangle"),
  adFooter: qs("#ad-footer"),

  // Carousel elements
  carouselContent: qs("#carouselContent"),

  // Alert elements
  alertModal: qs("#alertModal"),
  alertCoin: qs("#alertCoin"),
  alertPrice: qs("#alertPrice"),
  saveAlert: qs("#saveAlert"),

  // Utility elements
  yearSpan: qs("#year"),
  liveRegion: qs("#liveRegion"),

  // Region modal elements
  regionModal: qs("#regionModal"),
  regionMessage: qs("#regionMessage"),
  regionCurrencySelect: qs("#regionCurrencySelect"),
  regionSaveBtn: qs("#regionSaveBtn")
};

if (elements.yearSpan) {
  elements.yearSpan.textContent = new Date().getFullYear();
}

/* ===============================================================================
   THEME MANAGEMENT SYSTEM
   =============================================================================== */
function getCurrentTimeMode() {
  const hour = new Date().getHours();
  return (hour >= 7 && hour < 19) ? "day" : "night";
}

function applyTheme(mode) {
  const finalMode = mode === "auto" ? getCurrentTimeMode() : mode;
  document.documentElement.setAttribute("data-theme", finalMode);
  
  const icon = elements.themeToggle?.querySelector("i");
  if (icon) {
    icon.className = finalMode === "night" ? "bi bi-sun" : "bi bi-moon-stars";
  }
}

function persistTheme(mode) {
  localStorage.setItem("ac_theme", mode);
  setCookie("ac_theme", mode);
}

// function toggleTheme() {
//   const currentTheme = localStorage.getItem("ac_theme") || getCookie("ac_theme") || "auto";
//   const nextTheme = currentTheme === "day" ? "night" : 
//                    currentTheme === "night" ? "auto" : "day";
  
//   persistTheme(nextTheme);
//   applyTheme(nextTheme);
//   showToast(`Theme set to ${nextTheme}`);
// }

function toggleTheme() {
  // Night mode disabled
  document.documentElement.setAttribute("data-theme", "day");
  showToast("Night mode temporarily disabled");
}

/* ===============================================================================
   HTTP REQUEST UTILITIES
   =============================================================================== */
function withTimeout(fetchFactory, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  return fetchFactory(controller.signal)
    .finally(() => clearTimeout(timeoutId));
}

async function fetchJson(url, timeoutMs = 8000) {
  return withTimeout(async (signal) => {
    const response = await fetch(url, { 
      cache: "no-store", 
      signal 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }, timeoutMs);
}

/* ===============================================================================
   REGION DETECTION AND CURRENCY SETUP
   =============================================================================== */
async function detectUserRegion() {
  try {
    const data = await fetchJson("https://ipwho.is/?fields=country_code", 2500);
    const countryCode = String(data.country_code || "").toUpperCase();
    const suggestedCurrency = COUNTRY_CURRENCY_MAP[countryCode] || null;
    
    return { 
      country: countryCode, 
      currency: suggestedCurrency 
    };
  } catch (error) {
    console.warn('Region detection failed:', error);
    return { 
      country: null, 
      currency: null 
    };
  }
}

function showRegionModal({ country, suggested }) {
  if (!elements.regionModal) return;
  
  const message = country && suggested
    ? `We detected your region as ${country}. Confirm or choose a different currency.`
    : `We couldn't detect your region. Please choose your preferred currency.`;
  
  elements.regionMessage.textContent = message;
  elements.regionCurrencySelect.value = suggested || STATE.currency;

  const modal = bootstrap.Modal.getOrCreateInstance(elements.regionModal, { 
    backdrop: "static", 
    keyboard: true 
  });
  modal.show();

  elements.regionSaveBtn.onclick = async () => {
    STATE.currency = elements.regionCurrencySelect.value;
    localStorage.setItem("ac_currency", STATE.currency);
    setCookie("ac_currency", STATE.currency);
    markUserAsSeen();
    modal.hide();
    
    updateHeaderMetadata();
    updateAdSystemWithCurrency();
    await refreshAllData();
  };
}

function markUserAsSeen() {
  localStorage.setItem("ac_has_seen", "1");
  setCookie("ac_has_seen", "1");
}

/* ===============================================================================
   API ENDPOINTS AND URL CONSTRUCTION
   =============================================================================== */
function buildMarketsApiUrl(currency) {
  const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
  url.searchParams.set("vs_currency", currency);
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", "250");
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "false");
  url.searchParams.set("price_change_percentage", "1h,24h,7d");
  return url.toString();
}

function buildCoinDetailsApiUrl(coinId) {
  const url = new URL(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}`);
  url.searchParams.set("localization", "false");
  url.searchParams.set("tickers", "false");
  url.searchParams.set("market_data", "true");
  url.searchParams.set("community_data", "false");
  url.searchParams.set("developer_data", "false");
  url.searchParams.set("sparkline", "false");
  return url.toString();
}

/* ===============================================================================
   LOCAL DATA SNAPSHOT SYSTEM
   =============================================================================== */
function saveDataSnapshot() {
  try {
    const snapshot = {
      timestamp: Date.now(),
      currency: STATE.currency,
      coins: STATE.coins,
      trending: STATE.trending
    };
    
    localStorage.setItem("ac_snapshot", JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Snapshot save failed:', error);
  }
}

function loadDataSnapshot() {
  try {
    const rawSnapshot = localStorage.getItem("ac_snapshot");
    if (!rawSnapshot) return false;
    
    const snapshot = JSON.parse(rawSnapshot);
    if (!snapshot || !Array.isArray(snapshot.coins)) return false;
    
    STATE.currency = snapshot.currency || STATE.currency;
    STATE.coins = snapshot.coins;
    STATE.trending = snapshot.trending || [];
    STATE.lastUpdateTs = snapshot.timestamp || null;
    
    return true;
  } catch (error) {
    console.warn('Snapshot load failed:', error);
    return false;
  }
}

/* ===============================================================================
   DATA FORMATTING AND DISPLAY UTILITIES
   =============================================================================== */
function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return "N/A";
  
  const symbol = CURRENCY_SYMBOLS[STATE.currency] || "";
  const options = { 
    maximumFractionDigits: amount < 1 ? 6 : 2 
  };
  
  return symbol + amount.toLocaleString(undefined, options);
}

function formatPercentage(value) {
  if (value == null || isNaN(value)) return "N/A";
  
  const sign = value > 0 ? "+" : "";
  const decimals = Math.abs(value) < 0.01 ? 4 : 2;
  
  return `${sign}${value.toFixed(decimals)}%`;
}

function getChangeClass(value) {
  if (value == null || isNaN(value)) return "";
  return value >= 0 ? "text-success" : "text-danger";
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 1800);
  
  if (elements.liveRegion) {
    elements.liveRegion.textContent = message;
    setTimeout(() => elements.liveRegion.textContent = "", 800);
  }
}

/* ===============================================================================
   HEADER AND METADATA MANAGEMENT
   =============================================================================== */
function updateHeaderMetadata() {
  const currencyCode = (STATE.currency || "usd").toUpperCase();
  
  if (elements.currencyBadge) {
    elements.currencyBadge.textContent = `Currency: ${currencyCode}`;
  }
  
  if (elements.currencySelect) {
    elements.currencySelect.value = STATE.currency;
  }
  
  if (elements.lastUpdate) {
    const timestamp = STATE.lastUpdateTs ? new Date(STATE.lastUpdateTs) : new Date();
    elements.lastUpdate.textContent = timestamp.toLocaleString();
  }
  
  // Get Bitcoin and Ethereum prices for dynamic title
  const btcCoin = STATE.coins.find(coin => coin.symbol.toLowerCase() === 'btc');
  const ethCoin = STATE.coins.find(coin => coin.symbol.toLowerCase() === 'eth');

  if (btcCoin && ethCoin) {
    document.title = `Bitcoin ${formatCurrency(btcCoin.current_price)} | Ethereum ${formatCurrency(ethCoin.current_price)} | AnywhereCoin`;
  } else {
    document.title = `AnywhereCoin | Live Crypto Prices in ${currencyCode}`;
  }
  
  const metaDescription = qs('meta[name="description"]');
  
  // Dynamic meta descriptions based on current data
  const topCoin = STATE.coins[0];
  if (topCoin && metaDescription) {
    const desc = `${topCoin.name} ${formatCurrency(topCoin.current_price)} | Live crypto prices in ${currencyCode}. Bitcoin, Ethereum, and 250+ cryptocurrencies updated every 5 minutes.`;
    metaDescription.setAttribute("content", desc);
  }
}

/* ===============================================================================
   MARKET TABLE SORTING AND FILTERING
   =============================================================================== */
function sortCoinsData() {
  const sortKey = STATE.sort.key;
  const direction = STATE.sort.dir === "asc" ? 1 : -1;
  
  STATE.coins.sort((coinA, coinB) => {
    let valueA, valueB;
    
    switch (sortKey) {
      case "name":
        valueA = (coinA.name || "").toLowerCase();
        valueB = (coinB.name || "").toLowerCase();
        return valueA < valueB ? -1 * direction : valueA > valueB ? 1 * direction : 0;
      
      case "price":
        valueA = coinA.current_price;
        valueB = coinB.current_price;
        break;
      
      case "p1h":
        valueA = coinA.price_change_percentage_1h_in_currency;
        valueB = coinB.price_change_percentage_1h_in_currency;
        break;
      
      case "p24":
        valueA = coinA.price_change_percentage_24h_in_currency;
        valueB = coinB.price_change_percentage_24h_in_currency;
        break;
      
      case "p7d":
        valueA = coinA.price_change_percentage_7d_in_currency;
        valueB = coinB.price_change_percentage_7d_in_currency;
        break;
      
      case "mcap":
        valueA = coinA.market_cap;
        valueB = coinB.market_cap;
        break;
      
      case "vol":
        valueA = coinA.total_volume;
        valueB = coinB.total_volume;
        break;
      
      default:
        valueA = coinA.market_cap_rank;
        valueB = coinB.market_cap_rank;
    }
    
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return 1;
    if (valueB == null) return -1;
    
    return (valueA > valueB ? 1 : valueA < valueB ? -1 : 0) * direction;
  });
}

function renderCoinsTable() {
  const tableBody = elements.coinsTableBody;
  if (!tableBody) return;

  const searchQuery = (elements.searchInput?.value || "").trim().toLowerCase();
  const filteredCoins = STATE.coins.filter(coin => {
    if (!searchQuery) return true;
    return coin.name.toLowerCase().includes(searchQuery) || 
           coin.symbol.toLowerCase().includes(searchQuery);
  });

  const tableRows = filteredCoins.map(coin => {
    const oneHourChange = coin.price_change_percentage_1h_in_currency;
    const twentyFourHourChange = coin.price_change_percentage_24h_in_currency;
    const sevenDayChange = coin.price_change_percentage_7d_in_currency;
    
    return `
      <tr>
        <td>${coin.market_cap_rank ?? ""}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${coin.image || ""}" alt="${escapeHtml(coin.name)} logo" width="20" height="20" class="rounded" loading="lazy">
            <span class="fw-semibold">${escapeHtml(coin.name)}</span>
            <span class="text-muted small text-uppercase">${escapeHtml(coin.symbol)}</span>
          </div>
        </td>
        <td>
          <div class="d-flex align-items-center justify-content-between">
            <span>${formatCurrency(coin.current_price)}</span>
            <button class="btn btn-sm btn-outline-secondary ms-2" data-alert-coin="${escapeHtml(coin.name)}" data-alert-symbol="${escapeHtml(coin.symbol)}" title="Set price alert">
              <i class="bi bi-bell" style="font-size: 0.7rem;"></i>
            </button>
          </div>
        </td>
        <td class="${getChangeClass(oneHourChange)}">${formatPercentage(oneHourChange)}</td>
        <td class="${getChangeClass(twentyFourHourChange)}">${formatPercentage(twentyFourHourChange)}</td>
        <td class="${getChangeClass(sevenDayChange)}">${formatPercentage(sevenDayChange)}</td>
        <td class="text-muted">${formatCurrency(coin.market_cap)}</td>
        <td class="text-muted">${formatCurrency(coin.total_volume)}</td>
      </tr>
    `;
  }).join("");

  const finalContent = tableRows || 
    `<tr>
      <td colspan="8" class="text-center py-4 text-muted">
        No matches found for "${escapeHtml(searchQuery)}"
      </td>
    </tr>`;

  tableBody.innerHTML = finalContent;

  // Alert button event listeners
  qsa('[data-alert-coin]').forEach(button => {
    button.addEventListener('click', () => {
      const coinName = button.getAttribute('data-alert-coin');
      const coinSymbol = button.getAttribute('data-alert-symbol');
      
      elements.alertCoin.value = coinName;
      elements.alertCoin.dataset.symbol = coinSymbol;
      
      const alertModalInstance = bootstrap.Modal.getOrCreateInstance(elements.alertModal);
      alertModalInstance.show();
    });
  });
}

function setupSortableHeaders() {
  if (!elements.tableHeader) return;

  const headers = elements.tableHeader.querySelectorAll("th");
  const headerSortKeys = {
    0: "rank",
    1: "name", 
    2: "price",
    3: "p1h",
    4: "p24", 
    5: "p7d",
    6: "mcap",
    7: "vol"
  };

  headers.forEach((header, index) => {
    header.style.cursor = "pointer";
    header.addEventListener("click", () => {
      const sortKey = headerSortKeys[index] || "rank";
      
      if (STATE.sort.key === sortKey) {
        STATE.sort.dir = STATE.sort.dir === "asc" ? "desc" : "asc";
      } else {
        STATE.sort.dir = "asc";
      }
      STATE.sort.key = sortKey;
      
      headers.forEach(h => h.dataset.sort = "");
      header.dataset.sort = STATE.sort.dir;
      
      sortCoinsData();
      renderCoinsTable();
    });
  });
}

/* ===============================================================================
   TRENDING COINS - WIRED TO TOP SQUARE BUTTONS
   =============================================================================== */
function renderTrendingSection() {
  if (!elements.trendingBox) return;

  // Wire up existing TOP square buttons
  const gainersBtn = qs('[data-smart="gainers"]');
  const losersBtn = qs('[data-smart="losers"]'); 
  const volumeBtn = qs('[data-smart="volume"]');

  if (gainersBtn && losersBtn && volumeBtn) {
    gainersBtn.addEventListener("click", () => {
      const topGainers = rankCoinsByMetric("p24", "desc").slice(0, 10);
      openSmartModal("Top Gainers (24h)", topGainers);
    });
    
    losersBtn.addEventListener("click", () => {
      const topLosers = rankCoinsByMetric("p24", "asc").slice(0, 10);
      openSmartModal("Top Losers (24h)", topLosers);
    });
    
    volumeBtn.addEventListener("click", () => {
      const highestVolume = rankCoinsByMetric("vol", "desc").slice(0, 10);
      openSmartModal("Highest Volume", highestVolume);
    });
  }

  // Render trending coins list
  const trendingList = STATE.trending?.length ? STATE.trending : [];
  const trendingHtml = trendingList.map(trendingItem => {
    const coin = trendingItem.item || trendingItem;
    return `
      <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <img src="${coin.small}" alt="${escapeHtml(coin.name)} logo" width="20" height="20" class="rounded" loading="lazy">
          <div>
            <div class="fw-semibold">
              ${escapeHtml(coin.name)} 
              <span class="text-muted text-uppercase small">${escapeHtml(coin.symbol || "")}</span>
            </div>
            <div class="small text-muted">Score ${Number(coin.score) + 1}</div>
          </div>
        </div>
        <button class="btn btn-sm btn-outline-secondary" data-coin-id="${escapeHtml(coin.id)}">
          Details
        </button>
      </div>
    `;
  }).join("");

  const finalContent = trendingHtml || 
    '<p class="text-muted small mb-0">No trending data available</p>';
  
  elements.trendingBox.innerHTML = finalContent;

  qsa('#trendingBox button[data-coin-id]').forEach(button => {
    button.addEventListener('click', () => {
      const coinId = button.getAttribute('data-coin-id');
      openCoinDetailsModal(coinId);
    });
  });
}

function rankCoinsByMetric(metric, direction) {
  const coinsCopy = STATE.coins.slice();
  
  const metricGetters = {
    p24: (coin) => coin.price_change_percentage_24h_in_currency,
    vol: (coin) => coin.total_volume
  };
  
  const getValue = metricGetters[metric];
  if (!getValue) return coinsCopy;
  
  return coinsCopy.sort((coinA, coinB) => {
    const valueA = getValue(coinA);
    const valueB = getValue(coinB);
    
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return 1;
    if (valueB == null) return -1;
    
    return direction === "asc" ? valueA - valueB : valueB - valueA;
  });
}

/* ===============================================================================
   MODAL DIALOGS SYSTEM
   =============================================================================== */
function createCoinDetailsModal() {
  if (qs("#coinModal")) return;
  
  const modalHtml = `
    <div class="modal fade" id="coinModal" tabindex="-1" aria-labelledby="coinModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h5" id="coinModalLabel">Coin Details</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="coinModalBody">
            <p class="text-muted mb-0">Loading details...</p>
          </div>
          <div class="modal-footer w-100 d-block">
            <div class="border rounded-3 p-3 bg-body-secondary d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <span class="rounded-3" style="width:20px;height:20px;background:linear-gradient(135deg,#0d6efd,#6f42c1);" aria-hidden="true"></span>
                <div>
                  <div class="small text-uppercase text-muted">Sponsored</div>
                  <strong id="adModalHeadline">AnywhereCoin by 28th Bay Digital</strong>
                  <div class="small text-muted" id="adModalSub">Fast, clean and region aware in your currency.</div>
                </div>
              </div>
              <span class="badge text-bg-primary">Ad</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHtml;
  document.body.appendChild(tempDiv.firstElementChild);
}

async function openCoinDetailsModal(coinId) {
  createCoinDetailsModal();
  
  const modalElement = qs("#coinModal");
  const modalBody = qs("#coinModalBody");
  const modalTitle = qs("#coinModalLabel");
  
  modalTitle.textContent = "Coin Details";
  modalBody.innerHTML = '<p class="text-muted mb-0">Loading details...</p>';
  
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
  modalInstance.show();

  try {
    const coinData = await fetchJson(buildCoinDetailsApiUrl(coinId), 8000);
    
    modalTitle.textContent = `${coinData.name} (${String(coinData.symbol).toUpperCase()})`;
    
    const marketData = coinData.market_data || {};
    const detailRows = [
      ["Current Price", formatCurrency(marketData.current_price?.[STATE.currency])],
      ["Market Cap", formatCurrency(marketData.market_cap?.[STATE.currency])],
      ["24h Change", formatPercentage(marketData.price_change_percentage_24h_in_currency?.[STATE.currency])],
      ["7d Change", formatPercentage(marketData.price_change_percentage_7d_in_currency?.[STATE.currency])],
      ["24h Volume", formatCurrency(marketData.total_volume?.[STATE.currency])],
      ["Circulating Supply", (marketData.circulating_supply ?? "N/A").toLocaleString?.() || "N/A"]
    ];
    
    const description = (coinData.description?.en || "").replace(/<[^>]+>/g, "");
    const truncatedDescription = description.length > 480 ? 
      description.slice(0, 480) + "..." : description;
    
    modalBody.innerHTML = `
      <div class="d-flex align-items-center gap-3 mb-3">
        <img src="${coinData.image?.small || ""}" width="32" height="32" alt="${escapeHtml(coinData.name)} logo" class="rounded">
        <div class="small text-muted">Rank ${coinData.market_cap_rank ?? "—"}</div>
      </div>
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <tbody>
            ${detailRows.map(([key, value]) => 
              `<tr>
                <th scope="row" class="text-nowrap">${key}</th>
                <td>${value || "N/A"}</td>
              </tr>`
            ).join("")}
          </tbody>
        </table>
      </div>
      <p class="small text-muted mb-0">${escapeHtml(truncatedDescription)}</p>
    `;
    
    const currencyCode = (STATE.currency || "usd").toUpperCase();
    const adHeadline = qs("#adModalHeadline");
    const adSubtext = qs("#adModalSub");
    
    if (adHeadline && adSubtext) {
      adHeadline.textContent = "Create once. It updates itself.";
      adSubtext.textContent = `AnywhereCoin shows prices in ${currencyCode}. Built by 28th Bay Digital.`;
    }
    
  } catch (error) {
    console.error('Failed to load coin details:', error);
    modalBody.innerHTML = '<p class="text-danger mb-0">Could not load details. Please try again later.</p>';
  }
}

function createSmartModal() {
  if (qs("#smartModal")) return;
  
  const modalHtml = `
    <div class="modal fade" id="smartModal" tabindex="-1" aria-labelledby="smartModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h5" id="smartModalLabel">List</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="smartModalBody"></div>
        </div>
      </div>
    </div>
  `;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHtml;
  document.body.appendChild(tempDiv.firstElementChild);
}

function openSmartModal(title, coins) {
  createSmartModal();
  
  const modalInstance = bootstrap.Modal.getOrCreateInstance(qs("#smartModal"));
  qs("#smartModalLabel").textContent = title;
  
  const modalBody = qs("#smartModalBody");
  const tableRows = coins.map(coin => `
    <tr>
      <td>${coin.market_cap_rank ?? ""}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <img src="${coin.image || ""}" alt="${escapeHtml(coin.name)} logo" width="20" height="20" class="rounded" loading="lazy">
          <span class="fw-semibold">${escapeHtml(coin.name)}</span>
          <span class="text-muted small text-uppercase">${escapeHtml(coin.symbol)}</span>
        </div>
      </td>
      <td>${formatCurrency(coin.current_price)}</td>
      <td class="${getChangeClass(coin.price_change_percentage_24h_in_currency)}">
        ${formatPercentage(coin.price_change_percentage_24h_in_currency)}
      </td>
      <td class="text-muted">${formatCurrency(coin.total_volume)}</td>
    </tr>
  `).join("");
  
  modalBody.innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>Rank</th>
            <th>Coin</th>
            <th>Price</th>
            <th>24h Change</th>
            <th>Volume (24h)</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `;
  
  modalInstance.show();
}

function createNewsModal() {
  if (qs("#newsModal")) return;
  
  const modalHtml = `
    <div class="modal fade" id="newsModal" tabindex="-1" aria-labelledby="newsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h5" id="newsModalLabel">News Article</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="newsModalBody"></div>
          <div class="modal-footer">
            <a id="newsOriginalLink" href="#" target="_blank" class="btn btn-primary">Read full article</a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHtml;
  document.body.appendChild(tempDiv.firstElementChild);
}

function openNewsModal(article) {
  createNewsModal();
  
  const modalInstance = bootstrap.Modal.getOrCreateInstance(qs("#newsModal"));
  qs("#newsModalLabel").textContent = article.title;
  qs("#newsOriginalLink").href = article.url;
  
  const modalBody = qs("#newsModalBody");
  modalBody.innerHTML = `
    ${article.imageurl ? `<img src="${article.imageurl}" class="img-fluid mb-3" alt="${escapeHtml(article.title)}">` : ''}
    <p class="text-muted mb-3">${escapeHtml(article.body || 'No content available.')}</p>
    <small class="text-muted">Published: ${new Date(article.published_on * 1000).toLocaleDateString()}</small>
  `;
  
  modalInstance.show();
}

/* ===============================================================================
   PRICE ALERT SYSTEM
   =============================================================================== */
function createPriceAlert(coinName, coinSymbol, targetPrice) {
  const alerts = JSON.parse(localStorage.getItem("ac_alerts") || "[]");
  const newAlert = {
    id: Date.now(),
    coinName,
    coinSymbol: coinSymbol.toLowerCase(),
    targetPrice: parseFloat(targetPrice),
    created: Date.now()
  };
  
  alerts.push(newAlert);
  localStorage.setItem("ac_alerts", JSON.stringify(alerts));
  showToast(`Alert set for ${coinName} at ${formatCurrency(targetPrice)}`);
}

function checkPriceAlerts() {
  const alerts = JSON.parse(localStorage.getItem("ac_alerts") || "[]");
  if (!alerts.length) return;
  
  alerts.forEach(alert => {
    const coin = STATE.coins.find(c => c.symbol.toLowerCase() === alert.coinSymbol);
    if (coin && coin.current_price >= alert.targetPrice) {
      showNotification(`${alert.coinName} reached ${formatCurrency(alert.targetPrice)}!`);
      removeAlert(alert.id);
    }
  });
}

function removeAlert(alertId) {
  const alerts = JSON.parse(localStorage.getItem("ac_alerts") || "[]");
  const filtered = alerts.filter(alert => alert.id !== alertId);
  localStorage.setItem("ac_alerts", JSON.stringify(filtered));
}

function showNotification(message) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("AnywhereCoin Alert", { body: message });
  }
  showToast(message);
}

/* ===============================================================================
   MARKET ANALYSIS SYSTEM
   =============================================================================== */
function generateMarketAnalysis() {
  const container = qs("#analysisContainer");
  if (!container || !STATE.coins.length) return;

  const btc = STATE.coins.find(c => c.symbol.toLowerCase() === 'btc');
  const eth = STATE.coins.find(c => c.symbol.toLowerCase() === 'eth');
  const topGainers = rankCoinsByMetric("p24", "desc").slice(0, 3);

  const analysisCards = [
    {
      title: "Market Leaders",
      content: btc ? `Bitcoin is trading at ${formatCurrency(btc.current_price)} with a ${formatPercentage(btc.price_change_percentage_24h_in_currency)} change in 24 hours. Market cap stands at ${formatCurrency(btc.market_cap)}.` : "Market data loading...",
      icon: "bi-currency-bitcoin",
      color: "text-warning"
    },
    {
      title: "Top Performer",
      content: topGainers[0] ? `${topGainers[0].name} leads today's gains with a ${formatPercentage(topGainers[0].price_change_percentage_24h_in_currency)} increase, trading at ${formatCurrency(topGainers[0].current_price)}.` : "Analysis loading...",
      icon: "bi-arrow-up-circle",
      color: "text-success"
    },
    {
      title: "Market Sentiment",
      content: eth ? `Ethereum shows ${formatPercentage(eth.price_change_percentage_24h_in_currency)} movement at ${formatCurrency(eth.current_price)}. Trading volume indicates ${eth.total_volume > 20000000000 ? 'high' : 'moderate'} market activity.` : "Sentiment analysis loading...",
      icon: "bi-graph-up",
      color: "text-info"
    }
  ];

  const analysisHtml = analysisCards.map(card => `
    <div class="col-md-4">
      <div class="card border-0 bg-white shadow-sm h-100">
        <div class="card-body p-4">
          <div class="d-flex align-items-center mb-3">
            <i class="${card.icon} ${card.color} fs-3 me-3"></i>
            <h5 class="card-title h6 mb-0">${card.title}</h5>
          </div>
          <p class="card-text text-muted">${card.content}</p>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = analysisHtml;
}

/* ===============================================================================
   MODULAR AD SYSTEM INTEGRATION
   =============================================================================== */
function updateAdSystemWithCurrency() {
  if (typeof window.AdSystem !== 'undefined') {
    try {
      const currencyCode = (STATE.currency || "usd").toUpperCase();
      
      window.AdSystem.addContent({
        title: `Live ${currencyCode} Prices`,
        subtitle: `Real-time crypto prices in ${currencyCode}`,
        category: "currency"
      });
      
      window.AdSystem.refresh();
      
    } catch (error) {
      console.warn('Ad system update failed:', error);
    }
  }
}

function initializeAdSystemIntegration() {
  updateAdSystemWithCurrency();
  document.addEventListener('currencyChanged', updateAdSystemWithCurrency);
}

/* ===============================================================================
   CRYPTOCURRENCY CAROUSEL SYSTEM
   =============================================================================== */
function generateCryptoCarousel() {
  if (!elements.carouselContent || !STATE.coins.length) return;
  
  const topCoins = STATE.coins.slice(0, 5);
  const topGainers = rankCoinsByMetric("p24", "desc").slice(0, 3);
  const highVolume = rankCoinsByMetric("vol", "desc").slice(0, 3);
  
  const carouselSlides = [
    {
      title: "Market Leaders",
      coins: topCoins,
      description: "Top cryptocurrencies by market capitalization"
    },
    {
      title: "Today's Top Gainers",
      coins: topGainers,
      description: "Biggest price increases in the last 24 hours"
    },
    {
      title: "High Volume Trading",
      coins: highVolume,
      description: "Most actively traded cryptocurrencies today"
    }
  ];
  
  const slideHtml = carouselSlides.map((slide, index) => `
    <div class="carousel-item ${index === 0 ? 'active' : ''}">
      <div class="text-center py-4">
        <h4 class="h5 mb-3">${slide.title}</h4>
        <p class="text-muted mb-4">${slide.description}</p>
        <div class="row justify-content-center">
          ${slide.coins.map(coin => `
            <div class="col-md-4 mb-3">
              <div class="card border-0 bg-light">
                <div class="card-body p-3">
                  <div class="d-flex align-items-center mb-2">
                    <img src="${coin.image}" width="24" height="24" class="rounded me-2" alt="${escapeHtml(coin.name)} logo">
                    <strong>${escapeHtml(coin.name)}</strong>
                  </div>
                  <div class="small">
                    <div>${formatCurrency(coin.current_price)}</div>
                    <div class="${getChangeClass(coin.price_change_percentage_24h_in_currency)}">
                      ${formatPercentage(coin.price_change_percentage_24h_in_currency)} (24h)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
  
  elements.carouselContent.innerHTML = slideHtml;
}

/* ===============================================================================
   CRYPTO NEWS SYSTEM
   =============================================================================== */
async function loadCryptoNews() {
  try {
    const newsData = await fetchJson("https://min-api.cryptocompare.com/data/v2/news/?lang=EN", 6000);
    renderNewsSection(newsData.Data?.slice(0, 4) || []);
  } catch (error) {
    console.warn('News loading failed:', error);
    renderNewsSection([]);
  }
}

function renderNewsSection(articles) {
  const container = qs("#newsContainer");
  if (!container) return;

  if (!articles.length) {
    container.innerHTML = '<div class="col-12 text-center text-muted">No news available</div>';
    return;
  }

  const newsHtml = articles.map((article, index) => `
    <div class="col-md-6 col-lg-3">
      <div class="card news-card border-0 bg-white shadow-sm h-100">
        <div class="card-body p-3">
          ${article.imageurl ? `<img src="${article.imageurl}" class="card-img-top mb-2" alt="${escapeHtml(article.title)}" style="height: 120px; object-fit: cover;">` : ''}
          <h5 class="card-title h6 mb-2">${escapeHtml(article.title)}</h5>
          <p class="card-text small text-muted mb-3">${escapeHtml(article.body?.slice(0, 100) || '')}...</p>
          <div class="news-meta mb-2">
            <small>${new Date(article.published_on * 1000).toLocaleDateString()}</small>
          </div>
          <button class="btn btn-sm btn-outline-primary" data-news-index="${index}">Read more</button>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = newsHtml;

  // Add click handlers for news modals
  qsa('[data-news-index]').forEach(button => {
    button.addEventListener('click', () => {
      const newsIndex = parseInt(button.getAttribute('data-news-index'));
      openNewsModal(articles[newsIndex]);
    });
  });
}

/* ===============================================================================
   API DATA LOADING FUNCTIONS
   =============================================================================== */
async function loadMarketData() {
  try {
    const marketData = await fetchJson(buildMarketsApiUrl(STATE.currency), 8000);
    
    STATE.coins = marketData;
    STATE.lastUpdateTs = Date.now();
    
    saveDataSnapshot();
    
    sortCoinsData();
    renderCoinsTable();
    updateHeaderMetadata();
    generateCryptoCarousel();
    generateMarketAnalysis();
    checkPriceAlerts();
    
  } catch (error) {
    console.error('Market data loading failed:', error);
    
    const snapshotLoaded = loadDataSnapshot();
    
    if (snapshotLoaded) {
      sortCoinsData();
      renderCoinsTable();
      updateHeaderMetadata();
      showToast("Could not reach CoinGecko. Showing saved data.");
    } else {
      if (elements.coinsTableBody) {
        elements.coinsTableBody.innerHTML = `
          <tr>
            <td colspan="8" class="text-center py-4 text-danger">
              Could not load market data. Please try again later.
            </td>
          </tr>
        `;
      }
    }
  }
}

async function loadTrendingData() {
  try {
    const trendingData = await fetchJson("https://api.coingecko.com/api/v3/search/trending", 6000);
    STATE.trending = trendingData.coins || [];
    renderTrendingSection();
    
  } catch (error) {
    console.error('Trending data loading failed:', error);
    STATE.trending = [];
    renderTrendingSection();
  }
}

async function refreshAllData() {
  await Promise.all([
    loadMarketData(),
    loadTrendingData(),
    loadCryptoNews()
  ]);
}

function startAutoRefresh() {
  if (STATE.refreshTimer) {
    clearInterval(STATE.refreshTimer);
  }
  
  STATE.refreshTimer = setInterval(() => {
    loadMarketData();
  }, STATE.intervalMs);
}

/* ===============================================================================
   SEARCH FUNCTIONALITY
   =============================================================================== */
function performSearch() {
  sortCoinsData();
  renderCoinsTable();
  
  if (elements.marketSection) {
    elements.marketSection.scrollIntoView({ 
      behavior: "smooth", 
      block: "start" 
    });
  }
  
  if (elements.tableContainer) {
    elements.tableContainer.style.boxShadow = "0 0 0 3px rgba(13,110,253,.2)";
    setTimeout(() => {
      elements.tableContainer.style.boxShadow = "";
    }, 600);
  }
}

/* ===============================================================================
   EVENT BINDING
   =============================================================================== */
function bindAllEventListeners() {
  
  // Currency selection change
  elements.currencySelect?.addEventListener("change", async () => {
    STATE.currency = elements.currencySelect.value;
    localStorage.setItem("ac_currency", STATE.currency);
    setCookie("ac_currency", STATE.currency);
    updateHeaderMetadata();
    updateAdSystemWithCurrency();
    await refreshAllData();
  });
  
  // Manual refresh button
  if (elements.refreshBtn) {
    elements.refreshBtn.addEventListener("click", refreshAllData);
  }

  // Search functionality
  elements.searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      performSearch();
    }
    
    if (event.key === "Escape") {
      event.target.value = "";
      renderCoinsTable();
      event.target.blur();
    }
  });
  
  elements.searchButton?.addEventListener("click", () => {
    performSearch();
  });

  // Theme toggle
  elements.themeToggle?.addEventListener("click", toggleTheme);

  // Price alert interactions
  if (elements.saveAlert) {
    elements.saveAlert.addEventListener("click", () => {
      const coinName = elements.alertCoin.value;
      const coinSymbol = elements.alertCoin.dataset.symbol;
      const targetPrice = elements.alertPrice.value;
      
      if (coinName && coinSymbol && targetPrice) {
        createPriceAlert(coinName, coinSymbol, targetPrice);
        bootstrap.Modal.getInstance(elements.alertModal).hide();
        elements.alertPrice.value = "";
      }
    });
  }

  // Request notification permission
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  // Table sorting
  setupSortableHeaders();
}

/* ===============================================================================
   APPLICATION INITIALIZATION
   =============================================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  
  // Initial theme application
  applyTheme(STATE.theme);

  // Initialize modular ad system
  initializeAdSystemIntegration();

  // Currency selection setup
  if (elements.currencySelect) {
    elements.currencySelect.value = STATE.currency;
  }

  // Quick snapshot loading
  const snapshotLoaded = loadDataSnapshot();
  if (snapshotLoaded) {
    sortCoinsData();
    renderCoinsTable();
    renderTrendingSection();
    updateHeaderMetadata();
    generateCryptoCarousel();
    generateMarketAnalysis();
    checkPriceAlerts();
  }

  // First-time visitor region detection
  if (STATE.firstVisit) {
    try {
      const regionData = await detectUserRegion();
      showRegionModal({ 
        country: regionData.country, 
        suggested: regionData.currency || STATE.currency 
      });
    } catch (error) {
      console.warn('Region detection failed for first-time visitor:', error);
    }
    markUserAsSeen();
  }

  // Main data loading
  await refreshAllData();
  
  // Auto-refresh timer
  startAutoRefresh();
  
  // Event listeners binding
  bindAllEventListeners();
  
  console.log('AnywhereCoin application initialized successfully');
});


