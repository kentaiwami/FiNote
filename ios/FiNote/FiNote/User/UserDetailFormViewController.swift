//
//  UserDetailFormViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/28.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

class UserDetailFormViewController: UIViewController {

    var api_name = ""
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.navigationItem.title = "Edit Info"
        let check = UIBarButtonItem(image: UIImage(named: "icon_check"), style: .plain, target: self, action: #selector(TapCheckButton))
        self.navigationItem.setRightBarButton(check, animated: true)
    }
    
    func TapCheckButton() {
        
    }
    
    func CallUpdateAPI() {
        
    }
    
    func CreateForm() {
        
    }
    
    func SetAPIName(name: String) {
        api_name = name
    }
    
    func CreatePassWordRow() {
        
    }
    
    func CreateTextRow() {
        
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
