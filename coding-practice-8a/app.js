const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initialiseDbAndServer();

//API 1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case priority !== undefined && status !== undefined:
      getTodosQuery = `
            SELECT
                *
            FROM
                todo
            WHERE
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND priority = '${priority}';`;
      break;
    case priority !== undefined:
      getTodosQuery = `
            SELECT
                *
            FROM
                todo
            WHERE
                todo LIKE '%${search_q}%'
                AND priority = '${priority}';`;
      break;
    case status !== undefined:
      getTodosQuery = `
            SELECT
                *
            FROM
                todo
            WHERE
                todo LIKE '%${search_q}%'
                AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
        SELECT
            *
        FROM
            todo
        WHERE
            todo LIKE '%${search_q}';`;
  }
  data = await db.all(getTodosQuery);
  response.send(data);
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
        *
    FROM
        todo
    WHERE
        id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
    INSERT INTO 
        todo(id,todo,priority,status)
    VALUES
        (${id},'${todo}','${priority}','${status}');`;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }

  const prevTodoQuery = `
  SELECT
    *
  FROM
    todo
  WHERE
    id=${todoId};`;
  const prevTodo = await db.get(prevTodoQuery);

  const {
    todo = prevTodo.todo,
    priority = prevTodo.priority,
    status = prevTodo.status,
  } = request.body;

  const updatequery = `
  UPDATE
    todo
  SET
    todo = '${todo}',
    priority = '${priority}',
    status  = '${status}'
  WHERE
    id=${todoId};`;

  await db.run(updatequery);
  response.send(`${updateColumn} Updated`);
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM
        todo
    WHERE
        id=${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
