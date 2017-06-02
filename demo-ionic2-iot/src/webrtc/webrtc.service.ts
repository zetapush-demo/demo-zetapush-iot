import { Injectable } from '@angular/core';
import { WebRtcApi } from '../zetapush/zetapush.service';
import { ZetaPushClient } from '../zetapush';
import { Camera } from '@ionic-native/camera';
import { Diagnostic } from '@ionic-native/diagnostic';
import { FileUpload } from '../file/file-upload.service';
import { Subject } from 'rxjs/Subject';



@Injectable()
export class WebRtcService {

    // Variables
    conf = { 'iceServers': [{ 'url':'stun:stun.1.google.com:19302' }]};         // Conf of stun servers
    pc;                                                                         // Peer connection
    src: string;                                                                // User name
    dest: string;                                                               // Destinataire
    stream;                                                                     // Video stream
    constraints;                                                                // Constraints for the camera
    picture;                                                                    // Picture saved
    cameraId;                                                                   // Identifiant of the camera
    listOfCamera;                                                               // List of available cameras
    stateConnection: any;                                                       // State of the connection
    stateConnectionChange: Subject<string> = new Subject<string>();             // Change event state connection
    

    constructor(
        private api: WebRtcApi, 
        private client : ZetaPushClient,
        private camera: Camera, 
        private diagnostic: Diagnostic,
        private upload: FileUpload){

        //  =======================================================================================
        //                                      HANDLES ZETAPUSH     
        //  =======================================================================================
        api.onListPictures.subscribe((message) => {
            console.log('WebRtcService::onListPictures', message);
            let photos = message['listing']['entries']['content'];
            console.log("PHOTOS: ", photos);
        })

        api.onPhoto.subscribe((message) => {
            console.log('WebRtcService::onPhoto', message);
            
            switch(message['order']){
                case 'take':
                    console.log("Take a photo");
                    let video = <HTMLVideoElement>document.getElementById('localVideo');

                    let canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    let context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    canvas.toBlob((blob) => {
                        this.picture = blob;
                        
                        // Send the picture
                        let file = this.upload.add({
                            folder: '/',
                            owner: 'GLOBAL',
                            file: this.picture
                        });
                        this.upload.request(file)
                            .then((request) => {
                            console.log('FileUploadComponent::onRequest', request);
                            return this.upload.upload(request);
                            })
                                .then((request) => {
                                console.log('FileUploadComponent::onUpload', request);
                                return this.upload.confirm(request);
                                })
                                    .then((request) => {
                                    console.log('FileUploadComponent::onConfirm', request);
                                    
                                    // Signal new photo updated
                                    this.api.photo(this.dest, "newPhoto");
                        });
                    })
                    break;

                default:
                    console.log("Can't read the order: ", message['order']);
            }
        })

        api.onAnswer.subscribe((message) => {
            console.log('WebRtcService::onAnswer', message);
            this.pc.setRemoteDescription(new RTCSessionDescription(message['res']['data']));
        })

        api.onOffer.subscribe((message) => {
            console.log('WebRtcService::onOffer', message);
            this.dest = message['res']['src'];
            this.pc.setRemoteDescription(new RTCSessionDescription(message['res']['data']));
            
            this.pc.createAnswer((answer) => {
                this.pc.setLocalDescription(answer);

                let message = {
                            'type': 'answer',
                            'data': answer,
                            'src': this.src,
                            'dest': this.dest
                        };
                this.api.answer(message);
            }, (error) => {
                console.error("Error during onOffer: ", error);
            });
        })

        api.onCandidate.subscribe((message) => {
            console.log('WebRtcService::onCandidate', message);
            this.pc.addIceCandidate(new RTCIceCandidate(message['res']['data']));
        })

        api.onLogin.subscribe((message) => {
            console.log('WebRtcService::onLogin', message);
            console.log("User logged :", message['res']['src']);
            this.createOffer();
        })

    }

    /**
     * =================================================================
     *                              Init
     * =================================================================
     */
    init(name: string): void {
        
        // Save the local name and init the list of cameras
        this.src = name;
        this.listOfCamera = [];

        // Start local video
        this.startLocalVideo();   
    }


    /**
     * =================================================================
     *                  Start local video
     * =================================================================
     */
    startLocalVideo(): void {
        // Start the local video
        if (navigator.getUserMedia){
            
            cordova.plugins.diagnostic.requestRuntimePermission( (status) => {
                if (cordova.plugins.diagnostic.permissionStatus.GRANTED){

                    // Get all available cameras
                    navigator.mediaDevices.enumerateDevices().then((devices) => {
                        devices.forEach((d) => {
                            if (d.kind == "videoinput"){
                                this.listOfCamera.push(d);
                            }
                        })
                        
                        // Start the camera
                        this.cameraId = this.listOfCamera[0].deviceId;
                        this.constraints = { audio: true, video: { deviceId: {exact: this.cameraId}}};
                        navigator.getUserMedia(this.constraints, (stream) => {
                            let video = <HTMLVideoElement>document.getElementById('localVideo');
                            this.stream = stream;
                            video.srcObject =  stream;
                            video.play();

                        }, function(err){
                            console.log("Error get stream: ", err.name);
                        });

                    }).catch((err) => {
                        console.error(err.name + ": " + err.message);
                    });
                }
            }, (error) => {
                console.error("Error during runtime permission :", error);
            }, cordova.plugins.diagnostic.permission.CAMERA);
        } else {
            console.log("WebRTC not supported");
        }
    }

    /**
     * =================================================================
     *                  Init the Peer connection
     * =================================================================
     */
    initPeerConnection() {

        // Create peer connection
        this.pc = new RTCPeerConnection(this.conf);
        this.pc.addStream(this.stream);

        this.stateConnection = 'disconnection';
        this.stateConnectionChange.next(this.stateConnection);

        this.pc.oniceconnectionstatechange = (event) => {
            // To start the video when the this is a reconnection
            if (this.pc != null && this.pc.iceConnectionState === "checking"){
                this.createOffer();
            }
        }

        // Configure handler ices candidates
        this.pc.onicecandidate = ((event) => {
            // Create candidate message
            let message = {
                'type': 'candidate',
                'data': event.candidate,
                'src': this.src,
                'dest': this.dest
            };
            this.api.candidate(message);
        });

        // Configure handler new stream
        this.pc.onaddstream = ((event) => {
            console.log("onAddStream");
            let video = <HTMLVideoElement>document.getElementById('remoteVideo');
            video.srcObject = event.stream;
        });

        // Login to Zetapush platform
        let message = {
            'type': 'login',
            'data': '',
            'src': this.src,
            'dest': this.src
        };

        this.api.login(message);
    
    }

    /**
     * ==================================================================
     *                 Create an offer (start the communication)
     * ==================================================================
     */
    createOffer(): void {
        this.dest = 'admin';                                            // The destinataire is always 'admin'

        // Create the offer
        this.pc.createOffer((offer) => {
        
            let message = {
                'type': 'offer',
                'data': offer,
                'src': this.src,
                'dest': this.dest
            };

            this.api.offer(message);
            this.pc.setLocalDescription(offer);
            
        }, (error) => {
            console.error("Error during create offer :", error);
        });
    }


    /**
     * ==================================================================
     *                         Change camera face
     * ==================================================================
     */
    changeView(): void {
        console.log("ChangeView");

        // Select the camera
        for (let i=0; i<this.listOfCamera.length; i++){
            if (this.listOfCamera[i].deviceId == this.cameraId){
                if (i == (this.listOfCamera.length -1)){
                    this.cameraId = this.listOfCamera[0].deviceId;
                    break;
                } else {
                    this.cameraId = this.listOfCamera[i+1].deviceId;
                    break;
                }
            }
        }

        // Stop the localVideo
        let video = <HTMLVideoElement>document.getElementById('localVideo');
        video.srcObject.getTracks().forEach(t => t.stop());
        video.srcObject = null;

        // Start the new local video
        this.constraints = { audio: true, video: { deviceId: {exact: this.cameraId}}};
        navigator.getUserMedia(this.constraints, (stream) => {

            if (this.pc != null) { this.pc.removeStream(this.stream);}

            this.stream = stream;
            //inserting our stream to the video tag
            video.srcObject =  stream;
            video.play();

            if (this.pc != null) { 
                this.pc.addStream(this.stream);
                this.createOffer();
            }
        }, function(err){
            console.log("Error get stream: ", err.name);
        });

    }

    /**
     * ==================================================================
     *                   Stop the WebRTC communication
     * ==================================================================
     */
    stopRTC(): void {
        console.log("Stop the communication");

        // Clear the video tag
        let video = <HTMLVideoElement>document.getElementById('remoteVideo');
        if (video.srcObject != null) {
            video.pause();
            video.srcObject.getTracks().forEach(t => t.stop());
            video.load();
        }

        // Remove the stream
        this.pc.removeStream(this.stream);
        // Stop the connection
        this.pc.close();
        delete this.pc;

        this.stateConnection = 'connection';
        this.stateConnectionChange.next(this.stateConnection);

        // Send order 'disconnection' to the destinataire
        let message = {
            'type': 'disconnection',
            'data': '',
            'src': this.src,
            'dest': this.dest
        };

        this.api.disconnection(message);
    }

    /**
     * ==================================================================
     *                   Switch Connection (start / stop)
     * ==================================================================
     */
    switchConnection(): void {

        if (this.pc == null){
            this.initPeerConnection();
        } else {
            this.stopRTC();
        }
        
    }
}