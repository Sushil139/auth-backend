import React, { useState } from 'react';
import { connect } from 'react-redux';
import { createDeal } from '../../actions/authActions';
import { useNavigate } from 'react-router-dom';

function CreateDeal(props) {
  const navigate = useNavigate();
  const [state, setState] = useState({
    dealName: '',
    description: '',
    // Add other deal params here
  });

  const onChange = e => {
    setState(prevState => ({ ...prevState, [e.target.id]: e.target.value }));
  };

  const onSubmit = async e => {
    e.preventDefault();

    const newDeal = {
      dealName: state.dealName,
      description: state.description,
      // Add other deal params here
    };

    await props.createDeal(newDeal)
    navigate('/dashboard');
  };

  return (
    <form noValidate onSubmit={onSubmit}>
      <div>
        <label htmlFor="dealName">Deal Name</label>
        <input onChange={onChange} value={state.dealName} id="dealName" type="text" />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <input onChange={onChange} value={state.description} id="description" type="text" />
      </div>
      {/* Add other deal params here */}
      <button type="submit">Create Deal</button>
    </form>
  );
}

export default connect(null, { createDeal })(CreateDeal);