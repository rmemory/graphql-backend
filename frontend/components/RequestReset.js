import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const REQUEST_RESET_MUTATION = gql`
	mutation REQUEST_RESET_MUTATION($email: String!) {
		requestReset(email: $email) {
			message
		}
	}
`;

class RequestReset extends Component {
	state = {
		email: '',
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
				mutation={REQUEST_RESET_MUTATION} 
				variables={this.state}
			>
				{(requestReset, {error, loading, called}) => {
					return (
						<Form
							method="post"
							onSubmit={async (e) => {
								e.preventDefault();
								const res = await requestReset(); //variables passed here

								// Only reaches here if signup fails
								this.setState({
									email: '',
								});
							}}
						>
							<fieldset disabled={loading} aria-busy={loading}>
								<h2>Request a password reset</h2>
								{/* TODO, better error parsing needed */}
								<Error error={error} /> 
								{!error && !loading && called && (
									<p>Success! Check your email for a reset link!</p>
								)}

								<label htmlFor="email">
									Email
									<input 
										type="text" 
										name="email" 
										placeholder="email" 
										value={this.state.email} 
										onChange={this.saveToState}/>
								</label>
								<button type="submit">Request Reset!</button>
							</fieldset>
						</Form>
					);
				}}
			</Mutation>
		);
	}
}

export default RequestReset;