//
//  SocialByAgeViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/29.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

class SocialByAgeViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource {
    
    var contentView: UIView!
    var latestView: UIView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.view.backgroundColor = UIColor.clear
        DrawViews()
    }
    
    func DrawViews() {
        InitScrollView()
        CreateSection(text: "10代", isTop: true)
        CreateCollectionView(tag: 1)
        
        for i in 2...5 {
            CreateSection(text: "\(i)0代", isTop: false)
            CreateCollectionView(tag: i)
        }
        
        contentView.bottom(to: latestView, offset: 50)
    }
    
    func InitScrollView() {
        let scrollView = UIScrollView()
        scrollView.frame = CGRect(x: 0, y: 0, width: self.view.bounds.width, height: self.view.bounds.height)
        self.view.addSubview(scrollView)
        
        scrollView.top(to: self.view)
        scrollView.leading(to: self.view)
        scrollView.trailing(to: self.view)
        scrollView.bottom(to: self.view)
        
        contentView = UIView()
        scrollView.addSubview(contentView)
        contentView.top(to: scrollView)
        contentView.leading(to: scrollView)
        contentView.trailing(to: scrollView)
        contentView.bottom(to: scrollView)
        contentView.width(to: scrollView)
        
        latestView = contentView
    }
    
    func CreateSection(text: String, isTop: Bool) {
        let label = UILabel(frame: CGRect.zero)
        label.text = text
        label.font = UIFont.systemFont(ofSize: 22)
        contentView.addSubview(label)
        
        label.leading(to: contentView, offset: 20)
        
        if isTop {
            label.top(to: latestView, offset: 20)
        }else {
            label.topToBottom(of: latestView, offset: 20)
        }
        
        latestView = label
    }
    
    func CreateCollectionView(tag: Int) {
        let w = 150 as CGFloat
        let h = w*1.5 as CGFloat
        let margin = (self.view.frame.width - w*2) / 4
        
        let layout = UICollectionViewFlowLayout()
        layout.itemSize = CGSize(width: w, height: h)
        layout.minimumInteritemSpacing = margin
        layout.minimumLineSpacing = margin
        layout.sectionInset = UIEdgeInsets(top: 16, left: 16, bottom: 32, right: 16)
        layout.scrollDirection = .horizontal
        
        let collectionView = UICollectionView(frame: CGRect.zero, collectionViewLayout: layout)
        collectionView.register(SocialByAgeCell.self, forCellWithReuseIdentifier: "MyCell")
        collectionView.delegate = self
        collectionView.dataSource = self
        collectionView.tag = tag
        contentView.addSubview(collectionView)
        
        collectionView.topToBottom(of: latestView, offset: 10)
        collectionView.leading(to: contentView, offset: 20 - margin)
        collectionView.width(to: contentView)
        collectionView.height(h)
        
        latestView = collectionView
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        print("Num: \(indexPath.row)")
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return 15
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell : SocialByAgeCell = collectionView.dequeueReusableCell(withReuseIdentifier: "MyCell", for: indexPath as IndexPath) as! SocialByAgeCell
        cell.textLabel?.text = String(indexPath.section)
        cell.backgroundColor = UIColor.red
        
        return cell
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}
