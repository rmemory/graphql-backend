import withApollo from 'next-with-apollo';

/*
 * A nice combo pack of apollo libraries, like in memory cache, local state 
 * management, and error handling. It’s also flexible enough to handle 
 * features like authentication.
 */
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';

function createClient({ headers }) {
  return new ApolloClient({
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

export default withApollo(createClient);
