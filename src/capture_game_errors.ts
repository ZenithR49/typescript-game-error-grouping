import { infrai } from "./infrai_errors.ts";

type LessonContext = {
  course: string;
  lesson: string;
  playerId: string;
};

export async function captureLessonFailure(
  error: unknown,
  context: LessonContext,
): Promise<unknown> {
  const message = error instanceof Error ? error.message : String(error);
  return infrai.errors.capture({
    message,
    level: "error",
    fingerprint: ["lesson-load", context.course, context.lesson],
    context,
  });
}

async function loadLesson(): Promise<void> {
  throw new Error("lesson manifest could not be read");
}

async function main(): Promise<void> {
  const context = { course: "space-navigation", lesson: "orbital-map", playerId: "demo-player" };
  try {
    await loadLesson();
  } catch (error) {
    const result = await captureLessonFailure(error, context);
    console.log(JSON.stringify({ captured: true, course: context.course, lesson: context.lesson, result }));
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

