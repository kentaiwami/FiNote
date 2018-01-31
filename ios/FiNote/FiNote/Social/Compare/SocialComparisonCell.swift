//
//  SocialComparisonCell.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/31.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

class SocialComparisonCell: UICollectionViewCell {
    
    var onomatopoeia : UILabel!
    var icon: UIImageView!
    var count: UILabel!
    
    required init(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)!
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        
        onomatopoeia = UILabel()
        onomatopoeia.font = UIFont(name: Font.helveticaneue.rawValue, size: 16)
        
        icon = UIImageView(frame: CGRect.zero)
        icon.image = UIImage(named: "icon_users")
        icon.image = icon.image!.withRenderingMode(.alwaysTemplate)
        icon.tintColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        
        count = UILabel(frame: CGRect.zero)
        count.font = UIFont(name: Font.helveticaneue.rawValue, size: 14)
        count.textColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        
        contentView.addSubview(onomatopoeia)
        contentView.addSubview(icon)
        contentView.addSubview(count)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        let icon_wh = 20 as CGFloat
        onomatopoeia.center(in: contentView)
        
        icon.topToBottom(of: onomatopoeia, offset: 5)
        icon.centerX(to: onomatopoeia, offset: -10)
        icon.width(icon_wh)
        icon.height(icon_wh)
        
        count.centerY(to: icon, offset: 0)
        count.leadingToTrailing(of: icon, offset: 5)
    }
}
