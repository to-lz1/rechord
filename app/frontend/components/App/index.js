import React, { Component }          from "react"
import { EditorState, ContentState } from "draft-js"

import Score          from "../Score"
import Field          from "../shared/Field"
import scoreDecorator from "../../decorators/score-decorator"
import sampleScore    from "../../constants/sampleScore"
import { DEFAULT_BPM, DEFAULT_VOLUME, DEFAULT_TIME } from "../../constants"

export default class App extends Component {
  constructor() {
    super()
    const contentState = ContentState.createFromText(sampleScore)
    this.state = {
      inputText:      sampleScore,
      editorState:    EditorState.createWithContent(contentState, scoreDecorator),
      isPlaying:      false,
      beatClick:      false,
      bpm:            DEFAULT_BPM,
      volume:         DEFAULT_VOLUME,
      time:           DEFAULT_TIME,
      instrumentType: "Piano"
    }
  }
  handleSetState = (state) => this.setState(state)

  render() {
    const { inputText, editorState, time, bpm, volume, instrumentType, isPlaying, beatClick } = this.state
    return (
      <div>
        <Field label="Title">
          <input className="input" type="text" placeholder="title" style={{ width: "50%" }} />
        </Field>
        <Field label="Comment">
          <input className="input" type="text" placeholder="comment" />
        </Field>

        <Score
          inputText={inputText}
          editorState={editorState}
          instrumentType={instrumentType}
          time={time}
          bpm={bpm}
          volume={volume}
          beatClick={beatClick}
          isPlaying={isPlaying}
          handleSetState={this.handleSetState}
        />
      </div>
    )
  }
}
