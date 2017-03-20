import Foundation
import RealmSwift

class Film: Object {
    dynamic var film_id = 0
    dynamic var title = ""
    // TODO: Data Connector needs to support mapping
    //dynamic var description: String?
    let release_year = RealmOptional<Int>()
    dynamic var rental_duration = 0
    dynamic var rental_rate: Double = 0
    let length = RealmOptional<Int>()
    dynamic var replacement_cost: Double = 0
    dynamic var rating: String?
    dynamic var last_update = NSDate()
    dynamic var special_features: String?
    
    // Use Realm's inverse relationship support to retrieve
    // all inventory objects linking to the film
    //
    // The count reprsents the total in stock.
    let stock = LinkingObjects(fromType: Inventory.self, property: "film_id")

    override static func primaryKey() -> String? {
        return "film_id"
    }
}

class Inventory: Object {
    dynamic var external_id = ""
    let inventory_id = RealmOptional<Int>()
    dynamic var film_id: Film?
    dynamic var last_update = NSDate()
    dynamic var store_id = 0 // Store table not used, so just defaults

    override static func primaryKey() -> String? {
        return "external_id"
    }
}

