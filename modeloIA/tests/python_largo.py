from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from uuid import uuid4
from time import time

app = FastAPI()

users: Dict[str, dict] = {}
sessions: Dict[str, dict] = {}
projects: Dict[str, dict] = {}
tasks: Dict[str, dict] = {}

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class SessionCreate(BaseModel):
    email: str
    password: str

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    due_date: Optional[str] = None
    priority: Optional[str] = "normal"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

def now() -> int:
    return int(time() * 1000)

def authorize(token: Optional[str]) -> str:
    if not token:
        raise HTTPException(status_code=401, detail="no_token")
    s = sessions.get(token)
    if not s or s["expires"] < now():
        raise HTTPException(status_code=401, detail="invalid_token")
    return s["user_id"]

def paginate(items: List[dict], page: Optional[int], size: Optional[int]):
    p = max(1, int(page or 1))
    s = max(1, min(100, int(size or 10)))
    start = (p - 1) * s
    end = start + s
    return {"items": items[start:end], "page": p, "size": s, "total": len(items)}

@app.post("/users")
def create_user(payload: UserCreate):
    if any(u["email"] == payload.email for u in users.values()):
        raise HTTPException(status_code=409, detail="email_exists")
    uid = str(uuid4())
    users[uid] = {"id": uid, "name": payload.name, "email": payload.email, "password": payload.password, "created_at": now()}
    return {"id": uid, "name": payload.name, "email": payload.email}

@app.post("/sessions")
def create_session(payload: SessionCreate):
    user = next((u for u in users.values() if u["email"] == payload.email), None)
    if not user or user["password"] != payload.password:
        raise HTTPException(status_code=401, detail="invalid_credentials")
    token = uuid4().hex
    sessions[token] = {"token": token, "user_id": user["id"], "created_at": now(), "expires": now() + 30 * 60 * 1000}
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}

@app.post("/projects")
def create_project(payload: ProjectCreate, authorization: Optional[str] = Header(None)):
    uid = authorize(authorization)
    pid = str(uuid4())
    projects[pid] = {"id": pid, "owner_id": uid, "name": payload.name, "description": payload.description or "", "created_at": now()}
    return projects[pid]

@app.get("/projects")
def list_projects(page: Optional[int] = None, size: Optional[int] = None, q: Optional[str] = None, authorization: Optional[str] = Header(None)):
    uid = authorize(authorization)
    items = [p for p in projects.values() if p["owner_id"] == uid]
    if q:
        ql = q.lower()
        items = [p for p in items if ql in p["name"].lower()]
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return paginate(items, page, size)

@app.get("/projects/{pid}")
def get_project(pid: str, authorization: Optional[str] = Header(None)):
    uid = authorize(authorization)
    p = projects.get(pid)
    if not p or p["owner_id"] != uid:
        raise HTTPException(status_code=404, detail="not_found")
    return p

@app.patch("/projects/{pid}")
def update_project(pid: str, payload: ProjectUpdate, authorization: Optional[str] = Header(None)):
    uid = authorize(authorization)
    p = projects.get(pid)
    if not p or p["owner_id"] != uid:
        raise HTTPException(status_code=404, detail="not_found")
    if payload.name is not None:
        p["name"] = payload.name
    if payload.description is not None:
        p["description"] = payload.description
    return p

@app.delete("/projects/{pid}")
def delete_project(pid: str, authorization: Optional[str] = Header(None)):
    uid = authorize(authorization)
    p = projects.get(pid)
    if not p or p["owner_id"] != uid:
        raise HTTPException(status_code=404, detail="not_found")
    del projects[pid]
    for tid, t in list(tasks.items()):
        if t["project_id"] == pid:
            del tasks[tid]
    return {"deleted": True}

@app.post("/projects/{pid}/tasks")
def create_task(pid: str, payload: TaskCreate, authorization: Optional[str] = Header(None)):
    uid = authorize(authorization)
    p = projects.get(pid)
    if not p or p["owner_id"] != uid:
        raise HTTPException(status_code=404, detail="not_found")
    tid = str(uuid4())
    tasks[tid] = {
        "id": tid,
        "project_id": pid,
        "title": payload.title,
        "status": "pending",
        "priority": payload.priority or "normal",
        "due_date": payload.due_date,
        "created_at": now(),
        "updated_at": now(),
    }
    return tasks[tid]

@app.get("/projects/{pid}/tasks")
def list_tasks(pid: str, page: Optional[int] = None, size: Optional[int] = None, status: Optional[str] = None, sort: Optional[str] = None, authorization: Optional[str] = Header(None)):
    uid = authorize(authorization)
    p = projects.get(pid)
    if not p or p["owner_id"] != uid:
        raise HTTPException(status_code=404, detail="not_found")
    items = [t for t in tasks.values() if t["project_id"] == pid]
    if status:
        items = [t for t in items if t["status"] == status]
    if sort == "priority":
        items.sort(key=lambda x: str(x["priority"]))
    else:
        items.sort(key=lambda x: x["created_at"], reverse=True)
    return paginate(items, page, size)

@app.patch("/tasks/{tid}")
def update_task(tid: str, payload: TaskUpdate, authorization: Optional[str] = Header(None)):
    uid = authorize(authorization)
    t = tasks.get(tid)
    if not t:
        raise HTTPException(status_code=404, detail="not_found")
    p = projects.get(t["project_id"])
    if not p or p["owner_id"] != uid:
        raise HTTPException(status_code=403, detail="forbidden")
    if payload.title is not None:
        t["title"] = payload.title
    if payload.status is not None:
        t["status"] = payload.status
    if payload.priority is not None:
        t["priority"] = payload.priority
    if payload.due_date is not None:
        t["due_date"] = payload.due_date
    t["updated_at"] = now()
    return t

@app.delete("/tasks/{tid}")
def delete_task(tid: str, authorization: Optional[str] = Header(None)):
    uid = authorize(authorization)
    t = tasks.get(tid)
    if not t:
        raise HTTPException(status_code=404, detail="not_found")
    p = projects.get(t["project_id"])
    if not p or p["owner_id"] != uid:
        raise HTTPException(status_code=403, detail="forbidden")
    del tasks[tid]
    return {"deleted": True}

@app.get("/stats")
def stats(authorization: Optional[str] = Header(None)):
    uid = authorize(authorization)
    ps = [p for p in projects.values() if p["owner_id"] == uid]
    ids = set(p["id"] for p in ps)
    ts = [t for t in tasks.values() if t["project_id"] in ids]
    total = len(ts)
    completed = len([t for t in ts if t["status"] in ("done", "completed")])
    pending = len([t for t in ts if t["status"] == "pending"])
    return {"projects": len(ps), "tasks": total, "completed": completed, "pending": pending}