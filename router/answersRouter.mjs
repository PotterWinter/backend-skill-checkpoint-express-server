import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answerRouter = Router()

answerRouter.post("/answers/:answerId/vote", async (req, res) => {
    const id = req.params.answerId
    const newVote = req.body.vote
    try{
      const result = await connectionPool.query(
        `insert into answer_votes (
        answer_id,vote)values($1,$2)`,[id,newVote]
      )
      return res.status(201).json({
        message: "Vote on the answer has been recorded successfully."
      })
    }catch{
      return res.status(500).json({
        message: "Unable to vote answer.",
      });
    }
  })

  export default answerRouter