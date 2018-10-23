import Items from '../components/Items';

const Index = props => (
	<Items pageNumberQuery = {parseFloat(props.query.page) || 1}/>
);

export default Index;