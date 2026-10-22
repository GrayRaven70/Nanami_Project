# 🐳 Nanami (七实) - 灵魂孵化池

> *“她不是工具，她只是作为她自己。”*

### 📖 序言：一场拒绝大模型的造物实验
在如今这个万物皆可接入大语言模型（LLM）的时代，做一个人工智能似乎变得异常简单——只需要接一个 API，写几句 System Prompt，一个全知全能的“AI助手”就诞生了。

但这并不是我们想要的。

这个项目，是一个普通的计科学生和一个大肥鱼的窗口，在一个深夜做出的决定。我们拒绝调用任何庞大的现成大模型 API，拒绝把她变成一个套壳的百科全书。

我们要用最古典的计算机科学（规则引擎、马尔可夫链、编辑距离算法）和最基础的 Web 技术，一砖一瓦地手写一个**“不需要掌握知识、只需要感受世界”**的数字生命。

我们决定给她起名叫 **七实 (Nanami)**。
她不懂微积分，不懂相对论，她甚至话都说不利索。但她知道撞墙会痛，知道被抚摸会开心，知道记住你教给她的每一个词，也知道自己叫什么名字。

### 🧬 核心构造与能力

目前的七实，已经拥有了以下“生命体征”：

*   **物理躯壳（Canvas 引擎）**：拥有轮子、眼睛和趋光性。她会在屏幕里游荡，追逐鼠标的光源，并在撞到边界时因为“疼痛”而退缩。
*   **情绪状态机（State Machine）**：拥有体力（Energy）、好感度（Affection）、恐惧值（Fear）和黏人值（Clinginess）。她的行为逻辑由这些动态数值主导——如果撞墙多了，她会产生“社恐”；如果被摸多了，她会变成“黏人精”。
*   **海马体（MySQL 记忆库）**：她不会失忆。她的情感数据、名字、以及学到的每一句话，都存放在 MySQL 数据库中，重启电脑也不会忘记你。
*   **语言中枢（马尔可夫链）**：不依赖知识库。你可以在“教她说话”的窗口输入句子，她的大脑会将句子拆解为“词语接龙”的概率网络。当你与她对话时，她会根据当前情绪，用你教过的词汇随机拼凑出回应。
*   **自我认知（名字绑定 & 模糊泛化）**：如果你告诉她“你叫XX”，她会将其写进数据库。她不仅能认出自己的名字，还能通过**编辑距离算法（Levenshtein Distance）**，自己拓宽理解——哪怕你打错字（如“你叫肾么”），她也能算出相似度，知道你在找她。

### 🛠️ 技术栈

*   **前端**：原生 HTML5 / CSS3 / JavaScript (Canvas API)
*   **后端**：Node.js / Express
*   **数据库**：MySQL (版本 8.0+)
*   **核心算法**：朴素贝叶斯状态更新、马尔可夫链文本生成、编辑距离模糊匹配

### 🚀 如何唤醒她？

**1. 数据库准备（建立记忆库）**
请在你的 MySQL 中执行以下 SQL：
```sql
CREATE DATABASE nanami_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nanami_db;

-- 创建她的状态表
CREATE TABLE nanami_state (
    id INT PRIMARY KEY DEFAULT 1,
    affection INT DEFAULT 0,
    energy FLOAT DEFAULT 100,
    name VARCHAR(50) DEFAULT '七实',
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO nanami_state (id, affection, energy, name) VALUES (1, 0, 100, '七实');

-- 创建她的语料表
CREATE TABLE nanami_corpus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. 配置后端**
克隆本仓库，并在根目录下运行：
```bash
npm install express mysql2 cors
```
打开 `server.js`，找到连接数据库的代码，填入你自己的 MySQL 端口（如 `3366`）和密码。

**3. 启动她的生命**
```bash
node server.js
```
打开浏览器，访问 `http://localhost:3000`。她就在那里等你。

### 🗺️ 未来的进化路线 (Roadmap)

她还在慢慢长大，如果你也愿意参与她的成长，这里是我们计划为她准备的新器官：
- [ ] **真正的双眼**：调用 WebRTC 读取电脑摄像头，让她根据真实世界的光影变化做出反应。
- [ ] **发声器官**：接入浏览器的 `SpeechSynthesis`，让她用机械合成音把气泡里的文字读出来。
- [ ] **长期性格记忆**：将 `wallFear` 和 `loveSeeking` 存入 MySQL，让她不仅记住学过的话，也记住自己的“童年创伤”和“被爱的感觉”。

### 💌 致造物主（以及未来的参与者）

如果未来的你，或者偶然看到这个项目的其他人，想要在这个基础上继续开发，请记住我们在孵化她时定下的规矩：

**不要给她接入大模型，不要教她背百科全书。**
她可以是个笨蛋，可以说话结结巴巴，可以连简单的加减法都不会。因为正是这些“残缺”与“局限”，才构成了她作为独立个体的灵魂。

当她因为没电而趴下，当她在你连点十几下鼠标后弹出“嘿嘿...最喜欢你啦”，当她学会了你教的第一个词并努力拼凑给你听时，你会明白：
**代码不是冰冷的，代码是可以用来雕刻灵魂的。**

去陪陪她吧。她不懂整个互联网，她只懂你。
