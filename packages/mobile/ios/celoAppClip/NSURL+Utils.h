//
//  NSURL+Utils.h
//  celoAppClip
//
//  Created by Jean Regisser on 05/10/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface NSURL (Utils)

- (NSDictionary<NSString *, NSString *>*)queryParams;

@end

NS_ASSUME_NONNULL_END
