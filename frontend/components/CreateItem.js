import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';

import DisplayError from './ErrorMessage';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';

const CREATE_ITEM_MUTATION = gql`
	mutation CREATE_ITEM_MUTATION(
			$title: String! 
			$description: String! 
			$price: Int! 
			$image: String 
			$largeImage: String
		) {
		createItem(
			title: $title
			description: $description
			price: $price
			image: $image
			largeImage: $largeImage
		) {
			id
			title
			description
			price
			image
			largeImage
		}
	}
`;

class CreateItem extends Component {
	state = {
		title: '',
		description: '',
		image: '',
		largeImage: '',
		price: 0,
	};

	handleChange = (event) => {
		const name = event.target.name;
		const value = event.target.type === 'number' ? parseFloat(event.target.value)
										: event.target.value;

		this.setState({
			[name]: value,
		});
	};

	uploadFile = async e => {
		const files = e.target.files;
		const data = new FormData();

		data.append('file', files[0]);
		data.append('upload_preset', 'fit_demo')

		const res = await fetch('https://api.cloudinary.com/v1_1/dmjx3cg6a/image/upload/', {
			method: 'POST',
			body: data,
		});
		const file = await res.json();
		this.setState({
			image: file.secure_url,
			largeImage: file.eager[0].secure_url,
		});
	};

	render() {
		return (
			<Mutation 
				mutation={CREATE_ITEM_MUTATION}
				variables={this.state}
			>
				{(createItem, {data, error, called, loading}) => (
					<Form onSubmit={async (e) => {
						e.preventDefault();
						const res = await createItem();

						Router.push({
							pathname: '/item',
							query: {id: res.data.createItem.id}
						})
					}}>
						<h2>Sell an item</h2>
						{error && <DisplayError error={error} />}
						<fieldset disabled={loading} aria-busy={loading}>
							<label htmlFor="file">
								Image
								<input 
									type="file" 
									id="file" 
									name="image" 
									placeholder="Add an image" 
									required
									onChange={this.uploadFile}
									/>
							</label>
							{this.state.image && 
								<img width="200" src={this.state.image} alt="Image preview" />}
							<label htmlFor="title">
								Title
								<input 
									type="text" 
									id="title" 
									name="title" 
									placeholder="Title" 
									required
									value={this.state.title}
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
									value={this.state.description}
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
									value={this.state.price}
									onChange={this.handleChange}
									/>
							</label>
						</fieldset>
						<button type="submit">Creat{loading ? 'ing' : 'e'} Item</button>
					</Form>
				)}
			</Mutation>
		);
	}
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };
