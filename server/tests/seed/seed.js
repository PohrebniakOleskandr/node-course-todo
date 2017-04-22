const {ObjectId} = require('mongodb');
const {Todo} = require('./../../models/todo.js');
const {User} = require('./../../models/user.js');
const jwt = require('jsonwebtoken');

let userOneId = new ObjectId();
let userTwoId = new ObjectId();

let users = [
  {
    _id: userOneId,
    email: 'shnurov@leningrad.su',
    password: '123456',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id:userOneId.toHexString(),access:'auth'},'secret123').toString()
    }]
  },
  {
    _id: userTwoId,
    email: 'tooltip@pizdecnax.ui',
    password: '654321'
  }
];


let todos = [{
  _id: new ObjectId(),
  text: 'First thing to do'
}, {
  _id: new ObjectId(),
  text: 'Second thing to do',
  completed: true,
  completedAt: 1111
}];

const populateTodos = (done) => {
  Todo.remove({})
    .then(() => {return Todo.insertMany(todos)})
    .then((res) => {
      done();
    });
};

const populateUsers = (done) => {
  User
  .remove({})
  .then(() => {
    let userOne = new User(users[0]).save();
    let userTwo = new User(users[1]).save();

    return Promise.all([userOne,userTwo]);
  })
  .then(() => done());
};

module.exports = {todos,populateTodos,users,populateUsers};
