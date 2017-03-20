//
//  Constants.swift
//  DVDRental
//
//  Created by Adam Fish on 3/13/17.
//  Copyright © 2017 Adam Fish. All rights reserved.
//

import Foundation
import RealmSwift

// MARK: - Realm Object Server Config
let defaultSyncHost                 = "127.0.0.1"
let syncRealmPath                   = "dvdrental"

// MARK: - UITableViewCell Identifiers
let kDVDCellIdentifier              = "DVDCell"

// MARK: - Segue
let kLoginToMainSegue               = "main"
let kMainToDetailsSegue             = "dvd"

// MARK: - Helper Functions
func syncServerURL(hostname: String) -> URL {
    return  URL(string: "realm://\(hostname):9080/\(syncRealmPath)")!
}

func syncAuthURL(hostName: String) -> URL {
    return  URL(string: "http://\(hostName):9080")!
}

func setDefaultRealmConfigurationWithUser(user: SyncUser, hostname: String) {
    Realm.Configuration.defaultConfiguration = Realm.Configuration(
        syncConfiguration: SyncConfiguration(user: user, realmURL:syncServerURL(hostname: hostname) ),
        objectTypes: [Film.self, Inventory.self]
    )
}
