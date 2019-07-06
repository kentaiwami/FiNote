//
//  MovieAddSearchOriginTitlesViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/28.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import Alamofire
import SwiftyJSON
import NVActivityIndicatorView


class MovieAddSearchOriginTitlesViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {
    
    var search_title = ""
    var page = 1
    var results: [MovieOriginTitleSearchResult.Data] = []
    var isUpdating = false
    var hasNext = false
    var tableview = UITableView()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.navigationItem.title = "Titles"
        self.view.backgroundColor = UIColor.white
        let close = UIBarButtonItem(image: UIImage(named: "icon_cancel"), style: .plain, target: self, action: #selector(TapCloseButton))
        self.navigationItem.setLeftBarButton(close, animated: true)
        
        tableview = UITableView(frame: CGRect(x: 0, y: 0, width: self.view.frame.width, height: self.view.frame.height))
        tableview.delegate = self
        tableview.dataSource = self
        tableview.autoresizingMask = UIView.AutoresizingMask(rawValue: UIView.AutoresizingMask.RawValue(UInt8(UIView.AutoresizingMask.flexibleHeight.rawValue) | UInt8(UIView.AutoresizingMask.flexibleWidth.rawValue)))
        
        self.view.addSubview(tableview)
        
        CallOriginTitlesAPI()
    }
    
    @objc func TapCloseButton() {
        self.dismiss(animated: true, completion: nil)
    }
    
    func CallOriginTitlesAPI() {
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.search.rawValue+API.titles.rawValue+"?title=\(search_title)&page=\(page)"
        let encURL = (NSURL(string:urlString.addingPercentEncoding(withAllowedCharacters: NSCharacterSet.urlQueryAllowed)!)?.absoluteString)!
        let activityData = ActivityData(message: "Get Titles", type: .lineScaleParty)
        
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData, nil)
        
        DispatchQueue(label: "get-titles").async {
            Alamofire.request(encURL, method: .get).responseJSON { (response) in
                
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating(nil)
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    self.isUpdating = false
                    for data in obj["results"].arrayValue {
                        self.results.append(MovieOriginTitleSearchResult().GetData(json: data))
                    }
                    
                    if (self.results.count >= obj["total"].intValue) || obj["results"].arrayValue.count == 0 {
                        self.hasNext = false
                    }else {
                        self.hasNext = true
                    }
                    self.tableview.reloadData()
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
    }
    
    func CallGetOriginTitleAPI(id: Int) {
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.search.rawValue+API.origin.rawValue+"?id=\(id)"
        let encURL = (NSURL(string:urlString.addingPercentEncoding(withAllowedCharacters: NSCharacterSet.urlQueryAllowed)!)?.absoluteString)!
        let activityData = ActivityData(message: "Get Origin Title", type: .lineScaleParty)
        
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData, nil)
        
        DispatchQueue(label: "get-origin-title").async {
            Alamofire.request(encURL, method: .get).responseJSON { (response) in
                
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating(nil)
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    let nav = self.presentingViewController as! UINavigationController
                    let searchVC = nav.viewControllers.last! as! MovieAddSearchViewController
                    searchVC.searchBar.text = obj["title"].stringValue
                    searchVC.RunSearch(text: obj["title"].stringValue)
                    self.dismiss(animated: true, completion: nil)
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        CallGetOriginTitleAPI(id: results[indexPath.row].id)
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return results.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: UITableViewCell.CellStyle.default, reuseIdentifier: "myCell")
        cell.textLabel?.text = results[indexPath.row].title
        return cell
    }
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        if scrollView.contentOffset.y + scrollView.frame.size.height > scrollView.contentSize.height && scrollView.isDragging && !isUpdating {
            if hasNext {
                page += 1
                isUpdating = true
                CallOriginTitlesAPI()
            }
        }
    }
    
    func SetSearchTitle(title: String) {
        search_title = title
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
