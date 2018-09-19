// This is where we start the GraphQL Yoga server
// It is an express server, has its own middleware

const { GraphQLServer } = require('graphql-yoga');

// Resolvers decide where the data commes from or where it goes
// in the DB. Queries are pulls, mutations are pushes.

const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const db = require('./db');

// Create the graphql yoga server

function createServer() {
	return new GraphQLServer({
		typeDefs: 'src/schema.graphql',
		resolvers: {
			Mutation: Mutation,
			Query: Query,
		},
		resolverValidaitonOptions: {
			requireResolversForResolveType: false,
		},
		context: req => ({ ...req, db }),
	});
}

module.exports = createServer;