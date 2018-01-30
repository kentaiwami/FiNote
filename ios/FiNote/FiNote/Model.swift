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
        var id = 0
        var title = ""
        var poster = ""
        var onomatopoeia:[String] = []
    }
    
    func GetData(json: JSON) -> Data {
        var data = Data()
        let dateOnlyString = Date.stringFromString(string: json["add"].stringValue, formatIn: "yyyy-MM-dd'T'HH:mm:ss", formatOut: "yyyy-MM-dd")
        
        data.add = dateOnlyString
        data.id = json["id"].intValue
        data.title = json["title"].stringValue
        data.poster = json["poster"].stringValue
        data.onomatopoeia = json["onomatopoeia"].arrayValue.map{$0.stringValue}
        
        return data
    }
}

class Movie {
    struct Data {
        var add = ""
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
        data.title = json["title"].stringValue
        data.poster = json["poster"].stringValue
        data.onomatopoeia = json["onomatopoeia"].arrayValue.map{$0.stringValue}
        data.overview = json["overview"].stringValue
        data.dvd = json["dvd"].boolValue
        data.fav = json["fav"].boolValue
        
        return data
    }
}

class MovieAddSearchResult {
    struct Data {
        var id = 0
        var title = ""
        var poster = ""
        var overview = ""
        var genre:[Int] = []
        var release_date = ""
    }
    
    func GetData(json: JSON) -> Data {
        var data = Data()
        
        if json["title"].stringValue == "" {
            data.title = json["original_title"].stringValue
        }else {
            data.title = json["title"].stringValue
        }
        
        if json["poster_path"].stringValue == "" {
            data.poster = json["backdrop_path"].stringValue
        }else {
            data.poster = json["poster_path"].stringValue
        }
        
        data.id = json["id"].intValue
        data.overview = json["overview"].stringValue
        data.release_date = json["release_date"].stringValue
        data.genre = json["genre_ids"].arrayValue.map({$0.intValue})
        
        return data
    }
}

class MovieOriginTitleSearchResult {
    struct Data {
        var id = 0
        var title = ""
    }
    
    func GetData(json: JSON) -> Data {
        var data = Data()
        data.id = json["id"].intValue
        data.title = json["title"].stringValue
        
        return data
    }
}

class MovieBasic {
    struct Data {
        var title = ""
        var poster = ""
        var overview = ""
    }
    
    func GetData(json: JSON) -> Data {
        var data = Data()
        data.title = json["title"].stringValue
        data.poster = json["poster"].stringValue
        data.overview = json["overview"].stringValue
        
        return data
    }
}

class MovieByAge {
    struct Data {
        var title = ""
        var poster = ""
        var overview = ""
        var count = 0
    }
    
    func GetDataArray(json: [JSON]) -> [Data] {
        var tmp: [Data] = []
        
        for obj in json {
            var data = Data()
            data.title = obj["title"].stringValue
            data.poster = obj["poster"].stringValue
            data.overview = obj["overview"].stringValue
            data.count = obj["count"].intValue
            tmp.append(data)
        }
        
        return tmp
    }
}

