import React, { Component } from "react"
import { Transport, Master, Sampler, MonoSynth, Part } from "tone"

import Button                from "../../shared/Button"
import { times }             from "../../../constants/times"
import * as instruments      from "../../../constants/instruments"
import * as utils            from "../../../utils"
import { window, navigator } from "../../../utils/browser-dependencies"
import { MAX_VOLUME, STREAK_NOTE, RESUME_NOTE } from "../../../constants"

export default class SoundControl extends Component {
  constructor(props) {
    super(props)
    this.setVolume(props.volume)
    this.setInstrument(props.instrumentType)
    this.state = {
      instrument:  this.setInstrument(props.instrumentType),
      click:       this.setClick(),
      curretNotes: [],
      loading:     true,
      hasLoaded:   false
    }
  }

  // ===== iOS 対応の苦肉の策 =====
  // iOS では必ずユーザ操作によって音源がロードされる必要がある。
  // 初回スクロール時に hasLoaded でなければ音源をロードし、イベントを外す。
  // https://qiita.com/yohei-qiita/items/78805185ab218468215e
  componentDidMount() {
    const isIOS = /[ (]iP/.test(navigator.userAgent)
    if (isIOS) {
      window.addEventListener("scroll", this.setInstrumentForIOS)
    } else {
      this.onMount(() => this.setState({ hasLoaded: true }))
    }
  }
  componentWillReceiveProps({ bpm, volume, instrumentType, beatClick }) {
    if (bpm !== this.props.bpm) this.setBpm(bpm)
    if (volume !== this.props.volume) this.setVolume(volume)
    if (!this.state.hasLoaded || instrumentType !== this.props.instrumentType) {
      this.setLoaded(instrumentType, true)
    }
    if (this.state.click && (beatClick !== this.props.beatClick)) {
      this.state.click.volume.value = beatClick ? 0 : -100
    }
  }

  onMount = (callback) => callback()
  setInstrumentForIOS = () => {
    if (!this.state.hasLoaded) this.setLoaded(this.props.instrumentType)
    window.removeEventListener("scroll", this.setInstrumentForIOS)
  }
  setLoaded = (instrumentType, setLoading = false) => (
    this.setState({
      instrument: this.setInstrument(instrumentType, setLoading),
      hasLoaded:  true
    })
  )
  setInstrument = (type, setLoading = true) => {
    if (setLoading && this.state && this.state.loading === false) this.setState({ loading: true })
    const onLoad = () => this.setState({ loading: false })
    return new Sampler(...instruments.types(onLoad)[type]).toMaster()
  }
  setClick = () => new MonoSynth(instruments.click).toMaster()
  setInstrumentSchedule = (score) => {
    const { instrument } = this.state
    const triggerInstrument = (time, value) => {
      const { notes } = value
      const { curretNotes } = this.state

      if (notes[0] !== RESUME_NOTE) {
        curretNotes.forEach(note => instrument.triggerRelease(note))
        if (notes === "fin") {
          this.handleStop()
        } else if (notes[0] === STREAK_NOTE) {
          curretNotes.forEach(note => instrument.triggerAttack(note))
        } else {
          notes.forEach(note => instrument.triggerAttack(note))
          this.setState({ curretNotes: notes })
        }
      }
    }
    new Part(triggerInstrument, score).start()
  }
  setClickSchedule = (score) => {
    const { time: selectedTime, beatClick } = this.props
    const click = this.setClick()
    this.setState({ click })
    click.volume.value = beatClick ? 0 : -100

    const triggerClick = (time) => click.triggerAttackRelease("A6", "32n", time, 0.1)
    const setSchedule = () => {
      for (let bar = 0; bar <= utils.barLength(score); bar += 1) {
        for (let beat = 0; beat < times[selectedTime][0]; beat += 1) {
          Transport.schedule(triggerClick, `${bar}:${beat}:0`)
        }
      }
    }
    setSchedule(score)
  }
  setBpm = (bpm) => { Transport.bpm.value = bpm }
  setVolume = (volume) => { Master.volume.value = volume - MAX_VOLUME }

  handleChangePlaying = (state) => this.props.handleSetState({ isPlaying: state })
  handleStop = () => {
    const { instrument, curretNotes } = this.state
    curretNotes.forEach(note => instrument.triggerRelease(note))
    Transport.stop()
    Transport.cancel()
    this.handleChangePlaying(false)
  }
  handleStart = () => {
    const { time, parsedText } = this.props
    const score = utils.makeScore(parsedText, time)

    Transport.timeSignature = times[time]
    this.handleStop()
    this.setInstrumentSchedule(score)
    this.setClickSchedule(score)
    this.handleChangePlaying(true)
    Transport.start("+0.1")
  }

  render() {
    const { isPlaying, parsedText } = this.props
    const { loading } = this.state
    const cannotPlay = loading || isPlaying || (parsedText.length === 1 && !parsedText[0][0])
    return (
      <div className="field sound-control">
        <div className="control">
          {isPlaying ? (
            <Button
              onClick={this.handleStop}
              color="danger"
              size="medium"
              icon="stop"
              text="stop"
              disabled={!isPlaying}
            />
          ) : (
            <Button
              onClick={this.handleStart}
              color="info"
              size="medium"
              icon={loading ? "circle-o-notch fa-spin" : "play"}
              text={loading ? "loading..." : "play"}
              disabled={cannotPlay}
            />
          )}
        </div>
      </div>
    )
  }
}