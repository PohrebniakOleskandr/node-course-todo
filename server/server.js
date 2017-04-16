const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');


const mongoose = require('./db/mongoose.js');
const {User} = require('./models/user.js');
const {Todo} = require('./models/todo.js');

const port = process.env.PORT || 3000;
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



app.listen(port, ()=> {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
