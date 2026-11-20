import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const issueDate = source.match(/<time dateTime="(\d{4}-\d{2}-\d{2})"/)?.[1]?.replaceAll("-", ".");
assert.ok(issueDate, "the current issue must declare its date");
const js = ts.transpileModule(
  source + "\nexport { papers, englishOverrides, getEnglishCopy, inferDomain, sourceLabel, PAGE_SIZE, selectResources };",
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } },
).outputText;

// Pure render checks exercise both language branches and every page.
// These are not browser click/hydration tests.
function loadPage({ language = "en", active = "全部内容", page = 1 } = {}) {
  const module = { exports: {} };
  const react = {
    ...React,
    useEffect() {},
    useMemo(fn) { return fn(); },
    useState(initial) {
      const value = initial === "en" ? language
        : initial === "今日精选" ? active
        : initial === 1 ? page : initial;
      return [value, () => {}];
    },
  };
  new Function("require", "module", "exports", js)(
    (name) => name === "react" ? react : require(name), module, module.exports,
  );
  return module.exports;
}

const data = loadPage();
const newIds = ["univep-noise-targets", "affect-action-effects", "visalloc-paired-evidence", "egopass-passage-relevance"];
const preservedBlogId = "blog-google-coherent-long-form-video";

test("archive is retained and new resources are unique and complete", () => {
  assert.ok(data.papers.length >= 273);
  assert.equal(new Set(data.papers.map(p => p.id)).size, data.papers.length);
  assert.equal(new Set(data.papers.map(p => p.index)).size, data.papers.length);
  const featured = data.papers.filter(p => p.featured);
  assert.ok(featured.length > 0 && featured.length <= 5);
  for (const id of newIds) {
    const paper = data.papers.find(p => p.id === id);
    assert.ok(paper);
    assert.equal(data.papers.filter(p => p.paper === paper.paper).length, 1);
    for (const key of ["summary", "why", "inspiration", "experiment", "state", "objective", "decoding", "sharing", "open"]) {
      assert.ok(paper[key]?.length > 20, id + " Chinese " + key);
      assert.ok(data.englishOverrides[id]?.[key]?.length > 20, id + " English " + key);
    }
    if (data.inferDomain(paper) === "World Model") {
      for (const key of ["action", "rollout", "evaluation"]) {
        assert.ok(paper[key]);
        assert.ok(data.englishOverrides[id][key]);
      }
    }
  }
});

test("all English pages are free of Chinese visible text and paginate at ten", () => {
  const pages = Math.ceil(data.papers.length / data.PAGE_SIZE);
  for (let page = 1; page <= pages; page++) {
    const module = loadPage({ page });
    const html = renderToStaticMarkup(React.createElement(module.default));
    const chinese = html.match(/.{0,65}[\u3400-\u9fff].{0,65}/gu) ?? [];
    assert.equal(chinese.length, 0, "English page " + page + ": " + chinese.join(" | "));
    const cards = (html.match(/class="paper-card/g) ?? []).length;
    assert.ok(cards > 0 && cards <= 10, "pagination page " + page);
    assert.ok(html.includes(issueDate));
    assert.match(html, /UMM Generation Matrix/);
  }
});

test("Chinese branch, Blog source, explicit arXiv links, and six tracks remain", () => {
  const zh = loadPage({ language: "zh", active: "今日精选" });
  const html = renderToStaticMarkup(React.createElement(zh.default));
  const zhBlogs = loadPage({ language: "zh", active: "Blog" });
  const blogHtml = renderToStaticMarkup(React.createElement(zhBlogs.default));
  assert.match(html, /为什么推荐/);
  assert.match(html, /世界模型：状态、动作与动力学矩阵/);
  assert.match(html, /arXiv · 2611\.26103/);
  assert.match(blogHtml, /阅读 Blog/);
  const tracks = new Set(data.papers.map(data.inferDomain));
  for (const track of ["UMM", "图像生成", "视频生成", "World Model", "可解释性", "评测诊断"]) {
    assert.ok(tracks.has(track));
  }
  assert.equal(data.papers.find(p => p.id === preservedBlogId).kind, "Blog");
});

test("source, category, bilingual search, saved reads, and publication sorting compose", () => {
  const all = data.selectResources("全部内容", "", "all", "curated", []);
  assert.equal(all.length, data.papers.length);
  assert.equal(Number(all[0].index), Math.max(...data.papers.map(p => Number(p.index))));
  const blogs = data.selectResources("全部内容", "", "Blog", "curated", []);
  assert.ok(blogs.length > 0);
  assert.ok(blogs.every(p => p.kind === "Blog"));
  const world = data.selectResources("World Model", "", "Paper", "published", []);
  assert.ok(world.every(p => data.inferDomain(p) === "World Model" && p.kind !== "Blog"));
  assert.ok(world.every((p, i) => i === 0 || world[i - 1].date.slice(0, 10) >= p.date.slice(0, 10)));
  assert.deepEqual(data.selectResources("已保存", "", "all", "curated", [newIds[0]]).map(p => p.id), [newIds[0]]);
  assert.ok(data.selectResources("全部内容", "2611.26103", "all", "curated", []).some(p => p.id === newIds[0]));
  assert.ok(data.selectResources("全部内容", "temporally correlated noise", "all", "curated", []).some(p => p.id === newIds[1]));
  assert.ok(data.selectResources("全部内容", "时间相关动作扰动", "all", "curated", []).some(p => p.id === newIds[1]));
  assert.equal(data.selectResources("全部内容", "no-such-paper-837521", "all", "curated", []).length, 0);
});
