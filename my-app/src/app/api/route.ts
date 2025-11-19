let tasks: { id: number; title: string; done: boolean }[] = [];
let nextId = 1;

export async function GET() {
  return Response.json(tasks);
}

export async function POST(req: Request) {
  const { title } = await req.json();
  if (!title)
    return Response.json({ error: "title required" }, { status: 400 });

  const newTask = { id: nextId++, title, done: false };
  tasks.push(newTask);
  return Response.json(newTask, { status: 201 });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const { done } = await req.json();

  const task = tasks.find((t) => t.id === id);
  if (!task) return Response.json({ error: "Not found" }, { status: 404 });

  task.done = done;
  return Response.json(task);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  tasks = tasks.filter((t) => t.id !== id);
  return Response.json({ ok: true });
}
