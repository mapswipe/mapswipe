# ScrollableMixin

ScrollableMixin lets your scrollable React Native components conform to a standard interface, making it easier to compose components. This lets you compose different types of ScrollView-like components while preserving the `ScrollView` API, including methods like `scrollTo`.

See [react-native-scrollable-decorator](https://github.com/exponentjs/react-native-scrollable-decorator) for the decorator version of this mixin.

[![npm package](https://nodei.co/npm/react-native-scrollable-mixin.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/react-native-scrollable-mixin/)

## Installation
```
npm install react-native-scrollable-mixin
```

## Usage

Add ScrollableMixin to your scrollable React components and implement `getScrollResponder()`, which must return the underlying scrollable component's scroll responder.

## With JavaScript classes

Use `Object.assign` to copy ScrollableMixin's functions to your class's prototype as instance methods:

```js
class InfiniteScrollView extends React.Component {
  static propTypes = {
    ...ScrollView.propTypes,
    renderScrollComponent: PropTypes.func.isRequired
  };

  /**
   * IMPORTANT: You must return the scroll responder of the underlying
   * scrollable component from getScrollResponder() when using ScrollableMixin.
   */
  getScrollResponder() {
    return this._scrollView.getScrollResponder();
  }

  setNativeProps(props) {
    this._scrollView.setNativeProps(props);
  }

  render() {
    let { renderScrollComponent, ...props } = this.props;
    return React.cloneElement(renderScrollComponent(props), {
      ref: component => { this._scrollView = component; },
    });
  }
}

// Mix in ScrollableMixin's methods as instance methods
Object.assign(InfiniteScrollView.prototype, ScrollableMixin);
```

### With `React.createClass`

```js
let ScrollableMixin = require('react-native-scrollable-mixin');

let InfiniteScrollView = React.createClass({
  mixins: [ScrollableMixin],

  propTypes: {
    ...ScrollView.propTypes,
    renderScrollComponent: PropTypes.func.isRequired,
  },

  /**
   * IMPORTANT: You must return the scroll responder of the underlying
   * scrollable component from getScrollResponder() when using ScrollableMixin.
   */
  getScrollResponder() {
    return this._scrollView.getScrollResponder();
  },

  setNativeProps(props) {
    this._scrollView.setNativeProps(props);
  },

  render() {
    var {
      renderScrollComponent,
      ...props
    } = this.props;
    return React.cloneElement(renderScrollComponent(props), {
      ref: component => { this._scrollView = component; },
    });
  },
});
```

## Features

By mixing in ScrollableMixin, your custom component gets the `ScrollView` API. For example:

```js
class App extends React.Component {
  render() {
    return (
      <ListView
        ref={component => this._scrollView = component}
        renderScrollView={props => <InfiniteScrollView {...props} />}
        dataSource={...}
        renderRow={...}
      />
    );
  }

  _scrollToTop() {
    // By having all scrollable components conform to ScrollableMixin's
    // standard, calling `scrollTo` on your top-level scrollable component will
    // successfully scroll the underlying scroll view.
    this._scrollView.scrollTo(0, 0);
  }
}
```
