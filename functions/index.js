const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const cors = require('cors')({ origin: true });


// const db = admin.firestore("/users/Qahm87doicWrmkozQ10fGHb71Q82/Root");
// const db = require('firebase-da')
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// exports.getFolder = functions.https.onRequest((req, res) => {
//     // url = req.query.url;
//     // var docref = db.collection(url).doc('Folder');
//     // res.send("Hello");

//     // var docRef = db.collection('/users/Qahm87doicWrmkozQ10fGHb71Q82/Root').doc('Folder');
//     // docRef.getCollections()
//     //     .then(collection => {
//     //         collection.forEach(col => {
//     //             console.log(col);
//     //         })
//     //     })
//     //     .catch(err => {
//     //         console.log(err);
//     //     })
//     // db.getCollections('/users/Qahm87doicWrmkozQ10fGHb71Q82/Root')
//     res.status(200);
//     res.send('Hello');
// })

exports.getHello = functions.https.onRequest((req, res) => {
    cors(req, res, () => {



        // res.status(200);
        // if (req.method === 'OPTIONS') {
        //     // Send response to OPTIONS requests
        //     res.set('Access-Control-Allow-Methods', 'GET, POST');
        //     res.set('Access-Control-Max-Age', '3600');
        //     res.status(204).send('');
        // }

        // res.set('Access-Control-Allow-Origin', '*');
        // res.set('Access-Control-Allow-Origin', 'http://localhost:4200/');
        // res.set('Access-Control-Allow-Methods', 'GET, POST')
        let url = req.body.url;

        // res.send('HEllo World' + url).status(200);

        var docref = db.collection(url).doc('Folder');

        docref.getCollections().then(rcc => {
            let arr = [];
            rcc.forEach(c => {
                // arr = arr + '/' + c.id;
                arr.push(c.id);
            });

            res.send(arr).status(200);
            return;
        }).catch(err => {
            res.send(err).status(404);
        })
    })

});

// exports.getfolder = functions.https.onRequest((req, res) => {
//     "use strict";
//     // url = req.body;
//     // console.log(url);
//     // res.send(url);
//     // var docref = db.collection('users/Qahm87doicWrmkozQ10fGHb71Q82/Root').doc('Folder');
//     res.send('Hello')

//     // docref.getCollections().then(rcc => {
//     //     // return rcc;
//     //     // return rcc;
//     //     res.send(rcc);
//     //     // var arr = [];

//     //     // rcc.forEach(items => {


//     //     //     arr = items.id;
//     //     //     console.log();

//     //     // });
//     //     // return arr;
//     // }).catch(err => {
//     //     res.send(err);
//     // });
// });
