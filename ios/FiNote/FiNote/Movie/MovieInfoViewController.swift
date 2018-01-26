//
//  MovieInfoViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/26.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import Eureka

class MovieInfoViewController: FormViewController {

    var onomatopoeia: [String] = []
    var dvd = false
    var fav = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
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

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
