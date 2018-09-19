import Link from 'next/link';
import styled from 'styled-components';
import Router from 'next/router';
import NProgress from 'nprogress';

import Nav from './Nav';

/* 
	These are being removed in latest.
	https://github.com/zeit/next.js/issues/4863
 */
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
		display: grid;
		grid-template-columns: auto 1fr;
		justify-content: space-between;
		align-items: stretch;
		@media (max-width: 1300px) {
			grid-template-columns: 1fr;
			justify-content: center;
		}
	}
	.sub-bar {
		display: grid;
		grid-template-columns: 1fr auto;
		border-bottom: 1px solid ${props => props.theme.lightgrey};
	}
`;

// Logo style
const Logo = styled.h1`
	font-size: 4rem;
	margin-left: 2rem;
	position: relative;
	z-index: 2;
	transform: skew(-7deg); // a fancy way to italize the logo
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
			<Logo>
				<Link href="/">
					<a>Insert logo name here</a>
				</Link>
			</Logo>
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