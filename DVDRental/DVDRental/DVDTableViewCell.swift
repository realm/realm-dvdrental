//
//  DVDTableViewCell.swift
//  DVDRental
//
//  Created by Adam Fish on 3/13/17.
//  Copyright © 2017 Adam Fish. All rights reserved.
//

import UIKit

class DVDTableViewCell: UITableViewCell {
    @IBOutlet weak var filmTitle: UILabel!
    @IBOutlet weak var stockLabel: UILabel!
    @IBOutlet weak var filmDescription: UILabel!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}
