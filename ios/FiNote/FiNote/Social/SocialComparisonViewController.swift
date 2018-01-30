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
    let cellId = "MyCell"
    var user_id = 0
    var page_id = 1
    var movies: [MovieCompare.Data] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = UIColor.white
        
        let keychain = Keychain()
        user_id = Int((try! keychain.get("id"))!)!
        
        CallGetCompareAPI()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        self.tabBarController?.navigationItem.title = "オノマトペの比較"
    }
    
    func CallGetCompareAPI() {
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.compare.rawValue+"?user_id=\(user_id)&page=\(page_id)"
        let activityData = ActivityData(message: "Get Movies", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "get-movies").async {
            Alamofire.request(urlString, method: .get).responseJSON { (response) in
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    self.movies.removeAll()
                    
                    for data in obj["results"].arrayValue {
                        self.movies.append(MovieCompare().GetDataArray(json: data))
                    }
                    
                    self.InitCollectionView()
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
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
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        //TODO: タップ時
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
