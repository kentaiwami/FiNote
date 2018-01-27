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
import PromiseKit

class MovieAddSearchViewController: UIViewController, UISearchBarDelegate {

    let searchBar = UISearchBar()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        searchBar.delegate = self
        searchBar.placeholder = "追加する映画のタイトルで検索"
        
        self.navigationItem.titleView = searchBar
        self.view.backgroundColor = UIColor.white
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        searchBar.becomeFirstResponder()
    }
    
    func searchBarSearchButtonClicked(_ searchBar: UISearchBar) {
        searchBar.resignFirstResponder()
        RunSearch(text: searchBar.text!)
    }
    
    func RunSearch(text: String) {
        var ja_results: [MovieAddSearchResult.Data] = []
        var en_results: [MovieAddSearchResult.Data] = []
        let activityData = ActivityData(message: "Search Movie", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        CallMovieSearchAPI(text: text, language: "ja").then { results -> Promise<[MovieAddSearchResult.Data]> in
            ja_results = results
            return self.CallMovieSearchAPI(text: text, language: "en")
            
            }.then { results -> Void in
                en_results = results
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
            }.catch { err in
                let tmp_err = err as NSError
                ShowStandardAlert(title: "Error", msg: tmp_err.domain, vc: self)
        }
    }
    
    func CallMovieSearchAPI(text: String, language: String) -> Promise<[MovieAddSearchResult.Data]>{
        
        let promise = Promise<[MovieAddSearchResult.Data]> { (resolve, reject) in
            let adult = (try! Keychain().getString("adult"))!
            let urlString = API.tmdb_search.rawValue+"?query=\(text)&api_key=\(GetTMDBAPIKey())&language=\(language)&include_adult=\(adult)"
            let encURL = (NSURL(string:urlString.addingPercentEncoding(withAllowedCharacters: NSCharacterSet.urlQueryAllowed)!)?.absoluteString)!
            
            DispatchQueue(label: "search-tmdb-movie").async {
                Alamofire.request(encURL, method: .get).responseJSON { (response) in
                    guard let res = response.result.value else{return}
                    let obj = JSON(res)
                    print("***** API results *****")
                    print(obj)
                    print("***** API results *****")
    
                    if IsHTTPStatus(statusCode: response.response?.statusCode) {
                        var tmp_results: [MovieAddSearchResult.Data] = []
                        for data in obj["results"].arrayValue {
                            tmp_results.append(MovieAddSearchResult().GetData(json: data))
                        }
                        resolve(tmp_results)
                    }else {
                        reject(NSError(domain: obj["status_message"].stringValue, code: -1))
                    }
                }
            }
        }
        
        return promise
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
