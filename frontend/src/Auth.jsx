import { useState } from "react";
import { api } from "./api";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        const data = await api.login({ email, password });
        localStorage.setItem("token", data.token);
        onLogin(data.user);
      } else {
        await api.register({ name, email, password });

        setMessage("Account created successfully. Please log in.");
        setIsLogin(true);
        setName("");
        setPassword("");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  function switchMode() {
    setIsLogin(!isLogin);
    setError("");
    setMessage("");
  }

  return (
    <div className="page">
      <h1>{isLogin ? "Login" : "Create account"}</h1>

      <section>
        {!isLogin && (
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <button onClick={handleSubmit}>
          {isLogin ? "Log in" : "Create account"}
        </button>

        <p className="switch" onClick={switchMode}>
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Log in"}
        </p>
      </section>
    </div>
  );
}

export default Auth;