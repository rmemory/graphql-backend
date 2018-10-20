import App, { Container } from 'next/app';
import Page from '../components/Page';

/* both of the following are required to get Apollo working with Next */
import { ApolloProvider } from 'react-apollo';
import withData from '../lib/withData';

/* Next.js uses the App component to initialize pages. You can override it 
 * and control the page initialization. Which allows you to do amazing things 
 * like:
 *
 * Persisting layout between page changes
 * Keeping state when navigating pages
 * Custom error handling using componentDidCatch
 * Inject additional data into pages (for example by processing GraphQL queries)
 */
class MyApp extends App {
	static async getInitialProps({ Component, router, ctx }) {
		let pageProps = {};
		
		// If the page has props, then those props will be 
		// surfaced to the client side render function 
		// via pageProps, which are passed to the Component.
		// See the render method below and notice it has
		// pageProps
		if (Component.getInitialProps) {
			pageProps = await Component.getInitialProps(ctx);
		}

		// This line exposes the query part of the URL to the user
		pageProps.query = ctx.query;
		return { pageProps };
	}

	render () {
		const { Component, apollo, pageProps } = this.props;

		return (
			<Container>
				{/* ApolloProvider exposes the apollo 
					client to the app, and "apollo" here 
					comes from the Apollo Client which is 
					defined in the withData HOC */}
				<ApolloProvider client={apollo}>
					<Page>
						{/* The Component here is the route or page being rendered,
						such as sell, signup, etc. In other words, the page 
						component in this case is a child to a client side 
						component. The user enters a URL, next grabs that route 
						and renders it by using _app. */}
						<Component {...pageProps}/>
					</Page>
				</ApolloProvider>
			</Container>
		)
	}
}

// wrap MyApp in the ApolloClient (ApolloProvider requires it)
export default withData(MyApp);