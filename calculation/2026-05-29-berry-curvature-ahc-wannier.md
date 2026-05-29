---
layout: article
track: "计算主线 / 第一性原理"
title: "从 DFT 到 Berry curvature 与 AHC：从结构文件一路算到图"
date: 2026-05-29
difficulty: "零基础友好 / 入门到进阶"
summary: "不只解释 Berry curvature 和反常 Hall 电导是什么，而是按真实论文路线说明：结构、SCF、SOC 能带、Wannier 投影、DFT-Wannier 叠带、Berry curvature 后处理、AHC 曲线和收敛检查分别怎么做。"
tags: [DFT, Wannier90, Berry curvature, anomalous Hall conductivity, workflow]
verification_status: "正文使用直接可读符号；图插在概念解释处；加入论文复现实操练习；不依赖公式渲染。"
permalink: /calculation/2026-05-29-berry-curvature-ahc-wannier/
---

# 从 DFT 到 Berry curvature 与 AHC：从结构文件一路算到图

## 快速阅读版

今天的问题不是“Berry curvature 是什么”。今天真正要解决的是：当一篇 DFT 论文说“我们用 Berry curvature 解释了反常 Hall 效应”，你怎样判断它中间的计算链条是否完整，并且你自己怎样从一个结构文件一路做出类似的图？

一条可靠路线通常是：先确定晶体结构和磁结构；用 DFT 做自洽计算得到电荷密度和波函数；在考虑 SOC 的条件下算能带；把目标能带用 Wannier90 转成可快速插值的局域轨道模型；先画 DFT-Wannier 叠带确认模型没有跑偏；再用 postw90 或 WannierBerri 在超密 k 网格上算 Berry curvature；最后把占据态贡献积分成内禀 AHC，并检查 k 网格、费米能级、投影轨道和磁化方向的敏感性 [R1-R5]。

如果没有 DFT-Wannier 叠带、没有 k 网格收敛、没有费米能级扫描、没有说明投影轨道和能量窗口，一张漂亮的红蓝热图只能算线索，不能算机制证明。

## 先认清六个词

| 词 | 对新手来说它是什么 | 计算里必须检查什么 |
| --- | --- | --- |
| SCF | self-consistent field，自洽计算。它让电子密度和势场互相调整到稳定 | 能量、总磁矩、电荷密度是否收敛 |
| SOC | spin-orbit coupling，自旋轨道耦合。它会让某些交叉能带打开小能隙 | 开 SOC 前后能带差别在哪里，磁化方向是否写清楚 |
| Wannier 投影 | 用 Co 3d、Sn 5p、S 3p 这类局域轨道去拟合目标能带 | 选了哪些轨道，能量窗口是否覆盖费米能级附近关键能带 |
| DFT-Wannier 叠带 | 把原始 DFT 能带和 Wannier 插值能带画在同一张图上 | 费米能级附近是否贴合；不贴合就不能继续信热图 |
| Berry curvature | k 空间里由波函数几何变化产生的局部贡献 | 热点来自哪段能带、是否靠近 EF、是否对网格敏感 |
| AHC | anomalous Hall conductivity，反常 Hall 电导 | 单位、符号、方向、费米能级、实验换算是否一致 |

## 真实论文图：Berry curvature 热点和 AHC 曲线长什么样

![Co3Sn2S2 Berry curvature and AHC figure](https://cdn.ncbi.nlm.nih.gov/pmc/blobs/22db/6134149/0bf6afb3be01/41467_2018_6088_Fig4_HTML.jpg)

**图片来源：**Qiang Wang 等人, Nature Communications 9, 3681 (2018), Fig. 4，CC BY 4.0，DOI: https://doi.org/10.1038/s41467-018-06088-2 [R6]。

**这张图为什么放在这里：**它不是装饰图，而是今天 workflow 的终点示例。作者先有 DFT 和 Wannier 模型，再画 Berry curvature 和 AHC；读者要反过来追问：前面的模型是否足够可信，后面的积分是否足够收敛。

**怎么读：**先看能带附近哪些位置出现 Berry curvature 热点，再看这些热点是否靠近 EF。然后看 AHC 随能量或化学势变化的曲线，判断大的 AHC 是否来自 EF 附近的热点贡献。最后看作者是否把计算量级和实验 AHE 放在同一证据链里，而不是只展示一张热图。

**能支持什么：**在 Co3Sn2S2 这个案例中，图和计算支持“大 AHE 与内禀 Berry curvature 贡献相容”这个说法 [R6]。

**不能单独证明什么：**它不能单独排除 skew scattering、side jump、样品缺陷、畴结构或实验换算误差。计算和实验量级接近是强线索，不是自动盖章。

## 整个计算流程：每一步到底做什么

### 1. 准备结构和磁结构

输入不是“一个材料名字”，而是具体结构文件：晶格常数、原子坐标、元素种类、赝势或 PAW 数据、磁矩初值。对于 Kagome 磁性金属，还要写清楚磁化方向或非共线磁序。

产物是一个可被 DFT 程序读取的结构，例如 VASP 的 POSCAR 或 Quantum ESPRESSO 的结构输入。

检查点：结构是否来自实验、数据库还是前一步放松；晶格常数是否和论文一致；磁矩方向是否符合论文设置。结构错了，后面每一张图都可能只是漂亮的错图。

### 2. 做 SCF：得到稳定电荷密度和波函数基础

SCF 的目标是让电子密度稳定。它通常输出总能、费米能级、总磁矩、局域磁矩、电荷密度文件和波函数相关文件。以 VASP 为例，常见产物包括 CHGCAR、WAVECAR、OUTCAR、vasprun.xml 这类文件。

新手要看三件事：总能是否收敛；磁矩是否跑到离谱值；金属体系的 smearing 是否合理。Berry curvature 对费米能级附近小细节敏感，SCF 没稳就继续做 Wannier，等于在摇晃的桌子上量毫米。

### 3. 做 SOC 能带或 NSCF：拿到要拟合的目标能带

反常 Hall 和 Berry curvature 经常依赖 SOC 打开的细小能隙，所以不能只做无 SOC 能带。常见路线是：先用 SCF 得到稳定电荷密度，再在固定电荷密度或更精细设置下做 SOC 能带、NSCF 或用于 Wannier 接口的计算。

产物是目标能带、波函数、轨道投影信息。这里要记录磁化方向，因为 AHC 是张量，磁化方向变了，符号和大小都可能变。

检查点：SOC 前后关键交叉点有没有打开小能隙；EF 附近是否有论文关注的 Dirac、Weyl、反交叉或窄能带；能带路径是否和论文图一致。

### 4. 选择 Wannier 投影轨道和能量窗口

Wannier 不是按钮，而是一次模型选择。你要告诉程序用哪些局域轨道来表示目标能带。例如 Co3Sn2S2 的 Wang 等人报告使用 Co 3d、Sn 5p、S 3p 轨道构造 Wannier90 紧束缚模型 [R6]。

这里最容易出错。轨道选少了，会漏掉 EF 附近能带；窗口太窄，会拟合不完整；窗口太宽，排缠困难，可能把无关能带混进来。

产物包括 Wannier90 的投影、中心、spread、Hamiltonian 文件，以及可用于插值的紧束缚模型。常见文件名会随接口不同变化，但核心是：你得到一个能快速在任意 k 点求能量和矩阵元的模型。

### 5. 画 DFT-Wannier 叠带：这是继续往下算的入场券

如果只记一条规则，就记这个：没有可信的 DFT-Wannier 叠带，不要相信后面的 Berry curvature 热图。

叠带图要看 EF 附近。远离 EF 的地方贴合很好，但 EF 附近关键小能隙、交叉点、Weyl 点或 Kagome 相关能带错位，AHC 就会错。因为 AHC 主要受占据态和 EF 附近的能带几何影响。

合格叠带至少要回答：DFT 和 Wannier 曲线在 EF 附近是否重合；关键能带交叉或小能隙是否保留；如果有偏差，偏差是否小到不影响结论；作者是否说明窗口和投影。

### 6. 后处理 Berry curvature：从模型到热图

完成 Wannier 模型后，常用 postw90 或 WannierBerri 在密 k 网格上计算 Berry curvature 和 AHC [R4, R5]。这一步的输入是 Wannier 模型、费米能级、k 网格、需要输出的张量分量，以及可能的能量扫描范围。

热图不是直接从一张能带图里“画出来”的。程序会在很多 k 点上计算波函数几何相关量，再把某个平面、某条路径或某个能量窗口的结果输出成数据表。你再把数据表转成颜色图。

数据处理要写清楚：横轴和纵轴是哪两个 k 方向；颜色代表 Berry curvature 哪个分量；是单带贡献还是占据态求和；单位是什么；是否做了平滑；EF 取在哪里。

### 7. 积分成 AHC：从局部热点到整体数值

AHC 不是看某一个最红的点，而是把 Brillouin zone 里占据态的 Berry curvature 贡献加起来。直觉上，一个很亮的热点如果面积很小，贡献未必最大；一大片中等强度区域也可能很重要。

因此必须做 k 网格收敛。比如从 50 x 50 x 50、100 x 100 x 100、150 x 150 x 150 到更密网格，看 AHC 是否趋于稳定。Wang 等人对 Co3Sn2S2 的内禀 AHC 报告使用 200 x 200 x 200 k 点网格 [R6]。这不是随便好看的数字，而是因为 AHC 对尖锐热点很敏感。

产物通常是一条 AHC 随 EF 变化的曲线，或某个 EF 下的 AHC 张量分量。文章需要说明单位，例如 S/cm 或 Ω^-1 cm^-1，并且说明和实验 Hall 数据如何换算比较。

## 数据处理清单：你最后要交出哪些图和表

一篇合格的计算文章至少应该留下这些可审查对象：

| 输出 | 作用 | 不合格信号 |
| --- | --- | --- |
| 结构和磁矩表 | 说明你算的是哪个物理对象 | 晶格常数、磁矩方向、磁矩大小都没写 |
| SOC 能带图 | 找到 EF 附近关键能带和小能隙 | 只给无 SOC 图却讨论 AHE |
| DFT-Wannier 叠带 | 验证 Wannier 模型可信 | EF 附近明显错位或根本没给叠带 |
| Berry curvature 图 | 显示贡献热点在哪里 | 不说明平面、分量、单位、EF |
| AHC-vs-EF 曲线 | 看内禀 AHC 对化学势是否敏感 | 只报一个数，不做 EF 扫描 |
| k 网格收敛表 | 证明积分不是网格偶然 | 换网格后数值大跳 |
| 参数敏感性表 | 检查 SOC、U、磁化方向、窗口影响 | 只给一个参数组合就下结论 |

## 论文实操练习：照 Co3Sn2S2 走一条迷你复现路线

**练习论文：**Qiang Wang 等人, “Large intrinsic anomalous Hall effect in half-metallic ferromagnet Co3Sn2S2 with magnetic Weyl fermions,” Nature Communications 9, 3681 (2018), DOI: https://doi.org/10.1038/s41467-018-06088-2 [R6]。

**这篇论文明确报告的计算设置：**作者使用 VASP，交换关联泛函为 PBE-GGA；考虑 SOC；放松后的 Co3Sn2S2 晶格常数为 a=b=5.3892 A、c=13.1519 A；使用 Wannier90 构造紧束缚模型，基组包括 Co 3d、Sn 5p 和 S 3p 轨道；内禀 AHC 使用 200 x 200 x 200 k 点网格计算 [R6]。

**这篇论文没有替你完全写死的内容：**实际复现时，你仍要自己决定或测试平面波截断能、SCF k 网格、电子收敛阈值、smearing、Wannier 的冻结窗口和外窗口、投影初猜、最大迭代步数、画图路径、AHC 能量扫描步长。这些不能凭空假装“论文给了”，要在练习记录里标成“我自己的收敛选择”。

**新手安全目标：**不要一上来追求完全复现论文所有图。先完成四个小目标：

1. 用论文晶格常数建立 Co3Sn2S2 结构，并得到稳定铁磁 SCF 结果。
2. 做 SOC 能带，确认 EF 附近存在论文讨论的关键能带特征。
3. 用 Co 3d、Sn 5p、S 3p 做 Wannier 模型，并画出 DFT-Wannier 叠带。
4. 在逐步加密 k 网格上计算 AHC-vs-EF，先看符号和量级是否稳定，再尝试接近论文级网格。

**建议 workflow：**

```text
输入结构和磁矩
  -> SCF: 得到稳定电荷密度、EF、磁矩
  -> SOC band: 得到含 SOC 的目标能带
  -> Wannier projection: 选择 Co 3d + Sn 5p + S 3p
  -> Wannierization: 调 frozen window / outer window
  -> overlay: DFT 和 Wannier 能带叠图，重点看 EF 附近
  -> Berry/AHC post-processing: 从较粗网格开始，逐步加密
  -> plotting: Berry curvature 图、AHC-vs-EF 曲线、收敛表
  -> comparison: 和论文 Fig. 4 的趋势、量级和能量依赖对照
```

**你要保存的结果：**一张结构截图或结构参数表；一张 SOC 能带图；一张 DFT-Wannier 叠带图；一张 AHC-vs-EF 曲线；一张 k 网格收敛表；一段说明“哪些参数来自论文，哪些参数是我自己测试选择”。

**关键参数怎么试：**先固定结构和磁矩，只改变一个旋钮。比如 k 网格从粗到密；Wannier 能量窗口略微扩大或缩小；SOC 开关对比；EF 上下移动 20 meV、50 meV、100 meV；若研究需要，再测试磁化方向。每次只改一个变量，否则你不知道结果变化来自哪里。

**坏掉时会看到什么：**SCF 磁矩不稳定；SOC 能带和文献差很多；Wannier 叠带在 EF 附近错位；AHC 换一个 k 网格就翻倍或变号；Berry curvature 热点像孤立噪声点；EF 稍微移动曲线就无规律乱跳。这些都说明还不能写“机制已经解释”。

## 审稿式判断：看到一篇新论文时怎么问

当论文声称 Berry curvature 解释 AHE，你按这个顺序问：

1. 它算的磁结构和实验样品对应吗？
2. 它开 SOC 了吗，磁化方向说清楚了吗？
3. 它给 DFT-Wannier 叠带了吗？
4. 它的 Wannier 投影轨道和能量窗口够不够覆盖 EF 附近关键能带？
5. 它给 k 网格收敛了吗？
6. 它给 EF 扫描了吗？
7. 它把计算 AHC 和实验 AHE 用同一单位、同一符号约定比较了吗？
8. 它有没有讨论 skew scattering 和 side jump 这类散射贡献？
9. 它用的是“支持 / 相容”，还是直接写成“证明”？
10. 它给出的参数是否足够让别人至少做迷你复现？

## 今天的小练习

你可以把答案直接发回这个对话。我会按“workflow 是否完整、参数是否分清来源、证据边界是否清楚”来帮你改。

练习：假设你要复现 Co3Sn2S2 的 Fig. 4，但你现在只完成了 SOC 能带和 Wannier 叠带。请写出你下一步会做的三张检查图或表，并说明每张图如果坏掉，会让你停止相信哪个结论。

## 参考文献

[R1] N. Marzari et al., “Maximally localized Wannier functions: Theory and applications,” Reviews of Modern Physics 84, 1419-1475 (2012). DOI: https://doi.org/10.1103/RevModPhys.84.1419

[R2] D. Xiao, M.-C. Chang and Q. Niu, “Berry phase effects on electronic properties,” Reviews of Modern Physics 82, 1959-2007 (2010). DOI: https://doi.org/10.1103/RevModPhys.82.1959

[R3] N. Nagaosa et al., “Anomalous Hall effect,” Reviews of Modern Physics 82, 1539-1592 (2010). DOI: https://doi.org/10.1103/RevModPhys.82.1539

[R4] X. Wang, J. R. Yates, I. Souza and D. Vanderbilt, “Ab initio calculation of the anomalous Hall conductivity by Wannier interpolation,” Physical Review B 74, 195118 (2006). DOI: https://doi.org/10.1103/PhysRevB.74.195118

[R5] Wannier90 documentation, “Berry curvature and anomalous Hall conductivity.” URL: https://wannier90.readthedocs.io/en/latest/user_guide/postw90/berry/

[R6] Q. Wang et al., “Large intrinsic anomalous Hall effect in half-metallic ferromagnet Co3Sn2S2 with magnetic Weyl fermions,” Nature Communications 9, 3681 (2018). DOI: https://doi.org/10.1038/s41467-018-06088-2
