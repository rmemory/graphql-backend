import withApollo from 'next-with-apollo';

/*
 * A nice combo pack of apollo libraries, like in memory cache, local state 
 * management, and error handling. It’s also flexible enough to handle 
 * features like authentication.
 * 
 * ApolloClient is the interface to the DB API within the client,
 * and it is exposed to the React application using a prop. Note
 * that because we are using next.js here, and server side 
 * rendering, that means we'll need to do a bit of extra work
 * using getInitialProps (see pages/_app.js) and the usage of
 * next-with-apollo as imported here (again, due to server side
 * rendering).
 */
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';

function createClient({ headers }) {
  return new ApolloClient({
	// The Yoga endpoint URI
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
  });
}

// Apollo client is created in _app.js
export default withApollo(createClient);
