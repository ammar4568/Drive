import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
import { SwalPartialTargets } from '@toverux/ngx-sweetalert2';
import swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ContextMenuComponent } from 'ngx-contextmenu';

@Component({
  selector: 'app-drive',
  templateUrl: './drive.component.html',
  styleUrls: ['./drive.component.css']
})
export class DriveComponent implements OnInit {
  @ViewChild(ContextMenuComponent) public folderMenu: ContextMenuComponent;
  @ViewChild(ContextMenuComponent) public fileMenu: ContextMenuComponent;
  @ViewChild(ContextMenuComponent) public newMenu: ContextMenuComponent;

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
  folders: any[] = [];

  currentImage;

  currentUrl;
  currentFolderPath: string;
  folderCrumb: string[] = ['Home'];

  constructor(private storage: AngularFireStorage,
    private db: AngularFirestore,
    private auth: AuthService,
    private afs: AngularFirestore,
    public readonly swalTargets: SwalPartialTargets,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient) {
    this.currentFolderPath = '';
    this.auth.user.subscribe(user => {
      this.user = user;

      // console.log(this.router.url);
      this.currentUrl = this.router.url.split('/')[1];

      if (this.currentUrl === 'starred') {
        this.afs.collection(`users/${this.user.uid}/Starred`).valueChanges().subscribe(item => {
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
          });
        });
      } else if (this.currentUrl === 'trash') {
        this.afs.collection(`users/${this.user.uid}/Trash`).valueChanges().subscribe(item => {
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
          });
        });
      } else {
        // this.afs.collection(`users/${this.user.uid}/Root`).snapshotChanges().subscribe(item => {
        //   item.map(i => {
        //     if (i.payload.doc.id === 'Folder') {
        //     }
        //   });
        // });

        this.afs.collection(`users/${this.user.uid}/Root`).valueChanges().subscribe(item => {
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
          });
        });
        this.userData = this.afs.collection(`users/${this.user.uid}/Root`).valueChanges();
        const httpOptions = {
          headers: new HttpHeaders({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST'
          })
        };

        // this.http.options('https://us-central1-drive-51d7b.cloudfunctions.net/getHello',
        //   httpOptions)
        //   .pipe(
        //     tap(x => { console.log(x); })
        //   );

        this.http
          .post('https://us-central1-drive-51d7b.cloudfunctions.net/getHello',
            { 'url': `/users/${user.uid}/Root` },
            httpOptions)
          .subscribe((x: any[]) => {
            x.map(a => {
              this.folders.push({ 'name': a });
            });
          });
      }
      // this.afs.collection(`users/${this.user.uid}/Root`).doc('Folder');


      /* this.afs.collection(`users/${this.user.uid}/Root`).doc('Folder').collection('Folder1').valueChanges().subscribe(item => {
        // console.log(item);
      }); */

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




    });
  }

  ngOnInit() {
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
    // console.log(this.isHovering);
  }

  changePath($path) {
    // console.log(this.currentFolderPath);
    if ($path.name === '/') {
      this.currentFolderPath += '';
    } else {
      // console.log(this.currentFolderPath);
      this.currentFolderPath += `Folder/${$path.name}/`;
      // console.log(this.currentFolderPath);
    }

    this.folderCrumb = ['Home'];
    this.currentFolderPath.split('/').map((x, i) => {
      if (i % 2 !== 0) {
        // console.log(x);
        this.folderCrumb.push(x);
      }
    });

    // this.currentFolderPath.toString().split
    // console.log($path.name);
    this.folders = [];
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST'
      })
    };
    this.http
      .post('https://us-central1-drive-51d7b.cloudfunctions.net/getHello',
        { 'url': `/users/${this.user.uid}/Root/${this.currentFolderPath}` },
        httpOptions)
      .subscribe((x: any[]) => {
        // console.log(x + ' x');
        x.map(a => {
          this.folders.push({ 'name': a });
        });
      });
    this.afs.collection(`users/${this.user.uid}/Root/${this.currentFolderPath}`).valueChanges()
      .subscribe(item => {
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
        });
      });
    // this.http.post()
    // this.router.navigate(['/'], { queryParams: { 'path': folder } });
  }

  deleteImage() {
    this.afs.collection(`users/${this.user.uid}/Root/${this.currentFolderPath}`,
      ref => ref.where('path', '==', `${this.currentImage.dbPath}`)).snapshotChanges().subscribe(x => {
        x.map(i => {
          this.afs.collection(`users/${this.user.uid}/Root/${this.currentFolderPath}`).doc(i.payload.doc.id).delete()
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

  changePathCrumb(crumb) {
    if (crumb === 'Home') {
      this.currentFolderPath = '';
      this.changePath({ 'name': '/' });
    } else {
      const p = this.currentFolderPath.split('/');
      let x = '';
      for (let i = 0; i < p.length; i++) {
        if (p[i] === crumb) {
          break;
        } else {
          // console.log(p[i]);
          x += p[i] + '/';
        }
      }
      const y = x.split('/');
      y.splice(y.length - 2, 2);
      // console.log(y.length);
      // console.log(y.join('/') + '/');
      // console.log(crumb);
      if (y.length === 0) {
        this.currentFolderPath = y.join('/');
      } else {
        this.currentFolderPath = y.join('/') + '/';
      }
      this.changePath({ 'name': crumb });
    }
    // console.log(crumb);
    // console.log(this.currentFolderPath);
    // let tempPath = '';
    // const p = this.currentFolderPath.split('/');
    // console.log(p, ' -> ', crumb);
    // for (let i = 0; i < p.length - 1; i++) {
    //   if (p[i + 1] !== crumb) {
    //     console.log(p[i + 1], ' -> ', crumb, ' -> ', i);
    //   }
    //   // if (p[i + 1] !== crumb) {
    //   //   tempPath += 'Folder/' + crumb;
    //   // } else {
    //   //   break;
    //   // }
    // }
    // console.log(tempPath);
    // console.log(' Next ');
    // console.log(this.currentFolderPath);
    // this.currentFolderPath = tempPath;

    // console.log(this.currentFolderPath);
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

  async upload(type) {
    // console.log(type);
    if (type === 'file') {
      const { value: file } = await swal({
        title: 'Select image',
        input: 'file',
        inputAttributes: {
          'accept': 'image/*',
          'aria-label': 'Upload your profile picture'
        }
      });

      if (file) {
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

        this.snapshot = this.task.snapshotChanges().pipe(
          tap(snap => {
            if (snap.bytesTransferred === snap.totalBytes) {
              // Update firestore on completion
              this.db.collection(`users/${this.user.uid}/Root/${this.currentFolderPath}`).add({ path, size: snap.totalBytes });
            }
          }),
          finalize(() => {
            this.downloadURL = this.storage.ref(path).getDownloadURL();
            // console.log(path);
            // this.downloadURL = this.storage.ref(path).getDownloadURL();
          })
        );
      }
    } else if (type === 'folder') {
      const { value: folderName } = await swal({
        title: 'Enter Folder Name',
        input: 'text',
        showCancelButton: true,
        inputValidator: (value) => {
          return !value && 'Folder Name cannot be blank';
        }
      });
      if (folderName) {
        // this.afs.
        // console.log(this.currentFolderPath);
        this.afs.collection(`users/${this.user.uid}/Root/${this.currentFolderPath}`).doc('Folder').collection(folderName).add({ x: '2' })
          .then(res => {
            this.folders = [];
            const httpOptions = {
              headers: new HttpHeaders({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST'
              })
            };
            this.http
              .post('https://us-central1-drive-51d7b.cloudfunctions.net/getHello',
                { 'url': `/users/${this.user.uid}/Root/${this.currentFolderPath}` },
                httpOptions)
              .subscribe((x: any[]) => {
                // console.log(x + ' x');
                x.map(a => {
                  this.folders.push({ 'name': a });
                });
              });
          })
          .catch(err => {
            console.log(err);
          });
      }
    }
  }

  startUpload(event: FileList) {
    // The File object
    const file = event.item(0);

    // console.log(file);

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
          this.db.collection(`users/${this.user.uid}/Root/${this.currentFolderPath}`).add({ path, size: snap.totalBytes });
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

  openFolder(folderName) {
    this.changePath({ 'name': folderName });
  }

  deleteFolder(folderName) {
    console.log(folderName);
  }

  deleteFile(file) {
    this.currentImage = file;
    this.deleteImage();
  }

  fileInfo(file) {
    // console.log(file);
    const imageRef = this.storage.ref(file.dbPath);
    imageRef.getMetadata().subscribe(metaData => {
      // console.log(metaData);
      const fileName = metaData.name.split('.')[0];
      swal({
        title: `Name: ${fileName}`,
        html: `<ul class='navbar-nav'>
          <li><b>Created:</b> ${metaData.timeCreated}</li>
          <li><b>Size:</b> ${metaData.size}</li>
          <li><b>File Type:</b> ${metaData.type}</li>
          <li><b>Updated:</b> ${metaData.updated}</li>
        </ul>`,
        imageUrl: file.path,
        imageWidth: 550,
        imageHeight: 300,
        imageAlt: fileName,
        animation: true
      });
    });

  }
}
