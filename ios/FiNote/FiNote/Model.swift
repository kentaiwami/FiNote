//
//  Model.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/21.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import SwiftyJSON

class Movies {
    struct Data {
        var add = ""
        var id = ""
        var title = ""
        var poster = ""
        var onomatopoeia:[String] = []
    }
    
    func GetData(json: JSON) -> Data {
        var data = Data()
        let dateOnlyString = Date.stringFromString(string: json["add"].stringValue, formatIn: "yyyy-MM-dd'T'HH:mm:ss", formatOut: "yyyy-MM-dd")
        
        data.add = dateOnlyString
        data.id = json["id"].stringValue
        data.title = json["title"].stringValue
        data.poster = json["poster"].stringValue
        data.onomatopoeia = json["onomatopoeia"].arrayValue.map{$0.stringValue}
        
        return data
    }
}

class Movie {
    struct Data {
        var add = ""
        var id = ""
        var title = ""
        var poster = ""
        var onomatopoeia:[String] = []
        var overview = ""
        var dvd = false
        var fav = false
    }
    
    func GetData(json: JSON) -> Data {
        var data = Data()
        let dateOnlyString = Date.stringFromString(string: json["add"].stringValue, formatIn: "yyyy-MM-dd'T'HH:mm:ss", formatOut: "yyyy-MM-dd")
        
        data.add = dateOnlyString
        data.id = json["id"].stringValue
        data.title = json["title"].stringValue
        data.poster = json["poster"].stringValue
        data.onomatopoeia = json["onomatopoeia"].arrayValue.map{$0.stringValue}
        data.overview = json["overview"].stringValue
        data.dvd = json["dvd"].boolValue
        data.fav = json["fav"].boolValue
        
        return data
    }
}
