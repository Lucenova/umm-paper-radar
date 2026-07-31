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
    featured: false,
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
    featured: false,
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
    featured: false,
    idea: true,
  },
  {
    id: "worldweaver",
    index: "35",
    title: "WorldWeaver: Streaming Multi-Agent Autoregressive Diffusion with World State Registers",
    shortTitle: "WorldWeaver",
    date: "2026-07-23",
    category: "世界模型",
    paradigm: "Streaming AR Diffusion + World-State Registers",
    state: "视频 latent + 持久化 world / agent register token",
    objective: "分块视频去噪 + agent state / BEV / scene-text 辅助监督",
    decoding: "chunk-autoregressive diffusion；每块结束后提交并更新 register",
    sharing: "联合 self-attention；MoT 为状态 token 与画面 token 使用角色特化权重",
    action: "当前动作、个体位置/速度/朝向与全局场景状态",
    rollout: "双智能体同步长时 rollout；register 跨窗口保留世界状态",
    evaluation: "视觉质量 + movement grounding、memory、building consistency 与 world score",
    open: "项目页与官方仓库已公开；代码和 checkpoint 标注为即将发布",
    priority: "精读",
    summary:
      "为流式视频世界模型加入可持续更新的 World State Registers：专门保存共享世界信息和个体状态，避免每一步都从有限视觉窗口重新推断场景；再用 agent statistics、鸟瞰图和场景文本让这些状态可监督、可检查。",
    why:
      "这是今天最值得读的一篇。它把长时世界模型的瓶颈从“如何生成下一帧”推进到“跨 rollout 究竟保存什么状态”，而这恰好也是多帧威胁检测容易发生身份漂移、轨迹遗忘和态势反复推断的根因。",
    inspiration:
      "在 Qwen3 + IBQ/URSA/ELF 中，不必让全部历史图像 token 永久留在 KV cache。可以增加少量 target registers，显式保存目标身份、坐标、速度、威胁等级与不确定性；生成路径仍可分别使用离散 URSA 或连续 ELF，状态记忆则成为独立控制变量。",
    experiment:
      "固定 Qwen3、IBQ、帧数与 token 预算，比较完整历史、仅 KV cache、无监督 learned registers、由目标/轨迹/全局态势监督的 registers；共同记录 ID-switch、轨迹误差、短时目标召回、horizon drift、延迟和峰值显存，并在删帧后检查 register 是否保留真实证据而非语言先验。",
    paper: "https://arxiv.org/abs/2607.21594",
    code: "https://vail-ucla.github.io/worldweaver/",
    codeLabel: "项目页",
    featured: false,
    idea: true,
  },
  {
    id: "context-weighted-dfm",
    index: "36",
    title: "Context-weighted Discrete Flow Matching",
    shortTitle: "Context-weighted DFM",
    date: "2026-07-23",
    category: "离散 Diffusion",
    paradigm: "Context-weighted Discrete Flow Matching",
    state: "离散 token ID / 连续时间 Markov chain 状态",
    objective: "context-scaled clean-token Cross-Entropy",
    decoding: "任意顺序、按局部上下文密度加权的离散采样",
    sharing: "兼容共享 vocabulary / LM head，也可从 AR/LLM 权重初始化",
    open: "论文已公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "指出标准离散 Flow 把低熵易预测 token 与高熵歧义 token 混在同一因子化目标中；通过把局部上下文密度写入 CTMC sampler 与 scaled CE，在几乎不增加开销的情况下显著改善生成困惑度，并保留 any-order generation。",
    why:
      "它是 URSA 今天最直接的新对照。URSA用 codebook/token 距离定义转移几何，这篇则用上下文信息量决定哪些 token 更值得学习和先恢复；二者分别解决“token 与谁相近”和“当前位置有多难”两个正交问题。",
    inspiration:
      "图像网格的局部上下文极强，但 OCR 字符、目标边界、重复纹理和背景 token 的熵完全不同。可以把 URSA metric path 与 spatial/semantic context weighting 组合，避免训练被大量容易背景 token 主导，也让文字和小目标获得更高有效梯度。",
    experiment:
      "固定 Qwen3、IBQ、URSA path、数据和总 FLOPs，仅比较 uniform loss/sampler、confidence weighting、空间邻域 context weighting、DINO/SigLIP 语义邻域 weighting；报告 OCRBench/TextVQA、边缘与文字 token 错误、4/8/16 步质量、吞吐和梯度方差。",
    paper: "https://arxiv.org/abs/2607.21427",
    featured: false,
    idea: true,
  },
  {
    id: "remo",
    index: "37",
    title: "Out of Sight, Still in Mind: Token Compression for Omni-LLMs",
    shortTitle: "ReMo",
    date: "2026-07-23",
    category: "统一多模态",
    paradigm: "Training-free Cross-modal Token Compression",
    state: "连续音视频 embedding + 紧凑 object / location 文本代理",
    objective: "无需训练；按跨模态独特信息与冗余选择 token",
    decoding: "保持原 Omni-LLM 解码方式不变",
    sharing: "利用现有音频、视频与语言 embedding 对齐，不修改主干",
    open: "论文已公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "ReMo只保留无法由其他模态或其他视觉 token 解释的信息，并把部分对象级视觉 token 替换为描述对象及位置的文本代理；在 Qwen2.5-Omni 上删除约 54% 输入 token 而不降低平均准确率。",
    why:
      "它比随机抽三帧或统一 pooling 更适合你的多帧任务：压缩标准不是“看起来相似”，而是信息是否已经被其他帧、音频或文字覆盖。不过对 OCR 任务，语义代理可能丢失精确字符和版面，因此非常适合作为任务感知压缩的压力测试。",
    inspiration:
      "可把每个 IBQ token 的保留分数拆成跨帧独特性、目标重要性和 OCR 保护三项；对象与位置可压成文本代理，但文字区域、低置信小目标和短暂出现的威胁应保留原始视觉 token。",
    experiment:
      "固定视觉 token 总预算，比较随机帧、时间冗余剪枝、YOLO/object proxy、ReMo 式跨模态冗余压缩和 OCR-protected ReMo；共同测目标召回、短时目标召回、OCRBench/TextVQA、证据引用正确率、延迟与显存。",
    paper: "https://arxiv.org/abs/2607.21179",
    featured: false,
    idea: true,
  },
  {
    id: "faithfulness-rl",
    index: "38",
    title: "Training Large Language Models for Self-Explanation Faithfulness",
    shortTitle: "Faithfulness RL",
    date: "2026-07-23 · ICLR 2026 Re-Align",
    category: "可解释性",
    paradigm: "RL for Causal Self-explanation Faithfulness",
    state: "生成的 CoT / explanation + 干预前后模型行为",
    objective: "Phi-CCT 因果相关性奖励 + RL",
    decoding: "不改变基础 LLM 解码；训练解释与真实行为变化一致",
    sharing: "直接在 Llama3.1-8B 与 Qwen3-8B 上后训练",
    open: "论文已公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "把解释忠实性指标转成逐样本 RL reward，通过随机词插入和用户偏置插入等干预，奖励解释是否准确披露真正影响答案的因素；在 Qwen3-8B 等模型上显著提高同分布忠实性，但跨干预泛化仍不稳定。",
    why:
      "这篇与 Qwen3 直接相关，而且清楚展示“解释更像证据”不等于跨场景忠实。你的威胁检测链条包含检测、排序、态势和决策，尤其容易在答案正确时生成事后合理化的视觉 CoT。",
    inspiration:
      "应把删帧、交换目标类别/坐标、插入误导威胁提示作为因果干预，并要求解释中声明的关键帧、目标和证据与模型实际行为变化一致；奖励准确率与忠实性要分开，防止模型学会迎合评价器。",
    experiment:
      "构建同一答案下的 frame deletion、label/coordinate swap 和 misleading-hint 三类干预；比较普通 SFT、结果奖励 GRPO 与 Phi-CCT-style 忠实性奖励，报告任务准确率、解释—行为相关、OOD 干预泛化和 reward hacking。",
    paper: "https://arxiv.org/abs/2607.21090",
    featured: false,
    idea: true,
  },
  {
    id: "structured-dynamics",
    index: "39",
    title: "Self-Supervised Learning of Structured Dynamics from Videos",
    shortTitle: "SDM",
    date: "2026-07-23",
    category: "世界模型",
    paradigm: "Structured JEPA / Future-feature Prediction",
    state: "冻结 ViT 语义特征 + primary / residual motion token",
    objective: "future-feature prediction；分解主导变化与残余动力学",
    decoding: "无需像素级视频去噪；在语义特征空间短期外推",
    sharing: "可复用理解侧视觉特征，动力学由轻量结构化模块承担",
    action: "无显式 action；primary / residual token 表示可迁移的局部运动变换",
    rollout: "支持短期 feature extrapolation；长时反复应用会产生漂移",
    evaluation: "ProbeMotion 分离 camera / object motion，并评测动作识别与跨场景探针",
    open: "项目页与官方代码仓库已公开",
    priority: "精读",
    summary:
      "从冻结图像 ViT 特征学习视频动力学，先用 primary token解释主导的全局变化，再用 residual token补充独立物体运动；通过 future-feature prediction 把相机运动与目标运动显式拆开，而无需生成完整像素视频。",
    why:
      "多帧威胁检测很容易把平台抖动、镜头平移误判为目标运动。SDM提供了一个比直接堆帧更有针对性的归纳偏置，也说明世界模型不必总以高成本视频生成作为中间表示。",
    inspiration:
      "在 Qwen3/IBQ 上增加 camera-motion token 与 object-residual token，分别预测未来语义 feature 或目标状态；这能把“理解当前画面”和“建模变化来源”分开，并与 ELF 的连续 future-embedding flow形成低成本对照。",
    experiment:
      "固定主干、帧序列和训练预算，比较单一 future-latent prediction、camera/object 双分解、IBQ next-token CE 与 ELF future-velocity；评测相机抖动鲁棒性、目标轨迹误差、静止/运动分类、不同 horizon 的 drift 和推理延迟。",
    paper: "https://arxiv.org/abs/2607.21576",
    code: "https://lukasknobel.github.io/projects/StructuredDynamics/",
    codeLabel: "项目页",
    featured: false,
    idea: true,
  },
  {
    id: "fast-dvlm",
    index: "40",
    title: "Fast-dVLM: Efficient Block-Diffusion VLM via Direct Conversion from Autoregressive VLM",
    shortTitle: "Fast-dVLM",
    date: "2026-04-08 · 重要补读",
    category: "离散 Diffusion",
    paradigm: "AR-to-Block-Diffusion VLM Conversion",
    state: "连续视觉输入特征 + 离散文本 token / mask state",
    objective: "block masked clean-token CE",
    decoding: "块间 causal AR，块内并行去掩码 + speculative block decoding",
    sharing: "保留原 Qwen2.5-VL 视觉对齐、Transformer 与文本词表；只改文本解码方式",
    open: "Apache-2.0 训练/推理代码、模型权重与 SGLang 集成已公开",
    priority: "精读",
    summary:
      "直接把已经完成多模态对齐的 Qwen2.5-VL-3B 从 AR 解码改造成 block diffusion：历史块保持 causal 并可复用 KV cache，当前块内部双向并行恢复。论文还比较了“先改 LLM、再做多模态训练”和“直接转换完整 VLM”，后者在相近预算下明显更好。",
    why:
      "它是今天最值得精读的一篇，因为它把你的核心问题变成了一个低混杂、可执行的实验：不重新训练视觉 encoder，不更换多模态数据，只改变输出文本的建模方式。它也说明从 AR 权重迁移到 diffusion 时，保住已有跨模态 alignment 比先做纯文本转换更重要。",
    inspiration:
      "对 Qwen3 + IBQ，建议分别转换文本输出、image-token 生成和二者联合输出。视觉输入仍保持现有 projector/IBQ 接口，而生成侧使用 block-causal mask：这能判断 URSA 所需的是全序列双向 refinement，还是更便于 KV-cache 的局部双向块已经足够。",
    experiment:
      "从同一 Qwen3+IBQ checkpoint 出发，比较 AR、block diffusion（8/16/32 token block）与 URSA full-sequence metric path；固定样本、更新 token 数和训练 FLOPs，报告 OCRBench、DocVQA、TextVQA、生成质量、首 token/总延迟、实际吞吐、KV-cache、显存及 AR 能力遗忘。",
    paper: "https://arxiv.org/abs/2604.06832",
    code: "https://github.com/NVlabs/Fast-dLLM",
    featured: false,
    idea: true,
  },
  {
    id: "maskgit",
    index: "41",
    title: "MaskGIT: Masked Generative Image Transformer",
    shortTitle: "MaskGIT",
    date: "2022-02-08 · CVPR 2022 经典基础",
    category: "离散 Diffusion",
    paradigm: "Bidirectional Masked Visual Token Modeling",
    state: "VQGAN 离散视觉 token ID + 单一 [MASK]",
    objective: "随机 masked clean-token Cross-Entropy",
    decoding: "全位置并行初始化，按置信度反复提交/重掩码，约 8–16 轮",
    sharing: "视觉 tokenizer 与 Transformer 分离；原作不与语言共享 vocabulary/head",
    open: "官方 JAX 推理代码与 ImageNet tokenizer/模型 checkpoint 已公开，仓库现为只读归档",
    priority: "精读",
    summary:
      "MaskGIT用双向 Transformer 预测随机遮挡的视觉 token，推理时从全 Mask 开始并行生成，再按置信度迭代修正。它把视觉生成从 raster-scan AR 变成 any-order refinement，是后来 masked image generation 与许多离散 diffusion 路线的直接基础。",
    why:
      "要判断 URSA 的 metric path 是否真正有效，不能只和 AR 比；必须有一个不使用 token 距离、只使用单一 Mask 的最小基线。MaskGIT正好保留离散 token、clean-token CE 和全局双向 attention，只移除 URSA 的细粒度概率路径。",
    inspiration:
      "对 IBQ 网格可直接复用同一 vocabulary、embedding 和 LM head，训练 MaskGIT-style mask-only 版本。若它已经接近 URSA，收益可能主要来自双向 refinement；若 URSA在 OCR、边缘或近邻 code 上显著更强，才说明 metric geometry 提供了额外信息。",
    experiment:
      "固定 Qwen3、IBQ、数据与总训练 token，比较 raster AR、MaskGIT single-mask、Multi-Mask、URSA metric path；统一 4/8/16/32 次前向预算，记录 token flip、字符错误、局部边缘错误、GenEval/DPG、吞吐与不同 scheduler 的稳定性。",
    paper: "https://arxiv.org/abs/2202.04200",
    code: "https://github.com/google-research/maskgit",
    featured: false,
    idea: true,
  },
  {
    id: "var",
    index: "42",
    title: "Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction",
    shortTitle: "VAR",
    date: "2024-04-03 · NeurIPS 2024 经典基础",
    category: "自回归建模",
    paradigm: "Coarse-to-Fine Next-Scale Autoregression",
    state: "多尺度 VQ 离散 token maps",
    objective: "next-scale token-map Cross-Entropy",
    decoding: "尺度之间 AR；同一尺度内 token 并行生成",
    sharing: "GPT-style Transformer；依赖专门的 residual multi-scale VQ tokenizer",
    open: "训练代码、模型、VQ tokenizer 与在线 demo 已公开",
    priority: "精读",
    summary:
      "VAR不再把二维图像展平成 raster token 序列，而是从 1×1 token map 开始逐尺度预测更高分辨率 token map；尺度间保持自回归因果性，尺度内并行。它说明所谓“AR”并不等于逐像素左到右，生成顺序本身是一项核心建模选择。",
    why:
      "LlamaGen和X-Omni代表 next-token AR，VAR则代表 next-scale AR。把二者都纳入后，你才能区分 URSA相对 AR 的优势到底来自可修改已生成 token，还是仅来自恢复了二维空间结构与 coarse-to-fine 顺序。",
    inspiration:
      "IBQ本身是单尺度 tokenizer，因此可先做不更换 tokenizer 的 stride pyramid：从稀疏全局位置到稠密局部位置逐级预测。若收益接近原版 VAR，就无需立刻重训多尺度 VQ；若差距明显，再判断 residual multi-scale tokenizer 是否是关键。",
    experiment:
      "固定 Qwen3+IBQ，比较 raster AR、stride-pyramid AR、原生 multi-scale tokenizer VAR 与 URSA；分别报告 tokenizer-only 上限和端到端结果，统一生成 FLOPs后测 OCR文字顺序、全局布局、小目标、每尺度错误累积、吞吐和峰值显存。",
    paper: "https://arxiv.org/abs/2404.02905",
    code: "https://github.com/FoundationVision/VAR",
    featured: false,
    idea: true,
  },
  {
    id: "vjepa2",
    index: "43",
    title: "V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning",
    shortTitle: "V-JEPA 2",
    date: "2025-06-11 · 2026-04-26 版本更新",
    category: "世界模型",
    paradigm: "JEPA + Action-Conditioned Latent World Model",
    state: "视频语义 embedding / masked latent feature",
    objective: "masked future-feature prediction；V-JEPA 2-AC 预测 action-conditioned next representation",
    decoding: "不生成像素；block-causal Transformer 自回归预测下一帧语义表征",
    sharing: "视频 encoder 可对齐 LLM；世界模型复用冻结语义空间但使用独立 300M predictor",
    action: "真实机器人连续动作 + goal image",
    rollout: "在 latent 空间进行候选动作 rollout，并用于 MPC/zero-shot planning",
    evaluation: "运动理解、动作预判、VideoQA 与真实机器人 reach/grasp/pick-and-place 成功率",
    open: "官方 PyTorch 代码、V-JEPA 2/2-AC/2.1 checkpoint 与训练配置已公开",
    priority: "精读",
    summary:
      "先在超大规模无动作视频上学习可预测的语义表示，再用不到 62 小时机器人视频训练 action-conditioned latent predictor；规划时比较 latent future 与目标图像，而非生成高成本像素视频。该体系同时展示理解、预测、LLM 对齐与零样本机器人规划。",
    why:
      "它为“统一理解—生成—预测—行动”提供了一个重要反例：预测和规划未必需要复用像素生成 latent。对你的多帧威胁研究，真正关键的可能是目标身份、运动和因果变化，而不是下一帧每个纹理像素。",
    inspiration:
      "可以保留 IBQ/URSA负责静态重建与生成，同时增加 V-JEPA-style semantic dynamics head，只预测未来 DINO/SigLIP/Qwen视觉 hidden state。它与 ELF future-embedding flow、IBQ next-token CE构成三种动力学目标的公平对照。",
    experiment:
      "固定 Qwen3、帧序列和训练预算，比较未来 IBQ-token CE、ELF velocity、V-JEPA semantic-feature prediction；在相同 horizon 下测目标持续性、相机运动鲁棒性、反事实动作敏感性、horizon drift、VideoQA与规划/威胁决策成功率，同时单独记录是否生成像素带来的延迟。",
    paper: "https://arxiv.org/abs/2506.09985",
    code: "https://github.com/facebookresearch/vjepa2",
    featured: false,
    idea: true,
  },
  {
    id: "llamagen",
    index: "44",
    title: "Autoregressive Model Beats Diffusion: Llama for Scalable Image Generation",
    shortTitle: "LlamaGen",
    date: "2024-06-10 · 重要基础补读",
    category: "自回归建模",
    paradigm: "Vanilla Discrete Visual Autoregression",
    state: "VQ-VAE 离散视觉 token ID",
    objective: "raster-scan next-token Cross-Entropy",
    decoding: "按二维栅格顺序逐 token 生成；已提交 token 不再修改",
    sharing: "采用标准 Llama-style Transformer；视觉 tokenizer 与词表独立，原论文从头训练",
    open: "论文、MIT 代码、tokenizer、模型权重与 vLLM 推理均已公开",
    priority: "精读",
    summary:
      "LlamaGen使用几乎不加入视觉归纳偏置的标准 Llama 架构，把图像经 VQ-VAE 变成离散 token 后，按从左到右、从上到下的顺序执行 next-token prediction；它证明只要 tokenizer、数据和模型规模足够，最朴素的视觉 AR 也能达到强图像生成性能。",
    why:
      "它是 URSA 最干净的 AR 对照。X-Omni和 ARM 还混入语义 tokenizer、统一理解生成或 RL，VAR又改变了预测尺度；LlamaGen主要保留“离散 token + causal Transformer + next-token CE”，更容易判断 URSA 的提升究竟来自 metric path 和全局 refinement，还是仅来自 tokenizer、模型规模与训练数据。",
    inspiration:
      "对 Qwen3 + IBQ，可以完全复用视觉 embedding、vocabulary 和 LM head，只将 URSA 的双向 metric-path训练改成 causal raster-scan CE。若 AR 在 OCR 上更强，可能说明文字的局部顺序依赖有利；若 URSA在布局与多目标一致性上更强，则说明全局反复修正具有真实收益。",
    experiment:
      "固定 Qwen3、IBQ、视觉词表、训练样本、可训练参数和总 FLOPs，比较 LlamaGen-style AR 与 URSA。除 OCRBench、TextVQA、GenEval、DPG 外，同时报告 N-token AR 的 KV-cache 延迟、URSA K-step 全序列计算、峰值显存、累计错误率和 token flip/revision 能力；效率必须用真实 wall-clock 与吞吐比较，不能只比较“生成步数”。",
    paper: "https://arxiv.org/abs/2406.06525",
    code: "https://github.com/FoundationVision/LlamaGen",
    featured: false,
    idea: true,
  },
  {
    id: "show-o",
    index: "45",
    title: "Show-o: One Single Transformer to Unify Multimodal Understanding and Generation",
    shortTitle: "Show-o",
    date: "2024-08-22 · ICLR / NeurIPS 2025 基础补读",
    category: "统一多模态",
    paradigm: "Text AR + Image Masked Discrete Diffusion",
    state: "文本 token ID + MAGVIT-v2 离散视觉 token / [MASK]",
    objective: "文本 next-token CE + 图像 masked clean-token CE",
    decoding: "文本 causal AR；图像全局并行去掩码与反复修正",
    sharing: "共享同一 Transformer；视觉理解 encoder、生成 tokenizer 与模态 head 仍有分工",
    open: "官方代码、模型权重、推理脚本与在线 demo 已公开",
    priority: "精读",
    summary:
      "Show-o在单一 Transformer 中为文本保留自回归建模，为图像使用离散 masked diffusion；同一上下文可完成 VQA、图像生成、编辑、补全与图文交错生成。它不是把所有模态强行变成同一种概率过程，而是共享语义主干、保留模态适配的生成目标。",
    why:
      "它是检验“统一主干是否必须统一生成过程”的关键基线。URSA尝试让视觉离散 token 使用 metric path，ELF把连续 flow扩展到语言；Show-o则接受文本 AR、图像 diffusion 的异构目标。若它在相同预算下更稳，说明 UMM 的关键可能是共享语义计算，而不是统一噪声过程。",
    inspiration:
      "对 Qwen3 + IBQ，可以保留文本原生 AR head，仅把 image-token 区域切换为 mask-only或 URSA metric path；这样能避免文本能力因 diffusion 化而退化，并检查共享 Transformer 是否足以形成跨模态语义。OCR任务还可比较文字区域是否需要更强的局部因果顺序。",
    experiment:
      "从同一 Qwen3+IBQ checkpoint 出发，比较全 AR、Show-o式 text-AR/image-mask、text-AR/image-URSA 与全 URSA；固定数据和训练 FLOPs，分别测语言能力遗忘、VQA/OCRBench、T2I、图文交错生成、4/8/16/32步质量及两类 token 的梯度冲突。",
    paper: "https://arxiv.org/abs/2408.12528",
    code: "https://github.com/showlab/Show-o",
    featured: false,
    idea: true,
  },
  {
    id: "fluid",
    index: "46",
    title: "Fluid: Scaling Autoregressive Text-to-Image Generative Models with Continuous Tokens",
    shortTitle: "Fluid",
    date: "2024-10-17 · ICLR 2025 基础补读",
    category: "自回归建模",
    paradigm: "Random-order AR + Per-token Diffusion Loss",
    state: "连续图像 tokenizer latent；未知位置使用可学习 mask",
    objective: "每个连续 token 的 diffusion noise prediction",
    decoding: "BERT式双向 random-order；外层约64轮位置提交，内层连续 diffusion采样",
    sharing: "T5 文本 encoder + 独立视觉 Transformer；原作不共享 LLM vocabulary/head",
    open: "论文与完整实现细节公开；未找到官方训练代码或 checkpoint",
    priority: "精读",
    summary:
      "Fluid把“状态表示”和“生成顺序”拆成两个正交轴，系统比较离散/连续 token 与 raster/random order四种组合。结果显示连续 token更有利于视觉质量，而随机顺序双向建模更有利于计数、位置与全局构图；最终模型以 MaskGIT式外层顺序选择配合连续 token diffusion loss。",
    why:
      "它直接提醒你：AR、Diffusion和Flow不能只按论文名称分类。Fluid在位置依赖上是随机顺序 AR，在单个 token 的条件分布上却使用 diffusion loss。它能避免把 ELF 相对 URSA 的差异误归因于单一因素，因为连续状态、局部生成器与外层顺序同时都会改变结果。",
    inspiration:
      "可以在 IBQ 上构造二维控制变量：状态用离散 ID或连续 code embedding，顺序用 raster或 random-confidence；连续版本可再比较 diffusion noise、ELF velocity与直接 L2。若 OCR下降只发生在 random order，而非连续状态，说明问题更可能来自文字顺序而非 embedding建模。",
    experiment:
      "固定 Qwen3、视觉 token数量、训练数据和总 FLOPs，做2×2比较：离散/连续状态 × raster/random order；连续单 token head再比较 noise与velocity。报告OCR字符顺序、计数/位置、GenEval、tokenizer重建上限、内外层总前向次数、KV cache、吞吐和显存。",
    paper: "https://arxiv.org/abs/2410.13863",
    featured: false,
    idea: true,
  },
  {
    id: "genie",
    index: "47",
    title: "Genie: Generative Interactive Environments",
    shortTitle: "Genie",
    date: "2024-02-23 · ICML 2024 世界模型基础",
    category: "世界模型",
    paradigm: "Latent Action + Frame-AR / Within-frame MaskGIT",
    state: "时空视频 tokenizer 的离散视觉 token",
    objective: "latent-action inference + 下一帧 masked clean-token CE",
    decoding: "时间上逐帧 AR；每帧内部约25步 MaskGIT并行恢复",
    sharing: "video tokenizer、latent-action model、dynamics model分离；不共享 UMM/LLM 主干",
    action: "从无标注相邻帧推断的离散 latent action；推理时由用户控制替代",
    rollout: "逐帧闭环交互，可持续生成可操作2D环境",
    evaluation: "动作可控性、latent-action一致性、视频质量与未见视频行为模仿",
    open: "论文与项目材料公开；官方训练代码未释放，社区有非官方复现",
    priority: "精读",
    summary:
      "Genie从无动作标签互联网视频中同时学习视频 tokenizer、latent action model和动力学模型。时间维度按下一帧自回归，每一帧内部用 MaskGIT恢复离散视觉 token，使静态视频数据变成可逐步操控的生成环境。",
    why:
      "它提供了把 URSA 从静态图像生成扩展到世界模型的最直接模板：未来帧之间保持因果顺序，帧内仍可并行修正；同时用 latent action吸收缺失的控制变量。相比直接预测未来视频，这种分解更适合做清晰的动作敏感性实验。",
    inspiration:
      "对多帧威胁数据，即使没有完整平台动作标注，也可以从相邻帧学习 camera/agent latent action，再条件化未来 IBQ token。它有望把“目标自身运动”和“相机/载体运动”分开，并把 UMM扩展成统一理解—生成—预测—隐式行动表示。",
    experiment:
      "固定 Qwen3+IBQ，比较无动作 next-frame CE、真实元数据 action、学习到的 latent action，以及随机打乱 action；帧内分别使用 MaskGIT、URSA和ELF。评测不同 horizon目标轨迹、action-shuffling敏感性、短时目标召回、闭环可控性、每帧延迟与误差累积。",
    paper: "https://arxiv.org/abs/2402.15391",
    code: "https://sites.google.com/view/genie-2024/",
    codeLabel: "项目页",
    featured: false,
    idea: true,
  },
  {
    id: "diamond",
    index: "48",
    title: "DIAMOND: Diffusion for World Modeling — Visual Details Matter in Atari",
    shortTitle: "DIAMOND",
    date: "2024-05-20 · NeurIPS 2024 Spotlight 基础补读",
    category: "世界模型",
    paradigm: "Action-conditioned Pixel Diffusion World Model",
    state: "像素图像观测 + 过去帧历史",
    objective: "EDM-style next-frame denoising；reward/termination由独立模块预测",
    decoding: "环境时间逐帧 AR；每一帧内部3步扩散采样",
    sharing: "world model与actor-critic协同训练，但不共享 LLM/UMM tokenizer或主干",
    action: "环境真实离散 action",
    rollout: "支持长时 imagined rollout、闭环RL训练与可交互神经游戏引擎",
    evaluation: "Atari 100k闭环回报、细节保真、长时稳定性、CS:GO可玩性与采样延迟",
    open: "MIT代码、预训练agent、Atari/CS:GO可玩世界模型均已公开",
    priority: "精读",
    summary:
      "DIAMOND绕开离散 tokenizer，直接用低步数像素 diffusion预测动作条件下一帧。作者发现EDM在1–3步下比DDPM更能抵抗自回归误差，并证明小目标与关键像素细节的保留可以直接提升在模型内部训练出的策略表现。",
    why:
      "它是 IBQ 世界模型不可缺少的反例：离散 token可减少长时漂移，却可能丢失决定动作的小目标、文字或指示灯。对你的威胁检测和OCR研究，仅看未来 latent loss可能掩盖任务关键细节已经从 tokenizer中消失。",
    inspiration:
      "可把 DIAMOND作为像素上限对照，并尝试只对高威胁小目标或文字区域增加局部连续 residual diffusion，而全局动力学仍由IBQ/URSA建模。这比完全放弃离散 token更节省计算，也能定位 IBQ丢失信息的空间位置。",
    experiment:
      "固定历史帧、动作和训练预算，比较像素EDM、IBQ next-token CE、URSA metric path与ELF latent velocity；除FVD/LPIPS外，重点测小目标/OCR未来可读性、action intervention、闭环策略成功率、1/3/5步延迟及horizon error。另做“IBQ主干+局部像素residual”混合组。",
    paper: "https://arxiv.org/abs/2405.12399",
    code: "https://github.com/eloialonso/diamond",
    featured: false,
    idea: true,
  },
  {
    id: "dreamerv3",
    index: "49",
    title: "DreamerV3: Mastering Diverse Control Tasks through World Models",
    shortTitle: "DreamerV3",
    date: "2023-01-10 · Nature 2025 世界模型基础",
    category: "世界模型",
    paradigm: "Categorical Latent RSSM + Imagined Actor-Critic",
    state: "encoder视觉特征 + categorical stochastic latent + recurrent deterministic state",
    objective: "next latent、reconstruction、reward与continuation prediction",
    decoding: "RSSM按环境时间一步展开；策略在latent imagination中多步训练",
    sharing: "encoder/world model/actor/critic协同但模块化；不与LLM vocabulary或生成head共享",
    action: "环境真实离散或连续 action",
    rollout: "支持长时 latent imagination；actor-critic直接在模型内训练，无需生成可视视频",
    evaluation: "150+任务固定超参数、数据效率、Minecraft长程稀疏奖励与真实环境回报",
    open: "官方JAX代码、配置、checkpoint与复现实验说明已公开",
    priority: "精读",
    summary:
      "DreamerV3用RSSM学习动作条件的categorical latent dynamics，同时预测观测、reward和episode continuation；actor与critic在想象轨迹中优化。它的核心价值不是生成逼真视频，而是让预测状态对决策和长期回报足够有用，并用一套稳定化机制覆盖大量任务。",
    why:
      "它为你的世界模型比较提供了真正的决策端基线。Genie和DIAMOND强调可视化未来，V-JEPA强调语义未来，而DreamerV3要求预测最终改善闭环策略。若未来视频更清晰却没有提高威胁决策成功率，就不能证明建模方式更好。",
    inspiration:
      "可在Qwen3视觉hidden state上增加轻量RSSM，预测未来IBQ/语义latent以及任务reward（如目标持续、威胁升级、决策正确性）。这让“理解—生成—预测—行动”不必所有部分共享同一个输出head，但可以共享上下文与表示。",
    experiment:
      "固定Qwen3编码和序列数据，比较像素/IBQ/ELF/JEPA/RSSM五种动力学目标；每组同时训练相同大小的决策head，报告horizon误差、reward/value校准、数据效率、闭环威胁决策成功率、推理延迟与显存。用任务成功率而非重建画质选择世界模型。",
    paper: "https://arxiv.org/abs/2301.04104",
    code: "https://github.com/danijar/dreamerv3",
    featured: false,
    idea: true,
  },
  {
    id: "drae",
    index: "50",
    title: "dRAE: Representation Autoencoder with Hyper-Spherical Codes",
    shortTitle: "dRAE",
    date: "2026-07-24 · 今日新收录",
    category: "统一视觉 Token",
    paradigm: "Semantic RAE + Hyper-Spherical Quantization",
    state: "SigLIP2 / DINO 高维语义 feature → HSQ 离散 token ID",
    objective: "重建 + cosine codebook loss + commitment；可选 encoder distillation",
    decoding: "角度路由分配 code；下游可接离散 diffusion 或统一 MLLM",
    sharing: "同一离散 tokenizer 同时服务理解与生成；语义方向与重建幅值解耦",
    open: "MIT 代码、项目页与训练配置已公开",
    priority: "精读",
    summary:
      "dRAE指出高维视觉基础特征的语义主要编码在方向上，而结构与纹理仍依赖幅值；传统欧氏 VQ 会让 code assignment 被范数主导并产生 codebook collapse。HSQ只用 cosine similarity决定路由，却保留未归一化的量化输出，词表可扩展到131,072并保持100%利用率。",
    why:
      "这篇几乎命中你当前 Qwen3 + IBQ 的核心变量：URSA的 metric path、ELF的 embedding flow以及视觉词表扩展都默认 codebook几何有意义。如果 code assignment本身被幅值而非语义方向支配，后续比较的其实是一个失真的状态空间。",
    inspiration:
      "不要只在 IBQ embedding 上增加 MLP或调初始化；应先分开测方向与范数承担的职责。可以保留原始幅值给 decoder重建，同时用球面方向定义 code分配、URSA token距离与语义蒸馏目标；这也可能让 ELF的 cosine/Bregman目标比普通 L2更合理。",
    experiment:
      "固定 Qwen3、decoder、视觉 token数、数据与总FLOPs，对比 IBQ欧氏量化、L2-normalized VQ、HSQ和HSQ+语义蒸馏。逐层报告codebook utilization/perplexity、角度覆盖、重建/OCR、TextVQA/DocVQA、T2I以及URSA/ELF下的训练稳定性；再交叉替换 Euclidean、cosine 和 learned metric path，区分 tokenizer几何与生成建模收益。",
    paper: "https://arxiv.org/abs/2607.22148",
    code: "https://github.com/martian422/dRAE",
    featured: false,
    idea: true,
  },
  {
    id: "native-mm-scaling",
    index: "51",
    title: "Scaling Native Multimodal Pre-Training From Scratch",
    shortTitle: "Native-MM Scaling",
    date: "2026-07-24 · 今日新收录",
    category: "统一多模态",
    paradigm: "Encoder-free Native Multimodal Decoder-only MoE",
    state: "单层 patch embedding 的连续视觉 token + 离散文本 token",
    objective: "文本 next-token loss；视觉位置不直接计算生成 loss",
    decoding: "decoder-only causal Transformer；论文聚焦理解预训练而非图像生成",
    sharing: "图像与文本从预训练起共享同一 MoE 主干；没有独立 vision encoder",
    open: "论文与完整缩放配置公开；截至核对时未见官方代码或权重",
    priority: "精读",
    summary:
      "该工作完全去掉传统 vision encoder，只用一层 patch embedding把图像送入 decoder-only MoE，并在71M至3B配置上测量原生多模态预训练的计算最优缩放规律。语言目标对数据配比相对稳定，多模态目标却强烈依赖配比；文本占比高的混合数据只有在更大模型上才更计算有效。",
    why:
      "你计划比较不同 UMM 建模方式，但若 AR、URSA、ELF使用不同的多模态数据比例或参数规模，结论会被资源分配污染。这篇提供了一个重要警告：同样总FLOPs不代表各路线处在各自的 compute-optimal点，尤其是从Qwen3后改与从头原生训练的比较。",
    inspiration:
      "可把“是否使用独立视觉 encoder”提升为正交控制轴：Qwen3视觉编码器、单层patch embedding、IBQ离散token三种输入接口分别搭配同一生成目标。还应固定有效激活参数和各模态实际token FLOPs，而不只是固定样本数。",
    experiment:
      "建立两阶段预算协议：先在小规模网格上分别为AR、URSA、ELF估计最优模型/数据配比，再在同一总FLOPs下比较。输入侧同时测Qwen3-VL encoder、encoder-free patch embedding和IBQ；评价纯文本遗忘、空间推理、OCRBench、DocVQA、T2I、梯度冲突和每模态单位算力收益。",
    paper: "https://arxiv.org/abs/2607.22043",
    featured: false,
    idea: true,
  },
  {
    id: "innotext",
    index: "52",
    title: "InnoText: A Unified Model for Visual Text Generation and Editing",
    shortTitle: "InnoText",
    date: "2026-07-24 · ECCV 2026",
    category: "连续 Flow",
    paradigm: "OCR-specialized DiT Flow Matching",
    state: "图像 VAE latent + glyph、mask与连续 font-size map",
    objective: "velocity Flow Matching；编辑区域使用尺寸感知加权 loss",
    decoding: "连续 latent ODE采样；同一DiT支持生成与局部编辑",
    sharing: "生成/编辑共享DiT与latent空间，但不共享LLM词表或理解主干",
    open: "论文与双语数据构造细节公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "InnoText用同一DiT统一中英文视觉文字生成与编辑，并以Font Size-Aware Modulation、微小字符区域放大增强和任务专属区域加权Flow loss，显式解决小字与复杂汉字在连续生成中的细节丢失。",
    why:
      "它不是通用UMM，却是非常有价值的OCR压力测试上限：如果URSA或ELF在一般图像指标上接近，但小字、重复字符和中文字形明显退化，问题可能不是全局建模范式，而是训练目标没有给高信息密度区域足够权重。",
    inspiration:
      "可把font-size map替换为OCR detector置信度、字符密度或DocVQA证据区域，作为URSA token CE、ELF velocity loss和GRPO reward的空间权重。它还提示生成与编辑可以共享主干，却使用不同的局部/全局监督分配。",
    experiment:
      "固定Qwen3+IBQ与同一文字数据，对AR、URSA、ELF分别比较全局均匀loss和OCR-region/size-aware weighting；按字符高度分桶报告CER、NED、OCRBench、TextVQA、重复字符错误、中文笔画完整度、非文字区域FID及推理开销，避免平均指标掩盖小字失败。",
    paper: "https://arxiv.org/abs/2607.22101",
    featured: false,
    idea: true,
  },
  {
    id: "vssd",
    index: "53",
    title: "Visual Saliency Steering Distillation for Multimodal Chain-of-Thought Reasoning",
    shortTitle: "VSSD",
    date: "2026-07-24 · ICASSP 2026",
    category: "可解释性",
    paradigm: "Causal Visual Perturbation + Steering Distillation",
    state: "MLLM attention map、扰动图像与跨层视觉 steering vector",
    objective: "任务 loss + 显著性 steering 的层间蒸馏 loss",
    decoding: "不改变文本解码；训练阶段把视觉差分方向注入中间层",
    sharing: "教师与学生共享多模态任务语义；视觉显著性作为因果干预信号",
    open: "论文、训练与评测代码已公开",
    priority: "精读",
    summary:
      "VSSD利用教师MLLM attention构造任务敏感的图像扰动，再对原图与扰动图的特征差做SVD，提取主导steering direction并用于学生模型层间蒸馏；目标是防止小模型在多模态融合后抹平细微但任务关键的视觉差异。",
    why:
      "这与小字OCR、细粒度目标和多帧威胁判断高度一致：同一问题配不同图像，或同一图像配不同指令时，模型可能形成几乎相同的融合表示并依赖语言先验。仅看attention热图不能证明因果性，而扰动—差分—注入提供了更接近干预的训练信号。",
    inspiration:
      "可以围绕字符、坐标、小目标或关键帧生成受控扰动，提取Qwen3内部真正改变答案的方向，再监督IBQ projector或URSA hidden state保持这些差异。steering强度必须做扫参，过强会扭曲原有语义。",
    experiment:
      "构造same-text/different-image与same-image/different-question配对，比较普通SFT、feature distillation、VSSD和activation patching。报告答案准确率、视觉反事实敏感性、删帧/删字符影响、steering dose-response、跨数据集泛化及解释中引用证据与真实因果影响的一致性。",
    paper: "https://arxiv.org/abs/2607.22013",
    code: "https://github.com/BGWH123/VSSD",
    featured: false,
    idea: true,
  },
  {
    id: "koopman-dreamer",
    index: "54",
    title: "Koopman Dreamer: Spectrally Constrained Latent Dynamics for Stable World-Model Imagination",
    shortTitle: "Koopman Dreamer",
    date: "2026-07-22 · 近期重点补读",
    category: "世界模型",
    paradigm: "Spectral Koopman Latent Dynamics + Dreamer",
    state: "结构化确定性latent + categorical stochastic state",
    objective: "one-step consistency + 多步teacher/prior rollout + observation/reward prediction",
    decoding: "受控latent dynamics逐步展开；策略在想象轨迹中actor-critic优化",
    sharing: "沿用Dreamer模块化encoder/world model/actor/critic；不共享LLM词表",
    action: "真实连续action；线性项与低秩双线性state-action项共同控制动力学",
    rollout: "支持长时posterior-free imagination与闭环控制；谱半径显式约束误差放大",
    evaluation: "DMC与UAV-LiDAR的open-loop horizon error、reward预测和闭环成功率",
    open: "论文与完整实现细节公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "Koopman Dreamer把长时确定性动力学写成带有有界半径的二维旋转—缩放块，并用动作线性项、低秩双线性交互和随机状态局部修正适配非线性控制。它还联合训练一步、多步与开放环目标，显式处理posterior训练和prior imagination之间的分布差。",
    why:
      "DreamerV3告诉你要看闭环成功，Koopman Dreamer进一步回答为什么长时latent rollout会炸掉或遗忘：谱半径太大导致误差几何放大，太小又会抹去持久目标。这个稳定—记忆折中同样存在于多帧威胁跟踪和未来IBQ/ELF预测。",
    inspiration:
      "可在Qwen3视觉状态之上增加少量可解释的旋转/衰减动态mode，让静止目标、周期运动、持续威胁与相机运动对应不同时间常数；IBQ/URSA负责可生成细节，Koopman latent负责长时稳定记忆，而非强迫一个生成器同时承担两种职责。",
    experiment:
      "固定Qwen3/IBQ、action输入和world-model参数量，对比MLP/RSSM、Koopman latent、URSA next-token与ELF future-velocity。统一做8/16/32/64步open-loop、谱半径扫描、action shuffle、目标持续性、轨迹误差、reward/value校准与闭环决策成功率；同时检查低latent MSE是否只是过度收缩而丢失可用信息。",
    paper: "https://arxiv.org/abs/2607.19719",
    featured: false,
    idea: true,
  },
  {
    id: "ursa-code-audit",
    index: "55",
    title: "URSA 代码审计：DiffusionTransformer 与离散 URSA 主干不是同一条路径",
    shortTitle: "URSA Code Audit",
    date: "2026-07-28 · 官方 main 分支核对",
    category: "离散 Diffusion",
    paradigm: "Implementation Audit · DiT vs Discrete DFM",
    state: "DiT 文件处理连续 latent patch；URSA 主干处理离散 image token ID",
    objective: "DiT 输出连续 patch 值；URSA 输出每位置 64K 视觉词表 logits / CE",
    decoding: "DiT 由外部 scheduler 迭代去噪；URSA 走 metric-path 全局离散 refinement",
    sharing: "两套独立实现；离散主干是 Qwen3Model + visual lm_head",
    open: "官方仓库与训练代码公开；结论基于 2026-07-28 main 分支",
    priority: "精读",
    summary:
      "diffnext/models/diffusion_transformer.py 确实实现了标准 DiT 组件：Conv2d patch embedding、timestep embedding、AdaLN 调制与连续输出 head。patch_size=2 时，Linear(embed_dim, 4×image_dim) 一次恢复一个 2×2 latent patch 的四个连续向量，顺序为左上、右上、左下、右下；它不是一次预测四个离散 token ID。当前离散 URSA 主路径位于 transformer_ursa.py，使用 Qwen3Model 与 64K visual lm_head，为原始 IBQ 网格的每个位置预测一个词表分布。",
    why:
      "这能纠正一个会直接影响实验设计的误读：代码中的 patch embedding 是连续 DiT 的计算降采样，不等于 URSA 对离散 image token 做 token merge。把两者混在一起，会错误估计序列长度、head 参数量、监督目标和采样顺序。",
    inspiration:
      "原始 URSA 只有 VAE/IBQ tokenizer 的空间下采样，进入 Qwen3 后没有额外 2×2 token folding。若要压缩序列，需要显式新增 fold encoder 与 unshuffle/local decoder，并保证 scheduler 最终仍能更新原始 H×W 个 ID。",
    experiment:
      "先锁定原始 URSA 为 no-merge 基线，再比较：2×2 fixed fold + parallel shared head、2×2 fold + local causal head、DPAR dynamic patch。不要直接使用 Linear(D,4K)：D=2048、K=64000 时约 5.24 亿权重；更合理的是 Linear(D,4dᵥ)→reshape→共享 K-way visual head。",
    paper: "https://github.com/baaivision/URSA/blob/main/diffnext/models/diffusion_transformer.py",
    code: "https://github.com/baaivision/URSA/blob/main/diffnext/models/transformers/transformer_ursa.py",
    codeLabel: "离散主干",
    featured: false,
    idea: true,
  },
  {
    id: "token-shuffle",
    index: "56",
    title: "Token-Shuffle: Towards High-Resolution Image Generation with Autoregressive Models",
    shortTitle: "Token-Shuffle",
    date: "2025-04-24 · v2 2025-04-27",
    category: "自回归建模",
    paradigm: "Fixed Spatial Token Folding + AR",
    state: "局部 s×s 离散 VQ token embedding 沿通道合并",
    objective: "Token-unshuffle 后对每个原始 ID 做共享词表 CE",
    decoding: "压缩序列按组 AR；组内 s² 个 ID 并行预测",
    sharing: "Transformer 看 N/s² 个 folded token；输出端恢复原空间槽位",
    open: "论文与项目页公开；截至核对时未见完整官方训练代码",
    priority: "精读",
    summary:
      "Token-Shuffle先降低单个视觉 code embedding 维度，再把空间相邻的 s×s 个 token 沿 channel 拼成一个 Transformer token；输出端用 Token-Unshuffle 恢复 s² 个槽位，并通过共享 visual vocabulary classifier 预测原始 VQ ID。它是真正的离散 image-token merge，不是只在 tokenizer 内做下采样。",
    why:
      "它提供了把 Qwen3 序列长度从 N 降到 N/s² 的最小改动方案，而且不需要改变 IBQ codebook。对高分辨率 T2I 很有吸引力，也最适合作为 URSA 固定合并的第一条效率基线。",
    inspiration:
      "其代价是 folded block 内采用并行条件独立预测，可能损害文字笔画、密集小目标和边界细节。对你的 OCRBench/DocVQA 任务，这不是附带指标，而是判断 merge 是否可接受的核心指标。",
    experiment:
      "固定 Qwen3、IBQ、训练 FLOPs与原始 H×W 监督，比较 no-merge、2×2 shuffle 与4×4 shuffle；同时报告 block 内 token accuracy、OCR、小目标召回、视觉 token 吞吐和峰值显存。加入 OCR-aware 局部不合并策略检验高信息区域是否应保留原粒度。",
    paper: "https://arxiv.org/abs/2504.17789",
    code: "https://ma-xu.github.io/token-shuffle/",
    codeLabel: "项目页",
    featured: false,
    idea: true,
  },
  {
    id: "synergen-vl",
    index: "57",
    title: "SynerGen-VL: Synergistic Understanding and Generation with Token Folding",
    shortTitle: "SynerGen-VL",
    date: "2024-12-12 · 关键基础补读",
    category: "统一多模态",
    paradigm: "Encoder-free UMM + Token Folding",
    state: "局部离散 VQ IDs → folded LLM token",
    objective: "统一 next-token CE；局部视觉 head 还原原始 IDs",
    decoding: "LLM 在 folded 序列上 AR；小型 causal head 在块内顺序生成",
    sharing: "理解/生成共享 encoder-free LLM；视觉 expert 与局部 head 专门化",
    open: "论文公开；作者声明将开源，完整代码与模型仍需跟踪",
    priority: "精读",
    summary:
      "SynerGen-VL在 encoder-free 统一理解生成模型中引入 token folding：主 LLM 只处理压缩后的视觉序列，而一个浅层 causal Transformer 根据全局 hidden state 在 folded block 内自回归还原原始视觉 IDs。它把昂贵的全局依赖与便宜的局部依赖分层建模。",
    why:
      "相较 Token-Shuffle 的组内并行 head，SynerGen-VL保留了块内 token 的条件依赖，因此更适合 OCR、局部结构和细粒度纹理；它也是最接近 Qwen3+IBQ 统一模型接口的 token-merge 论文。",
    inspiration:
      "可以让 Qwen3/URSA只在 N/4 个 folded state 上建模，再用 2–4 层 local causal decoder 生成四个原始 ID。这样既减少全局 attention，又避免直接假设 2×2 block 内四个 token 独立。",
    experiment:
      "在相同 N/4 全局长度下，严格比较 parallel unshuffle head 与 local causal head；把总前向 FLOPs对齐，并单独报告文字区域、物体边界与平坦背景的组内条件互信息和恢复误差。",
    paper: "https://arxiv.org/abs/2412.09604",
    featured: false,
    idea: true,
  },
  {
    id: "dpar",
    index: "58",
    title: "DPAR: Dynamic Patchification for Efficient Autoregressive Visual Generation",
    shortTitle: "DPAR",
    date: "2025-12-26 · CVPR 2026",
    category: "自回归建模",
    paradigm: "Entropy-guided Dynamic Token Patching",
    state: "离散 VQ IDs → 可变长连续 patch representation",
    objective: "局部 decoder 对原始 token ID 做 K-way CE",
    decoding: "global patch AR + local causal token decoder",
    sharing: "轻量 patch encoder/decoder 包裹 Llama 式全局 Transformer",
    open: "论文与算法细节公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "DPAR用轻量 AR 模型的 next-token entropy 衡量信息量：低熵连续 token 被动态合并，高熵区域保留细粒度，且不跨图像行合并。全局 Transformer 只处理可变数量的 patch，局部 causal decoder 最终仍逐个预测原始 VQ ID。",
    why:
      "它比固定 2×2 merge 更符合 OCR 与威胁检测：天空、墙面可激进压缩，文字、小目标和复杂边界保留原 token。论文报告 token 数减少 1.81×/2.06×、训练 FLOPs最多降低40%，同时不必丢弃二维结构。",
    inspiration:
      "URSA可以把 entropy 换成 timestep-aware difficulty：根据当前 posterior entropy、OCR proposal、目标检测不确定性决定哪些位置合并。难点是 patch 边界会随去噪步变化，因此更适合作为 AR 基线或采用固定分区、动态计算分配的折中版。",
    experiment:
      "比较 fixed 2×2、DPAR entropy、IBQ distance 与 DINO/SigLIP semantic boundary 四种分块；固定平均 compression ratio 后测 OCR、细粒度理解、T2I、patch-boundary artifact、真实延迟和训练稳定性。",
    paper: "https://arxiv.org/abs/2512.21867",
    featured: false,
    idea: true,
  },
  {
    id: "imagefolder",
    index: "59",
    title: "ImageFolder: Autoregressive Image Generation with Folded Tokens",
    shortTitle: "ImageFolder",
    date: "2024-10-02 · 关键基础补读",
    category: "统一视觉 Token",
    paradigm: "Dual-branch Product Quantization + Folded AR",
    state: "同一空间位置的 semantic ID + detail ID",
    objective: "2K logits reshape 为两组 K-way CE",
    decoding: "位置之间 AR；同位置两路 ID 并行采样",
    sharing: "语义/像素双 codebook 共享上层 AR hidden state",
    open: "论文与官方代码公开",
    priority: "精读",
    summary:
      "ImageFolder的 folding 不是把四个相邻空间 token 合成一个，而是以双分支 product quantization 把同一位置拆成 semantic code 与 detail code。AR 序列只按空间位置推进，head 输出两组独立 K-way 分布，再由 tokenizer 联合解码。",
    why:
      "它提示序列压缩不只有空间 merge：还可以把语义与重建细节折叠到同一位置，避免缩小空间网格伤害 OCR 与小目标。代价是同位置两路 code 的独立性假设可能限制联合建模。",
    inspiration:
      "对 IBQ 可探索 semantic codebook + residual/detail codebook：Qwen3 hidden 同时预测两路 ID，理解侧优先读取 semantic branch，生成 decoder 使用两路重建。这样更容易区分 tokenizer 语义提升和上层生成方式提升。",
    experiment:
      "固定总 bitrate 与 decoder，比较单 64K IBQ、两个较小 product codebook、空间2×2 fold；报告 codebook utilization、OCR、语义 linear probe、重建和 T2I，并测试联合 2D head 是否优于两个独立 softmax。",
    paper: "https://arxiv.org/abs/2410.01756",
    code: "https://github.com/lxa9867/ImageFolder",
    featured: false,
    idea: true,
  },
  {
    id: "unifusion",
    index: "60",
    title: "UNIFUSION: Adapting Autoregressive Language Models into Discrete Diffusion under a Unified Reverse-Rate Objective",
    shortTitle: "UNIFUSION",
    date: "2026-07-27 · 新提交",
    category: "离散 Diffusion",
    paradigm: "AR-to-Uniform-Noise Discrete Diffusion",
    state: "离散 token ID；uniform kernel 下任意 token 都可跳转、持续可编辑",
    objective: "统一 reverse-rate generalized KL；由 clean-token x₀ 预测转换为 score / posterior / jump rate",
    decoding: "全序列迭代采样；16–256 步，可在 mask 与 uniform corruption kernel 间切换",
    sharing: "从 GPT-2 AR checkpoint 继续预训练，复用 token embedding、Transformer 与 x₀ 输出接口",
    open: "论文与推导已公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "UNIFUSION把 SEDD、MDLM/GIDD、M2S 与 Neural CTMC 的条件损失统一为 reverse-rate 上的 generalized KL，并推导 clean-token 预测到多种离散扩散参数化的转换。它首次直接把预训练 AR 模型适配到 uniform-noise diffusion，而不局限于单一 [MASK]；每个 token 在采样中都保持可编辑。",
    why:
      "这是目前最适合补入“Qwen3 AR → URSA”控制链的一篇。它把 AR 权重初始化、corruption kernel 和输出参数化拆开：同一个 x₀ head 可以分别承载 mask path、uniform path 与 URSA metric path，从而避免把新 head、重新对齐或损失接口变化误判成 metric geometry 的收益。",
    inspiration:
      "对 Qwen3+IBQ，可保留 64K visual vocabulary 与 clean-token CE 接口，只把前向核替换为 single-mask、uniform replacement 和 IBQ-distance metric path。UNIFUSION还提示：如果 uniform kernel 已能通过“所有 token 可修订”接近 URSA，那么 URSA 的额外价值应由近邻转移效率、OCR局部错误和少步质量证明。",
    experiment:
      "从同一 AR checkpoint 出发，固定 Qwen3、IBQ、数据、训练 token与FLOPs，比较 raster AR、MaskGIT、UNIFUSION uniform kernel和URSA metric path；共享 x₀ visual head并统一4/8/16/32/64次前向预算，报告OCRBench、DocVQA、TextVQA、T2I、token修订率、转移距离、吞吐、显存及训练稳定性。",
    paper: "https://arxiv.org/abs/2607.24507",
    featured: false,
    idea: true,
  },
  {
    id: "pard",
    index: "61",
    title: "Rethinking the Generation Order of Block Diffusion Language Models",
    shortTitle: "PARD",
    date: "2026-07-27 · 新提交",
    category: "离散 Diffusion",
    paradigm: "Training-free Parallel Autoregressive Decoding for Block Diffusion",
    state: "block diffusion 的离散 token ID / [MASK] 状态",
    objective: "不改训练目标；沿用原 block masked clean-token 分布",
    decoding: "保持左到右的 unmask 结构，但每轮并行提交多个 token",
    sharing: "采样器级改造；不改 tokenizer、embedding、Transformer 或输出 head",
    open: "论文已公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "论文发现近期 block diffusion LM 的条件结构天然比经典全序列 masked model更偏向左到右。基于这一点，PARD在不训练的情况下保留左到右解掩码结构，同时并行提交 token；其质量优于常见并行 sampler，速度又明显快于纯 AR。",
    why:
      "它说明“模型是 diffusion”并不等于最优解码顺序必须完全自由。对于 OCR、文档文字和视觉栅格，局部因果顺序可能很重要；因此比较 URSA、MaskGIT 与 block diffusion 时，训练目标和采样顺序必须作为两个独立变量。",
    inspiration:
      "可以把 PARD移植到 image-token block：按图像 raster、文字阅读顺序或 coarse-to-fine block 推进，块内按置信度并行提交。这样既保留文字和边界的局部先后关系，也比逐token AR减少前向次数，并能与URSA全局confidence scheduler形成纯推理对照。",
    experiment:
      "固定同一 block-diffusion checkpoint，仅切换全局置信度、随机、PARD左到右、二维蛇形和OCR-reading-order五种采样器；在相同前向次数与提交token数下测字符顺序错误、DocVQA/TextVQA、T2I布局、真实延迟和token revision，避免重新训练带来的混杂。",
    paper: "https://arxiv.org/abs/2607.24306",
    featured: false,
    idea: true,
  },
  {
    id: "rp-opsd",
    index: "62",
    title: "RP-OPSD: Resolution-Privileged On-Policy Self-Distillation for Multimodal Large Language Models",
    shortTitle: "RP-OPSD",
    date: "2026-07-27 · 新提交",
    category: "评测诊断",
    paradigm: "Resolution-Privileged On-Policy Self-Distillation",
    state: "同一图像的 1/4 分辨率 student 视觉 token与原分辨率 teacher视觉 token",
    objective: "student on-policy trajectory 上的 teacher–student 输出分布 divergence",
    decoding: "不改变基础 MLLM 解码；teacher只在训练时使用高分辨率特权信息",
    sharing: "teacher/student共享模型族与输出词表；论文在Qwen3.5-9B上验证",
    open: "论文已公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "RP-OPSD让学生从四分之一分辨率图像生成自己的on-policy轨迹，再由读取原分辨率图像的教师沿这些轨迹提供dense token-level监督。它只需要图像—问题对，不需要外部解题轨迹、人工框或额外教师；论文报告原分辨率推理平均相对提升5.45%，训练较OPSD加速1.78×。",
    why:
      "这与Qwen3、OCR/DocVQA和视觉token预算直接相关：低分辨率不是单纯的数据增强，而可以变成可控的privileged-information gap。它能检验IBQ/merge造成的信息损失是否可被行为蒸馏补回，而不必立即提高整个训练过程的分辨率和显存。",
    inspiration:
      "可把原图teacher与IBQ下采样、Token-Shuffle或低token-budget student配对；teacher监督的不只是最终答案，还包括字符、证据引用、目标类别与坐标posterior。若蒸馏能恢复语义但无法恢复OCR，说明瓶颈可能是tokenizer已不可逆地丢失像素证据。",
    experiment:
      "固定Qwen3与总训练FLOPs，比较原分辨率SFT、低分辨率SFT、off-policy distill与RP-OPSD；student再分为原IBQ、2×2 folding和低分辨率IBQ。报告OCRBench/DocVQA/TextVQA、短时小目标召回、teacher-student KL、训练吞吐、显存和原分辨率迁移收益。",
    paper: "https://arxiv.org/abs/2607.24447",
    featured: false,
    idea: true,
  },
  {
    id: "quote-retrieve-attribution",
    index: "63",
    title: "Evidence Attribution in Visual Document Understanding without Coordinates or Region Labels",
    shortTitle: "Quote-and-Retrieve",
    date: "2026-07-27 · 新提交",
    category: "可解释性",
    paradigm: "Language-interface Evidence Attribution + GRPO",
    state: "文档图像、答案中的逐字证据引用与retriever返回的region crop",
    objective: "答案正确性 + retrieved evidence crop上的归因judge reward",
    decoding: "先输出答案与原文证据quote，再由多模态retriever/layout parser定位区域",
    sharing: "不要求MLLM直接生成坐标；回答模型与检索/布局模块通过文本证据接口协作",
    open: "论文、CiteVQA评测设定与方法细节已公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "论文指出MLLM即使答案正确，也常在坐标接口中框错证据，形成attribution hallucination。它改用quote-and-retrieve：模型逐字引用证据，retriever再定位区域。双语CiteVQA上证据召回由最高8提升到26–47，幻觉约减半；无需region label的GRPO又把8B模型严格归因准确率从22.4提高到33.8。",
    why:
      "这直接对应DocVQA、TextVQA和多帧威胁检测：让模型同时生成答案、框坐标和解释，可能把“看懂内容”与“精确定位”混成一个脆弱输出接口。换成可核验quote或帧证据ID，能更可靠地区分语义正确、坐标错误和纯粹幻觉。",
    inspiration:
      "对文档任务可要求输出最小证据字符串，再由OCR/layout检索定位；对多帧威胁任务可让模型引用帧号、目标标签和可观察属性，再由检测器检索对应crop。奖励只在检索到的证据真正支持答案时成立，从而降低事后合理化CoT。",
    experiment:
      "固定Qwen3与回答数据，比较直接bbox、文本quote、quote+retrieval和quote+GRPO；统一测答案准确率、evidence recall、hallucination、严格归因准确率与坐标误差。再做删帧/遮挡证据的反事实测试，检查模型是否真正依赖所引用区域。",
    paper: "https://arxiv.org/abs/2607.24651",
    featured: false,
    idea: true,
  },
  {
    id: "rofacto",
    index: "64",
    title: "Robot-Factored World Models via Robot Rendering",
    shortTitle: "RoFacto",
    date: "2026-07-24 · 近期新作",
    category: "世界模型",
    paradigm: "Robot-factored Action-conditioned Video Diffusion",
    state: "静态RGB/深度场景 + URDF渲染机器人几何与末端深度",
    objective: "动作条件未来视频/场景响应的diffusion denoising",
    decoding: "先由控制器与运动学展开nominal trajectory，再渲染为视觉条件并生成未来视频",
    sharing: "跨相机与机器人复用统一视觉条件接口；不要求共享LLM词表或UMM主干",
    action: "raw command → controller/kinematics nominal trajectory → rendered robot geometry",
    rollout: "支持动作编辑、未来交互视频生成与未见机器人embodiment迁移；未报告闭环规划器",
    evaluation: "DROID/RoboCasa视频预测、动作编辑可控性、接触/遮挡与zero-shot embodiment泛化",
    open: "项目页与GitHub仓库公开；README标注训练代码coming soon",
    priority: "精读",
    summary:
      "RoFacto把raw action到机器人运动的实现过程，以及机器人外观/几何，从world model内部移出。命令先通过真实控制器和运动学形成部署时可得的nominal trajectory，再用URDF渲染成相机对齐的机器人几何；模型只需学习接触后场景如何响应，并用末端与场景深度区分遮挡和真实接触。",
    why:
      "它提供了世界模型公平比较中常被忽略的控制变量：动作表示本身会决定模型难度。若一个模型输入raw action，另一个输入已泄漏未来的realized state，不能把性能差异归因于AR、Diffusion或Flow。RoFacto给出位于两者之间、部署时可用且不泄漏结果的中间接口。",
    inspiration:
      "对多帧威胁与平台运动，可先把云台/载体命令通过已知运动学渲染成预期视场变化，再让Qwen3+IBQ/URSA/ELF只预测目标和环境对该运动的残差响应。这样能把ego-motion从目标运动中剥离，并将不同平台动作映射到共享视觉语义空间。",
    experiment:
      "固定同一视频生成主干和训练数据，比较raw action vector、nominal state、rendered RGB geometry、rendered geometry+depth与泄漏realized state；统一评测action-shuffling、接触/遮挡、未见平台迁移、未来目标轨迹、horizon drift、FVD与闭环任务成功率。",
    paper: "https://arxiv.org/abs/2607.22535",
    code: "https://github.com/bjkim95/rofacto",
    codeLabel: "代码（预告）",
    featured: false,
    idea: true,
  },
  {
    id: "block-transformer",
    index: "65",
    title: "Block Transformer: Global-to-Local Language Modeling for Fast Inference",
    shortTitle: "Block Transformer",
    date: "2024-06-04 · NeurIPS 2024 基础补读",
    category: "自回归建模",
    paradigm: "Global Block AR + Local Token AR",
    state: "固定长度 block 的连续 context embedding + 原始离散 token ID",
    objective: "局部共享 vocabulary classifier / next-token CE",
    decoding: "全局按 block 自回归；块内由轻量 causal Transformer 逐 token 解码",
    sharing: "block decoder 压缩全局历史；token decoder 有独立 embedding、位置编码与共享分类器",
    open: "论文、官方训练代码和模型配置已公开",
    priority: "精读",
    summary:
      "Block Transformer把长序列分成固定 block：昂贵的全局 Transformer 每个 block 只运行一次，输出 context embedding；轻量 token decoder将该 context投影为 prefix，再在局部短序列中自回归预测原始 token。论文主设置的 block length恰好为4，与当前2×2视觉 folding完全对口。",
    why:
      "它给出了比“用一个global hidden初始化GRU”更系统的head设计：global context不仅作为初始状态，而是投影为一个或多个prefix token，让后续局部位置持续通过self-attention读取全局语义。论文还发现首位置loss主要由global decoder决定，后续位置loss更依赖local decoder，正好对应你需要分开记录TL与TR/BL/BR。",
    inspiration:
      "Stage3可将每个Qwen3 merged hidden投影成1–2个local prefix，后接2层1024维causal Transformer；训练输入为[context, GT-TL, GT-TR, GT-BL]，输出依次监督[TL,TR,BL,BR]。四个槽位共享16384-way classifier，并加入2D slot embedding。",
    experiment:
      "固定Stage2 checkpoint、X-Omni tokenizer和训练数据，对比1024-GRU、1-prefix local Transformer、2-prefix local Transformer和并行unshuffle head；报告四个slot CE、首token loss、block exact-match、完整free-running T2I、真实延迟及理解能力遗忘。",
    paper: "https://arxiv.org/abs/2406.02657",
    code: "https://github.com/itsnamgyu/block-transformer",
    featured: false,
    idea: true,
  },
  {
    id: "megabyte",
    index: "66",
    title: "MEGABYTE: Predicting Million-byte Sequences with Multiscale Transformers",
    shortTitle: "MEGABYTE",
    date: "2023-05-12 · 基础架构补读",
    category: "自回归建模",
    paradigm: "Multiscale Global-to-Local Autoregression",
    state: "固定 patch representation + patch内原始离散符号",
    objective: "原始符号 next-token CE",
    decoding: "global patch sequence AR；local model在patch内AR",
    sharing: "全局与局部Transformer分层；局部模型承担高频细节",
    open: "论文与完整架构细节公开；未见作者维护的独立官方实现",
    priority: "精读",
    summary:
      "MEGABYTE是global-to-local序列建模的经典基础：把长序列切成patch，全局模型只建模patch之间的依赖，局部模型在patch内还原原始符号。它证明压缩全局序列并不要求把多个原始ID变成一个巨大联合类别。",
    why:
      "你的2×2 merge本质上正是视觉版MEGABYTE：Qwen3负责block级语义与全局布局，轻量head负责四个X-Omni ID的局部纹理和边界。它为“局部head应有足够容量，而不是单个Linear直接输出4K类别”提供基础依据。",
    inspiration:
      "可以把Qwen3看作global model、mm_head看作local model，并分别分配计算预算。merge ratio增大时，local decoder容量也应增加；否则全局序列虽然更短，但OCR与细粒度损失会被错误归因于token merge本身。",
    experiment:
      "比较1×1、2×2、2×4三种folding，并为每种ratio扫描GRU/Transformer层数；保持总FLOPs近似一致，报告首slot与后续slot NLL、OCR、小目标、DPG/GenEval、KV-cache、局部head耗时与全局Qwen耗时。",
    paper: "https://arxiv.org/abs/2305.07185",
    featured: false,
    idea: true,
  },
  {
    id: "blt",
    index: "67",
    title: "Byte Latent Transformer: Patches Scale Better Than Tokens",
    shortTitle: "BLT",
    date: "2024-12-13 · 重要补读",
    category: "自回归建模",
    paradigm: "Entropy-based Dynamic Patching + Local Decoder",
    state: "动态长度patch latent + 原始byte token；无固定词级tokenizer",
    objective: "local decoder原始byte CE",
    decoding: "global patch AR；局部cross-attention + causal Transformer解码",
    sharing: "轻量local encoder/decoder包裹大global latent Transformer",
    open: "论文与Meta官方训练代码已公开",
    priority: "精读",
    summary:
      "BLT根据下一byte entropy动态确定patch边界：可预测区域形成更长patch，高信息区域获得更密集的全局计算；局部decoder通过cross-attention读取patch representation，再逐原始byte预测。它是DPAR背后的重要通用架构依据。",
    why:
      "它提示视觉merge不必固定为2×2。天空、墙面和大面积纹理可以更激进地合并，文字、目标边缘与小目标则应保留更小block；但公平实验必须固定每批原始信息量，而不能只固定merge后的token数。",
    inspiration:
      "对X-Omni可用Stage3 teacher-forced entropy、OCR proposal或IBQ边界强度预计算动态patch；第一版不必改变Qwen attention，可先离线确定patch map，再用local decoder还原原始ID。动态分块应禁止跨图像行，避免破坏2D邻域。",
    experiment:
      "固定平均4:1压缩率，对比fixed 2×2、entropy patch、OCR-aware patch与随机patch；同时固定原始image-code数量、训练FLOPs和图像分辨率，报告padding浪费、patch长度分布、OCR/小目标、T2I及free-running误差。",
    paper: "https://arxiv.org/abs/2412.09871",
    code: "https://github.com/facebookresearch/blt",
    featured: false,
    idea: true,
  },
  {
    id: "ssd-image-ar",
    index: "68",
    title: "SSD: Spatially Speculative Decoding Accelerates Autoregressive Image Generation",
    shortTitle: "SSD",
    date: "2026-06-18 · 近期补读",
    category: "自回归建模",
    paradigm: "2D Spatial Speculative Decoding",
    state: "AR视觉模型的hidden state与离散视觉token",
    objective: "轻量spatial draft head的hidden-state self-distillation",
    decoding: "同时草拟右侧与下方邻居，再由原AR backbone并行验证",
    sharing: "不替换原视觉tokenizer或主head；额外draft heads复用backbone hidden",
    open: "论文与算法细节公开；截至核对时未找到完整官方代码",
    priority: "精读",
    summary:
      "SSD不直接让小head在数万类codebook中精确猜ID，而是蒸馏未来位置的连续hidden state，沿水平和垂直方向同时草拟多个视觉token，再由原AR模型验证；在Janus-Pro、Lumina-mGPT与Emu3上实现最高约13.3×加速。",
    why:
      "它对当前Stage3有一个重要限定：若把并行4-ID head作为最终生成器，空间邻居的精确ID命中可能很难；但如果该head只负责draft、最终仍由Qwen3验证，就能在不牺牲原AR分布的前提下利用2D局部性。",
    inspiration:
      "当前2×2 local head可扩展成两种角色：一是SynerGen式最终decoder；二是SSD式draft head。后者可预测TR、BL等邻居的pre-RMSNorm hidden，再用主干一次验证整个2×2块，适合在生成质量稳定后单独优化推理速度。",
    experiment:
      "在同一Stage3模型上比较直接并行ID、局部AR最终head与hidden-state draft+Qwen验证；报告draft acceptance、horizontal/vertical命中率、回滚率、真实wall time、DPG/GenEval、OCR文字顺序及每张图Qwen参数加载次数。",
    paper: "https://arxiv.org/abs/2606.20543",
    featured: false,
    idea: true,
  },
  {
    id: "tree-structured-dlm",
    index: "69",
    title: "Rethinking Token Prediction: Tree-Structured Diffusion Language Model",
    shortTitle: "Tree-DLM",
    date: "2026-04-04 · 重要补读",
    category: "离散 Diffusion",
    paradigm: "Hierarchical Vocabulary Diffusion",
    state: "由recursive K-means构造的token祖先节点与最终leaf ID",
    objective: "逐层children prediction，替代完整V-way softmax",
    decoding: "沿词表树从粗簇到细ID迭代恢复",
    sharing: "主干不变；大词表head替换为小branching-factor classifier",
    open: "论文与完整推导公开；截至核对时未见官方代码",
    priority: "精读",
    summary:
      "Tree-DLM把一次完整词表分类分解成沿词表树的多次children prediction，使输出维度从V降到branching factor K。论文在语言扩散上报告峰值显存约减半，同时保持接近的困惑度。",
    why:
      "你的16384类X-Omni head尚可训练，但未来若换成64K/128K IBQ，四个槽位的logits activation与分类矩阵会迅速成为显存瓶颈。视觉codebook天然有embedding距离，可直接用IBQ/DINO语义做层次聚类，而不是随机树。",
    inspiration:
      "可先不改URSA前向过程，只把flat visual head替换为两级cluster→code预测：例如256个粗簇，每簇约64个code。对Stage3 local decoder，同一个slot先预测cluster，再在有效子集预测原始ID，避免Linear(4096,4K)式参数爆炸。",
    experiment:
      "固定Qwen3、IBQ和local decoder，对比flat 16K head、两级欧氏codebook tree、DINO语义tree与product quantization；报告参数、logits activation显存、吞吐、exact-ID/top-k、近邻视觉误差、重建、OCR与T2I。先确认层次head没有把相似但文字不同的code过度聚类。",
    paper: "https://arxiv.org/abs/2604.03537",
    featured: false,
    idea: true,
  },
  {
    id: "umm-one-space",
    index: "70",
    title: "Do Unified Multimodal Models Think in One Space? A Lens Through Cross-Branch Steering",
    shortTitle: "UMM One Space?",
    date: "2026-07-29 · 新提交",
    category: "可解释性",
    paradigm: "Cross-branch Causal Steering for UMM",
    state: "理解分支文本 hidden 与生成分支视觉 latent 的语义方向",
    objective: "无需修改生成目标；通过跨分支激活干预检验语义可迁移性",
    decoding: "理解向量注入生成轨迹，或生成向量反向注入理解分支",
    sharing: "共享架构不等于共享语义；理解→生成迁移明显强于生成→理解",
    open: "论文与实验协议公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "论文提出cross-branch semantic steering：从理解分支提取语义方向并注入生成分支，能够控制图像语义并提高faithfulness；反向把生成方向迁入理解分支则效果有限。作者认为理解表征更偏对象与概念，而生成表征仍以外观和低层细节为主。",
    why:
      "这直接检验URSA、X-Omni或未来ELF改造是否只是结构上共享Qwen3，还是理解与生成真的共享可因果迁移的语义。仅看同一Transformer、同一tokenizer或CKA相似度，无法证明两个任务使用了同一组有功能作用的方向。",
    inspiration:
      "可分别从DocVQA/TextVQA理解轨迹、T2I离散ID轨迹和ELF连续velocity轨迹提取“文字、数量、颜色、目标类别”等方向；测试理解方向能否改变生成，生成方向能否改变VQA答案，并比较原始IBQ、TokLIP语义化IBQ与ELF。",
    experiment:
      "固定Qwen3、IBQ、数据与checkpoint，在相同层和token位置做双向steering；报告生成概念命中、VQA变化率、OCR字符保持、干预强度曲线和随机方向对照。若理解→生成有效而生成→理解失效，应优先做生成latent语义对齐，而不是继续扩大共享head。",
    paper: "https://arxiv.org/abs/2607.26411",
    featured: false,
    idea: true,
  },
  {
    id: "medarc",
    index: "71",
    title: "MedARC: Training-Free Adaptive Redundancy Compression of Visual Tokens for 3D Medical Vision-Language Models",
    shortTitle: "MedARC",
    date: "2026-07-29 · 新提交",
    category: "评测诊断",
    paradigm: "Multi-cue Saliency-aware Token Merging",
    state: "视觉encoder token、文本查询投影与视觉基础模型局部feature",
    objective: "训练免费；融合attention、query relevance与结构离群度计算保留/合并权重",
    decoding: "先保留高重要性token，再把冗余token合并到代表token；下游解码方式不变",
    sharing: "不修改LLM与输出head；只改变进入主干的视觉token预算",
    open: "论文与算法细节公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "MedARC针对超长3D视觉序列，用三种互补信号决定token是否可合并：模型自身attention、视觉token与问题文本的相关性、以及局部基础模型feature相对全局中心的结构独特性。它不是简单丢弃低分token，而是将冗余信息合并到保留token中。",
    why:
      "它为当前2×2固定folding提供了更安全的对照：固定merge可能恰好把文字、小目标或关键帧与背景平均掉。MedARC说明压缩率相同并不代表信息损失相同，OCR和威胁目标需要由query与结构信号共同保护。",
    inspiration:
      "在Qwen3+IBQ中可将attention替换为Stage2视觉注意力，将query relevance定义为IBQ projector与问题token相似度，将结构离群度定义为DINO/SigLIP局部feature偏差；高分位置保持1×1，背景使用2×2 folding，并继续由Stage3 local head恢复原ID。",
    experiment:
      "固定平均4:1压缩率，对比固定2×2、随机merge、attention-only、query-only和三信号merge；报告OCRBench、DocVQA、TextVQA、小目标召回、短时关键帧召回、原ID重建率、真实吞吐和动态padding开销。",
    paper: "https://arxiv.org/abs/2607.26554",
    featured: false,
    idea: true,
  },
  {
    id: "see2think",
    index: "72",
    title: "See2Think: Do Multimodal Models Really Use Intermediate Visual States?",
    shortTitle: "See2Think",
    date: "2026-07-29 · 新提交",
    category: "可解释性",
    paradigm: "Visual Action-of-Thought Process Evaluation",
    state: "文本思考、视觉操作、渲染后的中间图像与后续推理轨迹",
    objective: "评测框架；通过受控反馈与corruption检验中间视觉状态的实际因果作用",
    decoding: "在四种推理设置中生成/接收中间视觉状态，再继续推理",
    sharing: "区分选择了正确视觉操作、正确渲染和真正利用反馈三个阶段",
    open: "论文、1200题评测设计与VAoT协议公开；截至核对时未见官方代码入口",
    priority: "精读",
    summary:
      "See2Think发现MLLM通常能选对视觉操作，但中间图像的忠实渲染仍是主要瓶颈；模型看似吸收视觉反馈，也不保证最终准确率提升。对任务相关的中间视觉状态进行受控破坏后，准确率下降超过10个百分点，说明部分模型确实依赖这些状态。",
    why:
      "你的多帧威胁链条包含目标识别、威胁分析和决策，前序JSON或可视化结果就是中间状态。只检查最终决策无法判断模型是否真正利用识别证据，还是在收到中间结果后继续依赖语言先验。",
    inspiration:
      "可把YOLO框、关键帧、目标轨迹图和Stage3重建图视为visual state，分别做正确、删除、错位和语义保持但像素扰动的反馈；观察威胁排序、坐标与决策是否发生符合因果预期的变化。",
    experiment:
      "建立四阶段日志：视觉操作选择、状态渲染质量、反馈读取率、最终答案；比较原图、正确中间图、损坏中间图与文本化中间状态。指标增加feedback intervention gap、证据引用准确率和错误从识别到决策的传播率。",
    paper: "https://arxiv.org/abs/2607.26769",
    featured: false,
    idea: true,
  },
  {
    id: "actswm",
    index: "73",
    title: "ActSWM: Action-Sensitive World Models for Long-Horizon Planning in Open-World Games",
    shortTitle: "ActSWM",
    date: "2026-07-29 · 新提交",
    category: "世界模型",
    paradigm: "Action-sensitive Autoregressive Latent World Model",
    state: "游戏观测的连续latent rollout",
    objective: "next latent预测 + transition separation / action recoverability约束",
    decoding: "给定候选动作序列做长时latent AR rollout，并以receding horizon重规划",
    sharing: "世界模型latent可接UMM hidden；重点约束不同动作未来不能塌缩成同一路径",
    action: "真实或离线恢复的局部游戏action",
    rollout: "支持长时开放环latent rollout、Minecraft闭环规划和跨游戏动作恢复",
    evaluation: "step drift、alternative-action rollout gap、action recovery与闭环任务成功率",
    open: "论文与完整方法公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "ActSWM指出一种容易被平均预测指标掩盖的Context Collapse：世界模型预测的未来与真实未来相似，但面对不同动作仍生成几乎相同的latent轨迹。它用transition separation原则保持候选动作未来可区分，并要求局部transition可恢复其动作。",
    why:
      "这对URSA/ELF世界模型至关重要：高IBQ token accuracy、低embedding MSE或低velocity loss，不等于模型学到了动作因果性。若不同云台、平台或处置动作得到相似未来，模型无法用于规划，即使生成视频很好看。",
    inspiration:
      "在Qwen3+IBQ中可对同一历史配不同候选动作，约束未来IBQ posterior或ELF latent保持足够距离；同时训练action recovery head。对多帧威胁任务，可把视角变化、跟踪、遮挡和目标运动作为可控action/state delta。",
    experiment:
      "固定历史观测，做真实动作、shuffle动作、相反动作和零动作四组rollout；除next-token CE/MSE外，报告action-conditioned separation、动作恢复、horizon drift和闭环追踪/决策成功率。对比IBQ-AR、URSA metric dynamics与ELF velocity。",
    paper: "https://arxiv.org/abs/2607.26712",
    featured: false,
    idea: true,
  },
  {
    id: "cg-world",
    index: "74",
    title: "CG-World: A Large-Scale World-State Dataset and Protocol for World Models",
    shortTitle: "CG-World",
    date: "2026-07-29 · 新提交",
    category: "世界模型",
    paradigm: "Structured World-state and Counterfactual Data Protocol",
    state: "语义、空间、骨骼、控制器、相机、光照、物理cache、接触事件与多通道渲染",
    objective: "多任务监督：条件视频生成、action prediction、事件/关系预测与策略迁移",
    decoding: "支持事实轨迹及观测、动作、机制干预后的成对分支预测",
    sharing: "为UMM统一理解—生成—预测—行动提供显式state/event/action接口，而非只给RGB视频",
    action: "控制器状态、动作干预与机制干预，包含明确不变量和替代结果",
    rollout: "1–5秒对齐片段；支持counterfactual branch与闭环VLA迁移评测",
    evaluation: "几何条件生成、action prediction、干预一致性、反事实与闭环策略迁移",
    open: "论文声明CG-World v1约85万片段并计划持续扩展；当前论文页未见明确下载仓库",
    priority: "精读",
    summary:
      "CG-World利用工业CG生产管线记录传统视频数据没有的完整中间状态，并为同一场景构造事实轨迹、观测干预、动作干预、机制干预和严格反事实分支。每个分支显式记录干预目标、应保持的不变量和替代结果。",
    why:
      "它给出了比“下一帧预测数据集”更适合世界模型的监督定义。你的模型如果只看多帧RGB，很难区分相机运动、目标运动、遮挡与真实状态变化；也无法判断错误来自视觉tokenizer还是动力学。",
    inspiration:
      "可为多帧威胁数据增加轻量world-state schema：目标ID、位置、可见性、相机/载体状态、事件和决策action；再构造删目标、换动作、保持背景不变等反事实分支，让URSA/ELF不仅预测未来图像，还预测哪些状态应变、哪些应保持。",
    experiment:
      "固定相同视频，建立RGB-only、RGB+state、RGB+state+event和counterfactual四种训练；比较未来IBQ/latent、目标持续性、action sensitivity、反事实不变量、horizon drift与闭环成功。单独报告tokenizer reconstruction、静态生成和动力学三类误差。",
    paper: "https://arxiv.org/abs/2607.26452",
    featured: false,
    idea: true,
  },
  {
    id: "phizero",
    index: "75",
    title: "PhiZero: A World Model Built Around Physical Language",
    shortTitle: "PhiZero",
    date: "2026-07-30 · 新提交",
    category: "世界模型",
    paradigm: "Discrete Physical Language + AR Reason-then-Render",
    state: "相邻视频latent transition经Q-Former与FSQ压缩成离散物理语言",
    objective: "AR预测25K扩展词表中的transition symbols；diffusion decoder渲染未来视频",
    decoding: "先顺序生成物理语言，再以首帧条件的扩散解码器并行渲染",
    sharing: "Qwen3-VL-4B初始化reasoner；离散动力学接口与视频VAE/decoder分工",
    action: "文本动作意图或由示范视频提取的物理语言",
    rollout: "支持交互式rollout、动作条件模拟与零样本跨外观/具身迁移",
    evaluation: "物理一致性、理解、动作可控性、token压缩率与迁移",
    open: "论文与项目页公开；项目页标注代码即将发布",
    priority: "精读",
    summary:
      "PhiZero不直接让大模型预测稠密未来像素，而是把相邻视频状态变化压缩成离散“物理语言”。Qwen3-VL-4B初始化的AR reasoner先预测transition symbols，再由Wan2.2 VAE与扩散decoder渲染未来；4秒33帧视频仅使用256个离散符号，对比稠密VAE的44800个连续token。",
    why:
      "这是目前与你Qwen3+IBQ路线最接近的世界模型范式：离散token不再描述静态图像外观，而是描述“状态如何变化”。它把静态UMM的理解—生成接口自然扩展为理解—预测—渲染，也避免要求Qwen逐个生成所有未来帧IBQ ID。",
    inspiration:
      "可在现有2×2 Stage3之外增加transition tokenizer：输入相邻帧IBQ或Qwen hidden，量化成少量state-delta IDs；Qwen3预测这些IDs，现有IBQ/ELF生成器负责恢复未来帧。这样可比较“直接预测未来IBQ”与“先预测离散动力学再渲染”。",
    experiment:
      "固定Qwen3、视频片段、IBQ decoder与训练FLOPs，对比未来IBQ-AR、URSA metric dynamics、ELF velocity和PhiZero式transition IDs；报告token数、下一状态准确率、动作shuffle敏感性、目标轨迹误差、horizon drift、OCR/小目标保真及闭环威胁判断。",
    paper: "https://arxiv.org/abs/2607.28624",
    code: "https://phi-zero.github.io/",
    codeLabel: "项目页",
    featured: true,
    idea: true,
  },
  {
    id: "vad-opd",
    index: "76",
    title: "VAD: Attributing Visual Evidence for Target Reconstruction in Multimodal On-Policy Distillation",
    shortTitle: "VAD",
    date: "2026-07-30 · 新提交",
    category: "可解释性",
    paradigm: "Counterfactual Visual Attribution Distillation",
    state: "同一student prefix下的完整图、证据crop与证据退化crop",
    objective: "将teacher correction投影到视觉干预引起的signed log-prob方向，重建student-anchored target",
    decoding: "学生on-policy rollout；固定teacher在证据存在/移除条件下提供反事实分布",
    sharing: "不改变模型生成范式；改变视觉后训练target的来源与归因",
    open: "训练、数据构造、评测代码及Qwen3.5 4B/9B权重已公开",
    priority: "精读",
    summary:
      "VAD认为teacher给出的next-token修正混合了视觉证据、语言先验和teacher自身偏好。它固定同一teacher与student prefix，只移除相关视觉证据，用centered log-prob变化估计视觉证据方向，再保留原修正中与该方向一致的部分。",
    why:
      "这直接对应你当前“模型是否真的看图”的诊断。普通SFT/GRPO或privileged crop teacher可能只是把更强语言答案蒸馏给学生，不能证明改进来自文字、小目标或坐标证据；VAD提供了token级的反事实分离方法。",
    inspiration:
      "可为DocVQA/OCRBench构造原图、清晰文字crop、模糊/遮挡crop三视图；为多帧威胁任务构造完整帧、目标证据帧和删除目标帧。只蒸馏随证据干预发生稳定变化的logit方向，避免错误类别先验覆盖视觉信号。",
    experiment:
      "固定Qwen3+IBQ checkpoint，对比普通SFT、完整teacher KL、visual-advantage weighting与VAD target reconstruction；报告ANLS/OCRBench、目标召回、证据删除前后logit gap、视觉归因比例、语言先验错误率和on-policy训练稳定性。",
    paper: "https://arxiv.org/abs/2607.28590",
    code: "https://github.com/DeepExperience/VAD_Multimodal_OPD",
    featured: true,
    idea: true,
  },
  {
    id: "trend-aware-pruning",
    index: "77",
    title: "Capturing Token Tendencies for Training-Free Token Pruning in Multimodal Large Language Models",
    shortTitle: "Trend-aware Pruning",
    date: "2026-07-30 · 新提交",
    category: "评测诊断",
    paradigm: "Reversible Layer-wise Visual Token Pruning",
    state: "视觉token跨Transformer层的attention-flow轨迹与趋势",
    objective: "训练免费；根据重要性动量重新激活late-blooming token",
    decoding: "逐层动态保留、暂时裁剪和重新激活视觉token",
    sharing: "不改变视觉tokenizer和输出head；改变不同层实际参与计算的token集合",
    open: "论文与方法公开；截至核对时未见官方代码仓库",
    priority: "精读",
    summary:
      "该工作指出一次性、不可逆的早层token pruning会误删在深层推理中才变重要的视觉证据。方法跟踪attention flow的跨层趋势，并允许 initially low-score但重要性持续上升的late-blooming token重新进入计算。",
    why:
      "MedARC解决输入前怎么merge，这篇则提醒：视觉token的重要性随Qwen层数和任务阶段变化。OCR字符、小目标或某一关键帧可能在浅层不显著，却在回答生成或威胁比较阶段才被调用，固定2×2 folding无法恢复已丢失的信息。",
    inspiration:
      "当前Stage3可把空间merge与层间动态路由分开：输入仍固定2×2以兼容batch，保存四个原ID/局部摘要；当某个merged token的重要性斜率升高时，在深层追加local residual或恢复其1×1子token表示。",
    experiment:
      "固定平均视觉FLOPs，对比固定2×2、一次性attention pruning、MedARC输入merge和trend-aware可逆路由；按层记录token存活率、重新激活率、OCR字符区域覆盖、小目标覆盖、准确率、吞吐和KV/activation显存。",
    paper: "https://arxiv.org/abs/2607.28341",
    featured: true,
    idea: true,
  },
  {
    id: "geneva-evidence",
    index: "78",
    title: "Beyond Frame Selection: Generative Latent Evidence Aggregation for Long-Video Understanding",
    shortTitle: "GenEvA",
    date: "2026-07-30 · 新提交",
    category: "多帧推理",
    paradigm: "Query-conditioned Generative Latent Evidence",
    state: "选中帧的frame-specific token与紧凑跨帧latent evidence",
    objective: "学习query-conditioned evidence distribution并生成跨帧互补latent",
    decoding: "先选帧，再按任务需要自适应插入跨帧latent complement",
    sharing: "复用Video-MLLM backbone；仅增加0.11%–0.40%平均video-token开销",
    open: "论文与完整实验公开；截至核对时未见官方代码入口",
    priority: "精读",
    summary:
      "GenEvA指出选到相关帧不等于整合了跨帧互补证据。它在frame selection之后，用query-conditioned distribution将各帧特有信息聚合成少量latent evidence，并只在任务确实需要跨帧整合时调用。",
    why:
      "你的多帧威胁检测不仅需要找到目标出现的帧，还要整合持续时间、移动趋势、遮挡恢复和跨帧类别一致性。随机三帧或简单top-k即使覆盖目标，也可能无法形成可供最终威胁排序使用的统一状态。",
    inspiration:
      "可把每帧目标列表、IBQ/Qwen visual hidden和YOLO uncertainty聚合成一个query-specific evidence token，插在威胁分析智能体前；静态单帧问题则跳过，避免所有样本都增加视觉长度。",
    experiment:
      "固定总视觉token预算，对比随机/均匀/top-k帧、仅选帧、mean pooling与GenEvA latent；报告短时目标召回、跨帧ID一致性、轨迹/意图判断、证据引用、删帧反事实、token开销和延迟。",
    paper: "https://arxiv.org/abs/2607.28516",
    featured: true,
    idea: true,
  },
  {
    id: "shadowdancer",
    index: "79",
    title: "ShadowDancer: Teaching Video World Models Any Action by Learning Unified Dynamics Representations from a Video and Its Shadow",
    shortTitle: "ShadowDancer",
    date: "2026-07-30 · 新提交",
    category: "世界模型",
    paradigm: "Block-causal World Model + Appearance-invariant Latent Action",
    state: "同一动力学、不同外观的shadow-pair视频表示",
    objective: "cross-shadow prediction，丢弃变化外观并保留可迁移动力学",
    decoding: "示范视频编码为统一动作表示，再驱动新场景block-causal rollout",
    sharing: "动作latent可作为UMM/视频生成器的条件接口，不要求人工action label",
    action: "由示范视频对自监督提取的frame-level latent action",
    rollout: "支持长动作rollout、任意示范动作复用与跨环境迁移",
    evaluation: "动作迁移、长时rollout、外观不变性与盲测偏好",
    open: "论文与项目演示公开；截至核对时未见完整官方代码仓库",
    priority: "精读",
    summary:
      "ShadowDancer构造执行同一动力学但外观独立重采样的shadow pairs，并让模型用一个shadow预测另一个。训练目标迫使表示舍弃外观差异、保留共同的动作动力学，再用该表示控制block-causal视频世界模型。",
    why:
      "它解决了多帧数据中“目标长什么样”和“目标怎么运动”纠缠的问题。若直接用IBQ或VAE latent学习未来，模型容易把车辆颜色、背景纹理当成动作；shadow-pair思想可为URSA/ELF提供更纯的动态条件。",
    inspiration:
      "可利用仿真或生成数据，把同一目标轨迹渲染到不同背景、类别外观和光照中，训练一个appearance-invariant dynamics code；再分别作为未来IBQ-AR、URSA metric path和ELF velocity的条件。",
    experiment:
      "固定动作轨迹构造同动力学异外观pair与同外观异动力学pair；比较raw frame condition、光流、latent action与shadow dynamics code，报告跨场景轨迹迁移、动作识别、背景泄漏probe、rollout horizon和闭环决策。",
    paper: "https://arxiv.org/abs/2607.28362",
    code: "https://shadowdancer-1.github.io/",
    codeLabel: "项目页",
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
          <a href="#folding-matrix">Token Folding</a>
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
        <strong>DAILY BRIEF · 2026.07.31</strong>
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
              <p className="eyebrow">[UMM RADAR · ISSUE 019]</p>
              <h1>从静态视觉 Token，<br />走向可解释的状态变化语言</h1>
              <p className="hero-copy">今日五项新作把三个问题连成一条实验链：用离散物理语言压缩未来变化、用反事实归因确认监督真正来自视觉证据，并让Token压缩与跨帧聚合保留后期才显现的关键线索。重点连接Qwen3+IBQ Stage3、URSA/ELF世界动力学与多帧威胁分析。</p>
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
                <div><b>79</b><span>精选条目</span></div>
                <div><b>05</b><span>研究方向</span></div>
                <div><b>03</b><span>比较矩阵</span></div>
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
                  <tr><th>URSA</th><td>原始 IBQ 网格的离散 token ID；无额外 merge</td><td>每位置 64K clean-token CE</td><td>全 H×W 网格并行迭代</td><td>Metric path、schedule、solver；勿与仓库中的连续 DiT 混淆</td></tr>
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
                  <tr><th>Context-weighted DFM</th><td>离散 token / CTMC</td><td>Context-scaled clean-token CE</td><td>任意顺序加权采样</td><td>局部信息密度、难 token 梯度与恢复顺序</td></tr>
                  <tr><th>ReMo</th><td>音视频 embedding + 文本代理</td><td>无需训练；跨模态冗余选择</td><td>保持原模型解码</td><td>token 独特性、OCR 保护与压缩率</td></tr>
                  <tr><th>Fast-dVLM</th><td>视觉特征 + 离散文本 token</td><td>Block masked clean-token CE</td><td>块间 causal / 块内并行</td><td>AR 对齐保留、block size、KV cache 与真实延迟</td></tr>
                  <tr><th>MaskGIT</th><td>VQ 离散视觉 token ID</td><td>随机 masked clean-token CE</td><td>全局并行迭代 + 置信度提交</td><td>single mask、scheduler、双向 refinement</td></tr>
                  <tr><th>VAR</th><td>多尺度 VQ token maps</td><td>Next-scale token-map CE</td><td>尺度间 AR / 尺度内并行</td><td>生成顺序与 tokenizer 多尺度结构的混杂</td></tr>
                  <tr><th>LlamaGen</th><td>VQ 离散视觉 token ID</td><td>Raster-scan next-token CE</td><td>从左到右、从上到下 AR</td><td>累计误差、KV Cache、tokenizer 上限与真实延迟</td></tr>
                  <tr><th>Show-o</th><td>文本ID + MAGVIT-v2离散视觉token</td><td>文本next-token CE + 图像masked CE</td><td>文本AR / 图像并行迭代</td><td>共享主干与异构生成目标是否优于统一概率过程</td></tr>
                  <tr><th>Fluid</th><td>连续视觉token</td><td>单token diffusion noise</td><td>random-order外层 + diffusion内层</td><td>状态、位置顺序和局部条件分布三者解耦</td></tr>
                  <tr><th>dRAE</th><td>高维语义feature → HSQ离散ID</td><td>cosine codebook + commitment + 重建</td><td>tokenizer本身无固定生成顺序</td><td>球面语义方向、幅值重建信息与codebook利用率</td></tr>
                  <tr><th>Native-MM Scaling</th><td>连续patch embedding + 文本ID</td><td>文本next-token loss</td><td>decoder-only causal预训练</td><td>encoder-free输入、数据配比与compute-optimal预算</td></tr>
                  <tr><th>InnoText</th><td>VAE latent + glyph/mask/size map</td><td>尺寸/区域加权Flow velocity</td><td>连续latent ODE</td><td>小字信息密度、中文笔画与局部/全局监督分配</td></tr>
                  <tr><th>Token-Shuffle</th><td>固定 s×s 离散 token folding</td><td>Unshuffle 后 s² 个共享 K-way CE</td><td>组间 AR / 组内并行</td><td>序列压缩率、组内独立假设与 OCR 损失</td></tr>
                  <tr><th>SynerGen-VL</th><td>folded 离散 VQ token</td><td>局部 causal head 还原原始 IDs</td><td>全局 AR / 块内 AR</td><td>全局—局部计算分工与 encoder-free 统一</td></tr>
                  <tr><th>DPAR</th><td>熵引导可变长 patch</td><td>local decoder 原始 ID CE</td><td>动态 patch AR / token AR</td><td>信息量自适应、边界稳定与真实加速</td></tr>
                  <tr><th>ImageFolder</th><td>同位置 semantic + detail IDs</td><td>两组独立 K-way CE</td><td>位置间 AR / 双 code 并行</td><td>语义—细节分工与独立性假设</td></tr>
                  <tr><th>UNIFUSION</th><td>uniform kernel离散token ID；所有位置可编辑</td><td>统一reverse-rate KL，经x₀转换为score/posterior/jump rate</td><td>全序列16–256步迭代</td><td>从同一AR checkpoint公平切换mask、uniform与URSA metric kernel</td></tr>
                  <tr><th>PARD</th><td>block masked离散token</td><td>沿用原clean-token分布；training-free</td><td>左到右结构 + 每轮并行提交</td><td>把训练kernel与推理生成顺序拆成两个控制变量</td></tr>
                  <tr><th>Block Transformer</th><td>block context embedding + 原始离散ID</td><td>local shared-vocabulary next-token CE</td><td>block间AR / block内AR</td><td>global hidden作为prefix；首slot与后续slot容量分工</td></tr>
                  <tr><th>MEGABYTE</th><td>固定patch latent + 原始离散符号</td><td>local next-token CE</td><td>global patch AR / local token AR</td><td>merge ratio与local decoder容量共同扫描</td></tr>
                  <tr><th>BLT</th><td>entropy动态patch + 原始byte</td><td>local decoder原始byte CE</td><td>global patch AR / local token AR</td><td>按信息密度分配全局计算；固定原始信息预算</td></tr>
                  <tr><th>SSD</th><td>视觉AR hidden + 原始离散token</td><td>邻居hidden-state self-distillation</td><td>二维并行draft + 原主干验证</td><td>最终head与draft head角色必须区分</td></tr>
                  <tr><th>Tree-DLM</th><td>层次词表祖先节点 → leaf ID</td><td>逐层children prediction</td><td>从粗簇到细ID迭代</td><td>大视觉词表head参数与logits显存</td></tr>
                  <tr><th>MedARC</th><td>encoder token + query / structure saliency</td><td>training-free merge；下游目标不变</td><td>高价值token保留、冗余token合并</td><td>固定压缩率下保护OCR、小目标与查询相关证据</td></tr>
                  <tr><th>PhiZero</th><td>FSQ离散transition symbols</td><td>Qwen3-VL AR预测25K物理语言 + diffusion渲染</td><td>reason-then-render；256 symbols/4秒视频</td><td>把静态image token与动态state-delta token分开公平比较</td></tr>
                  <tr><th>Trend-aware</th><td>跨层attention-flow趋势 + 可恢复token</td><td>training-free动态裁剪/重新激活</td><td>逐层可逆路由</td><td>固定FLOPs下保护后期才重要的OCR与小目标证据</td></tr>
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

          <section className="folding-section" id="folding-matrix">
            <div className="section-heading">
              <div><p className="eyebrow">DISCRETE TOKEN FOLDING</p><h2>离散 image-token 合并后，head 到底预测什么？</h2></div>
              <p>区分“Transformer 序列压缩”与“tokenizer 空间下采样”</p>
            </div>
            <div className="audit-callout">
              <strong>URSA 代码结论</strong>
              <p><code>diffusion_transformer.py</code> 是连续 latent 的 DiT：<code>patch_size=2</code> 时 head 输出 <code>4 × image_dim</code> 个连续值，按左上→右上→左下→右下还原 2×2 patch；它不预测四个离散 ID。离散 URSA 主干是 <code>transformer_ursa.py</code> 的 Qwen3 + 64K visual head，对原始 IBQ 网格每个位置预测一个 ID 分布，当前实现没有额外 token merge。</p>
            </div>
            <div className="audit-callout">
              <strong>Stage 3 推荐</strong>
              <p>2×2 merge只压缩Qwen3处理的全局位置，不产生新的“merged ID”。把原始目标整理为<code>[B, M, 4]</code>，使用<code>&lt;boi&gt;/前一block hidden</code>预测下一block；局部概率按<code>TL → TR → BL → BR</code>因果分解，四个槽位共享16384-way classifier。必须确保<code>hᵢ → blockᵢ₊₁</code>，否则当前block的GT merge embedding会泄漏到预测中。</p>
            </div>
            <p className="scroll-hint">移动端可横向滑动查看完整 head 与块内顺序 →</p>
            <div className="matrix-wrap">
              <table className="folding-table">
                <thead><tr><th>路线</th><th>如何压缩</th><th>全局 Transformer 长度</th><th>输出 head</th><th>块内预测顺序</th><th>对 URSA 的意义</th></tr></thead>
                <tbody>
                  <tr><th>原始 URSA</th><td>仅 IBQ/VAE 空间下采样；无额外 merge</td><td>N = H<sub>z</sub>×W<sub>z</sub></td><td>每位置共享 K-way visual head</td><td>每个 diffusion step 全局并行 refinement</td><td>公平 no-merge 基线</td></tr>
                  <tr><th>Token-Shuffle</th><td>固定相邻 s×s embedding 沿通道拼接</td><td>N/s²</td><td>unshuffle 成 s² 个槽位，再共享 K-way head</td><td>组间 AR；组内 s² 个 ID 并行</td><td>最小改动、最快；重点检查 OCR/小目标</td></tr>
                  <tr><th>SynerGen-VL</th><td>固定局部 token folding</td><td>N/q</td><td>浅层 causal visual head 预测原始 K-way IDs</td><td>组间 AR；块内按原 raster 顺序 AR</td><td>保留局部依赖，最适合 Qwen3+IBQ 统一模型</td></tr>
                  <tr><th>DPAR</th><td>按 next-token entropy 动态合并连续 token</td><td>M，逐图可变且 M&lt;N</td><td>patch state 复制到 token state，local causal decoder + K-way head</td><td>global patch AR；local token AR</td><td>高信息区域保细粒度，但不易直接套入动态 diffusion step</td></tr>
                  <tr><th>ImageFolder</th><td>同一空间位置折叠 semantic/detail 两个 code</td><td>空间位置数 N</td><td>2K logits reshape 为两组 K-way softmax</td><td>位置间 AR；同位置两路并行</td><td>不牺牲空间分辨率，适合语义—重建双 codebook</td></tr>
                  <tr><th>Block Transformer</th><td>固定4-token block压缩成context embedding</td><td>N/4</td><td>context投影为prefix；local causal Transformer + 共享K-way head</td><td>block间AR；块内原始ID AR</td><td>最直接支持2×2 Stage3 local Transformer head</td></tr>
                  <tr><th>MEGABYTE</th><td>固定长度patch，由global/local两级模型处理</td><td>N/q</td><td>local submodel预测原始符号</td><td>patch间AR；patch内AR</td><td>证明不需要构造K⁴联合merged ID</td></tr>
                  <tr><th>BLT</th><td>按局部entropy形成动态长度patch</td><td>M，取决于信息密度</td><td>cross-attention local decoder + 原始ID head</td><td>patch间AR；patch内AR</td><td>为OCR-aware / boundary-aware动态merge提供基础</td></tr>
                  <tr><th>SSD</th><td>不改变主序列；额外预测二维邻居hidden</td><td>保持N，但减少串行主干调用</td><td>轻量draft heads + 原AR head验证</td><td>水平/垂直并行draft与验证</td><td>适合把2×2 head改成加速器而非最终生成器</td></tr>
                  <tr><th>Tree-DLM</th><td>不做空间merge；对视觉词表层次聚类</td><td>位置数不变</td><td>小K children classifier逐层定位leaf ID</td><td>词表内coarse-to-fine</td><td>解决64K/128K视觉head与logits显存瓶颈</td></tr>
                  <tr><th>MedARC</th><td>attention、query relevance与结构独特性联合决定merge</td><td>预算可固定为N/4</td><td>不改原head；合并后的token送入既有主干</td><td>无新增生成顺序</td><td>为固定2×2 folding提供OCR-aware动态对照</td></tr>
                  <tr><th>Trend-aware Pruning</th><td>按跨层重要性趋势暂存或恢复token</td><td>逐层变化；固定平均FLOPs</td><td>不改原head；late-blooming token可重新激活</td><td>层间动态路由</td><td>补足输入前merge不可逆的缺陷</td></tr>
                </tbody>
              </table>
            </div>
            <div className="matrix-metrics">
              {[
                ["准确性", "Original-ID CE · Block error"],
                ["细粒度", "OCR · Small objects · Boundaries"],
                ["效率", "Sequence length · FLOPs · Memory"],
                ["公平性", "Same IBQ · Qwen3 · Data · Budget"],
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
                  <tr><th>WorldWeaver</th><td>视频 latent + world / agent registers</td><td>当前动作 + 个体/全局状态</td><td>下一视频块 + 可监督世界状态</td><td>Streaming AR diffusion + MoT</td><td>双智能体长时同步 rollout</td><td>在 UMM 生成器之外增加可持续、可检查的状态记忆</td></tr>
                  <tr><th>Structured Dynamics</th><td>冻结 ViT feature + 两类 motion token</td><td>隐式局部运动变换</td><td>future feature / primary-residual 分解</td><td>JEPA 式预测表征</td><td>短期 latent 外推；长时会漂移</td><td>复用理解特征，低成本补充相机/目标动力学</td></tr>
                  <tr><th>V-JEPA 2-AC</th><td>视频语义 embedding</td><td>真实连续动作 + goal image</td><td>action-conditioned next representation</td><td>JEPA + block-causal AR predictor</td><td>latent rollout + MPC；真实机器人零样本规划</td><td>理解 encoder 可对齐 LLM；动力学复用语义空间而不生成像素</td></tr>
                  <tr><th>Genie</th><td>时空离散视频token</td><td>无标注视频推断的latent action</td><td>下一帧离散token</td><td>帧间AR + 帧内MaskGIT</td><td>逐帧闭环交互与latent-action控制</td><td>可将IBQ/URSA扩展为离散交互环境，但模块不共享LLM</td></tr>
                  <tr><th>DIAMOND</th><td>像素图像 + 历史帧</td><td>真实离散action</td><td>下一帧像素denoising</td><td>帧间AR + 3-step EDM</td><td>闭环RL imagination与可玩模拟器</td><td>像素细节上限对照；可与IBQ局部residual混合</td></tr>
                  <tr><th>DreamerV3</th><td>categorical latent + recurrent state</td><td>真实离散/连续action</td><td>next latent + reward + continuation</td><td>RSSM latent dynamics</td><td>长时latent imagination + actor-critic</td><td>以闭环成功而非视频画质检验UMM世界模型价值</td></tr>
                  <tr><th>Koopman Dreamer</th><td>谱结构确定性latent + stochastic state</td><td>连续action + 双线性state-action</td><td>一步/多步latent、observation与reward</td><td>有界谱半径Koopman dynamics + Dreamer</td><td>长时prior imagination + actor-critic闭环</td><td>为IBQ/ELF未来预测增加可控时间尺度与误差稳定性</td></tr>
                  <tr><th>RoFacto</th><td>静态RGB/深度 + 渲染机器人几何</td><td>raw command经控制器/运动学变成nominal trajectory并渲染</td><td>接触后的未来视频/场景响应</td><td>Robot-factored video diffusion</td><td>动作编辑与未来视频；闭环规划未报告</td><td>先统一动作视觉接口，再公平比较URSA/ELF世界动力学</td></tr>
                  <tr><th>ActSWM</th><td>连续游戏latent</td><td>真实/离线恢复action</td><td>next latent + transition separation + action recovery</td><td>Action-sensitive latent AR</td><td>长时rollout、Minecraft闭环规划与跨游戏动作恢复</td><td>给IBQ/URSA/ELF增加“不同动作未来必须可分”的因果约束</td></tr>
                  <tr><th>CG-World</th><td>RGB + 语义/几何/控制器/物理cache/事件</td><td>动作与机制干预分支</td><td>未来观测、state、event与替代结果</td><td>数据协议；支持AR/Diffusion/Flow/JEPA</td><td>事实、观测/动作/机制干预与严格反事实</td><td>把UMM扩展为显式理解—生成—预测—行动state schema</td></tr>
                  <tr><th>PhiZero</th><td>离散物理语言 + 首帧视频latent</td><td>文本action intent / 示范transition</td><td>未来transition symbols + 视频渲染</td><td>Qwen3-VL AR reasoner + diffusion decoder</td><td>交互rollout、动作模拟与零样本motion transfer</td><td>最接近Qwen3+IBQ的离散动力学接口</td></tr>
                  <tr><th>ShadowDancer</th><td>同动力学异外观shadow-pair latent</td><td>示范视频提取的frame-level latent action</td><td>cross-shadow prediction</td><td>appearance-invariant action encoder + block-causal world model</td><td>长动作rollout与跨场景复用</td><td>为URSA/ELF分离外观token与动力学条件</td></tr>
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
