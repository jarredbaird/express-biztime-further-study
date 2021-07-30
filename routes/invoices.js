const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`select * from invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`select * from invoices where id = $1`, [
      id,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`invoice id '${id}' not found`, 404);
    }
    return res.json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      comp_code,
      amt,
      paid = false,
      add_date = Date.now(),
      paid_date = null,
    } = req.body;
    debugger;
    const results = await db.query(
      `insert into invoices \
         (comp_code, amt, paid, add_date, paid_date) \
       values \
         ($1, $2, $3, $4, $5) \
       returning \
         id, \
         comp_code, \
         amt, \
         paid, \
         add_date, \
         paid_date`,
      [comp_code, amt, paid, add_date, paid_date]
    );
    debugger;
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update company with id of ${code}`, 404);
    }
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetRow = await db.query(`select * from invoices where id = $1`, [
      id,
    ]);
    if (targetRow.rows.length === 0) {
      throw new ExpressError(
        `Cannot modify invoice id ${id}. Does not exist`,
        404
      );
    }
    const targetInvoice = targetRow.rows[0];
    const {
      comp_code = targetInvoice.comp_code,
      amt = targetInvoice.amt,
      paid = targetInvoice.paid,
      add_date = targetInvoice.add_date,
      paid_date = targetInvoice.paid_date,
    } = req.body;
    let results;
    try {
      results = await db.query(
        `update \
         invoices \
       set 
         comp_code=$1, \
         amt=$2, \
         paid=$3, \
         add_date=$4, \
         paid_date=$5 \
       where \
         id = $6 \
       returning \
         id, \
         comp_code, \
         amt, \
         paid, \
         add_date, \
         paid_date`,
        [comp_code, amt, paid, add_date, paid_date, id]
      );
    } catch (e) {
      e = new ExpressError(e.message, 400);
      return next(e);
    }
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update company with id of ${code}`, 404);
    }
    return res.send({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`select * from invoices where id = $1`, [
      id,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`invoice id ${id} not found`, 404);
    } else {
      await db.query(`delete from invoices where id = $1`, [id]);
      return res.json({ msg: `invoice id ${id} deleted!` });
    }
  } catch (e) {
    debugger;
    return next(e);
  }
});

module.exports = router;
