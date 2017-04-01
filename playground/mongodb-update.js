const {MongoClient,ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
   if(err){
     return console.log('Unable to connect to MongoDB server');
   }
   console.log('Connected to MongoDB server');

   db.collection('Users').findOneAndUpdate(
     {name:'Stanislav'},
     {
       $set: {
         name: 'Stanislav Kholodnykh'
       },
      $inc: {
        age: 2
      }
    },
    {
      returnOriginal: false
    }
   ).then((result)=>{
     console.log(result);
   });;

   //db.close();
});
