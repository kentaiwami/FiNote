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
import PopupDialog

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
                $0.tag = "email"
            }
            
            <<< ButtonRow("") {
                let vc = UserDetailFormViewController()
                vc.SetAPIName(name: "birthyear")
                
                $0.title = "誕生年の変更"
                $0.presentationMode = .show(controllerProvider: ControllerProvider.callback {return vc}, onDismiss: {vc in vc.navigationController?.popViewController(animated: true)})
                $0.tag = "birthyear"
            }
        
        form +++ Section()
            <<< ButtonRow(){
                $0.title = "Sign Out"
                $0.baseCell.backgroundColor = UIColor.hex(Color.red.rawValue, alpha: 1.0)
                $0.baseCell.tintColor = UIColor.white
                $0.tag = "sign_out"
            }
            .onCellSelection {  cell, row in
                let cancel = CancelButton(title: "Cancel", action: nil)
                let ok = DestructiveButton(title: "OK", action: {
                    let keychain = Keychain()
                    try! keychain.removeAll()
                    
                    let storyboard = UIStoryboard(name: "Main", bundle: nil)
                    let sign = storyboard.instantiateViewController(withIdentifier: "Sign")
                    sign.modalTransitionStyle = .flipHorizontal
                    self.present(sign, animated: true, completion: nil)
                })
                
                let popup = PopupDialog(title: "Sign Out", message: "サインアウトしますがよろしいですか？")
                popup.transitionStyle = .zoomIn
                popup.addButtons([ok, cancel])
                
                self.present(popup, animated: true, completion: nil)
            }

        UIView.setAnimationsEnabled(true)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
