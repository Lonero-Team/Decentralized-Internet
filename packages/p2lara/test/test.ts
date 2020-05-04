require("ts-mocha");
import assert from "assert";

describe("testSuite", () => {
  describe("testMethod", () => {
    it("1 == 1", () => {
      assert.equal(1, 1);
    });
  });
});
