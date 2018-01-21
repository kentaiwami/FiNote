//
//  API.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/22.
//  Copyright © 2018年 Kenta. All rights reserved.
//

enum API: String {
    case base = "https://kentaiwami.jp/FiNote/django.cgi/api/"
    case v1 = "v1/"
    case user = "user/"
    case signup = "signup/"
    case signin = "signin/"
    case update = "update/"
    case password = "password/"
    case email = "email/"
    case movie = "movie/"
    case movies = "movies/"
    case onomatopoeia = "onomatopoeia/"
    case delete = "delete/"
    case recently = "recently/"
    case byage = "byage/"
    case compare = "compare/"
    case contain = "contain/"
    case search = "search/"
    case titles = "titles/"
    case origin = "origin/"
}
