import App, { Container } from 'next/app';

import Page from '../components/Page';

/* Parent page, containing all state */
class MyApp extends App {
	render () {
		const { Component } = this.props;

		return (
			<Container>
				{/* Content listed here will appear on all pages */}
				<Page>
					<Component />
				</Page>
			</Container>
		)
	}
}

export default MyApp;