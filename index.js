const { MongoClient } = require('mongodb');
const assert = require('assert');
const mySchema = require('./schema/main');
const graphqlHTTP = require('express-graphql');
const express = require('express');
//express is the server
const app = express();
app.use(express.static('public'));
//the above line adds 'static middleware', or software between the server and the client-facing index.html.  The public directory is where the index.html file is stored.

const MONGO_URL = 'mongodb://localhost:27017/test';

MongoClient.connect(MONGO_URL, (err, db) => {
  assert.equal(null, err);
  console.log('Connected to MongoDB server');

  //defines route at /graphql and delegates handling of route to express-graphql middleware.  Now we can read the input query from the URL.
  app.use('/graphql', graphqlHTTP({
      schema: mySchema,
      context: { db },
      graphiql: true
      //runs an instance of GraphIQL editor -- good for testing queries before using them forreal.
  }));
    
    //this starts the app.
    app.listen(3000, () => 
        console.log('Running Express.js on port 3000, thug.')
    );
});