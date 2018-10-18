import Link from 'next/link';
import styled from 'styled-components';
import Router from 'next/router';
import NProgress from 'nprogress';

import Nav from './Nav';

/* Show the nprogress bar; These are global */
Router.onRouteChangeStart = () => {
	NProgress.start();
};

Router.onRouteChangeComplete = () => {
	NProgress.done();
};

Router.onRouteChangeError = () => {
	NProgress.done();
};

// Primary styling for header
const StyledHeader = styled.header`
	.bar {
		border-bottom: 10px solid ${props => props.theme.black};

		/* for an example of auto vs fr see this: https://codepen.io/cssgrid/pen/ALQjAj */
		display: grid;
		grid-template-columns: auto 1fr; /* 2 columns, first one is as wide as its 
											content, second one takes up remaining space */
		justify-content: space-between; /* Used when contents of grid are less than the 
										   size of the grid container */
		align-items: stretch; /* Stretch across columns from top to bottom of container */

		/* Below 1300px, log and bar will stack, otherwise they will be in two columns */
		@media (max-width: 1300px) {
			grid-template-columns: 1fr; // 1 column
			justify-content: center; // center that one column
		}
	}
	.sub-bar {
		display: grid;
		grid-template-columns: 1fr auto; // 2 columns, first takes up whatever is left from second column which is as wide as its content
		border-bottom: 1px solid ${props => props.theme.lightgrey};
	}
`;

// Logo header style
const LogoH1 = styled.h1`
	font-size: 4rem;
	margin-left: 2rem;
	position: relative;
	z-index: 2;
	transform: skew(-7deg); // a fancy way to italize the logo text
	a {
		padding: 0.5rem 1rem;
		background: ${props => props.theme.red};
		color: white;
		text-transform: uppercase;
		text-decoration: none;
	}
	@media (max-width: 1300px) {
		margin: 0;
		text-align: center; // otherwise left justified
	}
`;

const Header = () => (
	<StyledHeader>
		<div className="bar">
			<LogoH1>
				<Link href="/">
					<a>Sick Fits</a>
				</Link>
			</LogoH1>
			<Nav />
		</div>
		<div className="sub-bar">
			<p>Search</p>
		</div>
		<div className="cart">
			Cart
		</div>
	</StyledHeader>
)

export default Header;