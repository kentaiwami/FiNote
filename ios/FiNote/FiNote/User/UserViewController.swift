//
//  UserViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/28.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import Eureka
import Alamofire
import SwiftyJSON
import KeychainAccess

class UserViewController: FormViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.isScrollEnabled = false
        
        CreateForm()
    }
    
    func CreateForm() {
        let keychain = Keychain()
        let username = try! keychain.getString("username")
        let password = try! keychain.getString("password")
        let email = try! keychain.getString("username")
//        let username = try! keychain.getString("username")
//        let username = try! keychain.getString("username")
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
