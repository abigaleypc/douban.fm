import React from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import { userInfoAction } from '../store/actions'
import { MainColor, GrayColor } from '../Theme'

import RedHeart from './RedHeart'
import Trash from './Trash'
import PlayAndPause from './PlayAndPause'
import Next from './Next'
import VolumeSlider from './VolumeSlider'
import LyricBtn from './LyricBtn'
import Lyric from './Lyric'

import '../style/Home.less'

function mapStateToProps(state) {
  const { userInfo } = state.userInfoReducer;
  return { userInfo };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ userInfoAction }, dispatch)

}


class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      songInfo: '',
      isBegining: false,
      isPause: false,
      totalTime: 0,
      remainTime: 0,
      isLike: false,
      isOpenLyric: false
    };
    this.nextSong = this.nextSong.bind(this)
    this.initSong = this.initSong.bind(this)
    this.onPlay = this.onPlay.bind(this)
    this.onPause = this.onPause.bind(this)
    this.onTimeUpdate = this.onTimeUpdate.bind(this)
    this.like = this.like.bind(this)
    this.delete = this.delete.bind(this)
    this.toggleType = this.toggleType.bind(this);
  }

  initSong() {
    this.setState({
      totalTime: 0,
      remainTime: 0
    })

  }
  nextSong() {
    let self = this;
    this.initSong();

    fetch(`http://localhost:8083/nextSong?sid=${self.state.songInfo.sid}`)
      .then(res => res.json())
      .then(function (data) {
        if (data.song[0]) {
          self.setState({
            songInfo: data.song[0],
            totalTime: data.song[0].length,
            remainTime: data.song[0].length,
            second: 0,
            minute: 0,
          })
        }
      });
  }

  like() {
    this.setState({
      isLike: !this.state.isLike
    })
  }

  delete() {

  }

  onPlay(e) {
    let self = this;
    self.setState({
      isBegining: true
    })

  }
  onPause() {
    let self = this;
    self.setState({
      isPause: !self.state.isPause
    })
    if (self.state.isPause) {
      this._video.play();
    } else {
      this._video.pause();
    }
  }
  onTimeUpdate(data) {
    let _remainSecond = Math.floor(this.state.remainTime % 60) > 0 ? Math.floor(this.state.remainTime % 60) : 0,
      _remainMinute = Math.floor(this.state.remainTime / 60) > 0 ? Math.floor(this.state.remainTime / 60) : 0
    if (_remainMinute == 0 && _remainSecond == 0) {
      this.nextSong()
    } else {
      this.setState({
        remainTime: this.state.totalTime - data.target.currentTime,
        second: _remainSecond < 10 ? ('0' + _remainSecond) : _remainSecond,
        minute: _remainMinute
      })
    }
  }
  toggleType(type) {
    if (type == 'lyric') {
      this.setState({
        isOpenLyric: !this.state.isOpenLyric
      })

    } else if (type == 'share') {

    } else {

    }
  }
  componentWillMount() {
    let self = this;
    fetch('http://localhost:8082/playlist')
      .then(res => res.json())
      .then(function (data) {
        if (data.song[0]) {
          self.setState({
            songInfo: data.song[0],
            totalTime: data.song[0].length,
            remainTime: data.song[0].length,
            second: 0,
            minute: 0,
          })
        }
      });
  }
  render() {
    return (
      <section>
        <div className="warpper">
          <div className="left">
            <Lyric sid={this.state.songInfo.sid} ssid={this.state.songInfo.ssid} />
            {/* <img src={this.state.songInfo.picture} style={{ width: '100%' }} /> */}
          </div>

          <div className="middle">
            <div className="songType">豆瓣精选MHz</div>
            <div className="songTitle">{this.state.songInfo.title}</div>
            <div className="songAuthor">{this.state.songInfo.artist}</div>
            <div className="volumeAnLyricGroup">
              <div className="volumeAndTime">
                <span>-{this.state.minute}:{this.state.second}</span>
                <VolumeSlider setVolume={num => { this._video.volume = num }} />
                {this.props.isOpenLyric}
              </div>
              <LyricBtn toggleType={type => this.toggleType(type)} />
            </div>
            <div className="progress">
              <div style={{ position: 'absolute', width: '100%', height: '3px', background: MainColor, left: (-this.state.remainTime / this.state.totalTime * 100) + '%' }}></div>
            </div>

            <div className="btnGroup">
              <div className="supBtnGroup">
                <a onClick={this.like}><RedHeart isLike={this.state.isLike} /></a>
                <a onClick={this.delete}><Trash /></a>
              </div>
              <div className="supBtnGroup">
                <a onClick={this.onPause}><PlayAndPause isPause={this.state.isPause} /></a>
                <a onClick={this.nextSong}><Next /></a>
              </div>
            </div>
            <video src={this.state.songInfo.url} controls="controls" ref={r => this._video = r} autoPlay onPlay={this.onPlay} onTimeUpdate={this.onTimeUpdate}></video>
          </div>

          <div className="right">
            <img src={this.state.songInfo.picture} className="playingCover" />
          </div>
        </div>
      </section>
    )
  }
}


const connectHome = connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);

export default connectHome;
