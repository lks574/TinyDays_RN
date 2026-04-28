# MVP Scope

## Goal

Build a mobile app that parents can use every day to record baby care events quickly and review the baby's day through a timeline and summary.

## Required Features

- Sign up and log in.
- Create a family.
- Invite family members.
- Register one or more babies.
- Record baby events with quick buttons.
- Record baby events with natural-language text.
- Record baby events with in-app voice input converted to text.
- Confirm parsed voice/text records before saving.
- Support feeding, sleep, diaper, vitamin, medicine, temperature, bath, and memo records.
- Show a date-based timeline.
- Show today's summary.
- Show basic pattern analysis.
- Upload photos.

## Optional MVP Features

- Generated slideshow videos.
- Comments and reactions.
- Siri Shortcuts or App Intents.
- Vaccination schedules.
- React Web family dashboard.

## Initial Record Types

```ts
export type BabyLogType =
  | "feeding"
  | "sleep_start"
  | "sleep_end"
  | "diaper_pee"
  | "diaper_poop"
  | "vitamin"
  | "medicine"
  | "temperature"
  | "bath"
  | "memo"
  | "unknown";
```

## Initial App Tabs

- Home: baby profile, D+ label, today summary, last status, quick buttons, voice/text entry, recent timeline.
- Logs: date selector, chronological records, edit/delete, filters.
- Insights: feeding, sleep, diaper patterns, recent seven-day summary, next expected actions.
- Photos: date-based photo timeline, upload entry point, later video creation.
- Family: members, invite link/code, role display, member removal.

## MVP Success Criteria

- A parent records at least three events per day.
- Feeding, sleep, and diaper records continue for at least seven days.
- Today summary is checked at least once per day.
- Photos are uploaded at least three times per week.
- At least one family member views the shared feed or timeline.

## Explicit Non-Goals

- Server-side LLM parsing.
- Fully automatic saving of low-confidence parsed records.
- Public sharing.
- AI-generated video.
- Advanced analytics or machine-learning prediction.
- Complex permissions beyond `parent` and `family`.

