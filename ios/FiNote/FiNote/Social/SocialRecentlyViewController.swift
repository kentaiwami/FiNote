//
//  SocialRecentlyViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/29.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import NVActivityIndicatorView
import Alamofire
import SwiftyJSON
import PopupDialog

class SocialRecentlyViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout, UITabBarControllerDelegate {

    let cellId = "itemCell"
    var preViewName = "Social"
    var collectionView = UICollectionView(frame: CGRect(), collectionViewLayout: UICollectionViewLayout())
    var refresh_controll = UIRefreshControl()
    var movies: [MovieBasic.Data] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        CallGetRecentlyAPI()
    }
    
    func InitCollectionView() {
        collectionView.removeFromSuperview()
        refresh_controll = UIRefreshControl()
        
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
        collectionView.autoresizingMask = UIViewAutoresizing(rawValue: UIViewAutoresizing.RawValue(UInt8(UIViewAutoresizing.flexibleHeight.rawValue) | UInt8(UIViewAutoresizing.flexibleWidth.rawValue)))
        collectionView.refreshControl = refresh_controll
        refresh_controll.addTarget(self, action: #selector(self.refresh(sender:)), for: .valueChanged)
        self.view.addSubview(collectionView)
    }
    
    func refresh(sender: UIRefreshControl) {
        refresh_controll.beginRefreshing()
        CallGetRecentlyAPI()
    }
    
    func CallGetRecentlyAPI() {
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.recently.rawValue
        let activityData = ActivityData(message: "Get Data", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "get-movies").async {
            Alamofire.request(urlString, method: .get).responseJSON { (response) in
                self.refresh_controll.endRefreshing()
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                
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
                    
                    self.InitCollectionView()
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.tabBarController?.navigationItem.title = "人気ランキング"
        self.tabBarController?.delegate = self
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return movies.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: cellId, for: indexPath)
        cell.backgroundColor = UIColor.lightGray
        
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
        let title = "\(indexPath.row+1)位\n\(movies[indexPath.row].title)"
        ShowStandardAlert(title: title, msg: movies[indexPath.row].overview, vc: self)
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
