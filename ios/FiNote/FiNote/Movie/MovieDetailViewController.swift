//
//  MovieDetailViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/25.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

class MovieDetailViewController: UIViewController {

    var movie = Movies.Data()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = UIColor.blue        
    }
    
    func SetMovie(movie: Movies.Data) {
        self.movie = movie
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
