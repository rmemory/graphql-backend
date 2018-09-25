/* 
 * If not authentication is required, simply forward the
 * request directly to Prisma. 
 * 
 * const { forwardTo } = require('prisma-binding);
 * 
 * const Query = {
 * 	myQuery (parent, args, ctx, info) {
 * 		// where "thing" is an object defined in 
 * 		// datamodel.qraphql
 * 		things: forwardTo('db'),
 * 	}
 * }
 */

const Query = {
	dogs(parent, args, ctx, info) {
		global.dogs = global.dogs || [];
		return global.dogs;
	},
	async items(parent, args, ctx, info) {
		const items = await ctx.db.Query.items();
		return items;
	}
};

module.exports = Query;
