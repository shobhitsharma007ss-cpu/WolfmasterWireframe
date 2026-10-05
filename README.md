# Wolfmaster K9

Website for **Rajender “Wolfmaster Bunty” Chauhan** and Wolfmaster K9.

It is a static site with no build step. Open `index.html` through any web server, or deploy the folder to Netlify, Vercel or GitHub Pages.

## Design system

- **Palette.** Graphite and bone, monochrome first: void `#0b0b0a`, coal `#121310`, bone `#e8e4da`, dust `#8d8a80`. One quiet military accent, field olive `#a3a17c`, used only for numerals, dates and labels.
- **Type.** All fonts are self-hosted in `assets/fonts`.
  - **Archivo Expanded** (variable, `font-stretch: 125%`): display headlines, set tight.
  - **Instrument Serif Italic**: the emotional word in each headline.
  - **Geist**: body text. **Geist Mono**: small labels and metadata.
- **Imagery.** One cinematic grade throughout: low-key, amber rim light, film grain. A live grain overlay ties the photos and UI together. See `assets/img/README.md`.

## Motion

GSAP, ScrollTrigger, SplitText, ScrambleText and Lenis are vendored in `assets/vendor`. Every movement has a job:

| Moment | Job |
|---|---|
| Preloader counter → curtain | Covers font and hero-image load, then reveals the hero |
| Hero lines rise from a mask; image settles | First impression; the image sinks and the type lifts as you leave |
| Manifesto words brighten as you scroll | Sets a reading pace |
| Marquee speeds up with scroll velocity | Shows the disciplines and responds to the visitor |
| Image chapters open from an inset | Marks the start of each chapter |
| Program rows: the preview image follows the cursor | Previews each program without leaving the list |
| Dogs: pinned horizontal lineup + progress bar | Browsing a lineup, with your position shown |
| Process line draws and step markers light up | Shows progress through the process |
| Footer wordmark rises | Closes the page |
| Mono labels decode (ScrambleText) | A field-dossier feel that marks each new section |
| Links roll their characters on hover | Shows the link will respond, without colour |

The site degrades cleanly:

- **No JS.** All content is visible and the dog lineup becomes a native swipe.
- **Reduced motion.** Lenis is off, there are no scroll animations, and nothing is hidden.
- **Touch.** No custom cursor or magnetic effects.

## Content to confirm before launch

- **Phone / email** (`+91 98733 35698`, `wolfmasterk9@gmail.com`). Taken from the public PSA event listing.
- **YouTube.** Currently links to a YouTube search. Replace it with the channel URL.
- **Awards / international titles.** Add them in the PSA record list. There is a commented template in `index.html`.
- **Testimonials.** A commented-out section is ready for real, approved quotes.
- **Photography.** The current images are AI-generated stand-ins. Replace them with real shoots, especially for the trainer section.

## Enquiry form

There is no backend. The form opens WhatsApp with the enquiry pre-filled. The number is set in `assets/js/main.js` (`WHATSAPP`).
