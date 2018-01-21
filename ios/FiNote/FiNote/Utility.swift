//
//  Utility.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/21.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

func GetAppDelegate() -> AppDelegate {
    return UIApplication.shared.delegate as! AppDelegate
}


func GetBirthYears() -> [Int] {
    let date = Date()
    let calendar = Calendar.current
    let year = calendar.component(.year, from: date)
    return [Int](year-59...year).reversed()
}
