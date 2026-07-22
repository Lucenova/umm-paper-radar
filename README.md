# UMM 论文雷达

面向统一多模态模型（UMM）的中文研究雷达，持续整理并比较：

- Encoder-free / Omni 多模态模型
- 统一理解与生成、视觉 Token 与语义对齐
- AR、离散 Diffusion、Embedding Flow、Flow Matching 等建模范式
- Diffusion LLM 与 MLLM/LLM 可解释性
- 视觉、机器人与具身世界模型

在线网站：<https://lucenova.github.io/umm-paper-radar/>

## 本地开发

需要 Node.js 22：

```bash
npm ci
npm run dev
```

GitHub Pages 静态构建：

```bash
GITHUB_ACTIONS=true npm run build:pages
```

`main` 分支更新后，GitHub Actions 会自动构建并发布 `out/`。
