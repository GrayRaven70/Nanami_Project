// server.js - 七实的中枢神经与心智引擎
const express = require("express"); //引入Express框架，是一个简洁而灵活的Node.js Web应用框架
const mysql = require("mysql2");  //引入MySQL2库，用于连接和操作MySQL数据库
const cors = require("cors"); //引入CORS中间件，允许跨域请求

// ==========================================
// 🌟 模糊匹配算法（计算两个词有多像） 
// ==========================================
function getSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));
//动态规划
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
//编辑距离算法
//注意，该算法根本没办法解决“你是谁”和“你叫什么”这种语义相似的问题，只能解决错别字、拼写错误、字符缺失等问题。
//AI用的是词向量，通过大数据训练出来的模型，能理解语义相似度，而不是单纯的字符相似度。
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
let loadedDictionary = new Set(); // 用 Set 存词典，查找速度极快（O(1)时间复杂度）
let wordCounts = {}; // 记录每个词出现的总次数，用来算概率

// 1. 学习：聪明地切词并建立语义连线
function learnText(text) {
  // 先去掉标点符号
  let cleanText = text.replace(/[，。！？\s]/g, ''); 
  let finalWords = [];
  let i = 0;

  // 🌟 核心算法：最大正向匹配
  while (i < cleanText.length) {
    let matched = false;
    
    // 每次尝试切取最多 4 个字（比如“大肥鱼”是 3 个字，最多尝试切 4 个）
    // 从长到短找，这样能优先切出“大肥鱼”，而不是“大肥”+“鱼”
    for (let len = 4; len > 0; len--) {
      let word = cleanText.substring(i, i + len);
      
      // 如果这个词在基础词典里，或者在之前学过的网络里
      if (loadedDictionary.has(word) || semanticNetwork[word]) {
        finalWords.push(word);
        i += len;
        matched = true;
        break;
      }
    }

    // 如果实在没在词典里找到，就把这一个字单独切出来（比如生僻字）
    if (!matched) {
      finalWords.push(cleanText[i]);
      i++;
    }
  }

  // 打印出来看看她是怎么切词的（方便你调试）
  console.log(`✂️ 七实将句子切分为：`, finalWords);

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
 
// 2. 思考：基于概率联想生成句子（升级版：多步漫游）
  function generateReplyFromMemory(input) {
    // 1. 看看输入里有没有她认识的词
    let foundWord = null;
    for (let w in semanticNetwork) {
      if (input.includes(w)) {
        foundWord = w;
        break;
      }
    }

    if (!foundWord) return null;

    // 2. 开始多步游走（接龙）
    let currentWord = foundWord;
    let resultWords = [currentWord]; // 把这个词放进篮子里
    let visited = new Set([currentWord]); // 🌟 核心：记录走过的路，防止在原地打转（比如 A->B->A）

    // 我们让她最多走 5 步（你可以改成 8 步，让她变成终极话痨）
    for (let step = 0; step < 5; step++) {
      let relatedWords = semanticNetwork[currentWord];
      if (!relatedWords) break;

      // 用之前的“抽奖箱”逻辑，根据权重抽下一个词
      let pool = [];
      for (let rw in relatedWords) {
        // 🌟 如果这个词刚才已经说过了，就不放进抽奖箱，防止啰嗦
        if (!visited.has(rw)) {
          for (let i = 0; i < relatedWords[rw]; i++) {
            pool.push(rw);
          }
        }
      }

      // 如果抽奖箱空了（说明没词可接了），就停下来
      if (pool.length === 0) break;

      // 抽下一个词
      let nextWord = pool[Math.floor(Math.random() * pool.length)];

      // 把新词加入篮子和已访问记录
      resultWords.push(nextWord);
      visited.add(nextWord);

      // 把当前词更新，为下一步做准备
      currentWord = nextWord;
    }

    // 3. 组合回复（用省略号连接，显得她很笨拙）
    // 比如：“喜欢... 欢看... 看星... 星星”
    return resultWords.join("... ");
  }

// ==========================================
// 🌟 启动时：加载名字、加载词典、再回忆语料
// ==========================================
db.query("SELECT name FROM nanami_state WHERE id = 1", (err, results) => {
  if (!err && results && results[0] && results[0].name) {
    herMemoryName = results[0].name;
    console.log(`✅ 七实记起了自己的名字：${herMemoryName}`);
  }
});

// 🌟 核心修复：先加载字典
db.query("SELECT word FROM nanami_dictionary", (err, results) => {
  if (!err && results) {
    results.forEach(row => loadedDictionary.add(row.word));
    console.log(`📖 七实已从数据库中加载了 ${loadedDictionary.size} 个词汇！`);
    
    // 🌟 等字典加载完，再开始回忆语料并切词！
    db.query("SELECT content FROM nanami_corpus", (err2, results2) => {
      if (!err2 && results2) {
        results2.forEach((row) => learnText(row.content));
        console.log(`✅ 七实已从数据库中回忆起 ${results2.length} 条语料！`);
      }
    });

  } else {
    console.log("❌ 词典加载失败，请检查表！");
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

  // 🌟 肥鱼修复：教说话的时候，也要判断是不是在教名字
  const nameRegex =
    /(?:你叫|你的名字是|以后你就叫)([a-zA-Z0-9\u4e00-\u9fa5]{1,10})/;
  const isQuestion =
    text.includes("什么") || text.includes("谁") || text.includes("？");
  const nameMatch = !isQuestion ? text.match(nameRegex) : null;

  if (nameMatch) {
    const newName = nameMatch[1];
    herMemoryName = newName; // 更新内存
    db.query("UPDATE nanami_state SET name = ? WHERE id = 1", [newName]); // 更新数据库
  }

  db.query(
    "INSERT INTO nanami_corpus (content) VALUES (?)",
    [text],
    (err, result) => {
      if (err) {
        console.error("存入语料失败", err);
        return res.status(500).send(err);
      }
      learnText(text);
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

  // 🌟 赛博脑电图开始
  //console.log(`\n========== 收到消息 ==========`);
  //console.log(`[你的输入]: ${msg}`);
  //console.log(`[七实脑海里的词库]:`, Object.keys(semanticNetwork));
  // 🌟 赛博脑电图结束

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 1. 名字绑定
  const nameRegex =
    /(?:你叫|你的名字是|以后你就叫)([a-zA-Z0-9\u4e00-\u9fa5]{1,10})/;
  const nameMatch = msg.match(nameRegex);

  if (nameMatch) {
    const newName = nameMatch[1];
    herMemoryName = newName; // 🌟 加上这一行，肥鱼在此！
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
