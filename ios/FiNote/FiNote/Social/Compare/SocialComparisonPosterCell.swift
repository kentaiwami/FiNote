//
//  SocialComparisonPosterCell.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/31.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

class SocialComparisonPosterCell: UICollectionViewCell {
    var poster: UIImageView!
    
    required init(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)!
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        
        poster = UIImageView(frame: CGRect.zero)
        poster.frame = CGRect(x: 0, y: 0, width: contentView.frame.width, height: contentView.frame.height)
        poster.layer.shadowOpacity = 0.5
        poster.layer.shadowColor = UIColor.black.cgColor
        poster.layer.shadowOffset = CGSize(width: 1, height: 1)
        poster.layer.shadowRadius = 3
        poster.layer.masksToBounds = false
        
        contentView.addSubview(poster)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
    }
}
