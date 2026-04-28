# TinyDays Agent Guide

## Project Intent

TinyDays is a family-centered baby lifelog app. The first product target is a React Native mobile app that helps parents record baby care events with minimal effort, then turns those records into summaries, patterns, and family timelines.

The product should prioritize daily use by parents over feature breadth. Fast recording, trustworthy data, privacy, and low operating cost are core constraints.

## Product Principles

- Build mobile first. React Web is a later family dashboard, not the initial product surface.
- Optimize for low-friction recording: quick buttons, text input, and voice-to-text.
- Prefer confirmation before saving parsed natural-language records until parser confidence is proven.
- Keep MVP AI-free on the server. Use OS speech recognition and an in-app rule-based parser first.
- Treat baby photos, health-adjacent records, and family membership as private data.
- Avoid expanding into community, commerce, vaccination scheduling, or advanced AI before the core loop is validated.

## Engineering Principles

- Use TypeScript throughout the app.
- Prefer Expo + React Native unless a native capability clearly requires a different setup.
- Keep domain logic portable and testable outside React components.
- Put natural-language parsing logic in a pure module with unit tests.
- Start with a unified `baby_logs` model for timeline and analytics simplicity.
- Keep storage and backend decisions explicit in docs before implementation.

## Documentation Rules

- Update `docs/product/mvp-scope.md` when product scope changes.
- Update `docs/architecture/decisions.md` when choosing a technology, data model, or irreversible implementation direction.
- Update `docs/engineering/project-setup.md` when setup commands or environment assumptions change.
- Keep documents concise and decision-oriented. Do not duplicate the full product brief unless needed.

## Current Priorities

1. Set up the React Native TypeScript project.
2. Define the MVP domain model and parser module.
3. Implement quick logging and natural-language logging before media features.
4. Add summaries and basic rule-based insights after reliable logging exists.
5. Add photo upload after the core record/timeline loop works.

## Non-Goals For MVP

- Server-side LLM parsing.
- AI-generated video.
- Public sharing or social feed.
- Marketplace, shopping, or community features.
- Complex role hierarchy beyond `parent` and `family`.

