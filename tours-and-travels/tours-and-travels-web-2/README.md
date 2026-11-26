# Dakshin Yatra Tours website

Static single-page site for a travel agency in Jayanagar, Bengaluru. No build step, no dependencies.

## Folder layout

```
public/                  <- the website. Deploy this folder only.
  index.html             page, SEO tags, structured data
  privacy.html           privacy policy (DPDP Act 2023)
  404.html               "page not found" page
  styles.css             styles and colour tokens
  script.js              menu, animations, WhatsApp enquiry form (WhatsApp number at the top)
  images/                photos, plus og-image.jpg for link previews
  favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192/512.png, site.webmanifest
  robots.txt, sitemap.xml
  _headers               security and caching headers (Netlify, Cloudflare Pages)
vercel.json              the same headers for Vercel
backup/original-2026-11-26/   the original version, untouched
```

## Preview locally

Double-click `preview.bat`, or:

```
cd public
python -m http.server 8004
```

## Go-live checklist

Replace every placeholder (search the whole `public/` folder for each):

| Placeholder | Replace with |
|---|---|
| `dakshinyatra.in` | real domain (index.html canonical/OG/JSON-LD, robots.txt, sitemap.xml) |
| `+91 98765 43210` / `+919876543210` | real phone (header, footer, sticky bar, JSON-LD, privacy) |
| `919876543210` | WhatsApp number: `WHATSAPP_NUMBER` in script.js and the sticky bar link |
| `hello@dakshinyatra.in` | real email (footer, JSON-LD, privacy) |
| `dakshinyatra@ybl` | real UPI ID |
| `42, 11th Cross, Jayanagar...` | real address (footer and JSON-LD) |
| Package names, prices, dates | real offerings |
| `images/*.jpg` | own photos (Pexels stand-ins now); keep the same file names, re-make `og-image.jpg` at 1200x630 |

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

Base `#FFF8F0`, tint `#E8DDD3`, accent `#C8553D`, text `#2B2118` / `#6B5D52`. Headings DM Serif Display, body Inter (Google Fonts).
