import Link from 'next/link';
import NavStylesUl from './styles/NavStyles';

const Nav = () => (
	<NavStylesUl>
		<Link href="/items">
			<a>Shop</a>
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
	</NavStylesUl>
)

export default Nav;