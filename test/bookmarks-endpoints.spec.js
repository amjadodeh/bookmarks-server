const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

let db;

before('make knex instance', () => {
  db = knex({
    client: 'pg',
    connection: process.env.TEST_DB_URL,
  });
  app.set('db', db);
});

before('clean the table', () => db('bookmarks').truncate());
afterEach('cleanup', () => db('bookmarks').truncate());
after('disconnect from db', () => db.destroy());

describe(`GET /bookmarks`, () => {
  context(`Given no bookmarks`, () => {
    it(`responds with 200 and an empty list`, () => {
      return supertest(app)
        .get('/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, []);
    });
  });

  context('Given there are bookmarks in the database', () => {
    const testBookmarks = makeBookmarksArray();

    beforeEach('insert bookmarks', () => {
      return db.into('bookmarks').insert(testBookmarks);
    });

    it('responds with 200 and all of the bookmarks', () => {
      return supertest(app)
        .get('/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, testBookmarks);
    });
  });
});

describe(`GET /bookmarks/:bookmark_id`, () => {
  context(`Given no bookmarks`, () => {
    it(`responds with 404`, () => {
      const bookmarkId = 123456;
      return supertest(app)
        .get(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(404, { error: { message: `Bookmark doesn't exist` } });
    });
  });

  context('Given there are bookmarks in the database', () => {
    const testBookmarks = makeBookmarksArray();

    beforeEach('insert bookmarks', () => {
      return db.into('bookmarks').insert(testBookmarks);
    });

    it('responds with 200 and the specified bookmarks', () => {
      const bookmarkId = 2;
      const expectedBookmark = testBookmarks[bookmarkId - 1];
      return supertest(app)
        .get(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, expectedBookmark);
    });
  });
});
