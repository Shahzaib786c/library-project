import { useState, useEffect } from "react";
import { api, getToken } from "./api";
import Auth from "./Auth";
import "./App.css";
import AdminPanel from "./AdminPanel";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [authorId, setAuthorId] = useState("");

  useEffect(() => {
    async function checkAuth() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const me = await api.me();
        setUser(me);
      } catch {
        localStorage.removeItem("token");
      }

      setLoading(false);
    }

    checkAuth();
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      setAuthors(await api.getAuthors());
      setBooks(await api.getBooks());
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleAddBook() {
    if (!title || !year || !authorId) return alert("All fields are required");

    try {
      await api.addBook({ title, year, authorId });
      setTitle("");
      setYear("");
      setAuthorId("");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteBook(id) {
    try {
      await api.deleteBook(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setBooks([]);
    setAuthors([]);
  }

  if (loading) {
    return <div className="page"><p>Loading...</p></div>;
  }

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="page">
      <div className="topbar">
        <h1>
          Library
          <span className="badge">{user.role}</span>
        </h1>
        <div>
          <span>{user.name}</span>
          <button onClick={logout} style={{ marginLeft: 10 }}>Logout</button>
        </div>
      </div>

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
            <option value="">-- Select an author --</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <button onClick={handleAddBook}>Add</button>
        </div>

        <ul>
          {books.map((b) => (
            <li key={b.id}>
              <span>
                {b.title} ({b.year}) — by {b.author ? b.author.name : "?"}
              </span>
              {user.role === "ADMIN" && (
                <button onClick={() => handleDeleteBook(b.id)}>Delete</button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {user.role === "ADMIN" && <AdminPanel currentUserId={user.id} />}

    </div>
  );
}

export default App;