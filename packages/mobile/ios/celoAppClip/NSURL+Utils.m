//
//  NSURL+Utils.m
//  celoAppClip
//
//  Created by Jean Regisser on 05/10/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "NSURL+Utils.h"

@implementation NSURL (Utils)

- (NSDictionary<NSString *, NSString *>*)queryParams {
    NSURLComponents* urlComponents = [NSURLComponents componentsWithURL:self resolvingAgainstBaseURL:NO];

    NSMutableDictionary<NSString *, NSString *>* queryParams = [NSMutableDictionary<NSString *, NSString *> new];
    for (NSURLQueryItem* queryItem in [urlComponents queryItems])
    {
        if (queryItem.value == nil)
        {
            continue;
        }
        [queryParams setObject:queryItem.value forKey:queryItem.name];
    }
  
    return queryParams.copy;
}

@end
