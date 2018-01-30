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

    var posterCollectionView = UICollectionView(frame: CGRect(), collectionViewLayout: UICollectionViewLayout())
    var userCollectionView = UICollectionView(frame: CGRect(), collectionViewLayout: UICollectionViewLayout())
    var socialCollectionView = UICollectionView(frame: CGRect(), collectionViewLayout: UICollectionViewLayout())

    var titleView: UILabel!
    
    let posterCellId = "PosterCell"
    let userCellId = "UserCell"
    let socialCellId = "SocialCell"
    var user_id = 0
    var page_id = 1
    var movies: [MovieCompare.Data] = []
    var users: [String] = []
    var social: [MovieCompare.Onomatopoeia] = []
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
//                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    self.isNext = obj["next"].boolValue
                    self.isUpdating = false
                    
                    for data in obj["results"].arrayValue {
                        let tmp_data = MovieCompare().GetData(json: data)
                        self.movies.append(tmp_data)
                    }
                    
                    // 初回だけviewを追加
                    if isInit {
                        self.users = self.movies.first!.user.map({$0.name})
                        self.social = self.movies.first!.social
                        self.InitViews()
                    }
                    
                    self.posterCollectionView.reloadData()
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
    }
    
    func UpdateValues(movie: MovieCompare.Data) {
        titleView.text = movie.title
        
        users = movie.user.map({$0.name})
        social = movie.social
        userCollectionView.reloadData()
        socialCollectionView.reloadData()
    }
    
    func InitViews() {
        InitPosterCollectionView()
        InitTitleView()
        InitUserOnomatopoeiaCollectionView()
        InitSocialOnomatopoeiaCollectionView()
    }
    
    func InitPosterCollectionView() {
        let w = 120.0 as CGFloat
        let h = w * 1.5
        
        let layout = UPCarouselFlowLayout()
        layout.itemSize = CGSize(width: w, height: h)
        layout.scrollDirection = .horizontal
        
        posterCollectionView = UICollectionView(frame: CGRect(x: 0, y: 20, width: self.view.frame.width, height: h), collectionViewLayout: layout)
        posterCollectionView.backgroundColor = UIColor.white
        posterCollectionView.register(UICollectionViewCell.self, forCellWithReuseIdentifier: posterCellId)
        posterCollectionView.delegate = self
        posterCollectionView.dataSource = self
        posterCollectionView.tag = 1
        self.view.addSubview(posterCollectionView)
    }
    
    func InitTitleView() {
        titleView = UILabel()
        titleView.textAlignment = .center
        titleView.lineBreakMode = .byWordWrapping
        titleView.numberOfLines = 0
        titleView.font = UIFont.systemFont(ofSize: 22)
        titleView.text = movies.first!.title
        self.view.addSubview(titleView)
        
        titleView.topToBottom(of: posterCollectionView, offset: 20)
        titleView.centerX(to: self.view)
        titleView.leading(to: self.view, offset: 50)
        titleView.trailing(to: self.view, offset: -50)
    }
    
    func InitUserOnomatopoeiaCollectionView() {
        let icon = UIImageView(image: UIImage(named: "tab_user"))
        icon.image = icon.image!.withRenderingMode(.alwaysTemplate)
        icon.tintColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        self.view.addSubview(icon)
        
        icon.topToBottom(of: titleView, offset: 10)
        icon.leading(to: self.view, offset: 20)
        icon.width(30)
        icon.height(30)
        
        let w = self.view.frame.width / 6
        let h = w / 2
        let margin = w / 8
        
        let layout = UICollectionViewFlowLayout()
        layout.itemSize = CGSize(width: w, height: h)
        layout.minimumInteritemSpacing = margin
        layout.minimumLineSpacing = margin
        layout.sectionInset = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
        
        userCollectionView = UICollectionView(frame: CGRect.zero, collectionViewLayout: layout)
        userCollectionView.backgroundColor = UIColor.white
        userCollectionView.register(UICollectionViewCell.self, forCellWithReuseIdentifier: userCellId)
        userCollectionView.delegate = self
        userCollectionView.dataSource = self
        userCollectionView.tag = 2
        self.view.addSubview(userCollectionView)
        
        userCollectionView.topToBottom(of: icon, offset: 5)
        userCollectionView.leading(to: icon)
        userCollectionView.trailing(to: self.view, offset: -20)
        userCollectionView.height(h)
    }
    
    func InitSocialOnomatopoeiaCollectionView() {
        let w = self.view.frame.width / 6
        let h = w / 2 + 30
        let margin = w / 8
        
        let layout = UICollectionViewFlowLayout()
        layout.itemSize = CGSize(width: w, height: h)
        layout.minimumInteritemSpacing = margin
        layout.minimumLineSpacing = margin
        layout.sectionInset = UIEdgeInsets(top: margin, left: 0, bottom: margin, right: 0)
        
        socialCollectionView = UICollectionView(frame: CGRect.zero, collectionViewLayout: layout)
        socialCollectionView.backgroundColor = UIColor.white
        socialCollectionView.register(UICollectionViewCell.self, forCellWithReuseIdentifier: socialCellId)
        socialCollectionView.delegate = self
        socialCollectionView.dataSource = self
        socialCollectionView.tag = 3
        self.view.addSubview(socialCollectionView)
        
        socialCollectionView.topToBottom(of: userCollectionView, offset: 30)
        socialCollectionView.leading(to: userCollectionView)
        socialCollectionView.trailing(to: self.view, offset: -20)
        socialCollectionView.height(h*2+margin*4)
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        switch collectionView.tag {
        case 1:
            return movies.count
        case 2:
            return users.count
        case 3:
            return social.count
        default:
            return 0
        }
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        switch collectionView.tag {
        case 1:
            let cell = collectionView.dequeueReusableCell(withReuseIdentifier: posterCellId, for: indexPath)
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
            
        case 2:
            let cell = collectionView.dequeueReusableCell(withReuseIdentifier: userCellId, for: indexPath)
            for subview in cell.contentView.subviews {
                subview.removeFromSuperview()
            }
            
            let onomatopoeia = UILabel()
            onomatopoeia.text = users[indexPath.row]
            onomatopoeia.font = UIFont.systemFont(ofSize: 16)
            onomatopoeia.sizeToFit()
            onomatopoeia.center = cell.contentView.center
            cell.contentView.addSubview(onomatopoeia)
            
            return cell
            
        case 3:
            let cell = collectionView.dequeueReusableCell(withReuseIdentifier: socialCellId, for: indexPath)
            for subview in cell.contentView.subviews {
                subview.removeFromSuperview()
            }
                        
            let onomatopoeia = UILabel()
            onomatopoeia.text = social[indexPath.row].name
            onomatopoeia.font = UIFont.systemFont(ofSize: 16)
            onomatopoeia.sizeToFit()
            onomatopoeia.center = cell.contentView.center
            cell.contentView.addSubview(onomatopoeia)
            
            let icon = UIImageView(image: UIImage(named: "icon_users"))
            icon.image = icon.image!.withRenderingMode(.alwaysTemplate)
            icon.tintColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
            cell.contentView.addSubview(icon)
            
            icon.topToBottom(of: onomatopoeia, offset: 5)
            icon.centerX(to: onomatopoeia, offset: -5)
            icon.width(20)
            icon.height(20)
            
            let count = UILabel()
            count.text = String(social[indexPath.row].count)
            count.font = UIFont.systemFont(ofSize: 14)
            count.textColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
            cell.contentView.addSubview(count)
            
            count.centerY(to: icon, offset: 0)
            count.leadingToTrailing(of: icon, offset: 5)
            
            return cell
        default:
            return UICollectionViewCell()
        }
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
        let center = self.view.convert(posterCollectionView.center, to: posterCollectionView)
        guard let index = posterCollectionView.indexPathForItem(at: center) else { return }
        UpdateValues(movie: movies[index.row])
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
