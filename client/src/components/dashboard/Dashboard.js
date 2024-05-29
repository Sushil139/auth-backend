import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { getDeals } from '../../actions/authActions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import useOutsideClick from '../../utils/useOutsideBlock';
import './Dashboard.css';
import {
  Chart,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

const colors = [
  'rgba(255, 120, 132, 0.9)', // red
  'rgba(54, 162, 235, 0.9)', // blue
  'rgba(255, 206, 86, 0.9)', // yellow
  'rgba(75, 192, 192, 0.9)', // green
  'rgba(153, 102, 255, 0.9)', // purple
  'rgba(255, 159, 64, 0.9)', // orange
  // Add more colors if needed
];

function Dashboard(props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({
    selectedProduct: 'All Products',
    visitorCount: 0,
    chartData: {},
    dealName: '',
    description: '',
    deals: [],
    errors: {},
    countryChartData: {},
  });

  const dropdownRef = useRef(null);
  useOutsideClick(dropdownRef, () => setOpen(false));

  useEffect(
    () => {
      const fetchDeals = async () => {
        try {
          const deals = await props.getDeals();
          console.log('deals', deals);
          setState(prevState => ({ ...prevState, deals }));

          const filteredDeals =
            state.selectedProduct === 'All Products'
              ? deals
              : deals.filter(deal => deal.dealName === state.selectedProduct);

          // Calculate the total number of visitors for all products
          const totalVisitors = filteredDeals.reduce(
            (sum, deal) => sum + deal.visitors,
            0
          );

          // Create an array of the last 30 dates
          const dates = Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0]; // format as yyyy-mm-dd
          }).reverse();

          // For each date, sum up the visitor counts of all deals
          const data = dates.map(date => {
            let count = 0;
            let uniqueCount = 0;
            const countryCounts = {};

            filteredDeals.forEach(deal => {
              const visitorPerDay = deal.visitorsPerDay.find(
                v => v.date.split('T')[0] === date
              );
              if (visitorPerDay) {
                count += visitorPerDay.count;
                uniqueCount += visitorPerDay.uniqueCount;

                visitorPerDay.countryVisitors.forEach(({ country, count }) => {
                  countryCounts[country] =
                    (countryCounts[country] || 0) + count;
                });
              }
            });

            return { date, count, uniqueCount, countryCounts };
          });

          // Create the new chart data
          const newChartData = {
            labels: dates,
            datasets: [
              {
                label: 'Total Visitors',
                data: data.map(d => d.count),
                fill: false,
                backgroundColor: 'rgb(75, 192, 192)',
                borderColor: 'rgba(75, 192, 192, 0.7)',
              },
              {
                label: 'Unique Visitors',
                data: data.map(d => d.uniqueCount),
                fill: false,
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgba(255, 99, 132, 0.7)',
              },
            ],
          };

          console.log('dataaaaa', data);

          const allCountries = [
            ...new Set(data.flatMap(d => Object.keys(d.countryCounts))),
          ];

          const countryChartData = {
            labels: dates,
            datasets: allCountries.map((country, index) => ({
              label: country,
              data: data.map(d => d.countryCounts[country] || 0),
              backgroundColor: colors[index % colors.length],
              borderColor: colors[index % colors.length],
            })),
          };

          setState(prevState => ({
            ...prevState,
            visitorCount: totalVisitors,
            chartData: newChartData,
            countryChartData: countryChartData,
          }));
        } catch (err) {
          if (err.response && err.response.status !== 404) {
            console.log(err);
            // navigate('/');
          }
        }
      };

      fetchDeals();
    },
    [state.selectedProduct]
  );

  const onLogoutClick = async e => {
    e.preventDefault();
    await props.logoutUser();
    navigate('/');
  };

  console.log(
    'charts',
    state.visitorCount,
    state.chartData,
    state.countryChartData
  );
  return (
    <div className="dashboard">
      <h1>Product Visitor Dashboard</h1>

      <Dropdown
        className="dropdown"
        show={open}
        onSelect={selectedProduct => {
          setState(prevState => ({ ...prevState, selectedProduct }));
          setOpen(false); // close the dropdown
        }}
        onToggle={isOpen => setOpen(isOpen)} // update the open state when the dropdown is toggled
        rootCloseEvent="click"
      >
        <Dropdown.Toggle
          variant="success"
          id="dropdown-basic"
          style={{ width: '150px' }}
        >
          {state.selectedProduct} <FontAwesomeIcon icon={faCaretDown} />
        </Dropdown.Toggle>

        <Dropdown.Menu style={{ flexDirection: 'column', width: '100%' }}>
          <Dropdown.Item
            style={{ display: 'block', backgroundColor: 'white' }}
            eventKey="All Products"
          >
            All Products
          </Dropdown.Item>
          {state?.deals?.map(deal => (
            <Dropdown.Item
              style={{ display: 'block', backgroundColor: 'white' }}
              eventKey={deal.dealName}
              key={deal._id}
            >
              {deal.dealName}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <div className="dashboard-content" style={{ paddingTop: '20px' }}>
        <div className="visitor-count" style={{ padding: '20px' }}>
          <h2>Visitor Count</h2>
          <p>{state.visitorCount}</p>
        </div>

        <div className="chart">
          {state?.chartData?.datasets && state.chartData.datasets.length > 0 && (
            <Line
              data={state.chartData}
              options={{
                responsive: true, // Enable responsiveness
                maintainAspectRatio: true,
                scales: {
                  x: {
                    type: 'category',
                    scaleLabel: {
                      display: true,
                      labelString: 'Date',
                    },
                  },
                },
              }}
            />
          )}
        </div>

        <div className="country-chart">
          {state?.countryChartData?.datasets &&
            state.countryChartData.datasets.length > 0 && (
              <Bar
                data={state.countryChartData}
                options={{
                  responsive: true, // Enable responsiveness
                  maintainAspectRatio: true,
                  scales: {
                    x: {
                      stacked: true,
                      type: 'category',
                      scaleLabel: {
                        display: true,
                        labelString: 'Date',
                      },
                    },
                    y: {
                      stacked: true,
                    },
                  },
                }}
              />
            )}
        </div>
      </div>
      {/* <button
        style={{
          width: '150px',
          borderRadius: '3px',
          letterSpacing: '1.5px',
          marginTop: '1rem',
          padding: '10px',
        }}
        onClick={onLogoutClick}
        className="btn btn-large waves-effect waves-light hoverable blue accent-3"
      >
        Logout
      </button> */}
    </div>
  );
}

Dashboard.propTypes = {
  getDeals: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(
  mapStateToProps,
  {
    getDeals,
  }
)(Dashboard);
