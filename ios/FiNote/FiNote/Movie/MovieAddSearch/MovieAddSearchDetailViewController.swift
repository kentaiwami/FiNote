//
//  MovieAddSearchDetailViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/28.
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

class MovieAddSearchDetailViewController: UIViewController {

    var user_id = ""
    var username = ""
    var password = ""
    var searched_movie = MovieAddSearchResult.Data()
    
    var contentView = UIView()
    var latestView = UIView()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.view.backgroundColor = UIColor.white
        self.navigationItem.title = "Movie Detail"
        
        let keychain = Keychain()
        user_id = (try! keychain.getString("id"))!
        username = (try! keychain.getString("username"))!
        password = (try! keychain.getString("password"))!
        
        DrawViews()
    }
    
    func DrawViews() {
        InitScrollView()
        InitPosterView()
        InitFloaty()
        InitTitleView()
        InitOverView()
        InitReleaseInfoView()
    }
    
    func SetMovieID(searched_movie: MovieAddSearchResult.Data) {
        self.searched_movie = searched_movie
    }
    
    func InitScrollView() {
        let scrollView = UIScrollView()
        scrollView.frame = CGRect(x: 0, y: 0, width: self.view.bounds.width, height: self.view.bounds.height)
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
    }
    
    func InitPosterView() {
        let urlRequest = URL(string: API.poster_base.rawValue+searched_movie.poster)!
        let posterImageView = UIImageView()
        posterImageView.af_setImage(
            withURL: urlRequest,
            placeholderImage: UIImage(named: "no_image")
        )
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
        let save_item = FloatyItem()
        save_item.title = "Add Movie"
        save_item.buttonColor = UIColor.hex(Color.blue.rawValue, alpha: 1.0)
        save_item.icon = UIImage(named: "icon_check")
        save_item.handler = { (_) in
            //TODO: CALL SAVE API
        }
        
        let floaty = Floaty()
        floaty.addItem("Edit Info", icon: UIImage(named: "icon_list")) { (_) in
            //TODO: 遷移
//            let movie_info_VC = MoviesUserInfoViewController()
//            movie_info_VC.SetDVD(dvd: self.movie.dvd)
//            movie_info_VC.SetFAV(fav: self.movie.fav)
//            movie_info_VC.SetOnomatopoeia(onomatopoeia: self.movie.onomatopoeia)
//            movie_info_VC.SetMovieID(movie_id: self.movie_id)
//
//            let nav = UINavigationController()
//            nav.viewControllers = [movie_info_VC]
//
//            self.present(nav, animated: true, completion: nil)
        }
        
        floaty.addItem(item: save_item)
        floaty.buttonColor = UIColor.hex(Color.main.rawValue, alpha: 1.0)
        floaty.buttonImage = UIImage(named: "icon_edit")
        floaty.rotationDegrees = 0.0
        self.view.addSubview(floaty)
    }
    
    func InitTitleView() {
        let titleView = UILabel()
        let offset = 28 as CGFloat
        titleView.textAlignment = .center
        titleView.lineBreakMode = .byWordWrapping
        titleView.numberOfLines = 0
        titleView.font = UIFont.systemFont(ofSize: 22)
        titleView.text = searched_movie.title
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
        overviewView.text = searched_movie.overview
        contentView.addSubview(overviewView)
        
        overviewView.topToBottom(of: latestView, offset: 10)
        overviewView.leading(to: contentView, offset: offset)
        overviewView.centerX(to: contentView)
        overviewView.trailing(to: contentView, offset: -offset)
        
        latestView = overviewView
    }
    
    func InitReleaseInfoView() {
        let icon_wh = 25 as CGFloat
        let release_icon = UIImageView(image: UIImage(named: "tab_movies"))
        release_icon.image = release_icon.image!.withRenderingMode(.alwaysTemplate)
        release_icon.tintColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        contentView.addSubview(release_icon)
        
        release_icon.topToBottom(of: latestView, offset: 10)
        release_icon.centerX(to: contentView, offset: -50)
        release_icon.width(icon_wh)
        release_icon.height(icon_wh)
        
        let release_date = UILabel()
        release_date.font = UIFont.systemFont(ofSize: 16)
        release_date.textColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        release_date.text = searched_movie.release_date
        contentView.addSubview(release_date)
        
        release_date.centerY(to: release_icon, offset: 0)
        release_date.leadingToTrailing(of: release_icon, offset: 10)
        
        latestView = release_date
        
        contentView.bottom(to: latestView, offset: 200)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
