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

import { useEffect, useState } from "react";

type AnalyserOptions = {
    cloneTrack?: boolean;
    fftSize?: number;
    smoothingTimeConstant?: number;
    minDecibels?: number;
    maxDecibels?: number;
}

function Analyser(track: any, options?: AnalyserOptions,) {

    const opts = { cloneTrack: false, fftSize: 2048, smoothingTimeConstant: 0.8, minDecibels: -100, maxDecibels: -80, ...options };

    const audioContext = new AudioContext({ latencyHint: "interactive" });
    const mediaStreamSource = audioContext.createMediaStreamSource(new MediaStream([track]));

    const analyser = audioContext.createAnalyser();
    analyser.minDecibels = opts.minDecibels;
    analyser.maxDecibels = opts.maxDecibels;
    analyser.fftSize = opts.fftSize;
    analyser.smoothingTimeConstant = opts.smoothingTimeConstant;

    mediaStreamSource.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const calculateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (const amplitude of dataArray) {
            sum += Math.pow(amplitude / 255, 2);
        }
        const volume = Math.sqrt(sum / dataArray.length);
        return volume;
    };

    const cleanup = async () => {
        await audioContext.close();
        if (opts.cloneTrack) {
            track.stop();
        }
    };

    return { calculateVolume, analyser, cleanup };
}

interface FrequenciesOptions {
    bands?: number;
    loPass?: number;
    hiPass?: number;
    updateInterval?: number;
    analyserOptions?: AnalyserOptions
}

const FrequenciesDefaults = {
    bands: 5,
    loPass: 100,
    hiPass: 600,
    updateInterval: 32,
    analyserOptions: { fftSize: 2048 },
} as const satisfies FrequenciesOptions;

const FrequenciesNormalize = (frequencies: Float32Array) => {
    const normalizeDb = (value: number) => {
        const minDb = -100;
        const maxDb = -10;
        let db = 1 - (Math.max(minDb, Math.min(maxDb, value)) * -1) / 100;
        db = Math.sqrt(db);
        return db;
    };
    return frequencies.map((value) => {
        if (value === -Infinity) {
            return 0;
        }
        return normalizeDb(value);
    });
};

const Frequencies = (media_stream: any, options: FrequenciesOptions = {}) => {

    const track = media_stream;
    const opts = { ...FrequenciesDefaults, ...options };

    const [frequencyBands, setFrequencyBands] = useState<Array<number>>(
        new Array(opts.bands).fill(0),
    );

    useEffect(() => {

        if (!track) {
            return;
        }

        const { analyser, cleanup } = Analyser(track, opts.analyserOptions);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);

        const updateVolume = () => {
            analyser.getFloatFrequencyData(dataArray);
            let frequencies: Float32Array = new Float32Array(dataArray.length);
            for (let i = 0; i < dataArray.length; i++) {
                frequencies[i] = dataArray[i];
            }

            frequencies = frequencies.slice(options.loPass, options.hiPass);

            const normalizedFrequencies = FrequenciesNormalize(frequencies);
            const chunkSize = Math.ceil(normalizedFrequencies.length / opts.bands);
            const chunks: Array<number> = [];
            for (let i = 0; i < opts.bands; i++) {
                const summedVolumes = normalizedFrequencies.slice(i * chunkSize, (i + 1) * chunkSize).reduce((acc, val) => (acc += val), 0);
                chunks.push(summedVolumes / chunkSize);
            }

            setFrequencyBands(chunks);
        };

        const interval = setInterval(updateVolume, opts.updateInterval);

        return () => {
            cleanup();
            clearInterval(interval);
        };

    }, [track, JSON.stringify(options)]);

    return frequencyBands;
}

type AssistantVisualizerProps = {
    status: boolean;
    track?: any
};

export function AssistantVisualizer({ status, track }: AssistantVisualizerProps) {

    const frequencies = Frequencies(track, {
        bands: 5,
        loPass: 100,
        hiPass: 200,
    });

    return (
        <div className="relative w-full h-[80px] group">
            <div className={('relative flex items-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ') + (status ? 'w-[50px] h-[50px]' : 'w-[60px] h-[60px]')}>
                {frequencies.map((frequency, index) => (
                    <div
                        key={index}
                        className={`${status ? 'w-[50px] h-[50px]' : 'w-[60px] h-[60px]'} ${status ? 'bg-muted/70' : ((index === 1 || index === 3) ? 'bg-secondary' : 'bg-muted/50')} scale-[0.75] translate-y-[0px] ${status ? '' : 'group-hover:scale-[0.9]'} ` + ((index === 0 ? (status ? 'translate-x-[100px]' : 'group-hover:translate-x-[80px]') : (index === 1 ? (status ? 'translate-x-[50px]' : 'group-hover:translate-x-[40px]') : (index === 3 ? (status ? 'translate-x-[-50px]' : 'group-hover:translate-x-[-40px]') : (index === 4 ? (status ? 'translate-x-[-100px]' : 'group-hover:translate-x-[-80px]') : '')))))}    
                        style={{height: (index !== 2 ? `${Math.min(Math.max((status ? 50 : 60) + frequency * 45, status ? 50 : 60), 150)}px` : ''), position: 'absolute', zIndex: `${index < 2 ? index + 5 : (index === 2 ? 20 : 20 - index)}`, borderRadius: `${status ? '40px' : '50px'}`, animation: `${index === 2 ? (status ? '' : 'floating-animation 5s ease-in-out infinite') : ''}`, transition: `${index === 2 ? (status ? 'transform 1.25s cubic-bezier(0.09, 1.04, 0.245, 1.055)' : 'all 10s ease-out') : 'transform 1.25s cubic-bezier(0.09, 1.04, 0.245, 1.055)'}` }}
                    >
                        {status && index === 2 && (
                            <div
                                className="w-[50px] h-[50px]"
                                style={{
                                    borderRadius: '25px',
                                    backgroundColor: 'rgb(255, 255, 255)',
                                    backgroundImage: 'radial-gradient(at 76% 31%, rgb(0, 208, 250) 0px, transparent 50%), radial-gradient(at 20% 81%, rgb(0, 216, 255) 0px, transparent 50%)',
                                    backgroundSize: '300% 300%',
                                    filter: 'drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 45px)',
                                    transform: 'translateX(0px) scale(1)',
                                    transition: 'transform 1.25s cubic-bezier(0.09, 1.04, 0.245, 1.055)',
                                    position: 'absolute',
                                    animation: '20s ease 0s infinite normal none running gradient-animation, 2s ease-out 0s infinite alternate none running rotate-animation',
                                }}
                            ></div>
                        )}
                        {!status && index === 2 && (
                            <div
                                className="w-[60px] h-[60px]"
                                style={{
                                    borderRadius: '30px',
                                    backgroundColor: 'rgb(255, 255, 255)',
                                    backgroundImage: 'radial-gradient(at 76% 31%, rgb(0, 208, 250) 0px, transparent 50%), radial-gradient(at 20% 81%, rgb(0, 216, 255) 0px, transparent 50%)',
                                    backgroundSize: '300% 300%',
                                    filter: 'drop-shadow(rgba(255, 255, 255, 0.1) 0px 0px 45px)',
                                    transform: 'translateX(0px) scale(1)',
                                    transition: 'transform 1.25s cubic-bezier(0.09, 1.04, 0.245, 1.055)',
                                    position: 'absolute',
                                    animation: '20s ease 0s infinite normal none running gradient-animation, 2s ease-out 0s infinite alternate none running rotate-animation',
                                }}
                            ></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}