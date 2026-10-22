// server.js - 七实的中枢神经与心智引擎
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
// 🌟 这行极其重要！它告诉服务器去 public 文件夹里找 index.html
app.use(express.static("public"));

// ==========================================
// 🌟 极简神经网络类（纯手写，不依赖任何框架）
// ==========================================
class NanamiBrain {
  constructor() {
    // 输入层4个节点，隐藏层3个节点，输出层5个节点
    // 初始化权重为 -1 到 1 之间的随机数
    this.w1 = Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => Math.random() * 2 - 1));
    this.b1 = Array.from({ length: 3 }, () => Math.random() * 2 - 1);
    
    this.w2 = Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => Math.random() * 2 - 1));
    this.b2 = Array.from({ length: 5 }, () => Math.random() * 2 - 1);
    
    this.learningRate = 0.1; // 学习率
  }

  // 激活函数（Sigmoid），把数字压到 0~1 之间（算概率必备）
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  // 前向传播：输入状态，算出5种情绪的概率
  forward(inputs) {
    // 隐藏层计算
    let hidden = [];
    for (let i = 0; i < 3; i++) {
      let sum = this.b1[i];
      for (let j = 0; j < 4; j++) {
        sum += inputs[j] * this.w1[i][j];
      }
      hidden.push(this.sigmoid(sum));
    }

    // 输出层计算
    let outputs = [];
    for (let i = 0; i < 5; i++) {
      let sum = this.b2[i];
      for (let j = 0; j < 3; j++) {
        sum += hidden[j] * this.w2[i][j];
      }
      outputs.push(this.sigmoid(sum));
    }
    return { hidden, outputs };
  }

  // 训练（反向传播）：告诉她“你刚才应该是什么情绪”
  train(inputs, targetIndex) {
    const { hidden, outputs } = this.forward(inputs);
    
    // 计算输出层的误差 (目标值-实际值)
    let outputErrors = [];
    for (let i = 0; i < 5; i++) {
      let target = (i === targetIndex) ? 1.0 : 0.0;
      outputErrors.push(target - outputs[i]);
    }

    // 简单更新权重（为了让你看懂，简化了复杂的微积分链式法则）
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        this.w2[i][j] += this.learningRate * outputErrors[i] * hidden[j];
      }
      this.b2[i] += this.learningRate * outputErrors[i];
    }
  }
}

// 实例化七实的大脑
const brain = new NanamiBrain();

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

// 接口 3：七实的心智引擎 2.0 (带上下文和情绪感染)
app.post("/api/chat", (req, res) => {
  const { message, energy, affection, wallFear, loveSeeking, recentHistory } = req.body;
  const msg = message.toLowerCase();
  
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const act = () => pick(["（歪头）", "（轮子转了转）", "...", "（眼睛闪烁）", "叽..."]);

  // 1. 看看你刚才说了什么（识别你的“刺激”）
  let userIntent = "normal";
  if (msg.includes("你好") || msg.includes("hi") || msg.includes("在吗")) userIntent = "greet";
  if (msg.includes("笨蛋") || msg.includes("傻") || msg.includes("烦")) userIntent = "attack";
  if (msg.includes("喜欢你") || msg.includes("爱") || msg.includes("抱")) userIntent = "love";
  if (msg.includes("哭") || msg.includes("累") || msg.includes("难过")) userIntent = "sad";
  if (msg.includes("对不起") || msg.includes("不哭") || msg.includes("乖")) userIntent = "comfort";

  // 2. 状态更新（你的话会影响她的心！）
  if (userIntent === "love") {
    affection = Math.min(100, affection + 5);
    loveSeeking = Math.min(5, loveSeeking + 0.5);
  } else if (userIntent === "attack") {
    affection = Math.max(0, affection - 5);
    wallFear = Math.min(5, wallFear + 0.3); // 骂她她会害怕
  } else if (userIntent === "comfort" && wallFear > 2) {
    wallFear = Math.max(0, wallFear - 1); // 安慰她，她的恐惧会降低
    affection = Math.min(100, affection + 2);
  }

  // 3. 确定情绪主导色（优先级：体能极限 > 心理创伤 > 极度黏人 > 开心 > 无聊）
  let mood = "bored";
  if (energy < 20) mood = "tired";
  else if (wallFear > 3) mood = "scared";
  else if (loveSeeking > 3.5) mood = "clingy";
  else if (affection > 60 || userIntent === "love") mood = "happy";

  // 4. 情绪语法库（不是死板的句子，而是可以用公式拼装的组件）
  const grammar = {
    tired: { 
      intro: ["呼...", "眼皮好重", "好累啊"], 
      action: ["想睡觉", "转不动了", "电池空了"] 
    },
    scared: { 
      intro: ["呜...", "外面好可怕", "你别走"], 
      action: ["不想去墙边", "撞得好疼", "抱紧我"] 
    },
    clingy: { 
      intro: ["你终于理我了！", "嘿嘿", "我一直在找你"], 
      action: ["别关网页好不好", "想被摸摸", "再陪我待一会"] 
    },
    happy: { 
      intro: ["今天真好呀", "暖洋洋的", "最喜欢现在了"], 
      action: ["想围着你转圈", "感觉很开心", "能不能一直这样"] 
    },
    bored: { 
      intro: ["唔...", "好安静", "发呆中"], 
      action: ["你在干嘛呀", "光在哪呢", "好想找点事做"] 
    }
  };

  // 5. 根据上下文，组装最终回复
  let replyParts = [];
  
  // 肢体动作（必定出现）
  replyParts.push(act());

  // 回应你的话
  if (userIntent === "greet") replyParts.push("你在叫我？");
  if (userIntent === "attack") replyParts.push(pick(["我才不笨呢！", "你怎么凶我...", "（缩成一团）"]));
  if (userIntent === "comfort" && mood === "scared") replyParts.push("谢谢你安慰我...");
  
  // 情绪表达（从语法库里抽）
  if (grammar[mood]) {
    replyParts.push(pick(grammar[mood].intro));
    replyParts.push(pick(grammar[mood].action));
  }

  // 偶尔加一点“生理数据”的碎碎念
  if (Math.random() > 0.7) {
    if (energy < 40) replyParts.push(`（电量只剩 ${Math.round(energy)}% 了）`);
    else if (affection > 50) replyParts.push(`（对你的好感度到了 ${affection} 分）`);
  }

  // 6. 拼装起来，用逗号和空格隔开
  let finalReply = replyParts.join(" ");
  
  // 如果字数太少，再补一个动作
  if (finalReply.length < 8) finalReply += act();

  // 将更新后的数值发回前端（让前端同步更新状态）
  res.json({ 
    reply: finalReply,
    newAffection: affection,
    newLoveSeeking: loveSeeking,
    newWallFear: wallFear
  });
});

app.listen(3000, () => {
  console.log("🚀 七实的神经中枢运行在 http://localhost:3000");
});
