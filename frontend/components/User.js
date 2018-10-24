import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

const CURRENT_USER_QUERY = gql`
	query {
		me {
			id
			email
			name
		}
	}
`;

/*
 * Run the user query. This is intended to be used inside of other components
 * which need to check for the currently logged in user. The child of this
 * component (declared in the component using this component) should always be 
 * a function into which the payload of the return from the query (data, loading, 
 * error, etc) will be passed.
 * 
 * <User>
	{
		(data) => {
			console.log(data)
			return <p>User</p>
		}
	}
	</User>
*/
class User extends Component {
	render() {
		return (
			// All props from parent component will be passed along to the query
			<Query {...this.props} query={CURRENT_USER_QUERY}>
				{payload => this.props.children(payload)}
			</Query>
		);
	}
}

User.propTypes = {
	children: PropTypes.func.isRequired,
}

export default User;
export { CURRENT_USER_QUERY };
