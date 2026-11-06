import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";

test("proxy overwrites a forged return path without authenticating or refreshing", () => {
  const request = new NextRequest("https://mhs.local/admin/doctors", {
    headers: { "x-mhs-return-path": "//evil.example" },
  });
  const response = proxy(request);
  assert.equal(
    response.headers.get("x-middleware-request-x-mhs-return-path"),
    "/admin/doctors",
  );
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(response.headers.get("location"), null);
});
