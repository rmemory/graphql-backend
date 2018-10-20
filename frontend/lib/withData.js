/* withApollo is a HOC necessary to use with next to expose 
   ApolloClient to our application. It causes Apollo to be 
   exposed as a prop server side */
import withApollo from 'next-with-apollo';

/*
 * apollo-boost is acombo pack of apollo libraries (caching, errors, 
 * etc)
 * 
 * ApolloClient is the interface to the DB API within the client,
 * and it is exposed to the React application using a prop. 
 * 
 * Note that because we are using next.js here, and server side 
 * rendering, that means we'll need to do a bit of extra work
 * using getInitialProps (see pages/_app.js) and the usage of
 * next-with-apollo as imported here (again, due to server side
 * rendering).
 */
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';

function createClient({ headers }) {
	/* For Apollo Boost configuration options, see this:
		 https://www.apollographql.com/docs/react/essentials/get-started.html#configuration
	 */

	return new ApolloClient({
	// The Yoga endpoint URI
		uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
		request: operation => {
			operation.setContext({
				fetchOptions: {
					// This causes cookies to be transferred even in cross-origin 
					// situations
					// https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
					credentials: 'include',
				},
				headers,
			});
		},
	});
}

// Apollo client is created in _app.js
export default withApollo(createClient);
