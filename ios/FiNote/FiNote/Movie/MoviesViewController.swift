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
import KeychainAccess
import PopupDialog

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
        
        myTableView = UITableView(frame: view.frame, style: .plain)
        myTableView.rowHeight = 150
        myTableView.delegate = self
        myTableView.dataSource = self
        myTableView.register(MyCell.self, forCellReuseIdentifier: NSStringFromClass(MyCell.self))
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
        let cell = tableView.dequeueReusableCell(withIdentifier: NSStringFromClass(MyCell.self), for: indexPath) as! MyCell
        cell.myLabel.text = movies[indexPath.row].title
        cell.accessoryType = .disclosureIndicator
        
        if searchController.isActive {
            cell.myLabel.text = searchResults[indexPath.row].title
        } else {
            cell.myLabel.text = movies[indexPath.row].title
        }

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
    
    func CallMoviesAPI(id: String) {
        let activityData = ActivityData(message: "Get Movies", type: .lineScaleParty)
        NVActivityIndicatorPresenter.sharedInstance.startAnimating(activityData)
        
        DispatchQueue(label: "get-movies").async {
            let urlString = API.base.rawValue+API.v1.rawValue+API.movies.rawValue+"?user_id=\(11)"
            print(urlString)
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

class MyCell: UITableViewCell {
    var myLabel: UILabel!
    var myImage: UIImage!
    var myImageView: UIImageView!
    
    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        
        myLabel = UILabel(frame: CGRect.zero)
        myLabel.textAlignment = .left
        contentView.addSubview(myLabel)
        
        myImage = UIImage(named: "1.jpg")
        myImageView = UIImageView(image: myImage)
        contentView.addSubview(myImageView)
    }
    
    required init(coder aDecoder: NSCoder) {
        fatalError("init(coder: ) has not been implemented")
    }
    
    override func prepareForReuse() {
        super.prepareForReuse()
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        myLabel.frame = CGRect(x: 110, y: 0, width: frame.width - 100, height: frame.height)
        myImageView.frame = CGRect(x: 0, y: 0, width: 100, height: frame.height)
    }
    
}
