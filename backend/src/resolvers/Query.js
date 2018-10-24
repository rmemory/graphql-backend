const { forwardTo } = require ('prisma-binding')

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
	}
};

module.exports = Query;
