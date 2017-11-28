const { MongoClient } = require('mongodb');
const assert = require('assert');
const mySchema = require('./schema/main');
const graphqlHTTP = require('express-graphql');
const express = require('express');
//express is the server
const app = express();
app.use(express.static('public'));
//the above line adds 'static middleware', or software between the server and the client-facing index.html.  The public directory is where the index.html file is stored.

const fs = require('fs');
//possibly stands for file sync.
const path = require('path');
//these two libraries -- fs through node and path library -- allow us to write a cache to the filesystem; therefore acting as intermediary between client and filesystem.
const {introspectionQuery} = require('graphql/utilities');
//performs a full introspection query -- looking at all of the data -- on the schema.
console.log(introspectionQuery);

const { graphql } = require('graphql');


const MONGO_URL = 'mongodb://localhost:27017/test';

MongoClient.connect(MONGO_URL, (err, db) => {
  assert.equal(null, err);
  console.log('Connected to MongoDB server');
  app.use('/graphql', graphqlHTTP({
      //defines route at /graphql and delegates handling of route to express-graphql middleware.  Now we can read the input query from the URL.
      schema: mySchema,
      context: { db },
      graphiql: true
      //runs an instance of GraphIQL editor -- good for testing queries before using them forreal.
  }));
    
    graphql(mySchema, introspectionQuery).then(result => {
        fs.writeFileSync(path.join(__dirname, 'cache/schema.json'), JSON.stringify(result, null, 2));
        console.log('Generated cached schema.json file');
    }).catch(console.error);
    
    //this starts the app.
    app.listen(3000, () => 
        console.log('Running Express.js on port 3000, thug.')
    );
});