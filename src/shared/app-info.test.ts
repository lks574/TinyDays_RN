import { describe, expect, it } from "@jest/globals";

import { APP_NAME } from "./app-info";

describe("APP_NAME", () => {
  it("matches the product name", () => {
    expect(APP_NAME).toBe("TinyDays");
  });
});
