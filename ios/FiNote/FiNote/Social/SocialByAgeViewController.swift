//
//  SocialByAgeViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/29.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import NVActivityIndicatorView
import SwiftyJSON
import Alamofire
import AlamofireImage

class SocialByAgeViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource {
    
    var contentView: UIView!
    var latestView: UIView!
    var scrollView = UIScrollView()
    var refresh_controll = UIRefreshControl()
    var movies: [[MovieByAge.Data]] = [[]]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.view.backgroundColor = UIColor.clear
        CallGetByAgeAPI()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.tabBarController?.navigationItem.title = "年代別ランキング"
        self.tabBarController?.navigationItem.titleView = nil
    }
    
    func refresh(sender: UIRefreshControl) {
        refresh_controll.beginRefreshing()
        CallGetByAgeAPI()
    }
    
    func CallGetByAgeAPI() {
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.byage.rawValue
        let activityData = ActivityData(message: "Get Movies", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "get-byage").async {
            Alamofire.request(urlString, method: .get).responseJSON { (response) in
                self.refresh_controll.endRefreshing()
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                self.movies.removeAll()
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    // 結果をパース
                    let dictionaryValue = obj["results"].dictionaryValue
                    for key in stride(from: 10, to: 60, by: 10) {
                        // 10,20...ごとに配列を取得
                        let arrayValue = dictionaryValue[String(key)]?.arrayValue
                        
                        // title, overview, poster, countごとにまとめた配列を取得
                        let data_array = MovieByAge().GetDataArray(json: arrayValue!)
                        self.movies.append(data_array)
                    }
                    
                    self.DrawViews()
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
    }
    
    func DrawViews() {
        InitScrollView()
        CreateSection(text: "10代", isTop: true)
        CreateCollectionView(tag: 1)
        
        for i in 2...5 {
            CreateSection(text: "\(i)0代", isTop: false)
            CreateCollectionView(tag: i)
        }
        
        contentView.bottom(to: latestView, offset: 20)
    }
    
    func InitScrollView() {
        scrollView.removeFromSuperview()
        refresh_controll = UIRefreshControl()
        
        scrollView = UIScrollView()
        scrollView.frame = CGRect(x: 0, y: 0, width: self.view.bounds.width, height: self.view.bounds.height)
        scrollView.refreshControl = refresh_controll
        refresh_controll.addTarget(self, action: #selector(self.refresh(sender:)), for: .valueChanged)
        self.view.addSubview(scrollView)
        
        scrollView.top(to: self.view)
        scrollView.leading(to: self.view)
        scrollView.trailing(to: self.view)
        scrollView.bottom(to: self.view)
        
        contentView = UIView()
        scrollView.addSubview(contentView)
        contentView.top(to: scrollView)
        contentView.leading(to: scrollView)
        contentView.trailing(to: scrollView)
        contentView.bottom(to: scrollView)
        contentView.width(to: scrollView)
        
        latestView = contentView
    }
    
    func CreateSection(text: String, isTop: Bool) {
        let label = UILabel(frame: CGRect.zero)
        label.text = text
        label.font = UIFont(name: Font.hiragino_w6.rawValue, size: 20)
        contentView.addSubview(label)
        
        label.leading(to: contentView, offset: 20)
        
        if isTop {
            label.top(to: latestView, offset: 20)
        }else {
            label.topToBottom(of: latestView, offset: 20)
        }
        
        latestView = label
    }
    
    func CreateCollectionView(tag: Int) {
        let count_space = 35 as CGFloat
        let w = 150 as CGFloat
        let h = w*1.5 + count_space
        let margin = 16 as CGFloat
        
        let layout = UICollectionViewFlowLayout()
        layout.itemSize = CGSize(width: w, height: h)
        layout.minimumInteritemSpacing = margin
        layout.minimumLineSpacing = margin
        layout.sectionInset = UIEdgeInsets(top: 0, left: margin, bottom: 0, right: margin)
        layout.scrollDirection = .horizontal
        
        let collectionView = UICollectionView(frame: CGRect.zero, collectionViewLayout: layout)
        collectionView.register(SocialByAgeCell.self, forCellWithReuseIdentifier: "MyCell")
        collectionView.delegate = self
        collectionView.dataSource = self
        collectionView.tag = tag
        collectionView.backgroundColor = UIColor.clear
        contentView.addSubview(collectionView)
        
        collectionView.topToBottom(of: latestView, offset: 10)
        collectionView.leading(to: contentView, offset: 20 - margin)
        collectionView.width(to: contentView)
        collectionView.height(h)
        
        latestView = collectionView
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let index = collectionView.tag - 1
        let title = "\(collectionView.tag*10)代 \(indexPath.row+1)位\n\(movies[index][indexPath.row].title)"
        ShowStandardAlert(title: title, msg: movies[index][indexPath.row].overview, vc: self)
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        let index = collectionView.tag - 1
        return movies[index].count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell : SocialByAgeCell = collectionView.dequeueReusableCell(withReuseIdentifier: "MyCell", for: indexPath as IndexPath) as! SocialByAgeCell
        let index = collectionView.tag - 1
        cell.poster.af_setImage(
            withURL: URL(string: API.poster_base.rawValue+movies[index][indexPath.row].poster)!,
            placeholderImage: UIImage(named: "no_image")
        )
        cell.user_count?.text = String(movies[index][indexPath.row].count)
        
        return cell
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
