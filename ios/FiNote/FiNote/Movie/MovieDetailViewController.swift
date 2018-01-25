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
    var tmp_poster = UIImageView()
    
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
        
        scrollView.contentSize = CGSize(width: self.view.bounds.width, height: 1000)
    }
    
    func UpdateScrollViewContentSize(frame: CGRect) {
        scrollView.contentSize = CGSize(width: self.view.bounds.width, height: frame.height+frame.origin.y)
    }
    
    func InitPosterView() {
        let view = UIImageView()
        view.image = tmp_poster.image
        view.layer.shadowOpacity = 0.5
        view.layer.shadowColor = UIColor.black.cgColor
        view.layer.shadowOffset = CGSize(width: 1, height: 1)
        view.layer.shadowRadius = 3
        view.layer.masksToBounds = false
        scrollView.addSubview(view)
        
        view.top(to: scrollView, offset: 50)
        view.centerX(to: scrollView)
        view.width(200)
        view.height(300)
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
        //TODO: title
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
