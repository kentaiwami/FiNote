//
//  MovieAddSearchOriginTitlesViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/28.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

class MovieAddSearchOriginTitlesViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {
    
    let test = ["A", "B", "C", "D", "E", "F"]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.navigationItem.title = "Titles"
        let close = UIBarButtonItem(image: UIImage(named: "icon_cancel"), style: .plain, target: self, action: #selector(TapCloseButton))
        self.navigationItem.setLeftBarButton(close, animated: true)
        
        CallOriginTitles()
    }
    
    func TapCloseButton() {
        self.dismiss(animated: true, completion: nil)
    }
    
    func CallOriginTitles() {
        InitTableView()
    }
    
    func InitTableView() {
        let tableview = UITableView()
        tableview.delegate = self
        tableview.dataSource = self
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return test.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: UITableViewCellStyle.default, reuseIdentifier: "myCell")
        cell.textLabel?.text = test[indexPath.row]
        return cell
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
