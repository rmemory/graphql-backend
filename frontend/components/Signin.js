import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const SIGNIN_MUTATION = gql`
	mutation SIGNIN_MUTATION($email: String!, $password: String!) {
		signin(email: $email,  password: $password) {
			id
			email
			name
		}
	}
`;

class Signin extends Component {
	state = {
		email: '',
		password: '',
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
				mutation={SIGNIN_MUTATION} 
				variables={this.state}
				refetchQueries={[
					{
						query: CURRENT_USER_QUERY,
						variables: {},
					}
				]}
			>
				{(signinMutationFunction, {error, loading}) => {
					return (
						<Form
							method="post"
							onSubmit={async (e) => {
								e.preventDefault();
								const res = await signinMutationFunction(); //variables passed here

								// Only reaches here if signup fails
								this.setState({
									id: '',
									password: '',
								});
							}}
						>
							<fieldset disabled={loading} aria-busy={loading}>
								<h2>Sign into an account</h2>
								{/* TODO, better error parsing needed */}
								<Error error={error} /> 

								<label htmlFor="email">
									Email
									<input 
										type="text" 
										name="email" 
										placeholder="email" 
										value={this.state.email} 
										onChange={this.saveToState}/>
								</label>
								<label htmlFor="password">
									Password
									<input 
										type="password" 
										name="password" 
										value={this.state.password} 
										onChange={this.saveToState}/>
								</label>
								<button type="submit">Sign In!</button>
							</fieldset>
						</Form>
					);
				}}
			</Mutation>
		);
	}
}

export default Signin;