import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:korn@localhost:5432/Backend Skill Checkpoint",
});

export default connectionPool;
