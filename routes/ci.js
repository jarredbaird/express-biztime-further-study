const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res, next) => {
  try {
    const { c_code, i_code } = req.body;
    const results = await db.query(
      `insert into companies_industries (c_code, i_code) values ($1, $2) returning c_code, i_code`,
      [c_code, i_code]
    );
    return res.status(201).json({ companies_industries: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
