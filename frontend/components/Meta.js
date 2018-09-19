// next.js requires me to use their head
import Head from 'next/head';

/*
 * General css would be inserted here, as would any
 * facebook, twitter, opengraph, instagram, etc meta tags
 * also go here
 */
const Meta = () => (
	<Head>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta charSet="utf-8" />
		<link rel="shortcut icon" href="/static/favicon.ico" />
		<link rel="stylesheet" type="text/css" href="/static/nprogress.css" />
		<title>Insert App Name Here</title>
	</Head>
);

export default Meta;
