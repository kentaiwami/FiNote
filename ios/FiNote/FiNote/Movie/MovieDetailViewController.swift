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
import PromiseKit

class MovieDetailViewController: UIViewController {

    var movie_id = ""
    var user_id = ""
    var movie = Movie.Data()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.view.backgroundColor = UIColor.white
        self.navigationItem.title = "Detail Movie"
        
        let keychain = Keychain()
        user_id = (try! keychain.getString("id"))!
        
        let activityData = ActivityData(message: "Get Movie", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        CallMovieAPI().then { _ in
            NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
        }.catch { err in
            let ns_err = err as NSError
            let popup = PopupDialog(title: "Error", message: ns_err.domain)
            let button = DefaultButton(title: "OK", dismissOnTap: true) {}
            popup.addButtons([button])

            NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
            self.present(popup, animated: true, completion: nil)
        }
    }
    
    func SetMovieID(movie_id: String) {
        self.movie_id = movie_id
    }
    
    func CallMovieAPI() -> Promise<String>{
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.detail.rawValue+"?user_id=\(self.user_id)&movie_id=\(self.movie_id)"
        let promise = Promise<String> { (resolve, reject) in
            DispatchQueue(label: "get-movie").async {
                Alamofire.request(urlString, method: .get).responseJSON { (response) in
                    let obj = JSON(response.result.value)
                    print("***** API results *****")
                    print(obj)
                    print("***** API results *****")
                    
                    if IsHTTPStatus(statusCode: response.response?.statusCode) {
                        self.movie = Movie().GetData(json: obj)
                        resolve("OK")
                    }else {
                        reject(NSError(domain: obj.arrayValue[0].stringValue, code: (response.response?.statusCode)!, userInfo: nil))
                    }
                }
            }
        }
        return promise
    }


    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
