//
//  UserViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/28.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import Eureka
import KeychainAccess

class UserViewController: FormViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.isScrollEnabled = false
        
        CreateForm()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        self.tabBarController?.navigationItem.title = "User"
        self.tabBarController?.navigationItem.setRightBarButton(nil, animated: false)
    }
    
    func CreateForm() {
        UIView.setAnimationsEnabled(false)
        
        let keychain = Keychain()
        
        form +++ Section(header: "ユーザ情報", footer: "")
            <<< TextRow() {
                $0.title = "ユーザ名"
                $0.value = (try! keychain.get("username"))!
                $0.disabled = true
            }
            
            <<< ButtonRow("") {
                let vc = UserDetailFormViewController()
                vc.SetAPIName(name: "password")
                
                $0.title = "パスワードの変更"
                $0.presentationMode = .show(controllerProvider: ControllerProvider.callback {return vc}, onDismiss: {vc in vc.navigationController?.popViewController(animated: true)})
                $0.tag = "password"
            }
            
            <<< ButtonRow("") {
                let vc = UserDetailFormViewController()
                vc.SetAPIName(name: "email")
                
                $0.title = "メールアドレスの変更"
                $0.presentationMode = .show(controllerProvider: ControllerProvider.callback {return vc}, onDismiss: {vc in vc.navigationController?.popViewController(animated: true)})
            }
            
            //TODO: 変更が完了した時にAPI叩く
            <<< PickerInputRow<Int>(""){
                $0.title = "BirthYear"
                $0.value = Int((try! keychain.get("birthyear"))!)
                $0.options = GetBirthYears()
                $0.tag = "birthyear"
            }
        
        UIView.setAnimationsEnabled(true)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
