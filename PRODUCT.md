# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/vanilla JS, no build step, deployed on Vercel (clean URLs, no framework). GSAP via CDN `<script>` is approved for animation; no bundler or framework migration.

## Users

Prospective clients and collaborators (brands, studios, agencies, individuals) evaluating Vlad Koert for freelance or full-time creative work. They land on the site to judge his range and craft quickly, then either browse his work or reach out via the contact form.

## Product Purpose

A personal portfolio site for Vlad Koert, a Brussels-based digital creative and photographer. It showcases multidisciplinary creative work (graphic design, web, photography, video, 3D) and converts visitors into freelance/full-time inquiries via the contact form.

## Positioning

Combines 15+ years of photography instinct (light, composition, story) with 5 years of multidisciplinary digital craft (design, web, video, 3D, AI-assisted workflows) — a pairing that lets him turn dense/complex subjects into visually compelling, felt work end-to-end, rather than specializing narrowly in one discipline.

## Operating Context

Single-page homepage (hero, about, selected work, statement, CTA) plus a `/work` index and one case-study page per project (10 projects), plus a `/contact` page with a Web3Forms-backed contact form. Hosted at vladkoert.com.

## Capabilities and Constraints

- Fully static, no backend beyond a third-party form endpoint (Web3Forms).
- Must keep working without a build step; GSAP may be loaded via CDN only.
- Content (copy, project names, imagery) does not change in this pass — this is a style-only redesign, inspired by a separate brand mockup ("prmpt") the user supplied. Borrow its visual/interaction language (bold pill buttons, tight tracking, big display type, monochrome contrast, exclusion-blend overlays) — not its copy, product, or content.
- Preserve existing accessibility baseline (semantic structure, focus states, reduced-motion handling already present in the hero).

## Brand Commitments

- Name: Vlad Koert. Dark, minimal, confident aesthetic already established (near-black bg `#0c0c0c`, off-white text `#f0f0ec`, Bricolage Grotesque typeface, uppercase small-caps labels, numbered section markers `(01)`, `(02)`…).
- Tone: direct, understated, craft-forward ("Craft over output", "Every project built from scratch").

## Evidence on Hand

- Real portfolio work across 10 projects (images/videos already in repo under `/images` and `/videos`) — no placeholder content.
- Hero video assets for the cursor-driven hero (`videos/hero/me-left.mp4`, `me-right.mp4`).
- Reference mockup: user-supplied "prmpt" landing-page prompt/spec — style reference only (pill CTA, mix-blend-mode exclusion overlays, tight uppercase tracking, huge display type, minimal black/white system) — not used for copy, content, or product concept.

## Product Principles

1. Content and information architecture are fixed; only the visual/interaction layer changes.
2. Borrow "prmpt"'s punchy, confident interaction language (bold pills, tight tracking, big contrast, exclusion-blend overlays) without importing its brand, copy, or product framing.
3. Keep the site static and dependency-light — GSAP via CDN is the only new dependency.
4. Every visual change reads as a natural evolution of Vlad's existing dark-minimal identity, not a different brand.

## Accessibility & Inclusion

No specific requirement beyond current baseline; preserve existing semantic structure, focus states, and reduced-motion handling.
