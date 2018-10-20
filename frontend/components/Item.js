import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

import TitleDiv from './styles/Title';
import ItemDiv from './styles/ItemStyles';
import PriceTagSpan from './styles/PriceTag';
import formatMoney from '../lib/formatMoney';

class Item extends Component {
	render() {
		const { item } = this.props;

		return (
			<ItemDiv>
				{item.image && <img src={item.image} alt={item.title} />}
				{/* {item.image ? <img /> : null} */}
				<TitleDiv>
					<Link href={{
						pathname: '/item',
						query: {id: item.id}
					}}>
						<a>{item.title}</a>
					</Link>
				</TitleDiv>

				<PriceTagSpan>
					{formatMoney(item.price)}
				</PriceTagSpan>
				<p>{item.description}</p>
				<div className="buttonList">
					<Link href={{
						pathname: '/update',
						query: {id: item.id}
					}}>
						<a>Edit</a>
					</Link>
					<button>Add to cart</button>
					<button id={item.id}>Delete</button>
				</div>
			</ItemDiv>
		);
	}
}

Item.propTypes = {
	item: PropTypes.shape({
		title: PropTypes.string.isRequired,
		price: PropTypes.number.isRequired,
		description: PropTypes.string.isRequired,
		image: PropTypes.string.isRequired,
		largeImage: PropTypes.string.isRequired,
	}),
};

export default Item;