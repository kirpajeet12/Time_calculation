import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const EMP_FILE = path.join(__dirname, "data/employees.json");
const LOG_FILE = path.join(__dirname, "data/worklogs.json");

const read = file => JSON.parse(fs.readFileSync(file));
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

/* ===================== EMPLOYEES ===================== */
app.get("/employees", (req, res) => {
  res.json(read(EMP_FILE));
});

app.post("/employees", (req, res) => {
  const employees = read(EMP_FILE);
  employees.push({ id: Date.now().toString(), ...req.body });
  write(EMP_FILE, employees);
  res.sendStatus(200);
});

/* ===================== WORK LOGS ===================== */
app.post("/worklog", (req, res) => {
  const { employeeId, date, startTime, endTime } = req.body;

  const toMin = t => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const hours = (toMin(endTime) - toMin(startTime)) / 60;

  const logs = read(LOG_FILE);
  logs.push({ employeeId, date, startTime, endTime, hours });
  write(LOG_FILE, logs);

  res.sendStatus(200);
});

app.get("/worklog", (req, res) => {
  res.json(read(LOG_FILE));
});

/* ===================== START ===================== */
app.listen(3000, "0.0.0.0", () => {
  console.log("✅ Running at http://localhost:3000");
});
