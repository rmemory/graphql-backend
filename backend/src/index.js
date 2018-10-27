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
	return next();
});

// Use express middleware to populate current user, thus both the userId
// and user information will be available on the request
server.express.use(async (req, res, next) => {
	// if they aren't logged in, skip this
	if (!req.userId) 
		return next();

	const user = await db.query.user(
		{ where: { id: req.userId } },
		// Return values are these ....
		'{ id, permissions, email, name }'
	);

	// This guy is used in the users query
	req.user = user;
	return next();
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