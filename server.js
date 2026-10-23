// server.js - 七实的中枢神经与心智引擎
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
// ==========================================
// 🌟 模糊匹配算法（计算两个词有多像）
// ==========================================
function getSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // 删除
        matrix[i][j - 1] + 1, // 插入
        matrix[i - 1][j - 1] + cost // 替换
      );
    }
  }
  // 返回相似度（0到1之间，1代表一模一样）
  return 1 - matrix[len1][len2] / Math.max(len1, len2);
}
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 连接七实的 MySQL 记忆库
const db = mysql.createConnection({
  host: "localhost",
  port: 3366,
  user: "root",
  password: "123",
  database: "nanami_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ 连接数据库失败，请检查密码和数据库名", err);
    return;
  }
  console.log("✅ 七实的记忆库 (MySQL) 已连接！");
});

// ==========================================
// 🌟 马尔可夫链核心逻辑（教她说话）
// ==========================================
let herMemoryName = "七实"; 
let brainMemory = {}; // 存放学到的词语接龙
// 🌟 她大脑里的新宇宙：词共现矩阵
// 格式：{ "星星": { "漂亮": 3, "夜空": 1 }, "漂亮": { "星星": 3 } }
let semanticNetwork = {}; 
let wordCounts = {}; // 记录每个词出现的总次数，用来算概率

// 1. 学习：把一句话里的词两两连线
function learnText(text) {
  // 简单的单字/双字切分（你可以根据实际情况调整）
  let words = text.replace(/[，。！？\s]/g, ' ').split(' ').filter(w => w.length > 0);
  
  // 如果是长句，我们可以按字拆，也可以按词拆，这里为了简单按字拆并提取双字词
  let finalWords = [];
  for (let w of words) {
    if (w.length > 2) {
      for (let i = 0; i < w.length - 1; i++) {
        finalWords.push(w.substring(i, i + 2)); // 提取双字词，比如“星星”、“漂亮”
      }
    } else {
      finalWords.push(w);
    }
  }

  // 建立语义连线
  for (let i = 0; i < finalWords.length; i++) {
    let w1 = finalWords[i];
    wordCounts[w1] = (wordCounts[w1] || 0) + 1;
    if (!semanticNetwork[w1]) semanticNetwork[w1] = {};

    // 和它后面的词建立联系（不局限于紧挨着，同在一句话里都算）
    for (let j = i + 1; j < finalWords.length; j++) {
      let w2 = finalWords[j];
      semanticNetwork[w1][w2] = (semanticNetwork[w1][w2] || 0) + 1;
      if (!semanticNetwork[w2]) semanticNetwork[w2] = {};
      semanticNetwork[w2][w1] = (semanticNetwork[w2][w1] || 0) + 1; // 双向连线
    }
  }
}

// 2. 思考：基于概率联想生成句子
function generateReplyFromMemory(input) {
  // 看看输入里有没有她认识的词
  let foundWord = null;
  for (let w in semanticNetwork) {
    if (input.includes(w)) {
      foundWord = w;
      break;
    }
  }
  
  if (!foundWord) return null;

  // 顺着这根线找关联词，根据权重随机挑一个
  let relatedWords = semanticNetwork[foundWord];
  let bestWord = null;
  let maxWeight = 0;
  
  for (let rw in relatedWords) {
    let weight = relatedWords[rw];
    if (weight > maxWeight) {
      maxWeight = weight;
      bestWord = rw;
    }
  }

  if (!bestWord) return foundWord;

  // 用加权概率抽词（比如星星和漂亮连了3次，和夜空连了1次，那抽中漂亮的概率就是75%）
  let pool = [];
  for (let rw in relatedWords) {
    for (let i = 0; i < relatedWords[rw]; i++) {
      pool.push(rw);
    }
  }
  let resultWord = pool[Math.floor(Math.random() * pool.length)];

  // 组合回复
  return `${foundWord}... ${resultWord}`;
}

// 启动服务器时，从数据库把所有学过的语料拉出来
db.query("SELECT content FROM nanami_corpus", (err, results) => {
  if (!err && results) {
    results.forEach((row) => learnText(row.content));
    console.log(`✅ 七实已从数据库中回忆起 ${results.length} 条语料！`);
  }
});

// 接口 1：读取七实的状态（她醒来时第一件事）
app.get("/api/nanami", (req, res) => {
  db.query("SELECT * FROM nanami_state WHERE id = 1", (err, results) => {
    if (err) return res.status(500).send(err);
    // 返回她所有的数据，包括心里的恐惧和爱
    res.json(results[0]);
  });
});

// 接口 2：保存七实的状态（她睡觉、被摸、或者关闭网页时）
app.post("/api/nanami", (req, res) => {
  // 🌟 把这两个值也解构出来
  const { affection, energy, wallFear, loveSeeking } = req.body;
  
  // 🌟 更新 SQL 语句，把恐惧和黏人也写进去
  const sql = "UPDATE nanami_state SET affection = ?, energy = ?, wall_fear = ?, love_seeking = ? WHERE id = 1";
  
  db.query(sql, [affection, energy, wallFear, loveSeeking], (err, result) => {
    if (err) {
      console.error("保存状态失败", err);
      return res.status(500).send(err);
    }
    res.json({ success: true });
  });
});

// ==========================================
// 🌟 接口 3：教七实说话（之前缺失的通道！）
// ==========================================
app.post("/api/teach", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ success: false });

  db.query(
    "INSERT INTO nanami_corpus (content) VALUES (?)",
    [text],
    (err, result) => {
      if (err) {
        console.error("存入语料失败", err);
        return res.status(500).send(err);
      }
      learnText(text); // 实时存入内存，马上生效
      res.json({ success: true, message: "七实学会了这句话！" });
    },
  );
});

// ==========================================
// 🌟 接口 4：七实的心智引擎 4.0（具备自我认知）
// ==========================================
app.post("/api/chat", async (req, res) => {
  const { message, energy, affection, wallFear, loveSeeking } = req.body;
  const msg = message.trim();

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 1. 名字绑定
  const nameRegex =
    /(?:你叫|你的名字是|以后你就叫)([a-zA-Z0-9\u4e00-\u9fa5]{1,10})/;
  const nameMatch = msg.match(nameRegex);

  if (nameMatch) {
    const newName = nameMatch[1];
    db.query(
      "UPDATE nanami_state SET name = ? WHERE id = 1",
      [newName],
      (err) => {
        if (err) console.error("名字存入失败", err);
      },
    );
    return res.json({
      reply: `（眼睛闪烁）唔... 记住啦！我是${newName}！`,
      newAffection: Math.min(100, affection + 5),
    });
  }

  // 2. 问名字（启动模糊匹配！让她自己拓宽对问题的理解）
  // 她脑海里的标准问题：
  const standardQuestions = ["你是谁", "你叫什么", "你的名字"];

  // 把你发的话，和标准问题逐一对比相似度
  let isAskingName = false;
  for (let q of standardQuestions) {
    // 如果相似度大于 0.4（包含关系或者错别字都能认出来）
    if (getSimilarity(msg, q) > 0.4 || msg.includes(q)) {
      isAskingName = true;
      break;
    }
  }

  // 如果她判断出你在问名字（或者你刚好只打了“你叫”两个字）
  if (isAskingName || msg === "你叫" || msg === "你是") {
    return res.json({
      reply: `（歪头）我是${herMemoryName}呀！你不记得我了吗？`,
    });
  }

  // 3. 叫名字 & 调用马尔可夫链
  db.query("SELECT name FROM nanami_state WHERE id = 1", (err, results) => {
    let herName =
      results && results[0] && results[0].name ? results[0].name : "七实";

    if (msg.includes(herName)) {
      return res.json({ reply: `（轮子转了转）！你在叫我吗？我在！` });
    }

    let reply = generateReplyFromMemory(msg); // 调用接龙引擎

    if (!reply) {
      let mood = energy < 20 ? "tired" : wallFear > 3 ? "scared" : "bored";
      const acts = ["（歪头）", "叽...", "（轮子转了转）"];
      reply = pick(acts) + "（似乎没听懂，但还是盯着你看）";
    }

    res.json({ reply: reply });
  });
});

app.listen(3000, () => {
  console.log("🚀 七实的神经中枢运行在 http://localhost:3000");
});
