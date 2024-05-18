import { Route, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const PrivateRoute = ({ path, element: Component, auth }) => {
  console.log("PrivateRoute", path, Component, auth)
  return auth.isAuthenticated === true ? (
    <Route path={path} element={Component} />
  ) : (
    <Navigate to="/login" replace />
  );
};

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);