import React from 'react';
import {connect} from 'react-redux';
import {withRouter, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import LoginForm from './LoginForm';
import {Col} from 'react-bootstrap';
import {userLoginRequest} from '/client/actions/userActions';
import SetHeaderTitle from '../shared/SetHeaderTitle';

class Login extends React.Component {
  static propTypes = {
    userLoginRequest: PropTypes.func.isRequired,
    success: PropTypes.bool.isRequired
  }

  render() {
    const {userLoginRequest} = this.props;
    return (
      // in react-router v4 a Redirect is a page element
      // so we want to include a redirect element if we want to switch
      // back to the home screen
      <Col md={6} mdOffset={3}>
        {this.props.success && <Redirect to="/" />}
        <SetHeaderTitle>Login</SetHeaderTitle>
        <LoginForm
          userLoginRequest={userLoginRequest}/>
      </Col>
    )
  }
}

const stateToProps = state => ({success: state.auth.isAuthenticated});

export default connect(stateToProps, {userLoginRequest})(Login);