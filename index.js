const { graphql } = require('graphql');
const readline = require('readline');
 
const mySchema = require('./schema/main');

const { MongoClient } = require('mongodb');
const assert = require('assert');

const MONGO_URL = 'mongodb://localhost:27017/test';

MongoClient.connect(MONGO_URL, (err, db) => {
    assert.equal(null, err);
    console.log('You connected to MongoDB server, non-fool.');
})
 
const rli = readline.createInterface({
   input: process.stdin,
   output: process.stdout
 });
 
rli.question('Client Request: ', inputQuery => {
   graphql(mySchema, inputQuery).then(result => {
     console.log('Server Answer :', result.data);
   });
rli.close();
 });