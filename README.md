# Bradshaw Plumbing — Cloned Website Template

## Company Overview

| Field | Value |
|---|---|
| **Company** | Bradshaw Plumbing & Heating Inc. |
| **Website** | [bradshawplumbing.com](https://www.bradshawplumbing.com) |
| **Phone** | (416) 286-7511 |
| **Location** | Scarborough, ON (Showroom: 12 Old Kingston Road) |
| **Founded** | 1989 |
| **Services** | Residential Plumbing, Bathroom & Kitchen Renovations, Emergency Service |

## Why This Company Was Chosen

Bradshaw Plumbing has been in business since 1989 but their website is severely outdated:

- **Still shows a COVID-19 popup** from 2020 as the first thing visitors see
- **WordPress theme from 2017** with no modern design elements
- **No structured data / Schema.org** markup
- **Poor mobile optimization** and slow load times
- **No SEO meta optimization** — weak title tags and descriptions
- **Review page** just links to external sites with no social proof on-site
- **Typos** on their services page ("Scarborogh" instead of "Scarborough")

Our template instantly outperforms their current site on every metric.

## Build

```bash
# Default build (uses config.json)
node build.js

# Custom output directory
node build.js --out ./dist
```

## Logo

The original Bradshaw Plumbing logo has been downloaded to `logo.png` in this directory.
Source: `https://www.bradshawplumbing.com/wp-content/uploads/2017/09/logo.png`

## Color Scheme

| Token | Value | Usage |
|---|---|---|
| `primaryAccent` | `#c62828` | Red — CTAs, highlights, links |
| `primaryDark` | `#8e0000` | Dark red — hover states, gradients |
| `navy` | `#1a1a2e` | Dark navy — headers, footer |
| `surface` | `#fafafa` | Light gray — page background |

## Data Sources

- **Phone, services, reviews** → Scraped from bradshawplumbing.com
- **Service areas** → Extracted from their residential plumbing page
- **Reviews** → 3 real reviews from their site (Ray A., Elsa T., Nick M.)
- **Logo** → Downloaded directly from their WordPress media uploads
