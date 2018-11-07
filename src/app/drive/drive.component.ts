import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-drive',
  templateUrl: './drive.component.html',
  styleUrls: ['./drive.component.css']
})
export class DriveComponent implements OnInit {

  // Main task
  task: AngularFireUploadTask;

  // Progress monitoring
  percentage: Observable<number>;

  snapshot: Observable<any>;

  // Download URL
  downloadURL: Observable<string>;

  // State for dropzone CSS toggling
  isHovering: boolean;


  user;

  userData;

  imageFiles: any[] = [];
  folders;

  constructor(private storage: AngularFireStorage,
    private db: AngularFirestore,
    private auth: AuthService,
    private afs: AngularFirestore) {
    this.auth.user.subscribe(user => {
      this.user = user;

      this.afs.collection(`users/${this.user.uid}/Root`).doc('Folder');
      this.afs.collection(`users/${this.user.uid}/Root`).doc('Folder').valueChanges().subscribe(a => {
        console.log(a);
      });
      // this.afs.doc(x.path).valueChanges().subscribe(z => {
      //   console.log(z);
      // });
      /* this.afs.collection(`users/${this.user.uid}/Root`).snapshotChanges().subscribe(i => {
              i.map(x => {
                console.log(x.payload.doc.data());
                console.log(x.payload.doc.id);
              });
            }); */
      // this.afs.doc(`users/${this.user.uid}/Root/Folder`).get();


      this.afs.collection(`users/${this.user.uid}/Root`).snapshotChanges().subscribe(item => {
        item.map(i => {
          // console.log(i.payload.doc.data(), '  '  , i.payload.doc.id);
          if (i.payload.doc.id === 'Folder') {
            // this.afs.collection('users').doc('Folders').valueChanges()
          }
        });
      });
      this.afs.collection(`users/${this.user.uid}/Root`).valueChanges().subscribe(item => {
        // this.storage.ref()
        // console.log(item);
        this.imageFiles = [];
        item.map((i: any) => {
          if (i.path) {
            this.storage.ref(i.path).getDownloadURL().subscribe(p => {
              this.imageFiles.push({ path: p, name: 'test' });
            });
            // console.log(i.path);
          } else {
            // console.log(i, 'No');
          }
          // let x = {};
        });
      });
      this.userData = this.afs.collection(`users/${this.user.uid}/Root`).valueChanges();
    });
  }

  ngOnInit() {
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  getDownloadUrl(path) {
    return this.storage.ref(path).getDownloadURL();
  }

  startUpload(event: FileList) {
    // The File object
    const file = event.item(0);

    // console.log(this.user);
    // Folder Upload
    /* console.log(file);
    if (file.type === '') {
      console.log('Folder');
    } */
    // Client-side validation example
    if (file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type :( ');
      return;
    }

    // The storage path
    const path = `${this.user.uid}/${new Date().getTime()}_${file.name}`;

    // Totally optional metadata
    const customMetadata = { app: 'My Drive App' };

    // The main task
    this.task = this.storage.upload(path, file, { customMetadata });

    // Progress monitoring
    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges().pipe(
      tap(snap => {
        if (snap.bytesTransferred === snap.totalBytes) {
          // Update firestore on completion
          this.db.collection(`users/${this.user.uid}/Root`).add({ path, size: snap.totalBytes });
        }
      }),
      finalize(() => {
        // this.downloadURL = this.storage.ref(path).getDownloadURL();
        console.log(path);
        // this.downloadURL = this.storage.ref(path).getDownloadURL();
      })
    );


    // The file's download URL
  }

  // Determines if the upload task is active
  isActive(snapshot) {
    return (
      snapshot.state === 'running' &&
      snapshot.bytesTransferred < snapshot.totalBytes
    );
  }

}
