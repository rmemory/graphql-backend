import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { CURRENT_USER_QUERY } from './User';
import Signin from './Signin';

class PleaseSignin extends Component {
	render() {
		return (
			<Query 
				query={CURRENT_USER_QUERY}
			>
				{({data, loading}) => {
					if (loading) return <p>Loading ...</p>
					if (!data.me) {
						return (
							<div>
								<p>You'll need to signin before accessing this page</p>
								<Signin />
							</div>
						);
					}
					return this.props.children
				}}
			</Query>
		);
	}
}

export default PleaseSignin;