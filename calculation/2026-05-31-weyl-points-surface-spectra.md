---
layout: article
track: "计算主线 / 第一性原理"
title: "Weyl 点搜索与表面谱：从 WannierTools 输出读 Fermi arc 证据"
date: 2026-05-31
difficulty: "零基础友好 / 入门到进阶"
summary: "解释怎样从 Wannier 模型搜索 Weyl 点、判断手性、计算表面谱和 Fermi arc，并说明哪些输出只是候选证据，哪些需要和 ARPES/STM 对照。"
tags: [Weyl semimetal, Fermi arc, surface spectrum, WannierTools]
verification_status: "预生成稿：正文不依赖公式渲染；引用按段落标注；等待日期前最终复核。"
permalink: /calculation/2026-05-31-weyl-points-surface-spectra/
---

# Weyl 点搜索与表面谱：从 WannierTools 输出读 Fermi arc 证据

## 快速阅读版

今天的计算问题是：软件说找到了 Weyl 点，又画了 Fermi arc，这算证明材料是 Weyl 半金属吗？

最短答案是：还不够。一个可信链条通常包括：DFT 显示目标能带交叉；Wannier 模型复现交叉附近能带；三维 Brillouin zone 搜索找到 Weyl 点；计算 Weyl 点手性；确认相反手性的 Weyl 点成对出现；再用半无限表面 Green 函数或 slab 模型计算表面谱，看是否出现连接投影 Weyl 点的表面态 [R1, R2, R3]。

Weyl 点是三维动量空间里的拓扑能带接触点。Fermi arc 是表面投影中可能出现的开放弧形表面态。它们很有辨识度，但真实材料里表面终止、化学势、平庸表面态和谱线展宽都会影响可见性。

## 先认识六个词

| 词 | 白话解释 | 必须检查什么 |
| --- | --- | --- |
| Weyl 点 | 三维能带中两个非简并能带的线性交叉点 | 位置、能量、相关能带编号是否清楚 |
| 手性 | Weyl 点像 Berry curvature 源或汇的拓扑电荷 | 是否计算了正负号，是否总和为零 |
| Fermi arc | 表面布里渊区中连接 Weyl 点投影的开放表面态 | 是否和体态区分开，是否依赖表面终止 |
| 表面谱 | 表面上电子态随能量和动量的强度图 | 是半无限表面还是有限 slab？ |
| 迭代 Green 函数 | 计算半无限表面谱的常用方法 | 层数、展宽、表面终止是否说明 |
| 化学势 | 费米能级位置 | Weyl 点离 EF 有多远，实验能不能看到 |

## 一个可信流程

```text
DFT 能带
  -> 构造并验收 Wannier 模型
  -> 在三维 k 空间搜索候选交叉点
  -> 精修 Weyl 点位置和能量
  -> 计算每个 Weyl 点手性
  -> 检查正负手性成对和平衡
  -> 选择表面终止，计算表面谱
  -> 判断表面态是否连接 Weyl 点投影
  -> 与 ARPES、STM/QPI 或输运实验对照
```

如果只给“找到若干节点”的表格，没有手性和表面谱，通常只能说“候选 Weyl 点”。如果只给表面亮线，没有体 Weyl 点和投影关系，也不能直接叫 Fermi arc。

## WannierTools 能做什么

WannierTools 论文介绍了基于 Wannier tight-binding 模型的拓扑材料计算工具链 [R1]。官方文档列出 FindNodes、WeylChirality、SlabSS、SlabArc、BulkFS 等功能，可用于寻找节点、计算手性、生成表面态和固定能量 Fermi arc 图 [R2]。

这套工具的强处是可以在 Wannier 模型上高效扫描三维 k 空间。弱点也很清楚：如果 Wannier 模型没有复现 DFT 的目标交叉，后面的 Weyl 点位置、手性和表面谱都会失去可信度。

## 表面谱怎么读

表面谱常见图像是横轴动量、纵轴能量，颜色代表表面态强度。Fermi arc 图则常在固定能量下画表面布里渊区中的强度分布。

读图顺序：

1. 这是哪个表面，例如 (001) 还是 (010)？
2. 表面终止是哪个原子层？不同终止是否比较？
3. 颜色强度是左表面、右表面，还是两面混合？
4. Weyl 点投影位置是否标出？
5. 亮线是否连接相反手性的投影点？
6. 亮线是否可能是普通表面态或体态投影？

Wan 等人关于 pyrochlore iridates 的理论工作提出 Weyl 半金属和 Fermi-arc 表面态图像 [R3]。TaAs 的理论预测和 ARPES 观测进一步把 Weyl 点与 Fermi arc 作为材料证据链展示出来 [R4, R5]。这些经典案例告诉我们：体节点和表面态要一起看。

## Kagome 磁性金属里为什么常见

Co3Sn2S2 是典型例子。Liu 等人报告它是铁磁 Kagome-lattice semimetal，并把大反常 Hall 效应与 Weyl 拓扑联系起来 [R6]；Wang 等人也把 large intrinsic anomalous Hall effect 与 magnetic Weyl fermions 联系起来 [R7]。这类材料中，磁性打破时间反演对称性，SOC 和能带反交叉可能产生 Weyl 点和强 Berry curvature。

但计算上必须说清楚：Weyl 点离 EF 多远；有多少对；是否被其他体能带淹没；表面投影是否重叠；选的表面是否适合观察 Fermi arc。否则“有 Weyl 点”可能只是一个计算标签，未必转化成清晰实验图像。

## 常见误读

| 错误写法 | 更客观的写法 |
| --- | --- |
| “找到 Weyl 点，所以实验一定能看到 Fermi arc” | “计算找到 Weyl 点并预测表面态；实际可见性取决于表面、能量位置、体态投影和谱线宽度。” |
| “表面图上有亮线，所以是 Fermi arc” | “需确认亮线连接相反手性 Weyl 点投影，并与普通表面态区分。” |
| “Weyl 点越多越好” | “节点数量多可能让投影重叠和谱图解释更困难。” |
| “只要 AHE 大就是 Weyl 半金属” | “大 AHE 与 Berry curvature 相容，但 Weyl 半金属还需要体节点和拓扑电荷证据。” |

## 今天的小练习

你可以把答案直接发回这个对话。我会按“是否能把体 Weyl 点、手性和表面谱分清楚”来帮你批改。

1. 为什么 Weyl 点必须成对出现，而且总手性要平衡？
2. 如果 Fermi arc 图没有标 Weyl 点投影位置，你会要求作者补什么？
3. 为什么同一个材料换一个表面终止，表面谱可能变得不一样？

## 参考文献

[R1] Q. S. Wu, S. N. Zhang, H.-F. Song, M. Troyer and A. A. Soluyanov, “WannierTools: An open-source software package for novel topological materials,” Computer Physics Communications 224, 405-416 (2018). DOI: https://doi.org/10.1016/j.cpc.2017.09.033

[R2] WannierTools documentation, input files and capabilities. URL: https://www.wanniertools.com/input.html

[R3] X. Wan, A. M. Turner, A. Vishwanath and S. Y. Savrasov, “Topological semimetal and Fermi-arc surface states in the electronic structure of pyrochlore iridates,” Physical Review B 83, 205101 (2011). DOI: https://doi.org/10.1103/PhysRevB.83.205101

[R4] H. Weng et al., “Weyl semimetal phase in noncentrosymmetric transition-metal monophosphides,” Physical Review X 5, 011029 (2015). DOI: https://doi.org/10.1103/PhysRevX.5.011029

[R5] S.-Y. Xu et al., “Discovery of a Weyl fermion semimetal and topological Fermi arcs,” Science 349, 613-617 (2015). DOI: https://doi.org/10.1126/science.aaa9297

[R6] E. Liu et al., “Giant anomalous Hall effect in a ferromagnetic kagome-lattice semimetal,” Nature Physics 14, 1125-1131 (2018). DOI: https://doi.org/10.1038/s41567-018-0234-5

[R7] Q. Wang et al., “Large intrinsic anomalous Hall effect in half-metallic ferromagnet Co3Sn2S2 with magnetic Weyl fermions,” Nature Communications 9, 3681 (2018). DOI: https://doi.org/10.1038/s41467-018-06088-2
