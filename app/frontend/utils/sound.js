import Tone              from "tone"
import * as soundOptions from "../constants/soundOptions"
import * as utils        from "./"

let synth
let click

const defaultBpm = 120
const minBpm     = 60
const maxBpm     = 600
const minVolume  = 1
const maxVolume  = 10
// const chorus = new Tone.Chorus(4, 2.5, 0.5).toMaster()
// const reverb = new Tone.Freeverb(0.5).toMaster()

const setSynth = () => {
  synth = new Tone.PolySynth({ polyphony: 6, voice: Tone.Synth }).toMaster()
  synth.set(soundOptions.synths[0])
}

const setClick = () => {
  click = new Tone.MonoSynth(soundOptions.clicks[0]).toMaster()
}

const triggerSynth = (time, value) => {
  synth.triggerAttackRelease(value.notes, value.duration, time, utils.synthVelocity(value.notes.length))
}

const triggerClick = (time) => {
  click.triggerAttackRelease("A6", "32n", time, 0.1)
}

const setSynthSchedule = (score) => {
  new Tone.Part(triggerSynth, score).start()
}

const setClickSchedule = (score) => {
  const barLength = parseInt(score[score.length - 1].time.split(":")[0], 10)
  for (let bar = 0; bar <= barLength; bar += 1) {
    for (let beat = 0; beat < 4; beat += 1) {
      Tone.Transport.schedule(triggerClick, `${bar}:${beat}:0`)
    }
  }
}

export const stop = () => {
  Tone.Transport.stop()
  Tone.Transport.cancel()
}

export const start = (parsedText) => {
  const score = utils.makeScore(parsedText)
  stop()
  setSynth()
  setClick()
  setSynthSchedule(score)
  setClickSchedule(score)
  Tone.Transport.start("+0.2")
}

export const setBpm = (bpm) => {
  Tone.Transport.bpm.value = utils.valueInRange(bpm, minBpm, maxBpm)
}

export const setVolume = (volume) => {
  const newVolume = (utils.valueInRange(volume, minVolume, maxVolume) - maxVolume) * 3
  Tone.Master.volume.value = newVolume
}

export const initialize = () => {
  setVolume(maxVolume)
  setBpm(defaultBpm)
}