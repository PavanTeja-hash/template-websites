# Sri Chamundi Tours and Travels website

A static, single-page website for a travel agency in Jayanagar, Bengaluru. No build step and no dependencies.

## Folder layout

```
public/                  <- the website. Deploy this folder only.
  index.html             page markup, SEO tags, structured data
  privacy.html           privacy policy (DPDP Act 2023)
  404.html               "page not found" page
  styles.css             all styles and colour tokens
  script.js              menu, header, filters, planner, enquiry form (settings at the top)
  images/                photos, plus og-image.jpg for link previews
  favicon.svg, favicon-32.png, apple-touch-icon.png, icon-192/512.png
  site.webmanifest       app icon and colour info for phones
  robots.txt, sitemap.xml
  _headers               security and caching headers (Netlify, Cloudflare Pages)
vercel.json              the same headers for Vercel
backup/original-2026-11-26/   the original version, untouched
```

## Preview locally

```
cd public
python -m http.server 8003
```

Then open http://localhost:8003. (Python's server shows its own 404 page; real hosts use `404.html`.)

## Deploy

- **Vercel**: import the repo. Framework preset: Other. Root directory: this folder. Output directory: `public`. No build command. `vercel.json` sets the headers.
- **Netlify**: drag the `public` folder onto app.netlify.com/drop, or set the publish directory to `public`. `_headers` and `404.html` are used automatically.
- **Cloudflare Pages**: set the build output directory to `public`, with no build command.

## Go-live checklist

1. **Domain.** Replace `https://www.srichamunditravels.in` in `index.html` (canonical, Open Graph, structured data), `privacy.html`, `robots.txt` and `sitemap.xml`. Replace the email `trips@srichamunditravels.in` everywhere.
2. **Phone and WhatsApp.** In `script.js`, set `WHATSAPP_NUMBER` (digits only, with 91) and `OFFICE_PHONE`. Also replace `+918041236650`, `+91 80 4123 6650` and `919845012345` in the `tel:` and `wa.me` links of all three HTML files and the `telephone` in the JSON-LD.
3. **Address and hours.** Replace "No. 214, 11th Main Road" in the JSON-LD, the contact section and `privacy.html`. Check the opening hours.
4. **Prices and dates.** Confirm every package price, the Kerala hotel tiers, the group departure dates and fares, and the cab rates (per km, minimum km, driver bata). Remove departures once they have left.
5. **Policies.** The cancellation policy in the FAQ, the "book with 25 percent" terms and "since 2009" must match what the agency actually does.
6. **Photos.** The photos are free Pexels stock photos. Replace them with the agency's own where possible, at the same sizes. Regenerate `images/og-image.jpg` (1200 x 630).
7. **Privacy policy.** Read `privacy.html` and adjust the retention periods and contact details to what the agency actually does.
8. **Enquiries by email instead of WhatsApp (optional).** Set `FORM_ENDPOINT` in `script.js` to a Formspree or Web3Forms URL, then add that domain to `connect-src` in both `_headers` and `vercel.json`.
9. **After launch.** Submit `sitemap.xml` in Google Search Console, set up a Google Business Profile, and test the form and WhatsApp button on a real phone.

### Cache busting

`styles.css` and `script.js` are linked with `?v=3`. Bump the number in all three HTML files whenever you change either file.

### The inline script in `<head>`

`_headers` and `vercel.json` allow the one-line script in `<head>` by its SHA-256 hash. If you change it, recompute and update both files:

```
python -c "import hashlib,base64;s=open('public/index.html',encoding='utf-8').read().split('<script>')[1].split('</script>')[0];print(base64.b64encode(hashlib.sha256(s.encode()).digest()).decode())"
```

If you forget, nothing breaks: the animations are skipped and the content stays visible.

## Palette (60 / 30 / 10)

Base #FCFAF5, sand #F1E8D8, indigo accent #263A8A. Fonts: Young Serif and Hanken Grotesk.
