//
//  ViewController.m
//  celoAppClip
//
//  Created by Ivan Sorokin on 02.10.20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "ViewController.h"
#import <Stripe/Stripe.h>
#import <PassKit/PassKit.h>

@interface ViewController () <STPApplePayContextDelegate>
@property (weak, nonatomic) IBOutlet PKPaymentButton *payButton;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *activityIndicator;
@property (weak, nonatomic) IBOutlet UILabel *txStatus;
@property (nonatomic, copy) NSString *intentId;
@property (nonatomic) NSTimer *timer;
@end

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
#ifdef __IPHONE_13_0
    if (@available(iOS 13.0, *)) {
        self.view.backgroundColor = [UIColor systemBackgroundColor];
    }
#endif
    self.title = @"Apple Pay";
    self.edgesForExtendedLayout = UIRectEdgeNone;
    self.activityIndicator.hidesWhenStopped = YES;
    [self.payButton addTarget:self action:@selector(pay) forControlEvents:UIControlEventTouchUpInside];
    self.timer = [NSTimer scheduledTimerWithTimeInterval:10 target:self selector:@selector(checkTransactionsStatus) userInfo:nil repeats:YES];
}

- (void)pay {
    // Build the payment request
    NSString *merchantIdentifier = @"merchant.co.clabs.app-clip-hackathon";
    PKPaymentRequest *paymentRequest = [Stripe paymentRequestWithMerchantIdentifier:merchantIdentifier country:@"US" currency:@"USD"];
    paymentRequest.paymentSummaryItems = @[
        // The final line should represent your company;
        // it'll be prepended with the word "Pay" (i.e. "Pay iHats, Inc $50")
        [PKPaymentSummaryItem summaryItemWithLabel:@"in cUSD" amount:[NSDecimalNumber decimalNumberWithString:@"5.00"]],
    ];
    paymentRequest.requiredBillingContactFields = [NSSet setWithArray:@[PKContactFieldEmailAddress]];
  
    // Initialize STPApplePayContext
    STPApplePayContext *applePayContext = [[STPApplePayContext alloc] initWithPaymentRequest:paymentRequest delegate:self];

    // Present Apple Pay
    if (applePayContext) {
        [self.activityIndicator startAnimating];
        self.payButton.enabled = NO;
        [applePayContext presentApplePayOnViewController:self completion:nil];
    } else {
        NSLog(@"Make sure you've configured Apple Pay correctly, as outlined at https://stripe.com/docs/apple-pay#native");
    }
}

#pragma mark - STPApplePayContextDelegate

- (void)applePayContext:(STPApplePayContext *)context didCreatePaymentMethod:(__unused STPPaymentMethod *)paymentMethod paymentInformation:(__unused PKPayment *)paymentInformation completion:(STPIntentClientSecretCompletionBlock)completion {
  
    NSString *backendURL = @"https://us-central1-app-clip-hackathon.cloudfunctions.net/createPaymentIntent";
      
    // This asks the backend to create a SetupIntent for us, which can then be passed to the Stripe SDK to confirm
    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:config];
    NSURL *url = [NSURL URLWithString:backendURL];
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];
    request.HTTPMethod = @"POST";
    
    NSString *postBody = [NSString stringWithFormat:
                              @"amount=%@&currencyCode=%@&celoAddress=%@",
                              @"500",
                              @"USD",
                              @"0xLOL_IVAN"
                              ];
    NSData *data = [postBody dataUsingEncoding:NSUTF8StringEncoding];
    NSURLSessionUploadTask *uploadTask = [session uploadTaskWithRequest:request
                                                               fromData:data
                                                      completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                                                          NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
                                                          if (!error && httpResponse.statusCode != 200) {
                                                              NSString *errorMessage = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] ?: @"There was an error connecting to your payment backend.";
                                                              error = [NSError errorWithDomain:@"APIClientErrorDomain"
                                                                                          code:STPInvalidRequestError
                                                                                      userInfo:@{NSLocalizedDescriptionKey: errorMessage}];
                                                          }
                                                          if (error || data == nil) {
                                                            completion(nil, error);
                                                          }
                                                          else {
                                                              NSError *jsonError = nil;
                                                              id json = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonError];
                                                              
                                                              if (json &&
                                                                  [json isKindOfClass:[NSDictionary class]] &&
                                                                  [json[@"clientSecret"] isKindOfClass:[NSString class]] && [json[@"intentId"] isKindOfClass:[NSString class]]) {
                                                                self.intentId = json[@"intentId"];
                                                                completion(json[@"clientSecret"], nil);
                                                              }
                                                              else {
                                                                completion(nil, jsonError);
                                                              }
                                                          }
                                                      }];
    
    [uploadTask resume];
  //completion(@"pi_1HXo7iAUPBfhIkJQZXsDibR5_secret_LZHARYX37L3ULiEw6hoPl8TgE", nil);
}

- (void) checkTransactionsStatus {
  if (self.intentId != nil) {
    NSString *backendURL = [NSString stringWithFormat:
                            @"https://us-central1-app-clip-hackathon.cloudfunctions.net/getIntentStatus?intentId=%@",
                            self.intentId
                            ];
      
    // This asks the backend to create a SetupIntent for us, which can then be passed to the Stripe SDK to confirm
    NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:config];
    NSURL *url = [NSURL URLWithString:backendURL];
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] initWithURL:url];
    request.HTTPMethod = @"GET";
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                                                          NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
                                                          if (!error && httpResponse.statusCode != 200) {
                                                              NSString *errorMessage = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] ?: @"There was an error connecting to your payment backend.";
                                                              error = [NSError errorWithDomain:@"APIClientErrorDomain"
                                                                                          code:STPInvalidRequestError
                                                                                      userInfo:@{NSLocalizedDescriptionKey: errorMessage}];
                                                          }
                                                          else {
                                                              NSError *jsonError = nil;
                                                              id json = [NSJSONSerialization JSONObjectWithData:data options:0 error:&jsonError];
                                                              
                                                              if (json &&
                                                                  [json isKindOfClass:[NSDictionary class]] &&
                                                                  [json[@"status"] isKindOfClass:[NSString class]]) {
                                                                NSLog(@"%@", json);
                                                                dispatch_async(dispatch_get_main_queue(), ^{
                                                                  self.txStatus.text = json[@"status"];
                                                                  if ([json[@"status"]  isEqual: @"Done"] || [json[@"status"]  isEqual: @"Failed"]) {
                                                                      self.intentId = nil;
                                                                      [self.activityIndicator stopAnimating];
                                                                      self.payButton.enabled = YES;
                                                                    }
                                                                  });
                                                              }
                                                          }
                                                      }];
    
    [dataTask resume];
  }
}

- (void)applePayContext:(STPApplePayContext *)context didCompleteWithStatus:(STPPaymentStatus)status error:(NSError *)error {
    

    switch (status) {
        case STPPaymentStatusSuccess:
            NSLog(@"Success!");
           // [self.delegate exampleViewController:self didFinishWithMessage:@"Payment successfully created"];
            break;
            
        case STPPaymentStatusError:
            //[self.delegate exampleViewController:self didFinishWithError:error];
            NSLog(@"Error: %@", error);
            break;
            
        case STPPaymentStatusUserCancellation:
            NSLog(@"Cancelled by user");
            break;
    }
}

@end
