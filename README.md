This is a boilerplate full stack starter point for React applications, which uses React, Next.js, Node, and GraphQL implementations. The frontend code is aptly placed in the frontend folder, and same for backend.

# FrontEnd Overview

The routes are defined in the frontend/pages directory. Note that server side rendering is used. Each page file defines a route, and each route decides which components are pushed to the client. 

The top level React state for the application is defined in frontend/pages/_app.js.

The overall color theme for the application is defined in a theme object in frontend/components/Page.js.

Global CSS is imported in the head section, see frontend/components/Header.js. However, the application specific, top level CSS starts in the injectGlobal section found in frontend/components/Page.js. All other styling is performed on a component by component basis using styled components.

Note that the styled component css is also gathered on the server as pages are pushed. See frontend/pages/_document.js. This prevents flicker, because without the component css is pushed async after the component.

Progress for route changes are shown using an nprogress bar. See frontend/components/Header.js which includes the Nav.js.

# Backend Overview

The server provides an interface to the database via GraphQL. Note that any front end can access the same GraphQL database. This includes microprocessors, etc. GraphQL is a fancy way to access data, using a single endpoint (not multiple such as REST endpoints) and it allows you to query or mutate exactly the data you need. Stated differently, you access the data you request, and only the data you request. REST on the other hand always sends fixed data as defined by API designer.

query {
  items(where: title_contains: "belt" ) {
    id
    title
    user{
      id
      name
      cart {
        quantity
        item {
          title
        }
      }
    }
  }
  users {
    name
  }
}

mutation {
  createUser(data: {
    name: "Richard Fred"
    email: "goober@foober.net"
  }) { // this is the return value from the mutation
    name
    email
  }
}

query {
  users(where: {
    name_contains: "Richard"
  }) {
    id
    name
  }
}


// Connection queries: Expose advanced features like aggregations and Relay compliant connections enabling a powerful pagination model
query {
  usersConnection {
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    aggregate {
      count
    }
  }
}

This application uses Prisma, a GraphQL implementation on the backend. The backend also uses GraphQL Yoga to handle resolvers, and server side actions associated with queries.

## Prisma Setup

https://www.prisma.io/

Click Getting Started -> Open Console

At terminal, in the backend folder

$ sudo npm i -g prisma

$ prisma login

// In browswer, Grant permission, close window


$ prisma init

For development, select "Demo server".

The above creates datamodel.graphql and prisma.yml. It also provides the PRISMA_ENDPOINT, etc, which need to be put into a variables.env file, which should not be committed to github. The datamodel.graphql file defines the datamodel. 

type User {
  id: ID! @unique
  name: String!
  email: String!
}

The initial primsa.yml is a "service definition file". See this:

https://www.prisma.io/docs/reference/service-configuration/prisma.yml/overview-and-example-foatho8aip/

The initial prisma.yml, looks like this:

endpoint: ${env:PRISMA_ENDPOINT}
datamodel: datamodel.graphql
secret: ${env:PRISMA_SECRET}

hooks:
  post-deploy:
    - graphql get-schema -p prisma


Now deploy (generate) the schema and database.

$ prisma deploy --env-file variables.env

or 

$ npm run deploy

Its kind of like "php artisan migrate" for Laravel.

Via the post-deploy hook defined in prisma.yml, the actual schema for the application is then found in backend/prisma/datamodel.graphql

# GraphQL Yoga

GraphQL Yoga Server is a Node/Express server, and provides a CRUD API. Like Node, it has middleware, etc.

On the frontend, the React components talk to Apollo, which then in turn communicate to the backend starting with GraphQL Yoga, which in turn talks to the database via Prisma GraphQL.

Note that in embedded environments, other clients (different than Apollo) could communicate to GraphQL Yoga or Prisma.

Without GraphQL Yoga, there is no authentication, and no way to add our own logic such as charging credit cards, sending email, hashing passwords, permissions, etc.

Connections to the database from GraphQL Yoga to Prisma GraphQL, occur in backend/src/db.js.

For an example of the interface between GraphQL Yoga and Prisma GraphQL, see this:

https://github.com/prisma/prisma-binding

The GraphQL Yoga server itself is created in backend/src/createServer.js. Client side queries and mutations are defined in src/schema.graphql. In other words, the GraphQL Yoga server will match up whatever is defined in the schema.graphql with the resolvers (mutation or query).

The GraphQL Yoga server is started in src/index.js.

The backend/datamodel.graphql and backend/generated/prisma.graphql are for the Prisma GraphQL layer. While backend/src/schema.graphql is for the GraphQL Yoga layer. Meaning that whatever is defined in backend/src/schema.graphql limits what kinds of things (resolvers) you can use to access the Prisma GraphQL backend.
 
The resolvers (Mutation.js and Query.js) decide how the data specified in the backend/src/schema.graphql is accessed from Prisma GraphQL.

Resolvers (which of course run on the Yoga GraphQL Node Express server in the backend) are used to access things like external REST endpoints (such as on a entirely different backend elsewhere), possibly a file on the server's file system, or most often, the resolver accesses the DB by using Prisma GraphQL. 

Here is a simple example, which doesn't access Prisma. It just sets the data in global memory space on the server.

The schema.graphql, looks like this:

type Dog {
	name: String!
}

type Mutation {
	createDog(name: String!): Dog
}

type Query {
	dogs: [Dog]!
}

This implies inside of the GraphQL playground launched on http://localhost:4444/ by running npm run dev, you will be able to create queries/mutations like this:

query getAllDogs {
  dogs {
    name
  }
}

mutation createADog{
  createDog(name: "Anna"){
    name
  }
}

But in the Query and Mutation files, you need these respectively:

const Query = {
	dogs(parent, args, ctx, info) {
		global.dogs = global.dogs || [];
		return global.dogs;
	},
};

module.exports = Query;

const Mutations = {
	createDog(parent, args, ctx, info) {
		global.dogs = global.dogs || [];
		const newDog = { name: args.name};
		global.dogs.push(newDog);
		return newDog;
	},
};

module.exports = Mutations;

Again, in the above example, nothing is getting stored in the DB. It just shows how the backend API works with resolvers. The schema.graphql defines the types and APIs, and the resolvers are the implementation of that schema. 

