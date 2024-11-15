import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionRouter = Router();

questionRouter.post("/", async (req, res) => {
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

questionRouter.get("/", async (req, res) => {
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

questionRouter.get("/search", async (req, res) => {
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
});

questionRouter.get("/:questionId", async (req, res) => {
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

questionRouter.put("/:questionId", async (req, res) => {
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

questionRouter.delete("/:questionId", async (req, res) => {
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

questionRouter.post("/:questionId/answers", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  const newAnswer = req.body.content;
  if (newAnswer.length >= 300) {
    return res.status(400).json({
      message: "Answer is too long",
    });
  }
  try {
    await connectionPool.query(
      `insert into answers (
        question_id,content
        )values($1,$2)`,
      [questionIdFromClient, newAnswer]
    );
    return res.status(201).json({
      message: "Answer created successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to create answers.",
      error: error.message,
    });
  }
});

questionRouter.get("/:questionId/answers", async (req, res) => {
  const questionIdFromClient = req.params.questionId;
  try {
    const result = await connectionPool.query(
      `select * from answers where question_id = $1`,
      [questionIdFromClient]
    );

    return res.status(200).json({
      data: result.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Unable to fetch answers.",
    });
  }
});

questionRouter.delete("/:questionId/answers", async (req, res) => {
  const answersIdFromClient = req.params.questionId;
  try {
    const result = await connectionPool.query(
      `delete from answers where question_id = $1`,
      [answersIdFromClient]
    );
    return res.status(200).json({
      message: "All answers for the question have been deleted successfully.",
    });
  } catch {
    return res.status(500).json({
      message: "Unable to delete answers.",
    });
  }
});

questionRouter.post("/:questionId/vote", async (req, res) => {
  const id = req.params.questionId;
  const newVote = req.body.vote;
  try {
    const result = await connectionPool.query(
      `insert into question_votes (
        question_id,vote)values($1,$2)`,
      [id, newVote]
    );
    return res.status(201).json({
      message: "All answers for the question have been deleted successfully.",
    });
  } catch {
    return res.status(500).json({
      message: "Unable to vote question.",
    });
  }
});

export default questionRouter