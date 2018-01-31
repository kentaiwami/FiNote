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
    var add_date: UILabel!
    var poster: UIImageView!
    var added_list_icon: UIImageView!
    
    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        
        title = UILabel(frame: CGRect.zero)
        title.textAlignment = .left
        title.lineBreakMode = .byTruncatingTail
        title.font = UIFont(name: Font.helveticaneue_B.rawValue, size: 16)
        
        onomatopoeia = UILabel(frame: CGRect.zero)
        onomatopoeia.textAlignment = .left
        onomatopoeia.lineBreakMode = .byWordWrapping
        onomatopoeia.numberOfLines = 0
        onomatopoeia.font = UIFont(name: Font.helveticaneue.rawValue, size: 16)
        
        added_list_icon = UIImageView(frame: CGRect.zero)
        added_list_icon.image = UIImage(named: "icon_add_list")
        added_list_icon.image = added_list_icon.image!.withRenderingMode(.alwaysTemplate)
        added_list_icon.tintColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        
        add_date = UILabel(frame: CGRect.zero)
        add_date.textAlignment = .left
        add_date.font = UIFont(name: Font.helveticaneue.rawValue, size: 14)
        add_date.textColor = UIColor.hex(Color.gray.rawValue, alpha: 1.0)
        
        contentView.addSubview(title)
        contentView.addSubview(onomatopoeia)
        contentView.addSubview(added_list_icon)
        contentView.addSubview(add_date)
        
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
        
        add_date.trailing(to: contentView, offset: 0)
        add_date.bottom(to: contentView, offset: -10)
        
        added_list_icon.trailingToLeading(of: add_date, offset: -5)
        added_list_icon.centerY(to: add_date, offset: 1)
        added_list_icon.width(icon_wh)
        added_list_icon.height(icon_wh)
    }
}
