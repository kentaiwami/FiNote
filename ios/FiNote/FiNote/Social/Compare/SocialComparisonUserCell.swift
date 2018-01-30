//
//  SocialComparisonUserCell.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/31.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

class SocialComparisonUserCell: UICollectionViewCell {
    var onomatopoeia: UILabel!
    
    required init(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)!
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        
        onomatopoeia = UILabel()
        onomatopoeia.font = UIFont.systemFont(ofSize: 16)
        
        contentView.addSubview(onomatopoeia)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        onomatopoeia.center(in: contentView)
    }
}
