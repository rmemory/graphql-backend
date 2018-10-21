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
};

module.exports = Mutations;
