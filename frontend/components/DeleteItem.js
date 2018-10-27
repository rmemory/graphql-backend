import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import DisplayError from './ErrorMessage';
import { ALL_ITEMS_QUERY } from './Items';

const DELETE_ITEM_MUTATION = gql`
	mutation DELETE_ITEM_MUTATION($id: ID!) {
		deleteItem(
			id: $id
		) {
			id
		}
	}
`;

class DeleteItem extends Component {
	/*
	 * cache is the current contents of the cache
	 * payload is the result of the mutation that just occured
	 */
	updateCache = (cache, payload) => {
		// Update the cache on the client so it matches 
		// the server

		// 1. Read the current client side cache for the items
		// This still includes the one we deleted on the server
		// because the client side cache hasn't been updated.
		const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
		console.log(data, payload);

		// 2. filter the deleted item out of the page
		data.items = data.items.filter(item => {
			// payload.data.deleteItem.id is the just deleted item id
			return item.id !== payload.data.deleteItem.id;
		});

		// 3. Put the filtered items back into the cache
		cache.writeQuery({query: ALL_ITEMS_QUERY, data: data });
	}

	delete = async (event, deleteItemFunction) => {
		if (confirm('Are you sure you want to delete this?')) {
			const id = await deleteItemFunction().catch(err => 
				alert(err.message));
		}
	}

	render() {
		const {id} = this.props;
		return (
			<Mutation
				mutation={DELETE_ITEM_MUTATION}
				variables={{id: id}}
				// Update cache after deleting item
				update={this.updateCache}
			>
				{(deleteItem, {data, loading, error}) => (
					<button onClick={e => this.delete(e, deleteItem)}>
						{this.props.children}
					</button>
				)} 
			</Mutation>
		);
	}
}

DeleteItem.propTypes = {
	id: PropTypes.string.isRequired,
	children: PropTypes.string.isRequired,
};

export default DeleteItem;