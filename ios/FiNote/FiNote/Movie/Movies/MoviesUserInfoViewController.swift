//
//  MoviesUserInfoViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/26.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import Eureka
import NVActivityIndicatorView
import Alamofire
import SwiftyJSON
import KeychainAccess


class MoviesUserInfoViewController: FormViewController {

    var MovieCommonFunc = MovieCommon()
    var movie_id = 0
    var onomatopoeia: [String] = []
    var dvd = false
    var fav = false
    var count = 1
    var choices: [String] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationItem.title = "Edit Info"
        
        let close = UIBarButtonItem(image: UIImage(named: "icon_cancel"), style: .plain, target: self, action: #selector(TapCloseButton))
        let save = UIBarButtonItem(image: UIImage(named: "icon_check"), style: .plain, target: self, action: #selector(TapSaveButton))
        self.navigationItem.setLeftBarButton(close, animated: true)
        self.navigationItem.setRightBarButton(save, animated: true)
        
        MovieCommonFunc.CallGetOnomatopoeiaAPI(act: { obj in
            self.choices = obj["results"].arrayValue.map{$0.stringValue}
            self.CreateForm()
        }, vc: self)
    }
    
    @objc func TapCloseButton() {
        self.dismiss(animated: true, completion: nil)
    }
    
    @objc func TapSaveButton() {
        let choosing = MovieCommonFunc.GetChoosingOnomatopoeia(values: form.values())
        
        if choosing.count == 0 {
            ShowStandardAlert(title: "Error", msg: "オノマトペは少なくとも1つ以上追加する必要があります", vc: self)
        }else {
            CallUpdateMovieUserInfoAPI()
        }
    }
    
    func SetMovieID(movie_id: Int) {
        self.movie_id = movie_id
    }
    
    func SetOnomatopoeia(onomatopoeia: [String]) {
        self.onomatopoeia = onomatopoeia
    }
    
    func SetDVD(dvd: Bool) {
        self.dvd = dvd
    }
    
    func SetFAV(fav: Bool) {
        self.fav = fav
    }
    
    func CreateForm() {
        UIView.setAnimationsEnabled(false)
        
        form +++ Section(header: "DVDの所持・お気に入り登録", footer: "")
            <<< SwitchRow("") { row in
                row.title = "DVD"
                row.value = dvd
                row.tag = "dvd"
            }
        
            <<< SwitchRow("") { row in
                row.title = "Favorite"
                row.value = fav
                row.tag = "fav"
            }
        
        
        form +++ MultivaluedSection(
            multivaluedOptions: [.Insert, .Delete],
            header: "オノマトペの登録",
            footer: "映画を観た気分を登録してください") {
                $0.tag = "onomatopoeia"
                $0.multivaluedRowToInsertAt = { _ in
                    let options = self.MovieCommonFunc.GetOnomatopoeiaNewChoices(values: self.form.values(), choices: self.choices)
                    if options.count == 0 {
                        return PickerInputRow<String>{
                            $0.title = "タップして選択..."
                            $0.options = options
                            $0.value = ""
                            $0.tag = "onomatopoeia_\(self.count)"
                            self.count += 1
                        }.onCellSelection({ (cell, row) in
                            row.options = self.MovieCommonFunc.GetOnomatopoeiaNewChoices(ignore: row.value!, values: self.form.values(), choices: self.choices)
                            row.updateCell()
                        })
                    }else {
                        return PickerInputRow<String>{
                            $0.title = "タップして選択..."
                            $0.options = options
                            $0.value = options.first!
                            $0.tag = "onomatopoeia_\(self.count)"
                            self.count += 1
                        }.onCellSelection({ (cell, row) in
                            row.options = self.MovieCommonFunc.GetOnomatopoeiaNewChoices(ignore: row.value!, values: self.form.values(), choices: self.choices)
                            row.updateCell()
                        })
                    }
                }
                            
                for (i, name) in onomatopoeia.enumerated() {
                    $0 <<< PickerInputRow<String> {
                        $0.title = "タップして選択..."
                        $0.value = name
                        $0.options = MovieCommonFunc.GetOnomatopoeiaNewChoices(values: self.form.values(), choices: self.choices)
                        $0.tag = "onomatopoeia_\(i)"
                        }.onCellSelection({ (cell, row) in
                            row.options = self.MovieCommonFunc.GetOnomatopoeiaNewChoices(ignore: row.value!, values: self.form.values(), choices: self.choices)
                            row.updateCell()
                        })
                    count = i+1
                }
        }
        
        UIView.setAnimationsEnabled(true)
    }
        
    func CallUpdateMovieUserInfoAPI() {
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue+API.update.rawValue
        let activityData = ActivityData(message: "Updating", type: .lineScaleParty)
        let keychain = Keychain()
        let appdelegate = GetAppDelegate()
        
        let choosing_onomatopoeia = NSOrderedSet(array: MovieCommonFunc.GetChoosingOnomatopoeia(values: form.values())).array as! [String]
        let params = [
            "username": (try! keychain.getString("username"))!,
            "password": (try! keychain.getString("password"))!,
            "tmdb_id": movie_id,
            "dvd": form.values()["dvd"] as! Bool,
            "fav": form.values()["fav"] as! Bool,
            "onomatopoeia": choosing_onomatopoeia
            ] as [String : Any]
        
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData, nil)
        
        DispatchQueue(label: "update-movie-user-info").async {
            Alamofire.request(urlString, method: .post, parameters: params, encoding: JSONEncoding.default).responseJSON { (response) in
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating(nil)
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    let index = appdelegate.movies.firstIndex(where: {$0.id == self.movie_id})
                    let index_int = index?.advanced(by: 0)
                    appdelegate.movies[index_int!].onomatopoeia = choosing_onomatopoeia
                    
                    // MovieInfo画面を閉じる前にMovieDetail画面でpop(Moviesへ遷移)
                    let nav = self.presentingViewController as! UINavigationController
                    nav.popViewController(animated: true)
                    self.dismiss(animated: true, completion: nil)
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
                }
            }
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
