import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = path.join(__dirname, "hours.json");

/* =========================
   ADD DAILY HOURS
========================= */
app.post("/add-hours", (req, res) => {
  const { name, date, hours } = req.body;

  if (!name || !date || !hours) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  data.push({
    name,
    date,
    hours: Number(hours)
  });

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

/* =========================
   MONTHLY SUMMARY
========================= */
app.get("/summary/:month", (req, res) => {
  const month = req.params.month; // YYYY-MM
  const data = JSON.parse(fs.readFileSync(DATA_FILE));

  const summary = {};

  data.forEach(entry => {
    if (entry.date.startsWith(month)) {
      if (!summary[entry.name]) summary[entry.name] = 0;
      summary[entry.name] += entry.hours;
    }
  });

  res.json(summary);
});

/* =========================
   START SERVER
========================= */
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Running at http://localhost:${PORT}`)
);
