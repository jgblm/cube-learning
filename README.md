# 魔方入门到精通 · Rubik's Cube: Beginner to Master

一个用 **React + Vite + Three.js** 构建的 3 阶魔方互动学习网站，带你在 3D 魔方上从第一次还原走到 CFOP 竞速。

An interactive 3×3 Rubik's cube learning site built with **React + Vite + Three.js**, guiding you from your first solve to CFOP speed — right on a 3D cube.

## 功能 Features

- **可交互 3D 魔方 / Interactive 3D cube**
  - 拖拽旋转视角、滚轮缩放（OrbitControls）
  - 屏幕按钮或键盘（字母=顺时针，`Shift`+字母=逆时针）转动任意面
  - 一键打乱、复位、调速
- **分步课程 / Step-by-step lessons**（中英双语）
  - 入门：认识魔方 → 配色 → 转动记号 → 层先法七步
  - 进阶：F2L 概念、插入、预判、手法提速
  - 精通：CFOP 总览、OLL/PLL 简介、盲拧、训练计划
  - 每一步可点「播放」在魔方上观看对应转动
- **公式速查表 / Formula cheat sheet**
  - 两步 OLL（约 8 例）+ 常用 PLL（17 例）
  - 带顶面图示，点击在魔方上播放
- **自动求解演示 / Auto-solve demo**
  - 一键打乱后再逆序还原，直观展示「解开」过程

## 运行 Running

```bash
npm install
npm run dev      # 开发服务器，默认 http://localhost:5173
npm run build    # 生产构建到 dist/
npm run preview  # 预览生产构建
```

## 技术栈 Tech stack

| 用途 | 选择 |
| --- | --- |
| 框架 | React 18 |
| 构建 | Vite 5 |
| 3D | three.js（含 `OrbitControls`） |
| 路由 | react-router-dom |
| 国际化 | 轻量 `LangContext`（zh / en） |

## 目录结构 Structure

```
src/
├── cube/
│   ├── moves.js        # 转记法解析 / 求逆 / 打乱
│   ├── CubeEngine.js   # Three.js 魔方：建模、动画转动、打乱、复位
│   ├── algorithms.js   # OLL / PLL 公式数据
│   └── solver.js       # 逆序还原（演示用）
├── components/
│   ├── Header.jsx      # 导航 + 语言切换
│   ├── CubeViewer.jsx  # 挂载引擎，暴露 play/scramble/reset/setSpeed
│   ├── LessonView.jsx  # 分步课程
│   ├── FormulaSheet.jsx# 公式速查
│   └── Timer.jsx       # 计时挑战
├── content/lessons.js  # 双语课程数据
├── i18n/LangContext.jsx
└── pages/FormulaLibrary.jsx
```

## 实现要点 Notes

- **转动动画**：每个 cubie 是独立 `THREE.Group`；一次面转把该层 9 个 cubie 临时挂到 pivot 组做 90°/180° 缓动，结束后再烘焙回主组并更新逻辑坐标，贴纸颜色天然保持正确。
- **计时挑战**：点击「打乱」生成随机公式，按空格开始/停止计时，并记录本次最佳与上次成绩。真正的层先（LBL）/ 二阶段求解器可作为后续扩展（见 `src/cube/solver.js` 的 `solveLBL` 占位）。
- **配色**：BOY 相对面（黄上白下、红前橙后、蓝左绿右）——OLL/PLL 公式默认黄在顶。

## 扩展方向 Possible extensions

- 真正的 LBL / Kociemba 二阶段求解器
- 拖拽面直接转动（raycast 命中判定）
- 完整 57 OLL / 21 PLL 公式库与计时训练
