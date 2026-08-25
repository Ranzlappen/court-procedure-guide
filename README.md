# Court Procedure Algorithm Guide

Autism-friendly, real-time court procedure algorithm guide for watching court cams or sitting in the gallery.

## Key Features

- Persistent app bar showing the current phase, plus a sticky 5-step phase stepper
- Phase-based navigation with a full sub-phase tree and scroll-spy
- Auto-generated jump chips and prev/next pager inside every phase
- Criminal/civil toggle
- Role perspective selector (judge/prosecution/defense/defendant/witness/observer)
- Jurisdiction filter (federal/state)
- Responsive case flow map (horizontal on desktop, vertical on mobile)
- Glossary with modal popups and a filterable reference list
- Search across all phases with a match count and next/previous stepping
- Personal notes per phase
- Progress tracking, mirrored onto the stepper and flow map
- Bookmarks on any section
- Dark/light theme
- Every preference persisted in localStorage
- Keyboard shortcuts: `1`–`5` jump to a phase, `←`/`→` page through, `/` focuses search
- Fully responsive, with reduced-motion, high-contrast and print support

## Tech Stack

Vanilla HTML/CSS/JS — no frameworks, no dependencies.

## How to Use

Open `index.html` in any browser, or deploy via GitHub Pages.

## Editing

`index.html` is a **build artifact**. Edit the partials in `content/` and run:

```bash
./build.sh
```

Editing `index.html` directly will be overwritten on the next build.

## Support

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F1140LWT)

## Credit

Made by [ranzlappen](https://github.com/ranzlappen)
