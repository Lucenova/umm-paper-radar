# Research workspace design

## Direction

User-requested reference: https://github.com/Leonxlnx/taste-skill
Read revision: `b9ca2fd8047f4c72d7da90ebc1c1203e57c72cd2`.
Applied the default `design-taste-frontend` skill and its complete
`references/app-screens.md`, not the marketing-page route.

The app draw offered Achromatic Ledger and Editorial Greeting. Chosen:
**Editorial Greeting**, seed **20261019**, with the existing green/sans identity
retained. No redraw. Its 1100px 12-column arithmetic is documented in CSS.

## Inventory and job

- 252 existing and newly appended research resources, never illustrative data.
- Six independent research tracks.
- Explicit original publication dates and archive/curation order.
- Qwen3, IBQ, URSA, ELF, OCR and multi-frame threat experiments.
- English-default interface with full Chinese switching.
- Paper and Blog source types.
- Detailed recommendation reasons, inspiration, and controlled experiments.
- Three comparison matrices, including dynamics and token-folding controls.
- Persistent on-device saved reads.
- Direct arXiv/project/code access.

The screen answers: **What should I read, compare, and test next?**
Its face comes from the researcher's actual questions, not a generic welcome
banner. The signature element connects three questions to their relevant notes:
knowledge transfer (KTP), hidden dynamics (Momentum), and history-sourced Flow.

## Changes

- Replace the oversized promotional hero and illustrative coordinate map with a
  compact desk, true computed totals, and question-to-paper actions.
- Quiet neutral navigation and a white reading sheet. Keep green on research
  actions and meaningful priority, not large decorative backgrounds.
- Collapsed research notes by default at every width; individual disclosure and
  page-level expand/collapse preserve the full original content.
- Source filter, archive/publication ordering, actual saved-reads view, and
  bilingual/arXiv-ID search. All filters compose and totals derive from results.
- Mobile navigation folds behind a button; mobile reading starts earlier.
- Matrices scroll within bounded regions with sticky headers/identity columns.
- Visible focus, skip link, disclosure semantics, empty states, reduced motion.
- No new UI libraries, invented metrics, stock photographs, or animated entrances.

## Verification and limits

Taste static lint: zero FAIL. Remaining warnings concern literal bibliography
words such as "Robust", "Synergy", and "shadow", archive IDs, mono reserved for
archive IDs/code, and punctuation in research text. These are retained as content,
not decorative interface claims. Academic titles are not rewritten for a linter.

Regression tests render every English page and both language branches, and cover
data uniqueness/completeness, pagination, source filtering, sorting, saved reads,
bilingual search, and explicit arXiv links. Production build/render checks also run.

The managed Sites environment has no supported control-browser skill. Its preview
policy explicitly disallows improvising another browser path. Consequently the
Taste browser inspector, before/after screenshots, viewport measurements, click
tests, and a visual critique score were NOT performed. Do not describe this as
browser-verified or as a zero-failure visual inspection. This limitation does not
invalidate static/build/deployment checks, but a real 1440/768/390px visual pass
remains an appropriate follow-up when the supported browser becomes available.
