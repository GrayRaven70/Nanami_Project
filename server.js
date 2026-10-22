// server.js - 七实的中枢神经与心智引擎
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

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
let brainMemory = {}; // 存放学到的词语接龙

// 学习文本，切分单词
function learnText(text) {
  // 按标点和空格切分词汇
  const words = text
    .replace(/[，。！？\s]/g, " ")
    .split(" ")
    .filter((w) => w.length > 0);
  for (let i = 0; i < words.length - 1; i++) {
    let current = words[i];
    let next = words[i + 1];
    if (!brainMemory[current]) brainMemory[current] = [];
    brainMemory[current].push(next);
  }
}

// 根据输入，利用马尔可夫链生成回复
function generateReplyFromMemory(input) {
  const words = input
    .replace(/[，。！？\s]/g, " ")
    .split(" ")
    .filter((w) => w.length > 0);
  let startWord = words.find((w) => brainMemory[w]);

  if (!startWord) return null;

  let current = startWord;
  let result = [current];

  // 接龙最多 5 个词
  for (let i = 0; i < 5; i++) {
    let nexts = brainMemory[current];
    if (!nexts || nexts.length === 0) break;
    current = nexts[Math.floor(Math.random() * nexts.length)];
    result.push(current);
  }
  return result.join("");
}

// 启动服务器时，从数据库把所有学过的语料拉出来
db.query("SELECT content FROM nanami_corpus", (err, results) => {
  if (!err && results) {
    results.forEach((row) => learnText(row.content));
    console.log(`✅ 七实已从数据库中回忆起 ${results.length} 条语料！`);
  }
});

// ==========================================
// 接口 1 & 2：读取和保存状态
// ==========================================
app.get("/api/nanami", (req, res) => {
  db.query("SELECT * FROM nanami_state WHERE id = 1", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

app.post("/api/nanami", (req, res) => {
  const { affection, energy } = req.body;
  const sql = "UPDATE nanami_state SET affection = ?, energy = ? WHERE id = 1";
  db.query(sql, [affection, energy], (err, result) => {
    if (err) return res.status(500).send(err);
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

  // 2. 问名字
  if (msg.includes("你叫什么") || msg.includes("你是谁")) {
    db.query("SELECT name FROM nanami_state WHERE id = 1", (err, results) => {
      let herName =
        results && results[0] && results[0].name ? results[0].name : "七实";
      return res.json({ reply: `（歪头）我是${herName}呀！你不记得我了吗？` });
    });
    return;
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
