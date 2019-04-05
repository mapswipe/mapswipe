//
//  mapswipeUITests.m
//  mapswipeUITests
//
//  Created by Henry Huck on 29/12/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <XCTest/XCTest.h>

@interface mapswipeUITests : XCTestCase

@end

@implementation mapswipeUITests

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.

    // In UI tests it is usually best to stop immediately when a failure occurs.
    self.continueAfterFailure = YES;

    // UI tests must launch the application that they test. Doing this in setup will make sure it happens for each test method.
    [[[XCUIApplication alloc] init] launch];

    // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testSignUpScreen {
  XCUIElement *signUpElement = /*@START_MENU_TOKEN@*/[[XCUIApplication alloc] init].scrollViews/*[["[[XCUIApplication alloc] init]","[",".otherElements matchingIdentifier:@\"Enter your username (More than 4 characters) Enter your email Enter your password (More than 6 characters) * All the mapping you contribute to mapswipe is open and available to anyone. Your username is public, but your email and password will never be shared with anyone. Sign Up Log in to an existing account Error on sign up Your username must be 4 characters or more Dismiss All RCTBridge required dispatch_sync to load RCTDevLoadingView. This may lead to deadlocks\"]",".otherElements matchingIdentifier:@\"Enter your username (More than 4 characters) Enter your email Enter your password (More than 6 characters) * All the mapping you contribute to mapswipe is open and available to anyone. Your username is public, but your email and password will never be shared with anyone. Sign Up Log in to an existing account Error on sign up Your username must be 4 characters or more\"]",".otherElements matchingIdentifier:@\"Enter your username (More than 4 characters) Enter your email Enter your password (More than 6 characters) * All the mapping you contribute to mapswipe is open and available to anyone. Your username is public, but your email and password will never be shared with anyone. Sign Up Log in to an existing account\"].scrollViews",".scrollViews"],[[[-1,0,1]],[[-1,5],[1,4],[1,3,3],[1,2,2]],[[-1,5],[1,4],[1,3,3]],[[-1,5],[1,4]]],[0,0]]@END_MENU_TOKEN@*/.otherElements[@"Sign Up"];
  XCTAssertTrue([signUpElement exists], "A sign up button should be present");
}

@end
