//
//  DVDTableViewController.swift
//  DVDRental
//
//  Created by Adam Fish on 3/12/17.
//  Copyright © 2017 Adam Fish. All rights reserved.
//

import UIKit
import RealmSwift

class DVDTableViewController: UITableViewController {
    var realm = try! Realm()
    var filmNotificationToken: NotificationToken? = nil
    var inventoryNotificationToken: NotificationToken? = nil
    var films: Results<Film>!

    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.rowHeight = UITableViewAutomaticDimension
        tableView.estimatedRowHeight = 44

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
        
        films = realm.objects(Film.self).sorted(byKeyPath: "film_id", ascending: true)
        
        // Here's the important bit about how easy it is to deal with remote data in Realm:
        // Realm supports notifications that fire whenever data changes in a Realm you are watching;
        // In this case we're watching for changes our Films, we can implement it like this:
        filmNotificationToken = films.addNotificationBlock { [weak self] (changes: RealmCollectionChange) in
            guard let tableView = self?.tableView else { return }
            switch changes {
            case .initial:
                // Results are now populated and can be accessed without blocking the UI
                tableView.reloadData()
                break
            case .update(_, let deletions, let insertions, let modifications):
                // Query results have changed, so apply them to the UITableView
                tableView.beginUpdates()
                tableView.insertRows(at: insertions.map({ IndexPath(row: $0, section: 0) }),
                                     with: .automatic)
                tableView.deleteRows(at: deletions.map({ IndexPath(row: $0, section: 0)}),
                                     with: .automatic)
                tableView.reloadRows(at: modifications.map({ IndexPath(row: $0, section: 0) }),
                                     with: .automatic)
                tableView.endUpdates()
                break
            case .error(let error):
                // An error occurred while opening the Realm file on the background worker thread
                fatalError("\(error)")
                break
            }
        }
        
        // Given the film stock is a computed property from the inverse relationships to inventory
        // We must listen for changes on inventory objects, since updates don't 
        // propagate up across inverse relationships
        let stock = realm.objects(Inventory.self)
        inventoryNotificationToken = stock.addNotificationBlock({ [weak self] (changes: RealmCollectionChange) in
            guard let `self` = self else { return }
            guard let tableView = self.tableView else { return }
            switch changes {
            case .initial:
                break
            case .update(_, _, _, _):
                tableView.reloadData()
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
    
    deinit {
        filmNotificationToken?.stop()
        inventoryNotificationToken?.stop()
    }

    // MARK: - Table view data source

    override func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return films?.count ?? 0
    }


    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: kDVDCellIdentifier, for: indexPath) as! DVDTableViewCell
        let film = films[indexPath.row]
        // Configure the cell...
        cell.filmTitle.text = film.title
        cell.stockLabel.text = "In Stock: \(film.stock.count)"
        //cell.filmDescription.text = film.description

        return cell
    }

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if segue.identifier == kMainToDetailsSegue {
            let indexPath = tableView.indexPathForSelectedRow
            
            let vc = segue.destination as? DVDViewController
            vc?.film = films[indexPath!.row]
        }
    }

}

extension DVDTableViewController: UISearchBarDelegate {
    public func searchBar(_ searchBar: UISearchBar, textDidChange searchText: String) {
        if searchText == "" {
            films = realm.objects(Film.self).sorted(byKeyPath: "film_id", ascending: true)
        }
        else {
            films = realm.objects(Film.self).sorted(byKeyPath: "film_id", ascending: true).filter("title CONTAINS %@", searchText)
        }
        tableView.reloadData()
    }
}
