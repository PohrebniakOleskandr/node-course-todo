const {MongoClient,ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
   if(err){
     return console.log('Unable to connect to MongoDB server');
   }
   console.log('Connected to MongoDB server');

  //  db.collection('Todos').deleteMany({text:'Eat lunch'}).then((result)=>{
  //    console.log(result);
  //  });

  //  db.collection('Todos').deleteOne({text:'Eat lunch'}).then((result)=>{
  //    console.log(result);
  //  });


  db.collection('Users').deleteMany({name:'Junior'}).then((results)=>{
    console.log(results);
  });

  // db.collection('Users')
  // .findOneAndDelete({_id:new ObjectID("58df7a9a7c97b74d32a03ca5")})
  // .then((results)=>{
  //   console.log(results);
  // });

   //db.close();
});
