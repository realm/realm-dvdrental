//
//  DVDViewController.swift
//  DVDRental
//
//  Created by Adam Fish on 3/12/17.
//  Copyright © 2017 Adam Fish. All rights reserved.
//

import UIKit
import Eureka
import RealmSwift

class DVDViewController: FormViewController {
    let realm = try! Realm()
    var film: Film!
    var token: NotificationToken!
    var isUpdating = false

    override func viewDidLoad() {
        super.viewDidLoad()
        
        title = film.title

        let form = Form()
        form +++ Section(NSLocalizedString("Film Details", comment: "Film Details"))
            <<< TextRow(NSLocalizedString("Title", comment:"Title")) { row in
                row.tag = "Title"
                row.title = NSLocalizedString("Title", comment:"Title")
                row.value = film.title
                
                row.disabled = false
            }
            .cellUpdate({ [weak self] (cell, row) in
                row.value = self?.film.title
            })
            .onChange({ [weak self] (row) in
                try! Realm().write {
                    self?.film.title = row.value!
                }
            })
            
            <<< TextRow(NSLocalizedString("Rating", comment:"Rating")) { row in
                row.tag = "Rating"
                row.title = NSLocalizedString("Rating", comment:"Rating")
                row.value = film.rating
                
                row.disabled = true
                }
                .cellUpdate({ [weak self] (cell, row) in
                    row.value = self?.film.rating
                })
                .onChange({ [weak self] (row) in
                    try! Realm().write {
                        self?.film.rating = row.value!
                    }
                })
            
            <<< IntRow(NSLocalizedString("Release Year", comment:"Release Year")) { row in
                row.tag = "Release Year"
                row.title = NSLocalizedString("Release Year", comment:"Release Year")
                row.value = film.release_year.value
                
                let formatter = NumberFormatter()
                formatter.maximumFractionDigits = 0
                row.formatter = formatter
                
                row.disabled = true
            }.cellUpdate({ [weak self] (cell, row) in
                row.value = self?.film.release_year.value
            }).onChange({ [weak self] (row) in
                try! Realm().write {
                    self?.film.release_year.value = row.value
                }
            })
            
            <<< IntRow(NSLocalizedString("Length", comment:"Length")) { row in
                row.tag = "Length"
                row.title = NSLocalizedString("Length (min)", comment:"Length")
                row.value = film.length.value
                
                let formatter = NumberFormatter()
                formatter.maximumFractionDigits = 0
                row.formatter = formatter
                
                row.disabled = true
                }.cellUpdate({ [weak self] (cell, row) in
                    row.value = self?.film.length.value
                }).onChange({ [weak self] (row) in
                    try! Realm().write {
                        self?.film.length.value = row.value
                    }
                })
            
        +++ Section(NSLocalizedString("Rental Details", comment: "Rental Details"))
            
            <<< IntRow(NSLocalizedString("Rental Duration", comment:"Rental Duration")) { row in
                row.tag = "Rental Duration"
                row.title = NSLocalizedString("Rental Duration", comment:"Rental Duration")
                row.value = film.rental_duration
                
                let formatter = NumberFormatter()
                formatter.maximumFractionDigits = 0
                row.formatter = formatter
                
                row.disabled = true
                }.cellUpdate({ [weak self] (cell, row) in
                    row.value = self?.film.rental_duration
                }).onChange({ [weak self] (row) in
                    try! Realm().write {
                        self?.film.rental_duration = row.value!
                    }
                })
            
            <<< DecimalRow(NSLocalizedString("Rental Rate", comment:"Rental Rate")) { row in
                row.tag = "Rental Rate"
                row.title = NSLocalizedString("Rental Rate", comment:"Rental Rate")
                row.value = film.rental_rate
                
                row.disabled = true
                }.cellUpdate({ [weak self] (cell, row) in
                    row.value = self?.film.rental_rate
                }).onChange({ [weak self] (row) in
                    try! Realm().write {
                        self?.film.rental_rate = row.value!
                    }
                })
        
            <<< DecimalRow(NSLocalizedString("Replacement Cost", comment:"Replacement Cost")) { row in
                row.tag = "Replacement Cost"
                row.title = NSLocalizedString("Replacement Cost", comment:"Replacement Cost")
                row.value = film.replacement_cost
                
                row.disabled = true
                }.cellUpdate({ [weak self] (cell, row) in
                    row.value = self?.film.replacement_cost
                }).onChange({ [weak self] (row) in
                    try! Realm().write {
                        self?.film.replacement_cost = row.value!
                    }
                })
        
        +++ Section(NSLocalizedString("Current Inventory", comment: "Current Inventory"))
            <<< StepperRow("Add or Remove Inventory") { row in
                row.tag = "InventoryStepper"
                row.title = NSLocalizedString("In Stock:", comment: "Add or Remove Inventory")
                row.value = Double(film.stock.count)
                row.displayValueFor = { value in
                    if let stock = value {
                        return "\(Int(stock))"
                    }
                    return ""
                }
                }
                .cellSetup({ (cell, row) in
                    cell.stepper.minimumValue = 0
                })
                .onChange({ [weak self] (row) in
                    guard let `self` = self else { return }
                    // Increase inventory
                    if Int(row.cell.stepper.value) > self.film.stock.count &&
                        !self.isUpdating {
                        let newInventory = Inventory()
                        newInventory.film_id = self.film
                        newInventory.external_id = UUID().uuidString
                        
                        self.realm.beginWrite()
                        self.realm.add(newInventory)
                        try! self.realm.commitWrite(withoutNotifying: [self.token])
                    }
                    else if !self.isUpdating {
                        let sortedStock = self.film.stock.sorted(byKeyPath: "inventory_id", ascending: false)
                        if let highestInventory = sortedStock.first {
                            self.realm.beginWrite()
                            self.realm.delete(highestInventory)
                            try! self.realm.commitWrite(withoutNotifying: [self.token])
                        }
                    }
                })
        
        
        self.form = form
        
        token = realm.objects(Inventory.self)._addNotificationBlock({ [weak self] (changes) in
            guard let `self` = self else { return }
            switch changes {
            case .initial:
                break
            case .update(_, _, _, _):
                self.isUpdating = true
                let row = self.form.rowBy(tag: "InventoryStepper") as! StepperRow
                row.value = Double(self.film.stock.count)
                row.updateCell()
                self.isUpdating = false
                break
            case .error(let error):
                // An error occurred while opening the Realm file on the background worker thread
                fatalError("\(error)")
                break
            }
        })
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
