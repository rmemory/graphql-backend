This is a boilerplate full stack starter point for React applications, which uses React, Next.js, Node, and GraphQL implementations. The frontend code is placed in the frontend folder, and same for backend.

# Frontend (which actually has a server side component to it)

The frontend consists of a both React and Apollo. The React part is controlled via Next.js. Apollo manages state, caching, and is the client side interface to the GraphQL database on the backend.

## Next.js

Next.js handles the webpack build aspects, code splitting, and also renders each component on the server, which may or may not be the same as the database.

In Next.js each "server side" route is defined inside of the pages folder, using a single React component per route. These are all rendered by Next on the server. Each route in turn serves up a React component (or even multiple Components) which are rendered on the client side.

### getInitialProps

Next.js provides a server side method called getInitialProps(), which Next calls before it sends the Component to the client. In this app, it is used to resolve the query params in the URL and resolve the Component CSS to prevent flicker.

In theory that same getInitialProps() method, could be used to get the data required for the Component from the database before the Component is sent to the client. Here is a rather simple example of what that could look like:

```
getInitialProps = async function() {
	const result = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
	const data = await result.json();

	return {
		bpi: data.bpi
	};
}
```

The "bpi" data above becomes accessible on the client side Component via the usual props.

```
list = <li className="list-group-item">
		Bitcoin rate for {this.props.bpi.USD.description}:
		<span className="badge badge-primary">{this.props.bpi.USD.code}</span>
		<strong>{this.props.bpi.USD.rate}</strong>
	</li>
```

### Routing using pages

The pages directory in the project contains the routes. They are rendered on the server (calling getInitialProps first).

The concept of server side routing is useful in order that the entire application isn't loaded all at once, as is the case in a typical single page app. Additionally, Next.js provides webpack tooling behind the scenes which uses module splitting, which insures that only the modules required by a particular module are loaded for the components which use them.

A simple index route is created by creating a file pages/index.js, which contains the following:

```
const Index = () => (
  <div>
    <p>Hello Next.js</p>
  </div>
)

export default Index
```

### Hot module reloading

Next.js has hot module reloading for development, and displays all errors in the browser. 

### Client side routing

Even though it supports server side routing as described above, Next.js does not preclude the usage of client side routing. In order to support client-side navigation, Next.js's Link API is used, which is exported via next/link.

```
import Link from 'next/link'

const Index = () => (
  <div>
    <Link href="/about">
      <a>About Page</a>
    </Link>
    <p>Hello Next.js</p>
  </div>
)

export default Index
```

Usage of Link above is all that is required to implement client side routing. next/link does all the location.history handling for you.

Note that styles to links must be done on the a tag, not the Link component. Stated differently, this works:

```
<Link href="/about">
  <a style={{ fontSize: 20 }}>About Page</a>
</Link>
```

This does not (or more accurately the style is ignored)

```
<Link href="/about" style={{ fontSize: 20 }}>
  <a>About Page</a>
</Link>
```

Links in Next are High Order Components:

https://reactjs.org/docs/higher-order-components.html

Also note that buttons can be used instead of anchor tags. Clicking on this button causes the server to serve the about link (page).

```
<Link href="/about">
  <button>Go to About Page</button>
</Link>
```
Or anything, including a div. You just need to add the onClick property. See the docs for more examples including the HOC withRouter

https://github.com/zeit/next.js#routing

https://github.com/zeit/next.js#using-a-higher-order-component

### pages/_app.js

In this application, the only component that implements the getInitialProps is _app.js, which is basically the root for all state and handling layout for all pages.

https://nextjs.org/docs/#custom-app

The basic __app.js might look like this:

```
import App, { Container } from 'next/app';
import Page from "../components/Page";

class MyApp extends App {
	render() {
		const { Component } = this.props;

		return (
			<Container>
				<Page>
					<Component />
				</Page>
			</Container>
		)
	}
}

export default MyApp;
```

In the example above, Page is a client side component, and Component is the Route Component being rendered. That said, we need to add more functionality to our _app.js, and thus it is a bit more complex.

### Progress bar

See the frontend/components/Header.js for usage of the nProgress bar, though it could be anywhere.

### Styles, themes, and CSS

The overall color theme for the application is defined in a theme object in frontend/components/Page.js, and a ThemeProvider is used (via React Context) to be available througout the application on any component which is a descendent of Page.

Global CSS is imported in the head section: see frontend/components/Header.js. However, the application specific, top level CSS starts in the injectGlobal section found in frontend/components/Page.js (which itself specifies global styles). All other styling is performed on a component by component basis using styled components.

```
import styled, { ThemeProvider, injectGlobal } from 'styled-components';

const MyButton = styled.button`
	background: red;
	font-size: 100px;
	span {
		font-size: 100px;
		border-radius: ${props => props.theRadius ? '0px' : props.theRadius}
	}
	.some-class {
		background: yellow;
	}
`;

class Page extends Component {
	render() {
		return (
			<MyButton>
				Click Me
				<span>-></span>
				<span className="some-class">Whatever</span>
			</MyButton>
		);
	}
}
```

One possible directory structure (not shown in this project) might be the following:

components/
	Header/
		index.js /* The component itself */
		styles.js /* The styled component used for header */
		__test__.js /* The Header test case */

### CSS flicker and document.js

Note that the styled component css is also gathered on the server as pages are pushed. See frontend/pages/_document.js. This prevents flicker, because without the component css is pushed async after the component. Also see: https://github.com/zeit/next.js/#custom-document.


## Apollo

Apollo is client side. It calls the Yoga GraphQL API (using mutations and queries), it caches any data it can on the client side, and it handles all of the React state (ie. redux), including local state, errors, loading, etc.

Generally it includes these libraries:

apollo-boost: Package containing everything you need to set up Apollo Client
react-apollo: View layer integration for React
graphql: Also parses your GraphQL queries

The Apollo client is created and configured in frontend/lib/withData.js, and this wraps the frontend/pages/_app.js, which nests everything inside of the ApolloProvider. Kinda magic.


# Backend 

In general terms, the server running on the backend provides an interface (an API) to the database via GraphQL. Note that any front end can access the same GraphQL database. This includes microprocessors, React Native, etc. 

GraphQL is a way to access a database using a single endpoint (not multiple such as REST endpoints) and it allows you to query or mutate exactly the data you need without involving data you don't need. Stated differently, when using GraphQL you access the data you request, and only the data you request. REST on the other hand always involves fixed data as defined by API designer.

## GraphQL general overview

In general, GraphQL by itself does not define or specify queries such as "where", "when" like MySql despite the "QL" in its name. But Prisma does. Here is a general look at GraphQL using Prisma

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

## GraphQL Yoga Overview

The backend is split into two separate pieces: (1) The GraphQL Yoga server and (2) a Prisma GraphQL interface to the database. 

Yoga provides the top level API on the backend used by front end clients. It is implemented by a Node server. Yoga handles all of the authentication aspects, credit card charging, email sending, and any other server side logic required. 

Prisma provides the interface to the database (MySql, MongoDB, etc) and defines the database schema. 

Both Yoga and Prisma have their own APIs.

GraphQL Yoga Server is a Node/Express server. It provides a CRUD/REST API. Because it is implemented as a Node Server it has it's own middleware, etc.

On the frontend, the React components talk to Apollo, which then in turn communicates to the backend GraphQL Yoga, which in turn talks to the database via Prisma GraphQL. 

Note that in embedded (microcontroller) environments, other "front end clients" (different than Apollo) could communicate to GraphQL Yoga or Prisma. Also, in theory you could use GraphQL Yoga without Prisma.

Without GraphQL Yoga, there is no authentication, and no way to add our own logic such as charging credit cards, sending email, hashing passwords, permissions, etc.

## Backend API Definition

The files backend/datamodel.graphql and backend/generated/prisma.graphql define the Prisma GraphQL API. 

The file backend/src/schema.graphql is the API for the GraphQL Yoga layer. Meaning that whatever is defined in backend/src/schema.graphql defines what kinds of things (resolvers) you can use to access the Prisma GraphQL backend. The APIs created in the Yoga backend/src/schema.graphql can be vastly different than those defined in the Prisma backend/datamodel.graphql and backend/generated/prisma.graphql depending on the application.

In summary, there are three different graphql files in the backend.

* datamodel.graphql is our definition of the database schema. Need to run "npm run deploy" when datamodel.graphql changes.
* primsa.graphql is prisma generated version of our schema. It is automatically generated by "npm run deploy", and defines the full CRUD API to the database provided by Prisma.
* schema.graphql is the public api of the entire backend, is defines our Yoga GraphQL. The resolvers are a Yoga concept, and they implement the APIs and types defined in schema.graphql, and they decide how/when to access the Prisma API.

## Prisma Setup

In all cases, to see current databases deployed to the prisma sandbox go to https://www.prisma.io/

Click Getting Started -> Open Console

To set up a new database do the following. First, open a terminal in the backend directory, and if you haven't already installed prisma, run this:

```
$ sudo npm i -g prisma
```

Next, to login to prisma if you haven't already done so, do this: 

```
$ prisma login
```

That will open the browser to allow you to grant permission for Prisma to run on your machine. Grant access as directed in the browser and return back to the terminal opened previously. 
ge
To create a new database, or interface with an existing MySql or MongoDB database run this:

```
$ prisma init
```

For development, select "Demo server".

The above creates datamodel.graphql and prisma.yml in that backend directory. The print out from the prisma init also provides the PRISMA_ENDPOINT value, etc, which will need to be put into a variables.env file (not committed to source control). 


The datamodel.graphql file defines the Prisma datamodel. Here is a simple starter example of what you could enter in that file for Users.

```
type User {
  id: ID! @unique
  name: String!
  email: String!
}
```

The initial primsa.yml is a "service definition file". See this for more description of what that means:

https://www.prisma.io/docs/reference/service-configuration/prisma.yml/overview-and-example-foatho8aip/

The initial prisma.yml, might look like this:

```
endpoint: ${env:PRISMA_ENDPOINT}
datamodel: datamodel.graphql
secret: ${env:PRISMA_SECRET}

hooks:
  post-deploy:
    - graphql get-schema -p prisma
```

The PRISMA_ENDPOINT and PRISMA_SECRET values are defined in the variables.env file.

That last step in prisma.yml called "hooks" creates (generates) the actual primsa schema. This file defines all of the types, operations that are valid from a Prisma perspective. To generate that file, run this:

```
$ prisma deploy --env-file variables.env
```

or just this:

```
$ npm run deploy
```

Its kind of like "php artisan migrate" for Laravel. It needs to be run each time the datamodel.graphql file changes. The generated prisma schema is returned by the deploy step to backend/src/generated/prisma.graphql. 

## Backend initialization: Both Yoga and Prisma

The initialization (and connection) of GraphQL Yoga to Prisma GraphQL occurs in backend/src/db.js by using prisma-binding (a graphql to JS library). 

The GraphQL Yoga server itself is created (started) in backend/src/createServer.js. The GraphQL Yoga server is started in src/index.js. 

The query and mutation API definitions available to the client on the Yoga server are defined in src/schema.graphql (these are what you see in the Prisma playground when using http:/localhost:4444 which is started by npm run dev on the backend).

Note that the Prisma playground is accessible from the Prisma server URL which is created and printed for you during the "prisma init" command. For example:

https://us1.prisma.sh/richardfmemory-e33d3a/boilerplate/dev

These are the primary files involved in setting up and initializing the backend:

* backend/src/db.js is responsible for setting up Prisma such as pointing at the generated primsa.graphql, the endpoint URL, and endpoint password.
* backend/createServer.js is responsible for setting up Yoga, importing the Yoga resolvers, pointing at the Yoga schema.graphql, pointing the server at the resolver location, providing the resolverValidation options, and the defining the context which is passed to each resolver (which typically includes the http request object and the db defined in db.js).
* backend/src/index.js is responsible for starting the Yoga server by calling createServer, and starting it using the start API which is available on the GraphQLServer returned by the call to createServer. 

For an example of the interface between GraphQL Yoga and Prisma GraphQL, see this: https://github.com/prisma/prisma-binding.

## Resolvers

Each Yoga resolver has the following arguments: myResolver(parent, args, ctx, info). 

* Parent is the parent schema. 
* Args are passed to each resolver from the query or mutation request. See the example below.
* Context is defined in createServer.js, and typically includes the http request and Prisma DB object.
* info contains the return information requested by the client.
 
## Simple example of Yoga API without Prisma

Here is a simple example of an API defined in Yoga which in this example doesn't use Prisma to store data in an actual database. Instead it just sets the data in global memory space on the server.

In this example, the schema.graphql looks like this:

```
type Dog {
	name: String!
}

type Mutation {
	createDog(name: String!): Dog
}

type Query {
	dogs: [Dog]!
}
```

The Mutation and Query's presented in schema.graphql are API definitions for Yoga. These now must be implemented in their respective resolver js files. The Dog found in schema.graphql is the data type used by both APIs. 

The Query and Mutation .js files, could look like this. Note these don't use Prisma.

```
const Query = {
	dogs(parent, args, ctx, info) {
		// Just queried in global space, not using Prisma
		global.dogs = global.dogs || [];
		return global.dogs;
	},
};

module.exports = Query;
```

```
const Mutations = {
	createDog(parent, args, ctx, info) {
		// Just stored in global space, not using Prisma
		global.dogs = global.dogs || [];
		const newDog = { name: args.name};
		global.dogs.push(newDog);
		return newDog;
	},
};

module.exports = Mutations;
```

To experiment with that implementation, assuming all of the initialization are already handled, start the server by running:

```
$ npm run dev
```

And in the browser, open http://localhost:4444/, and in the playground provided by the browser you will be able to create graphql queries/mutations like a frontend client would like this:


```
mutation createADog{
  createDog(name: "Anna"){
    name
  }
}

query getAllDogs {
  dogs {
    name
  }
}
```

Again, in the above example, nothing is getting stored in a DB. It just shows how the backend public API works with Yoga resolvers. The schema.graphql defines the types and APIs, and the resolvers are the implementation of that schema. 

In summary:

Prisma APIs are defined in: backend/datamodel.graphql and backend/generated/prisma.graphql

Yoga APIs are defined in: backend/src/schema.graphql (this file defines the public API provided by the backend) and backend/src/resolvers (which implement the API defined in schema.graphql, and decide how and when Prisma is used).

The playground provides a way to excercise the current API presented by Yoga.
