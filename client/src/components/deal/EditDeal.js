import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { editDeal, getDealById } from '../../actions/authActions';

function EditDeal(props) {
  const [dealName, setDealName] = useState('');
  const [description, setDescription] = useState('');
  // Add other deal properties here

  const navigate = useNavigate();
  const { _id } = useParams();
  console.log('id', _id);
  useEffect(() => {
    props.getDealById(_id).then(res => {
        console.log('res', res);
      setDealName(res.dealName);
      setDescription(res.description);
      // Set other deal properties here
    });
  }, [_id]);

  const handleChange = e => {
    if (e.target.name === 'dealName') setDealName(e.target.value);
    if (e.target.name === 'description') setDescription(e.target.value);
    // Add other input handlers here
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newDeal = {
      dealName: dealName,
      description: description,
    };

    await props.editDeal(_id, newDeal);
    navigate('/deal');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="dealName" value={dealName} onChange={handleChange} />
      <input name="description" value={description} onChange={handleChange} />
      {/* Add other input fields here */}
      <button type="submit">Submit</button>
    </form>
  );
}

EditDeal.propTypes = {
  editDeal: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(mapStateToProps, {
  editDeal,
  getDealById,
})(EditDeal);
