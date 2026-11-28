# LENSCAPE — Photography & Videography Studio Web 4

Single-page site for a Chandigarh wedding and commercial photography/videography studio. Plain HTML, CSS and JS, no build step.

- `public/` is the deploy folder (set it as the output/publish directory).
- `backup/original-2026-11-28/` is the untouched original template.
- `preview.bat` serves `public/` at http://localhost:8023 (needs Python).

## Deploy
- **Vercel:** import the repo, framework "Other", output directory `public`. Headers come from `vercel.json`.
- **Netlify / Cloudflare Pages:** publish directory `public`. Headers come from `public/_headers`.
- Both serve `404.html` for missing pages automatically.

## Go-live checklist
Replace every placeholder, then search the repo for the old value to make sure none are left.

| Item | Placeholder | Where |
|------|-------------|-------|
| Domain | www.lenscape.in | index.html (canonical, og:url, og:image, JSON-LD), robots.txt, sitemap.xml |
| Phone | +91 172 456 7890 / +911724567890 | footer, JSON-LD |
| WhatsApp | +91 98150 45678 / 919815045678 | `WHATSAPP_NUMBER` in script.js (updates every WhatsApp link), footer text. The template sent WhatsApp to the landline, which can't receive WhatsApp. |
| Email | hello@lenscape.in | footer, JSON-LD |
| Address / hours | SCO 42, Sector 17-C, Chandigarh 160017 · Mon-Sat 10 am-7 pm | footer, JSON-LD |
| Claims | 500+ weddings, 8 years / since 2018, 120+ brand clients, 12 crew, two studios, destinations shot, package prices and deliverables, payment terms | hero badge, about, packages, FAQ. Only publish what the studio can back up. |
| Testimonials | Priya & Sahil, Neha K., Arjun & Gurpreet are template text | replace with real client quotes (with consent) or remove the section |
| Photos | Pexels stock in `public/images/` | replace with the studio's own work at the same file names (hero 1200x1500, about 720x900, svc-* 600x800, og-image 1200x630) |
| Portfolio | removed | a photo studio needs one: add a gallery of real work before launch |
| Social links | removed (they pointed to `#`) | add real Instagram / YouTube / Facebook links to the footer |

## What changed from the template
- CSS and JS moved into `styles.css` and `script.js` so a strict Content Security Policy works; inline `style=` attributes replaced with classes.
- Hotlinked Pexels images are now local and resized. The "Portfolio" gallery only repeated the same six stock photos as if they were the studio's work, so it was removed (nav and hero button now point to About / Packages). The "corporate headshots" photo was an office handshake and the "wedding film setup" photo was a beach couple, so those two service cards are now icon tiles; alt text now describes what is actually in each photo.
- Removed the unsourced "4.9 rating" badge (now crew size), named camera/drone brands in the FAQ, a real-sounding brand name in a testimonial ("GlowSkin Co."), and Amazon/Zomato/Swiggy mentions.
- Bug fixes: clicking the logo or any `href="#"` link threw a JavaScript error (`querySelector('#')`); the nav "Book a Call" text was dark on gold due to a CSS specificity clash; the favicon carried ~20 KB of embedded metadata.
- Form: validates a 10-digit Indian mobile and shows inline errors instead of `alert()`; past dates can't be picked; package "Get Quote" buttons preselect the shoot type and package; sends to WhatsApp with a pre-filled brief. Nothing is stored or sent to a server.
- Accessibility: skip link, `<main>` landmark, a real menu button with `aria-expanded`, a focus-trapped drawer that closes on Esc and is hidden from tab order when closed, visible focus outlines, labelled star ratings.
- Added canonical/OG/Twitter tags, JSON-LD, web manifest, 404 page, robots.txt, sitemap.xml, security headers, auto-updating copyright year, `100svh` hero for mobile browsers.

## Security headers / CSP
The CSP allows same-origin scripts plus the one-line inline script in the `<head>` of index.html and 404.html, via its hash (`sha256-EYDBh7GdTLg5qpQU1x/92ognmg3PVaxwV756Vx2FOLA=`). Images must be local. Don't add inline `style=` or `onclick=`. If you change that script, recompute the hash and update `vercel.json` and `public/_headers`:

```
printf "%s" "<exact script text>" | openssl dgst -sha256 -binary | openssl base64
```

After editing CSS/JS, bump the `?v=1` query in both HTML files.
