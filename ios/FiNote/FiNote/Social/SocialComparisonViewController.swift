//
//  SocialComparisonViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/29.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import UPCarouselFlowLayout
import SwiftyJSON
import Alamofire
import NVActivityIndicatorView
import KeychainAccess

class SocialComparisonViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource {

    var collectionView = UICollectionView(frame: CGRect(), collectionViewLayout: UICollectionViewLayout())
    var titleView: UILabel!
    
    let cellId = "MyCell"
    var user_id = 0
    var page_id = 1
    var movies: [MovieCompare.Data] = []
    var isNext = false
    var isUpdating = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = UIColor.white
        
        let keychain = Keychain()
        user_id = Int((try! keychain.get("id"))!)!
        
        CallGetCompareAPI(isInit: true)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.tabBarController?.navigationItem.title = "オノマトペの比較"
    }
    
    func CallGetCompareAPI(isInit: Bool=false) {
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.compare.rawValue+"?user_id=\(user_id)&page=\(page_id)"
        let activityData = ActivityData(message: "Get Data", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "get-compare").async {
            Alamofire.request(urlString, method: .get).responseJSON { (response) in
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    self.isNext = obj["next"].boolValue
                    self.isUpdating = false
                    
                    for data in obj["results"].arrayValue {
                        self.movies.append(MovieCompare().GetData(json: data))
                    }
                    
                    // 初回だけviewを追加
                    if isInit {
                        self.InitViews()
                    }
                    
                    self.collectionView.reloadData()
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
    }
    
    func UpdateValues(movie: MovieCompare.Data) {
        titleView.text = movie.title
    }
    
    func InitViews() {
        InitCollectionView()
        InitTitleView()
        InitUserOnomatopoeia()
    }
    
    func InitTitleView() {
        titleView = UILabel()
        titleView.textAlignment = .center
        titleView.lineBreakMode = .byWordWrapping
        titleView.numberOfLines = 0
        titleView.font = UIFont.systemFont(ofSize: 22)
        titleView.text = movies.first!.title
        self.view.addSubview(titleView)
        
        titleView.topToBottom(of: collectionView, offset: 20)
        titleView.centerX(to: self.view)
        titleView.leading(to: self.view, offset: 50)
        titleView.trailing(to: self.view, offset: -50)
    }
    
    func InitUserOnomatopoeia() {
        let icon = UIImageView(image: UIImage(named: "tab_user"))
        icon.image = icon.image!.withRenderingMode(.alwaysTemplate)
        icon.tintColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        self.view.addSubview(icon)
        
        icon.topToBottom(of: titleView, offset: 20)
        icon.leading(to: self.view, offset: 20)
        icon.width(30)
        icon.height(30)
    }
    
    func InitCollectionView() {
        let w = 150.0 as CGFloat
        let h = w*1.5 as CGFloat
        
        let layout = UPCarouselFlowLayout()
        layout.itemSize = CGSize(width: w, height: h)
        layout.scrollDirection = .horizontal
        
        collectionView = UICollectionView(frame: CGRect(x: 0, y: 50, width: self.view.frame.width, height: h), collectionViewLayout: layout)
        collectionView.backgroundColor = UIColor.white
        collectionView.register(UICollectionViewCell.self, forCellWithReuseIdentifier: cellId)
        collectionView.delegate = self
        collectionView.dataSource = self
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
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        if scrollView.contentOffset.x + scrollView.frame.size.width > scrollView.contentSize.width && scrollView.isDragging && !isUpdating {
            if isNext {
                page_id += 1
                isUpdating = true
                CallGetCompareAPI()
            }
        }
        
        // collectionviewの中央を取得して、viewの値を更新
        let center = self.view.convert(collectionView.center, to: collectionView)
        guard let index = collectionView.indexPathForItem(at: center) else { return }
        UpdateValues(movie: movies[index.row])
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
