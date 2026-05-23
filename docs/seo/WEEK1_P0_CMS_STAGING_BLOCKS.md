# Week 1 P0 CMS Staging Blocks

<!-- markdownlint-disable-file MD013 -->

Date: 2026-03-11  
Owner: Kay  
Purpose: Source-controlled staging copy for live Hashnode publication.

Use these blocks when publishing P0 updates in Week 1. This file represents staged content, not live-published state.

## 1) Homepage (`https://blog.paintracker.ca/`)

- URL: `https://blog.paintracker.ca/`
- SEO Title: `Pain Tracker Blog: Private, Offline-First Chronic Pain Tracking`
- Meta Description: `Privacy-first chronic pain tracking with no accounts and local-only data. Learn how to track flares, spot patterns, and prepare for appointments.`
- H1: `Pain Tracker Blog`
- Intro paragraph:
  `Pain Tracker is a privacy-first, offline-first chronic pain tracking app that helps you keep reliable records without surveillance.`
- Primary CTA:
  - Label: `Start Here`
  - Target: `https://blog.paintracker.ca/page/start-here`
- Guardrails:
  - Keep homepage patient-first.
  - Avoid mixed audience lead text in snippet area.

## 2) Start Here (`https://blog.paintracker.ca/page/start-here`)

- URL: `https://blog.paintracker.ca/page/start-here`
- SEO Title: `Start Here: Choose Your Path with Pain Tracker`
- Meta Description: `New to Pain Tracker? Choose a clear path for patients, builders, or WorkSafeBC claim documentation workflows.`
- H1: `Start Here`
- Intro paragraph:
  `Choose the path that matches your goal: track pain privately, explore the technical architecture, or follow WorkSafeBC documentation workflows.`
- Primary CTA:
  - Label: `Choose your path`
  - Target: `Route cards below`
- Required route cards:
  - `For Patients` -> `https://blog.paintracker.ca/for-patients`
  - `For Builders` -> `https://blog.paintracker.ca/for-builders`
  - `WorkSafeBC` -> `https://blog.paintracker.ca/worksafebc`
- Guardrails:
  - Do not mark `Internal Links Updated` until all three targets are live and reachable.

## 3) Archive (`https://blog.paintracker.ca/archive`)

- URL: `https://blog.paintracker.ca/archive`
- SEO Title: `Pain Tracker Blog Archive`
- Meta Description: `Browse all Pain Tracker posts by topic and date, including privacy-first tracking, accessibility, engineering, and WorkSafeBC workflows.`
- H1: `Archive`
- Intro paragraph:
  `Browse every article by date and topic, from patient guidance to technical architecture and WorkSafeBC-focused documentation resources.`
- Primary CTA:
  - Label: `Start Here` (optional)
  - Target: `https://blog.paintracker.ca/page/start-here`
- Neutrality guardrails:
  - Keep archive browsing-neutral.
  - Include route CTA to `Start Here` only if visibly placed and clearly labeled.
  - Do not add lane-hub promotional copy blocks on archive.

## 4) WorkSafeBC Documentation (`https://blog.paintracker.ca/stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free`)

- URL: `https://blog.paintracker.ca/stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free`
- SEO Title: `Generate WorkSafeBC-Ready Documentation with Pain Tracker`
- Meta Description: `Generate WorkSafeBC-ready documentation faster with structured pain logs, export-ready records, and privacy-first local data handling.`
- H1: `Generate WorkSafeBC-Ready Documentation with Pain Tracker`
- Intro paragraph:
  `This guide explains how to produce WorkSafeBC-ready documentation from structured pain records while keeping health data local on your device.`
- Primary CTA:
  - Label: `View WorkSafeBC Guide`
  - Target: `https://blog.paintracker.ca/worksafebc`
- Guardrails:
  - Avoid implying official affiliation or government-managed form completion.

## 5) Privacy-First Explainer (`https://blog.paintracker.ca/paintracker-privacy-first-trauma-informed-pain-app`)

- URL: `https://blog.paintracker.ca/paintracker-privacy-first-trauma-informed-pain-app`
- SEO Title: `Pain Tracker: Privacy-First, Trauma-Informed Pain App`
- Meta Description: `Track flares, spot patterns, prepare for appointments, and keep records private. Pain Tracker works offline with no account required.`
- H1: `Pain Tracker: Privacy-First, Trauma-Informed Pain App`
- Intro paragraph:
  `Pain Tracker helps you track chronic pain privately, identify patterns over time, and prepare for appointments without creating an account.`
- Primary CTA:
  - Label: `Open the App`
  - Target: `https://paintracker.ca/app`
- Guardrails:
  - Keep patient-intent language plain and practical.
  - Avoid builder-heavy framing in the intro snippet area.

## Publication Reminder

When published live, update `docs/seo/BLOG_EXECUTION_TRACKER.md`:

- Set `Live Published` to `Yes` only after public URL update is confirmed.
- Submit recrawl, then verify canonical/indexability/snippet fields.
