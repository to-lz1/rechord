import * as scoreEditorDecorator from './scoreEditorDecorator'

test('parse multi-line chord progression', () => {
    expect(scoreEditorDecorator.parseChordProgression('Gm/CF69|Gm/C|\nAbGaug7|'))
    .toEqual(
        [
            [
                [["G", "m/C"], ["F", "69"]],
                [["G", "m/C"]]
            ],
            [
                [["Ab", ""], ["G", "aug7"]]
            ]
        ]
    )
})

test('parse head # as comment', () => {
    expect(scoreEditorDecorator.parseChordProgression('#Gm/CF69|Gm/C|\nAG#aug7|'))
    .toEqual(
        [
            [
                [["A", ""], ["G#", "aug7"]]
            ]
        ]
    )
})

test('parse head <> as marker', () => {
    expect(scoreEditorDecorator.parseChordProgression('<G#m7|Ab|B|\nAG#aug7|'))
    .toEqual(
        [
            [
                [["<", ""]]
            ],
            [
                [["A", ""], ["G#", "aug7"]]
            ]
        ]
    )
})
