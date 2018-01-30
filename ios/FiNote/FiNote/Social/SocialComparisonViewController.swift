//
//  SocialComparisonViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/29.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit
import UPCarouselFlowLayout

class SocialComparisonViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource {

    var collectionView = UICollectionView(frame: CGRect(), collectionViewLayout: UICollectionViewLayout())
    let cellId = "MyCell"
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.backgroundColor = UIColor.white
        
        InitCollectionView()
    }
    
    func InitCollectionView() {
        let w = 150.0 as CGFloat
        let h = w*1.5 as CGFloat
        
        let layout = UPCarouselFlowLayout()
        layout.itemSize = CGSize(width: w, height: h)
        layout.scrollDirection = .horizontal
        
        collectionView = UICollectionView(frame: CGRect(x: 0, y: 0, width: self.view.frame.width, height: h), collectionViewLayout: layout)
        collectionView.backgroundColor = UIColor.white
        collectionView.register(UICollectionViewCell.self, forCellWithReuseIdentifier: cellId)
        collectionView.delegate = self
        collectionView.dataSource = self
        self.view.addSubview(collectionView)
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        //TODO: 個数
        return 5
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: cellId, for: indexPath)
        
        for subview in cell.contentView.subviews {
            subview.removeFromSuperview()
        }
        
        let urlRequest = URL(string: API.poster_base.rawValue+"/sdpYt0L8PAddzUDYeMcZHxZyf1L.jpg")!
        let poster = UIImageView()
        poster.af_setImage(
            withURL: urlRequest,
            placeholderImage: UIImage(named: "no_image")
        )
        poster.frame = CGRect(x: 0, y: 0, width: cell.contentView.frame.width, height: cell.contentView.frame.height)
        poster.layer.shadowOpacity = 0.5
        poster.layer.shadowColor = UIColor.black.cgColor
        poster.layer.shadowOffset = CGSize(width: 1, height: 1)
        poster.layer.shadowRadius = 3
        poster.layer.masksToBounds = false
        cell.contentView.addSubview(poster)
        
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        //TODO: タップ時
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
