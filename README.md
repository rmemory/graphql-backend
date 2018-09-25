This is a boilerplate full stack starter point for React applications, which uses React, Next.js, Node, and GraphQL implementations. The frontend code is aptly placed in the frontend folder, and same for backend.

# FrontEnd Overview

The routes are defined in the frontend/pages directory. Note that server side rendering is used. Each page file defines a route, and each route decides which components are pushed to the client. 

The top level React state for the application is defined in frontend/pages/_app.js. Note that next.js generates pages on demand in development mode, which means when using development mode, there is a bit of delay when switching pages. And we can also pre-fetch the data needed before its displayed as well.

See the frontend/components/Header.js for usage of the nProgress bar, though it could be anywhere.

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

Note that the styled component css is also gathered on the server as pages are pushed. See frontend/pages/_document.js. This prevents flicker, because without the component css is pushed async after the component. Also see: https://github.com/zeit/next.js/#custom-document.


# Backend 

In general terms, the server running on the backend provides an interface (an API) to the database via GraphQL. Note that any front end can access the same GraphQL database. This includes microprocessors, etc. GraphQL is a way to access a database using a single endpoint (not multiple such as REST endpoints) and it allows you to query or mutate exactly the data you need without involving data you don't need. Stated differently, when using GraphQL you access the data you request, and only the data you request. REST on the other hand always involves fixed data as defined by API designer.

The backend is split into two separate pieces: (1) The GraphQL Yoga server and (2) a Prisma GraphQL interface to the database. Yoga provides the top level API used by front end clients and is implemented by a Node server. Yoga handles all of the authentication aspects, credit card charging, email sending, and any other server side logic required. Prisma provides the interface to the database (MySql, MongoDB, etc) and defines the database schema. 

Both Yoga and Prisma define their own API.

## GraphQL Yoga Overview

GraphQL Yoga Server is a Node/Express server. It provides a CRUD/REST API. Because it is implemented as a Node Server it has it's own middleware, etc.

On the frontend, the React components talk to Apollo, which then in turn communicates to the backend GraphQL Yoga, which in turn talks to the database via Prisma GraphQL. Note that in embedded environments, other "front end clients" (different than Apollo) could communicate to GraphQL Yoga or Prisma. Also, in theory you could use GraphQL Yoga without Prisma.

Without GraphQL Yoga, there is no authentication, and no way to add our own logic such as charging credit cards, sending email, hashing passwords, permissions, etc.

## Backend API Definition

The backend/datamodel.graphql and backend/generated/prisma.graphql are for the Prisma GraphQL layer. While backend/src/schema.graphql is for the GraphQL Yoga layer. Meaning that whatever is defined in backend/src/schema.graphql defines what kinds of things (resolvers) you can use to access the Prisma GraphQL backend. The APIs created in the Yoga backend/src/schema.graphql can be vastly different than those defined in the Prisma backend/datamodel.graphql and backend/generated/prisma.graphql depending on the application.

There are three different graphql files in the backend.

* datamodel.graphql is our definition of the database schema. Need to run "npm run deploy" when datamodel.graphql changes.
* primsa.graphql is prisma generated version of our schema. It is automatically generated by "npm run deploy", and defines the full CRUD API to the database provided by Prisma.
* schema.graphql is the public api of the entire backend, is defines our Yoga GraphQL. The resolvers are a Yoga concept, and they implement the APIs and types defined in schema.graphql, and they decide how/when to access the Prisma API.

## GraphQL general overview

In general, GraphQL by itself does not define or specify queries such as "where", "when" like MySql despite the "QL" in its name. For that it requires Yoga. Here is a general look at GraphQL:

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

The initialization (and connection) of GraphQL Yoga to Prisma GraphQL occurs in backend/src/db.js. The GraphQL Yoga server itself is created (started) in backend/src/createServer.js. The GraphQL Yoga server is started in src/index.js. The query and mutation API definitions available to the client on the Yoga server are defined in src/schema.graphql (these are what you see in the Prisma playground when using http:/localhost:4444 which is started by npm run dev on the backend).

Note that the Prisma playground is accessible from the Prisma server URL which is created and printed for you during the "prisma init" command. For example:

https://us1.prisma.sh/richardfmemory-e33d3a/boilerplate/dev

These are the primary files involved in setting up and initializing the backend:

* backend/src/db.js is responsible for setting up Prisma such as pointing at the generated primsa.graphql, the endpoint URL, and endpoint password.
* backend/createServer.js is responsible for setting up Yoga, importing the Yoga resolvers, pointing at the Yoga schema.graphql, pointing the server at the resolver location, providing the resolverValidation options, and the defining the context which is passed to each resolver (which typically includes the http request object and the db defined in db.js).
* backend/src/index.js is responsible for starting the Yoga server by calling createServer, and starting it using the start API which is available on the GraphQLServer returned by the call to createServer. 

For an example of the interface between GraphQL Yoga and Prisma GraphQL, see this: https://github.com/prisma/prisma-binding.

## Resolvers

Each Yoga resolver has the following arguments: myResolver(parent, args, ctx, info). 

* Parent is the parent schema (FIXME). 
* Args are passed to each resolver from the query or mutation request. See the example below.
* Context is defined in createServer.js, and typically includes the http request and Prisma DB object.
* info contains info about the incoming graphql (FIXME).
 
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

As for the resolver APIs themselves, in this example, 

* args is 

```
"name: 'Anna'"
```

* ctx is:

```
{ request: 
   IncomingMessage {
     _readableState: 
      ReadableState {
        objectMode: false,
        highWaterMark: 16384,
        buffer: [Object],
        length: 0,
        pipes: null,
        pipesCount: 0,
        flowing: true,
        ended: true,
        endEmitted: true,
        reading: false,
        sync: false,
        needReadable: false,
        emittedReadable: false,
        readableListening: false,
        resumeScheduled: false,
        destroyed: false,
        defaultEncoding: 'utf8',
        awaitDrain: 0,
        readingMore: false,
        decoder: null,
        encoding: null },
     readable: false,
     domain: null,
     _events: {},
     _eventsCount: 0,
     _maxListeners: undefined,
     socket: 
      Socket {
        connecting: false,
        _hadError: false,
        _handle: [Object],
        _parent: null,
        _host: null,
        _readableState: [Object],
        readable: true,
        domain: null,
        _events: [Object],
        _eventsCount: 10,
        _maxListeners: undefined,
        _writableState: [Object],
        writable: true,
        allowHalfOpen: true,
        _bytesDispatched: 0,
        _sockname: null,
        _pendingData: null,
        _pendingEncoding: '',
        server: [Object],
        _server: [Object],
        _idleTimeout: 120000,
        _idleNext: [Object],
        _idlePrev: [Object],
        _idleStart: 2910,
        _destroyed: false,
        parser: [Object],
        on: [Function: socketOnWrap],
        _paused: false,
        _httpMessage: [Object],
        [Symbol(asyncId)]: 10,
        [Symbol(bytesRead)]: 0,
        [Symbol(asyncId)]: 12,
        [Symbol(triggerAsyncId)]: 10 },
     connection: 
      Socket {
        connecting: false,
        _hadError: false,
        _handle: [Object],
        _parent: null,
        _host: null,
        _readableState: [Object],
        readable: true,
        domain: null,
        _events: [Object],
        _eventsCount: 10,
        _maxListeners: undefined,
        _writableState: [Object],
        writable: true,
        allowHalfOpen: true,
        _bytesDispatched: 0,
        _sockname: null,
        _pendingData: null,
        _pendingEncoding: '',
        server: [Object],
        _server: [Object],
        _idleTimeout: 120000,
        _idleNext: [Object],
        _idlePrev: [Object],
        _idleStart: 2910,
        _destroyed: false,
        parser: [Object],
        on: [Function: socketOnWrap],
        _paused: false,
        _httpMessage: [Object],
        [Symbol(asyncId)]: 10,
        [Symbol(bytesRead)]: 0,
        [Symbol(asyncId)]: 12,
        [Symbol(triggerAsyncId)]: 10 },
     httpVersionMajor: 1,
     httpVersionMinor: 1,
     httpVersion: '1.1',
     complete: true,
     headers: 
      { host: 'localhost:4455',
        connection: 'keep-alive',
        'content-length': '128',
        accept: '*/*',
        origin: 'http://localhost:4455',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        'content-type': 'application/json',
        referer: 'http://localhost:4455/',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9' },
     rawHeaders: 
      [ 'Host',
        'localhost:4455',
        'Connection',
        'keep-alive',
        'Content-Length',
        '128',
        'accept',
        '*/*',
        'Origin',
        'http://localhost:4455',
        'User-Agent',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        'content-type',
        'application/json',
        'Referer',
        'http://localhost:4455/',
        'Accept-Encoding',
        'gzip, deflate, br',
        'Accept-Language',
        'en-US,en;q=0.9' ],
     trailers: {},
     rawTrailers: [],
     upgrade: false,
     url: '/',
     method: 'POST',
     statusCode: null,
     statusMessage: null,
     client: 
      Socket {
        connecting: false,
        _hadError: false,
        _handle: [Object],
        _parent: null,
        _host: null,
        _readableState: [Object],
        readable: true,
        domain: null,
        _events: [Object],
        _eventsCount: 10,
        _maxListeners: undefined,
        _writableState: [Object],
        writable: true,
        allowHalfOpen: true,
        _bytesDispatched: 0,
        _sockname: null,
        _pendingData: null,
        _pendingEncoding: '',
        server: [Object],
        _server: [Object],
        _idleTimeout: 120000,
        _idleNext: [Object],
        _idlePrev: [Object],
        _idleStart: 2910,
        _destroyed: false,
        parser: [Object],
        on: [Function: socketOnWrap],
        _paused: false,
        _httpMessage: [Object],
        [Symbol(asyncId)]: 10,
        [Symbol(bytesRead)]: 0,
        [Symbol(asyncId)]: 12,
        [Symbol(triggerAsyncId)]: 10 },
     _consuming: true,
     _dumped: false,
     next: [Function: next],
     baseUrl: '',
     originalUrl: '/',
     _parsedUrl: 
      Url {
        protocol: null,
        slashes: null,
        auth: null,
        host: null,
        port: null,
        hostname: null,
        hash: null,
        search: null,
        query: null,
        pathname: '/',
        path: '/',
        href: '/',
        _raw: '/' },
     params: {},
     query: {},
     res: 
      ServerResponse {
        domain: null,
        _events: [Object],
        _eventsCount: 1,
        _maxListeners: undefined,
        output: [],
        outputEncodings: [],
        outputCallbacks: [],
        outputSize: 0,
        writable: true,
        _last: false,
        upgrading: false,
        chunkedEncoding: false,
        shouldKeepAlive: true,
        useChunkedEncodingByDefault: true,
        sendDate: true,
        _removedConnection: false,
        _removedContLen: false,
        _removedTE: false,
        _contentLength: null,
        _hasBody: true,
        _trailer: '',
        finished: false,
        _headerSent: false,
        socket: [Object],
        connection: [Object],
        _header: null,
        _onPendingData: [Function: bound updateOutgoingData],
        _sent100: false,
        _expect_continue: false,
        req: [Circular],
        locals: {},
        [Symbol(outHeadersKey)]: [Object] },
     route: Route { path: '/', stack: [Array], methods: [Object] },
     body: 
      { operationName: 'createADog',
        variables: {},
        query: 'mutation createADog {\n  createDog(name: "Anna") {\n    name\n  }\n}\n' },
     _body: true,
     length: undefined,
     read: [Function] },
  response: 
   ServerResponse {
     domain: null,
     _events: { finish: [Function: bound resOnFinish] },
     _eventsCount: 1,
     _maxListeners: undefined,
     output: [],
     outputEncodings: [],
     outputCallbacks: [],
     outputSize: 0,
     writable: true,
     _last: false,
     upgrading: false,
     chunkedEncoding: false,
     shouldKeepAlive: true,
     useChunkedEncodingByDefault: true,
     sendDate: true,
     _removedConnection: false,
     _removedContLen: false,
     _removedTE: false,
     _contentLength: null,
     _hasBody: true,
     _trailer: '',
     finished: false,
     _headerSent: false,
     socket: 
      Socket {
        connecting: false,
        _hadError: false,
        _handle: [Object],
        _parent: null,
        _host: null,
        _readableState: [Object],
        readable: true,
        domain: null,
        _events: [Object],
        _eventsCount: 10,
        _maxListeners: undefined,
        _writableState: [Object],
        writable: true,
        allowHalfOpen: true,
        _bytesDispatched: 0,
        _sockname: null,
        _pendingData: null,
        _pendingEncoding: '',
        server: [Object],
        _server: [Object],
        _idleTimeout: 120000,
        _idleNext: [Object],
        _idlePrev: [Object],
        _idleStart: 2910,
        _destroyed: false,
        parser: [Object],
        on: [Function: socketOnWrap],
        _paused: false,
        _httpMessage: [Circular],
        [Symbol(asyncId)]: 10,
        [Symbol(bytesRead)]: 0,
        [Symbol(asyncId)]: 12,
        [Symbol(triggerAsyncId)]: 10 },
     connection: 
      Socket {
        connecting: false,
        _hadError: false,
        _handle: [Object],
        _parent: null,
        _host: null,
        _readableState: [Object],
        readable: true,
        domain: null,
        _events: [Object],
        _eventsCount: 10,
        _maxListeners: undefined,
        _writableState: [Object],
        writable: true,
        allowHalfOpen: true,
        _bytesDispatched: 0,
        _sockname: null,
        _pendingData: null,
        _pendingEncoding: '',
        server: [Object],
        _server: [Object],
        _idleTimeout: 120000,
        _idleNext: [Object],
        _idlePrev: [Object],
        _idleStart: 2910,
        _destroyed: false,
        parser: [Object],
        on: [Function: socketOnWrap],
        _paused: false,
        _httpMessage: [Circular],
        [Symbol(asyncId)]: 10,
        [Symbol(bytesRead)]: 0,
        [Symbol(asyncId)]: 12,
        [Symbol(triggerAsyncId)]: 10 },
     _header: null,
     _onPendingData: [Function: bound updateOutgoingData],
     _sent100: false,
     _expect_continue: false,
     req: 
      IncomingMessage {
        _readableState: [Object],
        readable: false,
        domain: null,
        _events: {},
        _eventsCount: 0,
        _maxListeners: undefined,
        socket: [Object],
        connection: [Object],
        httpVersionMajor: 1,
        httpVersionMinor: 1,
        httpVersion: '1.1',
        complete: true,
        headers: [Object],
        rawHeaders: [Array],
        trailers: {},
        rawTrailers: [],
        upgrade: false,
        url: '/',
        method: 'POST',
        statusCode: null,
        statusMessage: null,
        client: [Object],
        _consuming: true,
        _dumped: false,
        next: [Function: next],
        baseUrl: '',
        originalUrl: '/',
        _parsedUrl: [Object],
        params: {},
        query: {},
        res: [Circular],
        route: [Object],
        body: [Object],
        _body: true,
        length: undefined,
        read: [Function] },
     locals: {},
     [Symbol(outHeadersKey)]: 
      { 'x-powered-by': [Array],
        'access-control-allow-origin': [Array],
        vary: [Array],
        'access-control-allow-credentials': [Array] } },
  fragmentReplacements: [],
  db: 
   Prisma {
     fragmentReplacements: [],
     schema: 
      GraphQLSchema {
        __allowedLegacyNames: undefined,
        _queryType: Query,
        _mutationType: Mutation,
        _subscriptionType: Subscription,
        _directives: [Array],
        astNode: undefined,
        _typeMap: [Object],
        _implementations: [Object] },
     before: [Function: before],
     query: 
      { users: [Function: value],
        items: [Function: value],
        user: [Function: value],
        item: [Function: value],
        usersConnection: [Function: value],
        itemsConnection: [Function: value],
        node: [Function: value] },
     mutation: 
      { createUser: [Function: value],
        createItem: [Function: value],
        updateUser: [Function: value],
        updateItem: [Function: value],
        deleteUser: [Function: value],
        deleteItem: [Function: value],
        upsertUser: [Function: value],
        upsertItem: [Function: value],
        updateManyUsers: [Function: value],
        updateManyItems: [Function: value],
        deleteManyUsers: [Function: value],
        deleteManyItems: [Function: value] },
     subscription: { user: [Function: value], item: [Function: value] },
     exists: { User: [Function], Item: [Function] } } }


```

* info is:

```
{ fieldName: 'createDog',
  fieldNodes: 
   [ { kind: 'Field',
       alias: undefined,
       name: [Object],
       arguments: [Array],
       directives: [],
       selectionSet: [Object],
       loc: [Object] } ],
  returnType: Dog,
  parentType: Mutation,
  path: { prev: undefined, key: 'createDog' },
  schema: 
   GraphQLSchema {
     __allowedLegacyNames: undefined,
     _queryType: Query,
     _mutationType: Mutation,
     _subscriptionType: null,
     _directives: [ [Object], [Object], [Object] ],
     astNode: undefined,
     _typeMap: 
      { Query: Query,
        Dog: Dog,
        String: String,
        Mutation: Mutation,
        Int: Int,
        Item: Item,
        Node: Node,
        ID: ID,
        DateTime: DateTime,
        __Schema: __Schema,
        __Type: __Type,
        __TypeKind: __TypeKind,
        Boolean: Boolean,
        __Field: __Field,
        __InputValue: __InputValue,
        __EnumValue: __EnumValue,
        __Directive: __Directive,
        __DirectiveLocation: __DirectiveLocation,
        User: User },
     _implementations: { Node: [Array] },
     __validationErrors: [] },
  fragments: {},
  rootValue: undefined,
  operation: 
   { kind: 'OperationDefinition',
     operation: 'mutation',
     name: { kind: 'Name', value: 'createADog', loc: [Object] },
     variableDefinitions: [],
     directives: [],
     selectionSet: { kind: 'SelectionSet', selections: [Array], loc: [Object] },
     loc: { start: 0, end: 64 } },
  variableValues: {} }

```


