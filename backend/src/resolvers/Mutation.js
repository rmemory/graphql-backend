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
};

module.exports = Mutations;
