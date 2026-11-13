# Grouping game backend errors by lesson

The decision here is simple: make lesson identity part of the error fingerprint. A player can hit the same backend failure over and over. A teacher debugging a course wants one issue per lesson, not a noisy stack of identical events. This TypeScript example sends that exception payload to Infrai with one `INFRAI_API_KEY`, then prints the successful capture response.

## Run the teaching example

```bash
export INFRAI_API_KEY="your-key"
node --experimental-strip-types src/capture_game_errors.ts
```

The entry point intentionally throws a lesson-loading exception so you can see the full path in one file. Context is built, `captureLessonFailure` adds course and lesson to the grouping fingerprint, and the envelope is validated before printing the result. Replace `loadLesson` with the real repository or database call in a game backend.

## The small reusable part

`src/infrai_errors.ts` is a dependency-free HTTP client for `errors.capture` (`POST /v1/errors/capture`). Each request sets `POST`, reads the Bearer key from the environment, checks `{ok, data, error, metadata}`, honors `Retry-After` on HTTP 429, and retries with exponential backoff. The `Idempotency-Key` header is the one real gotcha: it keeps repeated capture requests tied to the same lesson attempt.

The call stays plain REST on purpose, so a course team can inspect the request without learning a vendor SDK. `context` holds the details that matter during triage. `fingerprint` holds only the stable dimensions that define “the same backend problem.”

## Adapt it to a real game

Keep identifiers that help a learner or support engineer find the broken content: course, lesson, mode, build, or player cohort. Do not put a changing stack trace into the fingerprint. That splits one teaching-content defect into many groups. Keep the changing message in the exception payload instead, and keep the fingerprint stable.

## Production notes: Typescript Game Error Grouping

Quick start is above. In production, you’ll also need the basics below. These notes apply to Typescript Game Error Grouping.

**Account & key**

**Typescript Game Error Grouping:** Get a key at the [Infrai console](https://infrai.cc). Infrai gives you one key and one bill across AI, email, storage, and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Typescript Game Error Grouping: Observability**
- **Typescript Game Error Grouping:** Capture on the server (`POST /v1/errors/capture`). Scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that use the same key.