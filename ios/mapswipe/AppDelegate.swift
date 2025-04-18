import UIKit
import React
import FirebaseCore
import FirebaseAuth
import FirebaseStorage
import RNBootSplash
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: RCTAppDelegate {
    override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        self.moduleName = "mapswipe"
        self.dependencyProvider = RCTAppDependencyProvider()

        // You can add your custom initial props in the dictionary below.
        // They will be passed down to the ViewController used by React Native.
        self.initialProps = [:]
        FirebaseApp.configure()

        if let rootView = self.window.rootViewController?.view as? RCTRootView {
            if #available(iOS 13.0, *) {
                rootView.backgroundColor = UIColor.systemBackground
            } else {
                rootView.backgroundColor = UIColor.white
            }
        }

        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }

    override func customize(_ rootView: RCTRootView!) {
        super.customize(rootView)
        RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView) // ⬅️  initialize the splash screen
    }

    // func onReactInstanceReady(_ bridge: RCTBridge!) {
    //     super.onReactInstanceReady(bridge)
    //     if let rootView = self.window.rootViewController?.view as? RCTRootView {
    //     }
    // }

    // deeplink support
    override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        return RCTLinkingManager.application(app, open: url, options: options)
    }

    override func sourceURL(for bridge: RCTBridge) -> URL? {
        self.bundleURL()
    }

    override func bundleURL() -> URL? {
        #if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
        return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }
}
