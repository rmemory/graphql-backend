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
	}
};

module.exports = Mutations;
