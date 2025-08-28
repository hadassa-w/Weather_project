const express = require('express');
const { getLatestReports } = require('../lib/db');
const router = express.Router();

router.get('/', async function(req, res, next) {
  const result = await getLatestReports();
  res.send(result.map((data) => ({
    queried_at_day: new Intl.DateTimeFormat('en-US').format(data.queried_at_day),
    queried_at_time: data.queried_at_time,
    temprature: data.temprature,
    description: data.description,
  })));
});

module.exports = router;
