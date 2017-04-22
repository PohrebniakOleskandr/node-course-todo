require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');


const mongoose = require('./db/mongoose.js');
const {User} = require('./models/user.js');
const {Todo} = require('./models/todo.js');
const {authenticate} = require('./middleware/middleware.js'); //server\middleware\middleware.js

const port = process.env.PORT;
const app = express();

app.use(bodyParser.json());

app.post('/todos',(req,res)=>{

  let todo = new Todo({text:req.body.text});

  todo.save().then((doc)=>{

    res.send(doc);
  },(e)=>{
    res.status(400).send(e);
  });

});

app.get('/todos',(req,res)=>{
  Todo.find().then((todos)=>{
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  })
});



app.delete('/todos/:id',(req,res)=>{

  let id = req.params.id;

  if(!ObjectId.isValid(id))
  {
    return res.status(404).send("The todo ID you are trying to remove is invalid");
  }

  Todo.findByIdAndRemove(id)
    .then((todo)=>{
      if(!todo) return res.status(404).send("The ID of todo you wanted to delete couldn't be found");
      res.status(200).send({todo});
    })
    .catch((e) => {res.status(400).send('Error while deleting todo from database')});
});


app.get('/todos/:id',(req,res)=>{
  let id = req.params.id;
  if(!ObjectId.isValid(id))
  {
    return res.status(404).send("The todo ID is invalid");
  }
  Todo.findById(id)
    .then((todo)=>{
      if (!todo) return res.status(404).send("There is no such Todo in database");
      res.status(200).send({todo});
    })
    .catch((e)=>res.status(400).send('Error while fetching todo from database'));
});


app.patch('/todos/:id', (req,res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['text','completed']);

    if(!ObjectId.isValid(id))
    {
      return res.status(404).send("The todo ID is invalid");
    }

    if(_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    }
    else {
      body.completed = false;
      body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new:true}).then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send({todo});
    }).catch((e) => {
      res.status(400).send();
    });
});

app.post('/users',(req,res)=>{

  let userBody = _.pick(req.body, ['email','password']);
  let user = new User(userBody);

  user.save()
    .then(()=>{
      return user.generateAuthToken();
    })
    .then((token)=>{
      res.header('x-auth',token).send(user);
    })
    .catch((e)=>{
      res.status(400).send(e);
    });

});


app.get('/users/me', authenticate,(req,res)=>{
  res.send(req.user);
});

app.listen(port, ()=> {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
