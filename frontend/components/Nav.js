import Link from 'next/link';
import NavStylesUl from './styles/NavStyles';
import User from './User';

const Nav = () => (
	<User>
		{
			({data: {me}}) => {
				return (
					<NavStylesUl>
						{/* Always show for all users */}
						<Link href="/">
							<a>Shop</a>
						</Link>

						{/* Only show if the user is signed in  */}
						{me && (
							<>
								<Link href="/sell">
									<a>Sell</a>
								</Link>
								<Link href="/orders">
									<a>Orders</a>
								</Link>
								<Link href="/me">
									<a>Account</a>
								</Link>
							</>
						)}

						{/* Not signed in */}
						{!me && (
							<Link href="/signup">
								<a>Signin</a>
							</Link>
						)}
					</NavStylesUl>
				)
			}
		}
	</User>
)

export default Nav;