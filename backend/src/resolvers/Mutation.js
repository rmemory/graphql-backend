const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');

const Mutations = {
	async createItem(parent, args, ctx, info) {
		// TODO: Authenticate user
		
		const item = await ctx.db.mutation.createItem({
			data: {
				...args
			},
		}, info); // info describes what data is returned (and desired)

		return item;
	},

	async updateItem(parent, args, ctx, info) {
		// copy the updated fields
		const updates = {...args};

		//remove the ID from the updates
		delete updates.id;

		// run the update method
		return ctx.db.mutation.updateItem({
			data: {
				...updates
			},
			where: {
				id: args.id,
			}
		}, info);
	},

	async deleteItem(parent, args, ctx, info) {
		const where = {id: args.id}

		// find the item
		const item = await ctx.db.query.item({where: where }, `{id, title}`);

		// check if they own the item or have permissions
		// TODO

		// delete it
		return ctx.db.mutation.deleteItem({where: where}, info);
	},

	async signup(parent, args, ctx, info) {
		// make sure email is always lower case
		args.email = args.email.toLowerCase();

		// one-way hash the password
		// SALT length is 10 (makes each hash value unique)
		const password = await bcrypt.hash(args.password, 10);

		// create the user
		const user = await ctx.db.mutation.createUser({
			data: {
				...args, // includes password, but this is overriden
				password: password, // Override password
				permissions: { set: ['USER']} // default permission is USER
			},
		}, info);

		/*
		 * From here on we are signing in the user
		 */

		// create JWT token for user, and sign the token
		// Use https://jwt.io to decode the jwt value stored in token
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

		/*
		 * set the jwt as a cookie.
		 * 
		 * By using a cookie to store the JWT token it allows us to perform
		 * server side render of the "logged in parts". 
		 * 
		 * The server controls how long the cookie is good for, and the 
		 * frontend always returns the cookie with the JWT as a payload, 
		 * allowing the server to determine if the front end is using an 
		 * authenticated user .... and if not to take appropriate action.
		 * 
		 * Cookies are always sent from the client to the server on each 
		 * request. Data stored in local storage does not.
		 */ 
		ctx.response.cookie('token', token, {
			httpOnly: true, // The cookie and hence JWT token can only be accessed via 
							// http, and not JS (prevent rough chrome extension, or rouge JS)
			maxAge: 1000 * 60 * 60 * 24 * 365, // one year timeout on cookie and signin
		});

		// return the user object to the mutation (called by Apollo on the front end)
		return user;
	},

	async signin(parent, args, ctx, info) {
		// get the user specified by current args
		const user = await ctx.db.query.user({
			where: {
				email: args.email,
			},
		});

		if (!user) {
			// Might not want to return a message here for security reasons
			// because this tells a hacker that the email address doesn't
			// have an account, where if the error doesn't appear but the
			// login is unsuccessful, that means there is an account now 
			// they just need to guess the password
			throw new Error(`Unrecognized signin credentials`);
		}

		// Validate the password
		const valid = await bcrypt.compare(args.password, user.password);

		if (!valid) {
			throw new Error(`Unrecognized signin credentials`);
		}

		// set the cookie with the token
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		ctx.response.cookie('token', token, {
			httpOnly: true, // The cookie and hence JWT token can only be accessed via http, and not JS
			maxAge: 1000 * 60 * 60 * 24 * 365, // one year timeout on cookie and signin
		});
		
		// return the user
		return user;
	},

	async signout(parent, args, ctx, info) {
		ctx.response.clearCookie('token');
		return { message: 'Goodbye'}
	},
};

module.exports = Mutations;
