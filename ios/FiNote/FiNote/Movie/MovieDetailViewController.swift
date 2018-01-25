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
    
    var contentView = UIView()
    var tmp_poster = UIImageView()
    var latestView = UIView()
    
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
        let scrollView = UIScrollView()
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
    
//    func UpdateScrollViewContentSize(frame: CGRect) {
//        scrollView.contentSize = CGSize(width: self.view.bounds.width, height: frame.height+frame.origin.y)
//    }
    
    func InitPosterView() {
        let posterImageView = UIImageView()
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
        
        latestView = posterImageView
    }
    
    func InitFloaty() {
        let floaty = Floaty()
        floaty.addItem(title: "Hello, World!")
        self.view.addSubview(floaty)
    }
    
    func InitTitleView() {
        let titleView = UILabel()
        let offset = 28 as CGFloat
        titleView.textAlignment = .center
        titleView.lineBreakMode = .byWordWrapping
        titleView.numberOfLines = 0
        titleView.font = UIFont.systemFont(ofSize: 22)
        titleView.text = movie.title
        contentView.addSubview(titleView)
        
        titleView.topToBottom(of: latestView, offset: 50)
        titleView.leading(to: contentView, offset: offset)
        titleView.centerX(to: contentView)
        titleView.trailing(to: contentView, offset: -offset)
        
        latestView = titleView
    }
    
    func InitOverView() {
        let overviewView = UILabel()
        let offset = 28 as CGFloat
        overviewView.textAlignment = .center
        overviewView.lineBreakMode = .byWordWrapping
        overviewView.numberOfLines = 0
        overviewView.font = UIFont.systemFont(ofSize: 16)
        overviewView.text = movie.overview
        contentView.addSubview(overviewView)

        overviewView.topToBottom(of: latestView, offset: 10)
        overviewView.leading(to: contentView, offset: offset)
        overviewView.centerX(to: contentView)
        overviewView.trailing(to: contentView, offset: -offset)
        
        latestView = overviewView
    }
    
    func InitPublicInfoView() {
        let icon_wh = 20 as CGFloat
        let public_icon = UIImageView(image: UIImage(named: "tab_movies"))
        public_icon.image = public_icon.image!.withRenderingMode(.alwaysTemplate)
        public_icon.tintColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        contentView.addSubview(public_icon)
        
        public_icon.topToBottom(of: latestView, offset: 10)
        public_icon.centerX(to: contentView)
        public_icon.width(icon_wh)
        public_icon.height(icon_wh)
        
        let public_date = UILabel()
        public_date.font = UIFont.systemFont(ofSize: 16)
        public_date.textColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        public_date.text = movie.add
        contentView.addSubview(public_date)
        
        public_date.centerY(to: public_icon)
        public_date.leadingToTrailing(of: public_icon, offset: 10)
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
        InitOverView()
        InitPublicInfoView()
        //TODO: delete button
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
