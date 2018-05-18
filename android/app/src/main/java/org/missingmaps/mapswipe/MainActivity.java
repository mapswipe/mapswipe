package org.missingmaps.mapswipe;

import com.facebook.react.ReactActivity;
import cl.json.RNSharePackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.microsoft.codepush.react.CodePush;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.evollu.react.fa.FIRAnalyticsPackage;
import com.remobile.splashscreen.RCTSplashScreenPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import ca.jaysoo.extradimensions.ExtraDimensionsPackage;
import com.rnfs.RNFSPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import android.content.Intent; // <--- Import Intent
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;  // <--- Import Package

import java.util.Arrays;
import java.util.List;

public class MainActivity extends ReactActivity {

    private ReactNativePushNotificationPackage mReactNativePushNotificationPackage;
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Mapswipe";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    /**
     * A list of packages used by the app. If the app uses additional views
     * or modules besides the default ones, add more packages here.
     */
    @Override
    protected List<ReactPackage> getPackages() {
    mReactNativePushNotificationPackage = new ReactNativePushNotificationPackage();
        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new RNSharePackage(),
            new RandomBytesPackage(),
            new CodePush(this.getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), this, BuildConfig.DEBUG),
            //new FIRMessagingPackage(),
            new FIRAnalyticsPackage(),
            new RCTSplashScreenPackage(this),
            new LinearGradientPackage(),
            new ExtraDimensionsPackage(this),
            new RNDeviceInfo(),
            new RNFSPackage(),
            mReactNativePushNotificationPackage
        );
    }
    @Override
    public void onNewIntent(Intent intent) {
          if ( mReactNativePushNotificationPackage != null ) {
              mReactNativePushNotificationPackage.newIntent(intent);
          }
       }

}
