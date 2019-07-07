//
//  SignUpViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/21.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import Eureka


class SignUpViewController: FormViewController {

    fileprivate let utility = Utility()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.CreateForm()
        self.tableView.isScrollEnabled = false
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.tabBarController?.navigationItem.title = "Sign Up"
    }
    
    func CreateForm() {
        LabelRow.defaultCellUpdate = { cell, row in
            cell.contentView.backgroundColor = .red
            cell.textLabel?.textColor = .white
            cell.textLabel?.font = UIFont.boldSystemFont(ofSize: 13)
            cell.textLabel?.textAlignment = .right
        }
        
        let birthyears = utility.getBirthYears()

        
        form +++ Section(header: "ユーザ情報", footer: "Birth Yearは必須ではありません。ただし年代別ランキングを閲覧することができなくなります。この設定は後から変更することができます。")
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
        
        
            <<< TextRow(){
                $0.title = "Email"
                $0.value = ""
                $0.add(rule: RuleRequired(msg: "必須項目です"))
                $0.add(rule: RuleRegExp(regExpr: "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}", allowsEmpty: false, msg: "メールアドレスの形式を再確認してください"))
                $0.validationOptions = .validatesOnChange
                $0.tag = "email"
            }
            .onRowValidationChanged {cell, row in
                self.utility.showRowError(row: row)
            }
            
            
            <<< PickerInputRow<String>(""){
                $0.title = "BirthYear"
                $0.value = birthyears[0]
                $0.options = birthyears
                $0.tag = "birthyear"
            }
        
        
        form +++ Section(header: "", footer: "他サービスで使用しているユーザ名、パスワードは使用しないでください")
            <<< ButtonRow(){
                $0.title = "Sign Up"
                $0.baseCell.backgroundColor = UIColor.hex(Color.main.rawValue, alpha: 1.0)
                $0.baseCell.tintColor = UIColor.white
            }
            .onCellSelection {  cell, row in
                if self.utility.isCheckFormValue(form: self.form) {
                    var param = [
                        "username": self.form.values()["username"] as! String,
                        "password": self.form.values()["password"] as! String,
                        "email": self.form.values()["email"] as! String,
                        ] as [String : Any]
                    
                    let tmp_birthyear = self.form.values()["birthyear"] as! String
                    if let birthyear = Int(tmp_birthyear) {
                        param["birthyear"] = birthyear
                    }
                    
                    SignCommon().CallSignAPI(msg: "Sign Up Now", label: "sign-up", endpoint: API.signup.rawValue, values: param, vc: self)
                }else {
                    self.utility.showStandardAlert(title: "Sign Up Error", msg: "必須項目を入力してください", vc: self)
                }
            }
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
