//
//  MovieAddSearchViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/27.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

class MovieAddSearchViewController: UIViewController, UISearchBarDelegate {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let searchBar = UISearchBar()
        searchBar.delegate = self
        searchBar.placeholder = "追加する映画のタイトルで検索"
        
        self.navigationItem.titleView = searchBar
        self.view.backgroundColor = UIColor.white
    }
    
    func searchBarSearchButtonClicked(_ searchBar: UISearchBar) {
        searchBar.resignFirstResponder()
        CallMovieSearchAPI()
    }
    
    func CallMovieSearchAPI() {
        //TODO: get request
        //TODO: create table
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
