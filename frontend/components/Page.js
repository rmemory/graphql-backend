import React, { Component } from 'react';
import styled, { ThemeProvider, injectGlobal } from 'styled-components';

import Meta from './Meta';
import Header from './Header';


// Style example:

// const MyButton = styled.button`
// 	display: block;
// 	background: red;
// 	font-size: 50px;
// 	color: ${props => props.green ? 'green' : 'black'};
// 	span {
// 		font-size: 100px;
// 	}
// 	.big-arrow {
// 		font-size: 125px;
// 	}
// `;
// // const BigArrow = styled.span`
// // 	font-size: 100px;
// // `;

{/* <MyButton green={true}>
	Click Me
	<span>-></span>
</MyButton>
<MyButton>
	Click Me
	<span className="big-arrow">-></span>
</MyButton> */}

// End style example

/* 
 * Page is the top level component. 
 * 
 * All general theming goes here.
 */

// This could be put into its own file and imported
const theme = {
	red: '#FF0000',
	black: '#393939',
	grey: '#3A3A3A',
	lightgrey: '#E1E1E1',
	offWhite: '#EDEDED',
	bodyMaxWidth: '1000px', /*Inner part of body */
	/* box-shadow: No horizontal offset, vertical offset, blur size, spread, color */
	bs: '0 12px 24px 0 rgba(0,0,0,0.09)',
 }

/* Top level global styling, which doesn't have access to the theme. 
   Fonts and global styles are inserted here. */
injectGlobal`
	@font-face {
		font-family: 'radnika_next';
		src: url('/static/radnikanext-medium-webfont.woff2') format ('woff2');
		font-weight: normal;
		font-style: normal;
	}

	/* Using border-box here means child elements width and height are calculated 
	   relative to their parent and not the screen. The following URL provides a good
	   explanation: 0

	   https://css-tricks.com/box-sizing/
	*/
	html {
		box-sizing: border-box;
		font-size: 10px; /* baseline size for rem sizes */
	}

	*, *:before, *:after {
		box-sizing: inherit;
	}

	body {
		padding: 0;
		margin: 0;
		font-size: 1.5rem;

		/* line-height defines the amount of space above and below inline elements.
		 * The recommended method for defining line height is using a number value, 
		 * referred to as a "unitless" line height. */
		line-height: 2;
		font-family: 'radnika_next';
	}

	a {
		text-decoration: none;
		color: ${theme.black}; /* Can't use props in injectGlobal */
	}
`;

// Top level div styling
const StyledDiv = styled.div`
	background: white;
	color: ${props => props.theme.black};;
`;

// Individual pages will be rendered inside this div
const InnerDiv = styled.div`
	max-width: ${props => props.theme.bodyMaxWidth};
	margin: 0 auto; /* Center content horizontally according to max width */
	padding: 2rem; /* 2x base font size */
`;

export default class Page extends Component {
	render() {
		return (
			<ThemeProvider theme={theme}>
				<StyledDiv>
					<Meta />
					<Header />

					{/* All components (other than those above like Meta, Header) are
					rendered inside of InnerDiv */}
					<InnerDiv>
						{this.props.children}
					</InnerDiv>
				</StyledDiv>
			</ThemeProvider>
		);
	}
}
