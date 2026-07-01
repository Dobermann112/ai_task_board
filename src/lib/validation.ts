import { Priority, Status } from "@/generated/prisma/enums";

const STATUS_VALUES = Object.values(Status);
const PRIORITY_VALUES = Object.values(Priority);

export const TITLE_MAX_LENGTH = 30;
export const DESCRIPTION_MAX_LENGTH = 100;

export type TaskInput = {
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
};

export class ValidationError extends Error {}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseTaskInput(body: unknown): TaskInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("リクエストボディが不正です");
  }

  const { title, description, status, priority } = body as Record<string, unknown>;

  if (!isNonEmptyString(title)) {
    throw new ValidationError("titleは必須です");
  }
  if (title.length > TITLE_MAX_LENGTH) {
    throw new ValidationError(`titleは${TITLE_MAX_LENGTH}文字以内で入力してください`);
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      throw new ValidationError("descriptionは文字列である必要があります");
    }
    if (description.length > DESCRIPTION_MAX_LENGTH) {
      throw new ValidationError(`descriptionは${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`);
    }
  }

  const resolvedStatus = status ?? Status.TODO;
  if (!STATUS_VALUES.includes(resolvedStatus as Status)) {
    throw new ValidationError(`statusは${STATUS_VALUES.join(" / ")}のいずれかである必要があります`);
  }

  const resolvedPriority = priority ?? Priority.MEDIUM;
  if (!PRIORITY_VALUES.includes(resolvedPriority as Priority)) {
    throw new ValidationError(`priorityは${PRIORITY_VALUES.join(" / ")}のいずれかである必要があります`);
  }

  return {
    title: title.trim(),
    description: description ? (description as string).trim() : null,
    status: resolvedStatus as Status,
    priority: resolvedPriority as Priority,
  };
}

export function parseTaskUpdateInput(body: unknown): Partial<TaskInput> {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("リクエストボディが不正です");
  }

  const { title, description, status, priority } = body as Record<string, unknown>;
  const result: Partial<TaskInput> = {};

  if (title !== undefined) {
    if (!isNonEmptyString(title)) {
      throw new ValidationError("titleは必須です");
    }
    if (title.length > TITLE_MAX_LENGTH) {
      throw new ValidationError(`titleは${TITLE_MAX_LENGTH}文字以内で入力してください`);
    }
    result.title = title.trim();
  }

  if (description !== undefined) {
    if (description !== null && typeof description !== "string") {
      throw new ValidationError("descriptionは文字列である必要があります");
    }
    if (typeof description === "string" && description.length > DESCRIPTION_MAX_LENGTH) {
      throw new ValidationError(`descriptionは${DESCRIPTION_MAX_LENGTH}文字以内で入力してください`);
    }
    result.description = description ? (description as string).trim() : null;
  }

  if (status !== undefined) {
    if (!STATUS_VALUES.includes(status as Status)) {
      throw new ValidationError(`statusは${STATUS_VALUES.join(" / ")}のいずれかである必要があります`);
    }
    result.status = status as Status;
  }

  if (priority !== undefined) {
    if (!PRIORITY_VALUES.includes(priority as Priority)) {
      throw new ValidationError(`priorityは${PRIORITY_VALUES.join(" / ")}のいずれかである必要があります`);
    }
    result.priority = priority as Priority;
  }

  return result;
}

const CUID_PATTERN = /^[a-z0-9]{20,32}$/;

export function isValidTaskId(id: string): boolean {
  return isNonEmptyString(id) && CUID_PATTERN.test(id);
}
