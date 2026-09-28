const { expect } = require('chai');
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const pool = require('../src/db');

const sampleUsers = [
  ['daranporn@gmail.com', 'Sira', 'Weerakittana', '0891234567', '2012-05-26'],
  ['boonpoj@gmail.com', 'Rosanan', 'Suvanabhumiwong', '0641825563', '2011-10-17'],
  ['bodin_thai@gmail.com', 'Tankwan', 'Srisuk', '0986345661', '2007-04-29'],
];

async function resetSampleData() {
  await pool.execute('DELETE FROM `user`');
  const hash = await bcrypt.hash('sample123', 4);
  for (const [email, first, last, tel, dob] of sampleUsers) {
    await pool.execute('INSERT INTO `user` (userEmail, userPassword, userFirstName, userLastName, userTel, dateOfBirth) VALUES (?, ?, ?, ?, ?, ?)', [email, hash, first, last, tel, dob]);
  }
}

describe('User integration API', function () {
  before(async function () { await resetSampleData(); });
  after(async function () { await resetSampleData(); await pool.end(); });

  it('IT-1 retrieves all 3 users without passwords', async function () {
    const response = await request(app).get('/users');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array').with.length(3);
    expect(response.body[0]).to.have.property('age').that.is.a('number');
    for (const user of response.body) expect(user).not.to.have.property('userPassword');
  });

  it('IT-2 creates a user and increases the database count to 4', async function () {
    const response = await request(app).post('/users').send({
      userEmail: 'new.student@example.com', userPassword: 'abc12345', userFirstName: 'New',
      userLastName: 'Student', userTel: '0812345678', dateOfBirth: '2000-01-15',
    });
    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal('Created');
    const [[count]] = await pool.execute('SELECT COUNT(*) AS total FROM `user`');
    expect(count.total).to.equal(4);
    const [[stored]] = await pool.execute('SELECT userPassword FROM `user` WHERE userEmail = ?', ['new.student@example.com']);
    expect(stored.userPassword).not.to.equal('abc12345');
    expect(await bcrypt.compare('abc12345', stored.userPassword)).to.equal(true);
  });

  it('IT-3 rejects a duplicate email', async function () {
    const response = await request(app).post('/users').send({
      userEmail: 'daranporn@gmail.com', userPassword: 'abc12345', userFirstName: 'Test',
      userLastName: 'Duplicate', userTel: '0812345678', dateOfBirth: '2000-01-15',
    });
    expect(response.status).to.equal(409);
    expect(response.body.error).to.match(/email already exists/i);
  });

  it('IT-4 rejects incomplete registration data', async function () {
    const response = await request(app).post('/users').send({ userEmail: 'incomplete@example.com' });
    expect(response.status).to.equal(400);
    expect(response.body.error).to.match(/missing mandatory fields/i);
    expect(response.body.missingFields).to.include('userPassword');
  });
});
