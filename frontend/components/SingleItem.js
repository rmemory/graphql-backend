import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Head from 'next/head';

import DisplayError from './ErrorMessage';

const SingleItemDiv = styled.div`
	max-width: 1200px;
	margin: 2rem auto;
	box-shadow: ${props => props.theme.bs};
	display: grid;
	grid-auto-columns: 1fr;
	grid-auto-flow: column;
	min-height: 800px;
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.details {
		margin: 3rem;
		font-size: 2rem;
	}
`;

const SINGLE_ITEM_QUERY = gql`
	query SINGLE_ITEM_QUERY($id: ID!) {
		item(where: {id: $id}) {
			id
			title
			description
			largeImage
		}
	} 
`;

class SingleItem extends Component {
	render() {
		const { queryId } = this.props;

		return (
			<Query
				query={SINGLE_ITEM_QUERY}
				variables = {{id: queryId}}
			>
				{({data, loading, error}) => {
					if (error) return <DisplayError error={error} />
					if (loading) return <p>Loading ...</p>
					if (!data.item) return <p>No item found for {queryId}</p>
					return <SingleItemDiv>
						<Head>
							<title>Sick Fits | {data.item.title}</title>
						</Head>
						<img src={data.item.largeImage} alt={data.item.title} />
						<div className="details">
							<h2>Viewing {data.item.title}</h2>
							<p>{data.item.description}</p>
						</div>
					</SingleItemDiv>
				}}
			</Query>
		);
	}
}

SingleItem.propTypes = {
	queryId: PropTypes.string.isRequired,
};

export default SingleItem;
export { SINGLE_ITEM_QUERY };