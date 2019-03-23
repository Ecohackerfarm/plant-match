/**
 * @namespace EditBedForm
 * @memberof client.components.beds
 */

const React = require('react');
const { Col, Button } = require('react-bootstrap');
const { connect } = require('react-redux');
const { Typeahead } = require('react-bootstrap-typeahead');
const { withRouter } = require('react-router-dom');
const { fetchCrops } = require('../../actions/cropActions');
const { workerManager } = require('../../globals.js');

/**
 * @extends Component
 */
class EditBedForm extends React.Component {
	/**
	 * @param {Object} props 
	 */
	constructor(props) {
		super(props);
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		//this.onSuccess;

		this.state = {
			compatibleCrops: [],
			loading: false,
			cropsInBed: this.props.itemToEdit.crops,
			error: false,
		}
	}

	componentWillMount() {
		this.getPossibleCrops();
	}

	getPossibleCrops() {
		window.clearTimeout(this.callApi);
		this.callApi = window.setTimeout(() => {
			if (this.state.cropsInBed.length > 0) {
				this.setState({ loading: true });
				workerManager.delegate('getCompatibleCrops', this.props.crops.all, this.props.crops.relationships, this.state.cropsInBed).then((response) => {
					this.setState({
						compatibleCrops: response,
						loading: false
					});
				}).catch((error) => {
					this.setState({
						error,
						loading: false
					});
				});
			} else {
				this.props.fetchCrops();
			}
		}, 450);
	}

	/**
	 * @param {Object} event
	 */
	onSubmit(event) {
		event.preventDefault();
		// TODO: VALIDATE PLANTS
		this.props.onSubmit({
			crops: this.state.cropsInBed
		})
		this.props.onSuccess();
	}

	/**
	 * @param {Crop[]} chosenCrops 
	 */
	onChange(chosenCrops) {
		this.setState({
			cropsInBed: chosenCrops
		}, this.getPossibleCrops);
	}

	render() {
		return (
			<form onSubmit={this.onSubmit}>
				<div className="choose-crops">
			  	<Typeahead
			  	clearButton
			  	multiple
			  	options={
			  		this.state.cropsInBed.length>0
			  		?	[
			  			...this.state.cropsInBed,
			  			...this.state.compatibleCrops
			  			]
			  		: this.props.crops.all
			  	}
			  	labelKey={crop => ((crop.commonName !== null) ? crop.commonName : crop.binomialName)}
			  	placeholder='Bed is empty ...'
			  	onChange={this.onChange}
			  	isLoading={
			  		this.state.loading ||
			  		this.props.allCropsLoading
			  	}
			  	disabled={
			  		this.state.loading ||
			  		this.props.allCropsLoading
			  	}
			  	defaultSelected={this.state.cropsInBed}
			  	selectHintOnEnter={true}
			  	autoFocus={true}
			  	emptyLabel="No compatible crops found."
			  	/>
			  </div>
			  <Col xs={3} md={2} >
					<Button
						type="submit"
						className="btn btn-primary"
					>Submit</Button>
				</Col>
			</form>
		);
	}
}

const mapStateToProps = (state) => ({
	crops: state.crops,
	allCropsLoading: state.crops.loading,
	allCropsError: state.crops.error
});

const mapDispatchToProps = (dispatch) => ({
	fetchCrops: () => dispatch(fetchCrops())
});

module.exports = withRouter(connect(mapStateToProps, mapDispatchToProps)(EditBedForm));
