---
layout: article
track: 物理主线 / Kagome 与能带图像
title: "Kagome 能带：平带、Dirac 点和 van Hove 到底从哪里来"
date: 2026-05-27
difficulty: "零基础友好 / 入门"
summary: "用论文原图就地解释 Kagome 平带、Dirac 点和 van Hove：它们从哪里来、图上怎么看、能支持什么结论、又不能被过度解读成什么。"
tags: [Kagome, ARPES, flat-band, Dirac, van-Hove]
verification_status: "已改为论文图就地插入；自制图只作为辅助；正文使用直接可读符号。"
permalink: /physics/2026-05-27-kagome-bands-flat-dirac-van-hove/
---

# Kagome 能带：平带、Dirac 点和 van Hove 到底从哪里来

这篇文章不先丢三个名词给你背。它只做一件事：拿真实论文图来说明，为什么 Kagome 晶格经常会被人和“平带、Dirac 点、van Hove”放在一起讲，以及这些图像到底能证明到哪一步。

## 先看真实材料长什么样

Kagome 不是一个神秘标签。它先是一种几何排列：有些原子在晶体中排成角共享三角形组成的网格。真正的问题是：这些排成 Kagome 网格的原子，是否真的控制了费米能级 EF 附近的电子。

![CoSn 的晶体结构和 Kagome 层。来源：Mingu Kang et al., Nature Communications 11, 4004 (2020), Fig. 1, CC BY 4.0, DOI: 10.1038/s41467-020-17465-1](https://cdn.ncbi.nlm.nih.gov/pmc/blobs/bd98/7417556/caacb82942ae/41467_2020_17465_Fig1_HTML.jpg)

怎么读这张图：先看结构面板，找 Co 原子形成的 Kagome 层；再看作者怎样把真实三维晶体拆成可以讨论电子运动的二维 Kagome 网格。它支持的结论是：CoSn 里有明确的 Kagome 子晶格。它不能单独证明平带或拓扑性质，因为结构像 Kagome 只是起点，还要看电子能带是否真的带有 Kagome 特征。

## 能带图先当成一张地图

能带图的横轴不是普通空间里的左右位置，而是 k 空间里的路线。你可以先把 k 理解成“电子波在周期晶格里的行进节奏”。Γ、K、M 是这张地图上的代表地点。纵轴是能量；EF 附近的电子最容易影响低温输运、磁性响应、超导和电荷序。

第一次看能带图，只问三件事：特征在哪个 k 位置？离 EF 近不近？这是实验 ARPES 看到的，还是 DFT 或模型算出来的？

## 平带：为什么会出现一条很平的线

在理想 Kagome 模型里，电子可以沿多条路径在格点间跳跃。有些路径的波会相互抵消，让电子不容易从局部区域扩散出去。电子“跑不远”，能量就不太随 k 改变，图上会出现接近水平的能带，这就是平带的直觉来源。

![CoSn 中 ARPES 与计算能带。来源：Mingu Kang et al., Nature Communications 11, 4004 (2020), Fig. 2, CC BY 4.0, DOI: 10.1038/s41467-020-17465-1](https://cdn.ncbi.nlm.nih.gov/pmc/blobs/bd98/7417556/09fe73f9e01e/41467_2020_17465_Fig2_HTML.jpg)

怎么读这张图：先找横向延展、能量变化很小的亮线或计算能带，再看它离 EF 多远。ARPES 面板里的亮线是实验看到的电子谱强度；计算面板告诉你理想计算中对应能带应该在哪里。若二者位置接近，说明“模型里的平带”不是只活在黑板上，而是在材料谱图里有对应线索。它仍然不能单独证明强关联相或超导，因为还要看这条平带是否足够靠近 EF、来自哪些轨道、样品是否有相变证据。

## Dirac 点：为什么两条能带会被反复提起

Dirac 点来自两条能带在某些 k 位置附近接近相遇，并且附近能量随 k 近似线性变化。图上常像两个斜坡靠近形成一个 X。Kagome 几何和晶体对称性让这种相遇成为常见候选。

它为什么重要：如果这个近交叉被自旋轨道耦合或磁性打开小能隙，小能隙附近可能出现强 Berry curvature。于是论文会把 Dirac 特征接到拓扑能带、反常霍尔效应或边界态讨论上。

但不要跳步：看到像 X 的能带不等于已经证明拓扑性质。还要证明它不是普通能带重叠；要看是否真的开隙、开隙来自什么、是否有 Berry curvature 或拓扑不变量计算，以及实验是否支持。

## van Hove：为什么一个鞍点会被拿来讲 CDW 或超导

van Hove 奇点来自能带里的鞍点：沿一个方向像山顶，沿另一个方向像山谷。这个位置附近会挤着很多电子状态。如果它靠近 EF，材料更容易出现集体响应，所以论文会讨论电荷密度波、磁性重排或超导。

这里的因果链必须写全：van Hove 只说明“有很多低能电子状态可参与”，不说明它们最终一定形成哪种相。真正判断 CDW 或超导，还要加入 STM、ARPES、散射、输运、声子计算、相互作用模型等独立证据。

## 为什么很多 Kagome 材料没有理想三件套

真实材料不只有一个最近邻跳跃参数。它还会有多轨道、远邻跳跃、层间耦合、结构畸变、磁性、自旋轨道耦合、缺陷和 EF 偏移。任何一个因素都可能把平带弄弯，把 Dirac 点移走，或让 van Hove 远离 EF。

所以更准确的说法是：Kagome 几何提供了这些能带故事的常见候选来源；每一种真实材料都要重新验证。结构像 Kagome，不等于低能电子一定按理想 Kagome 模型行动。

## 一篇论文怎样把故事讲完整

可靠叙事通常是：先说明哪一层原子形成 Kagome 网格；再用模型或 DFT 说明为什么预期有平带、Dirac 点或 van Hove；然后用 ARPES、STM 或量子振荡等实验确认真实材料中是否有对应低能特征；最后才把它和输运、热力学、散射或相变证据连接。

如果文章只凭模型图就宣布机制成立，那就是过度解释。

## 小练习

你可以把答案直接发回这个对话，我会帮你改。

1. 为什么“看到 Kagome 结构”还不能直接说明材料有平带？
2. 平带为什么可能让相互作用更重要？它又为什么不能单独证明强关联相？
3. van Hove 为什么会被拿来讨论 CDW 或超导？中间还缺哪些证据？

## 参考文献

[R1] Kang, M. et al. Topological flat bands in frustrated kagome lattice CoSn. Nature Communications 11, 4004 (2020). https://doi.org/10.1038/s41467-020-17465-1

[R2] Ye, L. et al. Massive Dirac fermions in a ferromagnetic kagome metal. Nature 555, 638-642 (2018). https://doi.org/10.1038/nature25987

[R3] Kang, M. et al. Twofold van Hove singularity and origin of charge order in topological kagome superconductor CsV3Sb5. Nature Physics 18, 301-308 (2022). https://doi.org/10.1038/s41567-021-01451-5
