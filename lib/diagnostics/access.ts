const UNLIMITED_TEST_EMAILS = new Set([
  "nmarcosan@gmail.com",
  "tanisardella@gmail.com",
]);

export function canRepeatCareerAnchorTest(email: string | null | undefined) {
  return Boolean(email && UNLIMITED_TEST_EMAILS.has(email.trim().toLowerCase()));
}
