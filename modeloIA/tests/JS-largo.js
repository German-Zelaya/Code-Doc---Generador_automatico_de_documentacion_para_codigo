import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const users = new Map();
const sessions = new Map();
const projects = new Map();
const tasks = new Map();

function id() {
  return crypto.randomUUID();
}

function now() {
  return Date.now();
}

function paginate(arr, page = 1, size = 10) {
  const p = Math.max(1, Number(page) || 1);
  const s = Math.max(1, Math.min(100, Number(size) || 10));
  const start = (p - 1) * s;
  const end = start + s;
  return { items: arr.slice(start, end), page: p, size: s, total: arr.length };
}

function authorize(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "no_token" });
  const session = sessions.get(token);
  if (!session || session.expires < now()) return res.status(401).json({ error: "invalid_token" });
  req.userId = session.userId;
  next();
}

app.post("/users", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "invalid_input" });
  if ([...users.values()].some(u => u.email === email)) return res.status(409).json({ error: "email_exists" });
  const uid = id();
  users.set(uid, { id: uid, name, email, password, createdAt: now() });
  res.status(201).json({ id: uid, name, email });
});

app.post("/sessions", (req, res) => {
  const { email, password } = req.body || {};
  const user = [...users.values()].find(u => u.email === email);
  if (!user || user.password !== password) return res.status(401).json({ error: "invalid_credentials" });
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { token, userId: user.id, createdAt: now(), expires: now() + 1000 * 60 * 30 });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post("/projects", authorize, (req, res) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: "invalid_input" });
  const pid = id();
  projects.set(pid, { id: pid, ownerId: req.userId, name, description: description || "", createdAt: now() });
  res.status(201).json(projects.get(pid));
});

app.get("/projects", authorize, (req, res) => {
  const { page, size, q } = req.query;
  const list = [...projects.values()].filter(p => p.ownerId === req.userId && (!q || p.name.toLowerCase().includes(String(q).toLowerCase())));
  const sorted = list.sort((a, b) => b.createdAt - a.createdAt);
  res.json(paginate(sorted, page, size));
});

app.get("/projects/:id", authorize, (req, res) => {
  const p = projects.get(req.params.id);
  if (!p || p.ownerId !== req.userId) return res.status(404).json({ error: "not_found" });
  res.json(p);
});

app.patch("/projects/:id", authorize, (req, res) => {
  const p = projects.get(req.params.id);
  if (!p || p.ownerId !== req.userId) return res.status(404).json({ error: "not_found" });
  const { name, description } = req.body || {};
  if (name) p.name = name;
  if (typeof description === "string") p.description = description;
  res.json(p);
});

app.delete("/projects/:id", authorize, (req, res) => {
  const p = projects.get(req.params.id);
  if (!p || p.ownerId !== req.userId) return res.status(404).json({ error: "not_found" });
  projects.delete(p.id);
  for (const t of [...tasks.values()]) if (t.projectId === p.id) tasks.delete(t.id);
  res.status(204).end();
});

app.post("/projects/:id/tasks", authorize, (req, res) => {
  const p = projects.get(req.params.id);
  if (!p || p.ownerId !== req.userId) return res.status(404).json({ error: "not_found" });
  const { title, dueDate, priority } = req.body || {};
  if (!title) return res.status(400).json({ error: "invalid_input" });
  const tid = id();
  tasks.set(tid, {
    id: tid,
    projectId: p.id,
    title,
    status: "pending",
    priority: priority || "normal",
    dueDate: dueDate || null,
    createdAt: now(),
    updatedAt: now()
  });
  res.status(201).json(tasks.get(tid));
});

app.get("/projects/:id/tasks", authorize, (req, res) => {
  const p = projects.get(req.params.id);
  if (!p || p.ownerId !== req.userId) return res.status(404).json({ error: "not_found" });
  const { page, size, status, sort } = req.query;
  let list = [...tasks.values()].filter(t => t.projectId === p.id);
  if (status) list = list.filter(t => t.status === status);
  if (sort === "priority") list = list.sort((a, b) => String(a.priority).localeCompare(String(b.priority)));
  else list = list.sort((a, b) => b.createdAt - a.createdAt);
  res.json(paginate(list, page, size));
});

app.patch("/tasks/:id", authorize, (req, res) => {
  const t = tasks.get(req.params.id);
  if (!t) return res.status(404).json({ error: "not_found" });
  const p = projects.get(t.projectId);
  if (!p || p.ownerId !== req.userId) return res.status(403).json({ error: "forbidden" });
  const { title, status, priority, dueDate } = req.body || {};
  if (title) t.title = title;
  if (status) t.status = status;
  if (priority) t.priority = priority;
  if (typeof dueDate !== "undefined") t.dueDate = dueDate;
  t.updatedAt = now();
  res.json(t);
});

app.delete("/tasks/:id", authorize, (req, res) => {
  const t = tasks.get(req.params.id);
  if (!t) return res.status(404).json({ error: "not_found" });
  const p = projects.get(t.projectId);
  if (!p || p.ownerId !== req.userId) return res.status(403).json({ error: "forbidden" });
  tasks.delete(t.id);
  res.status(204).end();
});

app.get("/stats", authorize, (req, res) => {
  const ps = [...projects.values()].filter(p => p.ownerId === req.userId);
  const ids = new Set(ps.map(p => p.id));
  const ts = [...tasks.values()].filter(t => ids.has(t.projectId));
  const total = ts.length;
  const completed = ts.filter(t => t.status === "done" || t.status === "completed").length;
  const pending = ts.filter(t => t.status === "pending").length;
  res.json({ projects: ps.length, tasks: total, completed, pending });
});

app.listen(3000);