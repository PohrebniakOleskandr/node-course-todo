const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos,populateTodos,users,populateUsers} = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

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
      let fakeId = new ObjectId().toHexString();
      request(app)
        .delete(`/todos/${fakeId}`)
        .expect(404)
        .end(done);
  });

  it('should return 404 for non-object ids', (done)=>{
    let existingTodoRoute = `/todos/${todos[0]._id.toHexString()}`;
    let notExistingTodoRoute = existingTodoRoute + 'cccc';
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
      let fakeId = new ObjectId().toHexString();
      request(app)
        .delete(`/todos/${fakeId}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 for non-object ids', (done)=>{
      let existingTodoRoute = `/todos/${todos[0]._id.toHexString()}`;
      let notExistingTodoRoute = existingTodoRoute + 'cccc';
      request(app)
        .get(notExistingTodoRoute)
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


describe('GET /users/me', () =>{

  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return code 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res)=>{
        expect(res.body).toEqual({});
      })
      .end(done);
  });

});





describe('POST /users', () =>{

  it('should create a user', (done) => {

    let email = "example@gmail.com";
    let password = "zxcvbn";

    request(app)
      .post('/users')
      .send({email,password})
      .expect(200)
      .expect((res)=>{
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) =>{
        if(err) return done(err);

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        });
      });
  });


  it('should return validation errors if request invalid', (done) => {

    let invalidEmail = "example";
    let password = "zxcvbn";

    request(app)
    .post('/users')
    .send({email:invalidEmail,password})
    .expect(400)
    .end(done);

  });

  it('should not create user if email is in use', (done) => {

    let existingEmail = users[0].email;
    let password = "zxcvbn";

    request(app)
    .post('/users')
    .send({email:existingEmail,password})
    .expect(400)
    .end(done);

  });

});
