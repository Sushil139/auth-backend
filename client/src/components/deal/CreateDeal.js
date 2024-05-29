import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createDeal, getCountryParity } from '../../actions/authActions';
import { useNavigate } from 'react-router-dom';
import './CreateDeal.css';

function CreateDeal(props) {
  const [screen, setScreen] = useState('location');
  const mapping = null;
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
    countryParity: [],
    countries: [],
  });

  useEffect(() => {
    const fetchCountryParity = async () => {
      const countryParityData = await props.getCountryParity();
      setState(prevState => ({
        ...prevState,
        locationDeals: countryParityData,
      }));
    };

    fetchCountryParity();
  }, []);

  console.log('locationDeals', state.locationDeals)

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
    return <LocationHolidayDiscount
    onChange={onChange}
    state={state}
    setState={setState}
    onNextLocation={onNextLocation}
    onSubmit={onSubmit}
    screen={screen}
  />;
  } else if (state.locationNext && !state.holidayNext) {
    return <ReturnLocationDiscount onChange={onChange} state={state} setState={setState} onSubmit={onSubmit} />;
  } else if (state.holidayNext) {
    return <ReturnHolidayDiscount onChange={onChange} state={state} onSubmit={onSubmit} />;
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

function ReturnLocationDiscount({onChange, state, setState, onSubmit}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [countryName, setCountryName] = useState('');
  const [discount, setDiscount] = useState('');
  const [coupon, setCoupon] = useState('');

  var countries = state.locationDeals.reduce(
    (acc, curr) =>
      acc.concat(
        Array.isArray(curr.countries)
          ? curr.countries.map(country => ({
              ...country,
              discount: curr.discount,
              coupon: curr.coupon,
            }))
          : []
      ),
    []
  );

  state.locationDeals = countries;

  if (countries.length === 0) {
    countries = state.locationDeals;
  }

  const handleAddCountry = () => {
    const updatedCountries = [...state.locationDeals];
    const index = updatedCountries.findIndex(
      country => country.countryName === countryName
    );

    if (index !== -1) {
      updatedCountries[index] = { countryName, discount, coupon };
    } else {
      updatedCountries.push({ countryName, discount, coupon });
    }

    setState(prevState => ({ ...prevState, locationDeals: updatedCountries }));
    setDialogOpen(false);
  };

  const handleDiscountChange = (e, index) => {
    const discount = Number(e.target.value);
    if (!isNaN(discount) && discount >= 0 && discount <= 100) {
      const updatedCountries = countries.map((country, i) => {
        if (i === index) {
          return { ...country, discount: Number(e.target.value) };
        }
        return country;
      });
      setState(prevState => ({
        ...prevState,
        locationDeals: updatedCountries,
      }));
    }
  };

  const handleCouponChange = (e, index) => {
    const updatedCountries = countries.map((country, i) => {
      if (i === index) {
        return { ...country, coupon: e.target.value };
      }
      return country;
    });
    setState(prevState => ({ ...prevState, locationDeals: updatedCountries }));
  };

  return (
    <form noValidate onSubmit={onSubmit}>
      {/* <button onClick={(e) => {e.preventDefault(); setDialogOpen(true);}}>
        Add custom discounts for a country
      </button>
      {dialogOpen && (
        <div>
          <label>
            Country Name:
            <input type="text" onChange={e => setCountryName(e.target.value)} />
          </label>
          <label>
            Discount:
            <input type="text" onChange={e => setDiscount(e.target.value)} />
          </label>
          <label>
            Coupon:
            <input type="text" onChange={e => setCoupon(e.target.value)} />
          </label>
          <button onClick={handleAddCountry}>Add Country</button>
          <button onClick={() => setDialogOpen(false)}>Cancel</button>
        </div>
      )} */}
      {countries.map((country, index) => (
        <div key={index}>
          <h3>{country.countryName}</h3>
          <div>
            <label htmlFor={`discount${index}`}>Discount</label>
            <input
              onChange={e => handleDiscountChange(e, index)}
              value={country.discount}
              id={`discount${index}`}
              type="text"
            />
          </div>
          <div>
            <label htmlFor={`coupon${index}`}>Coupon</label>
            <input
              onChange={e => handleCouponChange(e, index)}
              value={country.coupon}
              id={`coupon${index}`}
              type="text"
            />
          </div>
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
}

function ReturnHolidayDiscount({onChange, state, onSubmit}) {
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

function LocationHolidayDiscount(
  {onChange,
  state,
  setState,
  onNextLocation,
  onSubmit,
  screen}
) {
  if (screen === 'location') {
    return <ReturnLocationDiscount onChange={onChange} state={state} setState={setState} onSubmit={onSubmit} />;
  } else if (screen === 'holiday') {
    return <ReturnHolidayDiscount onChange={onChange} state={state} onSubmit={onSubmit} />;
  }
}

CreateDeal.propTypes = {
  createDeal: PropTypes.func.isRequired,
  getCountryParity: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(mapStateToProps, {
  createDeal,
  getCountryParity,
})(CreateDeal);
