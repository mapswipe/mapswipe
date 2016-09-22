//
//  RNRandom.m
//  randombytes
//
//  Created by Mark Vayngrib on 10/13/15.
//  Copyright (c) 2015 Facebook. All rights reserved.
//

#import "RNRandomBytes.h"
#import "RCTBridgeModule.h"
#import "RCTBridge.h"

@implementation RNRandomBytes

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

RCT_EXPORT_METHOD(randomBytes:(NSUInteger)length
                  callback:(RCTResponseSenderBlock)callback)
{
    callback(@[[NSNull null], [self randomBytes:length]]);
}

- (NSString *) randomBytes:(NSUInteger)length
{
    NSMutableData* bytes = [NSMutableData dataWithLength:length];
    SecRandomCopyBytes(kSecRandomDefault, length, [bytes mutableBytes]);
    return [bytes base64EncodedStringWithOptions:0];
}

- (NSDictionary *)constantsToExport
{
    return @{
        @"seed": [self randomBytes:4096]
    };
};

@end
