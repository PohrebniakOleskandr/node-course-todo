require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');


const mongoose = require('./db/mongoose.js');
const {User} = require('./models/user.js');
const {Todo} = require('./models/todo.js');
const {authenticate} = require('./middleware/middleware.js'); //server\middleware\middleware.js
const bcrypt = require('bcryptjs');

const port = process.env.PORT;
const app = express();

app.use(bodyParser.json());

app.post('/todos',authenticate,(req,res)=>{

  let todo = new Todo({
    text : req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc)=>{

    res.send(doc);
  },(e)=>{
    res.status(400).send(e);
  });

});

app.get('/todos',authenticate,(req,res)=>{
  Todo.find({_creator: req.user._id}).then((todos)=>{
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  })
});

app.get('/todos/:id',authenticate,(req,res)=>{
  let id = req.params.id;
  if(!ObjectId.isValid(id))
  {
    return res.status(404).send("The todo ID is invalid");
  }
  Todo.findOne(
    {
      _id:id,
      _creator: req.user
    }
  )
    .then((todo)=>{
      if (!todo) return res.status(404).send("There is no such Todo in database");
      res.status(200).send({todo});
    })
    .catch((e)=>res.status(400).send('Error while fetching todo from database'));
});


app.delete('/todos/:id',authenticate,(req,res)=>{

  let id = req.params.id;

  if(!ObjectId.isValid(id))
  {
    return res.status(404).send("The todo ID you are trying to remove is invalid");
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  })
    .then((todo)=>{
      if(!todo) return res.status(404).send("The ID of todo you wanted to delete couldn't be found");
      res.status(200).send({todo});
    })
    .catch((e) => {res.status(400).send('Error while deleting todo from database')});
});

app.patch('/todos/:id',authenticate, (req,res) => {

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
    
    Todo.findOneAndUpdate({
      _id: id,
      _creator: req.user._id
      },
      {$set: body},
      {new:true})
        .then((todo) => {
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


app.post('/users/login',(req,res)=>{

  let userBody = _.pick(req.body, ['email','password']);
  let {email,password} = userBody;

  User
  .findByCredentionals(email,password)
  .then(user => {
     return user.generateAuthToken()
          .then((token)=>{
            /*return Promise.reject();*/
            res.status(200).header('x-auth',token).send('You have success log in...');
          });
  })
  .catch((e) => {
    res.status(400).send();
  });
});

app.get('/users/me', authenticate,(req,res)=>{
  res.send(req.user);
});


app.delete('/users/me/token'/**/, authenticate,(req,res)=>{
  req.user.removeToken(req.token).then(()=>{
    res.status(200).send();
  },()=>{
    res.status(400).send();
  })
});

app.listen(port, ()=> {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
