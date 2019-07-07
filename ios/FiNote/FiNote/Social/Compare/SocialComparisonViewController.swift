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
import StatusProvider

class SocialComparisonViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource, StatusController {

    var posterCollectionView = UICollectionView(frame: CGRect(), collectionViewLayout: UICollectionViewLayout())
    var userCollectionView = UICollectionView(frame: CGRect(), collectionViewLayout: UICollectionViewLayout())
    var socialCollectionView = UICollectionView(frame: CGRect(), collectionViewLayout: UICollectionViewLayout())
    var cell_w = 0 as CGFloat
    var cell_h = 0 as CGFloat
    var cell_margin = 0 as CGFloat
    
    var titleView: UILabel!
    
    let posterCellId = "PosterCell"
    let userCellId = "UserCell"
    let socialCellId = "SocialCell"
    var user_id = 0
    var page_id = 1
    var movies: [MovieCompare.Data] = []
    var users: [MovieCompare.Onomatopoeia] = []
    var social: [MovieCompare.Onomatopoeia] = []
    var isNext = false
    var isUpdating = false
    
    fileprivate let utility = Utility()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = UIColor.white
        
        let keychain = Keychain()
        user_id = Int((try! keychain.get("id"))!)!
        
        cell_w = self.view.frame.width / 6
        cell_h = cell_w / 2 + 30
        cell_margin = cell_w / 8
        
        DrawView()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.tabBarController?.navigationItem.title = "オノマトペの比較"
    }
    
    func DrawView() {
        if utility.getAppDelegate().movies.count == 0 {
            let status = Status(title: "No Data", description: "映画を追加して他の人がつけたオノマトペと比べて見ましょう", actionTitle: "Reload", image: nil) {
                self.hideStatus()
                self.DrawView()
            }
            
            show(status: status)
        }else {
            CallGetCompareAPI(isInit: true)
        }
    }
    
    func CallGetCompareAPI(isInit: Bool=false) {
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.compare.rawValue+"?user_id=\(user_id)&page=\(page_id)"
        let activityData = ActivityData(message: "Get Data", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData, nil)
        
        DispatchQueue(label: "get-compare").async {
            Alamofire.request(urlString, method: .get).responseJSON { (response) in
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating(nil)
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if self.utility.isHTTPStatus(statusCode: response.response?.statusCode) {
                    self.isNext = obj["next"].boolValue
                    self.isUpdating = false
                    
                    for data in obj["results"].arrayValue {
                        let tmp_data = MovieCompare().GetData(json: data)
                        self.movies.append(tmp_data)
                    }
                    
                    // スクロール以外時の呼び出しだけviewを追加
                    if isInit {
                        self.users = self.movies.first!.user
                        self.social = self.movies.first!.social
                        self.InitViews()
                    }
                    
                    self.posterCollectionView.reloadData()
                }else {
                    self.utility.showStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
    }
    
    func UpdateValues(movie: MovieCompare.Data) {
        titleView.text = movie.title
        users = movie.user
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
        posterCollectionView.register(SocialComparisonPosterCell.self, forCellWithReuseIdentifier: posterCellId)
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
        titleView.font = UIFont(name: Font.helveticaneue_B.rawValue, size: 20)
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
        
        let layout = UICollectionViewFlowLayout()
        layout.itemSize = CGSize(width: cell_w, height: cell_h)
        layout.minimumInteritemSpacing = cell_margin
        layout.minimumLineSpacing = cell_margin
        layout.sectionInset = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
        
        userCollectionView = UICollectionView(frame: CGRect.zero, collectionViewLayout: layout)
        userCollectionView.backgroundColor = UIColor.clear
        userCollectionView.register(SocialComparisonCell.self, forCellWithReuseIdentifier: userCellId)
        userCollectionView.delegate = self
        userCollectionView.dataSource = self
        userCollectionView.tag = 2
        self.view.addSubview(userCollectionView)
        
        userCollectionView.topToBottom(of: icon, offset: -20)
        userCollectionView.leading(to: icon)
        userCollectionView.trailing(to: self.view, offset: -20)
        userCollectionView.height(cell_h)
    }
    
    func InitSocialOnomatopoeiaCollectionView() {
        let layout = UICollectionViewFlowLayout()
        layout.itemSize = CGSize(width: cell_w, height: cell_h)
        layout.minimumInteritemSpacing = cell_margin
        layout.minimumLineSpacing = cell_margin
        layout.sectionInset = UIEdgeInsets(top: cell_margin, left: 0, bottom: cell_margin, right: 0)
        
        socialCollectionView = UICollectionView(frame: CGRect.zero, collectionViewLayout: layout)
        socialCollectionView.backgroundColor = UIColor.white
        socialCollectionView.register(SocialComparisonCell.self, forCellWithReuseIdentifier: socialCellId)
        socialCollectionView.delegate = self
        socialCollectionView.dataSource = self
        socialCollectionView.tag = 3
        self.view.addSubview(socialCollectionView)
        
        socialCollectionView.topToBottom(of: userCollectionView, offset: 30)
        socialCollectionView.leading(to: userCollectionView)
        socialCollectionView.trailing(to: self.view, offset: -20)
        socialCollectionView.height(cell_h*2+cell_margin*4)
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
            let cell : SocialComparisonPosterCell = collectionView.dequeueReusableCell(withReuseIdentifier: posterCellId, for: indexPath as IndexPath) as! SocialComparisonPosterCell
            cell.poster.af_setImage(
                withURL: URL(string: API.poster_base.rawValue+movies[indexPath.row].poster)!,
                placeholderImage: UIImage(named: "no_image")
            )
            
            return cell
            
        case 2:
            let cell : SocialComparisonCell = collectionView.dequeueReusableCell(withReuseIdentifier: userCellId, for: indexPath as IndexPath) as! SocialComparisonCell
            cell.onomatopoeia.text = users[indexPath.row].name
            cell.count.text = String(users[indexPath.row].count)
            
            return cell
            
        case 3:
            let cell : SocialComparisonCell = collectionView.dequeueReusableCell(withReuseIdentifier: socialCellId, for: indexPath as IndexPath) as! SocialComparisonCell
            cell.onomatopoeia.text = social[indexPath.row].name
            cell.count.text = String(social[indexPath.row].count)
            
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
