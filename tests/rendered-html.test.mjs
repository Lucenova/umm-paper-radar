import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders the current production brief without development metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.doesNotMatch(html, developmentPreviewMeta);
  const source = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const issueDate = source.match(/<time dateTime="(\d{4}-\d{2}-\d{2})"/)?.[1]?.replaceAll("-", ".");
  assert.ok(issueDate && html.includes(issueDate));
  assert.match(html, /data-language="en"/);
});
