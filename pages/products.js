import { isEqual } from 'lodash';
import React from 'react';
import Head from 'next/head';
import Root from '../components/common/Root';
import PropTypes from 'prop-types';
import { withRouter } from 'next/router';
import qs from 'qs';
import algoliasearch from 'algoliasearch/lite';
import { findResultsState } from 'react-instantsearch-dom/server';
import ProductList from '../components/products/ProductList';

const searchClient = algoliasearch(
  '4PQHYRMCTI', '884789227233d2c5fb7909c1229a9e11'
);

const updateAfter = 700;

const createURL = (state) => `?${qs.stringify(state)}`;

const pathToSearchState = (path) =>
  path.includes('?') ? qs.parse(path.substring(path.indexOf('?') + 1)) : {};

const searchStateToURL = (searchState) =>
  searchState ? `${window.location.pathname}?${qs.stringify(searchState)}` : '';

const DEFAULT_PROPS = {
  searchClient,
  indexName: 'products',
};

class SearchPage extends React.Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
    resultsState: PropTypes.object,
    searchState: PropTypes.object,
  };

  state = {
    searchState: this.props.searchState,
    lastRouter: this.props.router,
  };

  static async getInitialProps({ asPath }) {
    const searchState = pathToSearchState(asPath);
    const resultsState = await findResultsState(ProductList, {
      ...DEFAULT_PROPS,
      searchState,
    });

    return {
      resultsState,
      searchState,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (!isEqual(state.lastRouter, props.router)) {
      return {
        searchState: pathToSearchState(props.router.asPath),
        lastRouter: props.router,
      };
    }

    return null;
  }

  onSearchStateChange = (searchState) => {
    clearTimeout(this.debouncedSetState);

    this.debouncedSetState = setTimeout(() => {
      const href = searchStateToURL(searchState);

      this.props.router.push(href, href, {
        shallow: true,
      });
    }, updateAfter);

    this.setState({ searchState });
  };

  render() {
    return (
      <Root>
        <Head>
          <title>Produits</title>
        </Head>
        <ProductList
          {...DEFAULT_PROPS}
          searchState={this.state.searchState}
          resultsState={this.props.resultsState}
          onSearchStateChange={this.onSearchStateChange}
          createURL={createURL}
        />
      </Root>
    );
  }
}

export default withRouter(SearchPage);