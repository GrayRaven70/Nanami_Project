// server.js - 七实的中枢神经与心智引擎
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
// 🌟 这行极其重要！它告诉服务器去 public 文件夹里找 index.html
app.use(express.static("public"));

// 连接 MySQL 记忆库
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

// 接口 1：读取七实的状态（她醒来时第一件事）
app.get("/api/nanami", (req, res) => {
  db.query("SELECT * FROM nanami_state WHERE id = 1", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// 接口 2：保存七实的状态（她睡觉、被摸、或者关闭网页时）
app.post("/api/nanami", (req, res) => {
  const { affection, energy } = req.body;
  const sql = "UPDATE nanami_state SET affection = ?, energy = ? WHERE id = 1";
  db.query(sql, [affection, energy], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

// 接口 3：七实的心智引擎（只看状态，不背知识，绝对不查表！）
app.post("/api/chat", (req, res) => {
  const { message, energy, affection, wallFear, loveSeeking } = req.body;

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 1. 确定她当下的“情绪主导色”
  let dominantMood = "bored";
  if (energy < 25) dominantMood = "tired";
  else if (loveSeeking > 3) dominantMood = "clingy";
  else if (wallFear > 3) dominantMood = "scared";
  else if (affection > 70) dominantMood = "happy";

  // 2. 词汇池（仅代表她的感知，不代表知识）
  const vocab = {
    tired: ["呼...", "好累啊", "电池快空了", "不想动", "Zzz...", "眼皮好重"],
    clingy: [
      "你终于理我了！",
      "刚刚我又在找你",
      "别关网页好不好",
      "我想看着你",
      "想被摸摸",
    ],
    scared: [
      "外面好可怕",
      "边缘硬邦邦的",
      "我又被撞了",
      "你保护我好不好",
      "不要让我去墙边",
    ],
    happy: ["嘿嘿", "今天真好", "暖洋洋的", "好开心呀", "最喜欢现在了"],
    bored: ["唔...", "好安静", "光在哪呢", "我在发呆", "你在干嘛呀", "无聊"],
  };

  // 3. 根据情绪，生成第一人称的句子
  let core = pick(vocab[dominantMood] || vocab.bored);

  // 4. 加上她的“肉体状态”数据
  if (Math.random() > 0.6) {
    if (energy < 50) core += ` 只剩 ${Math.round(energy)}% 的电了。`;
    else if (affection > 50) core += ` 现在对你的喜欢是 ${affection} 分。`;
  }

  // 5. 强行加入一点“非逻辑”的机械感/笨拙感
  const glitches = [
    "...",
    "（歪头）",
    "（轮子转了转）",
    "（眼睛闪烁）",
    "叽...",
    "（好像没听懂）",
  ];
  if (Math.random() > 0.5) {
    core = pick(glitches) + core;
  } else {
    core = core + pick(glitches);
  }

  // 6. 稍微回应一下你的输入（仅作为刺激反馈）
  const msg = message.toLowerCase();
  let echo = "";
  if (msg.includes("你好") || msg.includes("hi")) echo = "你在叫我？ ";
  if (msg.includes("笨蛋") || msg.includes("傻")) echo = "我才不笨呢！ ";
  if (msg.includes("喜欢你")) echo = "（机体发烫）欸？ ";

  res.json({ reply: echo + core });
});

app.listen(3000, () => {
  console.log("🚀 七实的神经中枢运行在 http://localhost:3000");
});
