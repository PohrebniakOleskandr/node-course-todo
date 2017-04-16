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
  text: 'Second thing to do',
  completed: true,
  completedAt: 1111
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


describe('DELETE /todos/:id', () =>{

    it('should return 200 if todo has been deleted', (done)=>{

      let hexIdOfSecondTodo = todos[1]._id.toHexString();
      request(app)
        .delete(`/todos/${hexIdOfSecondTodo}`)
        .expect(200)
        .expect((res)=>{
          expect(res.body.todo._id).toBe(hexIdOfSecondTodo);
        })
        .end((err,res)=>{
          if(err) return done(err);

          Todo.findById(hexIdOfSecondTodo)
            .then((todo)=>{
              expect(todo).toNotExist();
              done();
            })
            .catch(e=>done(e));
        });
    });

    it('should return 404 if todo not found', (done) =>{
      let existingTodoRoute = `/todos/${todos[0]._id.toHexString()}`;
      notExistingTodoRoute = existingTodoRoute.slice(0, -1) + 'c';
      request(app)
        .delete(notExistingTodoRoute)
        .expect(404)
        .end(done);
    });

    it('should return 404 if object is invalid', (done) =>{
      let existingTodoRoute = `/todos/${todos[0]._id.toHexString()}`;
      notExistingTodoRoute += existingTodoRoute + 'cccc';
      request(app)
        .delete(notExistingTodoRoute)
        .expect(404)
        .end(done);
    });

});



describe('PATCH /todos/:id', () =>{
  it('should update first todo', (done) => {
    let hexId = todos[0]._id.toHexString();
    let newText = `New first thing to do`;
    request(app)
      .patch(`/todos/${hexId}`)
      .send({text:newText,completed:true})
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end(done);
  });


  it('should should clear the completedAt when todo is not completed', (done) => {
    let hexId = todos[1]._id.toHexString();
    let newText = `New second thing to do`;

    request(app)
      .patch(`/todos/${hexId}`)
      .send({text:newText,completed:false})
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo.text).toBe(newText);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });

});
