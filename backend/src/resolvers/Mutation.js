const Mutations = {
	createDog(parent, args, ctx, info) {
		global.dogs = global.dogs || [];
		const newDog = { name: args.name};
		global.dogs.push(newDog);
		return newDog;
	},

	async createItem(parent, args, ctx, info) {
		// TODO: Authenticate user
		const argsForPrisma = args.data;
		const item = await ctx.db.mutation.createItem({
			data: {
				...argsForPrisma
			},
		}, info);

		return item;
	},
};

module.exports = Mutations;
