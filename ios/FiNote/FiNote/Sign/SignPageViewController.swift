//
//  SignPageViewController.swift
//  FiNote
//
//  Created by 岩見建汰 on 2018/01/21.
//  Copyright © 2018年 Kenta. All rights reserved.
//

import XLPagerTabStrip

class SignPageViewController: ButtonBarPagerTabStripViewController, IndicatorInfoProvider {

    override func viewDidLoad() {
        let main_color = UIColor.hex(Color.main.rawValue, alpha: 1.0)
        
        settings.style.buttonBarItemBackgroundColor = UIColor.clear
        settings.style.buttonBarItemTitleColor = UIColor.clear
        
        super.viewDidLoad()
        let navBarHeight = (self.navigationController?.navigationBar.frame.size.height)!
        let y = (self.navigationController?.navigationBar.frame.origin.y)!
        
        buttonBarView.selectedBar.backgroundColor = main_color
        buttonBarView.backgroundColor = UIColor.clear
        buttonBarView.frame = CGRect(x: 0, y: navBarHeight+y, width: buttonBarView.frame.width, height: buttonBarView.frame.height)
        
        changeCurrentIndexProgressive = { (oldCell: ButtonBarViewCell?, newCell: ButtonBarViewCell?, progressPercentage: CGFloat, changeCurrentIndex: Bool, animated: Bool) -> Void in
            guard changeCurrentIndex == true else { return }
            
            oldCell?.label.textColor = UIColor.black
            newCell?.label.textColor = UIColor.hex(Color.main.rawValue, alpha: 1.0)
        }
        
        self.view.backgroundColor = UIColor.white
        self.navigationItem.title = "FiNote"
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
    
    override func viewControllers(for pagerTabStripController: PagerTabStripViewController) -> [UIViewController] {
        return [SignUpViewController(), SignInViewController()]
    }
    
    func indicatorInfo(for pagerTabStripController: PagerTabStripViewController) -> IndicatorInfo {
        return IndicatorInfo(title: "My Child title")
    }
}
