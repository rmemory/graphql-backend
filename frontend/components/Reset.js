import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import PropTypes from 'prop-types';
import { CURRENT_USER_QUERY } from './User';

const RESET_MUTATION = gql`
	mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
		resetPassword(resetToken: $resetToken, password: $password, confirmPassword: $confirmPassword) {
			id
			email
			name
		}
	}
`;

class Reset extends Component {
	state = {
		password: '',
		confirmPassword: ''
	}

	saveToState = event => {
		this.setState({
			[event.target.name]: event.target.value
		});
	}

	render() {
		return (
			// refetchQueries is used here so that other this.components 
			// which depend on the user information will be updated
			// Note that refetchQueries just checks the apollo cache
			<Mutation 
				mutation={RESET_MUTATION} 
				variables={{
					resetToken: this.props.resetToken,
					password: this.state.password,
					confirmPassword: this.state.confirmPassword,
				}}
				refetchQueries = {[{
					query: CURRENT_USER_QUERY
				}]}
			>
				{(resetMutationFunction, {error, loading, called}) => {
					return (
						<Form
							method="post"
							onSubmit={async (e) => {
								e.preventDefault();
								const res = await resetMutationFunction(); //variables passed here

								// Only reaches here if signup fails
								this.setState({
									password: '',
									confirmPassword: '',
								});
							}}
						>
							<fieldset disabled={loading} aria-busy={loading}>
								<h2>Reset your password</h2>
								{/* TODO, better error parsing needed */}
								<Error error={error} /> 

								<label htmlFor="password">
									New Password
									<input 
										type="password" 
										name="password" 
										placeholder="password" 
										value={this.state.password} 
										onChange={this.saveToState}/>
								</label>
								<label htmlFor="confirmPassword">
									New Password
									<input 
										type="password" 
										name="confirmPassword" 
										placeholder="confirm password" 
										value={this.state.confirmPassword} 
										onChange={this.saveToState}/>
								</label>
								<button type="submit">Submit new password</button>
							</fieldset>
						</Form>
					);
				}}
			</Mutation>
		);
	}
}

Reset.propTypes = {
	resetToken: PropTypes.string.isRequired,
}

export default Reset;