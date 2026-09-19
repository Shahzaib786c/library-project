const API = "http://localhost:3000/api";

function getToken() {
    return localStorage.getItem("token");
}

function headers() {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

async function request(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: headers()
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

export const api = {
    register: (body) =>
        request("/auth/register", { method: "POST", body: JSON.stringify(body) }),

    login: (body) =>
        request("/auth/login", { method: "POST", body: JSON.stringify(body) }),

    me: () => request("/auth/me"),

    getBooks: () => request("/books"),
    addBook: (body) =>
        request("/books", { method: "POST", body: JSON.stringify(body) }),
    deleteBook: (id) => request(`/books/${id}`, { method: "DELETE" }),

    getAuthors: () => request("/authors"),
    addAuthor: (body) =>
        request("/authors", { method: "POST", body: JSON.stringify(body) }),

    getUsers: () => request("/users"),

    updateUserStatus: (id, status) =>
        request(`/users/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status })
        }),

    updateUserRole: (id, role) =>
        request(`/users/${id}/role`, {
            method: "PATCH",
            body: JSON.stringify({ role })
        })
};

export { getToken };


