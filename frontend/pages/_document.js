
import Document, { Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

/* The entire purpose of this file is to prevent css
   flicker when refreshing the client. Without this file
   all styled components are downloaded async after the
   pages, which causes a brief moment when the user sees
   unstyled content. 

   This file causes the css to get resolved on the server
   before the pages are loaded.
   
   See: 
   https://github.com/zeit/next.js/#custom-document
   https://www.styled-components.com/docs/advanced#nextjs
   https://github.com/zeit/next.js/blob/master/examples/with-styled-components/pages/_document.js

   This code "crawls" the components which are about to be 
   served (ie. on the server) and it figures out which 
   styled-components also need to be loaded before pushing
   the page to the client.
*/
export default class MyDocument extends Document {
	// This method is called on the server before the page
	// is sent to the client
	static getInitialProps ({ renderPage }) {
		const sheet = new ServerStyleSheet()
		const page = renderPage(App => props => sheet.collectStyles(<App {...props} />))
		const styleTags = sheet.getStyleElement()
		return { ...page, styleTags }
	}

	// This method is called on the client
	render () {
		return (
			<html>
				<Head>
					{/* <title>My page</title> */}
					{this.props.styleTags}
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</html>
		)
	}
}