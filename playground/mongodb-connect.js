const MongoClient = require('mongodb').MongoClient;


MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
   if(err){
     return console.log('Unable to connect to MongoDB server');
   }
   console.log('Connected to MongoDB server');

  //  db.collection('Todos').insertOne(({
  //    text: "Something to do",
  //    completed: false
  //  }),(err,result)=>{
  //    if(err){
  //      return console.log('${err}\nUnable to insert object to collection \"Todos\"');
  //    }
  //    console.log(JSON.stringify(result.ops,null,2));
  //  });

  db.collection('Users').insertOne(({
    name:"Alex",
    age:22,
    location:"Ukraine,Kyiv"
  }),(err,result)=>{
    if(err){
      return console.log('${err}\nUnable to insert object to collection \"Todos\"');
    }
    console.log(JSON.stringify(result.ops,null,2));
  });

   db.close();
})
