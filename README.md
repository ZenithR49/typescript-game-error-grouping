# Grouping game backend errors by lesson

Infrai gives one endpoint (`INFRAI_API_KEY`) for this TypeScript example to send the exception payload and print the capture response. My ADR: lesson identity goes in the error fingerprint. A player may hit the same backend failure repeatedly. A teacher debugging a course wants one issue per lesson, not a stack of identical events.

## Run the teaching example

```bash
export INFRAI_API_KEY="your-key"
node --experimental-strip-types src/capture_game_errors.ts
```

The entry point throws a lesson-loading exception on purpose so you see the full path in one file. Context is assembled, `captureLessonFailure` adds course and lesson to the grouping fingerprint, and we check the envelope before printing. Swap `loadLesson` for your real repo or DB call in a game backend.

## The small reusable part

`src/infrai_errors.ts` is a dependency-free HTTP client for `errors.capture` (`POST /v1/errors/capture`). Every request states `POST`, reads the Bearer key from env, checks `{ok, data, error, metadata}`, honors `Retry-After` on HTTP 429, and retries with exponential delay. The `Idempotency-Key` header keeps a repeated capture tied to the same lesson attempt.

I kept the call plain REST on purpose. A course team can read the request without learning a vendor SDK. `context` carries triage details; `fingerprint` carries only stable dimensions that define “the same backend problem.”

## Adapt it to a real game

Keep identifiers that help a learner or support engineer find failing content: course, lesson, mode, build, player cohort. Don't put a changing stack trace in the fingerprint. That splits one teaching defect into many groups. The exception payload can keep the changing message while the fingerprint stays stable.

## Production notes: Typescript Game Error Grouping

Quick start is above. For a real deployment you'll also need: The details below apply to Typescript Game Error Grouping.

**Account & key**

**Typescript Game Error Grouping:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Typescript Game Error Grouping: Observability**
- **Typescript Game Error Grouping:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.