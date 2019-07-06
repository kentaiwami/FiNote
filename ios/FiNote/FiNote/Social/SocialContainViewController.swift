//
//  SocialContainViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/29.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import StatusProvider
import Alamofire
import NVActivityIndicatorView
import SwiftyJSON

class SocialContainViewController: UIViewController, UISearchBarDelegate, StatusController, UICollectionViewDelegate, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout, UITabBarControllerDelegate {
    
    let searchBar = UISearchBar()
    let cellId = "MyCell"
    var preViewName = "Social"
    var collectionView = UICollectionView(frame: CGRect(), collectionViewLayout: UICollectionViewLayout())
    var movies: [MovieBasic.Data] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        searchBar.delegate = self
        searchBar.placeholder = "オノマトペで検索"
        if #available(iOS 11.0, *) {
            searchBar.height(44)
        }
        
        self.view.backgroundColor = UIColor.white
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.tabBarController?.navigationItem.titleView = searchBar
        self.tabBarController?.delegate = self
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        self.tabBarController?.navigationItem.titleView = nil
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        searchBar.becomeFirstResponder()
    }
    
    func searchBarSearchButtonClicked(_ searchBar: UISearchBar) {
        searchBar.resignFirstResponder()
        RunSearch()
    }
    
    func RunSearch() {
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.onomatopoeia.rawValue+API.contain.rawValue+"?onomatopoeia=\(searchBar.text!)"
        let encURL = (NSURL(string:urlString.addingPercentEncoding(withAllowedCharacters: NSCharacterSet.urlQueryAllowed)!)?.absoluteString)!
        let activityData = ActivityData(message: "Searching", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData, nil)
        
        DispatchQueue(label: "search-contain").async {
            Alamofire.request(encURL, method: .get, encoding: JSONEncoding.default).responseJSON { (response) in
                
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating(nil)
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    self.movies.removeAll()
                    
                    for data in obj["results"].arrayValue {
                        self.movies.append(MovieBasic().GetData(json: data))
                    }
                    
                    self.DrawView()
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
    }
    
    func DrawView() {
        collectionView.removeFromSuperview()
        
        if movies.count == 0 {
            let status = Status(title: "No Results", description: "指定したオノマトペを含む映画は見つかりませんでした", actionTitle: "", image: nil)
            show(status: status)
        }else {
            InitScrollView()
        }
    }
    
    func InitScrollView() {
        let w = 150.0 as CGFloat
        let h = w*1.5 as CGFloat
        let margin = (self.view.frame.width - w*2) / 4
        
        let layout = UICollectionViewFlowLayout()
        layout.itemSize = CGSize(width: w, height: h)
        layout.minimumInteritemSpacing = margin
        layout.minimumLineSpacing = margin
        layout.sectionInset = UIEdgeInsets(top: margin, left: margin, bottom: margin, right: margin)
        
        collectionView = UICollectionView(frame: CGRect(x: 0, y: 0, width: self.view.frame.width, height: self.view.frame.height), collectionViewLayout: layout)
        collectionView.backgroundColor = UIColor.white
        collectionView.register(UICollectionViewCell.self, forCellWithReuseIdentifier: cellId)
        collectionView.delegate = self
        collectionView.dataSource = self
        collectionView.autoresizingMask = UIView.AutoresizingMask(rawValue: UIView.AutoresizingMask.RawValue(UInt8(UIView.AutoresizingMask.flexibleHeight.rawValue) | UInt8(UIView.AutoresizingMask.flexibleWidth.rawValue)))
        self.view.addSubview(collectionView)
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return movies.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: cellId, for: indexPath)
        
        for subview in cell.contentView.subviews {
            subview.removeFromSuperview()
        }
        
        let urlRequest = URL(string: API.poster_base.rawValue+movies[indexPath.row].poster)!
        let poster = UIImageView()
        poster.af_setImage(
            withURL: urlRequest,
            placeholderImage: UIImage(named: "no_image")
        )
        poster.frame = CGRect(x: 0, y: 0, width: cell.contentView.frame.width, height: cell.contentView.frame.height)
        poster.layer.shadowOpacity = 0.5
        poster.layer.shadowColor = UIColor.black.cgColor
        poster.layer.shadowOffset = CGSize(width: 1, height: 1)
        poster.layer.shadowRadius = 3
        poster.layer.masksToBounds = false
        cell.contentView.addSubview(poster)
        
        return cell
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let title = movies[indexPath.row].title
        var release_date = ""
        
        if movies[indexPath.row].release_date != "" {
            release_date = "公開日：\(movies[indexPath.row].release_date)\n\n"
        }
        
        ShowStandardAlert(title: title, msg: release_date + movies[indexPath.row].overview, vc: self)
    }
    
    func tabBarController(_ tabBarController: UITabBarController, didSelect viewController: UIViewController) {
        if viewController.restorationIdentifier! == "Social" && preViewName == "Social" {
            collectionView.scroll(to: .top, animated: true)
        }
        preViewName = "Social"
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
