import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import DisplayError from './ErrorMessage';
import Form from './styles/Form';

const SIGNUP_MUTATION = gql`
	mutation SIGNUP_MUTATION($email: String!, $name: String!, $password: String!) {
		signup(email: $email, name: $name, password: $password) {
			id
			email
			name
		}
	}
`;

class Signup extends Component {
	state = {
		email: '',
		name: '',
		password: '',
		formErrors: {email: '', password: ''},
		emailValid: false,
		passwordValid: false,
		formValid: false
	};

	handleChange = (event) => {
		const name = event.target.name;
		const value = event.target.value;
		this.setState({
			[name]: value
		}, () => { this.validateField(name, value) });
	}

	validateField(fieldName, value) {
		let fieldValidationErrors = this.state.formErrors;
		let emailValid = this.state.emailValid;
		let passwordValid = this.state.passwordValid;
	
		switch(fieldName) {
			case 'email':
				emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
				fieldValidationErrors.email = emailValid ? '' : ' is invalid';
			break;
			
			case 'password':
				passwordValid = value.length >= 6;
				fieldValidationErrors.password = passwordValid ? '': ' is too short';
			break;
			
			default:
			break;
		}
		this.setState({formErrors: fieldValidationErrors,
						emailValid: emailValid,
						passwordValid: passwordValid
					  }, this.validateForm);
	}

	validateForm() {
		this.setState({formValid: this.state.emailValid && this.state.passwordValid});
	}

	render() {
		return (
			<Mutation 
				mutation={SIGNUP_MUTATION}
			>
				{(signup, {data, loading, error}) => {
					if (loading) return <p>Loading ...</p>
					if (error) return <DisplayError error={error} />
					return <Form
								method="post" 
								onSubmit={async (e) => {
									e.preventDefault();
									const res = await signup({variables: {
										email: this.state.email,
										password: this.state.password,
										name: this.state.name,
									}});
									this.setState({
										id: '',
										name: '',
										password: '',
									});
								}}
							>
						<fieldset disabled={loading} aria-busy={loading}>
							<h2>Sign up for an account</h2>
							<label htmlFor="emailId">
								Email
								<input 
									type="email" 
									id="emailId" 
									name="email" 
									placeholder="username@emailserver.com" 
									required
									value={this.state.email}
									onChange={this.handleChange}
									/>
							</label>
							<label htmlFor="nameId">
								Name
								<input 
									type="text"
									id="nameId" 
									name="name" 
									placeholder="Name" 
									required
									value={this.state.name}
									onChange={this.handleChange}
									/>
							</label>
							<label htmlFor="passwordId">
								Password
								<input 
									type="password" 
									id="passwordId" 
									name="password" 
									required
									value={this.state.password}
									onChange={this.handleChange}
									/>
							</label>
							<button type="submit" disabled={!this.state.formValid}>
								Creat{loading ? 'ing' : 'e'} User
							</button>
						</fieldset>
					</Form>
				}}
			</Mutation>
		);
	}
}

export default Signup;