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
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let vc = SocialRecentlyViewController()
        vc_view = vc.view
        self.addChildViewController(vc)
        self.view.addSubview(vc_view)
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
            self.vc_view.removeFromSuperview()
            
            let vc = SocialRecentlyViewController()
            self.vc_view = vc.view
            self.addChildViewController(vc)
            self.view.addSubview(self.vc_view)
        }
        let byage = DefaultButton(title: "By Age") {
            self.vc_view.removeFromSuperview()
            
            let vc = MoviesViewController()
            self.vc_view = vc.view
            self.addChildViewController(vc)
            self.view.addSubview(self.vc_view)
            print("by age")
        }
        let contain = DefaultButton(title: "Contain") {
            print("Contain")
        }
        let comparison = DefaultButton(title: "Comparison") {
            print("Comparison")
        }
        
        let popup = PopupDialog(title: "画面切り替え", message: "hogehoge")
        popup.addButtons([recently, byage, contain, comparison, cancel])
        self.present(popup, animated: true, completion: nil)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
