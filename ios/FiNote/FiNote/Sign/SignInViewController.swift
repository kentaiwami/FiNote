//
//  SignInViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/21.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import Eureka


class SignInViewController: FormViewController {

    fileprivate let utility = Utility()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.CreateForm()
        self.tableView.isScrollEnabled = false
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.tabBarController?.navigationItem.title = "Sign In"
    }
    
    func CreateForm() {
        LabelRow.defaultCellUpdate = { cell, row in
            cell.contentView.backgroundColor = .red
            cell.textLabel?.textColor = .white
            cell.textLabel?.font = UIFont.boldSystemFont(ofSize: 13)
            cell.textLabel?.textAlignment = .right
        }
            
        form +++ Section("ユーザ情報")
            <<< TextRow(){
                $0.title = "UserName"
                $0.value = ""
                $0.add(rule: RuleRequired(msg: "必須項目です"))
                $0.validationOptions = .validatesOnChange
                $0.tag = "username"
            }
            .onRowValidationChanged {cell, row in
                self.utility.showRowError(row: row)
            }
                
            <<< PasswordRow(){
                $0.title = "Password"
                $0.value = ""
                $0.add(rule: RuleRequired(msg: "必須項目です"))
                $0.validationOptions = .validatesOnChange
                $0.tag = "password"
            }
            .onRowValidationChanged {cell, row in
                self.utility.showRowError(row: row)
            }
        
        
        form +++ Section(header: "", footer: "")
            <<< ButtonRow(){
                $0.title = "Sign In"
                $0.baseCell.backgroundColor = UIColor.hex(Color.main.rawValue, alpha: 1.0)
                $0.baseCell.tintColor = UIColor.white
                $0.tag = "signin"
            }
            .onCellSelection {  cell, row in
                if self.utility.isCheckFormValue(form: self.form) {
                    SignCommon().CallSignAPI(msg: "Sign In Now", label: "sign-in", endpoint: API.signin.rawValue, values: self.form.values() as [String : Any], vc: self)
                }else {
                    self.utility.showStandardAlert(title: "Sign In Error", msg: "必須項目を入力してください", vc: self)
                }
            }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
