import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'upload-video-AWS-app';
  selectedFiles = null;
  changeDragOverClass = false;
  instantVideo = null;
  videoName = null;
  progressPercentage:string;
  myVideos : any = [];   
  displaySuccessBlock : boolean = true;
  displaySuccessMessage : boolean = true;
  displayProgressBar : boolean = true;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getVideos();
  }

  getVideos() {
    var getUrl = "http://localhost:4040/api/getVideos";
    let header = new HttpHeaders();
    header.append('Content-Type', 'application/json');
    this.http.get<string[]>(getUrl, {headers: header}).subscribe((res:any) => {
      this.myVideos = [];
      for(var i=0; i < res.length; i++) {
        console.log(res[i]);
        this.myVideos.push(res[i]);
      }      
      this.instantVideo = "http://localhost:4040/upload/" + res[0];
    });
  }

  dragover(event) {    
    event.preventDefault();
    this.videoName = '';
    this.changeDragOverClass = true;
  };
  
  uploadFiles(event) {
    console.log(event);
    event.preventDefault();
    this.changeDragOverClass = false;

    if (event.dataTransfer.items) {
      for (var i = 0; i< event.dataTransfer.items.length; i++) {
          let file = event.dataTransfer.items[i].getAsFile();
          let fileId = file.name +'-'+ file.lastModified;
          
          // Cloud firebase storage 
          // try{
          //   const metaData = {'contentType': file.type};
          //   var storageRef = firebase.storage().ref('/videos');
          //   storageRef.put(file, metaData);
          //   console.log(file);
          // }
          // catch(error)
          // {
          //   console.log(error);
          // }
          

          const endPointUrl = "http://localhost:4040/api/upload";
          const formData: FormData = new FormData();
          formData.append('video', file, file.name );
          
          this.http.post(endPointUrl, formData, {reportProgress: true, observe:'events'}).subscribe(event=> {
              if (event.type === HttpEventType.UploadProgress) {
                console.log('Upload Progress:' + Math.round(event.loaded/event.total * 100) + '%');
                this.progressPercentage = Math.round(event.loaded/event.total * 100)+'%';
                this.displaySuccessBlock = false;
                this.displayProgressBar = false;
                this.displaySuccessMessage = true;
              }
              else 
              {
                console.log(event);               
                this.getVideos();
                this.displaySuccessBlock = false;
                this.displayProgressBar = true;
                this.displaySuccessMessage = false;
              }
          });
      }      
    }
  }

  runSelectedVideo(event) {    
    this.instantVideo = "http://localhost:4040/upload/" + event.target.textContent
  }
}
