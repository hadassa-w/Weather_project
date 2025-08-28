const request = require('supertest');
const app = require('../app');
const { knex } = require('../lib/db');
const nock = require('nock');
const fetchWeather = require('../scripts/fetchWeather');

jest.setTimeout(10000);

const meteo = {
  queried_at_day: '1/1/2021',
  queried_at_time: '00:00:00',
  temprature: 18,
  description: 'Test',
};

describe('Weather Endpoint', () => {
  beforeEach(async () => {
    await knex('weather').del();
    await knex('weather').insert(meteo);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('should return current data from DB', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([meteo]);
  });

  it('should fetch data from external weather API', async () => {
    const apiResponse = { current: { temp_c: 25, condition: { text: 'Sunny' } } };

    nock('http://api.weatherapi.com')
      .get('/v1/current.json')
      .query(true)
      .reply(200, apiResponse);

    const data = await fetchWeather();

    const dbData = await knex('weather').first();
    expect(dbData.temprature).toBe(25);
    expect(dbData.description).toBe('Sunny');
    expect(data).not.toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    nock('http://api.weatherapi.com')
      .get('/v1/current.json')
      .query(true)
      .reply(500, { error: 'Server error' });

    const data = await fetchWeather();
    expect(data).toBeNull(); // השגיאה מטופלת ולא מדפיסה console
  });

  it('should update DB if data already exists', async () => {
    const newData = { current: { temp_c: 30, condition: { text: 'Hot' } } };

    nock('http://api.weatherapi.com')
      .get('/v1/current.json')
      .query(true)
      .reply(200, newData);

    const data = await fetchWeather();

    const dbData = await knex('weather').first();
    expect(dbData.temprature).toBe(30);
    expect(dbData.description).toBe('Hot');
    expect(data).not.toBeNull();
  });
});
