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
import PopupDialog

class UserViewController: FormViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.isScrollEnabled = false
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        self.tabBarController?.navigationItem.title = "User"
        let check = UIBarButtonItem(image: UIImage(named: "icon_check"), style: .plain, target: self, action: #selector(TapCheckButton))
        self.tabBarController?.navigationItem.setRightBarButton(check, animated: true)
        
        CreateForm()
    }
    
    func TapCheckButton() {
        var err_count = 0
        for row in form.allRows {
            err_count += row.validate().count
        }
        
        if err_count == 0 {
            CallUserInfoUpdateAPI()
        }else {
            ShowStandardAlert(title: "Error", msg: "入力されていない項目があります", vc: self)
        }
    }
    
    func CallUserInfoUpdateAPI() {
        //TODO: 実装
    }
    
    func CreateForm() {
        LabelRow.defaultCellUpdate = { cell, row in
            cell.contentView.backgroundColor = .red
            cell.textLabel?.textColor = .white
            cell.textLabel?.font = UIFont.boldSystemFont(ofSize: 13)
            cell.textLabel?.textAlignment = .right
        }

        let keychain = Keychain()
        let birthyears = GetBirthYears()
        
        UIView.setAnimationsEnabled(false)
        form.removeAll()
        
        form +++ Section(header: "ユーザ情報", footer: "右上のチェックボタンをタップして更新を反映させてください")
            <<< TextRow(){
                $0.title = "UserName"
                $0.value = (try! keychain.getString("username"))!
                $0.disabled = true
            }
            
            <<< PasswordRow(){
                $0.title = "Password"
                $0.value = (try! keychain.getString("password"))!
                $0.add(rule: RuleRequired(msg: "必須項目です"))
                $0.validationOptions = .validatesOnChange
                $0.tag = "password"
            }
            .onRowValidationChanged {cell, row in
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
            
            
            <<< TextRow(){
                $0.title = "Email"
                $0.value = (try! keychain.getString("email"))!
                $0.add(rule: RuleRequired(msg: "必須項目です"))
                $0.add(rule: RuleRegExp(regExpr: "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}", allowsEmpty: false, msg: "メールアドレスの形式を再確認してください"))
                $0.validationOptions = .validatesOnChange
                $0.tag = "email"
            }
            .onRowValidationChanged {cell, row in
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
            
            
            <<< PickerInputRow<Int>(""){
                $0.title = "BirthYear"
                $0.value = Int((try! keychain.getString("birthyear"))!)
                $0.options = birthyears
                $0.add(rule: RuleRequired(msg: "必須項目です"))
                $0.validationOptions = .validatesOnChange
                $0.tag = "birthyear"
            }
            .onRowValidationChanged {cell, row in
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
        
        UIView.setAnimationsEnabled(true)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
