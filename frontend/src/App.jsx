import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:3000/api";

function App() {
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);

  const [authorName, setAuthorName] = useState("");
  const [country, setCountry] = useState("");

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [authorId, setAuthorId] = useState("");

  // saara data load karo
  async function loadData() {
    const a = await fetch(`${API}/authors`);
    setAuthors(await a.json());

    const b = await fetch(`${API}/books`);
    setBooks(await b.json());
  }


  useEffect(() => {
    loadData();
  }, []);

  // author add
  async function addAuthor() {
    if (!authorName || !country) return alert("Sab fields bharo");

    await fetch(`${API}/authors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: authorName, country })
    });

    setAuthorName("");
    setCountry("");
    loadData();
  }

  // book add
  async function addBook() {
    if (!title || !year || !authorId) return alert("Sab fields bharo");

    const res = await fetch(`${API}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, year, authorId })
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(err.message);
    }

    setTitle("");
    setYear("");
    setAuthorId("");
    loadData();
  }

  async function deleteAuthor(id) {
    const res = await fetch(`${API}/authors/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete nahi hua — shayad is author ki books hain");
    loadData();
  }

  async function deleteBook(id) {
    await fetch(`${API}/books/${id}`, { method: "DELETE" });
    loadData();
  }

  return (
    <div className="page">
      <h1>Library</h1>

      <section>
        <h2>Add Author</h2>
        <div className="row">
          <input
            placeholder="Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
          <input
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <button onClick={addAuthor}>Add</button>
        </div>

        <ul>
          {authors.map((a) => (
            <li key={a.id}>
              <span>
                #{a.id} — {a.name} ({a.country})
              </span>
              <button onClick={() => deleteAuthor(a.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Add Book</h2>
        <div className="row">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            placeholder="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
            <option value="">-- Author choose karo --</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button onClick={addBook}>Add</button>
        </div>

        <ul>
          {books.map((b) => (
            <li key={b.id}>
              <span>
                {b.title} ({b.year}) — by {b.author ? b.author.name : "?"}
              </span>
              <button onClick={() => deleteBook(b.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;