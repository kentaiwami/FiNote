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
    
    @objc func TapMenuButton() {
        let recently_title = "人気ランキング"
        let byage_title = "年代別ランキング"
        let contain_title = "オノマトペで検索"
        let comparison_title = "オノマトペの比較"
        
        let cancel = CancelButton(title: "Cancel", action: nil)
        let recently = DefaultButton(title: recently_title) {
            self.SetUpView(vc: SocialRecentlyViewController())
        }
        let byage = DefaultButton(title: byage_title) {
            self.SetUpView(vc: SocialByAgeViewController())
        }
        let contain = DefaultButton(title: contain_title) {
            self.SetUpView(vc: SocialContainViewController())
        }
        let comparison = DefaultButton(title: comparison_title) {
            self.SetUpView(vc: SocialComparisonViewController())
        }
        
        let recently_msg = "「\(recently_title)」では1週間で追加されたユーザ数が多い順に最近話題になっている映画を確認することができます。"
        let byage_msg = "「\(byage_title)」では10代〜50代で人気のある映画をランキングで見ることができます。"
        let contain_msg = "「\(contain_title)」は検索ワードに入れたオノマトペを含む映画を見つけることができます。"
        let comparison_msg = "「\(comparison_title)」ではあなたが登録した映画に付けたオノマトペと他の人がどのようなオノマトペを追加しているのかを見ることができます。"
        var dynamic_msg = ""
        var popup_buttons: [PopupDialogButton] = []
        
        switch vc.GetClassName() {
        case "SocialRecentlyViewController":
            dynamic_msg = byage_msg + "\n\n" + contain_msg + "\n\n" + comparison_msg
            popup_buttons = [byage, contain, comparison, cancel]
        case "SocialByAgeViewController":
            dynamic_msg = recently_msg + "\n\n" + contain_msg + "\n\n" + comparison_msg
            popup_buttons = [recently, contain, comparison, cancel]
        case "SocialContainViewController":
            dynamic_msg = recently_msg + "\n\n" + byage_msg + "\n\n" + comparison_msg
            popup_buttons = [recently, byage, comparison, cancel]
        case "SocialComparisonViewController":
            dynamic_msg = recently_msg + "\n\n" + byage_msg + "\n\n" + contain_msg
            popup_buttons = [recently, byage, contain, cancel]
        default:
            popup_buttons = [cancel]
        }
        
        let popup = PopupDialog(title: "画面の切り替え", message: dynamic_msg)
        popup.addButtons(popup_buttons)
        self.present(popup, animated: true, completion: nil)
    }
    
    func SetUpView(vc: UIViewController, isRemove: Bool=true) {
        if isRemove {
            let lastVC = self.children.last!
            lastVC.view.removeFromSuperview()
            lastVC.removeFromParent()
        }
        
        self.vc = vc
        self.vc.view.frame = self.view.bounds
        self.addChild(self.vc)
        self.view.addSubview(self.vc.view)
        vc.didMove(toParent: self)        
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
