import UpdateItem from '../components/UpdateItem';

const Update= props => (
	<div>
		<UpdateItem queryId={props.query.id}/>
	</div>
);

export default Update