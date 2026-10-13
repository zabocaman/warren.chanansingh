# Launch and security checklist

Status key: **Done** = built into the site. **You** = needs an account, file or decision from you. **Not applicable** = this site has no server, database or log-ins, so the risk doesn't exist; the note says what to do if that changes.

## Making it real (the 20 launch items)

| # | Item | Status | Where |
|---|---|---|---|
| 1 | Custom 404 page | Done | `404.html` ("This page didn't convert") |
| 2 | Meta title per page | Done | Unique `<title>` on every page |
| 3 | Meta description per page | Done | Unique description on every page |
| 4 | Call to action above the fold | Done | Home hero: "Work with me" and "Watch the 60-second intro"; "Let's talk" and WhatsApp in the header; a Send a message and WhatsApp bar on every page |
| 5 | Favicon set | Done | `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, maskable icon, `site.webmanifest` |
| 6 | robots.txt | Done | Allows everything except the thank-you page; points to the sitemap |
| 7 | sitemap.xml | Done | All public pages, including the twelve case studies, Articles and Socials. New articles are added automatically |
| 8 | Open Graph image | Done | 1200 × 630 share images for the main pages and each case study in `assets/img/og/` |
| 9 | Alt text on every image | Done | Descriptive alt text on content images; decorative graphics use empty alt |
| 10 | Mobile breakpoints | Done | Layouts stack from about 960px down to phone width; no sideways scrolling |
| 11 | Sticky call to action | Done | Bottom bar on phones and a small floating pill on larger screens: "Work with me" and "Message" ("Start a conversation" on Work with me). It hides while the closing call to action is on screen |
| 12 | Loading states | Done | Intro loader on first visit, spinner on send buttons, "matching your answers" step in the quiz, image placeholders |
| 13 | Form error states | Done | Inline messages per field, an error summary with links, focus moves to the problem |
| 14 | Thank-you page | Done | `thank-you.html`, personalized with your name and goal profile |
| 15 | Privacy policy page | Done, review | `privacy.html`, written for PIPEDA and CASL; have it reviewed before launch |
| 16 | Terms and conditions | Done, review | `terms.html`, Ontario law; have it reviewed before launch |
| 17 | Cookie banner | Done | Allow, decline or choose; analytics stay off until a visitor allows them; "Cookie settings" in the footer |
| 18 | Analytics installed | You | Google Analytics 4 is wired with consent; add your measurement ID in `assets/js/config.js` |
| 19 | Real contact address | Done | Toronto, Ontario, Canada, with email and phone. A street address is left off on purpose; use a business or mailbox address if you want one |
| 20 | Compressed images | Done | Portrait as WebP, lazy loaded with fixed sizes; the showreel is under 1 MB |

## Keeping it safe (the security items)

| Item | Status | Notes |
|---|---|---|
| Enable row-level security (RLS) | Not applicable | No database. If you add Supabase or similar later, turn RLS on for every table before going live. |
| Tighten CORS settings | Not applicable | The site has no API of its own. The form service only accepts posts; set its allowed domain to your site. |
| Parameterized SQL queries | Not applicable | No SQL anywhere. |
| Verify email addresses | Done / You | Visitor emails are format-checked. Formspree verifies your own address before forwarding anything. Use double opt-in if you ever add a mailing list. |
| Keep tokens out of local storage | Done | Nothing secret is stored. Browser storage holds only the theme, the cookie choice, quiz answers for the current tab, and the time of the last message (to slow repeat sends). |
| Hide .env files from Git | Done | `.gitignore` blocks `.env`, keys and certificates. The site needs no secret keys at all. |
| Validate form inputs | Done | Required fields, email, website, phone and length checks in the browser; Formspree validates and filters spam on its side. |
| Protect admin routes | Not applicable | There is no admin area or log-in. |
| Disable production debugging | Done | No console logging, no debug flags, no source maps. |
| Server-side API secrets | Done | No API keys in the code. The Formspree endpoint and Analytics ID are public by design. The workflow's `CLAUDE_API_KEY` lives in GitHub Secrets, never in files. |
| anthropics/claude-code-security-review | Done / You | `.github/workflows/security-review.yml`; add the `CLAUDE_API_KEY` secret and require approval for outside contributors. |
| Rate limit requests | Done / You | The browser blocks a second send within a minute, drops instant bot submissions, and uses a hidden honeypot field. Server-side limits come from Formspree; turn on its spam protection. |
| Validate file uploads | Not applicable | No uploads. |
| Keep sensitive data out of logs | Done | The site writes no logs. Don't paste form submissions into public places. |
| Hash passwords securely | Not applicable | No passwords. |
| Verify webhook signatures | Not applicable | No webhooks. If you connect Formspree to another tool by webhook, verify its signature there. |
| Server-side permissions | Not applicable | No accounts or roles. |
| Block cross-site scripting (XSS) | Done | A strict Content-Security-Policy, no inline scripts, and visitor input is only ever written as text, never as HTML. |
| Update dependencies | Done | No third-party JavaScript or packages. Dependabot keeps the GitHub Actions current. |

## Getting found (the 20 SEO items)

Checked on the built site: every page crawled at phone and desktop widths, and Lighthouse run on the main pages.

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Render it server-side | Done | Every page is plain HTML with all its text in the file. JavaScript only adds motion and runs the quiz, so search engines and AI tools read everything without running scripts. |
| 2 | Generate sitemap.xml | Done | All 24 indexable pages, and every article you publish is added on the next build. The thank-you and 404 pages are left out on purpose. |
| 3 | Submit to Search Console | You | Steps in `README.md` under "After launch: get found". Then submit `sitemap.xml` and request indexing for the home page. |
| 4 | Unblock Googlebot | Done | `robots.txt` lets every crawler in, including CSS, JavaScript and images. |
| 5 | No stray noindex tags | Done | Only `thank-you.html` and `404.html` say noindex. `robots.txt` no longer blocks the thank-you page, so Google can read its noindex. |
| 6 | No redirect chains | Done | The site has no redirects, and every internal link points to the final `.html` address. GitHub Pages adds one http-to-https hop, which is normal. If you move to a custom domain, update the addresses (README, "Before you go live", step 4). |
| 7 | Canonical tags | Done | Every indexable page names itself with a full `https://` canonical that matches the sitemap. |
| 8 | No 404s | Done | No broken internal links or missing files on any of the 26 pages, plus a custom 404 page. After launch, check the LinkedIn, Instagram and GitHub links once. |
| 9 | Meta descriptions | Done | Unique on every page and 160 characters or fewer, so results don't cut them off. Page titles are 65 characters or fewer. |
| 10 | One H1 per page | Done | Exactly one on every page. |
| 11 | FAQ schema | Done | FAQPage markup on `services.html`, matching the six questions on the page. Google now shows FAQ results mostly for government and health sites, so the main benefit is with AI answer engines. |
| 12 | Breadcrumbs | Done | Visible breadcrumbs and BreadcrumbList markup on every inner page. |
| 13 | Link orphan pages | Done | Every indexable page is linked from other pages. Case studies are linked from Case Studies, the home page, the patterns section and each other. `thank-you.html` is only reached after sending a form, on purpose. |
| 14 | Alt text on images | Done | Descriptive alt text on every content image. Decorative images have empty alt text. |
| 15 | Images in WebP | Done | Every image on the pages is WebP. Share images stay JPG because social networks expect it, and icons stay PNG and ICO. |
| 16 | Fix layout shift | Done | Cumulative Layout Shift is 0 on every page tested, on phone and desktop. |
| 17 | Load under 2 seconds | Mostly | Lighthouse phone test on a slow 4G connection: main content appears in about 1.5–1.9 seconds on most pages, including the home page on most runs. Work with me measures 2.4–2.7 seconds, and the home page sometimes reaches 2.5. On desktop, 0.4–0.5 seconds.
| 18 | Avoid AI content | You | The copy was drafted from your case studies and figures. Read every page and rewrite it in your own voice, adding first-hand detail: why you made a call, what surprised you, what you'd change. |
| 19 | Author bio | Done | The About page carries Person markup. Every case study and every article has a byline, an author box linking to About, and author markup. |
| 20 | Backlink from Forbes | You | This happens off the site. Start with links from places that know you: TMU, your LinkedIn articles, guest posts, podcasts and workshop hosts. Forbes Councils are paid, application-only memberships. |

## Also added

- Structured data for search and AI answer engines: Person (with the nine capabilities), WebSite, the nine capabilities as Services, two FAQ sets (Expertise and Work with me), breadcrumbs, each case study, and Blog and BlogPosting markup for articles.
- Positioning for CEOs and directors: nine capabilities in three pillars, each with its business outcome and KPIs; a key-facts strip, two ways to work together (in-house or on engagement), the first 90 days and short answers on the Work with me page.
- An animated 60-second intro video and brand graphics in every photo spot, plus spaces for testimonials and an industry strip, all filled from `_data` files on GitHub (README.md, "Photos, videos and testimonials").
- WhatsApp click-to-chat on every page: header, quick contact bar, closing calls to action, footer and contact page.
- Client confidentiality: case studies name clients by industry only, with no client names, logos or ad creative, including in the showreel and share images.
- An Articles page you publish to by adding a text file on GitHub, with its own RSS feed (`feed.xml`). How-to in `README.md`, "Publishing an article".
- A Socials page that lists your accounts and refreshes the latest posts from any account with a feed once a day.
- A GitHub Actions workflow (`build-deploy.yml`) that rebuilds and publishes the site on every change. Set **Settings → Pages → Source** to **GitHub Actions**.
- `llms.txt`, a plain summary of who you are and what each page covers, for AI answer engines.
- Canonical URLs on every page, and Open Graph and Twitter share tags.
- `.well-known/security.txt` so people know how to report a problem.
- Security headers for hosts that support them (`_headers`), plus a referrer policy and content security policy in every page.
- Accessibility: WCAG 2.1 AA colour contrast in light and dark themes, keyboard navigation, a skip link, reduced-motion support, labelled forms, and an accessibility statement.
- Light and dark themes with a toggle.

## Still to decide or provide

- [ ] Verify the site in Google Search Console and Bing Webmaster Tools, and submit `sitemap.xml`
- [ ] Rewrite the copy in your own voice
- [ ] Formspree endpoint (forms)
- [ ] Google Analytics measurement ID (optional)
- [ ] Résumé PDF (optional)
- [ ] Custom domain, or keep `zabocaman.github.io`
- [ ] Legal review of the privacy policy and terms
- [ ] More photos of you, real testimonials, and any licensed stock imagery
- [ ] Set your engagement prices and timelines in `_data/engagements.json` (or leave prices empty and set `"show_placeholders": false`)
- [ ] When you accept a role, update the In-house section, the FAQs and the Contact page
- [ ] Set **Settings → Pages → Source** to **GitHub Actions** and run the workflow once
- [ ] Publish your first article (or add a link to one of your LinkedIn articles)
- [ ] Optional: feed addresses for LinkedIn and Instagram in `_data/socials.json`
- [ ] Optional: replace the animated intro with a real 60-second intro to camera (`_data/media.json`)
- [ ] Optional: replace the brand graphics with real photos (workshop, presenting, at work) when you have them
- [ ] Confirm +1 437 422 4684 is on WhatsApp, and turn on a WhatsApp Business greeting and away message
- [ ] Replace the three sample testimonials with real quotes, with permission (`_data/testimonials.json`: replace the text, then delete `"sample": true`)
- [ ] Confirm your role on the spirits, vehicle dealership, professional sports 2025, money transfer, energy drink product launch and confectionery case studies (each says paid media strategy and execution)
- [ ] Before launch: fill every placeholder, or set `"show_placeholders": false` in `media.json`, `testimonials.json` and `brands.json`
- [ ] Check every capability description is something you can speak to in an interview, and add real results for automation, email and analytics when you have them
