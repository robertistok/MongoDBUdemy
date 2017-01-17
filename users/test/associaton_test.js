const mongoose = require('mongoose');
const assert = require('assert');
const User = require('../src/User');
const BlogPost = require('../src/blogpost');
const Comment = require('../src/comment');

describe('Associations', () => {
  let joe, blogPost, comment;

  beforeEach((done) => {
    joe = new User({ name: 'Joe' });
    blogPost = new BlogPost({ title: 'JS is great', content: 'It is really great' });
    comment = new Comment({ content: 'Congrats for joining us' });

    joe.blogPosts.push(blogPost);
    blogPost.comments.push(comment);
    comment.user = joe;


    Promise.all([joe.save(), blogPost.save(), comment.save()])
      .then(() => done());
  });

  it('save a relation between a user and a blogpost', (done) => {
    User.findOne({ name: 'Joe' })
      .populate('blogPosts')
      .then((user) => {
        assert(user.blogPosts[0].title === 'JS is great');
        assert(blogPost._id.equals(user.blogPosts[0]._id))
        done();
      });
  });

  it('saves a full relation graph', (done) => {
    User.findOne({ name: 'Joe' })
      .populate({
        path: 'blogPosts',
        populate: {
          path: 'comments',
          model: 'comment',
          populate: {
            path: 'user',
            model: 'user'
          }
        }
      })
      .then((user) => {
        assert(user.name === 'Joe');
        assert(user.blogPosts[0].title === 'JS is great');
        assert(user.blogPosts[0].comments[0].content === 'Congrats for joining us');
        assert(user.blogPosts[0].comments[0].user.name === 'Joe');

        done();
      })
  });
});
