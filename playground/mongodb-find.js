const {MongoClient,ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
   if(err){
     return console.log('Unable to connect to MongoDB server');
   }
   console.log('Connected to MongoDB server');

   db.collection('Users').find({name:'Alex'}).toArray().then(
     (users)=>{
     console.log('Users whois name is Alex:');
     console.log(users);
   },(err)=>{
     console.log(`Unable to fetch todos ${err}`);
   });

   db.close();
});
