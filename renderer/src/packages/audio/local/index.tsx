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

const LocalVisualizerFrequencies = (media_stream: any, bands: number = 5, loPass: number = 100, hiPass: number = 600) => {

    const [frequencyBands, setFrequencyBands] = useState<Float32Array[]>([]);

    useEffect(() => {
        if (!media_stream) {
            return;
        }

        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(media_stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);

        const updateVolume = () => {
            analyser.getFloatFrequencyData(dataArray);
            let frequencies: Float32Array = new Float32Array(dataArray.length);
            for (let i = 0; i < dataArray.length; i++) {
                frequencies[i] = dataArray[i];
            }
            
            frequencies = frequencies.slice(loPass, hiPass);

            const normalizedFrequencies = FrequenciesNormalize(frequencies);
            const chunkSize = Math.ceil(normalizedFrequencies.length / bands);
            const chunks: Float32Array[] = [];
            for (let i = 0; i < bands; i++) {
                chunks.push(
                    normalizedFrequencies.slice(i * chunkSize, (i + 1) * chunkSize),
                );
            }

            setFrequencyBands(chunks);
        };

        const interval = setInterval(updateVolume, 10);

        return () => {
            source.disconnect();
            clearInterval(interval);
        };
    }, [media_stream, loPass, hiPass, bands]);

    return frequencyBands;
}

type LocalVisualizerState = "listening" | "idle" | "speaking" | "thinking";

type LocalVisualizerProps = {
    stream: any,
    state: LocalVisualizerState;
    barWidth: number;
    minBarHeight: number;
    maxBarHeight: number;
    count: number;
    borderRadius: number;
    gap: number;
};

export function LocalVisualizer({ stream, state, barWidth, minBarHeight, maxBarHeight, count, borderRadius, gap}: LocalVisualizerProps) {

    const frequencies = LocalVisualizerFrequencies(stream, count);

    const summedFrequencies = frequencies.map((bandFrequencies: any) => {
        const sum = (bandFrequencies as number[]).reduce((a, b) => a + b, 0);
        return Math.sqrt(sum / bandFrequencies.length);
    });

    const [thinkingIndex, setThinkingIndex] = useState(
        Math.floor(summedFrequencies.length / 2),
    );

    const [thinkingDirection, setThinkingDirection] = useState<"left" | "right">("right");

    useEffect(() => {
        if (state !== "thinking") {
            setThinkingIndex(Math.floor(summedFrequencies.length / 2));
            return;
        }
        const timeout = setTimeout(() => {
            if (thinkingDirection === "right") {
                if (thinkingIndex === summedFrequencies.length - 1) {
                    setThinkingDirection("left");
                    setThinkingIndex((prev) => prev - 1);
                } else {
                    setThinkingIndex((prev) => prev + 1);
                }
            } else {
                if (thinkingIndex === 0) {
                    setThinkingDirection("right");
                    setThinkingIndex((prev) => prev + 1);
                } else {
                    setThinkingIndex((prev) => prev - 1);
                }
            }
        }, 200);

        return () => clearTimeout(timeout);
    }, [state, summedFrequencies.length, thinkingDirection, thinkingIndex]);

    return (
        <div className="flex flex-row gap-2 h-[100px] items-center w-full justify-center border-0 rounded-sm">
            <div className={`flex flex-row items-center`} style={{ gap: gap + "px" }}>
                {summedFrequencies.map((frequency: any, index: any) => {
                    const isCenter = index === Math.floor(summedFrequencies.length / 2);
                    let transform;
                    return (
                        <div
                            className={`bg-[#424049] ${isCenter && state === "listening" ? "animate-pulse" : ""}`}
                            key={"frequency-" + index}
                            style={{
                                height: minBarHeight + frequency * (maxBarHeight - minBarHeight) + "px",
                                width: barWidth + "px",
                                transition: "background-color 0.35s ease-out, transform 0.25s ease-out",
                                transform: transform,
                                borderRadius: borderRadius + "px",
                                boxShadow: state !== "idle" ? `${0.1 * barWidth}px ${0.1 * barWidth }px 0px 0px rgba(0, 0, 0, 0.1)` : "none",
                            }}
                        ></div>
                    )
                })}
            </div>
        </div>
    )
}