//
//  Common.swift
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
import PopupDialog


func CallSignAPI(msg: String, label: String, endpoint: String, values: [String:Any?], vc: UIViewController) {
    let activityData = ActivityData(message: msg, type: .lineScaleParty)
    NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
    
    DispatchQueue(label: label).async {
        let urlString = API.base.rawValue+API.v1.rawValue+API.user.rawValue+endpoint
        Alamofire.request(urlString, method: .post, parameters: values, encoding: JSONEncoding(options: [])).responseJSON { (response) in
            let obj = JSON(response.result.value)
            print("***** API results *****")
            print(obj)
            print("***** API results *****")
            
            if IsHTTPStatus(statusCode: response.response?.statusCode) {
                let keychain = Keychain()
                try! keychain.set(values["username"] as! String, key: "username")
                try! keychain.set(values["password"] as! String, key: "password")
                try! keychain.set(obj["id"].stringValue, key: "id")
                
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                
                let storyboard = UIStoryboard(name: "Main", bundle: nil)
                let mainVC = storyboard.instantiateViewController(withIdentifier: "Main")
                vc.present(mainVC, animated: true, completion: nil)
            }else {
                let popup = PopupDialog(title: "Error", message: obj.arrayValue[0].stringValue)
                let button = DefaultButton(title: "OK", dismissOnTap: true) {}
                popup.addButtons([button])
        
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                vc.present(popup, animated: true, completion: nil)
            }
        }
    }
}
