/**
 *
 * After react-native v0.56.0, `react-native-scrollable-tab-view` case app failed to run. Npm server show below:
  ```
  error: bundling failed: SyntaxError: /node_modules/react-native-scrollable-tab-view/SceneComponent.js: A trailing comma is not permitted after the rest element (9:32)

    7 |
    8 | const SceneComponent = (Props) => {
  >  9 |   const {shouldUpdated, ...props, } = Props;
      |                                 ^
    10 |   return <View {...props}>
    11 |       <StaticContainer shouldUpdate={shouldUpdated}>
    12 |         {props.children}
 * ```
 *
 * As the upstream repo in github has not released , post the script to fix it temporary.
 */
function fixScrollableTabViewTrailingCommaError(){
  const fs = require('fs');
  const filePath = 'node_modules/react-native-scrollable-tab-view/SceneComponent.js';
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }


    const result = data.replace(/const {shouldUpdated, ...props, }/g, 'const {shouldUpdated, ...props}');
    fs.writeFile(filePath, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
}


fixScrollableTabViewTrailingCommaError();
