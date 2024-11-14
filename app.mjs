import express from "express";

import connectionPool from "./utils/db.mjs";




const app = express();
const port = 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/questions", async (req, res) => {
  const newQuestion = {
    ...req.body,
  };
  try {
    await connectionPool.query(
      `insert into questions (title, description, category)
        values ($1, $2, $3)`,
      [newQuestion.title, newQuestion.description, newQuestion.category]
    );
    return res.status(201).json({
      message: "Question created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }
});

app.get("/questions", async (req, res) => {
  let results;
  try {
    results = await connectionPool.query(`select * from questions`);
    console.log(results);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }
  return res.status(200).json({
    data: results.rows,
  });
});

app.get("/questions/search", async (req, res) => {
  const title = req.query.title;
  const category = req.query.category;

  try {
    let query = "select * from questions";
    let values = [];
    if (title && category) {
      query += " where title ilike $1 and category ilike $2";
      values = [`%${title}%`, `%${category}%`];
    } else if (title) {
      query += " where title ilike $1";
      values = [`%${title}%`];
    } else if (category) {
      query += " where category ilike $1";
      values = [`%${category}%`];
    }
    const result = await connectionPool.query(query, values);
    return res.status(200).json({
      data: result.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Unable to fetch a question.",
    });
  }
})

app.get("/questions/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  const result = await connectionPool.query(
    `select * from questions where id=$1`,
    [questionIdFromClient]
  );
  if (!result.rows[0]) {
    return res.status(404).json({
      message: `Question not found.`,
    });
  }
  return res.status(200).json({
    data: result.rows,
  });
});

app.put("/questions/:questionId", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  const updateQuestion = { ...req.body };
  try {
    await connectionPool.query(
      `update questions
      set title = $2,
      description = $3
      where id = $1
      `,
      [questionIdFromClient, updateQuestion.title, updateQuestion.description]
    );
    return res.status(200).json({
      message: "Question updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Question not found.",
      error: error.message,
    });
  }
});

app.delete("/questions/:questionId", async (req, res) => {
  const deleteQuestionFromClient = req.params.questionId;
  try {
    await connectionPool.query(
      `delete from questions
      where id=$1`,
      [deleteQuestionFromClient]
    );
    return res.status(200).json({
      message: "Question post has been deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete question.",
    });
  }
});

// app.get("/questions", async (req, res) => {
//   const title = req.query.title;
//   const category = req.query.category;
//   try {
//     result = await connectionPool.query(
//       `
//       select * from questions
//       where
//       (title = $1 or $1 is null or $1 = '')
//       and
//       (category = $2 or $2 is null or $2 = '')
//       `,
//       [title, category]
//     );
//     return res.status(200).json({
//       data: results.rows,
//     });
//   } catch {
//     return res.status(500).json({
//       message: "Unable to fetch a question.",
//     });
//   }
// })



app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
