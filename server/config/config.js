let env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if  (env === 'test') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}
//else if  (env === 'production'){  //which is send my heroku
//   process.env.PORT = HEROKAS_PORT;
//   process.env.MONGODB_URI = HEROKAS_DB;
//}
