const axios = require('axios');
const { knex } = require('../lib/db');

async function fetchWeather() {
  try {
    const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
      params: {
        key: process.env.WEATHER_API_KEY,
        q: 'Bnei Brak'
      }
    });

    const data = response.data.current;

    const existing = await knex('weather').first();
    if (existing) {
      await knex('weather').update({
        temprature: data.temp_c,
        description: data.condition.text,
        queried_at_day: new Date().toLocaleDateString(),
        queried_at_time: new Date().toLocaleTimeString(),
      });
    } else {
      await knex('weather').insert({
        temprature: data.temp_c,
        description: data.condition.text,
        queried_at_day: new Date().toLocaleDateString(),
        queried_at_time: new Date().toLocaleTimeString(),
      });
    }

    // מחזירים הנתונים למי שמבקש, בלי להדפיס כלום
    return data;

  } catch (err) {
    // במקרה של שגיאה, מחזירים null ולא מדפיסים כלום
    return null;
  }
}

// סגירת Knex רק אם הקובץ מופעל ישירות
if (require.main === module) {
  fetchWeather()
    .finally(() => knex.destroy());
}

module.exports = fetchWeather;
