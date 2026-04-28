# Architecture Decisions

This file records product and engineering decisions that should guide implementation. Add new entries when a decision affects project structure, data modeling, backend design, or platform direction.

## ADR-001: Mobile First With React Native

Status: Accepted

The first product surface is a React Native mobile app. Baby care records are created in real time, usually on a phone, and mobile capabilities such as speech recognition, camera access, image upload, notifications, and future Siri integration are central to the product.

React Web remains a later dashboard for family viewing and management.

## ADR-002: Prefer Expo For Initial Setup

Status: Proposed

Use Expo with TypeScript for the initial mobile app unless a required native capability forces Expo Dev Client or Bare React Native.

Rationale:

- Faster MVP setup.
- Built-in support for iOS, Android, and web experimentation.
- Easier asset, permission, and build workflows.
- Compatible path toward Dev Client if native modules become necessary.

## ADR-003: Supabase As Initial Backend Candidate

Status: Proposed

Supabase is the initial backend candidate for auth, PostgreSQL, storage, Row Level Security, and edge functions.

Rationale:

- Fast MVP development.
- PostgreSQL is suitable for family-scoped data and timeline queries.
- Storage can support photos and later generated videos.
- RLS maps well to `family_members`-based access control.

## ADR-004: Unified Baby Log Table For MVP

Status: Accepted

Use one `baby_logs` table for MVP instead of separate tables for feeding, sleep, diaper, medicine, and other records.

Rationale:

- Timeline rendering is simpler.
- Natural-language parser output can be stored uniformly.
- Analysis can start from chronological records.
- Schema complexity stays low while the product is being validated.

Initial fields:

```txt
id
child_id
family_id
created_by
log_type
recorded_at
amount
unit
memo
source: manual | quick_button | voice | siri | imported
original_text
confidence
created_at
updated_at
```

## ADR-005: Rule-Based Parser Before Server AI

Status: Accepted

MVP should use an in-app rule-based natural-language parser instead of server-side AI.

Rationale:

- Lower cost.
- Better privacy posture.
- Faster iteration for common Korean baby-care phrases.
- The initial phrase set is constrained enough for deterministic parsing.

Parsed records should be confirmed by the user before saving, especially for voice input or lower-confidence results.

## ADR-006: Family-Scoped Privacy Model

Status: Accepted

Baby records, photos, videos, and comments must be scoped by `family_id`. Users access baby data through family membership.

Initial roles:

- `parent`: can create, edit, upload, invite, and manage baby profile data.
- `family`: can view timelines/photos/videos and later comment or react.

