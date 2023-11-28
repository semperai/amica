import { describe, expect, test } from "@jest/globals";

describe("Calculator Tests", () => {
  test("should return 5 when 2 is added to 3", () => {
    const result = 2 + 3;
    expect(result).toBe(5);
  });
});
