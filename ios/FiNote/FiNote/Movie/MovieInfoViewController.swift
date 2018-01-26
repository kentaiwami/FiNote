//
//  MovieInfoViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/26.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import Eureka
import NVActivityIndicatorView
import Alamofire
import SwiftyJSON

class MovieInfoViewController: FormViewController {

    var onomatopoeia: [String] = []
    var dvd = false
    var fav = false
    var count = 1
    var choices: [String] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationItem.title = "Edit Info"
        
        let close = UIBarButtonItem(image: UIImage(named: "icon_cancel"), style: .plain, target: self, action: #selector(TapCloseButton))
        let save = UIBarButtonItem(image: UIImage(named: "icon_check"), style: .plain, target: self, action: #selector(TapSaveButton))
        self.navigationItem.setLeftBarButton(close, animated: true)
        self.navigationItem.setRightBarButton(save, animated: true)
        
        CallGetOnomatopoeiaAPI()
    }
    
    func TapCloseButton() {
        self.dismiss(animated: true, completion: nil)
    }
    
    func TapSaveButton() {
        //TODO: call update api
        //TODO: update appdelegate
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
                                    //TODO: values()とchocesを比較して被りを削除
                                    
                                    $0.title = "タップして選ぶ..."
                                    $0.options = self.GetOnomatopoeiaFromFormValues()
                                    $0.tag = "onomatopoeia_\(self.count)"
                                    self.count += 1
                                }
                            }
                            $0 <<< PickerInputRow<String> {
                                $0.title = "タップして選ぶ..."
                                $0.options = self.GetOnomatopoeiaFromFormValues()
                                $0.tag = "onomatopoeia_0"
                            }
                            
        }
    }
    
    func CallGetOnomatopoeiaAPI() {
        let urlString = API.base.rawValue+API.v1.rawValue+API.onomatopoeia.rawValue+API.choice.rawValue
        let activityData = ActivityData(message: "Get Onomatopoeia", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "get-onomatopoeia").async {
            
            Alamofire.request(urlString, method: .get).responseJSON { (response) in
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    self.choices = obj["results"].arrayValue.map{$0.stringValue}
                    self.CreateForm()
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
    }
    
    func GetOnomatopoeiaFromFormValues() -> [String] {
        var choosing: [String] = []
        var new_choices = choices
        
        // 選択済みのオノマトペ名で配列を生成
        for dict in form.values() {
            if dict.value != nil && dict.key.contains("onomatopoeia_") {
                choosing.append(dict.value as! String)
            }
        }
        
        // 選択済みのオノマトペ名を選択肢配列から削除
        for name in choosing {
            let index = new_choices.index(of: name)
            
            if index != nil {
                new_choices.remove(at: index!.advanced(by: 0))
            }
        }
        
        return new_choices
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
