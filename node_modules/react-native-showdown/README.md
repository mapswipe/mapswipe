# react-showdown [![Dependency Status][dependency-image]][dependency-url]

> [React-native](http://facebook.github.io/react-native/) component which renders markdown into a webview!

### Features

* **Renders Markdown into a react-native WebView component.**
* **Automatically opens links in the system browser.**
* Customization with pure CSS.

### Installation

```bash
npm install --save react-native-showdown
```

### Use as React component

Really simple markdown example with ES6/JSX:

```jsx
import Markdown from 'react-native-showdown';

class Example extends Component {
    render() {
        var markdown = '# Welcome to React Native!\n\nMore content...';
        return <Markdown body={ markdown } />
    }
}
```

### Available props / converter options

* `title` String, optional, plain text which will be used for the title, normally not shown, so you can skip this.
* `body` String, required, markdown body which will be shown as webview content.
* `pureCSS` String, optional, pure CSS which will be used to style the webview content.
* `automaticallyAdjustContentInsets` Bool, optional, see [ScrollView#automaticallyAdjustContentInsets](http://facebook.github.io/react-native/docs/scrollview.html#automaticallyadjustcontentinsets)
* `style` mixed, optional (default `{ flex: 1 }`), see [View#style](http://facebook.github.io/react-native/docs/view.html#style)

### Run the example

```bash
git clone https://github.com/jerolimov/react-native-showdown.git
cd react-native-showdown/examples
npm install
```

Run the react-native project like any react-native project.

### Credits

Project is based on the markdown parser [Showdown](https://github.com/showdownjs/showdown).

### Alternatives

* [react-native-markdown](https://github.com/lwansbrough/react-native-markdown)
  which tries to render markdown as native components (instead of using a WebView).

[travis-image]: https://img.shields.io/travis/jerolimov/react-native-showdown/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/jerolimov/react-native-showdown
[coveralls-image]: https://img.shields.io/coveralls/jerolimov/react-native-showdown/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/jerolimov/react-native-showdown
[dependency-image]: http://img.shields.io/david/jerolimov/react-native-showdown.svg?style=flat-square
[dependency-url]: https://david-dm.org/jerolimov/react-native-showdown
