import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
import { SwalPartialTargets } from '@toverux/ngx-sweetalert2';
import swal from 'sweetalert2';
import { Router } from '@angular/router';

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

  currentImage;

  currentUrl;

  constructor(private storage: AngularFireStorage,
    private db: AngularFirestore,
    private auth: AuthService,
    private afs: AngularFirestore,
    public readonly swalTargets: SwalPartialTargets,
    private router: Router) {
    this.auth.user.subscribe(user => {
      this.user = user;

      // console.log(this.router.url);
      this.currentUrl = this.router.url.split('/')[1];

      this.afs.collection(`users/${this.user.uid}/Root`).doc('Folder');


      this.afs.collection(`users/${this.user.uid}/Root`).doc('Folder').collection('Folder1').valueChanges().subscribe(item => {
        // console.log(item);
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
              this.imageFiles.push({ path: p, name: 'test', dbPath: i.path, size: i.size });
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
    // console.log(this.isHovering);
  }

  deleteImage() {
    this.afs.collection(`users/${this.user.uid}/Root`,
      ref => ref.where('path', '==', `${this.currentImage.dbPath}`)).snapshotChanges().subscribe(x => {
        x.map(i => {
          this.afs.collection(`users/${this.user.uid}/Root`).doc(i.payload.doc.id).delete()
            .then(res => {
              // console.log(res);
              this.db.collection(`users/${this.user.uid}/Trash`).
                add({ path: this.currentImage.dbPath, size: this.currentImage.size })
                .then(resp => {
                  // console.log(resp);
                })
                .catch(err => {
                  // console.log(err);
                });
              this.closeModal();
            })
            .catch(err => {
              // console.log(err);
            });

        });
      });
  }

  setCurrentImage(image) {
    this.currentImage = image;
    const modal = document.getElementById('myModal');
    const modalImg = document.getElementById('img01');
    modal.style.display = 'block';
    modalImg.setAttribute('src', this.currentImage.path);
  }

  closeModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
  }

  getDownloadUrl(path) {
    return this.storage.ref(path).getDownloadURL();
  }

  starImage() {
    this.db.collection(`users/${this.user.uid}/Starred`).
      add({ path: this.currentImage.dbPath, size: this.currentImage.size })
      .then(res => {
        // console.log(res);
      })
      .catch(err => {
        // console.log(err);
      });
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
    this.task.percentageChanges().subscribe(p => {
      // p.toFixed;
      swal({
        title: 'Uploading',
        // text: p.toFixed().toString(),
        html:
          `
            <div class="progress">
              <div class="progress-bar" role="progressbar"
              style="width: ${p.toFixed().toString()}%"
                aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            `
      });
    });
    // swal({
    //   title: 'Uploading',
    //   text: 'Here\'s a custom image.',
    //   html:
    //     `
    //         <div class="progress">
    //           <div class="progress-bar" role="progressbar"
    //           style="width: 40%"
    //             aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
    //         </div>
    //         `
    // });

    this.snapshot = this.task.snapshotChanges().pipe(
      tap(snap => {
        if (snap.bytesTransferred === snap.totalBytes) {
          // Update firestore on completion
          this.db.collection(`users/${this.user.uid}/Root`).add({ path, size: snap.totalBytes });
        }
      }),
      finalize(() => {
        this.downloadURL = this.storage.ref(path).getDownloadURL();
        // console.log(path);
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
