import React, { useState } from 'react';
import { connect } from 'react-redux';
import { createDeal } from '../../actions/authActions';
import { useNavigate } from 'react-router-dom';
import './CreateDeal.css';

function CreateDeal(props) {
  const [screen, setScreen] = useState('location');

  const navigate = useNavigate();
  const [state, setState] = useState({
    dealName: '',
    description: '',
    productLink: '',
    locationDeals: [],
    holidayDeals: [],
    isLocationDiscount: false,
    isHolidayDiscount: false,
    countryName: '',
    locationDiscount: '',
    locationCoupon: '',
    holiday: '',
    date: '',
    holidayDiscount: '',
    holidayCoupon: '',
    locationNext: false,
  });

  const onChange = e => {
    setState(prevState => ({ ...prevState, [e.target.id]: e.target.value }));
  };

  const onCheck = e => {
    setState({ ...state, [e.target.id]: e.target.checked });
  };

  const onNext = e => {
    e.preventDefault();

    if (!state.isLocationDiscount && !state.isHolidayDiscount) {
      alert(
        'Please select at least one of Location-based Discount or Holiday-based Discount.'
      );
      return;
    }

    if (state.isLocationDiscount) {
      setState(prevState => ({
        ...prevState,
        isLocationDiscount: true,
        locationNext: true,
      }));
    }

    if (state.isHolidayDiscount) {
      setState(prevState => ({
        ...prevState,
        isHolidayDiscount: true,
        holidayNext: true,
      }));
    }
  };

  const onNextLocation = async e => {
    e.preventDefault();

    if (state.isHolidayDiscount) {
      setScreen('holiday');
    }
  };

  const onSubmit = async e => {
    e.preventDefault();

    const newDeal = { ...state };
    delete newDeal.isLocationDiscount;
    delete newDeal.isHolidayDiscount;

    await props.createDeal(newDeal);
    navigate('/deal');
  };

  if (state.locationNext && state.holidayNext) {
    return locationHolidayDiscount(onChange, state, onNextLocation, onSubmit, screen);
  } else if (state.locationNext && !state.holidayNext) {
    return returnLocationDiscount(onChange, state, onSubmit);
  } else if (state.holidayNext) {
    return returnHolidayDiscount(onChange, state, onSubmit);
  }

  return (
    <form noValidate onSubmit={onSubmit}>
      <div>
        <label htmlFor="dealName">Deal Name</label>
        <input
          onChange={onChange}
          value={state.dealName}
          id="dealName"
          type="text"
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <input
          onChange={onChange}
          value={state.description}
          id="description"
          type="text"
        />
      </div>
      <div>
        <label htmlFor="productLink">Product Link</label>
        <input
          onChange={onChange}
          value={state.productLink}
          id="productLink"
          type="text"
        />
      </div>

      {/* Checkboxes for location and holiday discounts */}
      <div className="checkbox-container">
        <input
          className="button-checkbox"
          onChange={onCheck}
          checked={state.isLocationDiscount}
          id="isLocationDiscount"
          type="checkbox"
        />
        <label htmlFor="isLocationDiscount">Location-based Discount</label>
      </div>
      <div className="checkbox-container">
        <input
          className="button-checkbox"
          onChange={onCheck}
          checked={state.isHolidayDiscount}
          id="isHolidayDiscount"
          type="checkbox"
        />
        <label htmlFor="isHolidayDiscount">Holiday-based Discount</label>
      </div>

      <button type="button" onClick={onNext}>
        Next
      </button>
    </form>
  );
}

function returnLocationDiscount(onChange, state, onSubmit) {
  return (
    <form noValidate onSubmit={onSubmit}>
      <div>
        <label htmlFor="countryName">Country Name</label>
        <input
          onChange={onChange}
          value={state.countryName}
          id="countryName"
          type="text"
        />
      </div>
      <div>
        <label htmlFor="discount">Discount</label>
        <input
          onChange={onChange}
          value={state.discount}
          id="discount"
          type="text"
        />
      </div>
      <div>
        <label htmlFor="coupon">Coupon</label>
        <input
          onChange={onChange}
          value={state.coupon}
          id="coupon"
          type="text"
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

function returnHolidayDiscount(onChange, state, onSubmit) {
  return (
    <form noValidate onSubmit={onSubmit}>
      <div>
        <label htmlFor="holiday">Holiday</label>
        <input
          onChange={onChange}
          value={state.holiday}
          id="holiday"
          type="text"
        />
      </div>
      <div>
        <label htmlFor="date">Date</label>
        <input onChange={onChange} value={state.date} id="date" type="date" />
      </div>
      <div>
        <label htmlFor="holidayDiscount">Holiday Discount</label>
        <input
          onChange={onChange}
          value={state.holidayDiscount}
          id="holidayDiscount"
          type="text"
        />
      </div>
      <div>
        <label htmlFor="holidayCoupon">Holiday Coupon</label>
        <input
          onChange={onChange}
          value={state.holidayCoupon}
          id="holidayCoupon"
          type="text"
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

function locationHolidayDiscount(onChange, state, onNextLocation, onSubmit, screen) {
  if (screen === 'location') {
    return returnLocationDiscount(onChange, state, onNextLocation);
  } else if (screen === 'holiday') {
    return returnHolidayDiscount(onChange, state, onSubmit);
  }
}

export default connect(null, { createDeal })(CreateDeal);
