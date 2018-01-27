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
import StatusProvider

class MoviesViewController: UIViewController, UITableViewDelegate, UITableViewDataSource, UITabBarControllerDelegate, UISearchResultsUpdating, StatusController {
    
    var appdelegate = GetAppDelegate()
    var searchResults:[Movies.Data] = []
    var preViewName = "Movies"
    var myTableView = UITableView()
    var searchController = UISearchController()
    var refresh_controll = UIRefreshControl()
    var user_id = ""

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let keychain = Keychain()
        user_id = (try! keychain.getString("id"))!
        
        let add = UIBarButtonItem(image: UIImage(named: "icon_add"), style: .plain, target: self, action: #selector(TapAddButton))
        self.tabBarController?.navigationItem.setRightBarButton(add, animated: true)
        
        self.CallMoviesAPI()
    }
    
    func TapAddButton() {
        let add_searchVC = MovieAddSearchViewController()
        self.navigationController!.pushViewController(add_searchVC, animated: true)
    }
    
    func ShowLoadData() {
        Init()
        
        let main_width = UIScreen.main.bounds.width
        let width = main_width * 0.2
        let height = width * 1.5
        
        myTableView = UITableView(frame: view.frame, style: .plain)
        myTableView.rowHeight = height
        myTableView.delegate = self
        myTableView.dataSource = self
        myTableView.register(MoviesCell.self, forCellReuseIdentifier: NSStringFromClass(MoviesCell.self))
        myTableView.autoresizingMask = UIViewAutoresizing(rawValue: UIViewAutoresizing.RawValue(UInt8(UIViewAutoresizing.flexibleHeight.rawValue) | UInt8(UIViewAutoresizing.flexibleWidth.rawValue)))
        
        searchController = UISearchController(searchResultsController: nil)
        searchController.searchResultsUpdater = self
        searchController.searchBar.sizeToFit()
        searchController.dimsBackgroundDuringPresentation = false
        searchController.hidesNavigationBarDuringPresentation = false
        searchController.searchBar.placeholder = "タイトルやオノマトペで絞り込む"
        definesPresentationContext = true
        
        myTableView.tableHeaderView = searchController.searchBar
        myTableView.refreshControl = refresh_controll
        refresh_controll.addTarget(self, action: #selector(self.refresh(sender:)), for: .valueChanged)
        
        self.tabBarController?.delegate = self
        self.view.addSubview(myTableView)
    }
    
    func ShowNoDataView() {
        Init()
        
        let status = Status(title: "No Data", description: "映画を登録するとデータが表示されます", actionTitle: "Reload", image: nil) {
            self.hideStatus()
            self.CallMoviesAPI()
        }
        
        show(status: status)
    }
    
    func Init() {
        myTableView.removeFromSuperview()
        myTableView = UITableView()
        searchController = UISearchController()
        refresh_controll = UIRefreshControl()
    }
    
    func refresh(sender: UIRefreshControl) {
        refresh_controll.beginRefreshing()
        CallMoviesAPI()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        self.tabBarController?.navigationItem.title = "Movies"
        myTableView.reloadData()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if searchController.isActive {
            return searchResults.count
        } else {
            return appdelegate.movies.count
        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: NSStringFromClass(MoviesCell.self), for: indexPath) as! MoviesCell
        cell.accessoryType = .disclosureIndicator
        
        var tmp_lists: [Movies.Data] = []

        if searchController.isActive {
            tmp_lists = searchResults
        }else {
            tmp_lists = appdelegate.movies
        }
        
        let urlRequest = URL(string: API.poster_base.rawValue+tmp_lists[indexPath.row].poster)!
        
        cell.title.text = tmp_lists[indexPath.row].title
        cell.onomatopoeia.text = tmp_lists[indexPath.row].onomatopoeia.joined(separator: " ")
        cell.poster.af_setImage(
            withURL: urlRequest,
            placeholderImage: UIImage(named: "no_image")
        )
        cell.add_date.text = tmp_lists[indexPath.row].add
        
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        var tmp_lists: [Movies.Data] = []
        
        if searchController.isActive {
            tmp_lists = searchResults
        }else {
            tmp_lists = appdelegate.movies
        }
        
        let detailVC = MovieDetailViewController()
        detailVC.SetMovieID(movie_id: tmp_lists[indexPath.row].id)
        self.navigationController!.pushViewController(detailVC, animated: true)
    }
    
    func updateSearchResults(for searchController: UISearchController) {
        self.searchResults = appdelegate.movies.filter{
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
    
    func CallMoviesAPI() {
        let activityData = ActivityData(message: "Get Movies", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "get-movies").async {
            let urlString = API.base.rawValue+API.v1.rawValue+API.movies.rawValue+"?user_id=\(self.user_id)"
            Alamofire.request(urlString, method: .get).responseJSON { (response) in
                NVActivityIndicatorPresenter.sharedInstance.stopAnimating()
                self.refresh_controll.endRefreshing()
                
                guard let res = response.result.value else{return}
                let obj = JSON(res)
                print("***** API results *****")
                print(obj)
                print("***** API results *****")
                
                if IsHTTPStatus(statusCode: response.response?.statusCode) {
                    self.appdelegate.movies.removeAll()
                    
                    for movie in obj["results"].arrayValue {
                        self.appdelegate.movies.append(Movies().GetData(json: movie))
                    }
                    
                    if self.appdelegate.movies.count == 0 {
                        self.ShowNoDataView()
                    }else {
                        self.ShowLoadData()
                        self.myTableView.reloadData()
                    }
                }else {
                    ShowStandardAlert(title: "Error", msg: obj.arrayValue[0].stringValue, vc: self)
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
