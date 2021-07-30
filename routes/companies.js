const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`select * from companies`);
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(
      `
      select 
        c.code, 
        c.name, 
        c.description,
        i.industry
      from 
        companies c
      left join companies_industries ci
      on c.code = ci.c_code
      left join industries i
      on ci.i_code = i.code
      where 
        c.code = $1`,
      [code]
    );
    debugger;
    if (results.rows.length === 0) {
      throw new ExpressError(`Company code '${code}' not found`, 404);
    }
    const { name, description } = results.rows[0];
    const industries = results.rows.map((r) => r.industry);
    return res.json({ company: { code, name, description, industries } });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(
      `insert into companies (code, name, description) values ($1, $2, $3) returning code, name, description`,
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `update companies set name=$1, description=$2 where code = $3 returning code, name, description`,
      [name, description, code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update company with id of ${code}`, 404);
    }
    return res.send({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(`select * from companies where code = $1`, [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Company code ${code} not found`, 404);
    } else {
      await db.query(`delete from companies where code = $1`, [code]);
      return res.json({ msg: `Company code ${code} deleted!` });
    }
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
