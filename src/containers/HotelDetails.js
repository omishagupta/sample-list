/* eslint-disable react/sort-comp */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Helmet from 'react-helmet';
import Text from 'leaf-ui/Text/web';

import { getHotelsData, getHotelsDataIfNeeded, getHotelsMeta } from '../actions';
import { Flex, Layout, SoldOutStyler } from '../styles';
import { NavHeader, Essential, DetailsCard, PriceCard, SoldOut, Policy } from '../components';

// ////////////////////////////////////////////////////////////

const propTypes = {
  getHotelsDataIfNeeded: PropTypes.func.isRequired,
  getHotelsMeta: PropTypes.func.isRequired,
  hotels: PropTypes.shape({
    data: PropTypes.object.isRequired
  }).isRequired,
  hotelsMeta: PropTypes.shape({
    data: PropTypes.object.isRequired
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node
    }).isRequired
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

class HotelDetails extends Component {
  state = {};

  componentDidMount() {
    window.scrollTo(0, 0);

    this.props.getHotelsDataIfNeeded();
    this.props.getHotelsMeta();
  }

  static getDerivedStateFromProps({ hotels, hotelsMeta, match, history }) {
    if (!hotels.isLoading && !hotelsMeta.isLoading) {
      const hotelId = HotelDetails.getHotelId(match.params);
      if (!hotels.data[hotelId]) {
        history.push('/hotels');
      }
    }
    return null;
  }

  static getHotelId = ({ hotelId: subRouteUrl }) =>
    subRouteUrl.substr(subRouteUrl.lastIndexOf('-') + 1);

  static generatePageTitle = hotel =>
    `Treebo ${hotel.name}, ${hotel.city} | ${
      hotel.prices && hotel.prices.length > 0 ? `Tariff ₹${hotel.prices[0][1]},` : ''
    } Lowest Price @GitHub.com`;

  static getPolicyHead = policy =>
    policy.includes(':') ? policy.substring(0, policy.indexOf(':')).trim() : policy;

  static getPolicySubhead = policy =>
    policy.includes(':') ? policy.substring(policy.indexOf(':') + 1).trim() : null;

  renderPageTitle = (hotels, hotelData) => {
    let title = 'Loading Hotel Info...';
    if (!hotels.isLoading && !hotels.isLoadingPrices)
      title = HotelDetails.generatePageTitle(hotelData);

    return (
      <Helmet>
        <title>{title}</title>
      </Helmet>
    );
  };

  renderEssentials = (essentials = []) => (
    <Flex display="flex">{essentials.map(name => <Essential key={name} name={name} />)}</Flex>
  );

  renderPolicies = (policies = []) => (
    <Flex display="flex" flexDirection="column">
      {policies.map(policy => (
        <Policy
          key={HotelDetails.getPolicyHead(policy)}
          head={HotelDetails.getPolicyHead(policy)}
          subhead={HotelDetails.getPolicySubhead(policy)}
        />
      ))}
    </Flex>
  );

  renderPriceCards = prices => (
    <Layout paddingTop="2rem">
      {prices.map((room, index) => (
        <PriceCard key={room[0]} index={index} type={room[0]} price={room[1]} />
      ))}
    </Layout>
  );

  render() {
    const { match, hotels, hotelsMeta } = this.props;
    const { data: hotelsData } = hotels;
    const { data: hotelsMetaData } = hotelsMeta;

    const hotelId = HotelDetails.getHotelId(match.params);
    const hotelData = hotelsData[hotelId] || {};

    const soldOut = hotelData.prices && hotelData.prices.length === 0;

    return (
      <Fragment>
        {this.renderPageTitle(hotels, hotelData)}

        <NavHeader {...hotelData} isLoading={hotels.isLoading} />

        {hotels.isLoading || hotels.isLoadingPrices || hotelsMeta.isLoading ? (
          <Flex display="flex" padding="2rem" justifyContent="center" alignItems="center">
            <Text>. . . . .</Text>
          </Flex>
        ) : (
          <Fragment>
            <DetailsCard title="Room Types" subtitle="In room facilities" soldOut={soldOut}>
              <SoldOutStyler soldOut={soldOut}>
                {this.renderEssentials(hotelsMetaData.essentials)}
              </SoldOutStyler>
              <Fragment>
                {hotelData.prices ? (
                  hotelData.prices.length > 0 ? (
                    this.renderPriceCards(hotelData.prices)
                  ) : (
                    <SoldOut />
                  )
                ) : null}
              </Fragment>
            </DetailsCard>
            <SoldOutStyler soldOut={soldOut}>
              <DetailsCard title="Policies">
                {this.renderPolicies(hotelsMetaData.policies)}
              </DetailsCard>
            </SoldOutStyler>
          </Fragment>
        )}
      </Fragment>
    );
  }
}

HotelDetails.propTypes = propTypes;

const mapStateToProps = ({ hotels, hotelsMeta }) => ({
  hotels,
  hotelsMeta
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({ getHotelsData, getHotelsDataIfNeeded, getHotelsMeta }, dispatch);

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(HotelDetails)
);
