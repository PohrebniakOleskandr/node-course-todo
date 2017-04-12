const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');


let todos = [{
  _id: new ObjectId(),
  text: 'First thing to do'
}, {
  _id: new ObjectId(),
  text: 'Second thing to do'
}];

beforeEach((done)=>{
  Todo.remove({})
    .then(() => Todo.insertMany(todos))
    .then(() => done());
});

describe('POST /todos', ()=>{
  it('should create a new todo', (done)=>{
    let text = 'Third thing to do';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res)=>{
        expect(res.body.text).toBe(text);
      })
      .end((err,res)=>{
        if(err) {return done(err);}

        Todo
          .find()
          .then((todos)=> {
            expect(todos[todos.length-1].text).toBe(text);
            done();
          })
          .catch((err)=> done(err));
      });
  });

  it('should not create todo with invalid body data',(done)=>{
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err,res)=>{
      if(err) return done(err);
      Todo
        .find()
        .then((todos)=> {
          expect(todos.length).toBe(2);
          done();
        })
        .catch((err) => done(err));
    });
  });
});


describe('GET /todos', () =>{
  it('should get all todos', (done) => {
    request(app)
    .get('/todos')
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(2);
    })
    .end(done);
  });
});


describe('GET /todos/:id',()=>{
  it('should return todo', (done)=>{
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done)=>{
    let existingTodoRoute = `/todos/${todos[0]._id.toHexString()}`;
    notExistingTodoRoute = existingTodoRoute.slice(0, -1) + 'c';
    request(app)
      .get(notExistingTodoRoute)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done)=>{
    let existingTodoRoute = `/todos/${todos[0]._id.toHexString()}`;
    notExistingTodoRoute += existingTodoRoute + 'cccc';
    request(app)
      .get(notExistingTodoRoute)
      .expect(404)
      .end(done);
  });

});