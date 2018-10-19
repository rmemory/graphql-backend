// This file connects to the remote prisma DB and gives us
// access to the DB and ability to query the DB with
// JS

// prisma-binding is the interface between JS and GraphQL
const { Prisma } = require('prisma-binding');

// Created by the npm run deploy step
const db = new Prisma({ 
	typeDefs: 'src/generated/prisma.graphql',
	endpoint: process.env.PRISMA_ENDPOINT,
	secret: process.env.PRISMA_SECRET,

	// console logs queries and mutations if true (noisy)
	debug: false,
});

module.exports = db;