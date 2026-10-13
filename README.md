# Warren Chanansingh — website

A static website: plain HTML, CSS and JavaScript, with no third-party JavaScript. You write articles as simple text files, and a small script (run for you by GitHub Actions) turns them into pages. It is ready for GitHub Pages.

## What's inside

| Path | What it is |
|---|---|
| `index.html` | Home |
| `work.html` | **Case Studies**: all twelve, with filters |
| `case-studies/*.html` | One page per case study |
| `services.html`, `about.html`, `hire.html` | Expertise (nine capabilities in three pillars, with their KPIs), my story (with the zaboca animation), and **Work with me**: two ways to work together, in-house or on engagement |
| `articles.html`, `articles/*.html`, `feed.xml` | The Articles page, one page per article, and the RSS feed of your articles. Made by the script: don't edit them by hand |
| `socials.html` | Your social accounts, with the latest posts from any account that has a feed. Made by the script |
| `quiz.html` | Growth goal finder: seven questions, a goal profile, then an enquiry form |
| `contact.html`, `thank-you.html` | Contact form and the page people see after sending |
| `privacy.html`, `terms.html`, `accessibility.html` | Legal and accessibility pages |
| `404.html` | Custom "page not found" page |
| `assets/css`, `assets/js` | Styles and behaviour (`config.js` holds your settings) |
| `assets/img`, `assets/video` | Compressed images (WebP), share images, and the showreel |
| `assets/articles` | Images for your articles |
| `assets/media` | Your photos, videos and testimonial headshots |
| `assets/zab` | The frames of the About page animation |
| `assets/fonts` | Archivo, Newsreader and IBM Plex Mono (SIL Open Font License 1.1) |
| `robots.txt`, `sitemap.xml`, `llms.txt`, `site.webmanifest`, favicons | Search, AI answer engines, and app icons |
| `.well-known/security.txt` | How to report a security problem |
| `_articles/` | Your articles, one Markdown file each (never published as-is) |
| `_data/` | Headings for the Articles and Socials pages, your social accounts (`socials.json`), testimonials (`testimonials.json`), the brand strip (`brands.json`) and every photo and video spot (`media.json`) |
| `_templates/`, `tools/update_site.py` | The page shells and the script that builds the Articles and Socials pages |
| `.github/workflows/build-deploy.yml` | Rebuilds and publishes the site on every change, and once a day |
| `.github/workflows/security-review.yml` | Claude security review on every pull request |
| `.github/dependabot.yml` | Keeps the GitHub Actions up to date |
| `_headers` | Security headers for Netlify or Cloudflare Pages (GitHub Pages ignores it) |
| `LAUNCH-CHECKLIST.md` | Every launch and security item, with its status |

## Before you go live

1. **Connect the forms.** Create a free form at [formspree.io](https://formspree.io), confirm your email address, and copy its endpoint into `FORM_ENDPOINT` in `assets/js/config.js` (for example `https://formspree.io/f/abcdwxyz`). In Formspree, turn on spam filtering and set the allowed domain to your site's address.
2. **Turn on analytics (optional).** Create a Google Analytics 4 property and put its measurement ID in `GA_MEASUREMENT_ID`. It only loads for visitors who choose **Allow analytics** in the cookie banner.
3. **Add your résumé (optional).** Save it as `assets/Warren-Chanansingh-Resume.pdf` and set `RESUME_URL: 'assets/Warren-Chanansingh-Resume.pdf'`. The download button in the In-house section of `hire.html` (Work with me) appears once this is set.
4. **Set your address.** The site assumes `https://zabocaman.github.io`. If you use a custom domain, change `SITE_URL` in `config.js` and find-and-replace `https://zabocaman.github.io` in every `.html` file, `sitemap.xml`, `robots.txt`, `llms.txt` and `.well-known/security.txt`.
5. **Check `MODE` is `'live'`** in `config.js`.

## Deploy to GitHub Pages

1. Create a public repository named `zabocaman.github.io` (or any name, for a project site).
2. Upload every file and folder in this package to the repository root, including the hidden ones (`.github`, `.well-known`, `.gitignore`).
3. In the repository, open **Settings → Pages**, and under **Build and deployment** set **Source** to **GitHub Actions**. (Not "Deploy from a branch": the workflow has to run so your articles and socials get built.)
4. Open the **Actions** tab. If GitHub asks, allow workflows to run. Then choose **Build and deploy the website → Run workflow** once. After about a minute the site is live, and from then on it rebuilds by itself.
5. Turn on **Enforce HTTPS** once the certificate is ready.
6. For a custom domain, add it under **Settings → Pages → Custom domain** and follow GitHub's DNS steps.

A project site (for example `zabocaman.github.io/website/`) needs extra changes: `404.html` and the article pages use root links (`/assets/...`), so a user site named `zabocaman.github.io` is the simpler choice.

## After launch: get found

1. **Google Search Console.** At [search.google.com/search-console](https://search.google.com/search-console), add a **URL prefix** property for `https://zabocaman.github.io/`. Choose the **HTML file** method, download the file Google gives you (it looks like `google1234abcd5678.html`), upload it to the repository root next to `index.html`, then select **Verify**. Leave the file there. (A *Domain* property needs DNS access, which a `github.io` address doesn't give you. It works once you own a custom domain.)
2. **Submit the sitemap.** In Search Console, open **Sitemaps**, enter `sitemap.xml` and submit. Then open **URL inspection**, paste the home page address and select **Request indexing**.
3. **Bing Webmaster Tools.** At [bing.com/webmasters](https://www.bing.com/webmasters), choose **Import from Google Search Console** so you don't have to verify twice. Bing's index also feeds Microsoft Copilot.
4. **Check back in one to two weeks.** In Search Console, look at **Pages** (what's indexed and why anything isn't), **Core Web Vitals**, and **Breadcrumbs** under Enhancements.
5. **When you add or move a page,** link to it from at least one existing page, add it to `sitemap.xml`, and link straight to the new address rather than redirecting. Articles are added to the sitemap for you.

## The security review workflow

`.github/workflows/security-review.yml` runs [anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review) on every pull request. Add a repository secret named `CLAUDE_API_KEY` with an Anthropic API key enabled for Claude Code. The action is not hardened against prompt injection, so in **Settings → Actions → General** require approval for workflows from outside contributors.

## How the site is positioned

The site presents you as a digital strategist with nine capabilities in three pillars: **Plan and measure** (digital strategy, content strategy, digital analytics), **Reach and engage** (paid media, social media management, community building and engagement) and **Convert and scale** (email marketing, marketing automation, training and development). Each one names the business outcome and the KPIs you own, written for a CEO or director deciding whether to bring you in, as an employee or as a consultant. They appear on the home page (as three pillar cards), on `services.html` (shown as **Expertise**, as a numbered list grouped by pillar, where each capability opens to show what you deliver, the KPIs and the track record; a link to `services.html#analytics`, for example, opens that one), in the capability line at the top of Home and Work with me, and in `llms.txt`. If you change one, change it everywhere it appears.

Proof lines under each capability only quote figures from the case studies. Marketing automation has none yet, because no case study shows it. When you have a real result for automation, email or analytics, add it.

## Two ways to work together

The site presents you as both a candidate and a consultant without asking for either. There is no "hire me" and no availability line on the home page. Instead, **Work with me** (`hire.html`) offers two options:

- **In-house:** you own digital strategy and results inside a team. The January 2027 start appears once, as a plain detail in this section, in the FAQ and on the Contact page.
- **Engagements:** three packages (growth audit, 90-day growth plan, team workshop), each scoped to one goal. They live in `_data/engagements.json`, so you can change names, details, timelines and prices on GitHub. Write prices the way you want them shown ("From $2,500 CAD"). If you'd rather not publish prices, leave them empty and set `"show_placeholders": false`, and each package shows "Scoped to your goal" instead.

The timelines in the packages (about two weeks, 90 days, half or full day) are suggestions. Change them to what you'll actually commit to. When you accept a role, update the In-house section, the FAQ on `hire.html` and `services.html`, and the Contact page.

## Moving around the site

- **Down and up arrows** (and Page Down / Page Up) move one section at a time. Long sections are paged a screen at a time, so nothing is skipped. Arrows still work normally inside forms and the quiz.
- **On phones and tablets,** a swipe settles on the start of the next section when it lands close to one. Inside long sections, scrolling stays free.
- **The Next button** at the bottom of the home page's first screen does the same as the down arrow.
- **Quick actions** ("Work with me" and "Message") stay on screen once you scroll past the first screen: a bar on phones, a small pill in the corner on larger screens. They step aside when the closing call to action is showing.

This lives in `sectionNav()` and `mobileCta()` in `assets/js/main.js`, and the swipe behaviour is the `(pointer: coarse)` rule at the end of `assets/css/styles.css`.

## Photos, videos and testimonials

These are filled from three files in `_data`, so you can update them on github.com and the site rebuilds itself.

Every photo and video spot is already filled. The 60-second intro is an animated, captioned video (no sound) built from the site's own words and published case-study figures, and the photo spots hold brand graphics: a Meta Ads 101 title card, a results-review slide, the 90-day plan, a dashboard and an automation flow. They are graphics, not photos, and use only figures already on the site. When you have a real intro to camera or real working photos, upload them and point the spot at your file; the brand guide (photography and video) says what to shoot. Testimonials hold sample text marked "Sample · replace": swap in a real quote, name and role in `_data/testimonials.json` and delete `"sample": true`. Samples disappear automatically if you set `"show_placeholders": false`, so they can't go live by accident.

**Messages and WhatsApp.** Every page has a quick contact bar (Send a message, WhatsApp) at the bottom of the screen, a WhatsApp button in the header, and WhatsApp in each closing call to action, the footer and the contact page. WhatsApp opens a chat with +1 437 422 4684 with a short greeting already typed; to change the number or greeting, edit `WHATSAPP` near the top of the site source.

1. **Upload the file** to `assets/media` (**Add file → Upload files**). Keep names simple: `intro.mp4`, `workshop.jpg`.
2. **Point to it** in the right file and commit:
   - `_data/media.json`: every photo and video spot. The 60-second intro also replaces your portrait at the top of Work with me once you add it. Each one says what it should show, its shape (for example 4:3) and the pages it appears on. Put the path in `"src"` (`"assets/media/workshop.jpg"`) and describe the picture in `"alt"`. For the 60-second intro video, you can also add a `"poster"` image and a `"captions"` file (.vtt).
   - `_data/testimonials.json`: fill in `"quote"`, `"name"` and `"role"` (for example `"Marketing Director, Company name"`), and optionally a square `"photo"` and a short `"result"` tag. Only use quotes people have agreed to let you publish. Up to five work well.
   - `_data/brands.json`: the industry strip on the home page. Clients are named by industry only, so it lists industries (insurance, vehicle dealership, professional sports and so on), each linking to a case study. Don't add client names or logos here.
3. **Before launch,** either fill every placeholder or set `"show_placeholders": false` at the top of each file to hide the empty ones. A section with nothing to show disappears on its own.

Photos: JPG or WebP, at least 1600 px wide, under 500 KB if you can ([squoosh.app](https://squoosh.app) shrinks them). Video: MP4, under 20 MB. Every file must be in your repository: images and video from other websites are blocked by the site's security settings.

## Editing content

The pages are plain HTML. Case-study figures came from your campaign reports, with budgets and spend removed. If you change a number, change it everywhere it appears (case page, Case Studies cards, home page, hire page, quiz copy in `assets/js/quiz.js`, the share image, and the showreel).

### Which case studies are on the site

Twelve, chosen by comparing every report: your case-study files plus the Meta Ads Manager exports. Clients are named by industry only (for example, "Vehicle Dealership"), with campaign, product and influencer names replaced by plain descriptions. No client names, logos or ad creative appear anywhere on the site, including the showreel and share images. Keep it that way when you edit: describe a client by its industry and market.

Five case studies come from the exports alone, so their figures are Meta's numbers and their "what the numbers show" notes describe the data, not your reasoning at the time: vehicle dealership sales events, professional sports 2025 home matches, money transfer, the energy drink product launch and confectionery. Rewrite those notes in your own words.

Earlier case studies that were taken off the site are kept in the site source (`ARCHIVED` in `content.py`), not in this repository.

## Things only you can provide

- More photos of you: working shots, speaking at a workshop.
- Testimonials, written by real people with their permission.
- Licensed stock photos or video, if you want imagery on the case studies (client ad creative is left out on purpose).
- A legal review of the privacy policy and terms before launch.
