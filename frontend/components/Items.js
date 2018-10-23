import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';

import Pagination from './Pagination';
import Item from './Item';
import DisplayError from './ErrorMessage';
import { perPage } from '../config';

const ALL_ITEMS_QUERY = gql`
	query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
		items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
			id
			title
			price
			description
			image
			largeImage
		}
	}
`;

const CenterDiv = styled.div`
	text-align: center;
`;

const ItemsListDiv = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 60px;
	max-width: ${props => props.theme.bodyMaxWidth }
	margin: 0 auto;
`;

class Items extends Component {
	render() {
		return (
			<CenterDiv>
				<Pagination pageNumberQuery = {this.props.pageNumberQuery}/>
				<Query 
					query={ALL_ITEMS_QUERY}
						// fetchPolicy="network-only" // means never use the cache
						variables={{
							skip: this.props.pageNumberQuery * perPage - perPage,
							first: perPage // not needed
						}}
				>
					{({data, loading, error}) => {
						if (loading) return <p>Loading ...</p>
						if (error) return <DisplayError error={error} />

						return <ItemsListDiv>
						{data.items.map(item => {
							return <Item key={item.id} item={item} />
						})}
					</ItemsListDiv>
					}}
				</Query>
				<Pagination pageNumberQuery = {this.props.pageNumberQuery}/>
			</CenterDiv>
		);
	}
}

Items.propTypes = {
	pageNumberQuery: PropTypes.number.isRequired,
};


export default Items;
export { ALL_ITEMS_QUERY };
