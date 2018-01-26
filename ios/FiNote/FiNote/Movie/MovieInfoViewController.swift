//
//  MovieInfoViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/26.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import Eureka

class MovieInfoViewController: FormViewController {

    var onomatopoeia: [String] = []
    var dvd = false
    var fav = false
    var count = 1
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationItem.title = "Edit Info"
        
        let close = UIBarButtonItem(image: UIImage(named: "icon_cancel"), style: .plain, target: self, action: #selector(TapCloseButton))
        let save = UIBarButtonItem(image: UIImage(named: "icon_check"), style: .plain, target: self, action: #selector(TapSaveButton))
        self.navigationItem.setLeftBarButton(close, animated: true)
        self.navigationItem.setRightBarButton(save, animated: true)
        
        CreateForm()
    }
    
    func TapCloseButton() {
        self.dismiss(animated: true, completion: nil)
    }
    
    func TapSaveButton() {
        //TODO: call update api
        
        print(form.values())
        
        print(form.values()["onomatopoeia"])
//        let nav = self.presentingViewController as! UINavigationController
//        let detailvc = nav.viewControllers.last!
//
//        detailvc.navigationController?.popViewController(animated: true)
//        self.dismiss(animated: true, completion: nil)
    }
    
    func SetOnomatopoeia(onomatopoeia: [String]) {
        self.onomatopoeia = onomatopoeia
    }
    
    func SetDVD(dvd: Bool) {
        self.dvd = dvd
    }
    
    func SetFAV(fav: Bool) {
        self.fav = fav
    }
    
    func CreateForm() {
        form +++ Section(header: "DVDの所持・お気に入り登録", footer: "")
            <<< SwitchRow("") { row in
                row.title = "DVD"
                row.value = dvd
                row.tag = "dvd"
            }
        
            <<< SwitchRow("") { row in
                row.title = "Favorite"
                row.value = fav
                row.tag = "fav"
            }
        
        
        form +++ MultivaluedSection(multivaluedOptions: [.Insert, .Delete],
                           header: "オノマトペの登録",
                           footer: "映画を観た気分を登録してください") {
                            $0.tag = "onomatopoeia"
                            $0.multivaluedRowToInsertAt = { _ in
                                return PickerInputRow<String>{
                                    $0.title = "タップして選ぶ..."
                                    $0.options = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"]
                                    $0.tag = "onomatopoeia_\(self.count)"
                                    self.count += 1
                                }
                            }
                            $0 <<< PickerInputRow<String> {
                                $0.title = "タップして選ぶ..."
                                $0.options = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"]
                                $0.tag = "onomatopoeia_0"
                            }
                            
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
