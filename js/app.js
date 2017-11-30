import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';

import Quote from './quote';

class QuotesLibrary extends React.Component {
  render() {
    return (
      <div className="quotes-list">
        {this.props.library.allQuotes.map(quote =>
          <Quote key={quote.id} quote={quote} />
        )}
      </div>
    )
  }
}

QuotesLibrary = Relay.createContainer(QuotesLibrary, {
  fragments: {
    library: () => Relay.QL `
      fragment AllQuotes on QuotesLibrary {
        allQuotes {
          id
          ${Quote.getFragment('quote')}
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