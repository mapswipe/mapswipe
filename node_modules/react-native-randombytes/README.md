# react-native-randombytes

## Usage

Note: only the asynchronous API is supported, due to the limitations of having to go over the RCTBridge, and there being no secure RNG in JavaScriptCore (Math.random is a bit of a joke in the industry)

```js
var randomBytes = require('react-native-randombytes')

// synchronous API
// uses SJCL
var rand = randomBytes(4)

// asynchronous API
// uses iOS-side SecRandomCopyBytes
randomBytes(4, (err, bytes) => {
  console.log(bytes.toString('hex'))
})
```

## Installation

### Automatic - Android / iOS (recommended)

```bash
rnpm link
```

### Manual

#### `iOS`

* Drag RNRandomBytes.xcodeproj from node_modules/react-native-randombytes into your XCode project.

* Click on the project in XCode, go to Build Phases, then Link Binary With Libraries and add `libRNRandomBytes.a`

Confused? See an example with screenshots [here](http://facebook.github.io/react-native/docs/linking-libraries-ios.html#content)


#### `Android`

* Update Gradle Settings

```gradle
// file: android/settings.gradle
...

include ':randombytes', ':app'
project(':randombytes').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-randombytes/app')
```

* Update Gradle Build

```gradle
// file: android/app/build.gradle
...

dependencies {
    ...
    compile project(':randombytes')
}
```

* Register React Package

```java
...
import com.bitgo.randombytes.RandomBytesPackage // import

public class MainActivity extends Activity implements DefaultHardwareBackBtnHandler {

    private ReactInstanceManager mReactInstanceManager;
    private ReactRootView mReactRootView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mReactRootView = new ReactRootView(this);
        mReactInstanceManager = ReactInstanceManager.builder()
                .setApplication(getApplication())
                .setBundleAssetName("index.android.bundle")
                .setJSMainModuleName("index.android")
                .addPackage(new MainReactPackage())
                .addPackage(new RandomBytesPackage()) // register package here
                .setUseDeveloperSupport(BuildConfig.DEBUG)
                .setInitialLifecycleState(LifecycleState.RESUMED)
                .build();
        mReactRootView.startReactApplication(mReactInstanceManager, "AwesomeProject", null);
        setContentView(mReactRootView);
    }
...

```
