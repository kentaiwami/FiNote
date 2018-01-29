//
//  SocialViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/29.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import PopupDialog

class SocialViewController: UIViewController {

    var vc_view: UIView!
    var vc: UIViewController!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        SetUpView(vc: SocialRecentlyViewController(), isRemove: false)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        self.tabBarController?.navigationItem.title = "Social"
        let menu = UIBarButtonItem(image: UIImage(named: "icon_menu"), style: .plain, target: self, action: #selector(TapMenuButton))
        self.tabBarController?.navigationItem.setRightBarButton(menu, animated: true)
    }
    
    func TapMenuButton() {
        let cancel = CancelButton(title: "Cancel", action: nil)
        let recently = DefaultButton(title: "Recently") {
            self.SetUpView(vc: SocialRecentlyViewController(), isRemove: true)
        }
        let byage = DefaultButton(title: "By Age") {
            self.SetUpView(vc: SocialByAgeViewController(), isRemove: true)
        }
        let contain = DefaultButton(title: "Contain") {
            self.SetUpView(vc: SocialContainViewController(), isRemove: true)
        }
        let comparison = DefaultButton(title: "Comparison") {
            self.SetUpView(vc: SocialComparisonViewController(), isRemove: true)
        }
        
        let popup = PopupDialog(title: "画面切り替え", message: "hogehoge")
        let class_name = vc.GetClassName()
        switch class_name {
        case "SocialRecentlyViewController":
            popup.addButtons([byage, contain, comparison, cancel])
        case "SocialByAgeViewController":
            popup.addButtons([recently, contain, comparison, cancel])
        case "SocialContainViewController":
            popup.addButtons([recently, byage, comparison, cancel])
        case "SocialComparisonViewController":
            popup.addButtons([recently, byage, contain, cancel])
        default:
            popup.addButtons([cancel])
        }
        
        self.present(popup, animated: true, completion: nil)
    }
    
    func SetUpView(vc: UIViewController, isRemove: Bool) {
        if isRemove {
            self.vc_view.removeFromSuperview()
        }
        
        self.vc = vc
        self.vc_view = self.vc.view
        self.addChildViewController(self.vc)
        self.view.addSubview(self.vc_view)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
