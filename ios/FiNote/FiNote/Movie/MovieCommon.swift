//
//  MovieCommon.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/28.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

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
