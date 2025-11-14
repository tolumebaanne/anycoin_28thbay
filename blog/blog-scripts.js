/*
================================================================================
   AnywhereCoin - Educational Hub Controller
   
   Creator: Toluwalase Mebaanne
   Company: 28th Bay Digital
   
   MODULE PURPOSE:
   Blog platform controller managing cryptocurrency educational content
   discovery, categorization, and presentation through dynamic JSON-based
   content loading and responsive user interface generation.
   
   FUNCTIONALITY OVERVIEW:
   - JSON-based guide index loading for scalable content management
   - Category-based content organization by skill level
   - Popular guide showcase with engagement optimization
   - Integration with shared template generation system
   - Advertisement system initialization and management
   
   CONTENT ARCHITECTURE:
   Utilizes centralized JSON index for guide metadata management, enabling
   dynamic content loading without code modification for new educational
   materials. Supports skill-level categorization and popularity ranking.
   
   Copyright © 2025 Toluwalase Mebaanne / 28th Bay Digital
================================================================================
*/

/* ===============================================================================
   GUIDE CONTENT DATA MANAGEMENT
   =============================================================================== */

// Global guide collection loaded from centralized JSON configuration
let BLOG_GUIDES = [];

// Load comprehensive guide metadata from JSON index system
async function loadGuidesFromIndex() {
  try {
    const response = await fetch('../guides/content/index.json');
    const guides = await response.json();
    BLOG_GUIDES = guides;
    console.log('Loaded', guides.length, 'guides from JSON');
    return guides;
  } catch (error) {
    console.error('Error loading guides index:', error);
    return [];
  }
}

/* ===============================================================================
   BLOG PLATFORM INITIALIZATION
   =============================================================================== */

// Initialize educational hub with content loading and user interface setup
async function initializeBlogPage() {
  await loadGuidesFromIndex();
  loadPopularGuides();
  loadGuidesByCategory();
  initializeAds();
  
  console.log('Blog page initialized with', BLOG_GUIDES.length, 'guides');
}

/* ===============================================================================
   FEATURED CONTENT PRESENTATION
   =============================================================================== */

// Populate popular guides section with engagement-optimized layout
function loadPopularGuides() {
  const container = document.querySelector('#popularGuides');
  if (!container) return;
  
  const popularGuides = BLOG_GUIDES.filter(guide => guide.popular).slice(0, 6);
  
  container.innerHTML = popularGuides.map(guide => `
    <div class="col-md-6">
      <div class="guide-blog-card" onclick="openGuide('${guide.id}')">
        <div class="guide-card-header">
          <div class="d-flex align-items-center">
            <div class="guide-card-icon">
              <i class="${guide.icon}"></i>
            </div>
            <div>
              <h3 class="guide-card-title mb-1">${guide.title}</h3>
              <div class="guide-card-meta">
                <span class="badge bg-${getDifficultyColor(guide.difficulty)} badge-sm">${guide.difficulty}</span>
                <span class="ms-2">${guide.readTime} read</span>
              </div>
            </div>
          </div>
        </div>
        <div class="guide-card-body">
          <p class="guide-card-excerpt">${guide.excerpt}</p>
          <div class="guide-card-meta">
            <span>Click to read guide</span>
            <i class="bi bi-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ===============================================================================
   SKILL-BASED CONTENT ORGANIZATION
   =============================================================================== */

// Organize guides by educational complexity level for structured learning paths
function loadGuidesByCategory() {
  const categories = ['Beginner', 'Intermediate', 'Advanced'];
  
  categories.forEach(category => {
    const container = document.querySelector(`#${category.toLowerCase()}Guides`);
    if (!container) return;
    
    const categoryGuides = BLOG_GUIDES.filter(guide => guide.difficulty === category);
    
    container.innerHTML = categoryGuides.map(guide => `
      <div class="col-lg-4 col-md-6">
        <div class="guide-blog-card" onclick="openGuide('${guide.id}')">
          <div class="guide-card-header">
            <div class="d-flex align-items-center">
              <div class="guide-card-icon">
                <i class="${guide.icon}"></i>
              </div>
              <div>
                <h4 class="guide-card-title mb-1">${guide.title}</h4>
                <div class="small text-muted">${guide.readTime} read</div>
              </div>
            </div>
          </div>
          <div class="guide-card-body">
            <p class="guide-card-excerpt">${guide.excerpt}</p>
            <div class="guide-card-meta">
              <span>Read guide</span>
              <i class="bi bi-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  });
}

/* ===============================================================================
   GUIDE PRESENTATION SYSTEM
   =============================================================================== */

// Primary guide display function utilizing shared template generation system
window.openGuide = async function(guideId) {
  try {
    const markdownFile = `../guides/content/${guideId}.md`;
    
    const response = await fetch(markdownFile);
    if (!response.ok) {
      alert('Guide could not be loaded');
      return;
    }
    
    const markdownText = await response.text();
    const parsed = parseMarkdown(markdownText);
    
    // Generate optimized guide page with blog platform base path
    createOptimizedGuidePage(parsed, '../');
    
  } catch (error) {
    console.error('Error loading guide:', error);
    alert('Error loading guide');
  }
}

/* ===============================================================================
   USER INTERFACE NAVIGATION
   =============================================================================== */

// Smooth scroll navigation between content sections
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

/* ===============================================================================
   ADVERTISEMENT SYSTEM INTEGRATION
   =============================================================================== */

// Initialize dynamic advertisement system with timing optimization
function initializeAds() {
  setTimeout(() => {
    if (typeof window.AdSystem !== 'undefined') {
      window.AdSystem.initialize();
    }
  }, 100);
}

/* ===============================================================================
   PLATFORM INITIALIZATION
   =============================================================================== */

// Automatic platform initialization with dependency management
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBlogPage);
} else {
  initializeBlogPage();
}