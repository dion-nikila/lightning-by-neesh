# Lightning by Neesh

A website for Lightning’s running and social community in Sri Lanka.

**Website:** https://dion-nikila.github.io/lightning-by-neesh/

## Structure

- Home: community photography, the complete announced runs calendar, activity cards, and a founder introduction.
- The club: Neesh’s cutout portrait, story, and a photo gallery.
- FAQ: practical guidance and official registration links.
- Runs: a dedicated page in the main navigation, with activity cards and the full calendar. The full calendar also remains on Home.

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

The founder’s quoted words and London connection are supported by [The Morning’s interview with Neesh](https://www.themorning.lk/articles/TgufPVGjrTzKrhkP7uJA), published 26 July 2026. The main photography shows the actual community. The restored Neesh cutout was prepared from his original portrait. The running artwork is a conceptual illustration created with ImageGen; the decorative route is not an actual GPS track. Activity cards show announced event details rather than invented pace or distance statistics.

Archivo, Space Grotesk, and Manrope are bundled under their licenses in `assets/`. [Design notes](DESIGN-NOTES.md) document the research behind the current direction.
