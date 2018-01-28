//
//  UserDetailFormViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/28.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import Eureka
import KeychainAccess

class UserDetailFormViewController: FormViewController {

    var api_name = ""
    var screen_title = ""
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        Create()
        
        self.navigationItem.title = screen_title
        let check = UIBarButtonItem(image: UIImage(named: "icon_check"), style: .plain, target: self, action: #selector(TapCheckButton))
        self.navigationItem.setRightBarButton(check, animated: true)
    }
    
    func TapCheckButton() {
        
    }
    
    func CallUpdateAPI() {
        
    }
    
    func Create() {
        UIView.setAnimationsEnabled(false)
        form.removeAll()
        
        let section = Section("")
        
        switch api_name {
        case "password":
            screen_title = "Edit Password"
            section.append(CreatePassWordRow(title: "現在のパスワード", tag: "now_pass"))
            section.append(CreatePassWordRow(title: "新しいパスワード", tag: "new_pass"))
        case "email":
            screen_title = "Edit Email"
        case "birthyear":
            screen_title = "Edit birthyear"
        default:
            screen_title = ""
            break
        }
        
        form.append(section)
        
        UIView.setAnimationsEnabled(true)
    }
    
    func SetAPIName(name: String) {
        api_name = name
    }
    
    func CreatePassWordRow(title: String, tag: String) -> PasswordRow {
        let row = PasswordRow()
        row.title = title
        row.value = ""
        row.add(rule: RuleRequired(msg: "必須項目です"))
        row.validationOptions = .validatesOnChange
        row.tag = tag
        
        return row
    }
    
    func CreateTextRow() {
        
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
