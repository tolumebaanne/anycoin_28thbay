/*
================================================================================
   AnywhereCoin - Shared Guide System Functions
   
   Creator: Toluwalase Mebaanne
   Company: 28th Bay Digital
   
   MODULE PURPOSE:
   Shared functionality for educational guide system used across main site
   and blog platform. Handles markdown processing, template generation, and
   dynamic guide rendering with responsive layout optimization.
   
   CORE CAPABILITIES:
   - Markdown parsing with frontmatter metadata extraction
   - Dynamic HTML template generation with image integration
   - Content analysis for optimal layout selection (single/multi-column)
   - Table of contents generation with smooth scroll navigation
   - Progressive content disclosure for improved readability
   - Cross-platform compatibility between main site and blog
   
   Copyright © 2025 Toluwalase Mebaanne / 28th Bay Digital
================================================================================
*/

/* ===============================================================================
   GUIDE CONTENT CONFIGURATION
   =============================================================================== */

// Cryptocurrency guide image assets mapped to educational content topics
const GUIDE_IMAGES = {
  'bitcoin-basics': 'shared/img/crypto-07.jpg',
  'ethereum-guide': 'shared/img/crypto-14.jpg',
  'how-to-buy-crypto': 'shared/img/crypto-16.jpg',
  'crypto-wallet-security': 'shared/img/crypto-20.jpg',
  'understanding-blockchain': 'shared/img/crypto-03.jpg',
  'market-cap-guide': 'shared/img/crypto-13.jpg',
  'crypto-trading-volume': 'shared/img/crypto-17.jpg',
  'bull-bear-markets': 'shared/img/crypto-09.jpg',
  'crypto-regulations': 'shared/img/crypto-01.jpg',
  'defi-explained': 'shared/img/crypto-06.jpg',
  'staking-rewards': 'shared/img/crypto-15.jpg',
  'nft-marketplace': 'shared/img/crypto-21.jpg',
  'crypto-tax-guide': 'shared/img/crypto-04.jpg',
  'altcoin-analysis': 'shared/img/crypto-14.jpg',
  'smart-contracts': 'shared/img/crypto-02.jpg',
  'crypto-mining': 'shared/img/crypto-12.jpg',
  'yield-farming': 'shared/img/crypto-18.jpg',
  'crypto-portfolio': 'shared/img/crypto-13.jpg',
  'crypto-exchanges': 'shared/img/crypto-17.jpg',
  'cold-storage': 'shared/img/crypto-20.jpg'
};

/* ===============================================================================
   MARKDOWN PROCESSING ENGINE
   =============================================================================== */

// Extract frontmatter metadata and content from markdown files
function parseMarkdown(text) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = text.match(frontmatterRegex);
  
  if (match) {
    const frontmatter = {};
    const frontmatterLines = match[1].split('\n');
    
    frontmatterLines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      }
    });
    
    return {
      frontmatter,
      content: match[2]
    };
  }
  
  return { frontmatter: {}, content: text };
}

// Convert markdown syntax to semantic HTML elements
function markdownToHtml(markdown) {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/^(.+)$/gim, '<p>$1</p>')
    .replace(/<p><li>/gim, '<ul><li>')
    .replace(/<\/li><\/p>/gim, '</li></ul>')
    .replace(/<p><h/gim, '<h')
    .replace(/<\/h([1-6])><\/p>/gim, '</h$1>')
    .replace(/<p><tr>/gim, '<table class="table table-striped"><tr>')
    .replace(/<\/tr><\/p>/gim, '</tr></table>');
}

/* ===============================================================================
   CONTENT OPTIMIZATION ANALYSIS
   =============================================================================== */

// Analyze guide content characteristics for layout optimization
function analyzeContent(content) {
  const listItems = (content.match(/^\- /gm) || []).length;
  const sections = (content.match(/^## /gm) || []).length;
  const length = content.length;
  
  return {
    length,
    listItems,
    sections,
    isListHeavy: listItems > 15,
    isLong: length > 6000,
    needsOptimization: listItems > 10 || length > 4000
  };
}

/* ===============================================================================
   NAVIGATION COMPONENT GENERATION
   =============================================================================== */

// Generate sticky table of contents with integrated navigation controls
function generateTOC(content) {
  const headers = content.match(/^## (.+)$/gm);
  if (!headers || headers.length < 3) return '';
  
  const tocItems = headers.map((header, index) => {
    const title = header.replace('## ', '');
    return `<li><a href="javascript:void(0)" onclick="scrollToHeading('${title}')" class="text-decoration-none toc-link">${title}</a></li>`;
  }).join('');
  
  return `
    <div style="background: white; border-radius: 1rem; padding: 1.5rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); position: sticky; top: 2rem; max-height: calc(100vh - 4rem); overflow-y: auto;">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h4 class="h6 mb-0"><i class="bi bi-list-ul me-2"></i>Contents</h4>
        <button onclick="scrollToTop()" class="btn btn-sm btn-outline-primary" title="Back to top">
          <i class="bi bi-arrow-up"></i>
        </button>
      </div>
      <ul class="list-unstyled small mb-3">${tocItems}</ul>
      <div class="border-top pt-3">
        <button onclick="goToMainSection('learn')" class="btn btn-outline-secondary btn-sm w-100 mb-2">
          <i class="bi bi-arrow-left me-2"></i>Back to Guides
        </button>
        <button onclick="window.close()" class="btn btn-secondary btn-sm w-100">
          <i class="bi bi-x-lg me-2"></i>Close Guide
        </button>
      </div>
    </div>`;
}

/* ===============================================================================
   PROGRESSIVE CONTENT DISCLOSURE
   =============================================================================== */

// Transform long content sections into collapsible components for better UX
function makeContentCollapsible(html) {
  return html.replace(/<h2>/g, (match, offset, string) => {
    const sectionIndex = (string.substring(0, offset).match(/<h2>/g) || []).length;
    if (sectionIndex > 1) {
      return `</div><div class="collapsible-section"><button class="btn btn-link p-0 mb-2 text-start" onclick="toggleSection(this)"><i class="bi bi-chevron-down me-2"></i></button><h2>`;
    }
    return sectionIndex === 0 ? '<div class="content-section"><h2>' : '</div><div class="content-section"><h2>';
  }) + '</div>';
}

/* ===============================================================================
   USER INTERFACE UTILITIES
   =============================================================================== */

// Map guide difficulty levels to Bootstrap badge color variants
function getDifficultyColor(difficulty) {
  switch((difficulty || '').toLowerCase()) {
    case 'beginner': return 'success';
    case 'intermediate': return 'warning';
    case 'advanced': return 'danger';
    default: return 'primary';
  }
}

/* ===============================================================================
   VISUAL ASSET MANAGEMENT
   =============================================================================== */

// Retrieve guide-specific image data with accessibility descriptions
function getGuideImageData(guideId) {
  const imageMap = {
    'bitcoin-basics': {
      src: 'shared/img/crypto-07.jpg',
      alt: 'Golden Bitcoin coin floating above blue financial chart showing upward price trend and market growth'
    },
    'ethereum-guide': {
      src: 'shared/img/crypto-14.jpg',
      alt: 'Hand holding Bitcoin, Ethereum, and other cryptocurrency coins representing diverse digital asset portfolio'
    },
    'how-to-buy-crypto': {
      src: 'shared/img/crypto-16.jpg',
      alt: 'Two hands exchanging a golden Bitcoin coin representing peer-to-peer cryptocurrency transaction and trading'
    },
    'crypto-wallet-security': {
      src: 'shared/img/crypto-20.jpg',
      alt: 'Golden Bitcoin coin being carefully placed into denim jeans pocket representing secure cryptocurrency storage'
    },
    'understanding-blockchain': {
      src: 'shared/img/crypto-03.jpg',
      alt: 'Golden Bitcoin and Ethereum coins on financial newspaper with geometric pattern background representing blockchain technology'
    },
    'market-cap-guide': {
      src: 'shared/img/crypto-13.jpg',
      alt: 'Smartphone displaying cryptocurrency portfolio and market data with physical gold and silver coins scattered around'
    },
    'crypto-trading-volume': {
      src: 'shared/img/crypto-17.jpg',
      alt: 'Professional trader analyzing multiple cryptocurrency charts and trading data on large computer monitor'
    },
    'bull-bear-markets': {
      src: 'shared/img/crypto-09.jpg',
      alt: 'Person using tablet to analyze cryptocurrency price movements and trading patterns on colorful financial charts'
    },
    'crypto-regulations': {
      src: 'shared/img/crypto-01.jpg',
      alt: 'Golden Bitcoin coins placed on financial investment document with text about cryptocurrencies and investing'
    },
    'defi-explained': {
      src: 'shared/img/crypto-06.jpg',
      alt: 'Modern laptop displaying advanced cryptocurrency trading interface with charts and market data on glass desk'
    },
    'staking-rewards': {
      src: 'shared/img/crypto-15.jpg',
      alt: 'Organized stacks of gold and silver cryptocurrency coins representing staking rewards and passive income'
    },
    'nft-marketplace': {
      src: 'shared/img/crypto-21.jpg',
      alt: 'Hand holding collection of various cryptocurrency coins including Bitcoin and Ethereum representing digital asset ownership'
    },
    'crypto-tax-guide': {
      src: 'shared/img/crypto-04.jpg',
      alt: 'Golden Bitcoin coin next to 200 Euro banknotes representing cryptocurrency taxation and international finance'
    },
    'altcoin-analysis': {
      src: 'shared/img/crypto-14.jpg',
      alt: 'Multiple cryptocurrency coins in open palm including Bitcoin, Ethereum and altcoins representing portfolio analysis'
    },
    'smart-contracts': {
      src: 'shared/img/crypto-02.jpg',
      alt: 'Professional using laptop and smartphone to monitor cryptocurrency trading charts and smart contract interactions'
    },
    'crypto-mining': {
      src: 'shared/img/crypto-12.jpg',
      alt: 'Golden Bitcoin coin partially buried in dark soil representing cryptocurrency mining and digital gold concept'
    },
    'yield-farming': {
      src: 'shared/img/crypto-18.jpg',
      alt: 'Professional trader with glasses intensely analyzing complex cryptocurrency market data and DeFi protocols'
    },
    'crypto-portfolio': {
      src: 'shared/img/crypto-13.jpg',
      alt: 'Digital portfolio tracking interface on smartphone surrounded by physical cryptocurrency coins'
    },
    'crypto-exchanges': {
      src: 'shared/img/crypto-17.jpg',
      alt: 'Professional cryptocurrency trader analyzing market data on multiple monitors in modern trading environment'
    },
    'cold-storage': {
      src: 'shared/img/crypto-20.jpg',
      alt: 'Bitcoin coin being securely stored in denim wallet pocket representing cold storage security practices'
    }
  };

  return imageMap[guideId] || {
    src: 'shared/img/crypto-08.jpg',
    alt: 'Professional person holding Bitcoin coin with focused expression representing cryptocurrency expertise and knowledge'
  };
}

/* ===============================================================================
   DYNAMIC TEMPLATE GENERATION SYSTEM
   =============================================================================== */

// Generate optimized guide page with intelligent layout and navigation
function createOptimizedGuidePage(parsed, basePath = '') {
  const { frontmatter, content } = parsed;
  const analysis = analyzeContent(content);
  
  // Intelligent guide identification from content metadata
  const guideId = (frontmatter.title || '').toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^(bitcoin|btc).*basic.*/, 'bitcoin-basics')
    .replace(/^ethereum.*/, 'ethereum-guide')
    .replace(/.*buy.*crypto.*/, 'how-to-buy-crypto')
    .replace(/.*wallet.*security.*/, 'crypto-wallet-security')
    .replace(/.*blockchain.*/, 'understanding-blockchain')
    .replace(/.*market.*cap.*/, 'market-cap-guide')
    .replace(/.*trading.*volume.*/, 'crypto-trading-volume')
    .replace(/.*bull.*bear.*/, 'bull-bear-markets')
    .replace(/.*regulation.*/, 'crypto-regulations')
    .replace(/.*defi.*/, 'defi-explained')
    .replace(/.*staking.*/, 'staking-rewards')
    .replace(/.*nft.*/, 'nft-marketplace')
    .replace(/.*tax.*/, 'crypto-tax-guide')
    .replace(/.*altcoin.*/, 'altcoin-analysis')
    .replace(/.*smart.*contract.*/, 'smart-contracts')
    .replace(/.*mining.*/, 'crypto-mining')
    .replace(/.*yield.*farm.*/, 'yield-farming')
    .replace(/.*portfolio.*/, 'crypto-portfolio')
    .replace(/.*exchange.*/, 'crypto-exchanges')
    .replace(/.*cold.*storage.*/, 'cold-storage');

  const imageData = getGuideImageData(guideId);
  
  // Content processing pipeline
  let htmlContent = markdownToHtml(content);
  let sidebarTOC = '';
  let layoutClass = 'single-column';
  
  // Table of contents generation for structured navigation
  if (analysis.sections > 2) {
    sidebarTOC = generateTOC(content);
  }
  
  // Progressive disclosure for lengthy educational content
  if (analysis.needsOptimization) {
    htmlContent = makeContentCollapsible(htmlContent);
  }
  
  // Multi-column layout optimization for extensive content
  if (analysis.isLong || analysis.isListHeavy) {
    layoutClass = 'multi-column';
  }
  
  const difficultyColor = getDifficultyColor(frontmatter.difficulty);
  
  // Dynamic template generation with embedded functionality
  const newWindow = window.open('', '_blank');
  const templateHtml = `
<!DOCTYPE html>
<html lang="en" data-theme="auto">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${frontmatter.title || 'Guide'} | AnywhereCoin Guides</title>
  <meta name="description" content="${frontmatter.description || ''}">
  
  <!-- External Dependencies -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
  <link href="${basePath}styles.css" rel="stylesheet">
  <link href="${basePath}ads/ad-styles.css" rel="stylesheet">
  
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #fafbfc;
    }
    
    /* Navigation header styling */
    .guide-nav {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .guide-nav .navbar-brand {
      color: white !important;
      font-weight: 700;
    }
    .guide-nav .btn {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      backdrop-filter: blur(10px);
    }
    .guide-nav .btn:hover {
      background: rgba(255,255,255,0.25);
      border-color: rgba(255,255,255,0.5);
      color: white;
    }
    
    /* Hero section with dynamic background image */
    .guide-hero-image {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9)), url('${basePath}${imageData.src}');
      background-size: cover;
      background-position: center;
      border-radius: 1.5rem;
      padding: 3rem;
      margin-bottom: 2rem;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .guide-hero-image::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
      border-radius: inherit;
    }
    .guide-hero-image > * {
      position: relative;
      z-index: 2;
    }
    
    /* Main content container styling */
    .guide-content {
      background: white;
      border-radius: 1.5rem;
      padding: 3rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      line-height: 1.7;
    }
    .guide-content.multi-column {
      column-count: 2;
      column-gap: 3rem;
      column-rule: 1px solid #f1f5f9;
    }
    .guide-content h1, .guide-content h2 {
      column-span: all;
      break-after: column;
    }
    
    /* Typography optimization for readability */
    .guide-content h2 {
      color: #1e293b;
      font-weight: 700;
      font-size: 1.75rem;
      margin-top: 2.5rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f1f5f9;
      scroll-margin-top: 2rem;
    }
    .guide-content h3 {
      color: #374151;
      font-weight: 600;
      font-size: 1.4rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    .guide-content p {
      color: #4b5563;
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
    }
    .guide-content strong {
      color: #1e293b;
      font-weight: 600;
    }
    .guide-content ul, .guide-content ol {
      margin-bottom: 1rem;
    }
    .guide-content li {
      color: #4b5563;
      margin-bottom: 0.15rem;
      font-size: 1rem;
    }
    
    /* Table of contents interactive styling */
    .toc-link {
      color: #6366f1;
      display: block;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f1f5f9;
      transition: color 0.2s ease, background-color 0.2s ease;
      border-radius: 0.25rem;
      margin: 0.25rem 0;
      padding-left: 0.75rem;
    }
    .toc-link:hover {
      color: #4f46e5;
      background-color: #f8fafc;
      text-decoration: none;
    }
    
    /* Collapsible section interaction states */
    .collapsible-section { margin-bottom: 1.5rem; }
    .collapsible-section .content { display: none; }
    .collapsible-section.expanded .content { display: block; }
    
    /* Footer branding and navigation */
    .footer-modern {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      margin-top: 4rem;
    }
    
    /* Floating action button styling */
    .back-to-main {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;
      border-radius: 50px;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border: none;
      color: white;
      font-weight: 600;
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }
    .back-to-main:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
      color: white;
    }
    
    /* Smooth scrolling behavior */
    html {
      scroll-behavior: smooth;
    }
    
    /* Responsive layout adjustments */
    @media (max-width: 992px) {
      .guide-content.multi-column { column-count: 1; }
    }
  </style>
</head>
<body>
  <!-- Platform Navigation Header -->
  <nav class="navbar navbar-expand-lg guide-nav">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2" href="${basePath}index.html">
        <span class="rounded-3 d-inline-block" style="width: 20px; height: 20px; background: white; opacity: 0.9;"></span>
        <strong>AnywhereCoin</strong>
      </a>
      
      <!-- Quick Access Navigation -->
      <div class="navbar-nav me-auto">
        <a class="nav-link text-white-50" href="javascript:void(0)" onclick="goToMainSection('market')">Market</a>
        <a class="nav-link text-white-50" href="javascript:void(0)" onclick="goToMainSection('trending')">Trending</a>
        <a class="nav-link text-white-50" href="javascript:void(0)" onclick="goToMainSection('learn')">Learn</a>
      </div>
      
      <button onclick="window.close()" class="btn btn-sm">
        <i class="bi bi-arrow-left me-1"></i>Back to Market
      </button>
    </div>
  </nav>

  <!-- Educational Content Layout -->
  <main class="py-5">
    <div class="container">
      <div class="row g-4">
        <!-- Primary Content Column -->
        <div class="col-lg-8">
          <!-- Guide Header with Dynamic Background -->
          <div class="guide-hero-image">
            <div class="d-flex align-items-center gap-3 mb-3">
              <span class="badge bg-light text-dark fs-6 px-3 py-2">${frontmatter.difficulty || 'Guide'}</span>
              <span style="color: rgba(255,255,255,0.9);">${frontmatter.readTime || ''}</span>
              <span style="color: rgba(255,255,255,0.9);">${frontmatter.date || ''}</span>
            </div>
            <h1 class="display-4 fw-bold mb-3" style="line-height: 1.2;">${frontmatter.title || 'Guide'}</h1>
            <p class="lead mb-0" style="font-size: 1.25rem; font-weight: 400; color: rgba(255,255,255,0.9);">${frontmatter.description || ''}</p>
          </div>
          
          <!-- Advertisement Placement -->
          <div id="ad-guide-top" class="dynamic-ad-container ad-horizontal my-4"></div>
          
          <!-- Educational Content -->
          <div class="guide-content ${layoutClass}">
            ${htmlContent}
          </div>
          
          <!-- Bottom Advertisement -->
          <div id="ad-guide-bottom" class="dynamic-ad-container ad-horizontal my-4"></div>
        </div>
        
        <!-- Navigation Sidebar -->
        <div class="col-lg-4">
          <!-- Sidebar Advertisement -->
          <div id="ad-guide-sidebar" class="dynamic-ad-container ad-square mb-4"></div>
          
          <!-- Interactive Table of Contents -->
          ${sidebarTOC}
        </div>
      </div>
    </div>
  </main>

  <!-- Platform Footer -->
  <footer class="footer-modern py-5">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-6">
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="rounded-3 d-inline-block" style="width: 24px; height: 24px; background: linear-gradient(135deg, #3b82f6, #8b5cf6);"></span>
            <strong class="h5 mb-0">AnywhereCoin</strong>
          </div>
          <p class="text-white-50 mb-3">Live cryptocurrency prices in your local currency. Educational guides for crypto beginners to experts.</p>
          <div class="d-flex gap-3">
            <a href="javascript:void(0)" onclick="goToMainSection('market')" class="text-white-50 text-decoration-none">Market</a>
            <a href="javascript:void(0)" onclick="goToMainSection('trending')" class="text-white-50 text-decoration-none">Trending</a>
            <a href="javascript:void(0)" onclick="goToMainSection('learn')" class="text-white-50 text-decoration-none">Learn</a>
            <a href="javascript:void(0)" onclick="goToMainSection('about')" class="text-white-50 text-decoration-none">About</a>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="row g-3">
            <div class="col-6">
              <h6 class="text-white">Navigation</h6>
              <ul class="list-unstyled small">
                <li><a href="javascript:void(0)" onclick="goToMainSection('market')" class="text-white-50 text-decoration-none">Live Prices</a></li>
                <li><a href="javascript:void(0)" onclick="goToMainSection('crypto-news')" class="text-white-50 text-decoration-none">News & Updates</a></li>
                <li><a href="javascript:void(0)" onclick="goToBlog()" class="text-white-50 text-decoration-none">More Guides</a></li>
              </ul>
            </div>
            <div class="col-6">
              <h6 class="text-white">Tools</h6>
              <ul class="list-unstyled small">
                <li><a href="javascript:void(0)" onclick="window.close()" class="text-white-50 text-decoration-none">Close Guide</a></li>
                <li><a href="javascript:void(0)" onclick="window.print()" class="text-white-50 text-decoration-none">Print Guide</a></li>
                <li><a href="javascript:void(0)" onclick="goToMainSection('about')" class="text-white-50 text-decoration-none">About Site</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <hr class="my-4" style="border-color: rgba(255,255,255,0.1);">
      <div class="row align-items-center">
        <div class="col-md-6">
          <p class="small text-white-50 mb-0">© ${new Date().getFullYear()} 28th Bay Digital. Educational content only.</p>
        </div>
        <div class="col-md-6 text-md-end">
          <p class="small text-white-50 mb-0">
            Images courtesy of <a href="https://www.pexels.com" target="_blank" rel="noopener" class="text-white-50">Pexels</a> photographers
          </p>
        </div>
      </div>
    </div>
  </footer>

  <!-- User Interface Controls -->
  <div class="position-fixed bottom-0 end-0 p-3">
    <div class="d-flex flex-column gap-2">
      <button onclick="goToBlog()" class="btn btn-light rounded-circle shadow-lg" style="width: 50px; height: 50px;" title="Back to guides">
        <i class="bi bi-arrow-left fs-5"></i>
      </button>
      <button onclick="goToMainSection('market')" class="back-to-main">
        <i class="bi bi-house-fill me-2"></i>Live Prices
      </button>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="${basePath}ads/ad-system.js"></script>
  
  <script>
    /* ===============================================================================
       WINDOW NAVIGATION MANAGEMENT
       =============================================================================== */
    
    // Handle navigation back to main platform sections
    function goToMainSection(section) {
      if (window.opener && !window.opener.closed) {
        window.opener.focus();
        window.opener.location.href = window.opener.location.origin + window.opener.location.pathname + '#' + section;
        window.close();
      } else {
        window.location.href = '${basePath}index.html#' + section;
      }
    }
    
    // Navigate to blog platform for additional guides
    function goToBlog() {
      if (window.opener && !window.opener.closed) {
        window.opener.location.href = '${basePath}blog/index.html';
        window.close();
      } else {
        window.location.href = '${basePath}blog/index.html';
      }
    }
    
    /* ===============================================================================
       CONTENT INTERACTION CONTROLS
       =============================================================================== */
    
    // Manage collapsible section expansion and collapse
    function toggleSection(button) {
      const section = button.closest('.collapsible-section');
      const content = section.querySelector('.content');
      const icon = button.querySelector('i');
      
      if (section.classList.contains('expanded')) {
        section.classList.remove('expanded');
        icon.className = 'bi bi-chevron-down me-2';
      } else {
        section.classList.add('expanded');
        icon.className = 'bi bi-chevron-up me-2';
      }
    }
    
    // Handle smooth scrolling to content sections from table of contents
    function scrollToHeading(title) {
      const headings = document.querySelectorAll('.guide-content h2, .guide-content h3');
      for (const h of headings) {
        if (h.textContent.trim() === title.trim()) {
          h.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
    }
    
    // Smooth scroll to document top
    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /* ===============================================================================
       ADVERTISEMENT SYSTEM INITIALIZATION
       =============================================================================== */
    
    // Initialize dynamic advertisement system with timing optimization
    function initializeAds() {
      if (typeof window.AdSystem !== 'undefined') {
        window.AdSystem.initialize();
      } else {
        setTimeout(initializeAds, 200);
      }
    }
    
    setTimeout(initializeAds, 100);
  </script>
</body>
</html>`;

  newWindow.document.write(templateHtml);
  newWindow.document.close();
}