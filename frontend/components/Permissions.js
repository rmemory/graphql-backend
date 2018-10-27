import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import PropTypes from  'prop-types';
import gql from 'graphql-tag';

import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

// Must match list of permissions in datamodel.graphql enum Permission list
const possiblePermissions = [
	'ADMIN',
	'USER',
	'ITEMCREATE',
	'ITEMUPDATE',
	'ITEMDELETE',
	'PERMISSIONUPDATE',
];

const UPDATE_PERMISSIONS_MUTATION = gql`
	mutation updatePermissions($permissions: [Permission], $userId: ID!) {
		# This user id does not have to be and often isn't the current user
		updatePermissions(permissions: $permissions, userId: $userId) {
			id
			permissions
			name
			email
		}
	}
`;

const ALL_USERS_QUERY = gql`
	query {
		users {
			id
			name
			email
			permissions
		}
	}
`;

class Permissions extends Component {
	render() {
		return (
			<Query query={ALL_USERS_QUERY}>
				{({data, loading, error }) => (
					<div>
						<Error error={error} />
						{data && data.users && 
							<Table>
								<thead>
									<tr>
										<th>Name</th>
										<th>Email</th>
										{possiblePermissions.map(permission => 
											<th key={permission}>{permission}</th>)}
										<th>Update</th>
									</tr>
								</thead>
								<tbody>
									{data.users.map(user => <UserPermissions key={user.id} user={user} />)}
								</tbody>
							</Table>
						}
					</div>
				)}
			</Query>
		);
	}
}

class UserPermissions extends React.Component {
	static propTypes = {
		user: PropTypes.shape({
			name: PropTypes.string,
			email: PropTypes.string,
			id: PropTypes.string,
			permissions: PropTypes.array,
		}).isRequired,
	};

	state = {
		// Initial seed only (any higher level changes won't cause an update, which is ok here)
		permissions: this.props.user.permissions,
	}

	handlePermissionChange = (event) => {
		/*
		 * We could call updatePermissions here, so that it saves permissions immediately as 
		 * soon as the checkbox is clicks, rather than needing a button, or even in addition to
		 * using the button. Note that you'd likely want to run updatePermissions mutation inside
		 * of a setState callback
		 * 
		 * this.setState({permissions: updatedPermissions}, updatePermissionsMutationFunction);
		 */
		const checkbox = event.target;
		// make a copy of state
		let updatedPermissions = [...this.state.permissions];

		// Figure out if we need to add or remove premission
		if (checkbox.checked) {
			// add the permission to state
			updatedPermissions.push(checkbox.value);
		} else {
			// remove the permission from state
			updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value);
		}

		// set state with newly updated updatedPermissions array
		this.setState({permissions: updatedPermissions});
	};

	render() {
		const user = this.props.user;
		return (
			<Mutation
				mutation={UPDATE_PERMISSIONS_MUTATION}
				variables={{
					permissions: this.state.permissions,
					userId: this.props.user.id,
				}}
			>
				{(updatePermissions, {loading, error}) => (
					<>
					{ error && <tr><td colspan="8"><Error error={error} /></td></tr>}
					<tr>
						<td>{user.name}</td>
						<td>{user.email}</td>
						{possiblePermissions.map(permission => (
							<td key={permission} >
								<label htmlFor={`${user.id}-permission-${permission}`}>
									<input id={`${user.id}-permission-${permission}`}
										type="checkbox" 
										checked={this.state.permissions.includes(permission)}
										value={permission}
										onChange={this.handlePermissionChange}
										/>
								</label>
							</td>
						))}
						<td>
							<SickButton 
								type="button"
								disabled={loading}
								onClick={updatePermissions}
							>
								Updat{loading ? 'ing' : 'e'}
							</SickButton>
						</td>
					</tr>
					</>
				)}
			</Mutation>
				
		)
	}
}

export default Permissions;