/* ===============================================================================
   AnywhereCoin - Modular Dynamic Advertisement System
   File: ads/ad-system.js
   
   FEATURES:
   - Dynamic animated ad placeholders with rotating content
   - Responsive design (horizontal banners and square ads)
   - Smooth animations and transitions
   - Easy Google Ads integration when ready
   - Theme-aware (light/dark mode support)
   - Multiple content variations with timed rotation
   
   =============================================================================== */

/* ===============================================================================
   AD SYSTEM CONFIGURATION
   =============================================================================== */

// Advertisement content variations for rotation
const AD_CONTENT_LIBRARY = [
  {
    title: "Your Ad Here",
    subtitle: "Premium placement • High visibility",
    category: "placeholder"
  },
  {
    title: "AnywhereCoin",
    subtitle: "Live crypto prices in your currency",
    category: "brand"
  },
  {
    title: "Global Reach",
    subtitle: "Connect with crypto enthusiasts worldwide",
    category: "marketing"
  },
  {
    title: "Real-Time Data",
    subtitle: "5-minute updates • Always current",
    category: "feature"
  },
  {
    title: "Built by 28th Bay Digital",
    subtitle: "Clean, fast, and reliable",
    category: "brand"
  },
  {
    title: "Region Aware",
    subtitle: "Automatic currency detection",
    category: "feature"
  },
  {
    title: "No Sign Up Required",
    subtitle: "Instant access to live prices",
    category: "feature"
  }
];

// Ad rotation settings
const AD_SETTINGS = {
  rotationInterval: 8000, // 8 seconds between content changes
  fadeTransitionDuration: 300, // 300ms fade transition
  maxRetries: 3, // Retry attempts for failed operations
  debugMode: false // Set to true for console logging
};

/* ===============================================================================
   AD CONTAINER MANAGEMENT
   =============================================================================== */

/**
 * Detects the type of ad container based on its dimensions and ID
 * @param {HTMLElement} container - The ad container element
 * @returns {string} Ad type: 'horizontal', 'square', or 'auto'
 */
function detectAdType(container) {
  if (!container) return 'auto';
  
  const containerId = container.id || '';
  
  // Explicit type detection based on ID
  if (containerId.includes('leaderboard') || containerId.includes('footer')) {
    return 'horizontal';
  }
  
  if (containerId.includes('rectangle') || containerId.includes('square')) {
    return 'square';
  }
  
  // Fallback to dimension-based detection
  const rect = container.getBoundingClientRect();
  const aspectRatio = rect.width / rect.height;
  
  // If width is significantly larger than height, it's horizontal
  if (aspectRatio > 1.5) {
    return 'horizontal';
  }
  
  // If dimensions are roughly equal, it's square
  if (aspectRatio >= 0.8 && aspectRatio <= 1.2) {
    return 'square';
  }
  
  // Default to horizontal for unknown cases
  return 'horizontal';
}

/**
 * Creates the core ad placeholder structure
 * @param {HTMLElement} container - Target container element
 * @param {string} adType - Type of ad: 'horizontal' or 'square'
 */
function createAdPlaceholder(container, adType = 'horizontal') {
  if (!container) {
    if (AD_SETTINGS.debugMode) console.warn('Ad container not found');
    return;
  }

  // Clear existing content
  container.innerHTML = '';
  
  // Add appropriate CSS classes
  container.className = `dynamic-ad-container ad-${adType}`;
  
  // Create the main ad content structure
  const adContent = document.createElement('div');
  adContent.className = 'ad-content';
  
  // Build the inner HTML structure
  adContent.innerHTML = `
    <div class="ad-inner">
      <div class="ad-brand">
        <div class="ad-icon">
          <div class="ad-logo">
            <i class="ad-logo-icon" aria-hidden="true">●</i>
          </div>
        </div>
        <div class="ad-text">
          <div class="ad-title" data-ad-title>AnywhereCoin</div>
          <div class="ad-subtitle" data-ad-subtitle>Live crypto prices in your currency</div>
        </div>
      </div>
      <div class="ad-badge">
        <span class="ad-label">Ad Space</span>
      </div>
    </div>
    <div class="ad-animation">
      <div class="ad-pulse"></div>
      <div class="ad-wave"></div>
      <div class="ad-sparkle"></div>
    </div>
  `;

  // Add the content to container
  container.appendChild(adContent);
  
  if (AD_SETTINGS.debugMode) {
    console.log(`Created ${adType} ad in container:`, container.id);
  }
}

/* ===============================================================================
   CONTENT ROTATION SYSTEM
   =============================================================================== */

/**
 * Gets a random ad content variation, optionally filtered by category
 * @param {string} excludeCategory - Category to exclude from selection
 * @returns {Object} Selected ad content object
 */
function getRandomAdContent(excludeCategory = null) {
  let availableContent = AD_CONTENT_LIBRARY;
  
  // Filter out excluded category if specified
  if (excludeCategory) {
    availableContent = AD_CONTENT_LIBRARY.filter(ad => ad.category !== excludeCategory);
  }
  
  // Ensure we have content to choose from
  if (availableContent.length === 0) {
    availableContent = AD_CONTENT_LIBRARY;
  }
  
  // Return random selection
  const randomIndex = Math.floor(Math.random() * availableContent.length);
  return availableContent[randomIndex];
}

/**
 * Updates ad content with smooth fade transition
 * @param {HTMLElement} container - The ad container
 * @param {Object} newContent - New content object with title and subtitle
 */
async function updateAdContent(container, newContent) {
  if (!container) return;
  
  const titleElement = container.querySelector('[data-ad-title]');
  const subtitleElement = container.querySelector('[data-ad-subtitle]');
  
  if (!titleElement || !subtitleElement) return;
  
  try {
    // Fade out current content
    titleElement.style.opacity = '0';
    subtitleElement.style.opacity = '0';
    
    // Wait for fade out transition
    await new Promise(resolve => setTimeout(resolve, AD_SETTINGS.fadeTransitionDuration));
    
    // Update content
    titleElement.textContent = newContent.title;
    subtitleElement.textContent = newContent.subtitle;
    
    // Fade in new content
    titleElement.style.opacity = '1';
    subtitleElement.style.opacity = '1';
    
    if (AD_SETTINGS.debugMode) {
      console.log('Updated ad content:', newContent.title);
    }
    
  } catch (error) {
    if (AD_SETTINGS.debugMode) {
      console.warn('Ad content update failed:', error);
    }
  }
}

/**
 * Rotates content for all active ad containers
 */
async function rotateAllAdContent() {
  const adContainers = document.querySelectorAll('.dynamic-ad-container .ad-content');
  
  if (adContainers.length === 0) return;
  
  // Rotate content for each container
  const rotationPromises = Array.from(adContainers).map(async (adContent, index) => {
    const container = adContent.closest('.dynamic-ad-container');
    if (!container) return;
    
    // Stagger updates slightly to avoid all changing at once
    await new Promise(resolve => setTimeout(resolve, index * 100));
    
    // Get new content (avoid repeating the same category consecutively)
    const currentTitle = container.querySelector('[data-ad-title]')?.textContent || '';
    const currentContent = AD_CONTENT_LIBRARY.find(ad => ad.title === currentTitle);
    const newContent = getRandomAdContent(currentContent?.category);
    
    // Update the content
    await updateAdContent(container, newContent);
  });
  
  // Wait for all updates to complete
  await Promise.all(rotationPromises);
}

/* ===============================================================================
   AD SYSTEM INITIALIZATION
   =============================================================================== */

/**
 * Initializes a single ad container with dynamic content
 * @param {HTMLElement} container - The container element to initialize
 */
function initializeAdContainer(container) {
  if (!container) return;
  
  try {
    // Detect the appropriate ad type
    const adType = detectAdType(container);
    
    // Create the ad placeholder
    createAdPlaceholder(container, adType);
    
    // Set initial content
    const initialContent = getRandomAdContent();
    updateAdContent(container, initialContent);
    
    if (AD_SETTINGS.debugMode) {
      console.log(`Initialized ${adType} ad container:`, container.id);
    }
    
  } catch (error) {
    if (AD_SETTINGS.debugMode) {
      console.error('Failed to initialize ad container:', container.id, error);
    }
  }
}

/**
 * Initializes all ad containers on the page
 */
function initializeAllAds() {
  // Find all ad containers
  const adContainers = [
    document.getElementById('ad-leaderboard'),
    document.getElementById('ad-rectangle'), 
    document.getElementById('ad-footer')
  ].filter(container => container !== null);
  
  if (adContainers.length === 0) {
    if (AD_SETTINGS.debugMode) {
      console.warn('No ad containers found on page');
    }
    return;
  }
  
  // Initialize each container
  adContainers.forEach(container => {
    initializeAdContainer(container);
  });
  
  // Start content rotation
  startContentRotation();
  
  if (AD_SETTINGS.debugMode) {
    console.log(`Initialized ${adContainers.length} ad containers`);
  }
}

/**
 * Starts the automatic content rotation timer
 */
function startContentRotation() {
  // Clear any existing rotation timer
  if (window.adRotationTimer) {
    clearInterval(window.adRotationTimer);
  }
  
  // Start new rotation timer
  window.adRotationTimer = setInterval(() => {
    rotateAllAdContent();
  }, AD_SETTINGS.rotationInterval);
  
  if (AD_SETTINGS.debugMode) {
    console.log('Started ad content rotation');
  }
}

/**
 * Stops the automatic content rotation
 */
function stopContentRotation() {
  if (window.adRotationTimer) {
    clearInterval(window.adRotationTimer);
    window.adRotationTimer = null;
    
    if (AD_SETTINGS.debugMode) {
      console.log('Stopped ad content rotation');
    }
  }
}

/* ===============================================================================
   RESPONSIVE AND THEME SUPPORT
   =============================================================================== */

/**
 * Updates ad containers when theme changes
 */
function handleThemeChange() {
  const adContainers = document.querySelectorAll('.dynamic-ad-container');
  
  adContainers.forEach(container => {
    // Add subtle animation when theme changes
    const adContent = container.querySelector('.ad-content');
    if (adContent) {
      adContent.style.transform = 'scale(0.98)';
      setTimeout(() => {
        adContent.style.transform = 'scale(1)';
      }, 150);
    }
  });
}

/**
 * Handles window resize events to maintain proper ad sizing
 */
function handleResize() {
  const adContainers = document.querySelectorAll('.dynamic-ad-container');
  
  adContainers.forEach(container => {
    // Re-detect ad type in case layout changed
    const newAdType = detectAdType(container);
    const currentAdType = container.classList.contains('ad-square') ? 'square' : 'horizontal';
    
    // Update classes if type changed
    if (newAdType !== currentAdType) {
      container.className = `dynamic-ad-container ad-${newAdType}`;
    }
  });
}

/* ===============================================================================
   PUBLIC API FOR INTEGRATION
   =============================================================================== */

// Global ad system object for external access
window.AdSystem = {
  // Core functions
  initialize: initializeAllAds,
  refresh: rotateAllAdContent,
  
  // Control functions
  startRotation: startContentRotation,
  stopRotation: stopContentRotation,
  
  // Configuration
  setRotationInterval: (milliseconds) => {
    AD_SETTINGS.rotationInterval = milliseconds;
    startContentRotation(); // Restart with new interval
  },
  
  // Debug functions
  enableDebug: () => { AD_SETTINGS.debugMode = true; },
  disableDebug: () => { AD_SETTINGS.debugMode = false; },
  
  // Content management
  addContent: (contentObject) => {
    AD_CONTENT_LIBRARY.push(contentObject);
  },
  
  // Manual container initialization
  initContainer: initializeAdContainer
};

/* ===============================================================================
   EVENT LISTENERS AND AUTO-INITIALIZATION
   =============================================================================== */

// Theme change detection
if (typeof MutationObserver !== 'undefined') {
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        handleThemeChange();
      }
    });
  });
  
  // Start observing theme changes on document root
  themeObserver.observe(document.documentElement, { 
    attributes: true, 
    attributeFilter: ['data-theme'] 
  });
}

// Window resize handling (debounced)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(handleResize, 250);
});

// Page visibility API for pausing/resuming rotation
if (typeof document.visibilityState !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      stopContentRotation();
    } else if (document.visibilityState === 'visible') {
      startContentRotation();
    }
  });
}

/* ===============================================================================
   AUTO-INITIALIZATION
   =============================================================================== */

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAllAds);
} else {
  // DOM already loaded
  initializeAllAds();
}

// Cleanup on page unload
window.addEventListener('beforeunload', stopContentRotation);

if (AD_SETTINGS.debugMode) {
  console.log('AnywhereCoin Ad System loaded successfully');
}