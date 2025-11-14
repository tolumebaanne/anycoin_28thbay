/*
================================================================================
   AnywhereCoin - Educational Guide System Controller
   
   Creator: Toluwalase Mebaanne
   Company: 28th Bay Digital
   
   MODULE PURPOSE:
   Main site integration controller for cryptocurrency educational guide system.
   Manages dynamic content loading, user interface enhancement, and guide
   presentation through shared template generation functions.
   
   SYSTEM ARCHITECTURE:
   - JSON-based guide index for scalable content management
   - Dynamic content rotation to showcase educational materials
   - Integration with shared template generation system
   - Responsive grid layout with sticky sidebar navigation
   - Progressive enhancement of existing learn section
   
   CONTENT MANAGEMENT:
   Loads guide metadata from centralized JSON index, enabling easy addition
   of new educational content without code modification. Supports rotation
   algorithms to ensure diverse content exposure across user sessions.
   
   Copyright © 2025 Toluwalase Mebaanne / 28th Bay Digital
================================================================================
*/

/* ===============================================================================
   GUIDE CONTENT DATA MANAGEMENT
   =============================================================================== */

// Global guide collection loaded from centralized JSON index
let ALL_GUIDES = [];

// Load comprehensive guide index from JSON configuration file
async function loadAllGuides() {
  try {
    const response = await fetch('guides/content/index.json');
    const guides = await response.json();
    ALL_GUIDES = guides;
    return guides;
  } catch (error) {
    console.error('Error loading guides index:', error);
    return [];
  }
}

/* ===============================================================================
   USER INTERFACE ENHANCEMENT SYSTEM
   =============================================================================== */

// Transform static learn section into dynamic educational hub
function enhanceLearnSection() {
  const learnSection = document.querySelector('#learn .container');
  if (!learnSection) return;
  
  learnSection.innerHTML = `
<div class="row g-4 align-items-start">
  <div class="col-lg-4">
    <h2 class="h3">Crypto Guides</h2>
    <p class="text-muted">Essential guides to understand crypto:</p>
    <div id="guidesSidebar" style="background: white; border-radius: 1rem; padding: 1.5rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); height: fit-content; position: sticky; top: 2rem;">
      <!-- Dynamic sidebar content populated by rotation algorithm -->
    </div>
  </div>
  <div class="col-lg-8">
    <div id="guidesGrid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
      <!-- Dynamic grid content updated through rotation system -->
    </div>
  </div>
</div>`;

  // Initialize content with first rotation cycle
  rotateContent();
}

/* ===============================================================================
   DYNAMIC CONTENT ROTATION ENGINE
   =============================================================================== */

// Intelligent content rotation algorithm for diverse guide exposure
function rotateContent() {
  if (!ALL_GUIDES.length) return;
  
  // Randomized selection for sidebar presentation (5 guides)
  const sidebarGuides = [...ALL_GUIDES].sort(() => 0.5 - Math.random()).slice(0, 5);
  
  // Randomized selection for main grid display (4 guides)
  const gridGuides = [...ALL_GUIDES].sort(() => 0.5 - Math.random()).slice(0, 4);
  
  // Update sidebar with selected guide collection
  const sidebar = document.querySelector('#guidesSidebar');
  if (sidebar) {
    sidebar.innerHTML = sidebarGuides.map(guide => `
      <div onclick="showGuide('${guide.id}')" style="padding: 1rem; cursor: pointer; border-radius: 0.5rem; margin-bottom: 0.5rem; border: 1px solid #e5e7eb; transition: all 0.2s ease;" onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='white'">
        <strong><i class="${guide.icon} me-2"></i>${guide.title}</strong>
        <div class="small text-muted">${guide.difficulty}</div>
      </div>
    `).join('') + `
      <a href="blog/" class="btn btn-outline-primary btn-sm w-100 mt-3">
        <i class="bi bi-collection me-2"></i>Our Guides
      </a>
    `;
  }
  
  // Update main grid with featured guide selection
  const grid = document.querySelector('#guidesGrid');
  if (grid) {
    grid.innerHTML = gridGuides.map(guide => `
      <div onclick="showGuide('${guide.id}')" style="background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 2rem; cursor: pointer; transition: all 0.3s ease; aspect-ratio: 1/1; display: flex; flex-direction: column;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.05)'">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 1rem; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; margin-bottom: 1.5rem;"><i class="${guide.icon}"></i></div>
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: #1e293b;">${guide.title}</h3>
        <p style="color: #64748b; margin: 0; line-height: 1.6; flex: 1;">${guide.excerpt}</p>
      </div>
    `).join('');
  }
}

/* ===============================================================================
   CONTENT ROTATION AUTOMATION
   =============================================================================== */

// Automated content rotation for continuous guide discovery
function startDynamicRotation() {
  setInterval(rotateContent, 15000);
}

/* ===============================================================================
   GUIDE PRESENTATION SYSTEM
   =============================================================================== */

// Primary guide display function integrating with shared template system
window.showGuide = async function(guideId) {
  try {
    const markdownFile = `guides/content/${guideId}.md`;
    
    const response = await fetch(markdownFile);
    if (!response.ok) {
      if (typeof showToast === 'function') {
        showToast('Guide could not be loaded');
      }
      return;
    }
    
    const markdownText = await response.text();
    const parsed = parseMarkdown(markdownText);
    
    // Generate optimized guide page using shared template system
    createOptimizedGuidePage(parsed, '');
    
  } catch (error) {
    console.error('Error loading guide:', error);
    if (typeof showToast === 'function') {
      showToast('Error loading guide');
    }
  }
}

/* ===============================================================================
   SYSTEM INITIALIZATION
   =============================================================================== */

// Initialize educational guide system with content loading and rotation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await loadAllGuides();
    enhanceLearnSection();
    startDynamicRotation();
  });
} else {
  loadAllGuides().then(() => {
    enhanceLearnSection();
    startDynamicRotation();
  });
}