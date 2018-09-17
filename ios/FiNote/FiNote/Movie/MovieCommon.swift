//
//  MovieCommon.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/28.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import NVActivityIndicatorView
import Alamofire
import SwiftyJSON


class MovieCommon {
    func GetChoosingOnomatopoeia(values: [String:Any?]) -> [String] {
        // オノマトペとタグ番号の辞書を生成
        var choosing: [String:Int] = [:]
        for dict in values {
            var tmp_matches: [String] = []
            if dict.key.pregMatche(pattern: "onomatopoeia_([0-9]+)", matches: &tmp_matches) {
                choosing[dict.value as! String] = Int(tmp_matches[1])!
            }
        }
        
        // タグ番号の昇順でオノマトペを返す
        return choosing.sorted(by: {$0.value < $1.value}).map({$0.key})
    }
    
    func GetOnomatopoeiaNewChoices(ignore: String = "", values: [String:Any?], choices: [String]) -> [String] {
        var new_choices = choices
        
        // 選択済みのオノマトペ名を選択肢配列から削除
        for name in GetChoosingOnomatopoeia(values: values) {
            let index = new_choices.index(of: name)
            
            // ignoreと同じ場合は候補から削除しない
            if index != nil && name != ignore {
                new_choices.remove(at: index!.advanced(by: 0))
            }
        }
        
        return new_choices
    }
    
    func CallGetOnomatopoeiaAPI(act: @escaping (JSON) -> Void, vc: UIViewController) {
        let urlString = API.base.rawValue+API.v1.rawValue+API.onomatopoeia.rawValue+API.choice.rawValue
        let activityData = ActivityData(message: "Get Onomatopoeia", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData, nil)
        
        DispatchQueue(label: "get-onomatopoeia").async {
            Alamofire.request(urlString, method: .get).responseJSON { (response) in
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating(nil)
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    act(obj)
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: vc)
                }
            }
        }
    }
}
