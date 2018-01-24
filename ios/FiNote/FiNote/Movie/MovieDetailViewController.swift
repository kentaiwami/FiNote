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

class MovieDetailViewController: UIViewController {

    var movie_id = ""
    var user_id = ""
    var movie = Movie.Data()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.view.backgroundColor = UIColor.white
        
        let keychain = Keychain()
        user_id = (try! keychain.getString("id"))!
        self.CallMovieAPI()
    }
    
    func SetMovieID(movie_id: String) {
        self.movie_id = movie_id
    }
    
    func CallMovieAPI() {
        let activityData = ActivityData(message: "Get Movie", type: .lineScaleParty)
        
    NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "get-movie").async {
            let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.detail.rawValue+"?user_id=\(self.user_id)&movie_id=\(self.movie_id)"
            
            Alamofire.request(urlString, method: .get).responseJSON { (response) in
                let obj = JSON(response.result.value)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    self.movie = Movie().GetData(json: obj)
                    NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
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

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
