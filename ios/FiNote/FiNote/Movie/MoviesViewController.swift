//
//  MoviesViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/22.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

class MoviesViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let myTableView = UITableView(frame: view.frame, style: .plain)
        myTableView.rowHeight = 150
        myTableView.delegate      =   self
        myTableView.dataSource    =   self
        myTableView.register(MyCell.self, forCellReuseIdentifier: NSStringFromClass(MyCell.self))
        self.view.addSubview(myTableView)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        self.tabBarController?.navigationItem.title = "Movies"
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return 20
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: NSStringFromClass(MyCell.self), for: indexPath) as! MyCell
        cell.myLabel.text = "まぐろ"
        cell.accessoryType = .disclosureIndicator
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        print("HOGEOHGE:", indexPath)
        tableView.deselectRow(at: indexPath, animated: true)
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
