import React, { useEffect, useMemo, useState } from "react";

// --- Helpers ---------------------------------------------------------------
const STORAGE_KEY = "schoolPlannerData_v1";
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);

function useLocalState(defaultState) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultState;
    } catch {
      return defaultState;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);
  return [state, setState];
}

function Section({ title, subtitle, right, children }) {
  return (
    <section className="mb-8">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        {children}
      </div>
    </section>
  );
}

function Badge({ children, className = "" }) {
  return (
    <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 " + className}>
      {children}
    </span>
  );
}

function ProgressBar({ value }) {
  const v = Math.min(100, Math.max(0, Math.round(value || 0)));
  return (
    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${v}%` }} />
    </div>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 " +
        (props.className || "")
      }
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={
        "w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 resize-y min-h-[90px] " +
        (props.className || "")
      }
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={
        "w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700 " +
        (props.className || "")
      }
    >
      {props.children}
    </select>
  );
}

function Checkbox({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      className="size-4 rounded border-zinc-300 dark:border-zinc-600"
      checked={!!checked}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  );
}

function IconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={
        "px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed " +
        (props.className || "")
      }
    >
      {children}
    </button>
  );
}

// --- Default dataset -------------------------------------------------------
const defaultData = {
  theme: "light",
  profile: { name: "", year: new Date().getFullYear(), school: "" },
  goals: [],
  schedule: [], // { id, subject, day, start, end, location }
  homework: [], // { id, title, subject, due, notes, done }
  todos: [], // { id, date, text, done, category }
  books: [], // { id, title, author, cover, status, pagesRead, totalPages, genre, comment, rating, startDate, endDate }
};

// --- Main App --------------------------------------------------------------
export default function App() {
  const [data, setData] = useLocalState(defaultData);
  const [tab, setTab] = useState("overview");

  const toggleTheme = () =>
    setData((d) => ({ ...d, theme: d.theme === "dark" ? "light" : "dark" }));

  useEffect(() => {
    if (data.theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [data.theme]);

  const save = (patch) => setData((d) => ({ ...d, ...patch }));

  // Quick stats
  const stats = useMemo(() => {
    const goalsDone = data.goals.filter((g) => g.done).length;
    const goalsTotal = data.goals.length || 1;
    const hwPending = data.homework.filter((h) => !h.done).length;
    const today = todayISO();
    const todayTodos = data.todos.filter((t) => t.date === today);
    const todoDone = todayTodos.filter((t) => t.done).length;
    const booksReading = data.books.filter((b) => b.status === "Уншиж буй").length;
    return { goalsDone, goalsTotal, hwPending, todoDone, todayTodos: todayTodos.length, booksReading };
  }, [data]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `school-planner-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (file) => {
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      setData(parsed);
      alert("Амжилттай импортлолоо!");
    } catch {
      alert("Импортлох явцад алдаа гарлаа.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-zinc-900 dark:bg-white" />
            <div>
              <h1 className="text-2xl font-bold">Сургуулийн жилийн төлөвлөгч</h1>
              <p className="text-sm text-zinc-500">Таны зорилго, цагийн хуваарь, даалгавар, үйл ажиллагаа, номын тэмдэглэл—all in one.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconButton title="Экспорт JSON" onClick={exportJSON}>Экспорт</IconButton>
            <label className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
              Импорт
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
            </label>
            <IconButton title="Гэрэл/Харанхуй" onClick={toggleTheme}>{data.theme === "dark" ? "☀️" : "🌙"}</IconButton>
          </div>
        </header>

        {/* Profile quick edit */}
        <Section title="Ерөнхий мэдээлэл" subtitle="Нэр, сургууль, хичээлийн жил">
          <div className="grid sm:grid-cols-3 gap-3">
            <TextInput placeholder="Нэр" value={data.profile.name} onChange={(e) => save({ profile: { ...data.profile, name: e.target.value } })} />
            <TextInput placeholder="Сургууль" value={data.profile.school} onChange={(e) => save({ profile: { ...data.profile, school: e.target.value } })} />
            <TextInput type="number" placeholder="Хичээлийн жил (2025 гэх мэт)" value={data.profile.year} onChange={(e) => save({ profile: { ...data.profile, year: Number(e.target.value) || new Date().getFullYear() } })} />
          </div>
        </Section>

        {/* Tabs */}
        <div className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur border-y border-zinc-200 dark:border-zinc-800 my-4">
          <nav className="flex flex-wrap gap-2 p-2">
            {[
              ["overview", "Нүүр"],
              ["goals", "Зорилго"],
              ["schedule", "Хичээлийн хувиар"],
              ["homework", "Гэрийн даалгавар"],
              ["todos", "Хичээлээс гадуурх"],
              ["books", "Номын тэмдэглэл"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={
                  "px-4 py-2 rounded-2xl border text-sm " +
                  (tab === key
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-200 dark:border-zinc-800"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900")
                }
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {tab === "overview" && <Overview data={data} />}
        {tab === "goals" && <Goals data={data} save={save} />}
        {tab === "schedule" && <Schedule data={data} save={save} />}
        {tab === "homework" && <Homework data={data} save={save} />}
        {tab === "todos" && <Todos data={data} save={save} />}
        {tab === "books" && <Books data={data} save={save} />}

        <footer className="text-center text-xs text-zinc-500 mt-8 pb-8">© {new Date().getFullYear()} Таны хувийн төлөвлөгч — LocalStorage дээр хадгална.</footer>
      </div>
    </div>
  );
}

// --- Overview --------------------------------------------------------------
function Overview({ data }) {
  const today = todayISO();
  const todayTodos = data.todos.filter((t) => t.date === today);
  const hwSoon = [...data.homework]
    .filter((h) => !h.done)
    .sort((a, b) => (a.due || "") > (b.due || "") ? 1 : -1)
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <Section title="Өнөөдөр" subtitle={today}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
              <h3 className="font-medium mb-2">Өнөөдрийн хийх ажил</h3>
              {todayTodos.length === 0 ? (
                <p className="text-sm text-zinc-500">Өнөөдөр хийх зүйл оруулаагүй байна.</p>
              ) : (
                <ul className="space-y-2">
                  {todayTodos.map((t) => (
                    <li key={t.id} className="flex items-center justify-between">
                      <span className={t.done ? "line-through text-zinc-400" : ""}>{t.text}</span>
                      <Badge>{t.category || "Тэмдэглэл"}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
              <h3 className="font-medium mb-2">Ойрын даалгавар</h3>
              {hwSoon.length === 0 ? (
                <p className="text-sm text-zinc-500">Ирэх даалгавар алга.</p>
              ) : (
                <ul className="space-y-2">
                  {hwSoon.map((h) => (
                    <li key={h.id} className="flex items-center justify-between">
                      <span className="truncate max-w-[70%]">{h.title} — <span className="text-xs text-zinc-500">{h.subject}</span></span>
                      <Badge>{h.due || "Төрөөгүй"}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Section>
      </div>
      <div className="md:col-span-1">
        <Section title="Товч статистик">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Зорилго" value={`${data.goals.filter((g) => g.done).length}/${data.goals.length || 0}`} />
            <Stat label="Даалгавар (идэвхтэй)" value={`${data.homework.filter((h) => !h.done).length}`} />
            <Stat label="Өнөөдрийн ажил" value={`${data.todos.filter((t) => t.date === today).length}`} />
            <Stat label="Ном (уншиж буй)" value={`${data.books.filter((b) => b.status === "Уншиж буй").length}`} />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

// --- Goals -----------------------------------------------------------------
function Goals({ data, save }) {
  const [form, setForm] = useState({ text: "", category: "Ерөнхий", deadline: "" });
  const add = () => {
    if (!form.text.trim()) return;
    const goal = { id: uid(), ...form, done: false, createdAt: todayISO() };
    save({ goals: [goal, ...data.goals] });
    setForm({ text: "", category: form.category, deadline: "" });
  };
  const toggle = (id) => save({ goals: data.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)) });
  const remove = (id) => save({ goals: data.goals.filter((g) => g.id !== id) });

  return (
    <>
      <Section title="Хичээлийн жилийн зорилго">
        <div className="grid sm:grid-cols-6 gap-3 mb-3">
          <div className="sm:col-span-3"><TextInput placeholder="Зорилгооо бичих" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
          <div className="sm:col-span-1">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {["Ерөнхий", "Сурлага", "Эрүүл мэнд", "Санхүү", "Хобби"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-1"><TextInput type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          <div className="sm:col-span-1"><PrimaryButton onClick={add}>Нэмэх</PrimaryButton></div>
        </div>
        {data.goals.length === 0 ? (
          <p className="text-sm text-zinc-500">Одоогоор зорилго байхгүй.</p>
        ) : (
          <ul className="space-y-2">
            {data.goals.map((g) => (
              <li key={g.id} className="flex items-center gap-3 justify-between border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <Checkbox checked={g.done} onChange={() => toggle(g.id)} />
                  <div>
                    <div className={g.done ? "line-through text-zinc-400" : "font-medium"}>{g.text}</div>
                    <div className="text-xs text-zinc-500 flex gap-2">
                      <Badge>{g.category}</Badge>
                      {g.deadline && <span>Дуусгах: {g.deadline}</span>}
                    </div>
                  </div>
                </div>
                <IconButton title="Устгах" onClick={() => remove(g.id)}>✕</IconButton>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

// --- Schedule --------------------------------------------------------------
const days = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
function Schedule({ data, save }) {
  const [form, setForm] = useState({ subject: "", day: days[0], start: "08:00", end: "08:45", location: "" });
  const add = () => {
    if (!form.subject.trim()) return;
    const item = { id: uid(), ...form };
    save({ schedule: [...data.schedule, item] });
    setForm({ ...form, subject: "", location: "" });
  };
  const remove = (id) => save({ schedule: data.schedule.filter((s) => s.id !== id) });

  const grouped = useMemo(() => {
    const m = Object.fromEntries(days.map((d) => [d, []]));
    for (const s of data.schedule) m[s.day].push(s);
    for (const d of days) m[d].sort((a, b) => (a.start > b.start ? 1 : -1));
    return m;
  }, [data.schedule]);

  return (
    <Section title="Хичээлийн хувиар" subtitle="Өдөр, цаг, байршлаа оруулна">
      <div className="grid sm:grid-cols-6 gap-3 mb-3">
        <div className="sm:col-span-2"><TextInput placeholder="Хичээл (Математик)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
        <div className="sm:col-span-1">
          <Select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
            {days.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-1"><TextInput type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></div>
        <div className="sm:col-span-1"><TextInput type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></div>
        <div className="sm:col-span-1"><TextInput placeholder="Өрөө / Байршил" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
      </div>
      <div className="flex justify-end mb-4"><PrimaryButton onClick={add}>Хадгалах</PrimaryButton></div>

      <div className="grid md:grid-cols-2 gap-4">
        {days.map((d) => (
          <div key={d} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{d}</h3>
              <Badge>{grouped[d].length} хичээл</Badge>
            </div>
            {grouped[d].length === 0 ? (
              <p className="text-sm text-zinc-500">Хоосон</p>
            ) : (
              <ul className="space-y-2">
                {grouped[d].map((s) => (
                  <li key={s.id} className="flex items-center justify-between border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
                    <div>
                      <div className="font-medium">{s.subject}</div>
                      <div className="text-xs text-zinc-500">{s.start}–{s.end} • {s.location || ""}</div>
                    </div>
                    <IconButton title="Устгах" onClick={() => remove(s.id)}>✕</IconButton>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

// --- Homework --------------------------------------------------------------
function Homework({ data, save }) {
  const [form, setForm] = useState({ title: "", subject: "", due: "", notes: "" });
  const add = () => {
    if (!form.title.trim()) return;
    const item = { id: uid(), ...form, done: false, createdAt: todayISO() };
    save({ homework: [item, ...data.homework] });
    setForm({ title: "", subject: form.subject, due: "", notes: "" });
  };
  const toggle = (id) => save({ homework: data.homework.map((h) => (h.id === id ? { ...h, done: !h.done } : h)) });
  const remove = (id) => save({ homework: data.homework.filter((h) => h.id !== id) });

  return (
    <Section title="Гэрийн даалгавар">
      <div className="grid sm:grid-cols-5 gap-3 mb-3">
        <div className="sm:col-span-2"><TextInput placeholder="Даалгаврын нэр" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="sm:col-span-1"><TextInput placeholder="Хичээл (Математик)" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
        <div className="sm:col-span-1"><TextInput type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></div>
        <div className="sm:col-span-1"><PrimaryButton onClick={add}>Нэмэх</PrimaryButton></div>
        <div className="sm:col-span-5"><TextArea placeholder="Тэмдэглэл (заавар, линк, г.м.)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
      </div>

      {data.homework.length === 0 ? (
        <p className="text-sm text-zinc-500">Одоогоор даалгавар байхгүй.</p>
      ) : (
        <ul className="space-y-2">
          {data.homework.map((h) => (
            <li key={h.id} className="flex items-start gap-3 justify-between border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
              <div className="flex items-start gap-3">
                <Checkbox checked={h.done} onChange={() => toggle(h.id)} />
                <div>
                  <div className={h.done ? "line-through text-zinc-400" : "font-medium"}>{h.title}</div>
                  <div className="text-xs text-zinc-500">{h.subject} • Дуусах: {h.due || "тодорхойгүй"}</div>
                  {h.notes && <div className="text-sm mt-1 whitespace-pre-wrap">{h.notes}</div>}
                </div>
              </div>
              <IconButton title="Устгах" onClick={() => remove(h.id)}>✕</IconButton>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

// --- Todos / Extracurricular ----------------------------------------------
function Todos({ data, save }) {
  const [form, setForm] = useState({ date: todayISO(), text: "", category: "Хобби" });
  const add = () => {
    if (!form.text.trim()) return;
    const item = { id: uid(), ...form, done: false };
    save({ todos: [item, ...data.todos] });
    setForm({ ...form, text: "" });
  };
  const toggle = (id) => save({ todos: data.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
  const remove = (id) => save({ todos: data.todos.filter((t) => t.id !== id) });

  const [filterDate, setFilterDate] = useState(todayISO());
  const list = data.todos.filter((t) => t.date === filterDate);

  return (
    <Section title="Хичээлээс гадуурх үйл ажиллагаа / Өдөр тутмын хийх зүйлс">
      <div className="grid sm:grid-cols-6 gap-3 mb-3">
        <div className="sm:col-span-1"><TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <div className="sm:col-span-3"><TextInput placeholder="Хийх зүйл" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
        <div className="sm:col-span-1">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {["Хобби", "Спорт", "Клуб", "Сайн дурын", "Ажил"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-1"><PrimaryButton onClick={add}>Нэмэх</PrimaryButton></div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Badge>Шүүлт: </Badge>
        <TextInput type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="max-w-[200px]" />
        <Badge>{list.length} бичлэг</Badge>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-zinc-500">Энэ өдөр бичлэг алга.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((t) => (
            <li key={t.id} className="flex items-center justify-between border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <Checkbox checked={t.done} onChange={() => toggle(t.id)} />
                <div>
                  <div className={t.done ? "line-through text-zinc-400" : "font-medium"}>{t.text}</div>
                  <div className="text-xs text-zinc-500">{t.category}</div>
                </div>
              </div>
              <IconButton title="Устгах" onClick={() => remove(t.id)}>✕</IconButton>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

// --- Books -----------------------------------------------------------------
const bookStatuses = ["Төлөвлөж буй", "Уншиж буй", "Зогссон", "Дууссан"];
function Books({ data, save }) {
  const [form, setForm] = useState({
    title: "",
    author: "",
    cover: "",
    status: bookStatuses[0],
    pagesRead: 0,
    totalPages: 0,
    genre: "",
    comment: "",
    rating: 0,
    startDate: todayISO(),
    endDate: "",
  });

  const add = () => {
    if (!form.title.trim()) return;
    const item = { id: uid(), ...form };
    save({ books: [item, ...data.books] });
    setForm({ ...form, title: "", author: "", cover: "", pagesRead: 0, totalPages: 0, genre: "", comment: "", rating: 0, endDate: "" });
  };

  const remove = (id) => save({ books: data.books.filter((b) => b.id !== id) });
  const update = (id, patch) => save({ books: data.books.map((b) => (b.id === id ? { ...b, ...patch } : b)) });

  return (
    <Section title="Номын тэмдэглэл" subtitle="Зохиолч, нүүр зураг, төлөв, явц, төрөл, сэтгэгдэл, үнэлгээ, нийт хуудас">
      <div className="grid sm:grid-cols-6 gap-3 mb-3">
        <div className="sm:col-span-2"><TextInput placeholder="Номын нэр" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="sm:col-span-2"><TextInput placeholder="Зохиолч" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
        <div className="sm:col-span-1">
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {bookStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-1"><TextInput placeholder="Нүүр зураг (URL)" value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} /></div>
        <div className="sm:col-span-2"><TextInput type="number" placeholder="Нийт хуудас" value={form.totalPages} onChange={(e) => setForm({ ...form, totalPages: Number(e.target.value) || 0 })} /></div>
        <div className="sm:col-span-2"><TextInput placeholder="Төрөл (жанр)" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} /></div>
        <div className="sm:col-span-1"><TextInput type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
        <div className="sm:col-span-1"><TextInput type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
        <div className="sm:col-span-6"><TextArea placeholder="Сэтгэгдэл" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></div>
        <div className="sm:col-span-5"></div>
        <div className="sm:col-span-1"><PrimaryButton onClick={add}>Нэмэх</PrimaryButton></div>
      </div>

      {data.books.length === 0 ? (
        <p className="text-sm text-zinc-500">Ном нэмээгүй байна.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.books.map((b) => {
            const pct = b.totalPages > 0 ? (b.pagesRead / b.totalPages) * 100 : 0;
            return (
              <article key={b.id} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex gap-4">
                <div className="w-24 shrink-0 h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  {b.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.cover} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">Нүүр зураг</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{b.title || "Нэргүй ном"}</h3>
                      <p className="text-xs text-zinc-500 truncate">{b.author}</p>
                    </div>
                    <Badge>{b.status}</Badge>
                  </div>

                  <div className="mt-2 space-y-2">
                    <div className="text-xs text-zinc-500">{b.pagesRead}/{b.totalPages} хуудас — {Math.round(pct)}%</div>
                    <ProgressBar value={pct} />
                    <div className="grid grid-cols-3 gap-2">
                      <TextInput type="number" value={b.pagesRead} onChange={(e) => update(b.id, { pagesRead: Math.max(0, Number(e.target.value) || 0) })} />
                      <TextInput type="number" value={b.totalPages} onChange={(e) => update(b.id, { totalPages: Math.max(0, Number(e.target.value) || 0) })} />
                      <Select value={b.status} onChange={(e) => update(b.id, { status: e.target.value })}>
                        {bookStatuses.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <TextInput placeholder="Төрөл" value={b.genre} onChange={(e) => update(b.id, { genre: e.target.value })} />
                      <TextInput placeholder="Нүүр зураг URL" value={b.cover} onChange={(e) => update(b.id, { cover: e.target.value })} />
                    </div>
                    <TextArea placeholder="Сэтгэгдэл" value={b.comment} onChange={(e) => update(b.id, { comment: e.target.value })} />
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => update(b.id, { rating: n })}
                          className={"text-lg " + (b.rating >= n ? "" : "opacity-30")}
                          title={`${n} од`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs text-zinc-500">Үнэлгээ: {b.rating || 0}/5</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <TextInput type="date" value={b.startDate || ""} onChange={(e) => update(b.id, { startDate: e.target.value })} />
                      <TextInput type="date" value={b.endDate || ""} onChange={(e) => update(b.id, { endDate: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <IconButton title="Устгах" onClick={() => remove(b.id)}>✕</IconButton>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Section>
  );
}
