//
//  Utility.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/21.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

func GetStandardAlert(title: String, message: String, b_title: String) -> UIAlertController {
    let alertController = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    let ok = UIAlertAction(title: b_title, style:UIAlertActionStyle.default)
    
    alertController.addAction(ok)
    
    return alertController
}

func GetDestructiveCancelAlert(title: String, message: String, button_title: String, destructive_action: @escaping () -> Void) -> UIAlertController {
    let alertController = UIAlertController(title: title, message: message, preferredStyle: UIAlertControllerStyle.alert)
    
    let destructive = UIAlertAction(title: button_title, style: UIAlertActionStyle.destructive, handler:{(action: UIAlertAction!) -> Void in
        destructive_action()
    })
    let cancel = UIAlertAction(title: "Cancel", style: UIAlertActionStyle.cancel)
    
    alertController.addAction(destructive)
    alertController.addAction(cancel)
    
    return alertController
}


func GetAppDelegate() -> AppDelegate {
    return UIApplication.shared.delegate as! AppDelegate
}

