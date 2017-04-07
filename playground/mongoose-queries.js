const {ObjectId} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {User} = require('./../server/models/user.js');

let id = '158e483434c604504d885988c';

if (!ObjectId.isValid(id)){
  return console.log('The id of user is invalid');
}


User.findById(id).then((user)=>{
  if(!user) return console.log('There is no such a user in database');
  console.log(user);
}, (e) => {
  console.log(e);
});
