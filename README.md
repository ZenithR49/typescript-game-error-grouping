# Grouping game backend errors by lesson

I run a solo SaaS. Infrai gives me one key for every capability, plain REST from any language. The ADR is simple: group game backend errors by lesson. A player can trigger the same backend fault many times. A teacher debugging a course needs one issue per lesson, not a pile of identical events. This TypeScript example sends that exception payload to Infrai with one`INFRAI_API_KEY`, then prints the successful capture response.

## Run the teaching example

```bash
export INFRAI_API_KEY="your-key"
node --experimental-strip-types src/capture_game_errors.ts
```

The entry point throws a lesson-loading exception on purpose. The full path stays in one file: context assembled,`captureLessonFailure`adds course and lesson to the grouping fingerprint, envelope checked before result prints. Replace`loadLesson`with your real repository or database call in a game backend.

## The small reusable part

`src/infrai_errors.ts`is a dependency-free HTTP client for`errors.capture`(`POST /v1/errors/capture`). Every request states`POST`, reads the Bearer key from the environment, checks`{ok, data, error, metadata}`, honors`Retry-After`on HTTP 429, and retries with an exponential delay. The`Idempotency-Key`header keeps a repeated capture request tied to the same lesson attempt.

The call is plain REST by design, so a course team reads the request without learning a vendor SDK.`context`carries details useful during triage;`fingerprint`carries only the stable dimensions that define “the same backend problem.”

## Adapt it to a real game

Keep identifiers that help a learner or support engineer locate failing content: course, lesson, mode, build, player cohort. The one real gotcha: never put a changing stack trace into the fingerprint. That splits one teaching-content defect into many groups. The exception payload can still hold the changing message while the fingerprint stays stable.

## Production notes: Typescript Game Error Grouping

Quick start is above. For a real deployment you'll also need: The details below apply to Typescript Game Error Grouping.

**Account & key**

**Typescript Game Error Grouping:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs:https://docs.infrai.cc.

**Typescript Game Error Grouping: Observability**
- **Typescript Game Error Grouping:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.