//
//  MovieAddSearchCell.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/27.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

class MovieAddSearchCell: UITableViewCell {
    var title: UILabel!
    var overview: UILabel!
    var poster: UIImageView!
    var public_date: UILabel!
    var public_date_icon: UIImageView!
    
    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        
        title = UILabel(frame: CGRect.zero)
        title.textAlignment = .left
        title.lineBreakMode = .byTruncatingTail
        title.font = UIFont.systemFont(ofSize: 20)
        
        poster = UIImageView()
        contentView.addSubview(poster)
    }
    
    required init(coder aDecoder: NSCoder) {
        fatalError("init(coder: ) has not been implemented")
    }
    
    override func prepareForReuse() {
        super.prepareForReuse()
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        let icon_wh = 20 as CGFloat
        
        poster.frame = CGRect(x: 0, y: 0, width: contentView.frame.height/1.5, height: contentView.frame.height)
        
//        title.trailing(to: contentView)
//        title.leadingToTrailing(of: poster, offset: 20)
//        title.top(to: contentView, offset: 5)
    }

}
