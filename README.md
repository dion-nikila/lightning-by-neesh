# Lightning by Neesh

A website for Lightning’s running and social community in Sri Lanka.

**Website:** https://dion-nikila.github.io/lightning-by-neesh/

## Structure

- Home: community photography and the complete announced runs calendar.
- The club: Neesh’s story and a photo gallery.
- FAQ: practical guidance and official registration links.
- Runs: a standalone calendar URL; primary navigation keeps runs on Home.

The calendar is rendered into the HTML. JavaScript adds location filters, event details, shareable event links, and tentative all-day calendar downloads. Native dialogs, keyboard controls, reduced motion, and mobile navigation are supported.

## Editing

- `content/events.json`: announced dates, venues, and official registration URLs.
- `scripts/build.py`: shared page structure and copy.
- `style.css`: layout, typography, and responsive behavior.
- `app.js`: progressive enhancement and interactions.

After editing content or templates, run `python3 scripts/build.py`. There are no package dependencies. GitHub Pages publishes `main` from the repository root. The default base path is `/lightning-by-neesh/`.

To preview a checkout named `lightning-by-neesh`, run `python3 -m http.server 4174 --directory ..` from its root, then open `http://localhost:4174/lightning-by-neesh/`.

## Sources and credits

The original emblem, community photos, event poster, and announced calendar come from [Lightning’s official Instagram](https://www.instagram.com/lightningbyneesh/) and remain the property of their respective owners. Event dates and venues follow the [official October–November calendar](https://www.instagram.com/p/DeeZkSfP3zt/). Times, routes, pace, and attendance figures are not assumed.

The founder’s quoted words and London connection are supported by [The Morning’s interview with Neesh](https://www.themorning.lk/articles/TgufPVGjrTzKrhkP7uJA), published 26 July 2026. Original community photography is used throughout the current site.

Archivo, Space Grotesk, and Manrope are bundled under their licenses in `assets/`. [Design notes](DESIGN-NOTES.md) document the research behind the current direction.
