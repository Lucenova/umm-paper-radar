"use client";

import { useEffect, useMemo, useState } from "react";

type Paper = {
  id: string;
  index: string;
  title: string;
  shortTitle: string;
  date: string;
  category: string;
  paradigm: string;
  state: string;
  objective: string;
  decoding: string;
  sharing: string;
  open: string;
  priority: "精读" | "泛读";
  summary: string;
  why: string;
  inspiration: string;
  experiment: string;
  paper: string;
  code?: string;
  codeLabel?: string;
  action?: string;
  rollout?: string;
  evaluation?: string;
  featured?: boolean;
  idea?: boolean;
};

const papers: Paper[] = [
  {
    id: "elf",
    index: "01",
    title: "ELF: Embedded Language Flows",
    shortTitle: "ELF",
    date: "2026-05-12",
    category: "连续 Flow",
    paradigm: "Continuous Embedding Flow",
    state: "连续 token embedding",
    objective: "Flow Matching + L2 / 辅助 CE",
    decoding: "32–64 步 ODE/SDE，末步离散化",
    sharing: "共享权重解码器；T5 encoder 提供 embedding",
    open: "代码、PyTorch 分支、权重已公开",
    priority: "精读",
    summary:
      "把语言生成主要保持在连续 embedding 空间，通过 continuous-time Flow Matching 从高斯噪声运输到 clean embedding，只在最终时刻映射回离散 token。",
    why:
      "它是 URSA 离散 metric path 最干净的连续对照：两者都进行全局迭代修正，但一个在词表概率几何中移动，另一个在 embedding 流形中移动。",
    inspiration:
      "可把 IBQ code embedding 直接作为目标空间，检验连续轨迹是否比离散 CE 更容易表达图像 token 之间的相似性；同时要警惕 embedding 回投 token 时的边界模糊和 codebook collapse。",
    experiment:
      "固定 Qwen3-1.7B、IBQ tokenizer、30M 数据与训练 token 数，仅把 URSA 的 metric-path CE 替换为 ELF-style velocity/L2；共同报告 GenEval、DPG、OCR、VQA、2/4/8/16/32 步曲线和 token 回投错误率。",
    paper: "https://arxiv.org/abs/2605.10938",
    code: "https://github.com/lillian039/ELF",
    featured: false,
  },
  {
    id: "ursa",
    index: "02",
    title: "URSA: Uniform Discrete Diffusion with Metric Path",
    shortTitle: "URSA",
    date: "2025-10-28 · ICLR 2026",
    category: "离散 Diffusion",
    paradigm: "Metric-path Discrete Diffusion",
    state: "离散 image token ID",
    objective: "clean-token logits / Cross-Entropy",
    decoding: "全局迭代 refinement + Euler solver",
    sharing: "可由 Qwen3 初始化；扩展视觉词表与 LM head",
    open: "代码、IBQ/FSQ 模型与训练流程已公开",
    priority: "精读",
    summary:
      "在离散词表上定义与 token 距离相关的 metric path，以全局迭代修正替代从左到右累积误差，并通过 timestep shifting 适配高分辨率与长视频。",
    why:
      "这是你当前 UMM 实验的核心基线：保留 LLM 式 logits/CE 接口，又获得 diffusion 的并行 refinement，最适合研究理解与生成是否能共享一个 Transformer。",
    inspiration:
      "URSA 的优势可能来自建模方式，也可能来自 IBQ tokenizer、视觉词表扩展或 schedule。网站后续所有比较都会把这些变量拆开，避免把 tokenizer 提升误判为 diffusion 提升。",
    experiment:
      "先以原始 URSA 为锚点，逐项替换 noise path、timestep sampling、unmask order 与 token head；额外记录不同 t 下 image/text hidden state 的内部时钟和稳定顺序。",
    paper: "https://arxiv.org/abs/2510.24717",
    code: "https://github.com/baaivision/URSA",
    featured: false,
  },
  {
    id: "x-omni",
    index: "03",
    title: "X-Omni: RL Makes Discrete Autoregressive Image Models Great Again",
    shortTitle: "X-Omni",
    date: "2025-07-29",
    category: "自回归建模",
    paradigm: "Discrete Autoregressive + RL",
    state: "SigLIP-VQ 离散视觉 token",
    objective: "next-token CE + GRPO",
    decoding: "严格左到右，自回归采样",
    sharing: "统一 AR 主干；离线 diffusion decoder 负责像素生成",
    open: "论文、项目页、代码与模型已公开",
    priority: "精读",
    summary:
      "使用单一自回归模型预测语言与视觉离散 token，再通过 GRPO 缓解累计误差和生成分布偏移，证明 AR 图像生成仍可达到强指令遵循和文字渲染能力。",
    why:
      "它能回答一个关键问题：如果 RL 已经能修复 AR 的累计误差，UMM 是否还需要引入独立的 diffusion 训练范式？这是 URSA/ELF 对照中不可缺失的 AR 端点。",
    inspiration:
      "你正在使用 X-Omni tokenizer 做 MLLM，OCR 性能要同时区分 tokenizer 信息上限与 Qwen 是否真正使用视觉 token。X-Omni 还提示可把 OCR reward 加入生成侧 RL，但不能替代理解侧的细粒度语义监督。",
    experiment:
      "固定同一视觉 tokenizer，比较 AR-SFT、AR-GRPO、URSA-SFT 与 URSA-GRPO；同一 prompt 下统计 OCR、构图多样性、累计 token 错误、吞吐和 KV-cache 成本。",
    paper: "https://arxiv.org/abs/2507.22058",
    code: "https://x-omni-team.github.io/",
    featured: false,
  },
  {
    id: "toklip",
    index: "04",
    title: "TokLIP: Marry Visual Tokens to CLIP",
    shortTitle: "TokLIP",
    date: "2025-05-08 · v2 2025-08-15",
    category: "统一视觉 Token",
    paradigm: "VQ token + Semantic Token Encoder",
    state: "离散 VQ token + 连续高层语义",
    objective: "生成与理解目标解耦",
    decoding: "沿用底层 VQ/AR 生成路径",
    sharing: "同一视觉 token 接口，语义与重建职责分离",
    open: "训练代码、评测脚本、IBQ 权重已公开",
    priority: "精读",
    summary:
      "在低层 VQ tokenizer 之上加入 ViT token encoder，将 CLIP/SigLIP 级语义注入视觉 token，同时保留原有重建和生成能力；TokLIP-XL 直接采用 IBQ。",
    why:
      "它与当前 IBQ→Qwen 的问题完全对口：失败不一定意味着 IBQ 没有信息，也可能是原始 code embedding 缺乏可供 LLM 使用的语义组织。",
    inspiration:
      "比单层 MLP 更优雅的路线是让 code sequence 经过 semantic token encoder，再送入 Qwen；生成侧继续预测原始 token ID，理解侧使用语义化表示。",
    experiment:
      "固定 IBQ decoder，对比 raw code embedding、2-layer MLP、TokLIP-style encoder 与 DINO/SigLIP distillation；联合报告重建、OCR、DocVQA、TextVQA、VQA 和 T2I。",
    paper: "https://arxiv.org/abs/2505.05422",
    code: "https://github.com/TencentARC/TokLIP",
    featured: false,
  },
  {
    id: "uniar",
    index: "05",
    title: "UniAR: Shared Context-Visual Tokenizer is Key to Unification",
    shortTitle: "UniAR",
    date: "2026-06-16 · ICML 2026",
    category: "统一多模态",
    paradigm: "Shared-tokenizer Autoregressive UMM",
    state: "多层语义/纹理特征 → BSQ 离散 token",
    objective: "共享视觉 token 的并行 bit prediction",
    decoding: "自回归上下文 + bitwise 并行预测",
    sharing: "理解、生成、编辑共享 tokenizer 与视觉上下文",
    open: "项目页、代码、权重已公开",
    priority: "精读",
    summary:
      "用同一个视觉 tokenizer 同时服务理解、生成和编辑，并让模型直接理解刚生成的视觉 token；多层视觉特征与 bitwise quantization 兼顾语义和细节。",
    why:
      "UniAR提出了比‘共用一个 Transformer’更严格的统一标准：模型能否在不解码成像素、不重新编码的条件下继续理解自己生成的 token。",
    inspiration:
      "这正好暴露 URSA/IBQ 的潜在断点：生成 head 会预测 code ID，但这些 code embedding 是否足够支持 VQA 与 grounding，需要 shared-context 实验才能证明。",
    experiment:
      "让 URSA 生成 image token 后直接接入 caption/VQA；与‘解码成图像→重新编码→理解’比较，同时分析两条路径的语义一致性、OCR 与错误传播。",
    paper: "https://arxiv.org/abs/2606.18249",
    code: "https://sharelab-sii.github.io/uniar-web/",
    featured: false,
  },
  {
    id: "flow-map-lm",
    index: "06",
    title: "Flow Map Language Models: How to Generate Text in One Step",
    shortTitle: "Flow Map LM",
    date: "2026-04-04",
    category: "连续 Flow",
    paradigm: "Simplex Flow + Flow-map Distillation",
    state: "词表 simplex 上的连续 one-hot 状态",
    objective: "clean-token posterior / CE + flow-map distillation",
    decoding: "连续联合运输，可蒸馏为一步",
    sharing: "仍连接离散 vocabulary head",
    open: "博客、代码、checkpoint 已公开",
    priority: "精读",
    summary:
      "不是直接对 embedding 做普通 MSE，而是在词表 simplex 中从高斯状态流向 one-hot 数据，模型预测 clean-token posterior，随后蒸馏跨时间 flow map。",
    why:
      "它位于 URSA 与 ELF 之间：状态是连续的，但目标仍是离散 token 与 CE，因此特别适合作为‘连续状态是否必须配 embedding 回归’的反例。",
    inspiration:
      "对 IBQ 可以保留共享 image vocabulary head，在连续概率状态上建模，再以 CE 保持 codebook 分类边界，可能比直接回归 code embedding 更稳。",
    experiment:
      "比较 URSA metric path、ELF embedding flow 与 simplex posterior flow；固定 token head 后重点测边界 token 的混淆率、一步/少步质量和 token 间联合一致性。",
    paper: "https://one-step-lm.github.io/blog/",
    code: "https://github.com/david3684/flm",
  },
  {
    id: "langflow",
    index: "07",
    title: "LangFlow: Continuous Diffusion Rivals Discrete in Language Modeling",
    shortTitle: "LangFlow",
    date: "2026-04-13",
    category: "连续 Flow",
    paradigm: "Bregman Embedding Diffusion",
    state: "连续 token embedding",
    objective: "Bregman / clean embedding prediction",
    decoding: "ODE 采样 + self-conditioning",
    sharing: "连续 denoiser 后映射离散 token",
    open: "论文与代码已公开",
    priority: "精读",
    summary:
      "通过 Bregman divergence、可学习的 information-uniform Gumbel scheduler 与 self-conditioning，让连续语言扩散在似然和生成上接近离散 DLM。",
    why:
      "它提醒 ELF-style UMM 不能只写一个 embedding MSE：目标空间几何、时间信息量分配与 self-conditioning 都可能决定连续路线是否公平。",
    inspiration:
      "如果 IBQ code embedding 的欧氏距离不等价于视觉语义距离，普通 MSE 会优化错误几何；Bregman/cosine 与 clean-token CE 应一起比较。",
    experiment:
      "在同一 URSA→ELF 分支上做 MSE、cosine/Bregman、clean-token CE 三组 loss，并比较 uniform timestep 与 information-uniform scheduler。",
    paper: "https://arxiv.org/abs/2604.11748",
    code: "https://github.com/nealchen2003/LangFlow",
  },
  {
    id: "divt",
    index: "08",
    title: "A More Word-like Image Tokenization for MLLMs",
    shortTitle: "DiVT",
    date: "2026-05-18 · CVPR 2026",
    category: "统一视觉 Token",
    paradigm: "Adaptive Semantic Clustering",
    state: "连续 patch feature → 自适应概念 token",
    objective: "LLM 目标驱动的聚类 projector",
    decoding: "理解侧输入压缩，不负责像素生成",
    sharing: "不改 vision encoder 与 LLM",
    open: "代码、训练脚本与 checkpoint 已公开",
    priority: "精读",
    summary:
      "根据 patch 语义相似度形成可变数量的视觉概念 token，直接针对 MLP projector 输出高度相关、有效秩低的问题，而不只是做固定网格降采样。",
    why:
      "它说明视觉 embedding 训练不动不一定只是 std 或范数不匹配：即使尺度正确，高相关和语义纠缠仍会让 LLM 难以选择视觉证据。",
    inspiration:
      "对 IBQ 应同时审计 RMS、pairwise cosine、covariance effective rank、codebook usage 和每层 attention received，再决定修改初始化还是重构 token 表示。",
    experiment:
      "在 raw IBQ、MLP、DiVT clustering 和 TokLIP encoder 上统一测 token 数、有效秩、DocVQA/OCRBench、小目标 grounding 与吞吐。",
    paper: "https://arxiv.org/abs/2605.17954",
    code: "https://github.com/LeeHyun98/DiVT",
  },
  {
    id: "ps-vae",
    index: "09",
    title: "Aligning Visual Foundation Encoders to Tokenizers for Diffusion Models",
    shortTitle: "PS-VAE",
    date: "2025-09-29",
    category: "语义对齐",
    paradigm: "Semantic Encoder → Generation-ready Latent",
    state: "DINO/SigLIP 连续语义 latent",
    objective: "重建 + semantic preservation",
    decoding: "连续 latent diffusion",
    sharing: "以语义 encoder 为起点补充像素细节",
    open: "论文公开；未见完整官方代码",
    priority: "精读",
    summary:
      "反转常规路线：不是让重建 VAE 经 MLP 获得语义，而是把 DINOv2/SigLIP 等语义 encoder 训练成同时可重建、可供 diffusion 建模的 tokenizer。",
    why:
      "它直接挑战‘继续改造 IBQ’这一默认选择，并提供另一条可能更根本的路线：从已经存在的语义流形出发，再向其中注入重建细节。",
    inspiration:
      "如果 IBQ 在量化前已经丢失文字和细粒度目标，任何 projector 都无法恢复；此时 semantic-first tokenizer 可能比 codebook 蒸馏更合理。",
    experiment:
      "建立 A: IBQ+MLP、B: IBQ+DINO 蒸馏、C: 冻结 DINO/SigLIP+轻量 bottleneck/decoder 三组，联合比较重建、OCR、VQA 与 T2I。",
    paper: "https://arxiv.org/abs/2509.25162",
  },
  {
    id: "vtbench",
    index: "10",
    title: "VTBench: Evaluating Visual Tokenizers for Autoregressive Image Generation",
    shortTitle: "VTBench",
    date: "2025-05-19",
    category: "评测诊断",
    paradigm: "Tokenizer-only Audit",
    state: "离散与连续视觉 latent",
    objective: "重建、细节与文字保真评测",
    decoding: "独立于上层生成模型",
    sharing: "用于隔离 tokenizer 上限",
    open: "代码、数据与评测资源已公开",
    priority: "精读",
    summary:
      "把 visual tokenizer 从端到端模型中单独取出，以 PSNR、LPIPS、FID、OCR CER/WER 等指标评估重建、细节和文字保留。",
    why:
      "在比较 URSA、ELF 或 AR 之前，必须先知道 X-Omni/IBQ tokenizer 是否已经丢失 DocVQA 所需的小字、布局和局部纹理。",
    inspiration:
      "OCR 差可以来自 tokenizer 信息上限、projector grounding deadlock 或生成建模方式。VTBench 提供第一层排查，避免在 Qwen 主干上盲目调参。",
    experiment:
      "先做原图→tokenizer→重建的 OCRBench/DocVQA audit，再增加 DINO similarity 与 linear probe，形成重建—语义二维 tokenizer 画像。",
    paper: "https://arxiv.org/abs/2505.13439",
    code: "https://github.com/huawei-lin/VTBench",
  },
  {
    id: "dlm-scope",
    index: "11",
    title: "DLM-Scope: Mechanistic Interpretability of DLMs via SAEs",
    shortTitle: "DLM-Scope",
    date: "2026-02-05",
    category: "可解释性",
    paradigm: "Sparse Autoencoder for Diffusion LM",
    state: "不同层与 timestep 的 residual activation",
    objective: "Top-K SAE reconstruction + sparsity",
    decoding: "解释并干预 unmask / denoising 过程",
    sharing: "可比较理解与生成稀疏特征",
    open: "训练、解释、steering 代码和 SAE 权重已公开",
    priority: "精读",
    summary:
      "在 Dream、LLaDA 等 DLM 上训练 SAE，识别能够进行 diffusion-time steering、预测恢复顺序且在后训练前后保持稳定的稀疏特征。",
    why:
      "它把 DLM 可解释性从 attention map 推进到可干预特征，并能直接分析‘哪些语义决定某个 token 何时恢复’。",
    inspiration:
      "可在 URSA image hidden states 上发现物体、布局、纹理与 OCR 特征，并检查理解任务和生成任务是否复用同一组 feature。",
    experiment:
      "按 layer×timestep 训练 SAE，测试 feature activation 能否预测下一个应恢复位置，再与 confidence、stride 和 learned mask policy 比较。",
    paper: "https://arxiv.org/abs/2602.05859",
    code: "https://github.com/Xu0615/SAE4DLM",
  },
  {
    id: "jsae",
    index: "12",
    title: "Steering Vision-Language Models with Joint Sparse Autoencoders",
    shortTitle: "JSAE",
    date: "2026-06-24",
    category: "可解释性",
    paradigm: "Cross-modal Joint SAE",
    state: "视觉/文本 activation 的配对 sparse code",
    objective: "SAE 重建 + sparse-code cosine alignment",
    decoding: "通过 feature injection / suppression 因果干预",
    sharing: "视觉与文本保留独立字典、对齐语义方向",
    open: "论文称释放代码；仓库入口仍不明确",
    priority: "精读",
    summary:
      "通过配对 sparse code 的余弦约束对齐视觉与文本特征，并用注入和抑制证明跨模态语义方向对模型输出具有因果作用。",
    why:
      "UMM 的‘统一’不能只看 benchmark；JSAE 提供了检验理解和生成是否共享内部语义方向的因果工具。",
    inspiration:
      "对 URSA 可分别收集理解、T2I 和文本 activation，回答哪些层开始跨模态对齐，以及视觉训练是否破坏 Qwen 原有语言特征。",
    experiment:
      "在相同 layer 上训练理解/生成联合 SAE，steer 一个物体或文字特征，观察它是否同时改变生成图像和图像问答答案。",
    paper: "https://arxiv.org/abs/2606.25657",
  },
  {
    id: "thinking-order",
    index: "13",
    title: "Thinking Out of Order: Output Order vs Reasoning Order in DLMs",
    shortTitle: "Thinking Out of Order",
    date: "2026-01-29",
    category: "可解释性",
    paradigm: "Token Stabilization Analysis",
    state: "masked token 与 confidence trajectory",
    objective: "分析 order robustness",
    decoding: "复杂 token 延迟提交、简单 token 提前稳定",
    sharing: "对比 AR 与从头/适配式 MDLM",
    open: "论文与完整实验细节公开；未见官方代码",
    priority: "精读",
    summary:
      "证明 MDLM 的内部稳定顺序可以不同于最终输出位置：即使要求答案写在解释前面，推理 token 仍可能先稳定。",
    why:
      "它提供一种观察 URSA coarse-to-fine 的可量化方式，而不是只凭采样图像主观判断模型是否先规划全局。",
    inspiration:
      "可以为每个 image/text token 定义 first-stable time 与 flip count，观察布局、物体、文字和纹理分别在哪个阶段形成。",
    experiment:
      "绘制二维 image-token 稳定时间热图，对比 metric path、ELF flow、confidence scheduler 与 spatial stride，并测试 text/image 是否共享同一内部时钟。",
    paper: "https://arxiv.org/abs/2601.22035",
  },
  {
    id: "mask-aware-pg",
    index: "14",
    title: "Mask-Aware Policy Gradients for Diffusion Language Models",
    shortTitle: "Mask-Aware PG",
    date: "2026-07-16 · COLM 2026",
    category: "离散 Diffusion",
    paradigm: "Token Policy + Mask Policy RL",
    state: "离散 token 与二值 mask action",
    objective: "token term + masking term policy gradient",
    decoding: "同时学习填什么与何时提交",
    sharing: "在统一 MDLM policy 中联合优化",
    open: "官方仓库已建立，完整代码仍在补充",
    priority: "精读",
    summary:
      "把恢复顺序也视为动作，不再只优化 masked position 应预测什么 token；策略梯度同时覆盖 token decision 和 mask/unmask decision。",
    why:
      "URSA 的 scheduler 不是无关紧要的工程细节，它可能决定全局结构和局部纹理获得多少计算预算，也可能限制 GRPO 的最终上限。",
    inspiration:
      "图像生成 RL 应区分内容策略与位置策略；可以让轻量 mask head 根据 confidence、空间位置、timestep 和 SAE feature 决定本轮提交哪些 token。",
    experiment:
      "做固定 scheduler、只学 mask、只学 token、联合学习四组，并额外加入 coarse-to-fine 空间约束，报告 reward 与多样性。",
    paper: "https://arxiv.org/abs/2607.15200",
    code: "https://github.com/Haran71/mask-aware-policy-gradients",
  },
  {
    id: "uniddt",
    index: "15",
    title: "UniDDT: Unifying Understanding and Generation with Decoupled DiT",
    shortTitle: "UniDDT",
    date: "2026-06-15",
    category: "统一多模态",
    paradigm: "Shared Semantic Encoder + Decoupled Diffusion Decoder",
    state: "Noisy ViT / 连续 visual latent",
    objective: "理解监督 + diffusion generation",
    decoding: "文本解码与 diffusion 解码分离",
    sharing: "共享语义编码，解耦输出生成机制",
    open: "论文公开；需继续跟踪完整训练资产",
    priority: "精读",
    summary:
      "使用 Noisy ViT 与 LLM 统一视觉语义编码，但把 diffusion 图像解码和文本解码分离，以缓解理解与生成目标直接竞争。",
    why:
      "它代表‘不追求所有组件完全共享’的务实路线，是检验 URSA 全共享是否真的优于共享 encoder、分离 decoder 的关键对照。",
    inspiration:
      "如果 URSA 同一 image vocabulary/head 同时承担理解和生成导致梯度冲突，UniDDT 式分离 decoder 可能保留语义统一，同时提高优化稳定性。",
    experiment:
      "固定同一 Qwen/visual latent，比较共享 head、独立 image head、独立 diffusion decoder；记录理解—生成梯度 cosine 与 Pareto frontier。",
    paper: "https://arxiv.org/abs/2606.16255",
  },
  {
    id: "answer-leakage",
    index: "16",
    title: "Answer-Conditioned Chains of Thought Degrade Reasoning Distillation",
    shortTitle: "Answer Leakage",
    date: "2026-07-16",
    category: "可解释性",
    paradigm: "CoT Faithfulness / Data Audit",
    state: "answer-blind vs answer-conditioned reasoning trace",
    objective: "验证推理数据的因果生成方向",
    decoding: "检测过早答案陈述与反向合理化",
    sharing: "适用于 LLM/MLLM 推理数据构造",
    open: "代码、数据构造与分析流程已公开",
    priority: "精读",
    summary:
      "即使两组 CoT 都通过最终答案正确性过滤，看到 gold answer 后写出的推理仍会教会模型反向合理化，并在困难任务上显著伤害泛化。",
    why:
      "你的多帧威胁检测数据如果把真实框、类别或结论交给教师再补写思考过程，也可能产生视觉证据并未真正支持答案的 CoT。",
    inspiration:
      "最终 JSON 正确不等于 reasoning grounded；需要引入删帧、替换目标、坐标扰动和反事实图像来检验推理是否真正使用视觉证据。",
    experiment:
      "建立 answer-blind 与 answer-conditioned 两套同答案数据，比较证据引用正确率、答案首次出现位置和反事实鲁棒性，再决定是否用于 SFT/GRPO。",
    paper: "https://arxiv.org/abs/2607.14552",
    code: "https://github.com/js-lee-AI/answer-leakage",
  },
  {
    id: "llada2-uni",
    index: "17",
    title: "LLaDA2.0-Uni: Unifying Multimodal Understanding and Generation with dLLM",
    shortTitle: "LLaDA2.0-Uni",
    date: "2026-04-22 · 重要补读",
    category: "离散 Diffusion",
    paradigm: "Block-level Masked Multimodal Diffusion",
    state: "SigLIP-VQ 离散视觉 token + 离散文本 token",
    objective: "masked clean-token logits / CE + diffusion decoder",
    decoding: "分块并行去掩码；视觉 decoder 再做少步生成",
    sharing: "文本/视觉共享 MoE dLLM 主干；统一 diffusion 目标，视觉另接 decoder",
    open: "代码、模型与推理示例已公开",
    priority: "精读",
    summary:
      "把 SigLIP 语义特征量化为离散视觉 token，并让文本和视觉都在 MoE dLLM 中进行 block-level masked diffusion；生成端再通过少步蒸馏的 diffusion decoder恢复高保真图像。",
    why:
      "它是 URSA 最关键的离散对照：两者都保留 clean-token CE 和并行 refinement，但 LLaDA2.0-Uni 使用 mask corruption 与分块生成，URSA 使用全词表 metric path。比较两者可以判断收益来自 metric-aware transition，还是仅来自并行双向建模。",
    inspiration:
      "对你的 Qwen3+IBQ 系统，最有价值的不是直接复现其 MoE 规模，而是把同一 IBQ token 序列分别放入 metric-path 与 mask-only corruption：若 OCR/DocVQA 差异很小，瓶颈更可能在 tokenizer/projector；若 metric path 显著更稳，说明 token 距离确实提供了额外归纳偏置。",
    experiment:
      "固定 Qwen3、IBQ、数据和视觉词表，比较 URSA metric path、纯 mask diffusion、block-mask diffusion；统一 clean-token CE，报告 OCRBench/DocVQA/TextVQA、GenEval、8/16/32 步吞吐、显存、稳定时间与 AR 初始化后遗忘。",
    paper: "https://arxiv.org/abs/2604.20796",
    code: "https://github.com/inclusionAI/LLaDA2.0-Uni",
    featured: false,
  },
  {
    id: "arm",
    index: "18",
    title: "ARM: An AutoRegressive Large Multimodal Model with Unified Discrete Representations",
    shortTitle: "ARM",
    date: "2026-06-09 · 重要补读",
    category: "自回归建模",
    paradigm: "Unified Discrete Autoregressive UMM",
    state: "语义化离散视觉 token ID + 文本 token ID",
    objective: "next-token CE + 生成/编辑偏好 RL",
    decoding: "严格左到右 AR；视觉 token 经 decoder 重建",
    sharing: "理解、生成、编辑共享语义 tokenizer、序列空间与 7B AR 主干",
    open: "论文、训练代码与模型资源已公开",
    priority: "精读",
    summary:
      "训练同时满足语义判别、语言对齐和像素重建的离散视觉 tokenizer，再用单一 7B 自回归模型统一理解、生成和编辑，并通过任务级 RL 改善图像质量、指令遵循与编辑一致性。",
    why:
      "ARM 与 X-Omni一起构成公平比较的 AR 端点：如果共享 tokenizer 足够语义化、RL 足够强，简单 next-token prediction 可能仍是最稳的 UMM 基线，不应把所有提升都归因于 diffusion。",
    inspiration:
      "你的现有 X-Omni/IBQ token 若 OCR 较弱，ARM提示应先问 tokenizer 是否同时受语言对齐和语义判别监督。URSA/ELF 的比较必须加入相同 tokenizer 的 AR-SFT/AR-RL，否则容易把 tokenizer 质量误判成生成机制优势。",
    experiment:
      "同一 IBQ、Qwen3 和训练 token 预算下比较 AR-SFT、AR-GRPO、URSA-SFT、URSA-GRPO；同时记录 teacher-forcing token accuracy、自由生成累计误差、KV-cache、峰值显存、OCR 字符保真和理解侧遗忘。",
    paper: "https://arxiv.org/abs/2606.11188",
    code: "https://github.com/wdrink/ARM",
    featured: false,
  },
  {
    id: "spar",
    index: "19",
    title: "SPAR: Semantic-Pixel Self-Alignment and Adaptive Routing for UMMs",
    shortTitle: "SPAR",
    date: "2026-06-22 · v2 2026-07-02",
    category: "语义对齐",
    paradigm: "Dual-stream Semantic-Pixel Tokenizer + Flow Matching",
    state: "语义流与像素流融合的连续 compact latent",
    objective: "重建 + semantic anchor + self-alignment + flow matching",
    decoding: "DiT/Flow Matching 在统一 latent 上生成",
    sharing: "tokenizer 兼顾理解与生成；MLLM 到 DiT 采用动态多层路由",
    open: "论文与项目页公开；完整训练代码尚未明确释放",
    priority: "精读",
    summary:
      "用不对称双流 tokenizer 显式拆分语义保持与高频像素恢复，再把两者融合进统一 latent；生成器不依赖外部 DINO 教师，而以 tokenizer 自身作为内部对齐目标。",
    why:
      "它把你当前的核心疑问拆得很清楚：单一 VAE latent 同时承担语义和重建可能存在容量与梯度冲突；与其只在 IBQ embedding 后加 MLP，不如显式保留 semantic stream，再用 pixel stream补细节。",
    inspiration:
      "可以将 IBQ 量化前 latent 作为 pixel stream，将冻结 SigLIP/DINO 特征作为 semantic anchor，并检查量化前、code embedding、量化后各阶段的语义损失。Dynamic Token Routing 还可替代只取 Qwen 最后一层作为生成条件的固定方案。",
    experiment:
      "固定 Qwen3 与 DiT/Flow 主干，比较 raw IBQ、IBQ+DINO蒸馏、双流融合；分别消融 semantic anchor、pixel stream 和动态层路由，并同步测 rFID/LPIPS、OCRBench、DocVQA、linear probe 与理解—生成梯度 cosine。",
    paper: "https://arxiv.org/abs/2606.23041",
    code: "https://hkust-longgroup.github.io/SPAR/",
    featured: false,
  },
  {
    id: "tms-sae",
    index: "20",
    title: "Measuring Monosemanticity in SAEs via Latent Activation Coherence",
    shortTitle: "TMS for SAE",
    date: "2026-07-20 · 新提交",
    category: "可解释性",
    paradigm: "Label-free SAE Evaluation",
    state: "DINOv3 / CLIP / BLIP2 activation 的 TopK 或 BatchTopK SAE latent",
    objective: "Tversky activation-set coherence；无需概念标签或外部 encoder",
    decoding: "不改变生成；评估 feature 是否真正单语义",
    sharing: "可用于视觉、VLM及跨任务 SAE 的统一质量审计",
    open: "论文公开；当前未见官方代码仓库",
    priority: "精读",
    summary:
      "提出 Tversky Monosemanticity Score，以二值化 latent 的激活集合一致性衡量 SAE feature 的单语义性，减少外部 embedding 几何和 encoder anisotropy 对评价的污染。",
    why:
      "你若直接在 URSA 上训练 SAE，仅凭自动生成的 feature label 或 CLIP 相似度判断‘语义特征’，很容易再次受视觉空间各向异性影响。TMS提供了一个与外部 teacher 解耦的质量门槛。",
    inspiration:
      "可比较理解、生成及不同 timestep 的 SAE feature 是否具有稳定激活集合；若某 feature 在理解和生成中都高 TMS、且干预有因果效果，它才更有资格被称为 UMM 共享语义方向。",
    experiment:
      "对 Qwen3 原模型、URSA-SFT、URSA-GRPO 的同层 activation 训练等预算 SAE；比较 TopK/BatchTopK、TMS、重建误差、稀疏度、concept deletion 与跨任务 feature overlap。",
    paper: "https://arxiv.org/abs/2607.17770",
    featured: false,
  },
  {
    id: "sieve-video",
    index: "21",
    title: "Sparse Evidence Can Suffice: Agentic Evidence Seeking for Multimodal Video",
    shortTitle: "SIEVE",
    date: "2026-07-20 · 新提交",
    category: "多帧推理",
    paradigm: "Evidence Acquisition + Verification",
    state: "稀疏多模态证据包与可检查 agent trajectory",
    objective: "evidence-seeking SFT + evidence-aware RL",
    decoding: "先主动选证据，再由 verifier 输出判断",
    sharing: "将感知预算分配与最终推理解耦",
    open: "论文公开；当前未见官方代码入口",
    priority: "精读",
    summary:
      "把长视频判断拆成主动证据获取与最终验证两个阶段：agent只提取少量决策相关片段，RL奖励信息增益并惩罚无效或冗余交互，最终保留可审计证据轨迹。",
    why:
      "这与你的多帧威胁检测高度相关：随机三帧既可能错过短时威胁，也可能输入大量近重复帧。SIEVE提示应把‘选哪一帧/哪个区域’作为可学习决策，而不是固定预处理。",
    inspiration:
      "可以让第一阶段根据目标出现、运动变化、YOLO不确定性和跨帧新颖性构造 evidence package，第二阶段 Qwen3 只对证据包做完整检测与态势判断，并显式检查每个结论对应哪一帧证据。",
    experiment:
      "固定 Qwen3 与总视觉 token 预算，比较随机3帧、均匀采样、AVOC式检索、SIEVE式 agent；报告目标召回、短时威胁召回、冗余率、视觉 token 数、推理时延、反事实删帧一致性和证据引用正确率。",
    paper: "https://arxiv.org/abs/2607.18080",
    featured: false,
  },
  {
    id: "internvla-a1",
    index: "22",
    title: "InternVLA-A1: Unifying Understanding, Generation and Action",
    shortTitle: "InternVLA-A1",
    date: "2026-01-05 · v2 2026-02-13",
    category: "世界模型",
    paradigm: "MoT UMM + Parallel Foresight + Action Flow",
    state: "Qwen3-VL 语义 token + COSMOS VAE 连续 latent",
    objective: "未来 latent 回归 + action velocity Flow Matching",
    decoding: "未来帧单次并行预测；动作经少步 ODE 生成",
    sharing: "理解/预见/动作三专家共享 masked self-attention 与上下文 KV",
    action: "连续 robot state 与 action chunk；Action Expert 用 Flow Matching",
    rollout: "支持闭环策略执行；核心 foresight 是单个未来时刻，不是长视频多步模拟器",
    evaluation: "动态/静态操控、RoboTwin 2.0、13 Hz；需额外审计 rollout 误差和物理一致性",
    open: "项目页、训练/评测代码、模型与数据均已公开",
    priority: "精读",
    summary:
      "以 Qwen3-VL/InternVL3 为理解专家，COSMOS VAE latent 为生成状态，并增加 Flow Matching 动作专家；三者通过有向的统一 masked self-attention 形成‘理解→视觉预见→动作’链路。生成专家不用 AR 或扩散迭代，而是一次并行回归未来 latent。",
    why:
      "这是今天与你最贴近的一篇：它直接建立在 Qwen3-VL 上，并把 UMM 从静态理解—生成扩展到未来预测—行动。更重要的是，它没有要求视觉语义 token 与重建 latent 完全同构，而是采用共享上下文、分工专家的 MoT 路线，正好可作为 URSA 全共享设计的反例。",
    inspiration:
      "你的 Qwen3+IBQ 可以先不引入真实机器人 action：把‘动作’替换成多帧威胁场景中的状态变化或决策 token，让一个轻量 foresight expert 预测下一关键帧 IBQ latent，再检查其是否改善短时目标持续性和态势判断。这样能测试世界建模监督是否比单帧语义蒸馏更能稳定视觉表示。",
    experiment:
      "固定 Qwen3、IBQ tokenizer 与理解数据，比较 A: 纯 MLLM，B: 加 next-IBQ-token/latent 预测，C: 加 next-latent + 决策 Flow head。统一报告 OCR/DocVQA、跨帧目标召回、future-token accuracy、长时误差累积、峰值显存和端到端延迟；再比较三专家 MoT 与完全共享 Transformer。",
    paper: "https://arxiv.org/abs/2601.02456",
    code: "https://github.com/InternRobotics/InternVLA-A-series",
    codeLabel: "代码",
    featured: false,
  },
  {
    id: "dworldeval",
    index: "23",
    title: "dWorldEval: Discrete Diffusion World Model for Policy Evaluation",
    shortTitle: "dWorldEval",
    date: "2026-04-24",
    category: "世界模型",
    paradigm: "Unified-token Masked Discrete Diffusion",
    state: "MAGVIT-v2 视觉 token + LLaDA 文本 token + FAST action token",
    objective: "masked clean-token reconstruction + progress-token prediction",
    decoding: "目标后缀迭代并行去掩码；稀疏关键帧记忆锚定长时一致性",
    sharing: "视觉、语言、动作与进度进入统一序列，由单一 self-attention denoiser 建模",
    action: "FAST 离散 action chunk 作为一等 token，而不是弱 cross-attention 条件",
    rollout: "支持策略与世界模型闭环 imagined rollout，并联合生成未来观察与任务进度",
    evaluation: "强调 action controllability、时空一致性及虚拟/真实成功率相关性，而非只看 FVD",
    open: "论文与项目页公开；当前未见完整官方训练代码",
    priority: "精读",
    summary:
      "把图像、语言、动作和任务进度全部离散化为统一 token 序列，使用 Masked Discrete Diffusion 同时生成未来视觉状态与进度 token；稀疏关键帧记忆用于抑制长时 rollout 漂移。",
    why:
      "它是世界模型方向中最适合和 URSA 做控制变量比较的一篇：两者都预测 clean token、都可并行 refinement，但 dWorldEval 使用 mask corruption，URSA 使用基于 code 距离的 metric path。它还把 action 直接作为 token，为‘统一理解—生成—预测—行动’提供了最简单的离散接口。",
    inspiration:
      "对你的多帧威胁检测，可以先把 action token 替换为可控干预：删帧、目标移动、类别替换、相机变化或候选框选择。模型不仅预测下一帧 image token，还预测‘威胁进度/态势 token’，从而检验输出是否真正受干预驱动，而不是被强视觉先验覆盖。",
    experiment:
      "固定 Qwen3+IBQ，构造同一未来预测任务，比较 block mask、URSA metric path 与 AR next-token；增加 action-shuffling 测试、未来帧 token accuracy、目标轨迹一致性、horizon-error 曲线和进度判断校准。若打乱 action 后预测几乎不变，说明模型仍未学到因果动力学。",
    paper: "https://arxiv.org/abs/2604.22152",
    code: "https://dworldeval.github.io/",
    codeLabel: "项目页",
    featured: false,
  },
  {
    id: "qwen-robotworld",
    index: "24",
    title: "Qwen-RobotWorld: Language-Conditioned Video World Modeling",
    shortTitle: "Qwen-RobotWorld",
    date: "2026-06-15 · v3 2026-06-17",
    category: "世界模型",
    paradigm: "Semantic–Video Latent Double-stream Diffusion",
    state: "冻结 Qwen2.5-VL 语义流 + Video-VAE 时空 latent 流",
    objective: "条件视频 diffusion；报告未将目标归约为离散 token CE",
    decoding: "MMDiT 迭代生成未来视频 latent，再由 Video-VAE 解码",
    sharing: "语义与生成双流逐层联合注意，但不共享 tokenizer、vocabulary 或输出 head",
    action: "自然语言作为跨机器人、驾驶和导航任务的统一 action interface",
    rollout: "生成未来视觉轨迹，可用于数据合成、策略评测和语言引导规划；未直接输出低层控制",
    evaluation: "EWMBench、DreamGen Bench、WorldModelBench、PBench 与多视角一致性",
    open: "技术报告公开；截至核对时未发现完整官方代码与模型权重入口",
    priority: "精读",
    summary:
      "用 60 层双流 MMDiT 将冻结的 Qwen2.5-VL 语义与 Video-VAE latent 逐层耦合，并以自然语言统一描述不同 embodiment 的动作，预测机器人操控、驾驶、导航等领域的未来视觉轨迹。",
    why:
      "它代表和 URSA/ELF 完全不同的统一策略：统一的是语义接口和联合注意，而不是视觉 tokenizer 或 vocabulary。它能帮助你避免把‘所有东西放进同一 token 序列’当作唯一的 UMM 路线，并建立语义—重建双空间的强世界模型基线。",
    inspiration:
      "对于 IBQ 语义不足的问题，可以保留 Qwen3 语义流，同时让 IBQ/VAE latent 作为动力学生成流；两条流逐层交互，而不是强迫一个 code embedding 同时承担 OCR 语义、像素重建和时序动力学。这与 SPAR 的 semantic/pixel 分工可组合成时序版本。",
    experiment:
      "固定 Qwen3 语义主干和视频/IBQ decoder，比较 A: 单流共享 token，B: 语义—latent 双流 cross-attention，C: MoT 三专家。控制总参数与 FLOPs，测静态 OCR/VQA、未来帧一致性、action sensitivity、2/4/8 帧 rollout 错误和推理延迟。",
    paper: "https://arxiv.org/abs/2606.17030",
    featured: false,
  },
  {
    id: "being-h07",
    index: "25",
    title: "Being-H0.7: A Latent World-Action Model from Egocentric Videos",
    shortTitle: "Being-H0.7",
    date: "2026-04-30",
    category: "世界模型",
    paradigm: "Future-informed Latent World-Action Model",
    state: "V-JEPA2.1 未来语义 embedding + learnable latent query",
    objective: "prior/posterior hidden alignment + anti-collapse + action Flow Matching",
    decoding: "部署时移除 posterior，不生成未来像素；直接生成 action chunk",
    sharing: "MoT 中共享当前上下文与主干；未来信息仅作为训练期 privileged target",
    action: "Qwen3 Action Expert 在 latent reasoning state 条件下预测连续动作 velocity",
    rollout: "推理时无视觉 rollout；以未来对齐获得预测性，主打低延迟闭环控制",
    evaluation: "六类仿真 benchmark、12 个真实任务、动态/物理/长时能力与 3–4 ms/step",
    open: "论文与官方项目页公开；截至核对时未见完整代码仓库",
    priority: "精读",
    summary:
      "不重建未来帧，而是在理解与动作之间插入少量 latent queries。训练期 posterior 使用未来观察的 V-JEPA embedding，prior 只看当前上下文；二者隐藏状态对齐后，部署时删除 posterior，以低成本保留未来感知。",
    why:
      "它提供了检验‘世界模型是否必须生成像素/视频’的关键反例。对 UMM 来说，预测性语义可能比高保真重建更重要；这与当前 VAE→语义空间问题直接相连，也揭示了未来对齐 latent 容易出现范数收缩和有效秩坍塌。",
    inspiration:
      "可以把未来帧的 DINO/SigLIP/Qwen3-VL 特征作为 teacher，只在训练期对齐当前 IBQ token 形成的 latent queries；推理时不增加视频解码成本。其 norm preservation 和 spectral diversity 正好可用于你近期关注的 vision embedding 尺度与有效秩问题。",
    experiment:
      "比较 raw IBQ、当前帧语义蒸馏、future-latent alignment 和显式 next-frame reconstruction；统一测多帧威胁判断、目标运动方向、反事实删帧、latent effective rank、推理时延。若 future alignment 提升控制/推理但重建不变，说明收益来自预测性语义而非像素保真。",
    paper: "https://arxiv.org/abs/2605.00078",
    code: "https://research.beingbeyond.com/being-h07",
    codeLabel: "项目页",
    featured: false,
  },
  {
    id: "world-model-roadmap",
    index: "26",
    title: "A Definition and Roadmap for World Models",
    shortTitle: "World Model Roadmap",
    date: "2026-07-07 · 近期观点文",
    category: "世界模型",
    paradigm: "World-model Definition & Taxonomy",
    state: "像素、latent、3D/object-centric 与 omnimodal 表示的统一分类",
    objective: "定义 renderer / simulator / planner 的功能边界与发展阶段",
    decoding: "不提出单一 decoder；比较观察级生成、latent dynamics 与规划",
    sharing: "提出统一物理表征应同时支持 rendering、simulation 与 planning",
    action: "强调 action/state 是把被动视频预测变成可控世界模型的必要变量",
    rollout: "路线图终点是可复用、闭环、可交互的 foundation-scale simulator",
    evaluation: "要求从视觉逼真扩展到可控性、因果性、闭环成功率和计算/环境成本",
    open: "论文公开；观点/路线图材料，无配套训练代码",
    priority: "泛读",
    summary:
      "给出世界模型的功能与架构二维分类，并提出三阶段路线：统一多模态输入、蒸馏统一物理表示、扩展为可交互基础模拟器。它明确区分看起来真实的 renderer、能响应干预的 simulator 与能支持决策的 planner。",
    why:
      "你刚开始把世界模型纳入论文雷达，最需要先确定评价边界：会生成未来视频并不自动等于学会因果动力学。该文能为网站后续的世界模型矩阵提供稳定分类，避免只按照模型名字或 FVD 排序。",
    inspiration:
      "对你的 UMM，可以把统一程度拆成四层：共享感知表示、共享生成状态、共享动力学、共享行动/价值接口。这样能更准确地定位 URSA、ELF、Qwen-RobotWorld 和 InternVLA-A1 分别统一了什么、没有统一什么。",
    experiment:
      "为所有候选世界模型统一增加三组测试：action-shuffling 因果敏感性、rollout horizon 误差曲线、闭环任务成功率；再将其与静态理解、T2I 和 OCR 指标分开，防止 tokenizer 或画质提升掩盖动力学缺陷。",
    paper: "https://arxiv.org/abs/2607.06401",
    featured: false,
  },
  {
    id: "multi-mask-dlm",
    index: "27",
    title: "Multi-Mask Diffusion Language Models for Few-Step Generation",
    shortTitle: "Multi-Mask DLM",
    date: "2026-07-22 · COLM 2026",
    category: "离散 Diffusion",
    paradigm: "Multi-state Masked Discrete Diffusion",
    state: "离散 token ID + 多个专用 mask state",
    objective: "clean-token posterior / CE + mask-state identification + consistency distillation",
    decoding: "并行迭代恢复；蒸馏后支持 4/8/16 步",
    sharing: "保留原 clean-token head；可从预训练 masked DLM 低成本适配",
    open: "论文公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "把单一 [MASK] 扩展为多个具有分工的噪声状态：每个 clean token 先映射到指定 mask，随后 mask 间继续混合。该设计提高了中间状态的信息容量，并通过共享 Gumbel 耦合的离散 consistency distillation 压缩到少步生成。",
    why:
      "它正好补上单 mask diffusion 与 URSA metric path 之间的空白：两者都预测 clean-token logits，但前者仍使用显式噪声符号，URSA则在完整词表上按 token 距离连续迁移。把它加入对照，能判断 URSA 的收益来自 metric-aware path，还是只来自更丰富的中间噪声状态。",
    inspiration:
      "对 IBQ 可把 codebook 按像素距离、DINO/SigLIP 语义或 OCR/布局属性聚类，每一簇对应一个 mask state。若 metric-cluster multi-mask 接近 URSA，说明无需在全词表上构造复杂 transition；若仍落后，metric path 的细粒度几何确实重要。",
    experiment:
      "固定 Qwen3、IBQ、clean-token head、数据和总 FLOPs，比较单 [MASK]、随机 multi-mask、IBQ metric-cluster multi-mask、semantic-cluster multi-mask 与 URSA metric path；统一报告 OCRBench、DocVQA、TextVQA、T2I、4/8/16/32 步质量、训练稳定性和峰值显存。",
    paper: "https://arxiv.org/abs/2607.19686",
    featured: false,
  },
  {
    id: "self-gradient-forcing",
    index: "28",
    title: "Self Gradient Forcing: Native Long Video Extrapolation",
    shortTitle: "Self Gradient Forcing",
    date: "2026-07-22",
    category: "世界模型",
    paradigm: "Autoregressive Video Diffusion + Two-pass Gradient Recovery",
    state: "连续 Video-VAE latent + causal KV memory",
    objective: "未来 video latent denoising；恢复 future-to-history context gradient",
    decoding: "分块 AR rollout；每个视频块内部 diffusion 去噪",
    sharing: "共享 causal DiT 与滚动 KV；不共享 UMM 的视觉 tokenizer / vocabulary",
    action: "当前工作无显式控制 action；以文本与自生成历史作为条件",
    rollout: "5 秒训练窗口可外推到分钟级；仍是开放环视频 rollout",
    evaluation: "长时主体、布局和运动一致性；还需补充动作因果与闭环任务成功率",
    open: "论文、项目页与仓库已公开；代码/模型资产标注为即将发布",
    priority: "精读",
    summary:
      "指出 Self Forcing 在使用自生成历史时会把历史 KV cache stop-gradient，导致未来损失无法监督模型如何把早期状态写入记忆。SGF 用无梯度真实 rollout 加一次并行重算，在不做完整 BPTT 的情况下恢复有界的历史上下文梯度。",
    why:
      "这不是单纯改善视频画质，而是在回答长时世界模型的核心训练问题：错误为什么随 rollout horizon 累积。你的多帧威胁检测同样依赖早期帧如何写入时序记忆；若这些状态只被当作不可训练缓存，后续目标持续性损失无法纠正早期记忆。",
    inspiration:
      "可以把 SGF 的两遍训练移植到 Qwen3+IBQ：第一遍用模型生成未来 IBQ token 和时序 cache，第二遍并行重算选定历史片段，让后续目标类别、坐标与态势损失反向约束早期 memory writing，而无需对完整长序列做 BPTT。",
    experiment:
      "固定 Qwen3、IBQ、序列长度和训练预算，比较 teacher forcing、self-rollout + stop-grad cache、截断 BPTT 与 SGF two-pass；报告 2/4/8/16 帧目标身份漂移、坐标误差、短时威胁召回、cache 梯度范数、吞吐和显存。",
    paper: "https://arxiv.org/abs/2607.20368",
    code: "https://github.com/zhuang2002/Self_Gradient_Forcing",
    featured: false,
  },
  {
    id: "perceptdrive",
    index: "29",
    title: "PerceptDrive: Perception Prior World-Action Modeling",
    shortTitle: "PerceptDrive",
    date: "2026-07-22",
    category: "世界模型",
    paradigm: "Routed Multi-expert Latent World Model + Rectified-flow Actor",
    state: "VLM 高层先验 + 自监督视频 encoder 稠密 latent",
    objective: "action-free / action-conditioned next-latent L2 + action velocity Flow Matching",
    decoding: "预测未来四个 latent；动作以 25 步 Euler ODE 积分",
    sharing: "共享场景上下文，但感知专家、世界模型与动作 head 分工",
    action: "连续 ego trajectory；scene-conditioned soft router 自适应组合专家",
    rollout: "短期 latent foresight 条件化闭环驾驶策略；非长视频像素模拟器",
    evaluation: "NAVSIM 闭环规划指标；仍应审计 route 可解释性和 horizon drift",
    open: "论文公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "冻结 VLM 的几何/语义/动态先验与视频 encoder 的稠密观测 latent，通过可学习 queries 保留不同专家信息，再由场景条件路由器融合；世界模型预测短期未来 latent，Rectified Flow actor 生成连续轨迹。",
    why:
      "它给 UMM 一个重要反例：理解、像素细节、时序动力学和动作不一定应该被压进同一 embedding。对 Qwen3+IBQ 而言，性能瓶颈可能来自强行让一个 code space 同时承担 OCR、重建和未来预测，而不是生成范式本身。",
    inspiration:
      "可把 IBQ 重建流、DINO/SigLIP 语义流、OCR/layout 流和多帧 motion 流视为四个专家，由场景路由器决定威胁判断依赖哪些信息。路由权重还可作为跨模态归因，检查模型是否真正使用了文字、运动或目标外观证据。",
    experiment:
      "固定 Qwen3、总参数量、视觉 token 数和训练数据，比较简单相加、静态加权、cross-attention 双流与 scene-conditioned router；分别测试 OCR/DocVQA、T2I、未来 latent 误差、目标轨迹、反事实动作敏感性和专家路由稳定性。",
    paper: "https://arxiv.org/abs/2607.20175",
    featured: false,
  },
  {
    id: "kinebench",
    index: "30",
    title: "KineBench: Embodied World Models via IDM-Free Kinematic Grounding",
    shortTitle: "KineBench",
    date: "2026-07-22 · ECCV 2026",
    category: "世界模型",
    paradigm: "World-model Evaluation via Simulator Grounding",
    state: "模型生成 RGB 视频，经视觉基础模型恢复 6D 末端位姿",
    objective: "不训练统一生成器；评估运动学可执行性、平滑性与可操作度",
    decoding: "生成视频 → 位姿提取 → ManiSkill3 物理执行",
    sharing: "评价协议独立于 tokenizer、生成器和动作 head",
    action: "从视频恢复 6D end-effector pose，不依赖学习型 inverse dynamics model",
    rollout: "把开放环视频转成模拟器执行，直接观察任务是否可完成",
    evaluation: "Execution Success、SPARC Smoothness、Manipulability；覆盖基础、迁移、视觉 OOD 和复杂度扩展",
    open: "论文、代码与数据集均已公开",
    priority: "泛读",
    summary:
      "不再只以 FVD/LPIPS 判断具身世界模型，而是用级联视觉基础模型从生成视频恢复末端执行器轨迹，并在物理模拟器中真实执行，从而避免学习型 IDM 把额外误差混入评价。",
    why:
      "世界模型看起来逼真，不代表它产生的运动可执行。KineBench给你的雷达补上了‘生成结果如何落到任务成功’这一层，也能防止将视觉 tokenizer 变好误判为动力学或规划能力变强。",
    inspiration:
      "多帧威胁研究可做对应的 detector-free/grounding audit：把预测视频或未来 token 解码后送入固定目标检测、几何跟踪与态势规则，再测目标轨迹、威胁排序和决策是否可执行；同时单独报告提取器误差，避免评价器掩盖模型缺陷。",
    experiment:
      "对 AR、URSA 和 ELF 世界模型使用同一解码器及固定轨迹提取器；除 FVD/LPIPS 外，比较目标持续性、轨迹平滑度、碰撞/越界率、闭环任务成功和 horizon error，并用真实 action/轨迹作为上限控制组。",
    paper: "https://arxiv.org/abs/2607.19876",
    code: "https://github.com/minecraft-zzz/KineBench",
    featured: false,
  },
  {
    id: "recap-activation-explanations",
    index: "31",
    title: "Train the Model, Not the Reader: Verifiable Activation Explanations",
    shortTitle: "RECAP",
    date: "2026-07-22",
    category: "可解释性",
    paradigm: "Decodability-supervised Activation Explanation",
    state: "LLM activation → natural-language explanation + independently decodable claims",
    objective: "activation reconstruction + designated claim probes / RECAP",
    decoding: "不改变基础模型生成；审计解释文本中的具体声明",
    sharing: "可附加在 SAE、verbalizer 或跨模态 attribution 系统之后",
    open: "论文公开；截至核对时未见官方代码仓库",
    priority: "泛读",
    summary:
      "发现仅用 activation reconstruction 评价自然语言解释，会允许系统靠语义 gist 或私有编码通过测试，而具体声明并不由 activation 支持。RECAP增加独立线性探针，使指定内容必须能从同一 activation 中被解码。",
    why:
      "这会直接改变你如何验证 URSA/JSAE/SAE 的 feature label：解释文本看起来合理、甚至能重建激活，都不等于其中的‘物体、位置、帧号或 OCR 字符’真的被该 feature 编码，更不等于它具有因果作用。",
    inspiration:
      "把视觉 feature 的可验证声明限定为对象类别、OCR 字符串、frame index、坐标和去噪阶段；要求独立 probe 能读出这些属性，再做 suppression/injection。这样可把‘语义可读’、‘可解码’与‘因果有效’三个层次分开。",
    experiment:
      "对同一 URSA hidden state/SAE feature 比较自动标签、minimal-pair claim flip、独立 probe、evaluator swap 与因果干预；只把同时通过 grounded、decodable、causal 三道门槛的 feature 计入 UMM 共享语义比例。",
    paper: "https://arxiv.org/abs/2607.20379",
    featured: false,
  },
  {
    id: "transfusion",
    index: "32",
    title: "Transfusion: Predict the Next Token and Diffuse Images with One Multi-Modal Model",
    shortTitle: "Transfusion",
    date: "2024-08-20 · 基础补读",
    category: "统一多模态",
    paradigm: "Hybrid AR + Continuous Diffusion",
    state: "离散文本 token + 连续图像 patch / VAE latent",
    objective: "文本 next-token CE + 图像 diffusion denoising loss",
    decoding: "文本顺序生成；图像块在同一上下文中并行去噪",
    sharing: "共享单一 Transformer 与混合序列上下文；模态编码器和输出目标分离",
    open: "论文与官方代码已公开",
    priority: "精读",
    summary:
      "在一个 Transformer 内同时训练文本 next-token prediction 与图像 diffusion：文本保持离散 AR，图像保持连续表示和并行去噪，不强迫两种模态共用同一种状态空间或输出 head。",
    why:
      "它是 URSA 与 ELF 之外最有价值的混合对照。URSA追求视觉 token 与语言接口尽量统一，ELF把生成整体搬到连续流；Transfusion则只共享主干与上下文，把每种模态留在更自然的损失空间。它能检验“完全统一”是否真的优于“共享 Transformer、保留模态特化 head”。",
    inspiration:
      "对 Qwen3 + IBQ，可保留文本 AR 与理解路径，同时把图像生成分支换成连续 VAE/IBQ embedding diffusion；再与共享词表 CE 的 URSA比较。若混合模型生成更好但理解不退化，说明共享主干可能比共享 vocabulary/output head 更重要。",
    experiment:
      "固定 Qwen3 主干、数据、视觉 token 数和训练 FLOPs，比较：共享词表 URSA、ELF 连续 flow、Transfusion 式双目标。分别冻结/解冻视觉 decoder，并记录 OCRBench、TextVQA、T2I、梯度冲突、峰值显存和跨模态 attention 利用率。",
    paper: "https://arxiv.org/abs/2408.11039",
    code: "https://github.com/facebookresearch/transfusion",
    featured: true,
    idea: true,
  },
  {
    id: "mar",
    index: "33",
    title: "Autoregressive Image Generation without Vector Quantization",
    shortTitle: "MAR",
    date: "2024-06-17 · 基础补读",
    category: "自回归建模",
    paradigm: "Continuous-token AR / Masked AR + Diffusion Loss",
    state: "连续图像 token embedding",
    objective: "每个 token 的条件 diffusion loss",
    decoding: "顺序 AR 或 masked AR；每个位置内部进行连续去噪",
    sharing: "序列级 Transformer 可共享；离散 LM head 被 diffusion head 取代",
    open: "论文、训练代码与模型已公开",
    priority: "精读",
    summary:
      "Kaiming He 团队证明 AR 的关键是因果/序列依赖，而不是必须预测离散类别：MAR直接对连续图像 token 建模，并用每个位置上的 diffusion loss 表达多峰条件分布，同时支持标准 AR 与随机顺序 masked AR。",
    why:
      "MAR把“生成顺序”和“状态空间/损失”拆开，是设计公平对照时非常关键的思想。它能避免把 AR 等同于离散 CE，也避免把连续生成等同于全局 Flow Matching，为 URSA→ELF 提供一个中间点。",
    inspiration:
      "你可以保留 URSA/IBQ 的 token 序列与 Qwen3 主干，只把分类 head 替换为连续 code-embedding diffusion head；这样能单独测试提升来自连续目标，还是来自 ELF 的全局同步 flow。MAR也提示 masked order 本身可以独立于 token 表示进行消融。",
    experiment:
      "同一 IBQ encoder/decoder 下比较：token-ID AR+CE、continuous MAR diffusion loss、URSA metric-path CE、ELF global velocity。统一采样预算后，额外测 codebook 最近邻回投错误、OCR 字符稳定性与不同位置的累计误差。",
    paper: "https://arxiv.org/abs/2406.11838",
    code: "https://github.com/LTH14/mar",
    featured: true,
    idea: true,
  },
  {
    id: "magvit-v2",
    index: "34",
    title: "Language Model Beats Diffusion — Tokenizer is Key to Visual Generation",
    shortTitle: "MAGVIT-v2",
    date: "2023-10-09 · 经典基础",
    category: "统一视觉 Token",
    paradigm: "LFQ Unified Image / Video Tokenizer",
    state: "共享的离散图像与视频 token ID",
    objective: "高压缩视觉重建 + 下游 next-token modeling",
    decoding: "由下游 causal LM 顺序生成，再经统一 decoder 重建",
    sharing: "图像与视频共享视觉 vocabulary/tokenizer；是否共享语言词表由下游决定",
    open: "论文公开；官方实现可通过 VideoPoet/MAGVIT 系列资源参考",
    priority: "精读",
    summary:
      "MAGVIT-v2用 Lookup-Free Quantization 构建统一、紧凑且高容量的图像/视频 vocabulary，显示强 tokenizer 足以显著抬高语言模型式视觉生成的上限，并把图像和视频放进同一离散接口。",
    why:
      "这篇经典工作提醒你：比较 URSA、ELF、AR 或 masked diffusion 前，必须先锁定 tokenizer。否则生成质量、OCR 与长视频一致性的差异很可能来自量化器容量、压缩率和重建上限，而不是建模方式。",
    inspiration:
      "IBQ 审计不应只看 rFID。要同时测文字、细粒度目标、跨帧 code consistency、codebook usage 与语义 linear probe；还应增加“同一生成模型、更换 tokenizer”和“同一 tokenizer、更换建模方式”两条正交实验线。",
    experiment:
      "建立 tokenizer × model 二维表：IBQ、LFQ/MAGVIT-v2-style、语义对齐 IBQ 分别搭配 AR、URSA 和 ELF。先报告 encode-decode 上限，再报告端到端性能，并用相同 token 数、分辨率与训练预算归因增益。",
    paper: "https://arxiv.org/abs/2310.05737",
    featured: true,
    idea: true,
  },
];

const shortcuts = ["今日精选", "精读清单", "借鉴优先"];
const directions = [
  "建模方式",
  "UMM 与视觉表征",
  "世界模型与行动",
  "可解释性与可靠推理",
  "评测与实验诊断",
];
const categoryGroups: Record<string, string[]> = {
  "建模方式": ["连续 Flow", "离散 Diffusion", "自回归建模"],
  "UMM 与视觉表征": ["统一多模态", "统一视觉 Token", "语义对齐"],
  "世界模型与行动": ["世界模型"],
  "可解释性与可靠推理": ["可解释性", "多帧推理"],
  "评测与实验诊断": ["评测诊断"],
};
const categoryIcons: Record<string, string> = {
  "今日精选": "★",
  "精读清单": "◆",
  "借鉴优先": "↗",
  "建模方式": "≋",
  "UMM 与视觉表征": "◇",
  "世界模型与行动": "◉",
  "可解释性与可靠推理": "⌁",
  "评测与实验诊断": "✓",
};

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  const [active, setActive] = useState("今日精选");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    const value = window.localStorage.getItem("umm-reading-list");
    if (!value) return;
    const timer = window.setTimeout(() => {
      try {
        setSaved(JSON.parse(value));
      } catch {
        window.localStorage.removeItem("umm-reading-list");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleSaved = (id: string) => {
    setSaved((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem("umm-reading-list", JSON.stringify(next));
      return next;
    });
  };

  const selectDeepReads = (paperId?: string) => {
    setActive("精读清单");
    if (paperId) {
      setExpanded((current) => current.includes(paperId) ? current : [...current, paperId]);
    }
    window.requestAnimationFrame(() => {
      const target = paperId ? document.querySelector(`#paper-${paperId}`) : document.querySelector("#papers");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const toggleExpanded = (id: string) => {
    setExpanded((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  };

  const visiblePapers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return papers.filter((paper) => {
      const categoryMatch =
        (active === "今日精选" && paper.featured) ||
        (active === "精读清单" && paper.priority === "精读") ||
        (active === "借鉴优先" && paper.idea) ||
        (categoryGroups[active]?.includes(paper.category) ?? false);
      const queryMatch = !q || [paper.title, paper.paradigm, paper.summary, paper.category]
        .join(" ")
        .toLowerCase()
        .includes(q);
      return categoryMatch && queryMatch;
    });
  }, [active, query]);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="返回顶部">
          <span className="brand-mark">UMM</span>
          <span>UMM 论文雷达</span>
        </a>
        <nav className="topnav" aria-label="主导航">
          <a className="active" href="#papers">建模范式</a>
          <a href="#world-matrix">世界模型</a>
          <a href="#papers">可解释性</a>
          <a href="#matrix">实验矩阵</a>
        </nav>
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索论文、作者或范式"
            aria-label="搜索论文"
          />
        </label>
        <div className="update-status"><span />每日更新</div>
      </header>

      <div className="issue-strip" id="top">
        <span>▣</span>
        <strong>DAILY BRIEF · 2026.07.24</strong>
        <i />
        <span>统一多模态建模研究知识库</span>
      </div>

      <div className="workspace">
        <aside className="sidebar">
          <h2>研究目录</h2>
          <div className="side-nav">
            <div className="nav-group">
              <h3>快捷入口</h3>
              {shortcuts.map((category) => (
                <button
                  className={active === category ? "selected" : ""}
                  key={category}
                  onClick={() => setActive(category)}
                >
                  <span>{categoryIcons[category]}</span>{category}
                </button>
              ))}
            </div>
            <div className="nav-group">
              <h3>五个研究方向</h3>
              {directions.map((category) => (
                <button
                  className={active === category ? "selected" : ""}
                  key={category}
                  onClick={() => setActive(category)}
                >
                  <span>{categoryIcons[category]}</span>{category}
                </button>
              ))}
            </div>
          </div>
          <div className="side-filter">
            <h3>当前筛选</h3>
            <div className="filter-row"><span>年份</span><strong>2025–2026</strong></div>
            <div className="filter-row"><span>开源优先</span><strong>是</strong></div>
            <div className="filter-row"><span>阅读清单</span><strong>{saved.length} 篇</strong></div>
          </div>
          <p className="side-note">所有推荐都要回答：为什么值得读，以及能为你的 URSA / ELF / IBQ 实验带来什么。</p>
        </aside>

        <div className="content">
          <section className="hero">
            <div>
              <p className="eyebrow">[UMM RADAR · ISSUE 010]</p>
              <h1>研究问题归方向，<br />Flow / AR / Diffusion 归建模方式</h1>
              <p className="hero-copy">目录压缩为五个上层研究方向，同时保留每篇论文的精细建模标签。新增精读与借鉴入口，让你可以从研究问题出发，再横向比较连续 Flow、离散 Diffusion、AR 与混合路线。</p>
              <div className="hero-actions">
                <a className="primary-button" href="#papers">查看今日精选</a>
                <button className="text-button" onClick={() => selectDeepReads()}>打开精读清单 <span>→</span></button>
              </div>
              <div className="taxonomy-note">
                <b>新的分类逻辑</b>
                <span>方向回答“研究什么”</span>
                <i>→</i>
                <span>标签回答“如何建模”</span>
              </div>
              <div className="stats">
                <div><b>34</b><span>精选论文</span></div>
                <div><b>05</b><span>研究方向</span></div>
                <div><b>02</b><span>比较矩阵</span></div>
              </div>
            </div>
            <div className="hero-index" aria-label="建模坐标索引">
              <p>MODELING COORDINATES</p>
              <div className="coordinate-map">
                <span className="axis-label top">连续状态</span>
                <span className="axis-label bottom">离散状态</span>
                <span className="axis-label left">并行修正</span>
                <span className="axis-label right">顺序生成</span>
                <i className="dot elf">ELF</i>
                <i className="dot ursa">URSA</i>
                <i className="dot xomni">X-Omni</i>
                <i className="dot toklip">TokLIP</i>
              </div>
              <p className="map-caption">先区分“在哪里建模”，再比较“如何学习与解码”。</p>
            </div>
          </section>

          <section className="papers-section" id="papers">
            <div className="section-heading">
              <div><p className="eyebrow">TODAY&apos;S SELECTION</p><h2>{active}</h2></div>
              <p>{visiblePapers.length} 篇匹配 · 按研究相关性排序</p>
            </div>
            <div className="paper-list">
              {visiblePapers.map((paper) => (
                <article className="paper-card" id={`paper-${paper.id}`} key={paper.id}>
                  <div className="paper-number">[{paper.index}]</div>
                  <div className="paper-main">
                    <div className="paper-title-row">
                      <div>
                        <h3>{paper.title}</h3>
                        <div className="tags"><span>{paper.paradigm}</span><span>{paper.category}</span><span>{paper.date}</span></div>
                      </div>
                      <button
                        className={`priority ${paper.priority === "精读" ? "high" : ""}`}
                        onClick={paper.priority === "精读" ? () => selectDeepReads(paper.id) : undefined}
                        title={paper.priority === "精读" ? "展开论文完整推荐" : "建议泛读"}
                      >
                        {paper.priority}
                      </button>
                    </div>
                    <p className="summary">{paper.summary}</p>
                    <button
                      className="mobile-read-toggle"
                      onClick={() => toggleExpanded(paper.id)}
                      aria-expanded={expanded.includes(paper.id)}
                    >
                      {expanded.includes(paper.id) ? "收起完整推荐" : "查看完整推荐"}
                      <span>{expanded.includes(paper.id) ? "↑" : "↓"}</span>
                    </button>
                    <div className={`paper-details ${expanded.includes(paper.id) ? "expanded" : ""}`}>
                      <div className="reason-grid">
                        <section><h4>为什么推荐</h4><p>{paper.why}</p></section>
                        <section><h4>可能给你的启发</h4><p>{paper.inspiration}</p></section>
                      </div>
                      <div className="experiment-note"><strong>建议实验</strong><p>{paper.experiment}</p></div>
                      <div className="paper-specs">
                        <span><b>建模状态</b>{paper.state}</span>
                        <span><b>训练目标</b>{paper.objective}</span>
                        <span><b>解码方式</b>{paper.decoding}</span>
                        <span><b>共享结构</b>{paper.sharing}</span>
                      </div>
                      {paper.action && (
                        <div className="world-specs">
                          <span><b>动作接口</b>{paper.action}</span>
                          <span><b>Rollout / 闭环</b>{paper.rollout}</span>
                          <span><b>世界模型评价</b>{paper.evaluation}</span>
                        </div>
                      )}
                    </div>
                    <div className="paper-footer">
                      <span className="open-status"><i />{paper.open}</span>
                      <div>
                        <button onClick={() => toggleSaved(paper.id)}>{saved.includes(paper.id) ? "已加入清单" : "加入阅读清单"}</button>
                        <a href={paper.paper} target="_blank" rel="noreferrer">论文 <ArrowIcon /></a>
                        {paper.code && <a href={paper.code} target="_blank" rel="noreferrer">{paper.codeLabel ?? "代码"} <ArrowIcon /></a>}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              {visiblePapers.length === 0 && <div className="empty-state">没有找到匹配论文，请尝试其他关键词或范式。</div>}
            </div>
          </section>

          <section className="matrix-section" id="matrix">
            <div className="section-heading">
              <div><p className="eyebrow">CONTROLLED COMPARISON</p><h2>UMM 建模方式实验矩阵</h2></div>
              <p>固定主干、tokenizer、数据与预算，只改变生成机制</p>
            </div>
            <p className="scroll-hint">移动端可横向滑动查看完整矩阵 →</p>
            <div className="matrix-wrap">
              <table>
                <thead><tr><th>路线</th><th>状态空间</th><th>预测目标</th><th>生成顺序</th><th>最关键变量</th></tr></thead>
                <tbody>
                  <tr><th>X-Omni</th><td>离散 token ID</td><td>Next-token CE</td><td>左到右</td><td>累计误差、KV Cache、RL</td></tr>
                  <tr><th>URSA</th><td>离散 token ID</td><td>Clean-token CE</td><td>并行迭代</td><td>Metric path、schedule、solver</td></tr>
                  <tr><th>ELF</th><td>连续 embedding</td><td>Velocity / L2 + CE</td><td>ODE / SDE</td><td>空间几何、回投误差、CFG</td></tr>
                  <tr><th>Flow Map LM</th><td>Simplex / one-hot</td><td>Posterior CE + distill</td><td>联合运输 / 一步</td><td>token 相关性、少步蒸馏</td></tr>
                  <tr><th>UniAR</th><td>BSQ 离散视觉 token</td><td>Parallel bit prediction</td><td>AR context / bit 并行</td><td>真正共享 tokenizer 与上下文</td></tr>
                  <tr><th>UniDDT</th><td>连续 visual latent</td><td>理解 + diffusion</td><td>文本/图像 decoder 分离</td><td>梯度冲突与任务解耦</td></tr>
                  <tr><th>LLaDA2.0-Uni</th><td>SigLIP-VQ 离散 token</td><td>Masked clean-token CE</td><td>Block-level 并行去掩码</td><td>mask path、block size、二级 decoder</td></tr>
                  <tr><th>ARM</th><td>语义化离散 token</td><td>Next-token CE + RL</td><td>左到右 AR</td><td>tokenizer 语义监督、累计误差</td></tr>
                  <tr><th>SPAR</th><td>语义/像素双流 latent</td><td>Flow Matching + self-align</td><td>连续 latent ODE</td><td>双流容量、动态层路由</td></tr>
                  <tr><th>Transfusion</th><td>文本 ID + 连续图像 patch</td><td>文本 CE + 图像 diffusion loss</td><td>文本 AR / 图像并行去噪</td><td>共享主干与模态特化 head 的边界</td></tr>
                  <tr><th>MAR</th><td>连续图像 token</td><td>逐 token diffusion loss</td><td>AR 或 masked AR + 内层去噪</td><td>生成顺序与状态空间解耦</td></tr>
                  <tr><th>MAGVIT-v2</th><td>LFQ 离散图像/视频 token</td><td>tokenizer 重建 + 下游 CE</td><td>下游 causal LM</td><td>先锁定 tokenizer 上限再比模型</td></tr>
                  <tr><th>TokLIP</th><td>VQ + 语义特征</td><td>理解/生成解耦</td><td>沿用下游模型</td><td>语义增益与重建保持</td></tr>
                  <tr><th>InternVLA-A1</th><td>语义 token + VAE latent + action</td><td>未来 latent + action velocity</td><td>并行预见 + Flow ODE</td><td>三专家分工、动态预测收益</td></tr>
                  <tr><th>Multi-Mask DLM</th><td>token ID + 多 mask state</td><td>Clean-token CE + distill</td><td>并行恢复 / 4–16 步</td><td>mask 分工、IBQ 聚类、少步一致性</td></tr>
                </tbody>
              </table>
            </div>
            <div className="matrix-metrics">
              {[
                ["理解", "MMBench · SEED · VQA"],
                ["OCR", "DocVQA · TextVQA · OCRBench"],
                ["生成", "GenEval · DPG · FID"],
                ["效率", "Steps · Tok/s · Memory"],
              ].map(([title, value]) => <div key={title}><b>{title}</b><span>{value}</span></div>)}
            </div>
          </section>

          <section className="world-section" id="world-matrix">
            <div className="section-heading">
              <div><p className="eyebrow">WORLD MODEL COMPARISON</p><h2>世界模型：状态、动作与动力学矩阵</h2></div>
              <p>不只比较画质：同时检查因果可控性、闭环成功率与 horizon error</p>
            </div>
            <p className="scroll-hint">移动端可横向滑动查看状态、动作与闭环列 →</p>
            <div className="matrix-wrap">
              <table className="world-table">
                <thead><tr><th>路线</th><th>观测状态</th><th>动作接口</th><th>动力学目标</th><th>建模方式</th><th>Rollout / 规划</th><th>与 UMM 的关系</th></tr></thead>
                <tbody>
                  <tr><th>InternVLA-A1</th><td>Qwen3-VL 语义 token + COSMOS VAE latent</td><td>连续 action chunk</td><td>未来 latent + action velocity</td><td>并行 latent 回归 + Flow Matching</td><td>单步 foresight；闭环策略执行</td><td>共享上下文，理解/预见/动作专家分工</td></tr>
                  <tr><th>dWorldEval</th><td>MAGVIT-v2 离散视觉 token</td><td>FAST 离散 action token</td><td>未来视觉 token + progress token</td><td>Masked Discrete Diffusion</td><td>闭环 imagined rollout + 稀疏记忆</td><td>视觉/语言/动作统一序列，最接近 URSA 对照</td></tr>
                  <tr><th>Qwen-RobotWorld</th><td>Qwen2.5-VL 语义流 + Video-VAE latent</td><td>自然语言动作</td><td>未来视频 latent</td><td>Double-stream MMDiT diffusion</td><td>视频轨迹；用于数据、评测与规划信号</td><td>统一语义接口，不共享 tokenizer / vocabulary</td></tr>
                  <tr><th>Being-H0.7</th><td>V-JEPA future embedding + latent query</td><td>连续动作 Flow</td><td>future-informed hidden alignment</td><td>Latent world-action + privileged target</td><td>无像素 rollout；低延迟闭环</td><td>共享上下文与主干，把预测性压入语义 latent</td></tr>
                  <tr><th>Self Gradient Forcing</th><td>Video-VAE latent + causal KV</td><td>文本 / 自生成历史</td><td>未来 latent denoising + context gradient</td><td>分块 AR + diffusion + two-pass</td><td>分钟级开放环视频 rollout</td><td>可迁移到 IBQ 时序 cache，解决历史记忆 stop-grad</td></tr>
                  <tr><th>PerceptDrive</th><td>VLM 先验 + 稠密视频 latent</td><td>连续 ego trajectory</td><td>next latent L2 + action velocity</td><td>专家路由 + Rectified Flow</td><td>短期预见条件化闭环规划</td><td>语义/像素/动力学分工，不强求统一 token</td></tr>
                  <tr><th>KineBench</th><td>生成 RGB → 6D pose</td><td>恢复的末端执行器轨迹</td><td>无生成训练目标；运动学审计</td><td>视觉 grounding + 物理执行</td><td>模拟器闭环执行评价</td><td>区分画质、动力学与任务成功，适合所有 UMM 世界模型</td></tr>
                </tbody>
              </table>
            </div>
            <div className="matrix-metrics world-metrics">
              {[
                ["因果", "Action shuffle · Intervention"],
                ["长时", "Horizon error · Drift"],
                ["闭环", "Task success · Planning"],
                ["效率", "Latency · Steps · Memory"],
              ].map(([title, value]) => <div key={title}><b>{title}</b><span>{value}</span></div>)}
            </div>
          </section>

          <footer><span>UMM PAPER RADAR</span><p>把每天的论文推荐，变成可以持续积累和验证的研究路线图。</p></footer>
        </div>
      </div>
    </main>
  );
}
