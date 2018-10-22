import SingleItem from  '../components/SingleItem';

const Item = props => (
	<div>
		<SingleItem queryId={props.query.id || 0} />
	</div>
)

export default Item;