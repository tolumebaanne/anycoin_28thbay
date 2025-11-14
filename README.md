# AnywhereCoin

A fully client side cryptocurrency dashboard designed to be fast, self sustaining, and completely accessible without a backend. This project powers **ac dot 28thbaydigital dot com**, combining live crypto market data with a modular guide system, responsive UI, and a custom animated ad framework.

---

## Overview

AnywhereCoin is built as a performance focused static web application. It delivers live cryptocurrency pricing, regional currency detection, caching, dynamic content rendering, and a complete learning hub powered through markdown. The site is entirely browser driven which keeps it lightweight, reliable, and simple to deploy.

The goal was to create a project that:

* Operates without a server.
* Updates itself automatically.
* Serves real time content.
* Organizes learning material elegantly.
* Demonstrates scalable front end architecture.
* Reflects clean, professional development practices.

---

## Key Features

### Live Crypto Pricing

* Uses CoinGecko API for real time data.
* Updates at five minute intervals.
* Converts all prices into the user’s detected regional currency.

### Regional Currency Detection

* Automatically identifies the visitor’s locale.
* Adjusts displayed currency without requiring settings.

### Local Storage Caching

* Minimizes API calls.
* Reduces load times.
* Ensures smooth repeated visits.

### Markdown Based Guide System

* Guides stored as markdown files.
* Converted into structured HTML using a shared template engine.
* Supports difficulty levels, excerpts, read time, and metadata.
* Includes a category, sidebar, and full page rendering.

### Responsive and Theme Aware UI

* Modern layout optimized for all device sizes.
* Automatic night mode.
* Image lazy loading, transitions, and clean typography.

### Custom Animated Ad System

* Fully modular ad placeholders.
* Smooth animations and content rotation.
* Theme aware and responsive.
* Ready for integration with external ad networks.

---

## Technical Architecture

### Front End Only

All logic is written in JavaScript and runs in the browser. The project is structured as a set of modular files:

* **index.html** handles the dashboard and routing to the guide hub.
* **app.js** and **functions.js** manage shared utilities.
* **blog scripts** load and render guides by category.
* **template.html** is used to generate guide pages dynamically.
* **ad system** controls animated ad components.

### Data Flow

1. User loads the site.
2. Browser detects region.
3. CoinGecko is queried and results cached.
4. UI updates based on cached or fresh data.
5. When a guide is opened, markdown is fetched and converted into HTML.

### Guides Rendering Logic

* Markdown parsed into HTML blocks.
* Template placeholders replaced with guide metadata.
* Layout and navigation applied automatically.

---

## Technologies Used

* HTML, CSS, JavaScript
* CoinGecko API
* Local Storage
* Markdown parsing
* Bootstrap (light usage)
* Custom animation systems

---

## File Structure

```
root/
│ index.html
│ styles.css
│ app.js
├── guides/
│   ├── content/
│   │   └── *.md
│   ├── template.html
│   └── guides.js
├── shared/
│   └── functions.js
├── ads/
│   ├── ad system.js
│   └── ad styles.css
└── blog/
    ├── index.html
    ├── blog scripts.js
    └── blog styles.css
```

---

## Installation and Setup

This project is static and requires no server.

1. Clone the repository.
2. Open `index.html` in a browser.
3. Deploy by uploading files to any static hosting service.

---

## Deployment

Can be hosted through:

* Cloudflare Pages
* Netlify
* Vercel
* GitHub Pages
* Any static web server

The current live deployment is at:
**ac dot 28thbaydigital dot com**

---

## Development Goals and Approach

This project was created to:

* Demonstrate strong front end engineering.
* Build a self updating tool that needs no backend.
* Explore dynamic content rendering.
* Create a modular system that can scale.
* Blend clean UI work with functional architecture.
* Show capability in constructing complete web applications from the ground up.

The focus was on clarity, performance, accessibility, and a clean development workflow.

---

## Future Improvements

* Adding more guides.
* Including search functionality.
* Expanding analytics.
* Optional user settings panel.

---

## Author

**Tolu Mebaanne**
Media and Technology Developer
Creator of AnywhereCoin

---
