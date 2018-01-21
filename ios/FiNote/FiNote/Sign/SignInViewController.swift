//
//  SignInViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/21.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import Eureka

class SignInViewController: FormViewController {

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
                
            <<< PasswordRow(){
                $0.title = "Password"
                $0.value = ""
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
        
        
        form +++ Section(header: "", footer: "")
            <<< ButtonRow(){
                $0.title = "Sign In"
                $0.baseCell.backgroundColor = UIColor.hex(Color.main.rawValue, alpha: 1.0)
                $0.baseCell.tintColor = UIColor.white
                $0.tag = "signin"
            }
            .onCellSelection {  cell, row in
                print("TAP")
            }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
