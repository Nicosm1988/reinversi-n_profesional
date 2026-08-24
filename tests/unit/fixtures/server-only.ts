// Vitest does not apply Next.js' private `server-only` module alias.
// This empty test-only module lets server utilities be imported while their
// actual dependencies remain explicitly mocked by each unit test.
export {};
