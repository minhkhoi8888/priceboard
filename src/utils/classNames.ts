export type ClassNameValue = string | false | null | undefined;

export const cx = (...values: ClassNameValue[]) =>
  values.filter(Boolean).join(" ");
