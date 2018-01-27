//
//  MovieAddSearchUserInfoViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/28.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import Eureka
import NVActivityIndicatorView
import Alamofire
import SwiftyJSON
import KeychainAccess
import PopupDialog

class MovieAddSearchUserInfoViewController: FormViewController {

    var searched_movie = MovieAddSearchResult.Data()
    var poster = UIImage()
    var onomatopoeia: [String] = []
    var count = 1
    var choices: [String] = []
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.navigationItem.title = "Edit Info"
        
        let close = UIBarButtonItem(image: UIImage(named: "icon_cancel"), style: .plain, target: self, action: #selector(TapCloseButton))
        let save = UIBarButtonItem(image: UIImage(named: "icon_check"), style: .plain, target: self, action: #selector(TapSaveButton))
        self.navigationItem.setLeftBarButton(close, animated: true)
        self.navigationItem.setRightBarButton(save, animated: true)
        
        CallGetOnomatopoeiaAPI(act: { obj in
            self.choices = obj["results"].arrayValue.map{$0.stringValue}
            self.CreateForm()
        }, vc: self)
    }
    
    func TapCloseButton() {
        self.dismiss(animated: true, completion: nil)
    }
    
    func TapSaveButton() {
        let choosing = GetChoosingOnomatopoeia(values: form.values())
        
        if choosing.count == 0 {
            ShowStandardAlert(title: "Error", msg: "オノマトペは少なくとも1つ以上追加する必要があります", vc: self)
        }else {
            var dvd_msg = "DVD未所持"
            var fav_msg = "お気に入り未登録"
            let values = form.values()
            
            if values["dvd"] as! Bool {
                dvd_msg = "DVD所持済み"
            }
            
            if values["fav"] as! Bool {
                fav_msg = "お気に入りへ登録済み"
            }
            
            let onomatopoeia = GetChoosingOnomatopoeia(values: form.values())
            let popup = PopupDialog(
                title: searched_movie.title,
                message: "映画を下記の状態で追加しますか？\n\n\(onomatopoeia.joined(separator: " "))\n\n\(dvd_msg)\n\(fav_msg)"
            )
            let ok = DefaultButton(title: "Add", dismissOnTap: true) {self.CallMovieAddAPI()}
            let cancel = CancelButton(title: "Cancel", dismissOnTap: true) {}
            
            popup.transitionStyle = .zoomIn
            popup.addButtons([ok, cancel])
            self.present(popup, animated: true, completion: nil)
        }
    }
    
    func SetMovie(movie: MovieAddSearchResult.Data) {
        searched_movie = movie
    }
    
    func SetPoster(poster: UIImage) {
        self.poster = poster
    }
    
    func CreateForm() {
        UIView.setAnimationsEnabled(false)
        
        form +++ Section(header: "DVDの所持・お気に入り登録", footer: "")
            <<< SwitchRow("") { row in
                row.title = "DVD"
                row.value = false
                row.tag = "dvd"
            }
            
            <<< SwitchRow("") { row in
                row.title = "Favorite"
                row.value = false
                row.tag = "fav"
            }
        
        
        form +++ MultivaluedSection(
            multivaluedOptions: [.Insert, .Delete],
            header: "オノマトペの登録",
            footer: "映画を観た気分を登録してください") {
                $0.tag = "onomatopoeia"
                $0.multivaluedRowToInsertAt = { _ in
                    let options = GetOnomatopoeiaNewChoices(values: self.form.values(), choices: self.choices)
                    if options.count == 0 {
                        return PickerInputRow<String>{
                            $0.title = "タップして選択..."
                            $0.options = options
                            $0.value = ""
                            $0.tag = "onomatopoeia_\(self.count)"
                            self.count += 1
                            }.onCellSelection({ (cell, row) in
                                row.options = GetOnomatopoeiaNewChoices(ignore: row.value!, values: self.form.values(), choices: self.choices)
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
                                row.options = GetOnomatopoeiaNewChoices(ignore: row.value!, values: self.form.values(), choices: self.choices)
                                row.updateCell()
                            })
                    }
                }
                                        
                for (i, name) in onomatopoeia.enumerated() {
                    $0 <<< PickerInputRow<String> {
                        $0.title = "タップして選択..."
                        $0.value = name
                        $0.options = GetOnomatopoeiaNewChoices(values: self.form.values(), choices: self.choices)
                        $0.tag = "onomatopoeia_\(i)"
                        }.onCellSelection({ (cell, row) in
                            row.options = GetOnomatopoeiaNewChoices(ignore: row.value!, values: self.form.values(), choices: self.choices)
                            row.updateCell()
                        })
                    count = i+1
                }
        }
        
        UIView.setAnimationsEnabled(true)
    }
    
    func CallMovieAddAPI() {
        let urlString = API.base.rawValue+API.v1.rawValue+API.movie.rawValue
        let activityData = ActivityData(message: "Adding", type: .lineScaleParty)
        let appdelegate = GetAppDelegate()
        let keychain = Keychain()
        let values = form.values()
        let params = [
            "username": (try! keychain.getString("username"))!,
            "password": (try! keychain.getString("password"))!,
            "tmdb_id": searched_movie.id,
            "title": searched_movie.title,
            "overview": searched_movie.overview,
            "poster": searched_movie.poster,
            "genre": searched_movie.genre,
            "dvd": values["dvd"] as! Bool,
            "fav": values["fav"] as! Bool,
            "onomatopoeia": GetChoosingOnomatopoeia(values: values)
            ] as [String : Any]
        
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "update-movie-user-info").async {
            Alamofire.request(urlString, method: .post, parameters: params, encoding: JSONEncoding.default).responseJSON { (response) in
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    //TODO: addを生成
                    //TODO: Movies.Dataを生成
                    //TODO: appdelegateへ追加
                    //TODO: popを2回
                    //TODO: 画面を閉じる
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
