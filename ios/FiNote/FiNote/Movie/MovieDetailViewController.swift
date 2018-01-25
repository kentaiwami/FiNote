//
//  MovieDetailViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/25.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import NVActivityIndicatorView
import SwiftyJSON
import Alamofire
import AlamofireImage
import KeychainAccess
import PopupDialog
import TinyConstraints
import Floaty

class MovieDetailViewController: UIViewController, UIScrollViewDelegate {

    var movie_id = ""
    var user_id = ""
    var movie = Movie.Data()
    
    var scrollView = UIScrollView()
    var contentView = UIView()
    var tmp_poster = UIImageView()
    var posterImageView = UIImageView()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.view.backgroundColor = UIColor.white
        self.navigationItem.title = "Detail Movie"
        
        let keychain = Keychain()
        user_id = (try! keychain.getString("id"))!
        
        CallMovieAPI()
    }
    
    func SetMovieID(movie_id: String) {
        self.movie_id = movie_id
    }
    
    func InitScrollView() {
        scrollView.frame = CGRect(x: 0, y: 0, width: self.view.bounds.width, height: self.view.bounds.height)
        self.view.addSubview(scrollView)
        scrollView.delegate = self
        
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
        
        contentView.height(1000)
    }
    
    func UpdateScrollViewContentSize(frame: CGRect) {
        scrollView.contentSize = CGSize(width: self.view.bounds.width, height: frame.height+frame.origin.y)
    }
    
    func InitPosterView() {
        posterImageView = UIImageView()
        posterImageView.image = tmp_poster.image
        posterImageView.layer.shadowOpacity = 0.5
        posterImageView.layer.shadowColor = UIColor.black.cgColor
        posterImageView.layer.shadowOffset = CGSize(width: 1, height: 1)
        posterImageView.layer.shadowRadius = 3
        posterImageView.layer.masksToBounds = false
        contentView.addSubview(posterImageView)
        
        posterImageView.top(to: contentView, offset: 50)
        posterImageView.centerX(to: contentView)
        posterImageView.width(200)
        posterImageView.height(300)
    }
    
    func InitFloaty() {
        let floaty = Floaty()
        floaty.addItem(title: "Hello, World!")
        self.view.addSubview(floaty)
    }
    
    func InitTitleView() {
        let view = UILabel()
        let offset = 28 as CGFloat
        view.textAlignment = .center
        view.lineBreakMode = .byWordWrapping
        view.numberOfLines = 0
        view.font = UIFont.systemFont(ofSize: 22)
        view.text = movie.title
        contentView.addSubview(view)
        
        view.topToBottom(of: posterImageView, offset: 50)
        view.leading(to: contentView, offset: offset)
        view.centerX(to: contentView)
        view.trailing(to: contentView, offset: -offset)
    }
    
    func CallMovieAPI() {
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.detail.rawValue+"?user_id=\(self.user_id)&movie_id=\(self.movie_id)"
        let activityData = ActivityData(message: "Get Movie", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "get-movie").async {
            Alamofire.request(urlString, method: .get).responseJSON { (response) in
                let obj = JSON(response.result.value)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    self.movie = Movie().GetData(json: obj)
                    self.tmp_poster.af_setImage(withURL: URL(string: API.poster_base.rawValue+self.movie.poster)!)
                    NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                    self.DrawViews()
                }else {
                    let popup = PopupDialog(title: "Error", message: obj.arrayValue[0].stringValue)
                    let button = DefaultButton(title: "OK", dismissOnTap: true) {}
                    popup.addButtons([button])
                    
                    NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                    self.present(popup, animated: true, completion: nil)
                }
            }
        }
    }
    
    func DrawViews() {
        InitScrollView()
        InitPosterView()
        InitFloaty()
        InitTitleView()
        //TODO: overview
        //TODO: public icon
        //TODO: public date
        //TODO: delete button
        //TODO: floaty
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
