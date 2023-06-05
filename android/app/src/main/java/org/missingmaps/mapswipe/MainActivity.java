package org.missingmaps.mapswipe;

import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.zoontek.rnbootsplash.RNBootSplash;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "mapswipe";
    }

    // https://github.com/zoontek/react-native-bootsplash/tree/f48e56e005c35874dec7add85d863e6505d612ab
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // show the splashscreen over the main activity (from bootsplash.xml)
        RNBootSplash.init(R.drawable.bootsplash, MainActivity.this);
    }

   // https://reactnavigation.org/docs/4.x/getting-started/
   /**
    * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
    * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
    * (aka React 18) with two boolean flags.
    */
   @Override
   protected ReactActivityDelegate createReactActivityDelegate() {
     return new DefaultReactActivityDelegate(
         this,
         getMainComponentName(),
         // If you opted-in for the New Architecture, we enable the Fabric Renderer.
         DefaultNewArchitectureEntryPoint.getFabricEnabled(), // fabricEnabled
         // If you opted-in for the New Architecture, we enable Concurrent React (i.e. React 18).
         DefaultNewArchitectureEntryPoint.getConcurrentReactEnabled() // concurrentRootEnabled
     ) {
       @Override
       protected ReactRootView createRootView() {
         return new RNGestureHandlerEnabledRootView(MainActivity.this);
       }
     };
   }
}
