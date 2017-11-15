const { graphql } = require('graphql');
const readline = require('readline');

const mySchema = require('./schema/main');

const graphqlHTTP = require('express-graphql');

const express = require('express');

const app = express();

const rli = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const { MongoClient } = require('mongodb');
const assert = require('assert');

const MONGO_URL = 'mongodb://localhost:27017/test';

MongoClient.connect(MONGO_URL, (err, db) => {
  assert.equal(null, err);
  console.log('Connected to MongoDB server');

  //defines route at /graphql and delegates handling of route to express-graphql middleware.  Now we can read the input query from the URL.
  app.use('/graphql', graphqlHTTP({
      schema: mySchema,
      context: { db }
  }));
    
    //this starts the app.
    app.listen(3000, () => 
        console.log('Running Express.js on port 3000, thug.')
    );
});