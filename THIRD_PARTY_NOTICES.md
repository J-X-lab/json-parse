# Third-party notices

## Morph Bot / grokbot-animation
Source: https://github.com/iduu/grokbot-animation
Component version: 0.6.0
The embedded bundle includes this project's runtime. Local modifications increase gaze amplitude and add head tracking.

Upstream states: This is an independent, unofficial research and prototyping project, not affiliated with xAI.
The repository contains geometry and behavioral data derived from a publicly delivered frontend snapshot for study and interoperability experiments.
The upstream README grants no open-source license for third-party reference assets.
No additional license for those reference assets is granted by this repository.

The bundled component also contains the following dependencies; their notices and licenses are reproduced below.

## animalese-tts / NOTICE.md
# animalese-tts

This directory vendors the browser build and English voice Sprite from
[`izure1/animalese-tts`](https://github.com/izure1/animalese-tts), version 1.1.3.

- License: MIT (see `LICENSE`)
- Browser module: `dist/animalese.browser.mjs`
- Voice assets: `docs/sounds/english-sprite.wav` and `english-sprite.json`

Morph Bot adds its own Mandarin analyzer and voice profiles in
`component/runtime/chinese-animalese.js`. The bundled samples are not Nintendo
or Minions character audio, and the resulting voices are unofficial original
styles.


## animalese-tts / LICENSE
MIT License

Copyright (c) 2026 izure

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## pinyin-pro / NOTICE.md
# pinyin-pro

This directory vendors the ESM distribution of `pinyin-pro` 3.29.3 so the
Morph Bot component can analyze Mandarin locally without a CDN or runtime
dependency.

- Source: https://github.com/zh-lx/pinyin-pro
- Version: 3.29.3
- License: MIT; see `LICENSE` in this directory.


## pinyin-pro / LICENSE
MIT License

Copyright (c) 2022-present zh-lx

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
