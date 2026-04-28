# Product Brief

## Summary

TinyDays is a private baby lifelog app for families. Parents record baby care events with minimal input, and the app turns those records into daily summaries, pattern insights, and a family-friendly timeline.

The product is not only a manual tracker. Its core value is helping families understand the baby's rhythm over time while preserving photos and records in one private place.

## Core Product Statement

Photos are organized automatically, a short sentence becomes a baby care record, and accumulated records reveal the baby's daily patterns.

## Primary Users

- Parents who need fast, reliable logging during newborn and infant care.
- Family members who want to follow the baby's growth through photos, timelines, and later videos.

## Core Value

- Easy recording through quick buttons, natural-language text, and voice input.
- Pattern understanding through summaries, basic statistics, and simple predictions.
- Family memory through private timelines, photos, and eventually generated videos.

## Initial Platform Strategy

The first version is a React Native mobile app because baby care events happen in real time and are usually recorded on a phone.

React Web is planned as a later dashboard for family viewing, timeline browsing, photo viewing, reactions, comments, and invite management.

## MVP Product Direction

TinyDays should first prove that parents can record events every day with less friction than a typical manual tracker. Analysis, photos, and family sharing should build on top of reliable records.

The first implementation should therefore focus on:

- Family and baby setup.
- Quick recording.
- Natural-language recording.
- Voice-to-text recording with confirmation.
- Daily timeline.
- Today summary.
- Basic pattern analysis.

## Differentiation

Existing baby tracker apps already handle manual logs and basic statistics well. TinyDays should reuse the proven parts of that model, then extend it with automation, analysis, and family content.

Key differences:

- From record keeping to pattern understanding.
- From button-only input to text and voice-assisted input.
- From parent-only tracking to family timeline and sharing.
- From text records to photo and video memories.

## Cost And Privacy Direction

MVP should avoid server-side AI costs. Natural-language parsing should be rule-based inside the app, and speech recognition should rely on OS capabilities.

All data should be private by default. Family membership and `family_id`-scoped authorization are required for records, photos, and videos.

