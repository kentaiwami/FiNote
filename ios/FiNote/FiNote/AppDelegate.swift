//
//  AppDelegate.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/19.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import KeychainAccess

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    var movies:[Movies.Data] = []

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        UINavigationBar.appearance().isTranslucent = false
        UINavigationBar.appearance().tintColor = UIColor.white
        UINavigationBar.appearance().barTintColor = UIColor.hex(Color.main.rawValue, alpha: 1.0)
        UINavigationBar.appearance().titleTextAttributes = [NSAttributedString.Key.foregroundColor: UIColor.white]
        
        let keychain = Keychain()
        
        if IsReset() {
            try! keychain.removeAll()
        }
        
        if IsInsertDummyData() {
            let data = GetDummyData()
            try! keychain.set(data.username, key: "username")
            try! keychain.set(data.password, key: "password")
            try! keychain.set(data.id, key: "id")
            try! keychain.set(data.email, key: "email")
            try! keychain.set(data.birthyear, key: "birthyear")
        }
        
        if IsInsertEmptyDummyData() {
            let data = GetEmptyDummyData()
            try! keychain.set(data.username, key: "username")
            try! keychain.set(data.password, key: "password")
            try! keychain.set(data.id, key: "id")
            try! keychain.set(data.email, key: "email")
            try! keychain.set(data.birthyear, key: "birthyear")
        }
                
        let username = try! keychain.getString("username")
        
        if username == nil {
            let storyboard = UIStoryboard(name: "Main", bundle: nil)
            let signVC = storyboard.instantiateViewController(withIdentifier: "Sign")
            self.window!.rootViewController = signVC
            self.window?.makeKeyAndVisible()
        }
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }


}

