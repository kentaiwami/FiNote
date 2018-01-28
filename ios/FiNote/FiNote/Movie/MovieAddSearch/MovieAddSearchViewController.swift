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
import StatusProvider
import TinyConstraints

class MovieAddSearchViewController: UIViewController, UISearchBarDelegate, UITableViewDelegate, UITableViewDataSource, StatusController {

    let searchBar = UISearchBar()
    var myTableView = UITableView()
    var search_results: [MovieAddSearchResult.Data] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        searchBar.delegate = self
        searchBar.placeholder = "映画のタイトルで検索"
        if #available(iOS 11.0, *) {
            searchBar.height(44)
        }
        
        self.navigationItem.titleView = searchBar
        self.view.backgroundColor = UIColor.white
    }
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        searchBar.resignFirstResponder()
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
                self.ShapeOverview(ja_results: ja_results, en_results: en_results)
                self.DrawView()
            }.catch { err in
                let tmp_err = err as NSError
                ShowStandardAlert(title: "Error", msg: tmp_err.domain, vc: self)
        }
    }
    
    func ShapeOverview(ja_results: [MovieAddSearchResult.Data], en_results: [MovieAddSearchResult.Data]) {
        var results: [MovieAddSearchResult.Data] = []
        
        // 日本語のoverviewが空の場合に、英語のoverviewを適用
        for (ja, en) in zip(ja_results, en_results) {
            var tmp = ja
            if tmp.overview == "" {
                tmp.overview = en.overview
            }
            results.append(tmp)
        }
        
        search_results = results
    }
    
    func DrawView() {
        myTableView.removeFromSuperview()
        myTableView = UITableView()
        
        if search_results.count == 0 {
            let status = Status(title: "No Results", description: "指定した検索ワードを含む映画は見つかりませんでした", actionTitle: "原題で検索", image: nil) {
                let origin_titlesVC = MovieAddSearchOriginTitlesViewController()
                origin_titlesVC.SetSearchTitle(title: self.searchBar.text!)
                let nav = UINavigationController()
                nav.viewControllers = [origin_titlesVC]
                
                self.present(nav, animated: true, completion: nil)
            }
            
            show(status: status)
        }else {
            let main_width = UIScreen.main.bounds.width
            let width = main_width * 0.2
            let height = width * 1.5
            
            myTableView = UITableView(frame: CGRect(x: 0, y: 0, width: self.view.frame.width, height: self.view.frame.height), style: .plain)
            myTableView.rowHeight = height
            myTableView.delegate = self
            myTableView.dataSource = self
            myTableView.register(MovieAddSearchCell.self, forCellReuseIdentifier: NSStringFromClass(MovieAddSearchCell.self))
            myTableView.autoresizingMask = UIViewAutoresizing(rawValue: UIViewAutoresizing.RawValue(UInt8(UIViewAutoresizing.flexibleHeight.rawValue) | UInt8(UIViewAutoresizing.flexibleWidth.rawValue)))
            self.view.addSubview(myTableView)
        }
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return search_results.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: NSStringFromClass(MovieAddSearchCell.self), for: indexPath) as! MovieAddSearchCell
        cell.accessoryType = .disclosureIndicator
        
        let urlRequest = URL(string: API.poster_base.rawValue+search_results[indexPath.row].poster)!

        cell.title.text = search_results[indexPath.row].title
        cell.overview.text = search_results[indexPath.row].overview
        cell.poster.af_setImage(
            withURL: urlRequest,
            placeholderImage: UIImage(named: "no_image")
        )
        cell.release_date.text = search_results[indexPath.row].release_date
        
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let detailVC = MovieAddSearchDetailViewController()
        detailVC.SetMovieID(searched_movie: search_results[indexPath.row])
        self.navigationController!.pushViewController(detailVC, animated: true)
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
