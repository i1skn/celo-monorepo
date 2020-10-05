//
//  SceneDelegate.m
//  celoAppClip
//
//  Created by Ivan Sorokin on 02.10.20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "SceneDelegate.h"
#import "NSURL+Utils.h"
#import "ViewController.h"

@interface SceneDelegate ()

@end

@implementation SceneDelegate


- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions {
    // Use this method to optionally configure and attach the UIWindow `window` to the provided UIWindowScene `scene`.
    // If using a storyboard, the `window` property will automatically be initialized and attached to the scene.
    // This delegate does not imply the connecting scene or session are new (see `application:configurationForConnectingSceneSession` instead).
  
  NSUserActivity *activity = connectionOptions.userActivities.anyObject;
  [self handleActivity:activity];
}


- (void)sceneDidDisconnect:(UIScene *)scene {
    // Called as the scene is being released by the system.
    // This occurs shortly after the scene enters the background, or when its session is discarded.
    // Release any resources associated with this scene that can be re-created the next time the scene connects.
    // The scene may re-connect later, as its session was not necessarily discarded (see `application:didDiscardSceneSessions` instead).
}


- (void)sceneDidBecomeActive:(UIScene *)scene {
    // Called when the scene has moved from an inactive state to an active state.
    // Use this method to restart any tasks that were paused (or not yet started) when the scene was inactive.
}


- (void)sceneWillResignActive:(UIScene *)scene {
    // Called when the scene will move from an active state to an inactive state.
    // This may occur due to temporary interruptions (ex. an incoming phone call).
}


- (void)sceneWillEnterForeground:(UIScene *)scene {
    // Called as the scene transitions from the background to the foreground.
    // Use this method to undo the changes made on entering the background.
}


- (void)sceneDidEnterBackground:(UIScene *)scene {
    // Called as the scene transitions from the foreground to the background.
    // Use this method to save data, release shared resources, and store enough scene-specific state information
    // to restore the scene back to its current state.
}

- (void)scene:(UIScene *)scene continueUserActivity:(NSUserActivity *)userActivity {
  [self handleActivity:userActivity];
}

- (void)handleActivity:(NSUserActivity*)activity {
  if (!activity) {
    NSLog(@"No user actvity set");
    return;
  }
  if (![activity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) {
    return;
  }
  
  NSURL *url = activity.webpageURL;
  
  NSLog(@"Passed url: %@", url);
  
  NSDictionary *params = [url queryParams];
  
  // TODO: pass params to ViewController

  ViewController *viewController = self.window.rootViewController;
  [viewController setParams:[NSNumber numberWithFloat:[params[@"amount"] floatValue]] beneficiary:params[@"beneficiary"] token:params[@"token"]];

}

@end
