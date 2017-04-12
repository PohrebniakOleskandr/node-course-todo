const express = require('express');
const bodyParser = require('body-parser');
const {ObjectId} = require('mongodb');


const mongoose = require('./db/mongoose.js');
const {User} = require('./models/user.js');
const {Todo} = require('./models/todo.js');

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

app.get('/todos/:id',(req,res)=>{
  let id = req.params.id;
  if(!ObjectId.isValid(id))
  {
    return res.status(404).send("The todo ID is invalid");
  }
  Todo.findById(id)
    .then((todo)=>{
      if (!todo) return res.status(404).send("There is no such Todo in database");
      res.status(200).send(`Our todo is ${todo}`);
    })
    .catch((e)=>res.status(400).send('Error while fetching todo from database'));
});

app.listen(3000, ()=> {
  console.log('Started on port 3000');
})

module.exports = {app};
