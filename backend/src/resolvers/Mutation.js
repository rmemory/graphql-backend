const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');
const { promisify } = require('util');
const { randomBytes } = require('crypto');
const { transport, makeANiceEmail } = require('../mail');

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

	async requestReset(parent, args, ctx, info) {
		//1. Check if real user
		const user = await ctx.db.query.user({where: {email: args.email}});
		if (!user) {
			throw new Error(`No such user found for email ${args.email}`);
		}

		//2. Set a reset token and expiry on that user
		const randomBytesPromisified = promisify(randomBytes);

		const resetToken = (await randomBytesPromisified(20)).toString('hex');
		const resetTokenExpiry = Date.now() + 36000000; // 1 hour
		const res = await ctx.db.mutation.updateUser({
			where: {email: args.email},
			data: {resetToken: resetToken, resetTokenExpiry: resetTokenExpiry}
		});

		//3. email them that reset token and return
		const mailRes = await transport.sendMail({
			from: 'richard@bestserver.com',
			to: user.email,
			subject: 'Here is your password reset token',
			html: makeANiceEmail(`Your password reset token is here!
								 \n\n
								 <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
									 Click here to reset
								</a>`)
		});

		// Return
		return { message: 'Thanks' };
	}, 

	async resetPassword(parent, args, ctx, info) {
		// Check if passwords match
		if (args.password != args.confirmPassword) {
			throw new Error("New password does not match confirmed password");
		}

		// Check if it is a legit reset token
		// Check if token has expired
		const [user] = await ctx.db.query.users({
			where: {
				resetToken: args.resetToken,
				resetTokenExpiry_gte: Date.now() - 36000000,
			}
		});

		if (!user) {
			throw new Error(`Invalid password reset token`);
		}

		// Hash the new password
		// Save the new password and remove resetToken, resetTokenExpiry
		// SALT length is 10 (makes each hash value unique)
		const password = await bcrypt.hash(args.password, 10);

		// update the user
		const updatedUser = await ctx.db.mutation.updateUser({
			where: {
				email: user.email
			},
			data: {
				password: password, // Override password
				resetToken: null,
				resetTokenExpiry: null,
			},
		});

		// generate new JWT
		// Set the new JWT cookie
		const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
		ctx.response.cookie('token', token, {
			httpOnly: true, // The cookie and hence JWT token can only be accessed via http, and not JS
			maxAge: 1000 * 60 * 60 * 24 * 365, // one year timeout on cookie and signin
		});

		// return the updated user
		return updatedUser;
	},


};

module.exports = Mutations;
