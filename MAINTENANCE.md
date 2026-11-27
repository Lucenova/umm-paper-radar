# UMM Paper Radar: durable maintenance contract

Read the current source and deployment state rather than reconstructing state
from chat history. The content registry is authoritative for deduplication.

## Identity

- Existing Sites project: `appgprj_6a5ce413dd4c81919c1745ea499b1c45`
- Slug: `umm-paper-radar`
- Sites: https://umm-paper-radar.zhuyuedlut.chatgpt.site
- Repository: https://github.com/Lucenova/umm-paper-radar (`main`)
- Preferred entry: https://lucenova.github.io/umm-paper-radar/
- Never create duplicate sites, repositories, or automations.
- Use the connected GitHub App only. Never use/request/store a PAT.
- Preserve the public audience, Pages workflow, and unrelated/unmerged work.

## Start each run

1. Open the existing Sites source with its current skill and a fresh source
   credential. Inspect `.openai/hosting.json`, git status, and HEAD.
2. Compare GitHub main before overwriting. Reconcile divergent updates.
3. Read `app/page.tsx`: `papers` is the archive and `englishOverrides` holds
   detailed English notes. Append; never replace the archive with today's picks.
4. Deduplicate by version-stripped arXiv ID, canonical source URL, title, and
   method. A version update normally updates its existing resource.
5. Use Asia/Shanghai for the issue date. Separate publication/version, source
   check, and curation dates. Do not call a backfill a new publication.

## Selection and sources

Prefer 3–5 high-value papers, official reports, or research blogs. Prioritize
2025–2026 advances and modeling/world-model coverage. Keep meaningful Blog
coverage. Allow directly useful foundational gap-fillers and label them.
Do not force all axes into each issue or add weak items to meet a quota.

Axes: Encoder-free/Omni; UMM/URSA/Kaiming He's ELF/Image Token; token AR,
masked/discrete diffusion, metric paths, embedding diffusion, Flow Matching,
Rectified Flow, MeanFlow, hybrid/block AR-diffusion, coarse-to-fine/parallel
decoding, Diffusion LLM; VAE/reconstruction semantic alignment; mechanistic
interpretability/SAE/attribution graphs/cross-modal attribution/hallucinations/CoT
faithfulness; world models including robotics/VLA/actions/model-based RL,
simulators, interactive environments, long rollouts/planning, token/diffusion/
Flow/JEPA dynamics, and UMM integration.

Verify claims against paper originals, author project pages, official blogs,
and official repositories. Distinguish established results from adaptation
hypotheses. Reasons and experiments must connect to Qwen3 + IBQ/discrete tokens,
URSA-to-ELF, UMM sharing, OCR/DocVQA/TextVQA/OCRBench, and multi-frame threat
analysis, not generic summaries.

## Required fields in BOTH languages

For each resource: title; source/arXiv, project, and code links where verified;
publication/version date; Paper/Blog label; contribution; modeling paradigm;
reason; inspiration; feasible controlled experiment; code/data/weight status;
deep-read/skim guidance; limitations. A README alone is not full code release.
Use "not disclosed/not verified" for missing links, budgets, or details.

For generation-model items explicitly audit:
- Token ID / one-hot or simplex / continuous embedding / VAE latent or pixels.
- Forward corruption/path; target: clean token/logits CE, embedding, noise,
  velocity, or average velocity.
- Sampling order, training budget and inference steps/NFE; AR/LLM initialization.
- Sharing of tokenizer, embeddings, vocabulary, Transformer, and heads separately.
- Compute/memory/openness; similarities/differences from ELF and URSA and whether
  the approach is eligible as a fair UMM control.

For world-model items additionally audit:
- Observation representation; real/text/latent action; dynamics target.
- AR/masked/continuous diffusion, Flow, JEPA, or hybrid mechanism.
- Multi-step rollout, interaction, planning, and closed-loop tasks demonstrated.
- Horizon/physical consistency, causal control, latency, and cost.
- Shared codec/Transformer/semantic space and feasible UMM integration toward
  understanding–generation–prediction–action.
- Do not conflate camera control or narrative-quality feedback with a physical
  control/planning loop.

## Fair experiments

Fix LLM backbone, codec, data, trainable parameters, and training FLOPs where
possible, varying only generation or dynamics. Report understanding, T2I, OCR/
fine detail, future prediction, action control, horizon consistency, planning/
control success, NFE, throughput, memory, and stability. Separate tokenizer,
static-generator, and dynamics gains. World-model evaluation includes action
shuffle/causal interventions, closed-loop success, and horizon error, not only
FVD/LPIPS. Count retrieval, reference generation, ALL retries, judges, and
selectors. Declare oracle/gold access; oracle selection is not deployed success.

## UI invariants

- English default for fresh visitors; functional EN/ZH. No Chinese in English
  visible content. Complete English overrides for all new items.
- Independent UMM, Image Generation, Video Generation, World Model,
  Interpretability, and Evaluation & Diagnostics categories.
- Preserve pagination, Blog filter/badges, arXiv-number links, search, reading
  list, and all three comparison matrices.
- Preserve the Taste Skill app layout documented in `DESIGN.md`, source/sort
  filters, saved-reads view, and collapsible notes. Routine curation is not an
  instruction to redesign the interface. Keep issue-specific copy and date current.
- Update English and Chinese UMM/world matrices together.
- Update issue date/number and featured flags; archive past featured items.
  Derive totals from the registry instead of hard-coded stale counts.

## Verify and publish

1. Run `node --test tests/research-content.test.mjs` and relevant builds/tests.
   Follow the current Sites skill's source/package/publish workflow and use the
   exact pushed source SHA. Preserve proven compatibility fixes.
2. Publish the existing Sites version; check terminal deployment status.
3. Sync the SAME source to GitHub main through the GitHub App with a checked
   parent/ref lease; preserve `.github/workflows/pages.yml`.
4. Check the Pages workflow for that commit, then homepage and referenced CSS/JS.
   Distinguish deployment success from unperformed browser/resource validation.
5. If mirror sync fails, resume the same issue/version, not another content append.
   Report partial completion precisely. Never invent successful deployment.
6. Send a concise Chinese brief with concrete dates, new items, one deep read,
   one experiment, Pages first, Sites backup, and deploy/commit evidence.
7. Keep the existing recurring task enabled unless explicitly paused/cancelled by
   the user or a genuine end condition applies. Temporary failures do not disable
   it. Never create another automation during a scheduled run.

## Handoff note

The existing task was found paused after its 2026-09-27 run and resumed on
2026-10-19 without changing cadence. This file replaces dependence on the long
chat for durable requirements. Read live source for current counts/issues and
task controls for scheduling telemetry.

## Discrete UMM subcategory (2026-11-27)

- Preserve the nested UMM > Discrete UMM route (`?track=discrete-umm`), its scope/route filters and reading guide. Keep six top-level tracks.
- Maintain the explicit `discreteCatalog`: core discrete states, decoupled discrete outputs, enabling methods/diagnostics, continuous/hybrid boundaries. Do not classify by title keywords.
- URSA original is a video-generation enabling method, not evidence of complete UMM; ELF and SenseNova/NEO-unify pixel Flow are external continuous controls. Discrete semantic IDs plus diffusion rendering are boundary methods.
- ICML reading focus: AR / masked / metric-path controls with codec/backbone/data/parameters/FLOPs fixed; grouped-head/folding, MoT, initialization and rehearsal tested independently. Do not publish private results.
- Update both public reading-list exports when the catalog changes; preserve original publication versus backfill dates and no-exhaustiveness qualification.
- App page is larger than1MiB: read it in bounded chunks before GitHub App mirroring and verify blob hashes against local `git hash-object`. A successful upload alone does not establish full content.
