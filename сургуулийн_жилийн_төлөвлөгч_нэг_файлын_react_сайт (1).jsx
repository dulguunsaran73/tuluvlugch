// Энэхүү файл бол React PWA хувилбарын үндсэн код

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function App() {
  const [goals, setGoals] = useState("");
  const [schedule, setSchedule] = useState("");
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState("");
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    cover: "",
    status: "",
    pages: 0,
    readPages: 0,
    genre: "",
    comment: "",
    rating: 0,
  });

  // LocalStorage-аас ачаалах
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const storedActivities = JSON.parse(localStorage.getItem('activities') || '[]');
    const storedBooks = JSON.parse(localStorage.getItem('books') || '[]');
    const storedGoals = localStorage.getItem('goals') || '';
    const storedSchedule = localStorage.getItem('schedule') || '';

    setTasks(storedTasks);
    setActivities(storedActivities);
    setBooks(storedBooks);
    setGoals(storedGoals);
    setSchedule(storedSchedule);
  }, []);

  // LocalStorage-д хадгалах
  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('goals', goals); }, [goals]);
  useEffect(() => { localStorage.setItem('schedule', schedule); }, [schedule]);

  const addTask = () => { if (newTask.trim() !== "") { setTasks([...tasks, { text: newTask, done: false }]); setNewTask(""); } };
  const toggleTask = (index) => { const updated = [...tasks]; updated[index].done = !updated[index].done; setTasks(updated); };

  const addActivity = () => { if (newActivity.trim() !== "") { setActivities([...activities, { text: newActivity, done: false }]); setNewActivity(""); } };
  const toggleActivity = (index) => { const updated = [...activities]; updated[index].done = !updated[index].done; setActivities(updated); };

  const addBook = () => { if (newBook.title && newBook.author) { setBooks([...books, newBook]); setNewBook({ title:"", author:"", cover:"", status:"", pages:0, readPages:0, genre:"", comment:"", rating:0 }); } };

  return (
    <div className="p-4 grid gap-4">
      {/* Goals */}
      <Card className="shadow-xl">
        <CardContent>
          <h1 className="text-xl font-bold">🎯 Хичээлийн жилийн зорилго</h1>
          <textarea className="w-full p-2 border rounded mt-2" value={goals} onChange={(e)=>setGoals(e.target.value)} placeholder="Зорилгоо энд бич..." />
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="shadow-xl">
        <CardContent>
          <h1 className="text-xl font-bold">📅 Хичээлийн хуваарь</h1>
          <textarea className="w-full p-2 border rounded mt-2" value={schedule} onChange={(e)=>setSchedule(e.target.value)} placeholder="Хичээлүүдийн хуваарь энд бич..." />
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card className="shadow-xl">
        <CardContent>
          <h1 className="text-xl font-bold">📘 Гэрийн даалгавар</h1>
          <div className="flex gap-2 mt-2">
            <input className="flex-1 border p-2 rounded" value={newTask} onChange={(e)=>setNewTask(e.target.value)} placeholder="Шинэ даалгавар..." />
            <Button onClick={addTask}>Нэмэх</Button>
          </div>
          <ul className="mt-2">{tasks.map((task,i)=>(<li key={i} className="flex items-center gap-2"><input type="checkbox" checked={task.done} onChange={()=>toggleTask(i)}/><span className={task.done?"line-through":""}>{task.text}</span></li>))}</ul>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card className="shadow-xl">
        <CardContent>
          <h1 className="text-xl font-bold">🤹 Хичээлээс гадуурх үйл ажиллагаа</h1>
          <div className="flex gap-2 mt-2">
            <input className="flex-1 border p-2 rounded" value={newActivity} onChange={(e)=>setNewActivity(e.target.value)} placeholder="Шинэ үйл ажиллагаа..." />
            <Button onClick={addActivity}>Нэмэх</Button>
          </div>
          <ul className="mt-2">{activities.map((a,i)=>(<li key={i} className="flex items-center gap-2"><input type="checkbox" checked={a.done} onChange={()=>toggleActivity(i)} /><span className={a.done?"line-through":""}>{a.text}</span></li>))}</ul>
        </CardContent>
      </Card>

      {/* Books */}
      <Card className="shadow-xl">
        <CardContent>
          <h1 className="text-xl font-bold">📚 Номын тэмдэглэл</h1>
          <div className="grid gap-2 mt-2">
            <input className="border p-2 rounded" placeholder="Номын нэр" value={newBook.title} onChange={(e)=>setNewBook({...newBook,title:e.target.value})} />
            <input className="border p-2 rounded" placeholder="Зохиолч" value={newBook.author} onChange={(e)=>setNewBook({...newBook,author:e.target.value})} />
            <input className="border p-2 rounded" placeholder="Нүүр зураг (URL)" value={newBook.cover} onChange={(e)=>setNewBook({...newBook,cover:e.target.value})} />
            <input className="border p-2 rounded" placeholder="Нийт хуудас" type="number" value={newBook.pages} onChange={(e)=>setNewBook({...newBook,pages:e.target.value})} />
            <input className="border p-2 rounded" placeholder="Уншсан хуудас" type="number" value={newBook.readPages} onChange={(e)=>setNewBook({...newBook,readPages:e.target.value})} />
            <input className="border p-2 rounded" placeholder="Төрөл" value={newBook.genre} onChange={(e)=>setNewBook({...newBook,genre:e.target.value})} />
            <textarea className="border p-2 rounded" placeholder="Сэтгэгдэл" value={newBook.comment} onChange={(e)=>setNewBook({...newBook,comment:e.target.value})} />
            <input className="border p-2 rounded" placeholder="Үнэлгээ (0-5)" type="number" value={newBook.rating} onChange={(e)=>setNewBook({...newBook,rating:e.target.value})} />
            <Button onClick={addBook}>Нэмэх</Button>
          </div>
          <div className="mt-4 grid gap-4">{books.map((b,i)=>(<Card key={i} className="p-2">{b.cover && <img src={b.cover} alt={b.title} className="h-32 object-cover rounded" />}<h2 className="font-bold">{b.title}</h2><p>✍ {b.author}</p><p>📖 {b.readPages}/{b.pages} хуудас</p><progress value={b.readPages} max={b.pages}></progress><p>Жанр: {b.genre}</p><p>Сэтгэгдэл: {b.comment}</p><p>⭐ {b.rating}/5</p></Card>))}</div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- PWA нэмэлтүүд ---
// 1) public/manifest.json үүсгэж тохируулна
// 2) public/service-worker.js үүсгэж кэшлэх үйлдлийг хийнэ
// 3) index.js дээр serviceWorker-г бүртгэнэ
