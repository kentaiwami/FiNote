//
//  MoviesViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/22.
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

class MoviesViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, UITabBarControllerDelegate, UISearchResultsUpdating {
    
    var movies:[Movies.Data] = []
    var searchResults:[Movies.Data] = []
    var preViewName = "Movies"
    var myTableView = UITableView()
    var searchController = UISearchController()

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let keychain = Keychain()
        let id = try! keychain.getString("id")
        self.CallMoviesAPI(id: id!)
        
        let main_width = UIScreen.main.bounds.width
        let width = main_width * 0.2
        let height = width * 1.5
        
        myTableView = UITableView(frame: view.frame, style: .plain)
        myTableView.rowHeight = height
        myTableView.delegate = self
        myTableView.dataSource = self
        myTableView.register(Cell.self, forCellReuseIdentifier: NSStringFromClass(Cell.self))
        self.view.addSubview(myTableView)
        
        myTableView.autoresizingMask = UIViewAutoresizing(rawValue: UIViewAutoresizing.RawValue(UInt8(UIViewAutoresizing.flexibleHeight.rawValue) | UInt8(UIViewAutoresizing.flexibleWidth.rawValue)))
        
        searchController = UISearchController(searchResultsController: nil)
        searchController.searchResultsUpdater = self
        searchController.searchBar.sizeToFit()
        searchController.dimsBackgroundDuringPresentation = false
        searchController.hidesNavigationBarDuringPresentation = false
        searchController.searchBar.placeholder = "映画のタイトルやオノマトペで検索"
        definesPresentationContext = true
        
        myTableView.tableHeaderView = searchController.searchBar
        
        self.tabBarController?.delegate = self
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        self.tabBarController?.navigationItem.title = "Movies"
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if searchController.isActive {
            return searchResults.count
        } else {
            return movies.count
        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let base_url = "https://image.tmdb.org/t/p/w300_and_h450_bestv2"
        let cell = tableView.dequeueReusableCell(withIdentifier: NSStringFromClass(Cell.self), for: indexPath) as! Cell
        cell.accessoryType = .disclosureIndicator
        
        let indicator = Indicator()
        indicator.showIndicator(view: cell.poster)
        
        var tmp_lists: [Movies.Data] = []
        
        if searchController.isActive {
            tmp_lists = searchResults
        }else {
            tmp_lists = movies
        }
        
        let urlRequest = URL(string: base_url+tmp_lists[indexPath.row].poster)!
        
        cell.title.text = tmp_lists[indexPath.row].title
        cell.onomatopoeia.text = tmp_lists[indexPath.row].onomatopoeia.joined(separator: " ")
        cell.poster.af_setImage(withURL: urlRequest) { res in
            indicator.stopIndicator()
        }
        cell.add.text = tmp_lists[indexPath.row].add
        
        ChangeButtonColor(cell: cell, list: tmp_lists, indexPath: indexPath)
        
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        print("HOGEOHGE:", indexPath)
        tableView.deselectRow(at: indexPath, animated: true)
    }
    
    func updateSearchResults(for searchController: UISearchController) {
        self.searchResults = movies.filter{
            $0.title.lowercased().contains(searchController.searchBar.text!.lowercased()) || IsContainOnomatopoeia(onomatopoeia: $0.onomatopoeia)
        }
        myTableView.reloadData()
    }
    
    func IsContainOnomatopoeia(onomatopoeia: [String]) -> Bool {
        for name in onomatopoeia {
            if name.lowercased().contains(searchController.searchBar.text!.lowercased()) {
                return true
            }
        }
        return false
    }
    
    func ChangeButtonColor(cell: Cell, list: [Movies.Data], indexPath: IndexPath) {
        var dvd_color = UIColor()
        var fav_color = UIColor()
        
        if list[indexPath.row].dvd {
            dvd_color = UIColor.hex(Color.main.rawValue, alpha: 1.0)
        }else {
            dvd_color = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        }
        
        if list[indexPath.row].fav {
            fav_color = UIColor.hex(Color.red.rawValue, alpha: 1.0)
        }else {
            fav_color = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        }
        
        cell.dvd.tintColor = dvd_color
        cell.fav.tintColor = fav_color
    }
    
    func CallMoviesAPI(id: String) {
        let activityData = ActivityData(message: "Get Movies", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "get-movies").async {
            let urlString = API.base.rawValue+API.v1.rawValue+API.movies.rawValue+"?user_id=\(12)"
            Alamofire.request(urlString, method: .get).responseJSON { (response) in
                let obj = JSON(response.result.value)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    self.movies.removeAll()
                    
                    for movie in obj["results"].arrayValue {
                        self.movies.append(Movies().GetData(json: movie))
                    }
                    
                    self.myTableView.reloadData()
                    
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
    
    func tabBarController(_ tabBarController: UITabBarController, didSelect viewController: UIViewController) {
        if viewController.restorationIdentifier! == "Movies" && preViewName == "Movies" {
            myTableView.scroll(to: .top, animated: true)
        }
        
        preViewName = viewController.restorationIdentifier!
    }

}

class Cell: UITableViewCell {
    var title: UILabel!
    var onomatopoeia: UILabel!
    var add: UILabel!
    var poster: UIImageView!
    var save_icon: UIImageView!
    var dvd: UIButton!
    var fav: UIButton!
    
    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        
        title = UILabel(frame: CGRect.zero)
        title.textAlignment = .left
        title.lineBreakMode = .byTruncatingTail
        title.font = UIFont.systemFont(ofSize: 22)
        
        onomatopoeia = UILabel(frame: CGRect.zero)
        onomatopoeia.textAlignment = .left
        onomatopoeia.lineBreakMode = .byWordWrapping
        onomatopoeia.font = UIFont.systemFont(ofSize: 18)
        
        save_icon = UIImageView(frame: CGRect.zero)
        save_icon.image = UIImage(named: "icon_save")
        save_icon.image = save_icon.image!.withRenderingMode(.alwaysTemplate)
        save_icon.tintColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        
        add = UILabel(frame: CGRect.zero)
        add.textAlignment = .left
        add.font = UIFont.systemFont(ofSize: 14)
        add.textColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        
        dvd = UIButton(frame: CGRect.zero)
        dvd.setImage(UIImage(named: "icon_dvd")?.withRenderingMode(.alwaysTemplate), for: .normal)
        dvd.tintColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        
        fav = UIButton(frame: CGRect.zero)
        fav.setImage(UIImage(named: "icon_fav")?.withRenderingMode(.alwaysTemplate), for: .normal)
        fav.tintColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        
        contentView.addSubview(title)
        contentView.addSubview(onomatopoeia)
        contentView.addSubview(save_icon)
        contentView.addSubview(add)
        contentView.addSubview(dvd)
        contentView.addSubview(fav)
        
        poster = UIImageView()
        contentView.addSubview(poster)
    }
    
    required init(coder aDecoder: NSCoder) {
        fatalError("init(coder: ) has not been implemented")
    }
    
    override func prepareForReuse() {
        super.prepareForReuse()
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        let button_wh = 25 as CGFloat
        let icon_wh = 20 as CGFloat
        
        poster.frame = CGRect(x: 0, y: 0, width: contentView.frame.height/1.5, height: contentView.frame.height)
        
        title.trailing(to: contentView)
        title.leadingToTrailing(of: poster, offset: 20)
        title.top(to: contentView, offset: 5)
        
        onomatopoeia.trailing(to: contentView)
        onomatopoeia.topToBottom(of: title, offset: 5)
        onomatopoeia.leadingToTrailing(of: poster, offset: 20)
        
        add.trailing(to: contentView, offset: 0)
        add.bottom(to: contentView, offset: -10)
        
        save_icon.trailingToLeading(of: add, offset: -10)
        save_icon.centerY(to: add)
        save_icon.width(icon_wh)
        save_icon.height(icon_wh)
        
        dvd.leadingToTrailing(of: poster, offset: 20)
        dvd.centerY(to: save_icon)
        dvd.width(button_wh)
        dvd.height(button_wh)
        
        fav.leadingToTrailing(of: dvd, offset: 40)
        fav.centerY(to: dvd)
        fav.width(button_wh)
        fav.height(button_wh)
    }
    
}
