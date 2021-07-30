const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`
    select 
      i.code, 
      i.industry,
      ARRAY_AGG(c.name) as companies
    from 
      industries i
    left join companies_industries ci
    on i.code = ci.i_code
    left join companies c
    on ci.c_code = c.code
    group by
      i.code`);
    debugger;
    return res.json({ industries: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const results = await db.query(
      `insert into industries (code, industry) values ($1, $2) returning code, industry`,
      [code, industry]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
