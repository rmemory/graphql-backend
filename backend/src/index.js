const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'variables.env'});

const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// Use express middleware to handle cookies (JWT)
/*
 * This puts the cookie into a nicely formatted cookie
 * object rather than just a cookie string.
 */
server.express.use(cookieParser());

// decode the JWT so we can get the user Id on each incoming request from the 
// client, by simply accessing req.userId
server.express.use((req, res, next) => {
	// pull the token out of the request
	const { token } = req.cookies;

	// There might not be a token, but if there is ...
	if (token) {
		// Get the token from the cookie, and the userId from  the token
		// verify makes sure nobody has mucked around with the token.
		const { userId } = jwt.verify(token, process.env.APP_SECRET);
		
		// put the userId onto the req for requests in the "next" chain to access
		req.userId = userId;
	}
	next();
});

server.start({
	// Only our frontend Next server can access GraphQL
	cors: {
		credentials: true,
		origin: process.env.FRONTEND_URL,
	},
}, deets => {
	console.log(`Server is now running on port 
	http:/localhost:${deets.port}`);
}

);