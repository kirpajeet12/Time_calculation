import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = path.join(__dirname, "data.json");

// Initialize data file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ employees: [] }, null, 2));
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ⏱ Calculate hours between times
function calculateHours(start, end) {
  const startTime = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);
  const diffMs = endTime - startTime;
  return Math.max(diffMs / (1000 * 60 * 60), 0).toFixed(2);
}

/* ===========================
   EMPLOYEES
=========================== */

app.post("/employees", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  const data = readData();
  if (data.employees.find(e => e.name === name)) {
    return res.json({ message: "Employee already exists" });
  }

  data.employees.push({
    name,
    entries: [],
    total: 0
  });

  saveData(data);
  res.json({ success: true });
});

app.get("/employees", (req, res) => {
  const data = readData();

  const result = data.employees.map(emp => {
    const total = emp.entries.reduce((sum, e) => sum + Number(e.hours), 0);
    return { ...emp, total: total.toFixed(2) };
  });

  res.json(result);
});

/* ===========================
   WORK ENTRIES
=========================== */

app.post("/work", (req, res) => {
  const { employee, date, start, end } = req.body;

  if (!employee || !date || !start || !end) {
    return res.status(400).json({ error: "All fields required" });
  }

  const data = readData();
  const emp = data.employees.find(e => e.name === employee);

  if (!emp) {
    return res.status(404).json({ error: "Employee not found" });
  }

  const hours = calculateHours(start, end);

  emp.entries.push({
    date,
    start,
    end,
    hours
  });

  saveData(data);
  res.json({ success: true });
});

/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {
  console.log(`✅ Running at http://localhost:${PORT}`);
});
