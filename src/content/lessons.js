/**
 * Bilingual lesson content, organised into three levels:
 *   beginner     → Layer-By-Layer (LBL) method
 *   intermediate → F2L & speed-building
 *   advanced     → CFOP overview & beyond
 *
 * Each step may carry an `algorithm` (space-separated move string) that the
 * lesson view can play on the 3D cube.
 */

export const LEVELS = [
  {
    id: 'beginner',
    badge: 'Lv.1',
    title: { zh: '入门：层先法', en: 'Beginner: Layer by Layer' },
    lessons: [
      {
        id: 'intro',
        title: { zh: '认识魔方', en: 'What is a Cube' },
        summary: {
          zh: '三阶魔方有 6 个中心块（固定相对位置）、12 个棱块、8 个角块。还原的目标是让每个面同色。',
          en: 'A 3x3 cube has 6 fixed centre pieces, 12 edges and 8 corners. Solving means making every face one solid colour.',
        },
        steps: [
          { zh: '中心块决定该面的颜色，且相对位置永远不变（白对黄、红对橙、绿对蓝）。', en: 'Centres define each face colour and their opposites never change (white↔yellow, red↔orange, green↔blue).' },
          { zh: '棱块有 2 种颜色，角块有 3 种颜色。转动只会改变它们的位置，不会改变块本身的颜色组合。', en: 'Edges show 2 colours, corners show 3. Turns only move pieces — they never change a piece’s colour combination.' },
          { zh: '不要试图一次性还原所有面，标准做法是分层进行（层先法）。', en: 'Do not try to solve all faces at once. The standard approach is layer by layer.' },
        ],
      },
      {
        id: 'colors',
        title: { zh: '配色与结构', en: 'Colours & Structure' },
        summary: {
          zh: '本站点采用国际通用「BOY」配色：白上、黄下、绿前、蓝后、橙左、红右。',
          en: 'This site uses the standard "BOY" colour scheme: white Up, yellow Down, green Front, blue Back, orange Left, red Right.',
        },
        steps: [
          { zh: '上 U = 白，下 D = 黄。', en: 'Up U = white, Down D = yellow.' },
          { zh: '前 F = 绿，后 B = 蓝。', en: 'Front F = green, Back B = blue.' },
          { zh: '左 L = 橙，右 R = 红。', en: 'Left L = orange, Right R = red.' },
          { zh: '记住「白对黄、红对橙、绿对蓝」能帮你快速判断块该去哪里。', en: 'Remember "white↔yellow, red↔orange, green↔blue" to quickly tell where a piece belongs.' },
        ],
      },
      {
        id: 'notation',
        title: { zh: '转动记号', en: 'Move Notation' },
        summary: {
          zh: '记号是描述转动的通用语言。每个字母代表一个面，顺时针为正，加「撇」表示逆时针，加「2」表示转 180°。',
          en: 'Notation is the universal language of turns. Each letter is a face, clockwise by default; add "’" (prime) for counter-clockwise, "2" for a half turn.',
        },
        steps: [
          { zh: 'U / D / L / R / F / B：分别转动上、下、左、右、前、后面（从该面看顺时针）。', en: 'U / D / L / R / F / B turn the Up, Down, Left, Right, Front, Back faces (clockwise as you look at that face).', algorithm: 'R U R\' U\'' },
          { zh: '加「撇」表示逆时针，例如 R\' 是 R 的反方向。', en: "Add ' (prime) for counter-clockwise, e.g. R' is the reverse of R.", algorithm: 'R R\'' },
          { zh: '加「2」表示转 180°，例如 U2 等于转两次 U。', en: 'A "2" means a half turn, e.g. U2 equals two U turns.', algorithm: 'U2' },
        ],
      },
      {
        id: 'cross',
        title: { zh: '第一步：底层十字', en: 'Step 1: White Cross' },
        summary: {
          zh: '在白色面（底面）拼出十字，并使每条棱的另一颜色与侧面中心对齐。这一步主要靠观察，无需固定公式。',
          en: 'Build a white cross on the bottom face, lining up each edge’s side colour with the centre. Mostly intuitive — no fixed algorithm.',
        },
        steps: [
          { zh: '先找出带白色的棱块，把它转到白色中心旁边。', en: 'Find a white edge and bring it next to the white centre.' },
          { zh: '确保棱块的非白色面与对应侧面中心颜色一致（如白红棱的红面应对准红中心）。', en: 'Make sure the edge’s other colour matches its side centre (e.g. white-red’s red faces the red centre).' },
          { zh: '重复 4 次，得到底面白色十字。', en: 'Repeat four times for a complete white cross on the bottom.' },
        ],
      },
      {
        id: 'f2l-corners',
        title: { zh: '第二步：底层角块', en: 'Step 2: First-Layer Corners' },
        summary: {
          zh: '把四个白色角块归位，完成第一层。常用「右手公式」R U R\'。',
          en: 'Place the four white corners to finish the first layer. The "right-hand" algorithm R U R\' is the workhorse.',
        },
        steps: [
          { zh: '找到白色角块，转到它该去的角位置上方。', en: 'Locate a white corner and turn it above its target slot.' },
          { zh: '重复「右手公式」R U R\' 把角块塞入底层。', en: 'Repeat the right-hand algorithm R U R\' to drop the corner into the bottom layer.', algorithm: 'R U R\'' },
          { zh: '若角块方向不对，先转出再重复公式即可。', en: 'If oriented wrong, turn it out and repeat the algorithm.' },
        ],
      },
      {
        id: 's2l',
        title: { zh: '第三步：第二层棱块', en: 'Step 3: Second Layer' },
        summary: {
          zh: '还原中层四条棱。左插与右插两个公式，靠顶部颜色判断方向。',
          en: 'Solve the middle-layer edges with two insertion algorithms, chosen by the top-face colour.',
        },
        steps: [
          { zh: '右插（棱的目标在右侧）：U R U\' R\' U\' F\' U F', en: 'Right insertion: U R U\' R\' U\' F\' U F', algorithm: 'U R U\' R\' U\' F\' U F' },
          { zh: '左插（棱的目标在左侧）：U\' L\' U L U F U\' F\'', en: 'Left insertion: U\' L\' U L U F U\' F\'', algorithm: 'U\' L\' U L U F U\' F\'' },
          { zh: '若棱块已在中层但位置不对，先用任一公式把它顶出再插入。', en: 'If an edge is in the middle but wrong, pop it out with either algorithm, then insert correctly.' },
        ],
      },
      {
        id: 'yellow-cross',
        title: { zh: '第四步：顶层十字', en: 'Step 4: Yellow Cross' },
        summary: {
          zh: '在黄色顶面拼出十字。万能公式 F R U R\' U\' F\'。', en: 'Make the yellow cross on top. The universal algorithm is F R U R\' U\' F\'.',
        },
        steps: [
          { zh: '顶面只有黄心（点）：用一次公式后转一下再补一次。', en: 'Only the centre is yellow (dot): use the algorithm, turn, then repeat.', algorithm: 'F R U R\' U\' F\'' },
          { zh: '顶面成直线：让直线朝前后，用一次公式即得十字。', en: 'A line: align it front-back, then one application gives the cross.', algorithm: 'F R U R\' U\' F\'' },
          { zh: '顶面成 L：让 L 朝左前，用一次公式即得十字。', en: 'An L shape: point it to front-left, one application gives the cross.', algorithm: 'F R U R\' U\' F\'' },
        ],
      },
      {
        id: 'oll',
        title: { zh: '第五步：顶层翻色', en: 'Step 5: Orient Last Layer' },
        summary: {
          zh: '把整个顶面翻成黄色。先用十字公式，再用「Sune」翻角。', en: 'Turn the whole top face yellow. First the cross, then "Sune" to orient corners.',
        },
        steps: [
          { zh: '确认顶面已为十字（见上一步）。', en: 'Confirm the yellow cross is complete (see previous step).' },
          { zh: '鱼头（1 个角已黄）朝左上，用 Sune：R U R\' U R U2 R\'', en: 'Fish head (one yellow corner) at back-left: use Sune: R U R\' U R U2 R\'', algorithm: 'R U R\' U R U2 R\'' },
          { zh: '无鱼头时先随便做一组 Sune，制造出鱼头后再处理。', en: 'No fish head? Do any Sune first to create one, then solve it.' },
        ],
      },
      {
        id: 'pll-corners',
        title: { zh: '第六步：顶层角块归位', en: 'Step 6: Position Corners' },
        summary: {
          zh: '让四个角块到达正确位置（颜色未必要全朝上）。公式：U R U\' L\' U R\' U\' L', en: 'Move the four corners to their correct spots (not yet oriented). Algorithm: U R U\' L\' U R\' U\' L',
        },
        steps: [
          { zh: '找到一个已经归位的角块作为参考，放在左后。', en: 'Find one correctly placed corner as reference, at back-left.' },
          { zh: '套用公式 U R U\' L\' U R\' U\' L 循环角块位置。', en: 'Apply U R U\' L\' U R\' U\' L to cycle the corners.', algorithm: 'U R U\' L\' U R\' U\' L' },
          { zh: '可能需要重复一次让全部角块归位。', en: 'You may need to repeat once to place all corners.' },
        ],
      },
      {
        id: 'pll-edges',
        title: { zh: '第七步：顶层棱块归位', en: 'Step 7: Position Edges' },
        summary: {
          zh: '最后调整顶层四条棱，魔方还原！公式：R U\' R U R U R U\' R\' U\' R2', en: 'Finally permute the top edges to finish! Algorithm: R U\' R U R U R U\' R\' U\' R2',
        },
        steps: [
          { zh: '若有一条棱已正确，把它放在背面。', en: 'If one edge is solved, keep it at the back.' },
          { zh: '套用公式 R U\' R U R U R U\' R\' U\' R2。', en: 'Apply R U\' R U R U R U\' R\' U\' R2.', algorithm: 'R U\' R U R U R U\' R\' U\' R2' },
          { zh: '若三条棱都错位，先做一遍公式再按上一步处理。', en: 'If three edges are wrong, do the algorithm once, then handle as above.' },
        ],
      },
    ],
  },
  {
    id: 'intermediate',
    badge: 'Lv.2',
    title: { zh: '进阶：F2L 与提速', en: 'Intermediate: F2L & Speed' },
    lessons: [
      {
        id: 'f2l-intro',
        title: { zh: 'F2L 是什么', en: 'What is F2L' },
        summary: {
          zh: 'F2L（First Two Layers）把「底层角块」和「第二层棱块」合并成「角棱对」一次性插入，减少约 30 步。',
          en: 'F2L merges first-layer corners and second-layer edges into paired "corner-edge" slots, cutting roughly 30 moves.',
        },
        steps: [
          { zh: '不再先做完白十字再单独处理角块，而是边做十字边配对。', en: 'Instead of finishing the cross first, pair pieces while building it.' },
          { zh: '目标是 4 个 F2L 对，每个从顶层插入对应槽位。', en: 'Goal: four F2L pairs, each inserted from the top into its slot.' },
          { zh: '先理解原理，再逐步脱离公式、凭直觉插入。', en: 'Understand the principle first, then move from algorithms to intuition.' },
        ],
      },
      {
        id: 'f2l-insert',
        title: { zh: '角棱配对与插入', en: 'Pairing & Insertion' },
        summary: {
          zh: '把角块与同色棱块在顶层配对，再用 U + R/U 动作插入空槽。', en: 'Pair a corner with its matching edge on top, then insert into the empty slot with U + R/U moves.',
        },
        steps: [
          { zh: '找到角块及其同色棱，转到同一区域。', en: 'Find a corner and its colour-matching edge, bring them together.' },
          { zh: '用 R U R\' 等基础动作把对子插入右前槽。', en: 'Insert the pair into the front-right slot with basic R U R\' style moves.', algorithm: 'R U R\'' },
          { zh: '左前槽用镜像 U\' L\' U L。', en: 'Front-left slot uses the mirror U\' L\' U L.', algorithm: 'U\' L\' U L' },
        ],
      },
      {
        id: 'lookahead',
        title: { zh: '观察与预判', en: 'Lookahead' },
        summary: {
          zh: '高手在转动当前步骤的同时，眼睛已经找到下一个对子。这是突破 20 秒的关键。',
          en: 'Strong solvers spot the next pair while turning the current one. This is the key to breaking 20 seconds.',
        },
        steps: [
          { zh: '转动时用余光扫描顶层，提前锁定下一个角棱对。', en: 'While turning, scan the top with your peripheral vision to lock the next pair early.' },
          { zh: '减少「停顿」(pause)，让手和眼睛交替主导。', en: 'Reduce pauses; let hands and eyes take turns leading.' },
          { zh: '用慢速刻意练习预判，而不是一味求快。', en: 'Drill lookahead at slow speed rather than rushing.' },
        ],
      },
      {
        id: 'finger-tricks',
        title: { zh: '手法提速', en: 'Finger Tricks' },
        summary: {
          zh: '用手指而非整只手转面，能显著提升连贯性与速度。', en: 'Turning with fingers instead of the whole hand greatly improves fluidity and speed.',
        },
        steps: [
          { zh: 'U 用食指推、小指勾回，形成连续拨动。', en: 'Push U with the index finger and pull back with the pinky for a continuous flick.' },
          { zh: 'F 用食指向下、R 用右食指勾。', en: 'F with the index finger downward; R with the right index finger hooking.' },
          { zh: '保持手腕放松，避免长时间紧绷。', en: 'Keep the wrist relaxed; avoid prolonged tension.' },
        ],
      },
    ],
  },
  {
    id: 'advanced',
    badge: 'Lv.3',
    title: { zh: '精通：CFOP 与公式', en: 'Advanced: CFOP & Algorithms' },
    lessons: [
      {
        id: 'cfop',
        title: { zh: 'CFOP 总览', en: 'CFOP Overview' },
        summary: {
          zh: 'CFOP = Cross + F2L + OLL + PLL，是竞速最主流的方法。最终靠大量公式（57 OLL + 21 PLL）实现快速还原。',
          en: 'CFOP = Cross + F2L + OLL + PLL, the dominant speedcubing method. It ends with many algorithms (57 OLL + 21 PLL).',
        },
        steps: [
          { zh: 'Cross：8 步内完成底面十字（高阶追求 1.5 秒）。', en: 'Cross: finish the bottom cross within ~8 moves (pros aim for 1.5s).' },
          { zh: 'F2L：4 个对子直觉插入（见进阶）。', en: 'F2L: four intuitive pair insertions (see Intermediate).' },
          { zh: 'OLL / PLL：用公式一次性还原最后一层（见公式速查页）。', en: 'OLL / PLL: solve the last layer with algorithms (see the Formulas page).' },
        ],
      },
      {
        id: 'oll-intro',
        title: { zh: 'OLL 简介', en: 'About OLL' },
        summary: {
          zh: 'OLL（Orientation of Last Layer）把顶面翻成全黄，共 57 个公式。可先用「两步 OLL」降低记忆量。',
          en: 'OLL orients the whole top face yellow — 57 cases. Start with "two-look OLL" to cut memorisation.',
        },
        steps: [
          { zh: '两步 OLL：先翻出顶面十字，再翻角块，只需记约 10 个公式。', en: 'Two-look OLL: make the cross, then orient corners — only ~10 algorithms to learn.' },
          { zh: '熟练后再逐步补充完整 57 个 OLL。', en: 'Later, gradually add the full 57 OLL cases.' },
        ],
      },
      {
        id: 'pll-intro',
        title: { zh: 'PLL 简介', en: 'About PLL' },
        summary: {
          zh: 'PLL（Permutation of Last Layer）调整最后一层块的位置，共 21 个公式。', en: 'PLL permutes the last-layer pieces into place — 21 cases total.',
        },
        steps: [
          { zh: '优先掌握高频公式：Ua / Ub / H / Z / T / J / A。', en: 'Learn the high-frequency perms first: Ua / Ub / H / Z / T / J / A.' },
          { zh: '在「公式速查」页点击即可在魔方上观看每个公式的转动。', en: 'On the Formulas page, click any case to watch its turns on the cube.' },
        ],
      },
      {
        id: 'blindfold',
        title: { zh: '盲拧简介', en: 'Blindfolded Solving' },
        summary: {
          zh: '盲拧靠记忆 + 字母缓冲体系（如 Old Pochmann）完成，是另一种极限玩法。',
          en: 'Blindfolded solving uses memory plus lettering/buffer systems (e.g. Old Pochmann) — a different kind of challenge.',
        },
        steps: [
          { zh: '为每块指定字母，建立「缓冲块 → 目标块」的交换链。', en: 'Assign each piece a letter; build swap cycles from a buffer piece to targets.' },
          { zh: '先练「记忆 + 闭眼复原」，再挑战真正盲拧。', en: 'Practice memorise-then-solve with eyes closed before a true blindfold.' },
        ],
      },
      {
        id: 'plan',
        title: { zh: '训练计划', en: 'Practice Plan' },
        summary: {
          zh: '稳定进步的节奏：每天分段练习十字、F2L、OLL/PLL，并计时记录。',
          en: 'A steady routine: drill cross, F2L and OLL/PLL in short sessions daily, and log your times.',
        },
        steps: [
          { zh: '周一/三/五：F2L 直觉 + 预判。', en: 'Mon/Wed/Fri: F2L intuition + lookahead.' },
          { zh: '周二/四：新 OLL/PLL 公式记忆。', en: 'Tue/Thu: memorise new OLL/PLL algorithms.' },
          { zh: '周末：完整复原计时 + 复盘慢拧。', en: 'Weekend: timed full solves + slow-motion review.' },
        ],
      },
    ],
  },
];

/** Flattened list of all lessons with their level reference. */
export const ALL_LESSONS = LEVELS.flatMap((level) =>
  level.lessons.map((lesson) => ({ ...lesson, levelId: level.id })),
);
