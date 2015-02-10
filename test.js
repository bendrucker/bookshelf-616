'use strict';

var assert = require('assert');

var knex = require('knex')({
  client: 'sqlite',
  connection: {
    filename: ':memory:'
  }
});

var bookshelf = require('bookshelf')(knex);

var Book = bookshelf.Model.extend({
  tableName: 'books'
});

var Chapter = bookshelf.Model.extend({
  tableName: 'chapters',
  book: function () {
    return this.belongsTo(Book);
  }
});

knex.schema
  .createTable(Book.prototype.tableName, function (table) {
    table.increments('id').primary().notNull();
    table.string('name', 100).notNull();
    table.timestamps();
  })
  .createTable(Chapter.prototype.tableName, function (table) {
    table.increments('id').primary().notNull();
    table.string('title', 50).notNull();
    table.integer('book_id').notNull().references('id').inTable('books');
    table.timestamps();
  })
  .then(function () {
    return new Book({name: 'The Book'}).save();
  })
  .bind({})
  .then(function (book) {
    this.bookId = book.id;
    return new Chapter({
      title: 'The Chapter',
      book_id: book.id 
    })
    .save();
  })
  .then(function () {
    return new Chapter({
      title: 'The Chapter'
    })
    .fetch({
      withRelated: 'book'
    });
  })
  .tap(console.log)
  .then(function (chapter) {
    assert.equal(chapter.related('book').id, this.bookId);
    console.log('Success!');
  })
  .finally(function () {
    return knex.destroy();
  })
  .catch(function (err) {
    console.err(err);
    process.exit(1);
  });
