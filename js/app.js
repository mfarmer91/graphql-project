import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import { debounce } from 'lodash';

import SearchForm from './search-form';
import Quote from './quote';

class QuotesLibrary extends React.Component {
  constructor(props) {
    super(props);
    this.search = debounce(this.search.bind(this), 300);
  }
  search(searchTerm) {
    this.props.relay.setVariables({searchTerm});
  }
  render() {
    return (
      <div className="quotes-library">
        <SearchForm searchAction={this.search} />
        <div className="quotes-list">
          {this.props.library.quotesConnection.edges.map(edge =>
            <Quote key={edge.node.id} quote={edge.node} />
          )}
        </div>
      </div>
    )
  }
}

QuotesLibrary = Relay.createContainer(QuotesLibrary, {
  initialVariables: {
    searchTerm: ''
  },
  fragments: {
    library: () => Relay.QL `
      fragment on QuotesLibrary {
        quotesConnection(first: 100, searchTerm: $searchTerm) {
          edges {
            node {
              id
              ${Quote.getFragment('quote')}
            }
          }
        }
      }
    `
  }
});
//Relay does the AJAX fetching and stores the state, though a complete query must be created below in order to communicate with the server.

class AppRoute extends Relay.Route {
  static routeName = 'App';
  static queries = {
    library: (Component) => Relay.QL `
      query QuotesLibrary {
        quotesLibrary {
          ${Component.getFragment('library')}
        }
      }
    `
  }
}
//(Component) is what is passed to the RootQuery below, and in this case it is the QuotesLibrary component.

ReactDOM.render(
  <Relay.RootContainer
    Component={QuotesLibrary}
    route={new AppRoute()}
  />,
  document.getElementById('react')
);