# NEXEVENT — Corporate Event Management & AV Production Web 3

Single-page site for a Mumbai corporate event management and AV production company. Plain HTML, CSS and JS, no build step.

- `public/` is the deploy folder (set it as the output/publish directory).
- `backup/original-2026-11-28/` is the untouched original template.
- `preview.bat` serves `public/` at http://localhost:8022 (needs Python).

## Deploy
- **Vercel:** import the repo, framework "Other", output directory `public`. Headers come from `vercel.json`.
- **Netlify / Cloudflare Pages:** publish directory `public`. Headers come from `public/_headers`.
- Both serve `404.html` for missing pages automatically.

## Go-live checklist
Replace every placeholder, then search the repo for the old value to make sure none are left.

| Item | Placeholder | Where |
|------|-------------|-------|
| Domain | www.nexevent.in | index.html (canonical, og:url, og:image, JSON-LD), robots.txt, sitemap.xml |
| Phone | +91 22 4890 1234 / +912248901234 | footer, JSON-LD |
| WhatsApp | +91 98204 56789 / 919820456789 | footer, floating button, `WHATSAPP_NUMBER` in script.js. The template sent WhatsApp to the landline, which can't receive WhatsApp. |
| Email | brief@nexevent.in | footer, JSON-LD |
| Address / hours | WeWork BKC, Mumbai 400051 · Mon-Sat 10 am-7 pm | footer, JSON-LD |
| Claims | 400+ events, 12 years, 60+ clients, 18 cities, in-house AV gear and crew, "Now booking Q1 2027", price ranges in the FAQ | hero, why us, FAQ. Only publish what the company can back up. |
| Testimonials | Rohit K. (TechNova), Ananya M. (Luxara), Siddharth P. (FinServe) are template text | replace with real client quotes (with consent) or remove the section |
| Photos | Pexels stock in `public/images/` | replace with real event photos at the same file names (hero 1800 wide, photo-301987 800x600, og-image 1200x630) |
| Social links | removed (they pointed to `#`) | add real Instagram / LinkedIn / YouTube links to the footer if wanted |

## What changed from the template
- CSS and JS moved into `styles.css` and `script.js` so a strict Content Security Policy works; inline `style=` attributes replaced with classes.
- Hotlinked Pexels images are now local. Several didn't match their captions (award night was a beach wedding, brand activation was bridal henna hands, dealer meet was an empty wedding hall, product launch was people at a desk), so the service cards are now text-only and the duplicate image strip is gone.
- The "Selected Work" section listed made-up case studies at real venues (Jio World Centre, Four Seasons, Grand Hyatt). It was removed; add it back only with real projects and photos.
- Bug fix: clicking the logo or any `href="#"` link threw a JavaScript error (`querySelector('#')`).
- Form: validates a 10-digit Indian mobile and shows inline errors instead of `alert()`; the date picker can't pick past dates; sends to WhatsApp with a pre-filled brief. Nothing is stored or sent to a server.
- Accessibility: skip link, `<main>` landmark, a real menu button with `aria-expanded`, a focus-trapped drawer that closes on Esc and is hidden from tab order when closed, visible focus outlines.
- Added canonical/OG/Twitter tags, JSON-LD, web manifest, 404 page, robots.txt, sitemap.xml, security headers, and an auto-updating copyright year.

## Security headers / CSP
The CSP allows same-origin scripts plus the one-line inline script in the `<head>` of index.html and 404.html, via its hash (`sha256-EYDBh7GdTLg5qpQU1x/92ognmg3PVaxwV756Vx2FOLA=`). Images must be local. Don't add inline `style=` or `onclick=`. If you change that script, recompute the hash and update `vercel.json` and `public/_headers`:

```
printf "%s" "<exact script text>" | openssl dgst -sha256 -binary | openssl base64
```

After editing CSS/JS, bump the `?v=1` query in both HTML files.
