//
//  Utility.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/21.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import Eureka
import PopupDialog

func GetAppDelegate() -> AppDelegate {
    return UIApplication.shared.delegate as! AppDelegate
}


func GetBirthYears() -> [Int] {
    let date = Date()
    let calendar = Calendar.current
    let year = calendar.component(.year, from: date)
    return [Int](year-59...year).reversed()
}

func IsCheckFormValue(form: Form) -> Bool {
    var err_count = 0
    for row in form.allRows {
        err_count += row.validate().count
    }
    
    if err_count == 0 {
        return true
    }
    
    return false
}

func IsHTTPStatus(statusCode: Int?) -> Bool {
    // 200系以外ならエラー
    let code = String(statusCode!)
    var results:[String] = []
    
    if code.pregMatche(pattern: "2..", matches: &results) {
        return true
    }else {
        return false
    }
}

func ShowStandardAlert(title: String, msg: String, vc: UIViewController) {
    let button = DefaultButton(title: "OK", dismissOnTap: true) {}
    let popup = PopupDialog(title: title, message: msg)
    popup.transitionStyle = .zoomIn
    popup.addButtons([button])
    vc.present(popup, animated: true, completion: nil)
}

class Indicator {
    let indicator = UIActivityIndicatorView()
    
    func showIndicator(view: UIView) {
        indicator.activityIndicatorViewStyle = .whiteLarge
        indicator.center = view.center
        indicator.color = UIColor.gray
        indicator.hidesWhenStopped = true
        view.addSubview(indicator)
        view.bringSubview(toFront: indicator)
        indicator.startAnimating()
    }
    
    func stopIndicator() {
        self.indicator.stopAnimating()
    }
}
