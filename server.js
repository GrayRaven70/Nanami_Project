const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析 JSON 请求
app.use(express.static("public")); // 🌟 就是这行！让服务器去 public 文件夹找网页！

// 连接 MySQL
const db = mysql.createConnection({
  host: "localhost",
  port: 3366,
  user: "root", // 你的 MySQL 用户名
  password: "123", // ⚠️ 如果你的密码不是 123，记得改！
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

app.listen(3000, () => {
  console.log("🚀 七实的神经中枢运行在 http://localhost:3000");
});
