//
//  SignCommon.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/22.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import SwiftyJSON
import Alamofire
import KeychainAccess
import NVActivityIndicatorView


class SignCommon {
    func CallSignAPI(msg: String, label: String, endpoint: String, values: [String:Any], vc: UIViewController) {
        let activityData = ActivityData(message: msg, type: .lineScaleParty)
        let urlString = API.base.rawValue+API.v1.rawValue+API.user.rawValue+endpoint

        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: label).async {
            Alamofire.request(urlString, method: .post, parameters: values, encoding: JSONEncoding(options: [])).responseJSON { (response) in
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    let keychain = Keychain()
                    try! keychain.set(values["username"] as! String, key: "username")
                    try! keychain.set(values["password"] as! String, key: "password")
                    try! keychain.set(obj["id"].stringValue, key: "id")
                    try! keychain.set(obj["email"].stringValue, key: "email")
                    try! keychain.set(obj["birthyear"].stringValue, key: "birthyear")
                    
                    let storyboard = UIStoryboard(name: "Main", bundle: nil)
                    let mainVC = storyboard.instantiateViewController(withIdentifier: "Main")
                    vc.present(mainVC, animated: true, completion: nil)
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: vc)
                }
            }
        }
    }
}
