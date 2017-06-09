//
//  DVDRentalLoginViewController.swift
//  DVDRental
//
//  Created by Adam Fish on 3/12/17.
//  Copyright © 2017 Adam Fish. All rights reserved.
//

import UIKit
import RealmSwift
import RealmLoginKit

class DVDRentalLoginViewController: UIViewController {
    var loginViewController: LoginViewController!

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        loginViewController = LoginViewController(style: .lightOpaque)
        
        if (SyncUser.current != nil) {
            setDefaultRealmConfigurationWithUser(user: SyncUser.current!, hostname: defaultSyncHost)
            
            performSegue(withIdentifier: kLoginToMainSegue, sender: self)
        }
        else {
            // show the RealmLoginKit controller
            if loginViewController!.serverURL == nil {
                loginViewController!.serverURL = defaultSyncHost
            }
            // Set a closure that will be called on successful login
            loginViewController.loginSuccessfulHandler = { [weak self] user in
                setDefaultRealmConfigurationWithUser(user: SyncUser.current!, hostname: self!.loginViewController.serverURL!)
                self!.loginViewController!.dismiss(animated: true, completion: nil)
                self!.performSegue(withIdentifier: kLoginToMainSegue, sender: self)
            }
            
            present(loginViewController, animated: true, completion: nil)
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
}
