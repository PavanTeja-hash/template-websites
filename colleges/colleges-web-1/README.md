# Vidyasagar College website

Static single-page site for a degree college in Rajajinagar, Bengaluru. No build step, no dependencies.

## Folder layout

```
public/                  <- the website. Deploy this folder only.
  index.html             page, SEO tags, structured data (CollegeOrUniversity)
  privacy.html           privacy policy (DPDP Act 2023)
  404.html               "page not found" page
  styles.css             styles and colour tokens
  script.js              menu, animations, results/parent-login messages, contact form (email at CONTACT_EMAIL)
  images/                photos, plus og-image.jpg for link previews
  favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192/512.png, site.webmanifest
  robots.txt, sitemap.xml
  _headers               security and caching headers (Netlify, Cloudflare Pages)
vercel.json              the same headers for Vercel
backup/original-2026-11-26/   the original version (incl. preview.html), untouched
```

## Preview locally

Double-click `preview.bat`, or:

```
cd public
python -m http.server 8005
```

## Go-live checklist

Replace every placeholder (search the whole `public/` folder for each):

| Placeholder | Replace with |
|---|---|
| `vidyasagarcollege.edu.in` | real domain (index.html canonical/OG/JSON-LD, robots.txt, sitemap.xml) and email domain |
| `+91 80 2345 6789` / `+918023456789` | real phone (contact, JSON-LD, privacy) |
| `info@vidyasagarcollege.edu.in` | real email (contact, `CONTACT_EMAIL` in script.js, JSON-LD, privacy) |
| `14, 2nd Main Road, Rajajinagar...` | real address (contact, JSON-LD, privacy) |
| NAAC grade, year founded, stats, programmes, fees, dates | real data |
| `images/*.jpg` | own campus photos (Pexels stand-ins now); keep the same file names, re-make `og-image.jpg` at 1200x630 |
| Timetable / hall ticket / CIA policy buttons, footer Resources links | real PDFs or pages (they point to `#contact` for now) |

Not wired to a backend (they show a polite "not available yet" message):

- **Results lookup** and **Parent login**: connect to the college ERP/results system, or link out to the university results portal.
- **Contact form**: opens the visitor's email app (mailto). For in-page sending, use Formspree/Web3Forms and add their domain to `connect-src` / `form-action` in the CSP.

Then:

1. Deploy `public/` (Vercel: set the output/root to `public`, `vercel.json` sits at the repo root; Netlify/Cloudflare: publish dir `public`).
2. Check headers at securityheaders.com and the page at pagespeed.web.dev.
3. Submit `sitemap.xml` in Google Search Console and set up a Google Business Profile.
4. When you change CSS or JS, bump `?v=2` in the HTML so browsers pick it up.

## If you edit the inline `<head>` script

The CSP allows it by hash. Recompute and paste the new value into `public/_headers` and `vercel.json`:

```
python -c "import re,hashlib,base64;h=open('public/index.html',encoding='utf-8').read();s=re.search(r'<script>(document.*?)</script>',h).group(1);print(base64.b64encode(hashlib.sha256(s.encode()).digest()).decode())"
```

## Palette and fonts

Primary `#1B3A5C` (navy), accent `#E8C547` (gold), background `#F7F8FA`, text `#1A1A2E` / `#5A5A72`. Headings Playfair Display, body Inter (Google Fonts).
