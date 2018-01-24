//
//  MoviesCell.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/25.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import UIKit

class MoviesCell: UITableViewCell {
    var title: UILabel!
    var onomatopoeia: UILabel!
    var add: UILabel!
    var poster: UIImageView!
    var save_icon: UIImageView!
    
    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        
        title = UILabel(frame: CGRect.zero)
        title.textAlignment = .left
        title.lineBreakMode = .byTruncatingTail
        title.font = UIFont.systemFont(ofSize: 22)
        
        onomatopoeia = UILabel(frame: CGRect.zero)
        onomatopoeia.textAlignment = .left
        onomatopoeia.lineBreakMode = .byWordWrapping
        onomatopoeia.numberOfLines = 0
        onomatopoeia.font = UIFont.systemFont(ofSize: 18)
        
        save_icon = UIImageView(frame: CGRect.zero)
        save_icon.image = UIImage(named: "icon_save")
        save_icon.image = save_icon.image!.withRenderingMode(.alwaysTemplate)
        save_icon.tintColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        
        add = UILabel(frame: CGRect.zero)
        add.textAlignment = .left
        add.font = UIFont.systemFont(ofSize: 14)
        add.textColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        
        contentView.addSubview(title)
        contentView.addSubview(onomatopoeia)
        contentView.addSubview(save_icon)
        contentView.addSubview(add)
        
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
        
        title.trailing(to: contentView)
        title.leadingToTrailing(of: poster, offset: 20)
        title.top(to: contentView, offset: 5)
        
        onomatopoeia.trailing(to: contentView)
        onomatopoeia.topToBottom(of: title, offset: 5)
        onomatopoeia.leadingToTrailing(of: poster, offset: 20)
        
        add.trailing(to: contentView, offset: 0)
        add.bottom(to: contentView, offset: -10)
        
        save_icon.trailingToLeading(of: add, offset: -10)
        save_icon.centerY(to: add)
        save_icon.width(icon_wh)
        save_icon.height(icon_wh)
    }
}
