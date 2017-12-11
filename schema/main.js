const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
  GraphQLEnumType
} = require('graphql');

const {
  mutationWithClientMutationId,
  globalIdField,
    //function that creates a GraphQLID field that has an ID value that is globally unique across schema.
  fromGlobalId,
    //allows the ID to be pulled by client through Node interface.
  nodeDefinitions,
  connectionDefinitions,
  connectionArgs,
  connectionFromArray,
  connectionFromPromisedArray
} = require('graphql-relay');

const { ObjectID } = require('mongodb');

const globalIdFetcher = (globalId, { db }) => {
  const { type, id } = fromGlobalId(globalId);
  switch (type) {
    case 'QuotesLibrary':
      // We only have one quote library
      return quotesLibrary;
    case 'Quote':
      return db.collection('quotes').findOne(ObjectID(id));
    default:
      return null;
  }
};

const globalTypeResolver = obj => obj.type || QuoteType;

const { nodeInterface, nodeField } = nodeDefinitions(
  globalIdFetcher,
  globalTypeResolver
);

const QuoteType = new GraphQLObjectType({
  name: 'Quote',
  interfaces: [nodeInterface],
  fields: {
    id: globalIdField('Quote', obj => obj._id),
    text: { type: GraphQLString },
    author: { type: GraphQLString },
    likesCount: {
      type: GraphQLInt,
      resolve: obj => obj.likesCount || 0
        //obj is a database property, and this logic is how you read likesCount from the database.

    }
  }
});

const { connectionType: QuotesConnectionType } =
  connectionDefinitions({
    name: 'Quote',
    nodeType: QuoteType
  });

let connectionArgsWithSearch = connectionArgs;
connectionArgsWithSearch.searchTerm = { type: GraphQLString };

const QuotesLibraryType = new GraphQLObjectType({
  name: 'QuotesLibrary',
  interfaces: [nodeInterface],
  fields: {
    id: globalIdField('QuotesLibrary'),
    quotesConnection: {
      type: QuotesConnectionType,
      description: 'A list of the quotes in the database',
      args: connectionArgsWithSearch,
      resolve: (_, args, { db }) => {
        let findParams = {};
        if (args.searchTerm) {
          findParams.text = new RegExp(args.searchTerm, 'i');
        }
        return connectionFromPromisedArray(
          db.collection('quotes').find(findParams).toArray(),
          args
        );
      }
    }
  }
});
//QuotesLibraryType is now connected to QuoteType through a connection, and individual -- or a high number of -- quotes can be paginated or returned.


const quotesLibrary = { type: QuotesLibraryType };

//MUTATION code below...


const queryType = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    node: nodeField,
    quotesLibrary: {
      type: QuotesLibraryType,
      description: 'The Quotes Library',
      resolve: () => quotesLibrary
    }
  }
});

const thumbsUpMutation = mutationWithClientMutationId({
  name: 'ThumbsUpMutation',
  inputFields: {
    quoteId: { type: GraphQLString }
  },
  outputFields: {
    quote: {
      type: QuoteType,
      resolve: obj => obj
    }
  },
  mutateAndGetPayload: (params, { db }) => {
    const { id } = fromGlobalId(params.quoteId);
    return Promise.resolve(
      db.collection('quotes').updateOne(
        { _id: ObjectID(id) },
        { $inc: { likesCount: 1 } }
      )
    ).then(result =>
      db.collection('quotes').findOne(ObjectID(id)));
        //this is a promise.
  }
});
//mutateAndGetPayload takes an ID and increments likesCount by 1 in the database, and then outputs the result back to the database.
//IMPORTANT TO NOTE: I used the updateOne() function + $inc operation to update likesCount.  Quote is then returned in a PROMISE.

const mutationType = new GraphQLObjectType({
  name: 'RootMutation',
  fields: {
    thumbsUp: thumbsUpMutation
  }
});

const mySchema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
});

module.exports = mySchema;