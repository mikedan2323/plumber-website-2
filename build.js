#!/usr/bin/env node
/**
 * build.js — Plumbing Website Template Builder
 * 
 * Usage:
 *   node build.js                          # Uses ./config.json → outputs ./dist/index.html
 *   node build.js --config ./client.json   # Uses custom config
 *   node build.js --out ./my-site          # Custom output directory
 * 
 * This script reads a config JSON file and generates a fully static,
 * SEO-optimized index.html ready for deployment.
 */

const fs = require('fs');
const path = require('path');

// --- CLI argument parsing ---
const args = process.argv.slice(2);
function getArg(flag, fallback) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const configPath = path.resolve(getArg('--config', './config.json'));
const outDir = path.resolve(getArg('--out', './dist'));

// --- Load config ---
if (!fs.existsSync(configPath)) {
  console.error(`❌ Config file not found: ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
console.log(`📋 Loaded config for: ${config.companyName}`);

// --- Helper: generate star icons ---
function stars(count, size = 'text-sm') {
  return Array(count).fill(
    `<span class="material-symbols-outlined text-[${config.colors.primaryAccent}] ${size}" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">star</span>`
  ).join('\n');
}

// --- Helper: build review cards ---
function buildReviewCards() {
  return config.reviews.map(r => `
<!-- Review: ${r.name} -->
<div class="bg-surface-container-lowest p-8 shadow-sm border border-outline-variant/5">
<div class="flex justify-between items-start mb-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center font-bold text-on-secondary-container" aria-hidden="true">${r.initials}</div>
<div>
<h3 class="font-bold text-sm">${r.name}</h3>
<span class="text-[0.65rem] uppercase text-[${config.colors.textPrimary}] font-bold">${r.location}</span>
</div>
</div>
<span class="material-symbols-outlined text-blue-500 text-lg" aria-label="Verified review" style="font-variation-settings: 'FILL' 1;">verified</span>
</div>
<div class="flex gap-0.5 mb-3" aria-label="${r.stars} stars">
  ${stars(r.stars)}
</div>
<p class="text-on-surface leading-relaxed italic">"${r.text}"</p>
<p class="text-xs text-[${config.colors.textMuted}] mt-4">Posted on Google — ${r.date}</p>
</div>`).join('\n');
}

// --- Helper: build service area list items ---
function buildServiceAreas() {
  return config.serviceAreas.map(area => `
<li class="flex items-center gap-3 text-sm font-bold tracking-tight">
<span class="w-2 h-2 bg-[${config.colors.primaryAccent}] flex-shrink-0" aria-hidden="true"></span> ${area}
</li>`).join('\n');
}

// --- Helper: build trust badges ---
function buildTrustBadges() {
  return config.trustBadges.map(b => `
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-3xl" aria-hidden="true">${b.icon}</span>
<span class="font-headline font-black text-base md:text-xl">${b.label}</span>
</div>`).join('\n');
}

// --- Helper: build primary service cards ---
function buildPrimaryServices() {
  return config.services.primary.map(s => {
    const href = s.linkHref.replace('{{PHONE_TEL}}', config.phone.tel);
    return `
<div class="group relative aspect-[4/5] overflow-hidden bg-surface-container-highest">
<img alt="${s.imageAlt}" class="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" src="${s.image}"/>
<div class="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" aria-hidden="true"></div>
<div class="absolute bottom-0 left-0 p-8 w-full">
<span class="material-symbols-outlined text-[${config.colors.primaryAccent}] text-4xl mb-4" aria-hidden="true">${s.icon}</span>
<h3 class="text-2xl font-headline font-extrabold text-white uppercase mb-2">${s.title}</h3>
<p class="text-white/70 text-sm mb-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">${s.description}</p>
<a class="text-[${config.colors.primaryAccent}] font-headline font-bold text-[0.65rem] tracking-widest uppercase flex items-center gap-2 min-h-[44px]" href="${href}">
${s.linkText} <span class="material-symbols-outlined text-xs" aria-hidden="true">arrow_forward</span>
</a>
</div>
</div>`;
  }).join('\n');
}

// --- Helper: build secondary service tiles ---
function buildSecondaryServices() {
  return config.services.secondary.map(s => `
<div class="bg-surface-container-low p-4 text-center">
  <span class="material-symbols-outlined text-[${config.colors.primaryDark}] text-2xl mb-2" aria-hidden="true">${s.icon}</span>
  <p class="font-headline font-bold text-sm uppercase">${s.title}</p>
</div>`).join('\n');
}

// --- Helper: build service form options ---
function buildFormOptions() {
  return config.services.formOptions.map(o => `<option>${o}</option>`).join('\n');
}

// --- Helper: build guarantees ---
function buildGuarantees() {
  return config.guarantees.map(g => `
<div class="text-center">
  <span class="material-symbols-outlined text-[${config.colors.primaryAccent}] text-5xl mb-4" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">${g.icon}</span>
  <h3 class="font-headline font-bold text-lg uppercase mb-2">${g.title}</h3>
  <p class="text-[#abc8f5] text-sm">${g.description}</p>
</div>`).join('\n');
}

// --- Helper: build Schema.org JSON-LD ---
function buildSchema() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Plumber",
    "name": `${config.companyName} Plumbing`,
    "description": `24/7 emergency plumbing, drain cleaning, and sewer repair across the ${config.location.metroAreaFull}.`,
    "url": `https://${config.domain}`,
    "telephone": config.phone.tel,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": config.location.city,
      "addressRegion": config.location.region,
      "addressCountry": config.location.country
    },
    "areaServed": config.schemaAreaServed,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": config.stats.averageRating,
      "reviewCount": String(config.stats.reviewCountNumber),
      "bestRating": "5"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "priceRange": "$$"
  }, null, 2);
}

// --- Helper: build social links ---
function buildSocialLinks() {
  const iconMap = { share: 'share', email: 'mail', phone: 'phone_in_talk' };
  return config.socialLinks.map(s => {
    const url = s.url.replace('{{EMAIL}}', config.email).replace('{{PHONE_TEL}}', config.phone.tel);
    return `
<a href="${url}" class="min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="${s.label}">
  <span class="material-symbols-outlined text-[${config.colors.textMuted}] hover:text-[${config.colors.primaryAccent}] transition-colors duration-200" aria-hidden="true">${iconMap[s.type] || s.type}</span>
</a>`;
  }).join('\n');
}

// --- Helper: build nav logo (image or text fallback) ---
function buildNavLogo() {
  if (config.images && config.images.logo) {
    return `<img src="${config.images.logo}" alt="${config.companyName} logo" class="h-10 md:h-12 w-auto max-w-[220px] object-contain" style="mix-blend-mode: multiply;" />`;
  }
  return config.companyName;
}

// --- Helper: build footer logo (image or text fallback) ---
function buildFooterLogo() {
  if (config.images && config.images.logo) {
    return `<div class="bg-white rounded-lg px-4 py-2 inline-block mb-4"><img src="${config.images.logo}" alt="${config.companyName} logo" class="h-10 w-auto max-w-[180px] object-contain" /></div>`;
  }
  return `<div class="text-xl font-black text-white mb-4 uppercase tracking-tight font-headline">${config.companyName}</div>`;
}

// --- Build the full HTML ---
const html = `<!DOCTYPE html>
<html class="light" lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>24/7 ${config.location.metroArea} Plumber | ${config.companyName} — Emergency Plumbing, Drain & Sewer Services</title>
<meta name="description" content="${config.companyName} delivers 24/7 emergency plumbing, drain cleaning, and sewer repair across the ${config.location.metroAreaFull}. Red Seal Certified, BBB A+ Accredited. Call ${config.phone.display} for same-day service. Free estimates available."/>
<meta name="keywords" content="plumber ${config.location.city}, emergency plumber ${config.location.metroArea}, 24/7 plumbing, drain cleaning, sewer repair, leak detection, ${config.location.city} plumber"/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="https://${config.domain}/"/>
<!-- Open Graph -->
<meta property="og:title" content="24/7 ${config.location.metroArea} Plumber | ${config.companyName}"/>
<meta property="og:description" content="Emergency plumbing, drain & sewer services across the ${config.location.metroArea}. Red Seal Certified. BBB A+ Accredited. Free estimates."/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="https://${config.domain}/"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=${config.fonts.headline}:wght@400;600;700;800&family=${config.fonts.body}:wght@400;500;600&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "secondary-container": "#bcd2fe",
                    "surface-container-high": "#dfe8ff",
                    "tertiary-fixed-dim": "#abc8f5",
                    "inverse-on-surface": "#ecf0ff",
                    "on-secondary": "#ffffff",
                    "on-error-container": "#93000a",
                    "surface-tint": "#785900",
                    "surface-container": "#e8eeff",
                    "primary-fixed-dim": "${config.colors.primaryAccent}",
                    "tertiary-container": "#001c39",
                    "outline-variant": "#c4c6cf",
                    "on-secondary-container": "#445a7f",
                    "primary-container": "#261a00",
                    "on-primary-container": "${config.colors.primaryDark}",
                    "on-primary": "#ffffff",
                    "surface-dim": "#c9dbff",
                    "on-surface": "${config.colors.navy}",
                    "surface-container-highest": "#d6e3ff",
                    "on-tertiary": "#ffffff",
                    "primary-fixed": "#ffdf9e",
                    "surface-container-low": "#f0f3ff",
                    "on-error": "#ffffff",
                    "error-container": "#ffdad6",
                    "inverse-primary": "${config.colors.primaryAccent}",
                    "secondary": "#495f84",
                    "on-background": "${config.colors.navy}",
                    "surface": "${config.colors.surface}",
                    "secondary-fixed-dim": "#b1c7f2",
                    "tertiary": "#000000",
                    "secondary-fixed": "#d6e3ff",
                    "on-tertiary-fixed-variant": "#2a486e",
                    "on-tertiary-fixed": "#001c39",
                    "outline": "${config.colors.textMuted}",
                    "on-secondary-fixed-variant": "#31476b",
                    "on-primary-fixed": "#261a00",
                    "surface-variant": "#d6e3ff",
                    "on-tertiary-container": "#6885af",
                    "inverse-surface": "#193053",
                    "background": "${config.colors.surface}",
                    "on-surface-variant": "${config.colors.textSecondary}",
                    "tertiary-fixed": "#d3e3ff",
                    "surface-bright": "${config.colors.surface}",
                    "primary": "#000000",
                    "on-secondary-fixed": "${config.colors.navy}",
                    "surface-container-lowest": "#ffffff",
                    "error": "#ba1a1a",
                    "on-primary-fixed-variant": "#5b4300"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "fontFamily": {
                    "headline": ["${config.fonts.headline}"],
                    "body": ["${config.fonts.body}"],
                    "label": ["${config.fonts.body}"]
            }
          },
        },
      }
    </script>
<style>
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
      .golden-gradient {
        background: linear-gradient(135deg, ${config.colors.primaryAccent} 0%, ${config.colors.primaryDark} 100%);
      }
      .ghost-border {
        border: 1px solid rgba(196, 198, 207, 0.15);
      }
      .architectural-line {
        position: relative;
      }
      .architectural-line::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: ${config.colors.primaryDark};
        transform: scaleX(0);
        transition: transform 0.3s ease;
      }
      .architectural-line:focus-within::after {
        transform: scaleX(1);
      }
      /* UI/UX: Focus states for keyboard navigation */
      *:focus-visible {
        outline: 2px solid ${config.colors.primaryAccent};
        outline-offset: 2px;
      }
      /* UI/UX: Respect prefers-reduced-motion */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
      /* UI/UX: Cursor pointer on clickable elements */
      a, button, [role="button"], select, input[type="submit"] {
        cursor: pointer;
      }
      /* Emergency banner pulse */
      @keyframes urgentPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .urgent-pulse {
        animation: urgentPulse 2s ease-in-out infinite;
      }
    </style>
<!-- Schema.org Structured Data -->
<script type="application/ld+json">
${buildSchema()}
</script>
</head>
<body class="bg-surface font-body text-on-surface selection:bg-primary-fixed-dim">
<!-- UI/UX: Skip to content link for accessibility -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-[${config.colors.primaryAccent}] focus:text-[#261a00] focus:px-4 focus:py-2 focus:font-bold">Skip to main content</a>

<!-- Emergency urgency banner with click-to-call -->
<div class="bg-[${config.colors.navy}] text-white py-2.5 px-4 text-center text-sm font-headline z-[60] relative">
  <div class="flex justify-center items-center gap-3 flex-wrap">
    <span class="material-symbols-outlined text-[${config.colors.primaryAccent}] text-lg urgent-pulse" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">emergency</span>
    <span class="font-bold uppercase tracking-wider text-xs">24/7 Emergency Plumbing</span>
    <span class="text-white/40">|</span>
    <a href="tel:${config.phone.tel}" class="text-[${config.colors.primaryAccent}] font-extrabold text-base hover:text-white transition-colors duration-200 flex items-center gap-1.5 min-h-[44px] leading-[44px]" aria-label="Call us now at ${config.phone.display}">
      <span class="material-symbols-outlined text-sm" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">call</span>
      ${config.phone.display}
    </a>
    <span class="text-white/40 hidden sm:inline">|</span>
    <span class="text-[#abc8f5] text-xs hidden sm:inline">Free Estimates · Same-Day Service</span>
  </div>
</div>

<!-- Top Navigation -->
<nav class="sticky top-0 w-full z-50 bg-[${config.colors.surface}]/85 dark:bg-[${config.colors.navy}]/85 backdrop-blur-xl shadow-[0_40px_60px_-15px_rgba(0,27,61,0.06)]" aria-label="Main navigation">
<div class="flex justify-between items-center px-6 md:px-8 py-4 max-w-full mx-auto">
<a href="/" class="text-2xl font-black tracking-tighter text-[#000000] dark:text-white font-headline flex items-center" aria-label="${config.companyName} home">
                ${buildNavLogo()}
            </a>
<div class="hidden md:flex gap-8 items-center font-headline uppercase tracking-tight font-bold">
<a class="text-[${config.colors.primaryAccent}] border-b-2 border-[${config.colors.primaryAccent}] pb-1 transition-colors duration-200" href="#services">Services</a>
<a class="text-[${config.colors.textSecondary}] hover:text-[${config.colors.primaryAccent}] transition-colors duration-200" href="#reviews">Reviews</a>
<a class="text-[${config.colors.textSecondary}] hover:text-[${config.colors.primaryAccent}] transition-colors duration-200" href="#service-areas">Service Areas</a>
<a class="text-[${config.colors.textSecondary}] hover:text-[${config.colors.primaryAccent}] transition-colors duration-200" href="#contact">Contact</a>
</div>
<div class="flex items-center gap-4">
<a href="tel:${config.phone.tel}" class="hidden lg:flex items-center gap-2 text-[${config.colors.navy}] font-headline font-bold text-sm min-h-[44px]" aria-label="Call ${config.phone.display}">
  <span class="material-symbols-outlined text-[${config.colors.primaryAccent}]" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">call</span>
  ${config.phone.display}
</a>
<a href="#contact" class="golden-gradient text-[#261a00] px-6 py-2.5 font-headline font-bold uppercase tracking-wider text-sm hover:-translate-y-0.5 transition-transform duration-200 shadow-lg min-h-[44px] flex items-center">
                    Get Free Estimate
                </a>
<!-- UI/UX: Mobile hamburger menu -->
<button id="mobile-menu-toggle" class="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-menu">
  <span class="material-symbols-outlined text-2xl text-[${config.colors.navy}]" aria-hidden="true">menu</span>
</button>
</div>
</div>
<!-- Mobile menu -->
<div id="mobile-menu" class="hidden md:hidden bg-[${config.colors.surface}] border-t border-outline-variant/20 px-6 py-4" role="navigation" aria-label="Mobile navigation">
  <div class="flex flex-col gap-4 font-headline uppercase tracking-tight font-bold">
    <a class="text-[${config.colors.textSecondary}] hover:text-[${config.colors.primaryAccent}] transition-colors duration-200 py-2 min-h-[44px] flex items-center" href="#services">Services</a>
    <a class="text-[${config.colors.textSecondary}] hover:text-[${config.colors.primaryAccent}] transition-colors duration-200 py-2 min-h-[44px] flex items-center" href="#reviews">Reviews</a>
    <a class="text-[${config.colors.textSecondary}] hover:text-[${config.colors.primaryAccent}] transition-colors duration-200 py-2 min-h-[44px] flex items-center" href="#service-areas">Service Areas</a>
    <a class="text-[${config.colors.textSecondary}] hover:text-[${config.colors.primaryAccent}] transition-colors duration-200 py-2 min-h-[44px] flex items-center" href="#contact">Contact</a>
    <a href="tel:${config.phone.tel}" class="golden-gradient text-[#261a00] px-6 py-3 font-headline font-bold uppercase tracking-wider text-sm text-center min-h-[44px] flex items-center justify-center gap-2">
      <span class="material-symbols-outlined text-sm" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">call</span>
      Call ${config.phone.display}
    </a>
  </div>
</div>
</nav>

<main id="main-content" class="pt-0">
<!-- Hero Section -->
<section class="relative min-h-[85vh] flex flex-col md:flex-row items-stretch overflow-hidden" aria-labelledby="hero-heading">
<!-- Left Side: Content -->
<div class="flex-1 px-6 md:px-16 lg:px-24 py-16 flex flex-col justify-center bg-surface">
<div class="max-w-2xl">
<span class="inline-block py-1 px-3 bg-secondary-container text-on-secondary-container text-[0.65rem] font-bold tracking-widest uppercase mb-6 rounded-sm">
                        ${config.heroSubBadge}
                    </span>
<h1 id="hero-heading" class="text-4xl sm:text-5xl lg:text-7xl font-headline font-extrabold tracking-tighter text-primary leading-[0.95] mb-8 uppercase">
                        ${config.tagline}
                    </h1>
<p class="text-lg text-[${config.colors.textPrimary}] leading-relaxed mb-10 max-w-xl">
                        ${config.heroDescription}
                    </p>
<div class="flex items-center gap-8 mb-10">
<div class="flex flex-col">
<span class="text-3xl font-black text-on-surface">24/7</span>
<span class="text-[0.7rem] uppercase tracking-widest text-[${config.colors.textPrimary}] font-bold">Emergency Dispatch</span>
</div>
<div class="w-px h-12 bg-outline-variant opacity-30" aria-hidden="true"></div>
<div class="flex flex-col">
<span class="text-3xl font-black text-on-surface">${config.stats.yearsInBusiness}</span>
<span class="text-[0.7rem] uppercase tracking-widest text-[${config.colors.textPrimary}] font-bold">${config.stats.yearsLabel}</span>
</div>
<div class="w-px h-12 bg-outline-variant opacity-30 hidden sm:block" aria-hidden="true"></div>
<div class="hidden sm:flex flex-col">
<span class="text-3xl font-black text-on-surface">${config.stats.reviewCount}</span>
<span class="text-[0.7rem] uppercase tracking-widest text-[${config.colors.textPrimary}] font-bold">5-Star Reviews</span>
</div>
</div>
<div class="flex flex-wrap gap-4">
<a href="tel:${config.phone.tel}" class="golden-gradient text-[#261a00] px-8 py-4 font-headline font-bold uppercase tracking-wider text-sm hover:-translate-y-0.5 transition-transform duration-200 shadow-lg flex items-center gap-2 min-h-[48px]">
  <span class="material-symbols-outlined text-lg" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">call</span>
  Call Now — Free Estimate
</a>
<a href="#contact" class="bg-transparent border-2 border-[${config.colors.navy}] text-[${config.colors.navy}] px-8 py-4 font-headline font-bold uppercase tracking-wider text-sm hover:bg-[${config.colors.navy}] hover:text-white transition-colors duration-200 flex items-center gap-2 min-h-[48px]">
  Book Online
</a>
</div>
</div>
</div>
<!-- Right Side: Contact Form -->
<div class="flex-1 relative flex items-center justify-center p-6 md:p-16" id="contact">
<!-- Background Image -->
<div class="absolute inset-0 z-0" aria-hidden="true">
<img alt="" class="w-full h-full object-cover grayscale opacity-10" src="${config.images.heroBackground}"/>
</div>
<div class="relative z-10 w-full max-w-md bg-surface-container-lowest p-10 shadow-[0_40px_80px_-15px_rgba(0,27,61,0.12)] border border-outline-variant/10">
<h2 class="text-2xl font-headline font-bold text-on-surface mb-2 uppercase tracking-tight">Request a Free Estimate</h2>
<p class="text-sm text-[${config.colors.textPrimary}] mb-8">Same-day response for emergency and priority requests.</p>
<form class="space-y-6" aria-label="Request service form">
<div class="architectural-line bg-surface-container-high p-4">
<label for="full-name" class="block text-[0.65rem] uppercase tracking-widest text-[${config.colors.textPrimary}] font-bold mb-1">Full Name</label>
<input id="full-name" class="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface placeholder:text-outline min-h-[32px]" placeholder="Your full name" type="text" required aria-required="true"/>
</div>
<div class="architectural-line bg-surface-container-high p-4">
<label for="service-type" class="block text-[0.65rem] uppercase tracking-widest text-[${config.colors.textPrimary}] font-bold mb-1">Service Type</label>
<select id="service-type" class="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface min-h-[32px]" aria-required="true">
${buildFormOptions()}
</select>
</div>
<div class="architectural-line bg-surface-container-high p-4">
<label for="phone" class="block text-[0.65rem] uppercase tracking-widest text-[${config.colors.textPrimary}] font-bold mb-1">Phone Number</label>
<input id="phone" class="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface placeholder:text-outline min-h-[32px]" placeholder="${config.phone.display.replace(/\\d/g, '0')}" type="tel" required aria-required="true"/>
</div>
<button class="w-full golden-gradient text-[#261a00] py-4 font-headline font-extrabold uppercase tracking-widest text-sm hover:-translate-y-1 transition-transform duration-200 min-h-[48px]" type="submit">
                            Get My Free Estimate
                        </button>
<p class="text-center text-xs text-[${config.colors.textMuted}]">
  <span class="material-symbols-outlined text-xs align-middle mr-1" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">lock</span>
  Your info is secure. We respond within 30 minutes.
</p>
</form>
</div>
</div>
</section>

<!-- Trust Ribbon -->
<section class="bg-surface-container-low py-10 px-6 border-y border-outline-variant/10" aria-label="Trust certifications">
<div class="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-12 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
${buildTrustBadges()}
</div>
</section>

<!-- Service Grid -->
<section id="services" class="py-20 md:py-24 px-6 md:px-8 bg-surface" aria-labelledby="services-heading">
<div class="max-w-7xl mx-auto">
<div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
<div class="max-w-xl">
<span class="text-primary-fixed-dim font-headline font-bold uppercase tracking-[0.3em] text-xs">Our Services</span>
<h2 id="services-heading" class="text-3xl md:text-5xl font-headline font-black text-primary mt-4 uppercase leading-none">Complete Plumbing <br/>Solutions</h2>
</div>
<p class="text-[${config.colors.textPrimary}] max-w-xs text-sm leading-relaxed">
                        We deploy advanced diagnostic equipment and precision craftsmanship to resolve the most complex plumbing challenges.
                    </p>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-1">
${buildPrimaryServices()}
</div>
<div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
${buildSecondaryServices()}
</div>
</div>
</section>

<!-- Why Choose Us -->
<section class="py-16 px-6 md:px-8 bg-[${config.colors.navy}] text-white" aria-labelledby="why-heading">
  <div class="max-w-7xl mx-auto">
    <h2 id="why-heading" class="text-3xl md:text-4xl font-headline font-black uppercase text-center mb-12">Why ${config.location.metroArea} Homeowners Choose Us</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
${buildGuarantees()}
    </div>
  </div>
</section>

<!-- Social Proof: Google Reviews -->
<section id="reviews" class="py-20 md:py-24 bg-surface-container-low overflow-hidden" aria-labelledby="reviews-heading">
<div class="max-w-7xl mx-auto px-6 md:px-8">
<div class="flex flex-col items-center text-center mb-16">
<div class="flex gap-1 mb-4" aria-label="5 out of 5 stars">
${stars(5)}
</div>
<h2 id="reviews-heading" class="text-3xl font-headline font-black uppercase text-on-surface">What Our Customers Say</h2>
<p class="text-[${config.colors.textPrimary}] mt-2 text-base">Rated <strong>${config.stats.averageRating}/5</strong> from <strong>${config.stats.reviewCount} verified Google Reviews</strong></p>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
${buildReviewCards()}
</div>
<div class="text-center mt-10">
  <a href="${config.googleReviewsUrl}" class="text-[${config.colors.primaryDark}] font-headline font-bold uppercase tracking-widest text-sm hover:text-[${config.colors.primaryAccent}] transition-colors duration-200 inline-flex items-center gap-2 min-h-[44px]" target="_blank" rel="noopener noreferrer">
    Read All ${config.stats.reviewCount} Reviews on Google
    <span class="material-symbols-outlined text-sm" aria-hidden="true">open_in_new</span>
  </a>
</div>
</div>
</section>

<!-- Service Area / Map -->
<section id="service-areas" class="bg-on-background py-20 md:py-24 px-6 md:px-8 overflow-hidden" aria-labelledby="areas-heading">
<div class="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
<div class="flex-1 text-white">
<span class="text-primary-fixed-dim font-headline font-bold uppercase tracking-[0.3em] text-xs">Service Coverage</span>
<h2 id="areas-heading" class="text-4xl md:text-6xl font-headline font-black mt-6 mb-8 uppercase leading-[0.9]">We Cover <br/>the Entire ${config.location.metroArea}</h2>
<p class="text-tertiary-fixed-dim text-lg mb-10 max-w-md">
                        Rapid-response teams strategically positioned across the ${config.location.metroAreaFull}. ${config.stats.responseTime} maximum arrival for all emergency calls.
                    </p>
<ul class="grid grid-cols-2 sm:grid-cols-3 gap-3">
${buildServiceAreas()}
</ul>
</div>
<div class="flex-1 w-full relative">
<div class="aspect-square bg-surface-container-lowest/5 border border-white/10 p-4">
<div class="w-full h-full bg-on-surface relative overflow-hidden grayscale">
<img alt="Map of ${config.companyName} service areas across the ${config.location.metroAreaFull}" class="w-full h-full object-cover opacity-30" src="${config.images.mapImage}"/>
<!-- Tactical Markers -->
<div class="absolute top-1/3 left-1/2 w-4 h-4 bg-[${config.colors.primaryAccent}] animate-pulse rounded-full" aria-hidden="true"></div>
<div class="absolute top-1/2 left-1/4 w-4 h-4 bg-[${config.colors.primaryAccent}] animate-pulse rounded-full" aria-hidden="true"></div>
<div class="absolute bottom-1/3 right-1/3 w-4 h-4 bg-[${config.colors.primaryAccent}] animate-pulse rounded-full" aria-hidden="true"></div>
</div>
</div>
</div>
</div>
</section>

<!-- Final Conversion / Voucher -->
<section class="py-20 md:py-24 px-6 md:px-8 bg-surface" aria-labelledby="cta-heading">
<div class="max-w-4xl mx-auto relative group">
<div class="absolute -inset-4 border-2 border-primary-fixed-dim/20 scale-105 group-hover:scale-100 transition-transform duration-700" aria-hidden="true"></div>
<div class="bg-on-background p-10 md:p-20 text-center relative z-10 overflow-hidden">
<!-- Texture Decor -->
<div class="absolute top-0 right-0 p-4 opacity-10" aria-hidden="true">
<span class="material-symbols-outlined text-white text-9xl">architecture</span>
</div>
<h2 id="cta-heading" class="text-3xl md:text-5xl font-headline font-black text-white uppercase mb-6 tracking-tight">${config.promotion.headline}</h2>
<p class="text-white/60 mb-12 max-w-lg mx-auto">${config.promotion.description}</p>
<div class="inline-flex flex-col items-center bg-white/5 border border-white/10 p-8 mb-12">
<span class="text-[0.65rem] text-primary-fixed-dim font-bold tracking-[0.4em] uppercase mb-2">${config.promotion.label}</span>
<div class="text-5xl md:text-6xl font-black text-white">${config.promotion.amount}</div>
<span class="text-[0.7rem] text-white/40 mt-4 uppercase tracking-widest">${config.promotion.detail}</span>
</div>
<div class="flex flex-col md:flex-row gap-4 justify-center">
<a href="tel:${config.phone.tel}" class="golden-gradient text-[#261a00] px-12 py-5 font-headline font-black uppercase tracking-widest text-sm hover:-translate-y-1 transition-transform duration-200 inline-flex items-center justify-center gap-2 min-h-[48px]">
  <span class="material-symbols-outlined text-lg" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">call</span>
  Call ${config.phone.display}
</a>
<a href="#contact" class="bg-transparent border border-white/20 text-white px-12 py-5 font-headline font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-colors duration-200 inline-flex items-center justify-center min-h-[48px]">
                            Book Online
                        </a>
</div>
</div>
</div>
</section>
</main>

<!-- Footer -->
<footer class="bg-[#000000] py-16 px-6 md:px-12 w-full font-body text-sm leading-relaxed" role="contentinfo">
<div class="flex flex-col md:flex-row justify-between items-start w-full gap-12 max-w-7xl mx-auto">
<div class="max-w-sm">
${buildFooterLogo()}
<p class="text-[${config.colors.textMuted}] mb-4">
                    ${config.footerDescription}
                </p>
<p class="text-white font-bold text-lg mb-6">
  <a href="tel:${config.phone.tel}" class="hover:text-[${config.colors.primaryAccent}] transition-colors duration-200">${config.phone.display}</a>
</p>
<div class="flex gap-4">
${buildSocialLinks()}
</div>
</div>
<div class="grid grid-cols-2 gap-12 md:gap-16">
<div>
<h3 class="text-white font-bold uppercase tracking-widest text-[0.7rem] mb-6">Services</h3>
<ul class="space-y-3">
<li><a class="text-[${config.colors.textMuted}] hover:text-white transition-colors duration-200 min-h-[44px] inline-flex items-center" href="#services">Emergency Repair</a></li>
<li><a class="text-[${config.colors.textMuted}] hover:text-white transition-colors duration-200 min-h-[44px] inline-flex items-center" href="#services">Drain Cleaning</a></li>
<li><a class="text-[${config.colors.textMuted}] hover:text-white transition-colors duration-200 min-h-[44px] inline-flex items-center" href="#services">Leak Detection</a></li>
<li><a class="text-[${config.colors.textMuted}] hover:text-white transition-colors duration-200 min-h-[44px] inline-flex items-center" href="#services">Installation</a></li>
<li><a class="text-[${config.colors.textMuted}] hover:text-white transition-colors duration-200 min-h-[44px] inline-flex items-center" href="#services">Water Heaters</a></li>
</ul>
</div>
<div>
<h3 class="text-white font-bold uppercase tracking-widest text-[0.7rem] mb-6">Company</h3>
<ul class="space-y-3">
<li><a class="text-[${config.colors.textMuted}] hover:text-white transition-colors duration-200 min-h-[44px] inline-flex items-center" href="#service-areas">Service Areas</a></li>
<li><a class="text-[${config.colors.textMuted}] hover:text-white transition-colors duration-200 min-h-[44px] inline-flex items-center" href="#reviews">Reviews</a></li>
<li><a class="text-[${config.colors.textMuted}] hover:text-white transition-colors duration-200 min-h-[44px] inline-flex items-center" href="#">Careers</a></li>
<li><a class="text-[${config.colors.textMuted}] hover:text-white transition-colors duration-200 min-h-[44px] inline-flex items-center" href="#">Privacy Policy</a></li>
</ul>
</div>
</div>
</div>
<div class="mt-16 pt-8 border-t border-white/5 text-[${config.colors.textMuted}] text-xs flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
<p>© ${config.copyright.year} ${config.legalName}. All rights reserved. Licensed & Insured.</p>
<p class="uppercase tracking-widest font-bold text-[${config.colors.primaryAccent}]">${config.footerTagline}</p>
</div>
</footer>

<!-- Persistent FAB for mobile/urgent conversion -->
<div class="fixed bottom-6 right-6 z-[100] md:hidden">
<a href="tel:${config.phone.tel}" class="w-16 h-16 golden-gradient rounded-full shadow-2xl flex items-center justify-center text-[#261a00]" aria-label="Call ${config.companyName} for emergency plumbing">
<span class="material-symbols-outlined text-3xl" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">call</span>
</a>
</div>

<!-- Mobile menu toggle script -->
<script>
  document.getElementById('mobile-menu-toggle').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden');
    this.setAttribute('aria-expanded', !isOpen);
    const icon = this.querySelector('.material-symbols-outlined');
    icon.textContent = isOpen ? 'menu' : 'close';
  });
</script>
</body>
</html>`;

// --- Write output ---
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'index.html');
fs.writeFileSync(outPath, html, 'utf-8');

const sizeKB = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
console.log(`✅ Built ${outPath} (${sizeKB} KB)`);
console.log(`   Company: ${config.companyName}`);
console.log(`   Phone:   ${config.phone.display}`);
console.log(`   Domain:  ${config.domain}`);
console.log(`   Areas:   ${config.serviceAreas.length} service areas`);
console.log(`   Reviews: ${config.reviews.length} testimonials`);
