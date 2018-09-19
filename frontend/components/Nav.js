/* By using Link instead of a regular anchor link, it means
 * the link is bound to HTML5 push state */

import Link from 'next/link';
import NavStyles from './styles/NavStyles';

const Nav = () => (
	<NavStyles>
		<Link href="/items">
			<a>Items</a>
		</Link>
		<Link href="/sell">
			<a>Sell</a>
		</Link>
		<Link href="/signup">
			<a>Signup</a>
		</Link>
		<Link href="/orders">
			<a>Orders</a>
		</Link>
		<Link href="/me">
			<a>Account</a>
		</Link>
	</NavStyles>
)

export default Nav;