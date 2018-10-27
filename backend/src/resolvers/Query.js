const { forwardTo } = require ('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
	items: forwardTo('db'),
	// async items(parent, args, ctx, info) {
	// 	const items = await ctx.db.query.items();
	// 	return items;
	// }
	item: forwardTo('db'),
	itemsConnection: forwardTo('db'),

	// This function returns a promise and doesn't use await
	me(parent, args, ctx, info) {
		// Check if there is a current user id. Note that the userId
		// (if any) is set by the middleware checking and decoding
		// the incoming token from cookies in index.js
		if (!ctx.request.userId)
			return null; // no user, but this is a valid response
		
		// There is a user logged in, therefore return the full blown user info
		// from the DB
		return ctx.db.query.user({
			where: {id: ctx.request.userId},
		}, info);
	}, 

	// Returns all users .... if the current user has permission
	async users(parent, args, ctx, info) {
		//1. Check if the user is logged in
		if (!ctx.request.userId) {
			throw new Error("Not currently logged in");
		}
		
		//2. Check if the user has 'ADMIN', 'PERMISSIONUPDATE' or permissions 
		//   which if true implies the current user can query all users,
		//   if not, an error will be thrown and won't hit the next line
		hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])

		//3. Get all the users (assuming they have admin priviledges)
		return ctx.db.query.users({}, info);
	}

};

module.exports = Query;
