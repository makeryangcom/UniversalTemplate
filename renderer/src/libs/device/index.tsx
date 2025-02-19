// Copyright 2024 MakerYang, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export class Device {

    public stream: MediaStream | null = null;

    public audios: MediaStream[] = [];
    public videos: MediaStream[] = [];

    public active_audio: MediaStream | null = null;
    public active_video: MediaStream | null = null;

    constructor() {
        if (typeof window !== "undefined" && typeof MediaStream !== "undefined") {
            this.stream = new MediaStream();
        }
    }

    onAudioDevice(success: any, error: any){
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
            navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            }).then((audio_stream: MediaStream)=>{
                navigator.mediaDevices.enumerateDevices().then((devices: any)=>{
                    this.audios = devices.filter(
                        (device: any) => (device.kind === "audioinput" && device.label !== "")
                    ) as MediaStream[];
                    this.active_audio = this.audios[0] || null;
                    if (audio_stream) {
                        audio_stream.getAudioTracks().forEach((track: any) => {
                            this.stream!.addTrack(track)
                        });
                    }
                    success(this.stream, this.audios, this.videos, this.active_audio, this.active_video);
                });
            }).catch((err: any)=>{
                error(err);
            });
        } else {
            error({message: "not supported in this browser"});
        }
    }

    onVideoDevice(success: any, error: any){
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
            navigator.mediaDevices.getUserMedia({
                video: {
                    width: 1280,
                    height: 720
                }
            }).then((video_stream: MediaStream)=>{
                navigator.mediaDevices.enumerateDevices().then((devices: any)=>{
                    this.videos = devices.filter(
                        (device: any) => (device.kind === "videoinput" && device.label !== "")
                    ) as MediaStream[];
                    this.active_video = this.videos[0] || null;
                    if (video_stream) {
                        video_stream.getVideoTracks().forEach((track: any) => {
                            this.stream!.addTrack(track)
                        });
                    }
                    success(this.stream, this.audios, this.videos, this.active_audio, this.active_video);
                });
            }).catch((err: any)=>{
                error(err);
            });
        }else{
            error({message: "not supported in this browser"});
        }
    }

    onStop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.audios = [];
            this.videos = [];
            this.active_audio = null;
            this.active_video = null;
            this.stream = new MediaStream();
        }
    }
}