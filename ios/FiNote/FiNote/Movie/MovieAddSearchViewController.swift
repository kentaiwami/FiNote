//
//  MovieAddSearchViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/27.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import KeychainAccess
import NVActivityIndicatorView
import SwiftyJSON
import Alamofire

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
        CallMovieSearchAPI(text: searchBar.text!)
    }
    
    func CallMovieSearchAPI(text: String) {
        let api_key = GetTMDBAPIKey()
        let keychain = Keychain()
        let adult = (try! keychain.getString("adult"))!
        let urlString = API.tmdb_search.rawValue+"?query="+text+"&api_key="+api_key+"&language=ja"+"&include_adult="+adult
        let encURL = (NSURL(string:urlString.addingPercentEncoding(withAllowedCharacters: NSCharacterSet.urlQueryAllowed)!)?.absoluteString)!
        let activityData = ActivityData(message: "Search Movie", type: .lineScaleParty)
        
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "search-tmdb-movie").async {
            Alamofire.request(encURL, method: .get).responseJSON { (response) in
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    print("OK")
                }else {
                    ShowStandardAlert(title: "Error", msg: obj["status_message"].stringValue, vc: self)
                }
            }
        }
        //TODO: create table
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
