import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Head from 'next/head';
import Link from 'next/link';

import { perPage } from '../config';
import DisplayError from './ErrorMessage';

const PAGINATION_QUERY = gql`
	query PAGINATION_QUERY {
		itemsConnection {
			aggregate {
				count
			}
		}
	}
`;

import PaginationStyles from './styles/PaginationStyles';

class Pagination extends Component {
	render() {
		return (
			<Query 
				query={PAGINATION_QUERY}
			>
				{({data, loading, error}) => {
					if (loading) return <p>Loading ...</p>
					if (error) return <DisplayError error={error} />
					const count = data.itemsConnection.aggregate.count;
					const pages = Math.ceil(count / perPage);
					return (
						<PaginationStyles>
							<Head>
								<title>
										Sick Fits! - Page {this.props.pageNumberQuery} of {pages} pages
								</title>
							</Head>
							<Link 
								prefetch 
								href={{
									pathname: "/items",
									query: {page: this.props.pageNumberQuery - 1}
								}}
							>
								<a className="prev" aria-disabled={this.props.pageNumberQuery <= 1}>
									Prev
								</a>
							</Link>
							<p>
								You are on {this.props.pageNumberQuery} of {pages} pages 
							</p>
							<p> {count} items total</p>
							<Link 
								prefetch 
								href={{
									pathname: "/items",
									query: {page: this.props.pageNumberQuery + 1}
								}}
							>
								<a className="prev" aria-disabled={this.props.pageNumberQuery >= pages}>
									Next
								</a>
							</Link>
						</PaginationStyles>
					);
				}}
			</Query>
		);
	}
}

Pagination.propTypes = {
	pageNumberQuery: PropTypes.number.isRequired,
};

export default Pagination;