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
        
        LabelRow.defaultCellUpdate = { cell, row in
            cell.contentView.backgroundColor = .red
            cell.textLabel?.textColor = .white
            cell.textLabel?.font = UIFont.boldSystemFont(ofSize: 13)
            cell.textLabel?.textAlignment = .right
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
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
    
    func CallUpdateAPI() {
        //TODO: 実装
    }
    
    func Create() {
        UIView.setAnimationsEnabled(false)
        form.removeAll()
        
        let keychain = Keychain()
        let section = Section("")
        
        switch api_name {
        case "password":
            screen_title = "Edit Password"
            section.append(CreatePassWordRow(title: "現在のパスワード", tag: "now_pass"))
            section.append(CreatePassWordRow(title: "新しいパスワード", tag: "new_pass"))
        case "email":
            screen_title = "Edit Email"
            section.append(CreateTextRow(title: "現在のアドレス", value: (try! keychain.get("email"))!, tag: "now_email", disabled: true))
            section.append(CreatePassWordRow(title: "パスワード", tag: "now_pass"))
            section.append(CreateTextRow(title: "新しいアドレス", tag: "new_email", disabled: false))
        case "birthyear":
            screen_title = "Edit birthyear"
            section.append(CreatePickerInputRow(value: Int((try! keychain.get("birthyear"))!)!))
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
    
    func CreatePickerInputRow(value: Int) -> PickerInputRow<Int> {
        let row = PickerInputRow<Int>()
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
