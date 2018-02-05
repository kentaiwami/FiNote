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
import NVActivityIndicatorView
import Alamofire
import SwiftyJSON
import PopupDialog


class UserDetailFormViewController: FormViewController {

    var api_name = ""
    var screen_title = ""
    
    let keychain = Keychain()
    var username = ""
    var password = ""
    var email = ""
    var birthyear = ""
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        LabelRow.defaultCellUpdate = { cell, row in
            cell.contentView.backgroundColor = .red
            cell.textLabel?.textColor = .white
            cell.textLabel?.font = UIFont.boldSystemFont(ofSize: 13)
            cell.textLabel?.textAlignment = .right
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        username = (try! keychain.get("username"))!
        password = (try! keychain.get("password"))!
        email = (try! keychain.get("email"))!
        birthyear = (try! keychain.get("birthyear"))!
        
        Create()
        
        self.navigationItem.title = screen_title
        let check = UIBarButtonItem(image: UIImage(named: "icon_check"), style: .plain, target: self, action: #selector(TapCheckButton))
        self.navigationItem.setRightBarButton(check, animated: true)
    }
    
    func TapCheckButton() {
        var err = 0
        for row in form.allRows {
            err += row.validate().count
        }
        
        if err == 0 {
            CallUpdateAPI()
        }else {
            ShowStandardAlert(title: "Error", msg: "入力を再確認してください", vc: self)
        }
    }
    
    func GetParamsURL() -> (params:[String:Any], url: String) {
        let base = API.base.rawValue+API.v1.rawValue+API.user.rawValue+API.update.rawValue
        switch api_name {
        case "password":
            return ([
                "username": username,
                "now_password": form.values()["now_pass"] as! String,
                "new_password": form.values()["new_pass"] as! String
            ], base+API.password.rawValue)
        case "email":
            return ([
                "username": username,
                "password": form.values()["now_pass"] as! String,
                "new_email": form.values()["new_email"] as! String
            ], base+API.email.rawValue)
        case "birthyear":
            // formに値が設定されている場合はIntへ変換して代入
            var birthyear_tmp: Int? = nil
            if form.values()["birthyear"]! != nil {
                birthyear_tmp = (form.values()["birthyear"] as! Int)
            }
            
            return ([
                "username": username,
                "password": form.values()["now_pass"] as! String,
                "birthyear": birthyear_tmp
            ], base+API.birthyear.rawValue)
        default:
            return ([:], "")
        }
    }
    
    func CallUpdateAPI() {
        let params_url = GetParamsURL()
        let activityData = ActivityData(message: "Updating", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "update-user-info").async {
            Alamofire.request(params_url.url, method: .post, parameters: params_url.params, encoding: JSONEncoding.default).responseJSON { (response) in
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    // 対象となるキーが含まれている場合のみ値を更新
                    if self.form.values()["new_pass"] != nil {
                        try! self.keychain.set(self.form.values()["new_pass"] as! String, key: "password")
                    }
                    
                    if self.form.values()["new_email"] != nil {
                        try! self.keychain.set(self.form.values()["new_email"] as! String, key: "email")
                    }
                    
                    /*
                     formにbirthyearがあるかどうかをはじめにチェック
                     その後、birthyearの値がnilかどうかをチェック
                     */
                    if self.form.values()["birthyear"] != nil {
                        if self.form.values()["birthyear"]! != nil {
                            let tmp = self.form.values()["birthyear"] as! Int
                            try! self.keychain.set(String(tmp), key: "birthyear")
                        }else {
                            try! self.keychain.set("", key: "birthyear")
                        }
                    }
                    
                    // 成功時のポップアップ
                    let ok = DefaultButton(title: "OK", action: {
                        self.navigationController?.popViewController(animated: true)
                    })
                    let popup = PopupDialog(title: "Success", message: "情報を更新しました")
                    popup.transitionStyle = .zoomIn
                    popup.addButtons([ok])
                    self.present(popup, animated: true, completion: nil)
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
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
            section.append(CreateTextRow(title: "現在のアドレス", value: email, tag: "now_email", disabled: true))
            section.append(CreatePassWordRow(title: "パスワード", tag: "now_pass"))
            section.append(CreateTextRow(title: "新しいアドレス", tag: "new_email", disabled: false))
        case "birthyear":
            screen_title = "Edit birthyear"
            section.append(CreatePassWordRow(title: "パスワード", tag: "now_pass"))
            section.append(CreatePickerInputRow(value: birthyear))
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
        row.onRowValidationChanged { cell, row in
            let rowIndex = row.indexPath!.row
            while row.section!.count > rowIndex + 1 && row.section?[rowIndex  + 1] is LabelRow {
                row.section?.remove(at: rowIndex + 1)
            }
            if !row.isValid {
                for (index, err) in row.validationErrors.map({ $0.msg }).enumerated() {
                    let labelRow = LabelRow() {
                        $0.title = err
                        $0.cell.height = { 30 }
                    }
                    row.section?.insert(labelRow, at: row.indexPath!.row + index + 1)
                }
            }
        }
        
        return row
    }
    
    func CreateTextRow(title: String, value: String="", tag: String, disabled: Condition) -> TextRow {
        let row = TextRow()
        row.title = title
        row.value = value
        row.disabled = disabled
        row.add(rule: RuleRegExp(regExpr: "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}", allowsEmpty: false, msg: "メールアドレスの形式を再確認してください"))
        row.validationOptions = .validatesOnChange
        row.tag = tag
        row.onRowValidationChanged { cell, row in
            let rowIndex = row.indexPath!.row
            while row.section!.count > rowIndex + 1 && row.section?[rowIndex  + 1] is LabelRow {
                row.section?.remove(at: rowIndex + 1)
            }
            if !row.isValid {
                for (index, err) in row.validationErrors.map({ $0.msg }).enumerated() {
                    let labelRow = LabelRow() {
                        $0.title = err
                        $0.cell.height = { 30 }
                    }
                    row.section?.insert(labelRow, at: row.indexPath!.row + index + 1)
                }
            }
        }
        
        return row
    }
    
    func CreatePickerInputRow(value: String?) -> PickerInputRow<String> {
        let row = PickerInputRow<String>()
        row.title = "BirthYear"
        row.value = value
        row.options = GetBirthYears()
        row.tag = "birthyear"
        return row
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
