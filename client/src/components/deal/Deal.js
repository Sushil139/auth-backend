import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { useNavigate } from 'react-router-dom';
import {
  logoutUser,
  createDeal,
  getDeals,
  editDeal,
  deleteDeal,
} from '../../actions/authActions';

function Deal(props) {
  const navigate = useNavigate();
  const [state, setState] = useState({
    dealName: '',
    description: '',
    deals: [],
    errors: {},
  });

  useEffect(() => {
    let isMounted = true; // add a flag to prevent state update if the component is unmounted

    props
      .getDeals()
      .then(deals => {
        if (isMounted) {
          setState(prevState => ({ ...prevState, deals }));
        }
      })
      .catch(err => {
        if (err.response && err.response.status !== 404 && isMounted) {
          console.log(err);
          navigate('/');
        }
      });

    return () => {
      isMounted = false; // cleanup function to set the flag false if the component is unmounted
    };
  }, []);

  const onChange = e => {
    setState(prevState => ({ ...prevState, [e.target.id]: e.target.value }));
  };

  const onSubmit = e => {
    e.preventDefault();

    const newDeal = {
      dealName: state.dealName,
      description: state.description,
    };

    props.createDeal(newDeal);
  };

  const handleAddDeal = deal => {
    navigate('/create-deal');
    setState(prevState => ({
      ...prevState,
      deals: [...prevState.deals, deal],
    }));
  };

  const handleEditDeal = _id => {
    navigate(`/edit-deal/${_id}`);
  };

  const handleDeleteDeal = _id => {
    props.deleteDeal(_id);
    setState(prevState => ({
      ...prevState,
      deals: prevState.deals.filter(deal => deal._id !== _id),
    }));
  };

  const handleGetCode = _id => {
    navigate(`/get-code/${_id}`);
  };

  const onLogoutClick = async e => {
    e.preventDefault();
    await props.logoutUser();
    navigate('/');
  };

  const { user } = props.auth; // Changed this.props.auth to props.auth
  const { errors, deals } = state; // Changed this.state to state
  const [openDealId, setOpenDealId] = useState(null);
  const refs = useRef({});

  useEffect(() => {
    deals.forEach(deal => {
      if (!refs.current[deal._id]) {
        refs.current[deal._id] = React.createRef();
      }
    });
  }, [deals]);
  //   const refs = useRef({});
  //   deals.forEach(deal => {
  //     if (!refs.current[deal._id]) {
  //       refs.current[deal._id] = React.createRef();
  //     }
  //   });

  const refToDealId = Object.entries(refs.current).reduce(
    (acc, [dealId, ref]) => {
      acc[ref] = dealId;
      return acc;
    },
    {}
  );

  useOutsideClick(Object.values(refs.current), ref => {
    const dealId = refToDealId[ref];
    if (openDealId === dealId) setOpenDealId(null);
  });

  return (
    <div
      style={{ height: '75vh', maxHeight: '75vh', overflowY: 'auto' }}
      className="container valign-wrapper"
    >
      <div className="row">
        <div className="landing-copy col s12 center-align">
          {deals.map((deal, index) => (
            <div
              key={deal._id}
              style={{
                border: '1px solid black',
                padding: '10px',
                margin: '10px',
                position: 'relative',
              }}
            >
              <div
                ref={refs.current[deal._id]}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                }}
              >
                <Button
                  variant="success"
                  onClick={() =>
                    setOpenDealId(openDealId === deal._id ? null : deal._id)
                  }
                >
                  <i className="material-icons">more_vert</i>
                </Button>

                {openDealId === deal._id && (
                  <div
                    ref={refs.current[deal._id]}
                    style={{
                      position: 'absolute',
                      top: '40px',
                      right: '10px',
                      padding: '0px',
                      borderRadius: '5px',
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    }}
                  >
                    <ButtonGroup vertical>
                      <Button
                        style={{
                          width: '100px',
                          fontSize: '80%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onClick={() => handleEditDeal(deal._id)}
                      >
                        <i className="material-icons">edit</i> Edit
                      </Button>
                      <Button
                        style={{
                          width: '100px',
                          fontSize: '80%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onClick={() => handleGetCode(deal._id)}
                      >
                        <i className="material-icons"></i> Get Code
                      </Button>
                      <Button
                        style={{
                          width: '100px',
                          fontSize: '80%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onClick={() => handleDeleteDeal(deal._id)}
                      >
                        <i className="material-icons">delete</i> Delete
                      </Button>
                    </ButtonGroup>
                  </div>
                )}
              </div>
              <h2>{deal.dealName}</h2>
              <p>{deal.description}</p>
            </div>
          ))}
          <div
            className="container"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
            }}
          >
            <button
              style={{
                width: '150px',
                borderRadius: '3px',
                letterSpacing: '1.5px',
                marginTop: '1rem',
              }}
              onClick={handleAddDeal}
              className="btn btn-large waves-effect waves-light hoverable blue accent-3"
            >
              Add Deal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function useOutsideClick(refs, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        refs.some(ref => ref.current && !ref.current.contains(event.target))
      ) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, callback]);
}

Deal.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  createDeal: PropTypes.func.isRequired,
  getDeals: PropTypes.func.isRequired,
  deleteDeal: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(mapStateToProps, {
  logoutUser,
  createDeal,
  getDeals,
  editDeal,
  deleteDeal,
})(Deal);
