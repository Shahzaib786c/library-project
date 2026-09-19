# Library Project — MySQL + Prisma + Express + React

A full-stack CRUD application built to learn relational databases with Node.js.
Two tables (`Author` and `Book`) linked by a foreign key, a TypeScript REST API,
and a React frontend that talks to it.

---

## Tech stack

| Layer | Technology |
|---|---|
| Database | MySQL 8 |
| ORM | Prisma **6.19.3** (pinned — see warning below) |
| Backend | Express 5 + TypeScript, run with `tsx` |
| Frontend | React 19 (JavaScript) + Vite |
| Tools | MySQL Workbench, Postman |

---

## Project structure

```
Library_Project/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # the models = the tables
│   │   └── migrations/          # generated SQL history
│   ├── src/
│   │   ├── prisma.ts            # one shared Prisma client
│   │   ├── controllers/
│   │   │   ├── authorController.ts
│   │   │   └── bookController.ts
│   │   ├── routes/
│   │   │   ├── authorRoutes.ts
│   │   │   └── bookRoutes.ts
│   │   └── server.ts
│   ├── .env                     # NOT committed
│   ├── tsconfig.json
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    └── package.json
```

There is no `models/` folder. `schema.prisma` **is** the model layer — one file
describing every table, instead of one file per model as with Mongoose.

---

## ⚠️ Read this before you run `npm install`

**Prisma versions are pinned on purpose. Do not upgrade them.**

In `backend/package.json`:

```json
"@prisma/client": "6.19.3",
"prisma": "6.19.3",
```

Notice there is **no `^`** in front of the version numbers. That is deliberate.
`^6.19.3` means "6.19.3 or anything newer", which means the day Prisma 7 or 8
becomes stable, a fresh `npm install` would silently pull it in and break this
project.

Prisma 7 and 8 changed the CLI considerably — `prisma migrate` was renamed, the
config format changed, and `definePrismaConfig` errors start appearing. If you
see any of these, you are on the wrong major version:

```
[CLI.INVALID_ARGUMENTS] No flag registered for --datasource-provider
[CLI.UNKNOWN_COMMAND] No command registered for `migrate`
Failed to load config file ... definePrismaConfig is not a function
```

When the CLI prints an "Update available 6.19.3 -> 8.x" box, **ignore it.**

To verify what you actually have:

```bash
npm list prisma
```

Both entries should say `6.19.3`.

---

## Setup from scratch

### 1. Prerequisites

- Node.js 18+
- MySQL Server 8 running locally on port 3306
- MySQL Workbench (optional, but useful for seeing the tables)

### 2. Create the database

MySQL does not create databases on the fly the way MongoDB does — the database
must exist before Prisma can build tables inside it. In Workbench:

```sql
CREATE DATABASE library;
```

### 3. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (it is gitignored, so it will not be in
your clone):

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/library"
```

Breakdown of that connection string:

| Part | Meaning |
|---|---|
| `mysql://` | which kind of database |
| `root` | MySQL username |
| `YOUR_PASSWORD` | the root password you set when installing MySQL |
| `localhost:3306` | where the server is running |
| `library` | the database created in step 2 |

If your password contains special characters they must be URL-encoded:
`@` → `%40`, `#` → `%23`, `/` → `%2F`, `:` → `%3A`.

Then generate the client and build the tables:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

You should see `Server running on http://localhost:3000`.

### 4. Frontend

In a **second terminal** (leave the backend running):

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`.

---

## The data model

```prisma
model Author {
  id      Int    @id @default(autoincrement())
  name    String
  country String
  books   Book[]
}

model Book {
  id       Int    @id @default(autoincrement())
  title    String
  year     Int
  authorId Int
  author   Author @relation(fields: [authorId], references: [id])
}
```

| Line | What it means |
|---|---|
| `@id` | this column is the primary key |
| `@default(autoincrement())` | MySQL fills it in: 1, 2, 3… |
| `authorId Int` | the **real column** — the foreign key |
| `author Author @relation(...)` | a shortcut so you can write `book.author` |
| `fields: [authorId]` | which column in this table holds the link |
| `references: [id]` | which column in the other table it points to |
| `books Book[]` | the other direction — one author has many books |

`books Book[]` is **not a real column**. Open the `author` table in Workbench and
you will find only `id`, `name` and `country`. The link is stored in exactly one
place: `book.authorId`. That line exists so you can travel back the other way,
from an author to all of their books.

Prisma requires both sides of a relation to be written. Leave out `books Book[]`
and the migration fails.

---

## API endpoints

Base URL: `http://localhost:3000`

### Authors

| Method | Route | Description |
|---|---|---|
| GET | `/api/authors` | all authors |
| GET | `/api/authors/:id` | one author **with all their books** |
| POST | `/api/authors` | create — body: `{ name, country }` |
| PUT | `/api/authors/:id` | update |
| DELETE | `/api/authors/:id` | delete |

### Books

| Method | Route | Description |
|---|---|---|
| GET | `/api/books` | all books, each with its author |
| GET | `/api/books/:id` | one book with its author |
| POST | `/api/books` | create — body: `{ title, year, authorId }` |
| PUT | `/api/books/:id` | update |
| DELETE | `/api/books/:id` | delete |

### What `include` does

Without it you get the raw foreign key:

```json
{ "id": 1, "title": "Pakistani History", "year": 2020, "authorId": 1 }
```

With `include: { author: true }` you get the whole related row:

```json
{
  "id": 1,
  "title": "Pakistani History",
  "year": 2020,
  "authorId": 1,
  "author": { "id": 1, "name": "Ahmed Ali", "country": "Pakistan" }
}
```

This is Prisma's JOIN. It is the twin of Mongoose's `.populate()`.

---

## Gotchas hit while building this

These cost real time. They are written down so nobody repeats them.

### `npx prisma init` creates files you may not want

On Prisma 6.19 it generates a `prisma.config.ts` and sets the generator to the
new `prisma-client` provider with an `output` path:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}
```

This project uses the classic setup instead, so that imports come from
`@prisma/client` and match the lecture material and most online examples:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

`prisma.config.ts` was deleted so that Prisma reads `DATABASE_URL` straight from
`.env`.

### `"type": "module"` is required

`npm init -y` writes `"type": "commonjs"`. With `NodeNext` module resolution in
`tsconfig.json`, that combination breaks the imports. It must be:

```json
"type": "module"
```

### Imports end in `.js`, not `.ts`

```ts
import prisma from "../prisma.js";   // the file on disk is prisma.ts
```

This looks wrong but is correct. TypeScript compiles to `.js`, so you write the
name of the compiled file. This catches almost everyone once.

### `Number(req.params.id)` is back

MySQL ids are integers, unlike MongoDB's string ObjectIds. Route params always
arrive as strings, so every lookup needs the conversion:

```ts
where: { id: Number(req.params.id) }
```

### `update` and `delete` throw, they don't return null

Unlike Mongoose's `findByIdAndUpdate`, Prisma throws when the row does not
exist. Every update and delete is wrapped in `try/catch` so it can return a
proper 404.

### `npm install` warns about blocked install scripts

```
npm warn install-scripts  prisma@6.19.3 (preinstall ... blocked)
```

Harmless here. Running `npx prisma generate` afterwards does the work those
scripts would have done.

### CORS

Backend runs on port 3000, frontend on 5173. The browser treats different ports
as different sites and blocks the requests. Fixed with one line in `server.ts`:

```ts
app.use(cors());
```

### React lint warning in `App.jsx`

React's newer `react-hooks/set-state-in-effect` rule flags calling `setState`
inside `useEffect`. Fetching data on mount is the standard exception, so it is
silenced on that single line rather than disabled project-wide.

---

## Things worth trying

These demonstrate what a relational database gives you that MongoDB does not.

**1. Create a book with a non-existent author.**

```json
POST /api/books
{ "title": "Ghost Book", "year": 2024, "authorId": 999 }
```

Returns `400 — Author does not exist`. That check was never written in the
application code. **MySQL refused the row** because of the foreign key
constraint, Prisma threw, and the `catch` block turned it into a 400. MongoDB
would have stored it happily and you would have discovered the broken link much
later.

**2. Delete an author who has books.**

MySQL refuses. Deleting the author would leave books pointing at nothing — an
orphan record. The database will not allow it.

If you *want* the books deleted along with the author, add a cascade rule to the
schema and migrate:

```prisma
author Author @relation(fields: [authorId], references: [id], onDelete: Cascade)
```

**3. Insert two authors, then watch Workbench.**

Right-click the `author` table → *Select Rows*. Send a POST from the frontend,
refresh, and watch the row appear. Browser → API → MySQL, end to end.

---

## Viewing the database

**MySQL Workbench** — Schemas tab → refresh → `library` → Tables → right-click a
table → *Select Rows*.

**ER diagram** — Database → Reverse Engineer → pick the connection → select the
`library` schema → Execute. A diagram is drawn showing both tables and the line
from `book.authorId` to `author.id`. A key icon marks primary keys, a red
diamond marks the foreign key, and the crow's-foot end of the line marks the
"many" side.

The `_prisma_migrations` table in that diagram was created by Prisma, not by
you. It records which migrations have already run, which is how `migrate dev`
knows not to apply the same migration twice.

**Prisma Studio** — a lighter browser-based table viewer:

```bash
cd backend
npx prisma studio
```

---

## Important habits

**Every time you change `schema.prisma`, run a migration.**

```bash
npx prisma migrate dev --name describe-the-change
```

Editing the schema file alone changes nothing in MySQL. This is a real
difference from Mongoose, where changing the schema was enough.

**Never commit `.env`.** It holds the database password. Before any push:

```bash
git status
```

If `.env` appears in that list, stop. Confirm it is ignored with:

```bash
git check-ignore -v backend/.env
```

---

## Mongo → MySQL cheat sheet

| MongoDB | MySQL / Prisma |
|---|---|
| Collection | Table |
| Document | Row |
| Field | Column |
| `_id` (ObjectId) | `id` (Int, primary key) |
| Mongoose Schema | Prisma model |
| storing a `courseId` | a foreign key |
| `.populate("author")` | `include: { author: true }` |
| `find()` | `findMany()` |
| `findById()` | `findUnique()` |
| `findOne()` | `findFirst()` |
| `create()` | `create()` |
| `findByIdAndUpdate()` | `update()` |
| `findByIdAndDelete()` | `delete()` |

Mongoose only speaks MongoDB — it cannot be used with SQL at all. Prisma, on the
other hand, works with MySQL, PostgreSQL, SQLite, SQL Server **and** MongoDB.
Switching this project to PostgreSQL would mean changing `provider` to
`"postgresql"`, updating `DATABASE_URL` (port 5432), deleting the old
MySQL-specific migrations, and running `migrate dev` again. The models would not
change at all — that is the point of an ORM.
