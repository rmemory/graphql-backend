import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import DisplayError from './ErrorMessage';
import Form from './styles/Form';


const SINGLE_ITEM_QUERY = gql`
	query SINGLE_ITEM_QUERY($id: ID!) {
		item(where: {id: $id}) {
			id
			title
			description
			price
		}
	} 
`;

const UPDATE_ITEM_MUTATION = gql`
	mutation UPDATE_ITEM_MUTATION(
			$id: ID!
			$title: String
			$description: String
			$price: Int 
		) {
		updateItem(
			id: $id
			title: $title
			description: $description
			price: $price
		) {
			id
			title
			description
			price
		}
	}
`;

class UpdateItem extends Component {
	state = {
		// Should be blank because we are updating
	};

	handleChange = (event) => {
		const name = event.target.name;
		const value = event.target.type === 'number' ? parseFloat(event.target.value)
										: event.target.value;

		this.setState({
			[name]: value,
		});
	};

	updateItem = async (event, updateItemFunction) => {
		event.preventDefault();
		const res = await updateItemFunction({
			variables: {
				id: this.props.queryId,
				...this.state,
			}
		});
	};

	render() {
		const { queryId } = this.props;

		return (
			<Query 
				query={SINGLE_ITEM_QUERY}
				variables = {{id: queryId}}
			>
				{({data, loading}) => {
					// Without the e.preventDefault in the updateItem above, it causes 
					// all of the elements from the form to be put onto the query 
					// params in the URL, which in turn will cause this component to
					// puke because it needs the ID in the query params. This conditional
					// prevents that error from occuring. Also, it protects against a situation 
					// where the user reaches the update page (possibly by directly typing in
					// that URL) but they haven't included the necessary ID in the query params.
					if (!data || !data.item) return <p>No Item Found for ID: {queryId}</p>
					if (loading) return <p>Loading ...</p>

					return (<Mutation 
						mutation={UPDATE_ITEM_MUTATION}
					>
						{(updateItem, {error, called, loading}) => (
							<Form onSubmit={e => this.updateItem(e, updateItem)}>
								<h2>Update an item</h2>
								{error && <DisplayError error={error} />}
								<fieldset disabled={loading} aria-busy={loading}>
									<label htmlFor="title">
										Title
										<input 
											type="text" 
											id="title" 
											name="title" 
											placeholder="Title" 
											required
											defaultValue={data.item.title}
											onChange={this.handleChange}
											/>
									</label>
									<label htmlFor="description">
										Description
										<textarea 
											id="description" 
											name="description" 
											placeholder="Enter a description" 
											required
											defaultValue={data.item.description}
											onChange={this.handleChange}
											/>
									</label>
									<label htmlFor="price">
										Price
										<input 
											type="number" 
											id="price" 
											name="price" 
											placeholder="Price" 
											required
											defaultValue={data.item.price}
											onChange={this.handleChange}
											/>
									</label>
								</fieldset>
								<button type="submit">Updat{loading ? 'ing' : 'e'} Item</button>
							</Form>
						)}
					</Mutation>);
				}}
			</Query>
				
		);
	}
}

UpdateItem.propTypes = {
	queryId: PropTypes.string.isRequired,
};

export default UpdateItem;
export { UPDATE_ITEM_MUTATION };
export { SINGLE_ITEM_QUERY };
